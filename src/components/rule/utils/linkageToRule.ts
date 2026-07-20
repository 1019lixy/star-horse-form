/**
 * 联动配置 → 规则流程图 转换器
 *
 * 将表单设计器中 LinkPolicyComp 已配置的联动策略自动转换为规则引擎流程图节点。
 *
 * 转换规则：
 * | 联动配置                                | 转换结果                                          |
 * |----------------------------------------|--------------------------------------------------|
 * | visibility(eqHide/eqVisible)           | condition(字段值比较) + action(HIDE_FIELD/SHOW_FIELD) |
 * | visibility(eqRequired/eqUnRequired)    | condition + action(SET_REQUIRED/SET_OPTIONAL)     |
 * | visibility(eqDisable/eqEditable)       | condition + action(SET_DISABLED/SET_ENABLED)      |
 * | visibility(assignValue)                | condition + action(SET_VALUE)                     |
 * | visibility(changeType)                 | condition + action(SET_VALUE)（简化为赋值）       |
 * | visibility(eqConditionDataLinkage/asParamDataLinkage) | http-call + variable-assign     |
 * | apiFill(apiLinkage)                    | http-call + variable-assign                       |
 * | custom(customCode)                     | script 节点                                       |
 * | 触发事件 change/input/blur/focus/enter  | 对应 ON_CHANGE / ON_LOAD（默认 ON_CHANGE）         |
 *
 * 输出结构对齐 RuleDesigner.vue 的 ruleData：
 * - ruleData.flowContent: { nodes: [], edges: [], variables: [] }
 * - ruleData.formId / ruleData.ruleType / ruleData.status
 */
import type { FormFieldMeta } from '../useFormRuleRuntime'

/** 联动配置输入：从 compList 中提取的每个字段的联动配置 */
export interface LinkageSourceItem {
  /** 字段名（触发字段） */
  fieldName: string
  /** 字段标签（用于规则命名） */
  label?: string
  /** 联动配置原始数据（来自 compItem.preps.dataRelation） */
  dataRelation: {
    /** 触发事件名：change/input/focus/blur/enter */
    actionName?: string
    /** 显隐/属性控制规则详情 */
    relationDetails?: Array<{
      controlCondition: string
      relationFields: string | string[]
      matchType?: string
      matchFieldValue?: any
      matchFieldName?: string
      staticDatas?: any
      params?: any
    }>
    /** API 联动配置 */
    apiLinkage?: {
      proxyUrl?: string
      url?: string
      method?: string
      queryParams?: any[]
      fieldMapping?: Array<{ source: string; target: string }>
      [k: string]: any
    }
    /** 自定义代码 */
    customCode?: string
  }
}

/** 转换结果：可直接赋值给 RuleDesigner 的 ruleData */
export interface ConvertedRuleData {
  /** 规则名 */
  ruleName: string
  /** 规则编码（自动生成） */
  ruleCode: string
  /** 规则类型 */
  ruleType: string
  /** 触发事件：ON_CHANGE / ON_LOAD */
  triggerEvent: 'ON_CHANGE' | 'ON_LOAD'
  /** 流程内容（节点+边+变量） */
  flowContent: {
    nodes: any[]
    edges: any[]
    variables: any[]
  }
  /** 转换来源统计（用于日志展示） */
  sourceStats: {
    visibilityCount: number
    apiFillCount: number
    customCount: number
    skipped: string[]
  }
}

let _nodeIdCounter = 0
const genNodeId = (type: string): string => {
  _nodeIdCounter++
  return `${type}_${Date.now()}_${_nodeIdCounter}`
}

/** actionName → ON_* 触发事件映射 */
const mapTriggerEvent = (actionName?: string): 'ON_CHANGE' | 'ON_LOAD' => {
  // load / init 类事件归为 ON_LOAD；其余（change/input/focus/blur/enter）归为 ON_CHANGE
  if (!actionName) return 'ON_CHANGE'
  const lower = String(actionName).toLowerCase()
  if (lower === 'load' || lower === 'init' || lower === 'mounted') return 'ON_LOAD'
  return 'ON_CHANGE'
}

/** controlCondition → actionType 映射 */
const CONTROL_TO_ACTION: Record<string, string> = {
  eqHide: 'HIDE_FIELD',
  eqVisible: 'SHOW_FIELD',
  eqRequired: 'SET_REQUIRED',
  eqUnRequired: 'SET_OPTIONAL',
  eqDisable: 'SET_DISABLED',
  eqEditable: 'SET_ENABLED',
  assignValue: 'SET_VALUE',
  changeType: 'SET_VALUE', // 简化：字段类型变更视为值变更
}

/** controlCondition → 描述文案（用于节点标签） */
const CONTROL_LABEL: Record<string, string> = {
  eqHide: '隐藏',
  eqVisible: '显示',
  eqRequired: '必填',
  eqUnRequired: '选填',
  eqDisable: '禁用',
  eqEditable: '可编辑',
  assignValue: '赋值',
  changeType: '改类型',
  eqConditionDataLinkage: '数据联动',
  asParamDataLinkage: '参数联动',
}

const ensureArray = (v: any): any[] => (Array.isArray(v) ? v : v ? [v] : [])

/**
 * 构建条件节点
 * - 单个 matchFieldValue 转为 EQ；数组转为 IN
 */
const buildConditionNode = (
  sourceField: string,
  matchType: string | undefined,
  matchFieldValue: any,
): any => {
  const values = ensureArray(matchFieldValue)
  const operator = values.length > 1 ? 'IN' : 'EQ'
  return {
    id: genNodeId('condition'),
    type: 'condition',
    position: { x: 0, y: 0 },
    data: {
      __nodeType: 'condition',
      logic: 'AND',
      conditions: [
        {
          fieldName: sourceField,
          operator,
          value: values.length > 1 ? values : values[0],
          _matchType: matchType || 'eq',
        },
      ],
    },
  }
}

/** 构建 action 节点 */
const buildActionNode = (actionType: string, targetFields: string[], actionValue?: any): any => {
  return {
    id: genNodeId('action'),
    type: 'action',
    position: { x: 0, y: 0 },
    data: {
      __nodeType: 'action',
      actions: targetFields.map((field) => ({
        actionType,
        targetField: field,
        actionValue,
      })),
    },
  }
}

/** 构建 http-call 节点（用于 apiFill / dataLinkage） */
const buildHttpCallNode = (apiLinkage: any, targetFields: string[]): any => {
  const url = apiLinkage?.proxyUrl || apiLinkage?.url || ''
  const method = (apiLinkage?.method || 'POST').toUpperCase()
  return {
    id: genNodeId('http-call'),
    type: 'generic',
    position: { x: 0, y: 0 },
    data: {
      __nodeType: 'ext-http-call',
      method,
      url,
      timeout: 5000,
      retryCount: 0,
      responseVar: `__api_resp_${targetFields.join('_')}`,
      _targetFields: targetFields,
      _fieldMapping: apiLinkage?.fieldMapping || [],
    },
  }
}

/** 构建 variable-assign 节点（解析 HTTP 响应并赋值到目标字段） */
const buildVariableAssignFromApi = (
  responseVar: string,
  targetFields: string[],
  fieldMapping: Array<{ source: string; target: string }> | undefined,
): any => {
  const assignments = (fieldMapping && fieldMapping.length > 0
    ? fieldMapping
    : targetFields.map((target) => ({ source: target, target }))
  ).map((m) => ({
    targetField: m.target,
    valueType: 'EXPRESSION',
    value: `${responseVar}.${m.source}`,
  }))
  return {
    id: genNodeId('variable-assign'),
    type: 'variable-assign',
    position: { x: 0, y: 0 },
    data: {
      __nodeType: 'variable-assign',
      assignments,
    },
  }
}

/** 构建 script 节点（用于 customCode） */
const buildScriptNode = (customCode: string): any => ({
  id: genNodeId('script'),
  type: 'generic',
  position: { x: 0, y: 0 },
  data: {
    __nodeType: 'script',
    scriptContent: customCode,
    description: '从联动策略自定义代码转换',
  },
})

/** 构建边 */
const buildEdge = (source: string, target: string, label?: string): any => ({
  id: `e_${source}_${target}`,
  source,
  target,
  type: 'smoothstep',
  label: label || '',
})

/**
 * 转换主函数
 *
 * @param sources 从表单 compList 中提取的联动配置列表
 * @param formFields 表单字段元数据（用于变量库自动派生）
 * @param formId 表单ID
 * @returns 转换后的规则数据
 */
export const convertLinkageToRule = (
  sources: LinkageSourceItem[],
  formFields: FormFieldMeta[] = [],
  formId?: string,
): ConvertedRuleData => {
  const nodes: any[] = []
  const edges: any[] = []
  const variables: any[] = []
  const skipped: string[] = []
  let visibilityCount = 0
  let apiFillCount = 0
  let customCount = 0

  // 收集触发事件（多个字段可能不同事件，取主流）
  let mainTrigger: 'ON_CHANGE' | 'ON_LOAD' = 'ON_CHANGE'

  // 起点节点
  const startNode = {
    id: genNodeId('start'),
    type: 'start',
    position: { x: 0, y: 0 },
    data: { __nodeType: 'start' },
  }
  nodes.push(startNode)

  let prevEnd = startNode.id

  for (const src of sources) {
    if (!src.fieldName || !src.dataRelation) {
      skipped.push(`${src.fieldName || '(unknown)'}: 缺少 fieldName/dataRelation`)
      continue
    }
    const trigger = mapTriggerEvent(src.dataRelation.actionName)
    if (trigger === 'ON_LOAD') mainTrigger = 'ON_LOAD'

    const relationDetails = src.dataRelation.relationDetails || []
    const apiLinkage = src.dataRelation.apiLinkage
    const customCode = src.dataRelation.customCode

    // 1) visibility 类型：遍历 relationDetails
    for (const detail of relationDetails) {
      const cc = detail.controlCondition
      if (!cc) {
        skipped.push(`${src.fieldName}: relationDetail 缺少 controlCondition`)
        continue
      }
      // 数据联动类型 → http-call + variable-assign
      if (cc === 'eqConditionDataLinkage' || cc === 'asParamDataLinkage') {
        const targets = ensureArray(detail.relationFields) as string[]
        if (targets.length === 0) continue
        const httpNode = buildHttpCallNode(
          { ...apiLinkage, params: detail.params, matchFieldName: detail.matchFieldName },
          targets,
        )
        nodes.push(httpNode)
        edges.push(buildEdge(prevEnd, httpNode.id))
        const respVar = httpNode.data.responseVar
        const assignNode = buildVariableAssignFromApi(respVar, targets, apiLinkage?.fieldMapping)
        nodes.push(assignNode)
        edges.push(buildEdge(httpNode.id, assignNode.id))
        prevEnd = assignNode.id
        apiFillCount++
        continue
      }

      const actionType = CONTROL_TO_ACTION[cc]
      if (!actionType) {
        skipped.push(`${src.fieldName}: 未识别的 controlCondition=${cc}`)
        continue
      }

      // 构建条件节点（基于源字段值匹配）
      const condNode = buildConditionNode(
        src.fieldName,
        detail.matchType,
        detail.matchFieldValue,
      )
      nodes.push(condNode)
      edges.push(buildEdge(prevEnd, condNode.id, trigger))

      // 构建动作节点
      const targetFields = ensureArray(detail.relationFields) as string[]
      if (targetFields.length === 0) {
        skipped.push(`${src.fieldName}: ${cc} 缺少 relationFields`)
        continue
      }
      const actionNode = buildActionNode(actionType, targetFields, detail.staticDatas)
      nodes.push(actionNode)
      edges.push(buildEdge(condNode.id, actionNode.id, CONTROL_LABEL[cc] || cc))
      prevEnd = actionNode.id
      visibilityCount++
    }

    // 2) apiFill 类型（独立于 relationDetails 的 apiLinkage）
    if (apiLinkage && (apiLinkage.proxyUrl || apiLinkage.url) && relationDetails.length === 0) {
      const targets = (apiLinkage.fieldMapping || []).map((m: any) => m.target).filter(Boolean)
      if (targets.length === 0) {
        skipped.push(`${src.fieldName}: apiLinkage 缺少 fieldMapping.target`)
      } else {
        const httpNode = buildHttpCallNode(apiLinkage, targets)
        nodes.push(httpNode)
        edges.push(buildEdge(prevEnd, httpNode.id))
        const assignNode = buildVariableAssignFromApi(
          httpNode.data.responseVar,
          targets,
          apiLinkage.fieldMapping,
        )
        nodes.push(assignNode)
        edges.push(buildEdge(httpNode.id, assignNode.id))
        prevEnd = assignNode.id
        apiFillCount++
      }
    }

    // 3) custom 类型
    if (customCode && typeof customCode === 'string' && customCode.trim()) {
      const scriptNode = buildScriptNode(customCode)
      nodes.push(scriptNode)
      edges.push(buildEdge(prevEnd, scriptNode.id, 'custom'))
      prevEnd = scriptNode.id
      customCount++
    }
  }

  // 终点节点
  const endNode = {
    id: genNodeId('end'),
    type: 'end',
    position: { x: 0, y: 0 },
    data: { __nodeType: 'end', endType: 'success' },
  }
  nodes.push(endNode)
  edges.push(buildEdge(prevEnd, endNode.id))

  // 派生变量库（从 formFields 中提取 INPUT 类型变量）
  for (const f of formFields) {
    if (f.fieldName) {
      variables.push({
        field: f.fieldName,
        label: f.label || f.fieldName,
        type: mapItemTypeToVarType(f.itemType || f.type),
        source: 'INPUT',
        desc: '',
      })
    }
  }

  return {
    ruleName: `联动策略转换_${new Date().toLocaleString()}`,
    ruleCode: `LINKAGE_${Date.now()}`,
    ruleType: 'FORM_LINKAGE',
    triggerEvent: mainTrigger,
    flowContent: { nodes, edges, variables },
    sourceStats: {
      visibilityCount,
      apiFillCount,
      customCount,
      skipped,
    },
  }
}

/** 表单字段类型 → 规则变量类型 */
const mapItemTypeToVarType = (
  itemType: string,
): 'STRING' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'ARRAY' => {
  const numTypes = ['number', 'rate', 'slider']
  const dateTypes = ['date', 'datetime', 'daterange', 'time']
  const boolTypes = ['switch']
  const arrTypes = ['checkbox', 'tselect', 'transfer', 'cascade']
  if (numTypes.includes(itemType)) return 'NUMBER'
  if (dateTypes.includes(itemType)) return 'DATE'
  if (boolTypes.includes(itemType)) return 'BOOLEAN'
  if (arrTypes.includes(itemType)) return 'ARRAY'
  return 'STRING'
}

/**
 * 从表单设计器的 compList 中提取联动配置
 *
 * 调用方示例：
 * ```ts
 * const sources = extractLinkageFromCompList(designForm.list)
 * const result = convertLinkageToRule(sources, fieldMetaList, formId)
 * ```
 */
export const extractLinkageFromCompList = (compList: any[]): LinkageSourceItem[] => {
  const result: LinkageSourceItem[] = []
  const traverse = (list: any[]) => {
    if (!Array.isArray(list)) return
    for (const comp of list) {
      if (!comp) continue
      const preps = comp.preps || {}
      const dr = preps.dataRelation
      if (dr && typeof dr === 'object') {
        // 仅当存在实际配置时收集
        const hasRelationDetails = Array.isArray(dr.relationDetails) && dr.relationDetails.length > 0
        const hasApiLinkage = dr.apiLinkage && Object.keys(dr.apiLinkage).length > 0
        const hasCustom = typeof dr.customCode === 'string' && dr.customCode.trim()
        if (hasRelationDetails || hasApiLinkage || hasCustom) {
          result.push({
            fieldName: comp.fieldName || preps.fieldName || preps.name || '',
            label: comp.label || preps.label || preps.itemNameLabel || '',
            dataRelation: dr,
          })
        }
      }
      // 递归 children / items
      if (comp.children) traverse(comp.children)
      if (preps.children) traverse(preps.children)
      if (comp.items) traverse(comp.items)
      if (preps.items) traverse(preps.items)
    }
  }
  traverse(compList)
  return result
}
