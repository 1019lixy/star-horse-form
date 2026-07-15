/**
 * 前端规则执行引擎
 * 解析流程图节点和边，模拟规则执行，返回执行路径
 */

import { i18n } from '@/lang'

export interface ExecutionNode {
  id: string
  type: string
  data: any
}

export interface ExecutionEdge {
  id: string
  source: string
  target: string
  label?: string
  data?: any
}

export interface ExecutionStep {
  nodeId: string
  nodeType: string
  nodeName: string
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'RUNNING'
  message: string
  timestamp: number
  duration?: number
}

export interface ExecutionPath {
  visitedNodeIds: string[]
  visitedEdgeIds: string[]
  steps: ExecutionStep[]
  context: any
  success: boolean
  duration: number
  conditionResults: { nodeId: string; passed: boolean; detail: string }[]
  actionResults: { nodeId: string; actionType: string; targetField: string; success: boolean; message: string }[]
}

/**
 * 将字段值统一转为字符串数组（兼容逗号分隔字符串与数组两种形态）
 */
const toStringArray = (v: any): string[] => {
  if (Array.isArray(v)) return v.map(x => String(x)).filter(Boolean)
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
  if (v == null) return []
  return [String(v)]
}

/**
 * 比较操作符
 */
const compareValues = (left: any, operator: string, right: any): boolean => {
  const toNum = (v: any) => {
    if (typeof v === 'number') return v
    if (typeof v === 'string') {
      const n = parseFloat(v)
      return isNaN(n) ? 0 : n
    }
    return 0
  }

  switch (operator) {
    case 'EQ': case '=': case '==':
      return String(left) === String(right)
    case 'NE': case '!=': case '<>':
      return String(left) !== String(right)
    case 'GT': case '>':
      return toNum(left) > toNum(right)
    case 'GTE': case '>=':
      return toNum(left) >= toNum(right)
    case 'LT': case '<':
      return toNum(left) < toNum(right)
    case 'LTE': case '<=':
      return toNum(left) <= toNum(right)
    case 'CONTAINS':
      if (typeof right === 'string') return String(right).includes(String(left))
      if (Array.isArray(right)) return right.some(r => String(r) === String(left))
      return false
    case 'NOT_CONTAINS':
      if (typeof right === 'string') return !String(right).includes(String(left))
      if (Array.isArray(right)) return !right.some(r => String(r) === String(left))
      return true
    case 'IN':
      if (Array.isArray(right)) return right.some(r => String(r) === String(left))
      if (typeof right === 'string') return String(right).split(',').map(s=>s.trim()).includes(String(left))
      return false
    case 'NOT_IN':
      if (Array.isArray(right)) return !right.some(r => String(r) === String(left))
      if (typeof right === 'string') return !String(right).split(',').map(s=>s.trim()).includes(String(left))
      return true
    case 'IS_NULL': case 'NULL':
      return left === null || left === undefined || left === ''
    case 'NOT_NULL':
      return left !== null && left !== undefined && left !== ''
    case 'STARTS_WITH':
      return typeof left === 'string' && typeof right === 'string' && left.startsWith(right)
    case 'ENDS_WITH':
      return typeof left === 'string' && typeof right === 'string' && left.endsWith(right)
    case 'BETWEEN': {
      // right格式: "min-max" 或 "min,max"
      const parts = String(right).split(/[-,]/)
      if (parts.length >= 2) {
        const lo = toNum(parts[0])
        const hi = toNum(parts[1])
        return toNum(left) >= lo && toNum(left) <= hi
      }
      return false
    }
    default:
      return false
  }
}

/**
 * 评估单个条件
 */
const evaluateCondition = (condition: any, context: any): { passed: boolean; detail: string } => {
  const fieldValue = context[condition.fieldName]
  const targetValue = condition.value

  const passed = compareValues(fieldValue, condition.operator, targetValue)
  const detail = `${condition.fieldName}(${fieldValue ?? 'null'}) ${condition.operator} ${targetValue} => ${passed ? 'TRUE' : 'FALSE'}`

  return { passed, detail }
}

/**
 * 评估条件组
 */
const evaluateConditions = (conditions: any[], logic: string, context: any): { passed: boolean; details: string[] } => {
  if (!conditions || conditions.length === 0) {
    return { passed: true, details: [i18n('rule.exec.noConditionDefault')] }
  }

  const details: string[] = []
  const results = conditions.map(cond => {
    const result = evaluateCondition(cond, context)
    details.push(result.detail)
    return result.passed
  })

  const passed = logic === 'OR' ? results.some(r => r) : results.every(r => r)
  return { passed, details }
}

/**
 * 表达式求值（设计器模拟用）
 * 支持 ${var} 占位符插值，以及算术/逻辑表达式（基于上下文变量）
 */
const evaluateExpression = (expr: string, context: any): any => {
  if (!expr) return ''
  // 1. 替换 ${var} 占位符
  let resolved = expr.replace(/\$\{([^}]+)\}/g, (_, k) => {
    const v = resolveContextPath(context, k.trim())
    return v === undefined || v === null ? '' : String(v)
  })
  // 2. 仅当表达式只含安全字符时尝试求值
  if (/^[\w\s+\-*/%().,:'"<>=!&|?]+$/.test(resolved)) {
    try {
      const keys = Object.keys(context).filter(k => /^[$A-Z_a-z][$\w]*$/.test(k))
      const vals = keys.map(k => context[k])
      // 注入内置函数
      const fnScope = {
        SUM: (...a: number[]) => a.reduce((s, x) => s + Number(x || 0), 0),
        AVG: (...a: number[]) => a.length ? a.reduce((s, x) => s + Number(x || 0), 0) / a.length : 0,
        MIN: (...a: number[]) => Math.min(...a.map(x => Number(x))),
        MAX: (...a: number[]) => Math.max(...a.map(x => Number(x))),
        ROUND: (x: number, n = 0) => Number((Number(x)).toFixed(n)),
        ABS: (x: number) => Math.abs(Number(x)),
        LEN: (s: string) => String(s ?? '').length,
        CONCAT: (...a: any[]) => a.map(x => String(x ?? '')).join(''),
        UPPER: (s: string) => String(s ?? '').toUpperCase(),
        LOWER: (s: string) => String(s ?? '').toLowerCase(),
        NOW: () => new Date().toISOString(),
        IF: (c: any, a: any, b: any) => (c ? a : b),
        IS_EMPTY: (x: any) => (x === undefined || x === null || x === '')
      }
      const scopeKeys = Object.keys(fnScope)
      const scopeVals = scopeKeys.map(k => (fnScope as any)[k])
      const allKeys = [...scopeKeys, ...keys]
      const allVals = [...scopeVals, ...vals]
      const fn = new Function(...allKeys, `"use strict"; return (${resolved});`)
      return fn(...allVals)
    } catch {
      // 求值失败，回退为插值后的字符串
    }
  }
  return resolved
}

/**
 * 解析上下文路径（支持 a.b.c 取值）
 */
const resolveContextPath = (context: any, path: string): any => {
  const segs = path.split('.')
  let cur = context
  for (const s of segs) {
    if (cur == null) return undefined
    cur = cur[s]
  }
  return cur
}

/**
 * 执行动作（模拟）
 */
const executeAction = (action: any, context: any): { success: boolean; message: string } => {
  switch (action.actionType) {
    case 'SHOW_FIELD':
      context[`__visible_${action.targetField}`] = true
      return { success: true, message: `${i18n('rule.exec.showField')}: ${action.targetField}` }
    case 'HIDE_FIELD':
      context[`__visible_${action.targetField}`] = false
      return { success: true, message: `${i18n('rule.exec.hideField')}: ${action.targetField}` }
    case 'SET_VALUE': {
      let value = action.actionValue || action.value
      if (action.actionValueType === 'EXPRESSION') {
        value = evaluateExpression(String(action.actionValue || ''), context)
      } else if (action.actionValueType === 'VARIABLE') {
        value = resolveContextPath(context, String(action.actionValue || ''))
      }
      context[action.targetField] = value
      return { success: true, message: `${i18n('rule.exec.setValue')} ${action.targetField} = ${value}` }
    }
    case 'CLEAR_VALUE':
      context[action.targetField] = ''
      return { success: true, message: `${i18n('rule.exec.clearField')}: ${action.targetField}` }
    case 'SET_REQUIRED':
      context[`__required_${action.targetField}`] = true
      return { success: true, message: `${i18n('rule.exec.setRequired')}: ${action.targetField}` }
    case 'SET_OPTIONAL':
      context[`__required_${action.targetField}`] = false
      return { success: true, message: `${i18n('rule.exec.setOptional')}: ${action.targetField}` }
    case 'SET_READONLY':
      context[`__readonly_${action.targetField}`] = true
      return { success: true, message: `${i18n('rule.exec.setReadonly')}: ${action.targetField}` }
    case 'SET_EDITABLE':
      context[`__readonly_${action.targetField}`] = false
      return { success: true, message: `${i18n('rule.exec.setEditable')}: ${action.targetField}` }
    case 'SET_DISABLED':
      context[`__disabled_${action.targetField}`] = true
      return { success: true, message: `${i18n('rule.exec.setDisabled')}: ${action.targetField}` }
    case 'SET_ENABLED':
      context[`__disabled_${action.targetField}`] = false
      return { success: true, message: `${i18n('rule.exec.setEnabled')}: ${action.targetField}` }
    case 'SHOW_MESSAGE':
      return { success: true, message: `[${action.messageType || 'INFO'}] ${action.message || action.actionValue || ''}` }
    case 'REDIRECT':
      return { success: true, message: `${i18n('rule.exec.redirect')}: ${action.actionValue || action.value || ''}` }
    default:
      return { success: true, message: `${i18n('rule.exec.executeAction')}: ${action.actionType}` }
  }
}

/**
 * 执行变量赋值
 */
const executeVariableAssign = (assignments: any[], context: any): { success: boolean; messages: string[] } => {
  const messages: string[] = []
  for (const assign of assignments) {
    let value = assign.value
    if (assign.valueType === 'VARIABLE') {
      value = resolveContextPath(context, String(assign.value))
    } else if (assign.valueType === 'EXPRESSION') {
      value = evaluateExpression(String(assign.value), context)
    } else if (assign.valueType === 'CONSTANT') {
      // 尝试解析为JSON（支持数组/对象常量）
      if (typeof value === 'string') {
        const trimmed = value.trim()
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
          try {
            value = JSON.parse(trimmed)
          } catch {
            // JSON解析失败，保持原始字符串
          }
        }
        // 尝试解析为数字
        else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          value = Number(trimmed)
        }
        // 布尔值
        else if (trimmed === 'true') value = true
        else if (trimmed === 'false') value = false
      }
    }
    context[assign.variableName] = value
    messages.push(`${assign.variableName} = ${typeof value === 'object' ? JSON.stringify(value) : value}`)
  }
  return { success: true, messages }
}

/**
 * 执行脚本（模拟，安全沙箱）
 */
const executeScript = (scriptContent: string, context: any): { success: boolean; message: string } => {
  try {
    // 创建安全的执行上下文
    const fn = new Function('context', 'formData', 'variables', scriptContent)
    const result = fn(context, context, context)
    return { success: true, message: `${i18n('rule.exec.scriptComplete')}${result ? ': ' + JSON.stringify(result) : ''}` }
  } catch (error: any) {
    return { success: false, message: `${i18n('rule.exec.scriptError')}: ${error.message}` }
  }
}

/**
 * 模拟HTTP调用
 */
const executeHttpCall = (config: any, context: any): { success: boolean; message: string } => {
  const method = config.method || 'GET'
  const url = config.url || ''
  // 模拟响应
  const mockResponse = { code: 200, data: { success: true, message: 'mock response' } }
  if (config.responseVar) {
    context[config.responseVar] = mockResponse
  }
  return { success: true, message: `${method} ${url} => 200 (${i18n('rule.exec.mock')})` }
}

/**
 * 主执行函数：遍历流程图
 */
export const executeRuleFlow = (
  nodes: ExecutionNode[],
  edges: ExecutionEdge[],
  inputData: any
): ExecutionPath => {
  const startTime = Date.now()
  const context = { ...inputData }
  const steps: ExecutionStep[] = []
  const conditionResults: ExecutionPath['conditionResults'] = []
  const actionResults: ExecutionPath['actionResults'] = []
  const visitedNodeIds: string[] = []
  const visitedEdgeIds: string[] = []

  // 找到开始节点
  const startNode = nodes.find(n => n.type === 'start')
  if (!startNode) {
    steps.push({
      nodeId: '', nodeType: 'error', nodeName: i18n('rule.exec.error'),
      status: 'FAILED', message: i18n('rule.exec.startNodeNotFound'), timestamp: Date.now()
    })
    return {
      visitedNodeIds, visitedEdgeIds, steps, context,
      success: false, duration: Date.now() - startTime,
      conditionResults, actionResults
    }
  }

  // BFS遍历
  let currentNodeId: string | null = startNode.id
  let safetyCounter = 0
  const maxIterations = 100

  while (currentNodeId && safetyCounter < maxIterations) {
    safetyCounter++
    const node = nodes.find(n => n.id === currentNodeId)
    if (!node) break

    visitedNodeIds.push(node.id)
    const nodeStartTime = Date.now()
    const nodeName = getNodeName(node)

    steps.push({
      nodeId: node.id, nodeType: node.type, nodeName,
      status: 'RUNNING', message: `${i18n('rule.exec.enterNode')}: ${nodeName}`,
      timestamp: Date.now()
    })

    let nextEdgeId: string | null = null
    let nextNodeId: string | null = null

    switch (node.type) {
      case 'start': {
        steps[steps.length - 1].message = i18n('rule.exec.flowStart')
        steps[steps.length - 1].status = 'SUCCESS'
        // 开始节点自动找下一条边
        const startOutEdge = edges.find(e => e.source === node.id)
        if (startOutEdge) {
          nextEdgeId = startOutEdge.id
          nextNodeId = startOutEdge.target
        }
        break
      }

      case 'end':
        steps[steps.length - 1].message = i18n('rule.exec.flowEnd')
        steps[steps.length - 1].status = 'SUCCESS'
        currentNodeId = null
        continue

      case 'condition': {
        const conditions = node.data.conditions || []
        const logic = node.data.logic || 'AND'
        const { passed, details } = evaluateConditions(conditions, logic, context)
        conditionResults.push({
          nodeId: node.id,
          passed,
          detail: details.join('\n')
        })
        steps[steps.length - 1].message = `${passed ? i18n('rule.exec.conditionMet') : i18n('rule.exec.conditionNotMet')}: ${details.join('; ')}`
        steps[steps.length - 1].status = passed ? 'SUCCESS' : 'SKIPPED'

        // 条件满足走"是"边，不满足走"否"边
        // 匹配策略：满足=包含"是"/"满足"/"true"/"✓"的标签；不满足=包含"否"/"不满足"/"false"/"✗"的标签
        const outEdges = edges.filter(e => e.source === node.id)
        const isTrueLabel = (label?: string) => {
          if (!label) return true // 无标签默认为"是"边
          const l = label.toLowerCase()
          return l === '是' || l === 'true' || l.includes('满足') || l.includes('✓') || l.includes('yes')
        }
        const isFalseLabel = (label?: string) => {
          if (!label) return false
          const l = label.toLowerCase()
          return l === '否' || l === 'false' || l.includes('不满足') || l.includes('✗') || l.includes('no')
        }
        if (passed) {
          const trueEdge = outEdges.find(e => isTrueLabel(e.label)) || outEdges[0]
          if (trueEdge) {
            nextEdgeId = trueEdge.id
            nextNodeId = trueEdge.target
          }
        } else {
          const falseEdge = outEdges.find(e => isFalseLabel(e.label))
          if (falseEdge) {
            nextEdgeId = falseEdge.id
            nextNodeId = falseEdge.target
          } else {
            // 没有明确的"否"边时，走第二条边（第一条通常是"是"边）
            const secondEdge = outEdges.length > 1 ? outEdges[1] : outEdges[0]
            if (secondEdge) {
              nextEdgeId = secondEdge.id
              nextNodeId = secondEdge.target
            }
          }
        }
        break
      }

      case 'action': {
        const actions = node.data.actions || []
        for (const action of actions) {
          const result = executeAction(action, context)
          actionResults.push({
            nodeId: node.id,
            actionType: action.actionType,
            targetField: action.targetField || '',
            success: result.success,
            message: result.message
          })
        }
        steps[steps.length - 1].message = `${i18n('rule.exec.executedActions')} ${actions.length}`
        steps[steps.length - 1].status = 'SUCCESS'

        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) {
          nextEdgeId = outEdge.id
          nextNodeId = outEdge.target
        }
        break
      }

      case 'exclusive-gateway': {
        // 排他网关：找第一个满足条件的分支
        const branches = node.data.branches || []
        const outEdges = edges.filter(e => e.source === node.id)
        let found = false
        let defaultEdge: ExecutionEdge | null = null
        for (const edge of outEdges) {
          // 通过edge.label匹配branch
          const branch = branches.find((b: any) => b.label === edge.label)
          if (branch) {
            // 1) branch有conditions数组 → 用evaluateConditions
            if (branch.conditions && branch.conditions.length > 0) {
              const { passed } = evaluateConditions(branch.conditions, branch.logic || 'AND', context)
              if (passed) {
                nextEdgeId = edge.id
                nextNodeId = edge.target
                found = true
                break
              }
            }
            // 2) branch有condition字符串 → 用evaluateExpression求值
            else if (branch.condition && typeof branch.condition === 'string') {
              const condStr = String(branch.condition)
              if (condStr === 'default' || condStr.toLowerCase() === 'default') {
                defaultEdge = edge
                continue // 默认分支最后处理
              }
              try {
                const result = evaluateExpression(condStr, context)
                if (result === true || result === 'true') {
                  nextEdgeId = edge.id
                  nextNodeId = edge.target
                  found = true
                  break
                }
              } catch {
                // 条件求值失败，跳过此分支
              }
            }
          } else if (!found) {
            // 无匹配branch的边，视为默认分支
            if (!defaultEdge) defaultEdge = edge
          }
        }
        // 没有条件满足时走默认分支
        if (!found && defaultEdge) {
          nextEdgeId = defaultEdge.id
          nextNodeId = defaultEdge.target
          found = true
        }
        if (!found && outEdges.length > 0) {
          nextEdgeId = outEdges[outEdges.length - 1].id
          nextNodeId = outEdges[outEdges.length - 1].target
        }
        steps[steps.length - 1].message = found ? `${i18n('rule.exec.selectBranch')}: ${edges.find(e => e.id === nextEdgeId)?.label || i18n('rule.exec.default')}` : i18n('rule.exec.noMatchedBranch')
        steps[steps.length - 1].status = 'SUCCESS'
        break
      }

      case 'parallel-gateway': {
        // 并行网关：所有出边都走
        const outEdges = edges.filter(e => e.source === node.id)
        steps[steps.length - 1].message = `${i18n('rule.exec.parallelExecute')} ${outEdges.length} ${i18n('rule.exec.branches')}`
        steps[steps.length - 1].status = 'SUCCESS'
        // 简化处理：只走第一条（实际应并行执行所有分支后聚合）
        if (outEdges.length > 0) {
          nextEdgeId = outEdges[0].id
          nextNodeId = outEdges[0].target
          // 其他边也标记为已访问
          for (let i = 1; i < outEdges.length; i++) {
            visitedEdgeIds.push(outEdges[i].id)
          }
        }
        break
      }

      case 'inclusive-gateway': {
        // 包容网关：所有满足条件的分支都走
        const branches = node.data.branches || []
        const outEdges = edges.filter(e => e.source === node.id)
        const matchedEdges: string[] = []
        for (const edge of outEdges) {
          const branch = branches.find((b: any) => b.label === edge.label)
          if (branch) {
            if (branch.conditions && branch.conditions.length > 0) {
              const { passed } = evaluateConditions(branch.conditions, branch.logic || 'AND', context)
              if (passed) matchedEdges.push(edge.id)
            } else if (branch.condition && typeof branch.condition === 'string') {
              const condStr = String(branch.condition)
              if (condStr === 'default' || condStr.toLowerCase() === 'default') {
                matchedEdges.push(edge.id)
              } else {
                try {
                  const result = evaluateExpression(condStr, context)
                  if (result === true || result === 'true') matchedEdges.push(edge.id)
                } catch { /* skip */ }
              }
            }
          }
        }
        // 简化：走第一个匹配的
        if (matchedEdges.length > 0) {
          nextEdgeId = matchedEdges[0]
          nextNodeId = edges.find(e => e.id === nextEdgeId)?.target || null
          matchedEdges.forEach(id => { if (id !== nextEdgeId) visitedEdgeIds.push(id) })
        } else if (outEdges.length > 0) {
          nextEdgeId = outEdges[0].id
          nextNodeId = outEdges[0].target
        }
        steps[steps.length - 1].message = `${i18n('rule.exec.matchedBranches')} ${matchedEdges.length}`
        steps[steps.length - 1].status = 'SUCCESS'
        break
      }

      case 'variable-assign': {
        const assignments = node.data.assignments || []
        const result = executeVariableAssign(assignments, context)
        steps[steps.length - 1].message = result.messages.join('; ')
        steps[steps.length - 1].status = 'SUCCESS'
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
        break
      }

      case 'script': {
        const result = executeScript(node.data.scriptContent || '', context)
        steps[steps.length - 1].message = result.message
        steps[steps.length - 1].status = result.success ? 'SUCCESS' : 'FAILED'
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
        break
      }

      case 'http-call': {
        const result = executeHttpCall(node.data, context)
        steps[steps.length - 1].message = result.message
        steps[steps.length - 1].status = 'SUCCESS'
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
        break
      }

      case 'rule-set-ref': {
        steps[steps.length - 1].message = `${i18n('rule.exec.referenceRuleSet')}: ${node.data.ruleSetName || ''}`
        steps[steps.length - 1].status = 'SUCCESS'
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
        break
      }

      case 'loop': {
        const collectionVar = node.data.collectionVar
        const collection = context[collectionVar]
        if (Array.isArray(collection)) {
          steps[steps.length - 1].message = `${i18n('rule.exec.loopIterate')} ${collection.length} ${i18n('rule.exec.elements')}`
        } else {
          steps[steps.length - 1].message = `${i18n('rule.exec.loop')}: ${i18n('rule.exec.collectionVarNotExist')} ${collectionVar}`
        }
        steps[steps.length - 1].status = 'SUCCESS'
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
        break
      }

      case 'generic': {
        // 通用企业级节点执行
        const actualType = node.data?.__nodeType || 'unknown'
        const result = executeGenericNode(actualType, node.data, context)
        steps[steps.length - 1].message = result.message
        steps[steps.length - 1].status = result.success ? 'SUCCESS' : (result.terminate ? 'FAILED' : 'SUCCESS')
        // 终止节点不再继续
        if (result.terminate) { currentNodeId = null; continue }
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
        break
      }

      default:
        steps[steps.length - 1].message = `${i18n('rule.exec.unknownNodeType')}: ${node.type}`
        steps[steps.length - 1].status = 'SKIPPED'
        const outEdge = edges.find(e => e.source === node.id)
        if (outEdge) { nextEdgeId = outEdge.id; nextNodeId = outEdge.target }
    }

    if (nextEdgeId) visitedEdgeIds.push(nextEdgeId)
    currentNodeId = nextNodeId

    if (steps.length > 0) {
      steps[steps.length - 1].duration = Date.now() - nodeStartTime
    }
  }

  return {
    visitedNodeIds,
    visitedEdgeIds,
    steps,
    context,
    success: true,
    duration: Date.now() - startTime,
    conditionResults,
    actionResults
  }
}

/**
 * 获取节点显示名称
 */
// 通用企业级节点执行
const executeGenericNode = (type: string, data: any, context: any): { success: boolean; message: string; terminate?: boolean } => {
  switch (type) {
    // === 数据入参 ===
    case 'context-extract': {
      const val = data.fieldPath ? data.fieldPath.split('.').reduce((o: any, k: string) => o?.[k], context) : undefined
      if (data.targetVar) context[data.targetVar] = val
      return { success: true, message: `${i18n('rule.exec.extract')} ${data.fieldPath || '?'} → ${data.targetVar || '?'} = ${JSON.stringify(val)}` }
    }
    case 'type-cast': {
      const val = context[data.sourceVar]
      let converted: any = val
      if (data.targetType === 'NUMBER') converted = Number(val) || 0
      else if (data.targetType === 'STRING') converted = String(val)
      else if (data.targetType === 'BOOLEAN') converted = Boolean(val)
      else if (data.targetType === 'DATE') converted = new Date(val).toISOString()
      if (data.targetVar) context[data.targetVar] = converted
      return { success: true, message: `${i18n('rule.exec.convert')} ${data.sourceVar}(${typeof val}) → ${data.targetType} = ${converted}` }
    }
    case 'dataset-load': {
      const ds = data.fieldPath ? data.fieldPath.split('.').reduce((o: any, k: string) => o?.[k], context) : []
      if (data.targetVar) context[data.targetVar] = Array.isArray(ds) ? ds : [ds]
      return { success: true, message: `${i18n('rule.exec.loadDataset')} ${(Array.isArray(ds) ? ds.length : 1)} ${i18n('rule.exec.items')} → ${data.targetVar || '?'}` }
    }
    case 'datasource-fetch': {
      if (data.targetVar) context[data.targetVar] = { simulated: true, api: data.apiUrl }
      return { success: true, message: `${i18n('rule.exec.mockFetch')} ${data.method} ${data.apiUrl} → ${data.targetVar || '?'}` }
    }

    // === 条件判断 ===
    case 'cond-multibranch': {
      const val = context[data.matchField]
      const matchType = data.matchType || 'ENUM'
      let matchedLabel = data.defaultBranch || i18n('rule.exec.default')
      if (data.branches && Array.isArray(data.branches)) {
        if (matchType === 'RANGE') {
          // 区间分段匹配：value 格式 "min~max" 或 "min,max"
          const numVal = Number(val)
          for (const b of data.branches) {
            const range = String(b.value || '').split(/[~,]/).map((s: string) => s.trim())
            if (range.length === 2) {
              const min = range[0] === '' ? -Infinity : Number(range[0])
              const max = range[1] === '' ? Infinity : Number(range[1])
              if (!isNaN(numVal) && numVal >= min && numVal < max) { matchedLabel = b.label || matchedLabel; break }
            }
          }
        } else {
          // 枚举匹配
          const m = data.branches.find((b: any) => String(b.value) === String(val))
          if (m) matchedLabel = m.label || matchedLabel
        }
      }
      return { success: true, message: `${i18n('rule.exec.multiBranchMatch')} ${data.matchField}=${val} → ${matchedLabel}` }
    }
    case 'cond-set-contains': {
      const src = context[data.sourceSet] || []
      const tgt = context[data.targetSet] || []
      const srcArr = Array.isArray(src) ? src : [src]
      const tgtArr = Array.isArray(tgt) ? tgt : [tgt]
      const intersect = srcArr.filter((x: any) => tgtArr.includes(x))
      const checkType = data.checkType || 'CONTAINS_ANY'
      let passed = false
      let detail = ''
      if (checkType === 'CONTAINS_ANY') {
        passed = intersect.length > 0
        detail = `${i18n('rule.exec.intersect')} ${intersect.length} ${i18n('rule.exec.items')}`
      } else if (checkType === 'CONTAINS_ALL') {
        // src 必须包含 tgt 的所有元素（tgt 是 src 的子集）
        const missing = tgtArr.filter((x: any) => !srcArr.includes(x))
        passed = missing.length === 0
        detail = `${i18n('rule.exec.subsetCheck')}, ${i18n('rule.exec.missing')} ${missing.length} ${i18n('rule.exec.items')}`
      } else if (checkType === 'EQUALS') {
        passed = srcArr.length === tgtArr.length && intersect.length === srcArr.length
        detail = `${i18n('rule.exec.setEqual')}: ${passed ? i18n('rule.exec.yes') : i18n('rule.exec.no')}`
      } else if (checkType === 'NO_INTERSECT') {
        passed = intersect.length === 0
        detail = `${i18n('rule.exec.noIntersect')}: ${passed ? i18n('rule.exec.yes') : i18n('rule.exec.no')},${i18n('rule.exec.intersect')}${intersect.length}${i18n('rule.exec.items')}`
      }
      return { success: passed, message: `${i18n('rule.exec.setCheck')} ${checkType}: ${detail}` }
    }
    case 'cond-dirty-check': {
      const fields = toStringArray(data.fields)
      const dirty = fields.filter((f: string) => !context[f] || context[f] === '' || context[f] === null)
      return { success: dirty.length === 0, message: dirty.length ? `${i18n('rule.exec.dirtyData')}: ${dirty.join(',')}` : i18n('rule.exec.dataIntegrityPass'), terminate: dirty.length > 0 && data.checkRules?.includes('BLOCK') }
    }
    case 'cond-time-window': {
      const dateVal = context[data.dateField]
      return { success: true, message: `${i18n('rule.exec.timeWindowCheck')} ${data.dateField}=${dateVal} (${data.windowType})` }
    }
    case 'cond-unique': {
      const fields = toStringArray(data.fields)
      return { success: true, message: `${i18n('rule.exec.uniqueCheck')} ${fields.join('+')} (${data.scope})` }
    }
    case 'cond-threshold': {
      const val = Number(context[data.field] || 0)
      const exceeded = data.thresholds?.some((t: any) => val > (t.max || Infinity) || val < (t.min || -Infinity))
      return { success: !exceeded, message: `${i18n('rule.exec.thresholdCheck')} ${data.field}=${val} ${exceeded ? i18n('rule.exec.exceeded') + '[' + data.alertLevel + ']' : i18n('rule.exec.normal')}` }
    }

    // === 循环迭代 ===
    case 'loop-iterate': {
      const coll = context[data.collectionVar]
      if (!Array.isArray(coll)) return { success: false, message: `${i18n('rule.exec.collectionNotExist')} ${data.collectionVar}` }
      const itemVar = data.itemVar || 'item'
      const indexVar = data.indexVar || 'index'
      coll.forEach((item, idx) => {
        context[itemVar] = item
        context[indexVar] = idx
      })
      return { success: true, message: `${i18n('rule.exec.loopIterate')} ${coll.length} ${i18n('rule.exec.items')}(item=${JSON.stringify(coll[coll.length - 1])})` }
    }
    case 'loop-aggregate': {
      const coll = context[data.collectionVar] || []
      const arr = Array.isArray(coll) ? coll : []
      const vals = arr.map((x: any) => Number(x[data.aggField] || 0))
      let result = 0
      if (data.aggType === 'SUM') result = vals.reduce((a, b) => a + b, 0)
      else if (data.aggType === 'MAX') result = Math.max(...vals, 0)
      else if (data.aggType === 'MIN') result = Math.min(...vals, 0)
      else if (data.aggType === 'AVG') result = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      else if (data.aggType === 'COUNT') result = arr.length
      if (data.targetVar) context[data.targetVar] = result
      return { success: true, message: `${data.aggType}(${data.aggField}) = ${result} → ${data.targetVar}` }
    }
    case 'loop-filter': {
      const coll = context[data.collectionVar] || []
      const filtered = Array.isArray(coll) ? coll.filter((x: any) => x) : []
      if (data.targetVar) context[data.targetVar] = filtered
      return { success: true, message: `${i18n('rule.exec.filter')} ${Array.isArray(coll) ? coll.length : 0} → ${filtered.length} ${i18n('rule.exec.items')}` }
    }
    case 'loop-break': {
      return { success: true, message: `${i18n('rule.exec.loopBreakCondition')}: ${data.breakCondition || i18n('rule.exec.breakOnMatch')}` }
    }

    // === 运算公式 ===
    case 'calc-money': {
      const operands = (data.operands || []).map((v: any) => Number(context[v] ?? v) || 0)
      let result = 0
      if (data.operator === 'ADD') result = operands.reduce((a, b) => a + b, 0)
      else if (data.operator === 'SUB') result = operands.reduce((a, b, i) => i === 0 ? b : a - b, 0)
      else if (data.operator === 'MUL') result = operands.reduce((a, b) => a * b, 1)
      else if (data.operator === 'DIV') result = operands.reduce((a, b, i) => i === 0 ? b : a / b, 0)
      if (data.targetVar) context[data.targetVar] = result
      return { success: true, message: `${i18n('rule.exec.moneyCalc')} ${data.operator} = ${result.toFixed(data.precision || 2)}` }
    }
    case 'calc-date': {
      const base = new Date(context[data.baseDate] || Date.now())
      const ms = data.offset * (data.offsetUnit === 'DAY' ? 86400000 : data.offsetUnit === 'HOUR' ? 3600000 : data.offsetUnit === 'MINUTE' ? 60000 : 86400000)
      const result = new Date(base.getTime() + ms)
      if (data.targetVar) context[data.targetVar] = result.toISOString().split('T')[0]
      return { success: true, message: `${i18n('rule.exec.dateOffset')} ${data.baseDate}+${data.offset}${data.offsetUnit} → ${context[data.targetVar]}` }
    }
    case 'calc-string': {
      const operands = (data.operands || []).map((v: any) => context[v] ?? v ?? '')
      let result = ''
      if (data.operation === 'CONCAT') result = operands.join('')
      else if (data.operation === 'UPPER') result = String(operands[0] || '').toUpperCase()
      else if (data.operation === 'LOWER') result = String(operands[0] || '').toLowerCase()
      else if (data.operation === 'MASK') result = String(operands[0] || '').replace(/.(?=.{2})/g, '*')
      if (data.targetVar) context[data.targetVar] = result
      return { success: true, message: `${i18n('rule.exec.stringProcess')}${data.operation} → ${result}` }
    }
    case 'calc-dict-map': {
      const val = context[data.sourceVar]
      if (data.targetVar) context[data.targetVar] = val
      return { success: true, message: `${i18n('rule.exec.dictMap')} ${data.sourceVar}=${val} [${data.dictCode}]` }
    }
    case 'calc-ratio': {
      const total = Number(context[data.totalAmount] || 0)
      const ratioSource = context[data.ratioSource]
      const ratioField = data.ratioField || 'ratio'
      const arr = Array.isArray(ratioSource) ? ratioSource : []
      const ratios = arr.map((x: any) => Number(x?.[ratioField] || 0))
      const ratioSum = ratios.reduce((a: number, b: number) => a + b, 0)
      const result: any[] = []
      if (ratioSum > 0) {
        arr.forEach((row: any, idx: number) => {
          const allocated = total * (ratios[idx] / ratioSum)
          result.push({ ...row, _allocated: Number(allocated.toFixed(2)) })
        })
      }
      if (data.targetVar) context[data.targetVar] = result
      return { success: true, message: `${i18n('rule.exec.ratioAllocate')} ${i18n('rule.exec.total')}${total}${i18n('rule.exec.by')}${ratioField}${i18n('rule.exec.allocateTo')}${arr.length}${i18n('rule.exec.rows')}(${i18n('rule.exec.ratioSum')}=${ratioSum})` }
    }

    // === 分支动作 ===
    case 'action-assign': {
      const count = data.assignments?.length || 0
      data.assignments?.forEach((a: any) => { context[a.variableName || a.targetField] = a.value })
      return { success: true, message: `${i18n('rule.exec.batchAssign')} ${count} ${i18n('rule.exec.items')}` }
    }
    case 'action-mark': {
      context[`__mark_${data.targetField}`] = data.markType
      return { success: true, message: `${i18n('rule.exec.mark')} ${data.targetField} → ${data.markType}:${data.markValue}` }
    }
    case 'action-filter-output': {
      const src = context[data.sourceVar] || []
      const filtered = Array.isArray(src) ? src : []
      if (data.targetVar) context[data.targetVar] = filtered
      return { success: true, message: `${i18n('rule.exec.filterOutput')} ${filtered.length} ${i18n('rule.exec.items')} → ${data.targetVar}` }
    }
    case 'action-split-merge': {
      const src = context[data.sourceVar] || []
      return { success: true, message: `${data.operation} ${Array.isArray(src) ? src.length : 0} ${i18n('rule.exec.items')}` }
    }

    // === 消息通知 ===
    case 'msg-push-todo': {
      return { success: true, message: `${i18n('rule.exec.push')}${data.pushType} → ${data.targetUsers || '?'}: ${data.title || ''}` }
    }
    case 'msg-alert': {
      const channels = toStringArray(data.channels)
      return { success: true, message: `[${data.alertLevel}] ${data.title} → ${channels.join(',') || '?'}` }
    }
    case 'msg-log': {
      const fields = toStringArray(data.fields)
      return { success: true, message: `${i18n('rule.exec.writeLog')}${data.logType}: ${fields.length}${i18n('rule.exec.fields')}` }
    }

    // === 外部集成 ===
    case 'ext-http-call': {
      if (data.responseVar) context[data.responseVar] = { simulated: true }
      return { success: true, message: `${data.method} ${data.url} → ${data.responseVar}` }
    }
    case 'ext-sp-call': {
      if (data.resultVar) context[data.resultVar] = { simulated: true }
      return { success: true, message: `SP: ${data.spName} → ${data.resultVar}` }
    }
    case 'ext-mq-send': {
      return { success: true, message: `${i18n('rule.exec.mqSend')} → ${data.queueName}` }
    }
    case 'ext-file-export': {
      return { success: true, message: `${i18n('rule.exec.export')}${data.exportType}: ${data.fileName || '?'}` }
    }

    // === 异常控制 ===
    case 'ctrl-degrade': {
      return { success: true, message: `${i18n('rule.exec.degradeStrategy')}: ${data.degradeCondition}(${data.threshold}ms)` }
    }
    case 'ctrl-rollback': {
      const fields = toStringArray(data.rollbackFields)
      fields.forEach((f: string) => { context[f] = '' })
      return { success: true, message: `${i18n('rule.exec.rollback')} ${fields.length} ${i18n('rule.exec.fields')}` }
    }
    case 'ctrl-catch': {
      const types = toStringArray(data.catchTypes)
      return { success: true, message: `${i18n('rule.exec.exceptionCatch')}: ${types.join(',')}` }
    }
    case 'ctrl-terminate': {
      return { success: false, message: `${i18n('rule.exec.ruleTerminate')}[${data.terminateLevel}]: ${data.message}`, terminate: true }
    }
    case 'ctrl-delay': {
      return { success: true, message: `${i18n('rule.exec.delay')} ${data.delayValue}${data.delayUnit}` }
    }

    // === 权限审计 ===
    case 'sec-desensitize': {
      const fields = toStringArray(data.fields)
      fields.forEach((f: string) => {
        const v = String(context[f] || '')
        context[f] = v.length > 4 ? v.slice(0, 3) + '****' + v.slice(-1) : '****'
      })
      return { success: true, message: `${i18n('rule.exec.desensitize')} ${fields.length} ${i18n('rule.exec.fields')} (${data.desensitizeType})` }
    }
    case 'sec-audit-trail': {
      const fields = toStringArray(data.fields)
      return { success: true, message: `${i18n('rule.exec.auditRecord')}: ${data.auditType} (${fields.length}${i18n('rule.exec.fields')})` }
    }
    case 'sec-row-filter': {
      return { success: true, message: `${i18n('rule.exec.rowPermissionFilter')}(${data.filterBy}) → ${data.targetVar}` }
    }

    // === 子规则 ===
    case 'subrule-call': {
      let subCtx: any = {}
      try {
        if (data.inputMapping) subCtx = typeof data.inputMapping === 'string' ? JSON.parse(data.inputMapping) : data.inputMapping
      } catch { /* ignore */ }
      Object.keys(subCtx).forEach(k => { subCtx[k] = context[subCtx[k]] ?? subCtx[k] })
      const mockResult = { success: true, code: data.subRuleCode, data: subCtx }
      let outMap: any = {}
      try {
        if (data.outputMapping) outMap = typeof data.outputMapping === 'string' ? JSON.parse(data.outputMapping) : data.outputMapping
      } catch { /* ignore */ }
      Object.keys(outMap).forEach(k => { context[outMap[k]] = mockResult[k] ?? mockResult.data?.[k] })
      return { success: true, message: `${i18n('rule.exec.callSubRule')}: ${data.subRuleName || data.subRuleCode}(${i18n('rule.exec.inputParams')}${Object.keys(subCtx).length}${i18n('rule.exec.items')}→${i18n('rule.exec.outputParams')}${Object.keys(outMap).length}${i18n('rule.exec.items')})` }
    }
    case 'subrule-version': {
      return { success: true, message: `${i18n('rule.exec.versionSwitch')}: ${data.ruleCode} (${data.versionType})` }
    }
    case 'subrule-gray': {
      return { success: true, message: `${i18n('rule.exec.gray')}: ${data.grayStrategy} ${data.grayPercent}%` }
    }

    default:
      return { success: true, message: `${i18n('rule.exec.executeNode')}: ${type}` }
  }
}

const getNodeName = (node: ExecutionNode): string => {
  switch (node.type) {
    case 'start': return i18n('rule.node.start')
    case 'end': return i18n('rule.node.end')
    case 'condition': return i18n('rule.node.condition')
    case 'action': return i18n('rule.node.action')
    case 'exclusive-gateway': return node.data.name || i18n('rule.node.exclusiveGateway')
    case 'parallel-gateway': return node.data.name || i18n('rule.node.parallelGateway')
    case 'inclusive-gateway': return node.data.name || i18n('rule.node.inclusiveGateway')
    case 'variable-assign': return i18n('rule.node.variableAssign')
    case 'script': return i18n('rule.node.script')
    case 'http-call': return i18n('rule.node.httpCall')
    case 'rule-set-ref': return `${i18n('rule.node.ruleSetRef')}: ${node.data.ruleSetName || ''}`
    case 'loop': return i18n('rule.node.loop')
    case 'generic': {
      const labels: Record<string, string> = {
        'context-extract': i18n('rule.node.contextExtract'), 'type-cast': i18n('rule.node.typeCast'), 'dataset-load': i18n('rule.node.datasetLoad'), 'datasource-fetch': i18n('rule.node.datasourceFetch'),
        'cond-multibranch': i18n('rule.node.multiBranch'), 'cond-set-contains': i18n('rule.node.setContains'), 'cond-dirty-check': i18n('rule.node.dirtyCheck'), 'cond-time-window': i18n('rule.node.timeWindow'), 'cond-unique': i18n('rule.node.uniqueCheck'), 'cond-threshold': i18n('rule.node.threshold'),
        'loop-iterate': i18n('rule.node.loopIterate'), 'loop-aggregate': i18n('rule.node.loopAggregate'), 'loop-filter': i18n('rule.node.loopFilter'), 'loop-break': i18n('rule.node.loopBreak'),
        'calc-money': i18n('rule.node.calcMoney'), 'calc-date': i18n('rule.node.calcDate'), 'calc-string': i18n('rule.node.calcString'), 'calc-dict-map': i18n('rule.node.calcDictMap'), 'calc-ratio': i18n('rule.node.calcRatio'),
        'action-assign': i18n('rule.node.actionAssign'), 'action-mark': i18n('rule.node.actionMark'), 'action-filter-output': i18n('rule.node.actionFilterOutput'), 'action-split-merge': i18n('rule.node.actionSplitMerge'),
        'msg-push-todo': i18n('rule.node.msgPushTodo'), 'msg-alert': i18n('rule.node.msgAlert'), 'msg-log': i18n('rule.node.msgLog'),
        'ext-http-call': i18n('rule.node.extHttpCall'), 'ext-sp-call': i18n('rule.node.extSpCall'), 'ext-mq-send': i18n('rule.node.extMqSend'), 'ext-file-export': i18n('rule.node.extFileExport'),
        'ctrl-degrade': i18n('rule.node.ctrlDegrade'), 'ctrl-rollback': i18n('rule.node.ctrlRollback'), 'ctrl-catch': i18n('rule.node.ctrlCatch'), 'ctrl-terminate': i18n('rule.node.ctrlTerminate'), 'ctrl-delay': i18n('rule.node.ctrlDelay'),
        'sec-desensitize': i18n('rule.node.secDesensitize'), 'sec-audit-trail': i18n('rule.node.secAuditTrail'), 'sec-row-filter': i18n('rule.node.secRowFilter'),
        'subrule-call': i18n('rule.node.subruleCall'), 'subrule-version': i18n('rule.node.subruleVersion'), 'subrule-gray': i18n('rule.node.subruleGray'),
      }
      return labels[node.data?.__nodeType] || node.data?.__nodeType || i18n('rule.node.genericNode')
    }
    default: return node.type
  }
}
