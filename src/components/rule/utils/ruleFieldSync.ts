/**
 * 规则字段引用同步工具
 *
 * 当用户在表单设计器中修改字段名（preps.name）时，需要同步更新所有引用了该字段的规则。
 * 否则规则会出现"僵尸属性"——引用了已重命名/已删除的字段。
 *
 * 设计：
 * 1. replaceFieldRefsInFlow - 纯函数，在 flowContent 对象中原地替换字段名引用
 *    覆盖：condition.fieldName、action.targetField、assignment.targetField、
 *         paramSchema.fieldSelect 字段、表格列 fieldSelect
 * 2. syncRuleFieldReferences - 异步函数，拉取表单绑定的所有规则并批量同步
 * 3. 批量版本 syncRuleFieldReferencesBatch - 支持一次同步多个字段重命名（如批量编辑场景）
 *
 * 与 validator.ts 的 checkFieldRef 保持字段引用识别口径一致：
 * - 跳过 ${...} 表达式占位符和 =formula 形式
 * - 仅替换精确匹配的字段名
 */
import { ruleDefinitionApi } from '@/api/rule_engine_api'
import { NODE_TYPE_MAP } from '../nodeTypes'

/**
 * 判断字段引用是否为纯字段名（非表达式）
 * 与 validator.ts checkFieldRef 的跳过逻辑保持一致
 */
const isPlainFieldRef = (v: any): boolean => {
  if (!v || typeof v !== 'string') return false
  if (v.startsWith('${') || v.startsWith('=')) return false
  return true
}

/**
 * 在规则流程内容中替换字段名引用（原地修改）
 * @param flowContent 规则的 flowContent 对象 { nodes, edges, variables }
 * @param oldName 旧字段名
 * @param newName 新字段名
 * @returns 替换的字段引用数量
 */
export const replaceFieldRefsInFlow = (
  flowContent: any,
  oldName: string,
  newName: string,
): number => {
  if (!flowContent || !oldName || !newName || oldName === newName) return 0
  let count = 0

  const nodes: any[] = flowContent.nodes || []
  for (const node of nodes) {
    if (!node.data) continue
    const data = node.data
    const type = node.type

    // condition 节点：替换 conditions[].fieldName
    if (type === 'condition' && Array.isArray(data.conditions)) {
      for (const c of data.conditions) {
        if (isPlainFieldRef(c.fieldName) && c.fieldName === oldName) {
          c.fieldName = newName
          count++
        }
      }
      continue
    }

    // action 节点：替换 actions[].targetField（SHOW_MESSAGE 不针对字段，跳过）
    if (type === 'action' && Array.isArray(data.actions)) {
      for (const a of data.actions) {
        if (a.actionType === 'SHOW_MESSAGE') continue
        if (isPlainFieldRef(a.targetField) && a.targetField === oldName) {
          a.targetField = newName
          count++
        }
      }
      continue
    }

    // variable-assign / action-assign：替换 assignments[].targetField
    if ((type === 'variable-assign' || type === 'action-assign') && Array.isArray(data.assignments)) {
      for (const a of data.assignments) {
        if (isPlainFieldRef(a.targetField) && a.targetField === oldName) {
          a.targetField = newName
          count++
        }
      }
      continue
    }

    // 通用节点：基于 paramSchema 替换 fieldSelect 字段和表格列
    const def = NODE_TYPE_MAP[type]
    if (def && Array.isArray(def.paramSchema)) {
      for (const f of def.paramSchema) {
        // fieldSelect 标记的字段
        if (f.fieldSelect && isPlainFieldRef(data[f.name]) && data[f.name] === oldName) {
          data[f.name] = newName
          count++
        }
        // 表格类型：遍历行，替换 fieldSelect 列
        if (f.type === 'table' && Array.isArray(f.columns) && Array.isArray(data[f.name])) {
          for (const row of data[f.name]) {
            if (!row || typeof row !== 'object') continue
            for (const col of f.columns) {
              if (col.fieldSelect && isPlainFieldRef(row[col.prop]) && row[col.prop] === oldName) {
                row[col.prop] = newName
                count++
              }
            }
          }
        }
      }
    }
  }

  return count
}

/**
 * 解析规则的 flowContent（可能是字符串或对象）
 */
const parseFlowContent = (raw: any): any | null => {
  if (!raw) return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
  return null
}

export interface SyncResult {
  /** 受影响的规则数量 */
  affectedRules: number
  /** 总替换次数 */
  totalReplacements: number
  /** 失败的规则及原因 */
  failures: Array<{ ruleId: string; ruleName: string; error: string }>
}

/**
 * 同步单个字段名变更到表单绑定的所有规则
 * @param formId 表单ID
 * @param oldName 旧字段名
 * @param newName 新字段名
 * @returns 同步结果
 */
export const syncRuleFieldReferences = async (
  formId: string,
  oldName: string,
  newName: string,
): Promise<SyncResult> => {
  const empty: SyncResult = { affectedRules: 0, totalReplacements: 0, failures: [] }
  if (!formId || !oldName || !newName || oldName === newName) return empty

  let rules: any[] = []
  try {
    const res = await ruleDefinitionApi.listByFormId(formId)
    if (res.data.code !== 200 || !Array.isArray(res.data.data)) return empty
    rules = res.data.data
  } catch (e: any) {
    console.error('[syncRuleFieldReferences] listByFormId failed:', e)
    return empty
  }

  const result: SyncResult = { affectedRules: 0, totalReplacements: 0, failures: [] }

  for (const rule of rules) {
    const flowContent = parseFlowContent(rule.flowContent)
    if (!flowContent) continue

    const replaced = replaceFieldRefsInFlow(flowContent, oldName, newName)
    if (replaced === 0) continue

    try {
      await ruleDefinitionApi.updateRule({
        ...rule,
        flowContent: JSON.stringify(flowContent),
      })
      result.affectedRules++
      result.totalReplacements += replaced
    } catch (e: any) {
      result.failures.push({
        ruleId: rule.idRuleDefinition || rule.id || '',
        ruleName: rule.ruleName || rule.ruleCode || '',
        error: e?.message || String(e),
      })
    }
  }

  return result
}

/**
 * 批量同步多个字段名变更（如批量编辑场景）
 * @param formId 表单ID
 * @param renameMap [{ oldName, newName }, ...]
 * @returns 合并的同步结果
 */
export const syncRuleFieldReferencesBatch = async (
  formId: string,
  renameMap: Array<{ oldName: string; newName: string }>,
): Promise<SyncResult> => {
  const merged: SyncResult = { affectedRules: 0, totalReplacements: 0, failures: [] }
  if (!formId || !renameMap || renameMap.length === 0) return merged

  // 一次性拉取所有规则，避免多次请求
  let rules: any[] = []
  try {
    const res = await ruleDefinitionApi.listByFormId(formId)
    if (res.data.code !== 200 || !Array.isArray(res.data.data)) return merged
    rules = res.data.data
  } catch (e: any) {
    console.error('[syncRuleFieldReferencesBatch] listByFormId failed:', e)
    return merged
  }

  const affectedRuleIds = new Set<string>()

  for (const rule of rules) {
    const flowContent = parseFlowContent(rule.flowContent)
    if (!flowContent) continue

    let totalReplaced = 0
    for (const { oldName, newName } of renameMap) {
      totalReplaced += replaceFieldRefsInFlow(flowContent, oldName, newName)
    }

    if (totalReplaced === 0) continue

    try {
      await ruleDefinitionApi.updateRule({
        ...rule,
        flowContent: JSON.stringify(flowContent),
      })
      affectedRuleIds.add(rule.idRuleDefinition || rule.id || '')
      merged.totalReplacements += totalReplaced
    } catch (e: any) {
      merged.failures.push({
        ruleId: rule.idRuleDefinition || rule.id || '',
        ruleName: rule.ruleName || rule.ruleCode || '',
        error: e?.message || String(e),
      })
    }
  }

  merged.affectedRules = affectedRuleIds.size
  return merged
}
