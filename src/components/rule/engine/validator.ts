/**
 * 规则引擎实时校验器
 * 对标阿里/淘宝规则引擎：节点配置完整性 + 连线合法性 + 图结构合法性
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
 */
export const validateRuleFlow = (nodes: any[], edges: any[]): ValidationResult => {
  const issues: ValidationIssue[] = []
  const push = (nodeId: string, nodeType: string, level: IssueLevel, code: string, message: string) => {
    const node = nodes.find(n => n.id === nodeId)
    issues.push({ nodeId, nodeType, nodeName: node ? nodeName(node) : nodeId, level, code, message })
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
            if (!nonEmpty(a.actionType) || !nonEmpty(a.targetField)) {
              push(id, type, 'error', 'ACTION_INCOMPLETE', i18n('rule.val.actionIncomplete', [idx + 1]))
            }
          })
        }
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'variable-assign':
      case 'action-assign': {
        const list = data.assignments || []
        if (list.length === 0) push(id, type, 'error', 'ASSIGN_EMPTY', i18n('rule.val.assignEmpty'))
        else {
          list.forEach((a: any, idx: number) => {
            if (!nonEmpty(a.variableName) && !nonEmpty(a.targetField)) {
              push(id, type, 'error', 'ASSIGN_INCOMPLETE', i18n('rule.val.assignIncomplete', [idx + 1]))
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
          branches.forEach((b: any, idx: number) => {
            if (!nonEmpty(b.label) || !nonEmpty(b.condition)) {
              push(id, type, 'error', 'GW_BRANCH_INCOMPLETE', i18n('rule.val.gwBranchIncomplete', [idx + 1]))
            }
            if (!nonEmpty(b.targetNodeId)) {
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
      case 'loop': {
        if (data.loopType === 'forEach' && !nonEmpty(data.collectionVar)) {
          push(id, type, 'error', 'LOOP_NO_COLLECTION', i18n('rule.val.loopNoCollection'))
        }
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'script': {
        if (!nonEmpty(data.scriptContent)) push(id, type, 'error', 'SCRIPT_EMPTY', i18n('rule.val.scriptEmpty'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'http-call':
      case 'ext-http-call': {
        if (!nonEmpty(data.url)) push(id, type, 'error', 'HTTP_NO_URL', i18n('rule.val.httpNoUrl'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'rule-set-ref': {
        if (!nonEmpty(data.ruleSetCode)) push(id, type, 'error', 'RULESET_NO_CODE', i18n('rule.val.rulesetNoCode'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'subrule-call': {
        if (!nonEmpty(data.subRuleCode)) push(id, type, 'error', 'SUBRULE_NO_CODE', i18n('rule.val.subruleNoCode'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      case 'decision-table': {
        if (!nonEmpty(data.tableName)) push(id, type, 'error', 'DT_NO_NAME', i18n('rule.val.dtNoName'))
        const rules = data.rules || []
        if (rules.length === 0) push(id, type, 'error', 'DT_NO_RULES', i18n('rule.val.dtNoRules'))
        if (outs.length === 0) push(id, type, 'error', 'NODE_NO_OUT', i18n('rule.val.nodeNoOut'))
        break
      }
      default: {
        // 通用：基于 paramSchema 的 required 字段校验
        const def = NODE_TYPE_MAP[type]
        if (def) {
          def.paramSchema.forEach(f => {
            if (f.required && !nonEmpty(data[f.name])) {
              push(id, type, 'error', 'REQUIRED_' + f.name.toUpperCase(),
                i18n('rule.val.requiredMissing', [i18n(f.label)]))
            }
          })
        }
        // 非终止节点应有出边（除非是 ctrl-terminate/end）
        if (type !== 'ctrl-terminate' && outs.length === 0 && ins.length > 0) {
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
