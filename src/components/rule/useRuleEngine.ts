/**
 * 规则引擎业务驱动 composable
 * 封装表单运行时的规则触发逻辑：
 * - ON_CHANGE: 字段变更触发
 * - ON_SUBMIT: 提交前校验
 * - ON_LOAD: 表单加载初始化
 * - ON_VALIDATE: 数据校验
 */
import { ruleEngineApi } from '@/api/rule_engine_api'
import { success, error, warning } from 'star-horse-lowcode'

/** 触发事件类型 */
export type TriggerEvent = 'ON_CHANGE' | 'ON_SUBMIT' | 'ON_LOAD' | 'ON_VALIDATE'

/** 字段控制指令 */
export interface FieldAction {
  field: string
  visible?: boolean
  required?: boolean
  readonly?: boolean
  disabled?: boolean
  value?: any
}

/** 规则执行结果（精简版） */
export interface RuleExecutionOutcome {
  success: boolean
  message: string
  fieldActions: FieldAction[]
  rawContext: Record<string, any>
}

/**
 * 从后端返回的 context 中解析字段控制指令
 * context 中的特殊前缀字段：
 * - __visible_xxx: 字段显隐
 * - __required_xxx: 字段必填
 * - __readonly_xxx: 字段只读
 * - __disabled_xxx: 字段禁用
 * - 直接的字段名: 字段赋值
 */
const parseFieldActions = (context: Record<string, any> = {}): FieldAction[] => {
  const actionMap = new Map<string, FieldAction>()
  const PREFIXES: Array<[string, keyof FieldAction]> = [
    ['__visible_', 'visible'],
    ['__required_', 'required'],
    ['__readonly_', 'readonly'],
    ['__disabled_', 'disabled'],
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
 * 规则引擎业务驱动 composable
 *
 * 使用示例：
 * ```ts
 * const { triggerOnLoad, triggerOnChange, triggerOnSubmit } = useRuleEngine()
 *
 * // 表单加载时初始化
 * onMounted(async () => {
 *   await triggerOnLoad(formId, formData, fieldStates)
 * })
 *
 * // 字段变更时触发（防抖）
 * const onFieldChange = triggerOnChange(formId, formData, fieldStates)
 * watch(() => formData.value, onFieldChange, { deep: true })
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
    parseFieldActions,
    applyFieldActions,
  }
}
