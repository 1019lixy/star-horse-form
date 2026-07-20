/**
 * 规则引擎业务驱动 composable
 * 封装表单运行时的规则触发逻辑：
 * - ON_CHANGE: 字段变更触发
 * - ON_SUBMIT: 提交前校验
 * - ON_LOAD: 表单加载初始化
 * - ON_VALIDATE: 数据校验
 * - ON_BUTTON_CLICK: 按钮点击触发
 *
 * v2 新增：
 * - applyToCompList: 将 FieldAction 应用到 compList 的 preps（与 shplugin controlFieldProps 对齐）
 * - 受控字段追踪: 记录哪些字段受规则引擎控制，避免与已有联动冲突
 */
import { ruleEngineApi } from '@/api/rule_engine_api'
import { success, error, warning } from 'star-horse-lowcode'

/** 触发事件类型 */
export type TriggerEvent = 'ON_CHANGE' | 'ON_SUBMIT' | 'ON_LOAD' | 'ON_VALIDATE' | 'ON_BUTTON_CLICK'

/** 字段控制指令 */
export interface FieldAction {
  field: string
  visible?: boolean
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  value?: any
  /** 选项数据源 - 用于 select/cascade/checkbox 等选项类字段 */
  options?: any[]
}

/** 规则执行结果（精简版） */
export interface RuleExecutionOutcome {
  success: boolean
  message: string
  fieldActions: FieldAction[]
  rawContext: Record<string, any>
}

/** 受控字段追踪器 - 记录哪些字段属性由规则引擎控制 */
export interface ControlledFieldTracker {
  /** 被规则引擎控制的字段属性映射: fieldName -> Set<'visible'|'required'|'readonly'|'disabled'|'value'> */
  controlledProps: Map<string, Set<string>>
  /** 标记字段属性为受控 */
  markControlled: (fieldName: string, prop: string) => void
  /** 检查字段属性是否受控 */
  isControlled: (fieldName: string, prop: string) => boolean
  /** 清除所有受控记录 */
  clear: () => void
}

/**
 * 从后端返回的 context 中解析字段控制指令
 * context 中的特殊前缀字段：
 * - __visible_xxx: 字段显隐
 * - __required_xxx: 字段必填
 * - __readonly_xxx: 字段只读
 * - __disabled_xxx: 字段禁用
 * - __options_xxx: 字段选项数据源
 * - 直接的字段名: 字段赋值
 */
const parseFieldActions = (context: Record<string, any> = {}): FieldAction[] => {
  const actionMap = new Map<string, FieldAction>()
  const PREFIXES: Array<[string, keyof FieldAction]> = [
    ['__visible_', 'visible'],
    ['__required_', 'required'],
    ['__readonly_', 'readonly'],
    ['__disabled_', 'disabled'],
    ['__options_', 'options'],
  ]

  for (const [key, val] of Object.entries(context)) {
    let matched = false
    for (const [prefix, field] of PREFIXES) {
      if (key.startsWith(prefix)) {
        const fieldName = key.slice(prefix.length)
        if (!fieldName) break
        const action = actionMap.get(fieldName) || { field: fieldName }
        ;(action as any)[field] = val
        actionMap.set(fieldName, action)
        matched = true
        break
      }
    }
    if (!matched && !key.startsWith('__') && val !== undefined) {
      const action = actionMap.get(key) || { field: key }
      action.value = val
      actionMap.set(key, action)
    }
  }

  return Array.from(actionMap.values())
}

/**
 * 将字段控制指令应用到表单
 * @param actions 字段控制指令列表
 * @param formData 表单数据（响应式）
 * @param fieldStates 字段状态（响应式）：{ visible, required, readonly, disabled }
 */
const applyFieldActions = (
  actions: FieldAction[],
  formData: Record<string, any>,
  fieldStates?: Record<string, Record<string, boolean>>
) => {
  for (const action of actions) {
    if (action.value !== undefined) {
      formData[action.field] = action.value
    }
    if (fieldStates) {
      const state = fieldStates[action.field] || (fieldStates[action.field] = {})
      if (action.visible !== undefined) state.visible = action.visible
      if (action.required !== undefined) state.required = action.required
      if (action.readonly !== undefined) state.readonly = action.readonly
      if (action.disabled !== undefined) state.disabled = action.disabled
    }
  }
}

/**
 * 将字段控制指令直接应用到 compList 的字段 preps
 * 与 shplugin ItemRelationEventUtils.controlFieldProps 的控制逻辑对齐：
 *
 * 属性控制映射表（与 CONTROL_ACTION_MAP 一致）：
 * - formVisible: 直接设置在 field 上（非 preps），同 eqHide/eqVisible
 * - required: 直接设置在 field 上，同 eqRequired/eqUnRequired
 * - disabled: 设置在 field.preps 上，同 eqDisable/eqEditable
 * - readonly: 设置在 field.preps 上
 *
 * @param actions 字段控制指令列表
 * @param compList 组件列表（formInfo/fieldList）
 * @param formData 表单数据（响应式，用于字段赋值）
 * @param tracker 可选的受控字段追踪器
 */
const applyToCompList = (
  actions: FieldAction[],
  compList: any[],
  formData?: Record<string, any>,
  tracker?: ControlledFieldTracker
) => {
  for (const action of actions) {
    // 递归查找字段（与 shplugin findField 逻辑一致）
    const field = findFieldInCompList(compList, action.field)
    if (!field) continue

    if (action.visible !== undefined) {
      // 与 controlFieldProps 的 eqHide/eqVisible 一致：直接设置在 field 上
      field.formVisible = action.visible
      tracker?.markControlled(action.field, 'visible')
    }
    if (action.required !== undefined) {
      // 与 controlFieldProps 的 eqRequired 一致：直接设置在 field 上
      field.required = action.required
      tracker?.markControlled(action.field, 'required')
    }
    if (action.disabled !== undefined) {
      // 与 controlFieldProps 的 eqDisable 一致：设置在 field.preps 上
      field.preps.disabled = action.disabled
      tracker?.markControlled(action.field, 'disabled')
    }
    if (action.readonly !== undefined) {
      field.preps.readonly = action.readonly
      tracker?.markControlled(action.field, 'readonly')
    }
    // 选项数据源赋值 - 用于 select/cascade/checkbox 等选项类字段
    if (action.options !== undefined) {
      if (!field.preps) field.preps = {}
      field.preps.options = action.options
      tracker?.markControlled(action.field, 'options')
    }
    if (action.value !== undefined && formData) {
      // 与 shplugin fieldAssign 逻辑对齐
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
        formData[action.field] = action.value
      }
      tracker?.markControlled(action.field, 'value')
    }
  }
}

/**
 * 在 compList 中递归查找字段（与 shplugin ItemRelationEventUtils.findField 逻辑一致）
 */
const findFieldInCompList = (compList: any[], fieldName: string): any => {
  for (const field of compList) {
    if (field.fieldName === fieldName) {
      if (!field.preps) field.preps = {}
      return field
    }
    // 递归查找 children
    if (field.children && Array.isArray(field.children)) {
      const found = findFieldInCompList(field.children, fieldName)
      if (found) return found
    }
    // 查找列布局中的 items
    if (field.items && Array.isArray(field.items)) {
      for (const item of field.items) {
        if (item.fieldName === fieldName) {
          if (!item.preps) item.preps = {}
          return item
        }
        if (item.children) {
          const found = findFieldInCompList(item.children, fieldName)
          if (found) return found
        }
      }
    }
  }
  return null
}

/**
 * 创建受控字段追踪器
 * 用于追踪哪些字段属性由规则引擎控制，避免与已有联动冲突
 */
export const createControlledFieldTracker = (): ControlledFieldTracker => {
  const controlledProps = new Map<string, Set<string>>()
  return {
    controlledProps,
    markControlled(fieldName: string, prop: string) {
      if (!controlledProps.has(fieldName)) {
        controlledProps.set(fieldName, new Set())
      }
      controlledProps.get(fieldName)!.add(prop)
    },
    isControlled(fieldName: string, prop: string) {
      return controlledProps.get(fieldName)?.has(prop) ?? false
    },
    clear() {
      controlledProps.clear()
    },
  }
}

/**
 * 规则引擎业务驱动 composable
 *
 * 使用示例：
 * ```ts
 * const { triggerOnLoad, triggerOnChange, triggerOnSubmit, applyToCompList } = useRuleEngine()
 * const tracker = createControlledFieldTracker()
 *
 * // 表单加载时初始化
 * onMounted(async () => {
 *   const outcome = await triggerOnLoad(formId, formData, fieldStates)
 *   applyToCompList(outcome.fieldActions, compList, formData, tracker)
 * })
 *
 * // 字段变更时触发 - 推荐通过扩展 shplugin relationEventDispatcher 调用
 * // 而非新增 deep watch formData
 *
 * // 提交前校验
 * const handleSubmit = async () => {
 *   const ok = await triggerOnSubmit(formId, formData)
 *   if (ok) { /* 提交逻辑 *\/ }
 * }
 * ```
 */
export const useRuleEngine = () => {
  /**
   * 按表单触发规则集
   * @param formId 表单ID
   * @param triggerEvent 触发事件
   * @param formData 表单数据
   * @returns 规则执行结果
   */
  const executeByForm = async (
    formId: string,
    triggerEvent: TriggerEvent,
    formData: Record<string, any>
  ): Promise<RuleExecutionOutcome> => {
    try {
      const res = await ruleEngineApi.executeByForm(formId, triggerEvent, formData)
      const data = res.data?.data
      if (!data || !Array.isArray(data)) {
        return { success: true, message: '无规则执行', fieldActions: [], rawContext: {} }
      }
      // 合并所有规则集的 mergedContext
      const merged: Record<string, any> = {}
      let allSuccess = true
      let msg = ''
      for (const rs of data) {
        if (rs.mergedContext) Object.assign(merged, rs.mergedContext)
        if (!rs.success) {
          allSuccess = false
          msg = rs.message
        }
      }
      const fieldActions = parseFieldActions(merged)
      return {
        success: allSuccess,
        message: msg || '规则执行完成',
        fieldActions,
        rawContext: merged,
      }
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || '规则执行失败',
        fieldActions: [],
        rawContext: {},
      }
    }
  }

  /**
   * 字段变更触发（防抖）
   * @param formId 表单ID
   * @param formData 表单数据
   * @param fieldStates 字段状态
   * @param debounceMs 防抖毫秒
   * @returns 防抖触发函数
   */
  const triggerOnChange = (
    formId: string,
    formData: Record<string, any>,
    fieldStates?: Record<string, Record<string, boolean>>,
    debounceMs = 300
  ) => {
    let timer: ReturnType<typeof setTimeout> | null = null
    return async () => {
      if (timer) clearTimeout(timer)
      return new Promise<void>((resolve) => {
        timer = setTimeout(async () => {
          const outcome = await executeByForm(formId, 'ON_CHANGE', formData)
          if (outcome.success) {
            applyFieldActions(outcome.fieldActions, formData, fieldStates)
          } else {
            warning(outcome.message)
          }
          resolve()
        }, debounceMs)
      })
    }
  }

  /**
   * 表单加载初始化
   * @param formId 表单ID
   * @param formData 表单数据
   * @param fieldStates 字段状态
   */
  const triggerOnLoad = async (
    formId: string,
    formData: Record<string, any>,
    fieldStates?: Record<string, Record<string, boolean>>
  ): Promise<RuleExecutionOutcome> => {
    const outcome = await executeByForm(formId, 'ON_LOAD', formData)
    if (outcome.success) {
      applyFieldActions(outcome.fieldActions, formData, fieldStates)
    }
    return outcome
  }

  /**
   * 表单提交前校验
   * @param formId 表单ID
   * @param formData 表单数据
   * @returns 校验是否通过
   */
  const triggerOnSubmit = async (
    formId: string,
    formData: Record<string, any>
  ): Promise<boolean> => {
    const outcome = await executeByForm(formId, 'ON_SUBMIT', formData)
    if (!outcome.success) {
      error(outcome.message || '校验未通过')
      return false
    }
    // 检查是否有阻断性动作
    const hasBlock = outcome.fieldActions.some(a => a.value === false && a.field === '__block_submit')
    if (hasBlock) {
      error(outcome.message || '提交被规则阻断')
      return false
    }
    success('校验通过')
    return true
  }

  /**
   * 数据校验
   * @param formId 表单ID
   * @param formData 表单数据
   */
  const triggerOnValidate = async (
    formId: string,
    formData: Record<string, any>
  ): Promise<RuleExecutionOutcome> => {
    return executeByForm(formId, 'ON_VALIDATE', formData)
  }

  /**
   * 按钮点击触发规则引擎
   *
   * 适用场景：表单按钮的点击事件需要由规则引擎统一处理（如动态显隐/赋值/选项更新等）。
   *
   * 注意：此方法仅做规则引擎执行与应用，
   * 与 shplugin ItemRelationEventUtils.buttonAction 的自定义代码、actions、selfFunc 逻辑互不干扰。
   * 在 shplugin buttonAction 内部，仅当按钮配置 ruleEngineConfig.formId 且无自定义代码/actions 时才会调用此路径。
   *
   * @param formId 表单ID
   * @param formData 表单数据
   * @param buttonKey 触发按钮的 fieldName
   * @param evtName 按钮事件名（默认 click）
   */
  const triggerButtonClick = async (
    formId: string,
    formData: Record<string, any>,
    buttonKey?: string,
    evtName: string = 'click'
  ): Promise<RuleExecutionOutcome> => {
    // 注入按钮上下文，供后端规则匹配使用
    const payload = { ...formData }
    if (buttonKey) {
      payload.__buttonKey = buttonKey
      payload.__buttonEvent = evtName
    }
    return executeByForm(formId, 'ON_BUTTON_CLICK', payload)
  }

  /**
   * 执行单个规则
   * @param ruleId 规则ID
   * @param formData 表单数据
   */
  const executeRule = async (
    ruleId: string,
    formData: Record<string, any>
  ): Promise<RuleExecutionOutcome> => {
    try {
      const res = await ruleEngineApi.executeRule(ruleId, formData)
      const data = res.data?.data
      if (!data) {
        return { success: false, message: '规则执行无返回', fieldActions: [], rawContext: {} }
      }
      const fieldActions = parseFieldActions(data.outputContext || {})
      return {
        success: data.success,
        message: data.message || '',
        fieldActions,
        rawContext: data.outputContext || {},
      }
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || '规则执行失败',
        fieldActions: [],
        rawContext: {},
      }
    }
  }

  return {
    executeByForm,
    executeRule,
    triggerOnChange,
    triggerOnLoad,
    triggerOnSubmit,
    triggerOnValidate,
    triggerButtonClick,
    parseFieldActions,
    applyFieldActions,
    applyToCompList,
  }
}
