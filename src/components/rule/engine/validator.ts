/**
 * 规则引擎实时校验器
 * 对标阿里/淘宝规则引擎：节点配置完整性 + 连线合法性 + 图结构合法性 + 字段引用有效性
 * 输出按节点聚合的问题列表，供画布红角标与汇总面板消费
 */
import { i18n } from '@/lang'
import { NODE_TYPE_MAP } from '../nodeTypes'

export type IssueLevel = 'error' | 'warning'

export interface ValidationIssue {
  nodeId: string
  nodeName: string
  nodeType: string
  level: IssueLevel
  code: string
  message: string
}

export interface ValidationResult {
  issues: ValidationIssue[]
  errorCount: number
  warningCount: number
  /** nodeId -> issues[] */
  nodeMap: Map<string, ValidationIssue[]>
}

export interface ValidationOptions {
  /**
   * 当前表单的字段名集合，用于校验规则中的字段引用是否仍存在
   * 不传则跳过僵尸属性校验
   */
  formFieldNames?: string[]
  /**
   * 当前规则的变量名集合（ruleData.variables 的 field 列表）
   * 变量也是合法的字段引用目标，与表单字段并集校验
   */
  variableNames?: string[]
  /**
   * 规则绑定的表单ID（formId）
   * 不为空时，校验规则至少引用了表单字段或变量，否则规则没有业务意义
   */
  boundFormId?: string
}

const nonEmpty = (v: any): boolean => {
  if (v == null) return false
  if (typeof v === 'string') return v.trim().length > 0
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return true
}

const nodeName = (n: any): string => {
  if (n.data?.name) return n.data.name
  if (n.data?.label) return n.data.label
  if (n.data?.tableName) return n.data.tableName
  if (n.data?.title) return n.data.title
  const def = NODE_TYPE_MAP[n.type]
  return def ? i18n(def.label) : n.type
}

/**
 * 主校验入口
 * @param nodes VueFlow nodes
 * @param edges VueFlow edges
 * @param options 可选校验选项（formFieldNames 用于僵尸属性校验）
 */
export const validateRuleFlow = (
  nodes: any[],
  edges: any[],
  options?: ValidationOptions,
): ValidationResult => {
  const issues: ValidationIssue[] = []
  const push = (nodeId: string, nodeType: string, level: IssueLevel, code: string, message: string) => {
    const node = nodes.find(n => n.id === nodeId)
    issues.push({ nodeId, nodeType, nodeName: node ? nodeName(node) : nodeId, level, code, message })
  }

  // 合法的字段引用集合 = 表单字段 ∪ 规则变量
  // 企业级规则引擎中，条件/动作/赋值的字段引用可来自表单字段或规则变量库
  const formFieldSet = options?.formFieldNames?.length
    ? new Set(options.formFieldNames)
    : null
  const variableSet = options?.variableNames?.length
    ? new Set(options.variableNames)
    : null
  // 合法字段集合：表单字段 + 变量（任一来源匹配即视为合法）
  const validFieldSet = new Set<string>()
  if (formFieldSet) for (const f of formFieldSet) validFieldSet.add(f)
  if (variableSet) for (const v of variableSet) validFieldSet.add(v)

  // 业务级校验：追踪规则是否引用了表单字段/变量
  // 如果绑定了表单但没有引用任何字段，规则没有业务意义
  let formFieldReferenced = false
  const boundFormId = options?.boundFormId

  /**
   * 标记字段引用已命中（表单字段或变量），用于业务级校验
   */
  const markFieldReferenced = (fieldRef: string) => {
    if (!fieldRef || typeof fieldRef !== 'string') return
    if (isLiteralValue(fieldRef)) return
    if (validFieldSet.has(fieldRef)) {
      formFieldReferenced = true
    }
  }

  /**
   * 判断字段引用是否为"字面量值"（非字段名引用），字面量值无需校验是否存在
   * - 数字字面量：123、3.14、-5
   * - 布尔字面量：true、false（不区分大小写）
   * - 带引号字符串字面量："hello"、'world'
   * - 表达式占位符：${...}
   * - 公式格式：=...
   */
  const isLiteralValue = (v: string): boolean => {
    const s = v.trim()
    if (!s) return false
    // 表达式占位符 ${...}
    if (s.startsWith('${')) return true
    // 公式 =...
    if (s.startsWith('=')) return true
    // 数字字面量（含负数、小数）
    if (/^-?\d+(\.\d+)?$/.test(s)) return true
    // 布尔字面量
    if (/^(true|false)$/i.test(s)) return true
    // 带引号字符串字面量
    if (/^(["']).*\1$/.test(s)) return true
    return false
  }

  /**
   * 检查字段引用是否合法
   * - validFieldSet 为空时跳过（兼容旧调用，无表单字段与变量上下文）
   * - 字面量值/表达式占位符/公式格式跳过（非字段引用）
   * - 命中表单字段或变量集合即视为合法
   * - 否则报"僵尸属性"错误
   */
  const checkFieldRef = (nodeId: string, nodeType: string, fieldRef: string, labelHint: string) => {
    if (!validFieldSet.size) return
    if (!fieldRef || typeof fieldRef !== 'string') return
    // 字面量值/表达式/公式 跳过
    if (isLiteralValue(fieldRef)) return
    if (!validFieldSet.has(fieldRef)) {
      push(nodeId, nodeType, 'error', 'ZOMBIE_FIELD',
        i18n('rule.val.zombieField', [fieldRef, labelHint]))
    }
  }

  // ===== 图结构级别校验 =====
  const startNodes = nodes.filter(n => n.type === 'start')
  const endNodes = nodes.filter(n => n.type === 'end')
  if (startNodes.length === 0) {
    push('', 'graph', 'error', 'NO_START', i18n('rule.val.noStart'))
  } else if (startNodes.length > 1) {
    push('', 'graph', 'error', 'MULTI_START', i18n('rule.val.multiStart'))
  }
  if (endNodes.length === 0) {
    push('', 'graph', 'error', 'NO_END', i18n('rule.val.noEnd'))
  }

  // 索引连线
  const inEdges = new Map<string, any[]>()
  const outEdges = new Map<string, any[]>()
  for (const e of edges) {
    if (!inEdges.has(e.target)) inEdges.set(e.target, [])
    inEdges.get(e.target)!.push(e)
    if (!outEdges.has(e.source)) outEdges.set(e.source, [])
    outEdges.get(e.source)!.push(e)
  }

  // ===== 节点级校验 =====
  for (const node of nodes) {
    const id = node.id
    const type = node.type
    const data = node.data || {}
    const outs = outEdges.get(id) || []
    const ins = inEdges.get(id) || []

    // 通用：孤立节点（除 start/end）
    if (type !== 'start' && type !== 'end' && ins.length === 0 && outs.length === 0) {
      push(id, type, 'warning', 'ORPHAN', i18n('rule.val.orphan'))
    }

    switch (type) {
      case 'start': {
        if (ins.length > 0) push(id, type, 'warning', 'START_HAS_IN', i18n('rule.val.startHasIn'))
        if (outs.length === 0) push(id, type, 'error', 'START_NO_OUT', i18n('rule.val.startNoOut'))
        break
      }
      case 'end': {
        if (ins.length === 0) push(id, type, 'error', 'END_NO_IN', i18n('rule.val.endNoIn'))
        if (outs.length > 0) push(id, type, 'warning', 'END_HAS_OUT', i18n('rule.val.endHasOut'))
        break
      }
      case 'condition': {
        const conds = data.conditions || []
        if (conds.length === 0) {
          push(id, type, 'error', 'COND_EMPTY', i18n('rule.val.condEmpty'))
        } else {
          conds.forEach((c: any, idx: number) => {
            if (!nonEmpty(c.fieldName) || !nonEmpty(c.operator)) {
              push(id, type, 'error', 'COND_INCOMPLETE', i18n('rule.val.condIncomplete', [idx + 1]))
            }
            // 僵尸属性校验：condition 中的 fieldName 必须存在于表单中
            if (nonEmpty(c.fieldName)) {
              checkFieldRef(id, type, c.fieldName, i18n('rule.lbl.conditionList') + '#' + (idx + 1))
              markFieldReferenced(c.fieldName)
            }
          })
        }
        // 条件节点应有 2 条出边（满足/不满足），至少 1 条
        if (outs.length === 0) push(id, type, 'error', 'COND_NO_OUT', i18n('rule.val.condNoOut'))
        else if (outs.length < 2) push(id, type, 'warning', 'COND_ONE_OUT', i18n('rule.val.condOneOut'))
        break
      }
      case 'action': {
        const acts = data.actions || []
        if (acts.length === 0) push(id, type, 'error', 'ACTION_EMPTY', i18n('rule.val.actionEmpty'))
        else {
          acts.forEach((a: any, idx: number) => {
            if (!nonEmpty(a.actionType)) {
              push(id, type, 'error', 'ACTION_INCOMPLETE', i18n('rule.val.actionIncomplete', [idx + 1]))
            }
            // SHOW_MESSAGE 只是显示消息，不需要 targetField
            // 其他动作类型（SHOW_FIELD/HIDE_FIELD/SET_VALUE 等）必须指定 targetField
            if (a.actionType !== 'SHOW_MESSAGE' && !nonEmpty(a.targetField)) {
              push(id, type, 'error', 'ACTION_INCOMPLETE', i18n('rule.val.actionIncomplete', [idx + 1]))
            }
            // 僵尸属性校验：action 中的 targetField 必须存在于表单字段或变量库
            // SHOW_MESSAGE 无目标字段，跳过
            if (a.actionType !== 'SHOW_MESSAGE' && nonEmpty(a.targetField)) {
              checkFieldRef(id, type, a.targetField, i18n('rule.lbl.actionList') + '#' + (idx + 1))
              markFieldReferenced(a.targetField)
            }
          })
        }
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'variable-assign': {
        const list = data.assignments || []
        if (list.length === 0) push(id, type, 'error', 'ASSIGN_EMPTY', i18n('rule.val.assignEmpty'))
        else {
          list.forEach((a: any, idx: number) => {
            if (!nonEmpty(a.variableName) && !nonEmpty(a.targetField)) {
              push(id, type, 'error', 'ASSIGN_INCOMPLETE', i18n('rule.val.assignIncomplete', [idx + 1]))
            }
            // 僵尸属性校验：assignment 中的 targetField 必须存在于表单中
            if (nonEmpty(a.targetField)) {
              checkFieldRef(id, type, a.targetField, i18n('rule.lbl.assignList') + '#' + (idx + 1))
              markFieldReferenced(a.targetField)
            }
          })
        }
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'exclusive-gateway':
      case 'inclusive-gateway': {
        const branches = data.branches || []
        if (branches.length < 2) {
          push(id, type, 'error', 'GW_FEW_BRANCH', i18n('rule.val.gwFewBranch'))
        } else {
          // 分支目标节点的两种表达方式（任一即可）：
          // 1. branch.targetNodeId 显式存储（数据驱动模式）
          // 2. 通过 edges 出边表达（可视化连线模式，企业级规则引擎主流方式）
          // 校验逻辑：分支数 <= 出边数 即视为每个分支已绑定目标
          branches.forEach((b: any, idx: number) => {
            if (!nonEmpty(b.label) || !nonEmpty(b.condition)) {
              push(id, type, 'error', 'GW_BRANCH_INCOMPLETE', i18n('rule.val.gwBranchIncomplete', [idx + 1]))
            }
            // 仅在既无 targetNodeId 又无对应出边时才报错
            // 出边数 >= 分支数 即视为所有分支已通过连线绑定目标
            if (!nonEmpty(b.targetNodeId) && outs.length < branches.length) {
              push(id, type, 'error', 'GW_BRANCH_NO_TARGET', i18n('rule.val.gwBranchNoTarget', [idx + 1]))
            }
          })
        }
        if (outs.length === 0) push(id, type, 'error', 'GW_NO_OUT', i18n('rule.val.gwNoOut'))
        else if (outs.length < 2) push(id, type, 'warning', 'GW_ONE_OUT', i18n('rule.val.gwOneOut'))
        break
      }
      case 'parallel-gateway': {
        if (ins.length >= 2 && outs.length === 1) {
          // 合流模式：合法
        } else if (outs.length < 2) {
          push(id, type, 'error', 'PARALLEL_FEW_OUT', i18n('rule.val.parallelFewOut'))
        }
        break
      }
      case 'join': {
        if (ins.length < 2) push(id, type, 'error', 'JOIN_FEW_IN', i18n('rule.val.joinFewIn'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'script': {
        if (!nonEmpty(data.scriptContent)) push(id, type, 'error', 'SCRIPT_EMPTY', i18n('rule.val.scriptEmpty'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'http-call': {
        if (!nonEmpty(data.url)) push(id, type, 'error', 'HTTP_NO_URL', i18n('rule.val.httpNoUrl'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      default: {
        // 通用：基于 paramSchema 的 required 字段校验 + fieldSelect 字段引用校验
        const def = NODE_TYPE_MAP[type]
        if (def) {
          def.paramSchema.forEach(f => {
            const labelText = typeof f.label === 'function'
              ? (f.label as Function)()
              : i18n(f.label as string)
            if (f.required && !nonEmpty(data[f.name])) {
              push(id, type, 'error', 'REQUIRED_' + f.name.toUpperCase(),
                i18n('rule.val.requiredMissing', [labelText]))
            }
            // 僵尸属性校验：fieldSelect 标记的参数值必须是表单中存在的字段
            if (f.fieldSelect && nonEmpty(data[f.name])) {
              checkFieldRef(id, type, data[f.name], labelText)
            }
            // 表格类型：遍历行，对 fieldSelect 列做僵尸属性校验
            if (f.type === 'table' && Array.isArray(f.columns) && Array.isArray(data[f.name])) {
              const fieldSelectCols = f.columns.filter(c => c.fieldSelect)
              if (fieldSelectCols.length > 0) {
                data[f.name].forEach((row: any, rowIdx: number) => {
                  if (!row || typeof row !== 'object') return
                  for (const col of fieldSelectCols) {
                    const colLabel = typeof col.label === 'function'
                      ? (col.label as Function)()
                      : i18n(col.label as string)
                    checkFieldRef(id, type, row[col.prop],
                      labelText + '#' + (rowIdx + 1) + '.' + colLabel)
                  }
                })
              }
            }
          })
        }
        // 非终止节点应有出边（end 节点除外）
        if (type !== 'end' && outs.length === 0 && ins.length > 0) {
          push(id, type, 'warning', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        }
        break
      }
    }
  }

  // ===== 连线合法性 =====
  // 自环
  for (const e of edges) {
    if (e.source === e.target) {
      const node = nodes.find(n => n.id === e.source)
      push(e.source, node?.type || 'edge', 'error', 'EDGE_SELF_LOOP', i18n('rule.val.edgeSelfLoop'))
    }
  }
  // 悬空边（端点不存在）
  const nodeIdSet = new Set(nodes.map(n => n.id))
  for (const e of edges) {
    if (!nodeIdSet.has(e.source) || !nodeIdSet.has(e.target)) {
      push('', 'edge', 'error', 'EDGE_DANGLING', i18n('rule.val.edgeDangling'))
    }
  }

  // ===== 业务级校验 =====
  // 1. 如果绑定了表单（boundFormId 有值），但规则中没有任何表单字段或变量被引用 → 规则没有业务意义
  if (boundFormId && !formFieldReferenced) {
    push('', 'graph', 'error', 'NO_FORM_FIELD_REF',
      i18n('rule.val.noFormFieldReferenced', [boundFormId]))
  }

  // 2. 如果规则中只有 start/end 节点，没有任何业务节点 → 规则流程无意义
  const businessNodeTypes = new Set(['condition', 'action', 'variable-assign',
    'exclusive-gateway', 'inclusive-gateway', 'parallel-gateway',
    'script', 'http-call', 'join', 'generic'])
  const hasBusinessNode = nodes.some(n => businessNodeTypes.has(n.type))
  if (!hasBusinessNode) {
    push('', 'graph', 'warning', 'NO_BUSINESS_NODE', i18n('rule.val.noBusinessNode'))
  }

  // ===== 聚合 =====
  const nodeMap = new Map<string, ValidationIssue[]>()
  for (const iss of issues) {
    if (!nodeMap.has(iss.nodeId)) nodeMap.set(iss.nodeId, [])
    nodeMap.get(iss.nodeId)!.push(iss)
  }
  return {
    issues,
    errorCount: issues.filter(i => i.level === 'error').length,
    warningCount: issues.filter(i => i.level === 'warning').length,
    nodeMap
  }
}
