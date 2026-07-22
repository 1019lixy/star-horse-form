/**
 * 规则引擎 - 表单运行时桥接 Composable
 *
 * 核心设计原则：
 * 1. 融入已有事件流，不新增并行事件系统
 * 2. ON_LOAD → 复用 StarHorseForm 的 @dataLoaded 事件
 * 3. ON_CHANGE → 表单级 watch formData（debounced），由 FormPage.vue 调用 triggerOnChange
 *    - 规则引擎是表单级服务，在表单级监听，不是字段级逐个配置
 *    - 与 shplugin dataRelation（字段级轻量联动，同步）并行运行，互不干扰
 *    - 执行时序：字段变更 → dataRelation 同步 → 300ms 后规则引擎异步 → 覆盖前者
 * 4. ON_SUBMIT → 复用 StarHorseForm 的 merge/validate 流程
 * 5. applyActionsToFormFields → 与 shplugin 的 controlFieldProps 保持一致的字段属性控制
 *
 * 与 shplugin ItemRelationEventUtils.controlFieldProps 的映射关系：
 * - action.visible → field.formVisible (同 eqHide/eqVisible)
 * - action.required → field.required (同 eqRequired/eqUnRequired)
 * - action.disabled → field.preps.disabled (同 eqDisable/eqEditable)
 * - action.readonly → field.preps.readonly
 * - action.value   → field.defaultValue 或 formData[fieldName]
 */
import { computed, type Ref, ref, unref } from 'vue'
import { useRuleEngine, type FieldAction, type TriggerEvent } from './useRuleEngine'
import { analysisCompDatas, warning } from 'star-horse-lowcode'

/** 表单字段元数据（从 compList 提取） */
export interface FormFieldMeta {
  fieldName: string
  label: string
  itemType: string
  type: string
}

/** 规则验证结果 */
export interface RuleValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 验证消息 */
  message?: string;
}

/** 规则引擎运行时配置 */
export interface RuleRuntimeOptions {
  /** 表单ID，用于调用 executeByForm */
  formId: Ref<string> | string
  /** 表单字段列表（compList / formInfo） */
  formFields: Ref<any[]>
  /** 表单数据（响应式 formData） */
  formData: Ref<Record<string, any>>
  /** 是否启用规则引擎（默认 true） */
  enabled?: Ref<boolean> | boolean
}

/**
 * 在 formFields 中递归查找指定 fieldName 的字段
 * 与 shplugin ItemRelationEventUtils.findField 保持一致
 */
const findFieldByName = (formFields: any[], fieldName: string): any => {
  for (const field of formFields) {
    if (field.fieldName === fieldName) {
      if (!field.preps) field.preps = {}
      return field
    }
    // 递归查找 children（容器类组件）
    if (field.children && Array.isArray(field.children)) {
      const found = findFieldByName(field.children, fieldName)
      if (found) return found
    }
    // 查找列布局中的 items
    if (field.items && Array.isArray(field.items)) {
      for (const item of field.items) {
        if (item.fieldName === fieldName) {
          if (!item.preps) item.preps = {}
          return item
        }
        // items 中可能还有嵌套
        if (item.children) {
          const found = findFieldByName(item.children, fieldName)
          if (found) return found
        }
      }
    }
  }
  return null
}

/**
 * 将规则引擎的 FieldAction 应用到 formFields
 *
 * 与 shplugin ItemRelationEventUtils.controlFieldProps 的控制逻辑对齐：
 * - formVisible: 直接设置在 field 上（非 preps），与 eqHide/eqVisible 一致
 * - required: 直接设置在 field 上，与 eqRequired 一致
 * - disabled: 设置在 field.preps 上，与 eqDisable 一致
 * - readonly: 设置在 field.preps 上
 * - value: 根据字段类型选择设置位置（formData 或 preps.defaultValue）
 */
const applyActionsToFormFields = (
  actions: FieldAction[],
  formFields: any[],
  formData: Record<string, any>
) => {
  for (const action of actions) {
    const field = findFieldByName(formFields, action.field)
    if (!field) continue

    // 显隐控制 - 与 controlFieldProps 的 eqHide/eqVisible 对齐
    if (action.visible !== undefined) {
      field.formVisible = action.visible
    }

    // 必填控制 - 与 controlFieldProps 的 eqRequired/eqUnRequired 对齐
    if (action.required !== undefined) {
      field.required = action.required
    }

    // 禁用控制 - 与 controlFieldProps 的 eqDisable/eqEditable 对齐
    if (action.disabled !== undefined) {
      field.preps.disabled = action.disabled
    }

    // 只读控制
    if (action.readonly !== undefined) {
      field.preps.readonly = action.readonly
    }

    // 选项数据源赋值 - 用于 select/cascade/checkbox 等选项类字段
    // 与 shplugin applyRuleEngineActionsToFields 的 options 处理一致
    if (action.options !== undefined) {
      if (!field.preps) field.preps = {}
      field.preps.options = action.options
    }

    // 值赋值 - 根据字段类型决定赋值方式
    // 与 shplugin ItemRelationEventUtils.fieldAssign 逻辑对齐
    if (action.value !== undefined) {
      const valueRecord: Record<string, string[]> = {
        values: ['select', 'autocomplete', 'radio', 'checkbox'],
        data: ['tselect', 'transfer'],
        options: ['cascade'],
      }
      const itemType = field.itemType ?? field.type
      let matched = false

      for (const [key, types] of Object.entries(valueRecord)) {
        if (types.includes(itemType)) {
          field.preps[key] = action.value
          matched = true
          break
        }
      }

      if (!matched) {
        // 非选项类字段：直接设置 formData（响应式更新）
        if (formData && typeof formData === 'object') {
          formData[action.field] = action.value
        }
      }
    }
  }
}

/**
 * 从 compList 中提取字段元数据列表
 * 用于规则设计器中的字段选择下拉
 *
 * 实现说明（双轨制 + 互补）：
 * 1. 主路径：star-horse-lowcode 的 analysisCompDatas（与表单渲染侧一致）
 * 2. 补充路径：直接遍历原始 compList，捕获 analysisCompDatas 可能遗漏的字段
 *
 * analysisCompDatas 内部结构（zie/Aie/Eie/qie/Pie/Mie/$ie 函数）：
 * - 普通字段：Aie 返回 {fieldName: preps.name ?? e.fieldName, label, type: itemType, ...}
 * - box 容器：Eie 返回二维数组 [[fieldInfo|fieldInfo[], staticData, empty, ...], ...]，
 *   zie 中 o.push(...i) 扁平化一维 → fieldList 中**直接出现数组元素**
 * - dytable 容器：返回 {fieldName:"", dytableList:二维数组, preps}
 * - table 容器：返回 {batchFieldList:[{fieldList:[...]}], preps}
 * - tab/card/collapse/splitter：返回 {fieldName, tabList/cardList/...:[{fieldList}], preps}
 * - condition 容器：返回 {fieldName, children:[...], compType:"container", itemType:"condition"}
 *
 * 关键陷阱：
 * - 遍历 fieldList 时必须处理"元素本身是数组"的嵌套结构（box 二维数组扁平化结果）
 * - 原始 compList 项中，容器（compType=='container'）的 preps.name 不是字段名，必须跳过
 * - tab/card 等容器的 preps.elements 项含 items（不是 columns）
 */
export const extractFieldMetaList = (compList: any[]): FormFieldMeta[] => {
  if (!Array.isArray(compList) || compList.length === 0) return []

  const result: FormFieldMeta[] = []
  const seen = new Set<string>()

  /** 容器 itemType 清单（与 star-horse-lowcode qie 函数对齐） */
  const CONTAINER_ITEM_TYPES = new Set(['box', 'dytable', 'table', 'tab', 'card', 'collapse', 'splitter', 'condition'])

  /**
   * 添加字段到结果集
   * @param f 字段信息对象
   * @param isRawCompList true=原始 compList 项（需跳过容器），false=analysisCompDatas 产出的 fieldInfo
   */
  const addField = (f: any, isRawCompList = false) => {
    if (!f || typeof f !== 'object' || Array.isArray(f)) return
    // 原始 compList 项中，容器的 preps.name 是容器名不是字段名，必须跳过
    // analysisCompDatas 产出的 fieldInfo 不含 compType，无需此判断
    if (isRawCompList) {
      const ct = f.compType || f.preps?.compType
      const it = f.itemType || f.preps?.itemType
      if (ct === 'container' || CONTAINER_ITEM_TYPES.has(it)) {
        return
      }
    }
    // fieldName 优先级：fieldName > preps.name > name（兼容顶层项，排除容器名）
    const fieldName = f.fieldName
      || f.preps?.name
      || (typeof f.name === 'string' && f.name && !f.compType ? f.name : '')
    if (!fieldName) return
    if (seen.has(fieldName)) return
    seen.add(fieldName)
    result.push({
      fieldName,
      label: f.label || f.preps?.label || f.preps?.itemNameLabel || f.itemName || fieldName,
      itemType: f.type || f.itemType || f.preps?.itemType || 'input',
      type: f.type || f.itemType || f.preps?.itemType || 'input',
    })
  }

  /**
   * 递归展开 analysisCompDatas 产出的 fieldList 结构
   * 支持嵌套数组（box 容器二维结构）、各类容器列表、children 等
   */
  const traverseFieldInfos = (fields: any[]) => {
    if (!Array.isArray(fields)) return
    for (const f of fields) {
      // 关键：box 容器经 zie 扁平化后，fieldList 中会直接出现数组元素
      // 每个元素可能是一维数组（多个字段共享同一单元格列）或单个 fieldInfo
      if (Array.isArray(f)) {
        traverseFieldInfos(f)
        continue
      }
      if (!f || typeof f !== 'object') continue

      addField(f)

      // condition 容器的 children
      if (Array.isArray(f.children)) traverseFieldInfos(f.children)

      // tab/card/collapse/splitter 容器：每项含 fieldList
      const containerLists = [f.tabList, f.cardList, f.collapseList, f.splitterList]
      for (const list of containerLists) {
        if (Array.isArray(list)) {
          for (const container of list) {
            if (container && Array.isArray(container.fieldList)) {
              traverseFieldInfos(container.fieldList)
            }
          }
        }
      }

      // dytable 容器：dytableList 是二维数组（与 box 同结构）
      if (Array.isArray(f.dytableList)) traverseFieldInfos(f.dytableList)

      // table 容器：batchFieldList[].fieldList
      if (Array.isArray(f.batchFieldList)) {
        for (const batch of f.batchFieldList) {
          if (batch && Array.isArray(batch.fieldList)) {
            traverseFieldInfos(batch.fieldList)
          }
        }
      }

      // app 端字段（兼容）：appList
      if (Array.isArray(f.appList)) traverseFieldInfos(f.appList)
    }
  }

  /**
   * 超级稳健的回退/补充：直接遍历原始 compList
   * 处理所有可能的容器结构，与 star-horse-lowcode 内部结构对齐：
   *   - 顶层 children / items
   *   - preps.children / preps.items（condition 容器）
   *   - box/dytable：preps.elements[].columns[].items + preps.elements[].items
   *   - tab/card/collapse/splitter：preps.elements[].items（tab 项含 items 不含 columns）
   *     + preps.tabList/cardList/...[].items / .fieldList（兼容两种存储）
   *   - table：preps.batchFieldList[].fieldList
   *   - dytable：preps.dytableList（二维数组）
   */
  const traverseCompList = (fields: any[]) => {
    if (!Array.isArray(fields)) return
    for (const field of fields) {
      if (!field || typeof field !== 'object') continue
      // 尝试作为字段添加（内部会跳过容器）
      addField(field, true)

      // 顶层 children / items
      if (Array.isArray(field.children)) traverseCompList(field.children)
      if (Array.isArray(field.items)) traverseCompList(field.items)

      // preps.children / preps.items（condition 容器结构）
      if (Array.isArray(field.preps?.children)) traverseCompList(field.preps.children)
      if (Array.isArray(field.preps?.items)) traverseCompList(field.preps.items)

      // box/dytable/tab/card/collapse/splitter 容器：preps.elements
      // box/dytable 的 elements 项含 columns[].items
      // tab/card/collapse/splitter 的 elements 项含 items（直接是字段数组）
      const elements = field.preps?.elements
      if (Array.isArray(elements)) {
        for (const el of elements) {
          if (!el) continue
          if (Array.isArray(el.columns)) {
            for (const col of el.columns) {
              if (col && Array.isArray(col.items)) traverseCompList(col.items)
            }
          }
          if (Array.isArray(el.items)) traverseCompList(el.items)
        }
      }

      // 兼容：preps.tabList / cardList / collapseList / splitterList
      const containerKeys = ['tabList', 'cardList', 'collapseList', 'splitterList']
      for (const key of containerKeys) {
        const list = field.preps?.[key]
        if (Array.isArray(list)) {
          for (const container of list) {
            if (!container) continue
            if (Array.isArray(container.items)) traverseCompList(container.items)
            if (Array.isArray(container.fieldList)) traverseCompList(container.fieldList)
          }
        }
      }

      // table 容器：preps.batchFieldList
      if (Array.isArray(field.preps?.batchFieldList)) {
        for (const batch of field.preps.batchFieldList) {
          if (batch && Array.isArray(batch.fieldList)) {
            traverseCompList(batch.fieldList)
          }
        }
      }

      // dytable 容器：preps.dytableList（二维数组）
      if (Array.isArray(field.preps?.dytableList)) {
        traverseCompList(field.preps.dytableList)
      }
    }
  }

  // ===== 双轨制执行：先 analysisCompDatas，再用原始遍历补充 =====
  let analysisFieldCount = 0
  let analysisFieldListLen = 0
  try {
    const parsed = analysisCompDatas(compList)
    const fieldList = (parsed as any)?.fieldList
    analysisFieldListLen = Array.isArray(fieldList) ? fieldList.length : 0
    if (analysisFieldListLen > 0) {
      const beforeCount = result.length
      traverseFieldInfos(fieldList)
      analysisFieldCount = result.length - beforeCount
    }
  } catch (e) {
    console.warn('[extractFieldMetaList] analysisCompDatas failed:', e)
  }

  // 关键改进：无论 analysisCompDatas 是否成功，都用原始遍历补充
  // 这能捕获 analysisCompDatas 遗漏的字段（容器嵌套过深、fieldName 缺失等）
  const beforeFallback = result.length
  traverseCompList(compList)
  const fallbackAdded = result.length - beforeFallback

  // 无条件诊断日志：每次调用都打印，便于定位"选不到字段"问题
  // 若浏览器控制台看不到这行，说明 extractFieldMetaList 根本没被调用（RuleConfigPanel 未打开 / computed 未求值）
  console.log(
    '[extractFieldMetaList] compList.length=', compList.length,
    '| analysisCompDatas.fieldList.length=', analysisFieldListLen,
    '| analysisFieldCount=', analysisFieldCount,
    '| fallbackAdded=', fallbackAdded,
    '| result.length=', result.length,
    '| firstField=', result[0] ? `${result[0].fieldName}(${result[0].label})` : 'NONE',
    '| firstCompItem=', compList[0] ? `${compList[0].compType}/${compList[0].itemType}/preps.name=${compList[0].preps?.name}` : 'empty',
  )

  return result
}

/**
 * 规则引擎 - 表单运行时桥接 Composable
 *
 * 使用示例：
 * ```ts
 * // 在 FormPage.vue 中
 * const { triggerOnLoad, triggerOnSubmit, applyRuleActions, loading } = useFormRuleRuntime({
 *   formId: computed(() => props.compList?.[0]?.formId ?? ''),
 *   formFields: tableFieldList,
 *   formData: computed(() => formPageRef.value?.getFormData()?.value ?? {}),
 * })
 *
 * // ON_LOAD: 在 StarHorseForm 的 @dataLoaded 事件中调用
 * const onFormLoad = async () => {
 *   await triggerOnLoad()
 * }
 *
 * // ON_SUBMIT: 在 merge 前调用
 * const handleMerge = async (type: string) => {
 *   const ok = await triggerOnSubmit()
 *   if (!ok) return
 *   formPageRef.value?.merge(type)
 * }
 * ```
 */
export const useFormRuleRuntime = (options: RuleRuntimeOptions) => {
  const {
    formId,
    formFields,
    formData,
    enabled = true,
  } = options

  const { executeByForm } = useRuleEngine()
  const loading = ref(false)

  // 获取当前 formId
  const currentFormId = computed(() => unref(formId))
  const isEnabled = computed(() => unref(enabled))

  /**
   * 从 formFields 中提取扁平化的 formData
   * 用于传递给后端规则引擎
   */
  const extractFormData = (): Record<string, any> => {
    const data = unref(formData)
    return data && typeof data === 'object' ? { ...data } : {}
  }

  /**
   * 执行规则引擎并应用结果到 formFields
   * @param triggerEvent 触发事件类型
   * @returns 规则执行结果
   */
  const executeAndApply = async (
    triggerEvent: TriggerEvent
  ): Promise<{ success: boolean; fieldActions: FieldAction[] }> => {
    const fid = currentFormId.value
    if (!fid || !isEnabled.value) {
      return { success: true, fieldActions: [] }
    }

    loading.value = true
    try {
      const data = extractFormData()
      const outcome = await executeByForm(fid, triggerEvent, data)

      if (outcome.success && outcome.fieldActions.length > 0) {
        // 应用结果到 formFields（与 shplugin controlFieldProps 机制对齐）
        applyActionsToFormFields(outcome.fieldActions, unref(formFields), unref(formData))
      }

      if (!outcome.success && triggerEvent !== 'ON_CHANGE') {
        // ON_CHANGE 不弹警告（防抖场景下频繁提示会干扰用户）
        warning(outcome.message)
      }

      return { success: outcome.success, fieldActions: outcome.fieldActions }
    } catch (e: any) {
      console.error('[useFormRuleRuntime] executeAndApply error:', e)
      return { success: false, fieldActions: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * ON_LOAD: 表单加载时触发
   * 应在 StarHorseForm 的 @dataLoaded 事件中调用
   */
  const triggerOnLoad = async (): Promise<boolean> => {
    const result = await executeAndApply('ON_LOAD')
    return result.success
  }

  /**
 * ON_CHANGE: 字段变更时触发
 *
 * 设计说明：
 * - 防抖由调用方（FormPage.vue）的 watch 处理，此处直接执行
 * - 这样调用方可以自由控制防抖策略（时长、触发条件等），Composable 保持纯粹
 * - 规则引擎切入点：表单级 watch formData（不是字段级 dataRelation）
 * - 与 shplugin dataRelation 并行：dataRelation 同步执行，规则引擎异步执行
 * - 规则引擎结果覆盖 dataRelation（业务规则优先级更高）
 *
 * @returns 规则执行结果（含 fieldActions，便于链式处理）
 */
  const triggerOnChange = async (): Promise<{ success: boolean; fieldActions: FieldAction[] }> => {
    if (!currentFormId.value || !isEnabled.value) {
      return { success: true, fieldActions: [] }
    }
    return executeAndApply('ON_CHANGE')
  }

  /**
   * ON_SUBMIT: 提交前校验
   * 应在 StarHorseForm 的 merge() 之前调用
   * @returns true 表示校验通过可以提交，false 表示校验未通过
   */
  const triggerOnSubmit = async (): Promise<boolean> => {
    const result = await executeAndApply('ON_SUBMIT')
    return result.success
  }

  /**
   * ON_VALIDATE: 数据校验
   */
  const triggerOnValidate = async () => {
    return executeAndApply('ON_VALIDATE')
  }

  /**
   * ON_BUTTON_CLICK: 按钮点击触发
   *
   * 与 shplugin buttonRuleEngineDispatcher 配合使用：
   * - 表单内按钮在 buttonAction 中检测到 ruleEngineConfig.formId 时，
   *   可通过此方法走统一的运行时桥接（携带 formFields 上下文应用结果）。
   * - 也可在页面级直接调用此方法主动触发按钮规则。
   *
   * @param buttonKey 触发按钮的 fieldName
   * @param evtName 按钮事件名（默认 click）
   */
  const triggerButtonClick = async (
    buttonKey?: string,
    evtName: string = 'click'
  ): Promise<{ success: boolean; fieldActions: FieldAction[] }> => {
    const fid = currentFormId.value
    if (!fid || !isEnabled.value) {
      return { success: true, fieldActions: [] }
    }
    loading.value = true
    try {
      const data = extractFormData()
      if (buttonKey) {
        data.__buttonKey = buttonKey
        data.__buttonEvent = evtName
      }
      const outcome = await executeByForm(fid, 'ON_BUTTON_CLICK', data)
      if (outcome.success && outcome.fieldActions.length > 0) {
        applyActionsToFormFields(outcome.fieldActions, unref(formFields), unref(formData))
      }
      if (!outcome.success) {
        warning(outcome.message)
      }
      return { success: outcome.success, fieldActions: outcome.fieldActions }
    } catch (e: any) {
      console.error('[useFormRuleRuntime] triggerButtonClick error:', e)
      return { success: false, fieldActions: [] }
    } finally {
      loading.value = false
    }
  }

  /**
   * 手动应用规则引擎动作到 formFields
   * 供 shplugin ItemRelationEventUtils 中的 ruleEngine 调度类型调用
   */
  const applyRuleActions = (actions: FieldAction[]) => {
    applyActionsToFormFields(actions, unref(formFields), unref(formData))
  }

  /**
   * 获取当前表单的字段元数据列表
   * 供规则设计器使用
   */
  const fieldMetaList = computed(() => extractFieldMetaList(unref(formFields)))

  return {
    loading,
    triggerOnLoad,
    triggerOnChange,
    triggerOnSubmit,
    triggerOnValidate,
    triggerButtonClick,
    applyRuleActions,
    extractFormData,
    extractFieldMetaList,
    fieldMetaList,
    currentFormId,
    isEnabled,
  }
}

/**
 * 验证规则 - 用于表单提交前的字段级验证
 * @param rules 规则列表
 * @param formData 表单数据
 * @returns 验证结果列表，包含每个验证规则的结果
 */
export function validateRule(
  rules: any[],
  formData: Record<string, any>
): RuleValidationResult[] {
  const results: RuleValidationResult[] = [];
  
  // 过滤出验证规则
  const validateRules = rules.filter(rule => 
    rule.conditions && rule.conditions.some((condition: any) => condition.type === 'ON_VALIDATE')
  );
  
  for (const rule of validateRules) {
    for (const condition of rule.conditions) {
      if (condition.type !== 'ON_VALIDATE') continue;
      
      // 检查条件是否满足
      let conditionMet = false;
      try {
        conditionMet = new Function('formData', `with(formData){return ${condition.expression}}`)(formData);
      } catch (e) {
        console.warn(`[RuleValidator] 条件表达式执行失败: ${condition.expression}`, e);
        continue;
      }
      
      if (conditionMet) {
        // 执行验证动作
        for (const action of rule.actions) {
          let valid = true;
          let message = '';
          
          switch (action.type) {
            case 'required': {
              const value = formData[action.field];
              if (action.value === true || action.value === 'true') {
                if (value === undefined || value === null || value === '' || 
                    (Array.isArray(value) && value.length === 0)) {
                  valid = false;
                  message = `${action.field}为必填项`;
                }
              }
              break;
            }
            case 'readonly': {
              const readonlyValue = formData[action.field];
              if (action.value === true || action.value === 'true') {
                if (readonlyValue === undefined || readonlyValue === null || readonlyValue === '') {
                  valid = false;
                  message = `${action.field}为只读且不能为空`;
                }
              }
              break;
            }
            case 'value': {
              const fieldValue = formData[action.field];
              if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                valid = false;
                message = `${action.field}的值不能为空`;
              }
              break;
            }
            default:
              break;
          }
          
          if (!valid) {
            results.push({
              valid: false,
              message: action.message || message
            });
          }
        }
      }
    }
  }
  
  // 如果没有验证失败，返回成功
  if (results.length === 0) {
    results.push({ valid: true });
  }
  
  return results;
}
