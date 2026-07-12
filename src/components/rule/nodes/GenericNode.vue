<template>
  <div class="generic-node" :class="{ highlighted: data.__highlighted, dimmed: data.__dimmed }">
    <Handle type="target" :position="Position.Top" class="node-handle" />
    <div class="node-card" :style="{ borderLeftColor: categoryColor }">
      <div class="node-header" :style="{ background: categoryColor + '12' }">
        <span class="node-icon" :style="{ color: categoryColor }">{{ nodeDef?.icon || '⬡' }}</span>
        <span class="node-title">{{ nodeDef?.label || data.__nodeType || i18n('rule.node.unknown') }}</span>
        <span class="node-cat" :style="{ color: categoryColor }">{{ categoryName }}</span>
      </div>
      <div class="node-content">
        <!-- 动态显示关键配置摘要 -->
        <div v-if="summary" class="node-summary">{{ summary }}</div>
        <div v-else class="node-empty">{{ i18n('rule.node.doubleClickEdit') }}</div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" class="node-handle" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NODE_TYPE_MAP, NODE_CATEGORIES, getCategoryColor } from '../nodeTypes'
import { i18n } from '@/lang'

const props = defineProps<{
  id: string
  type: string
  data: any
}>()

// 节点的实际类型存在 data.__nodeType 中（因为Vue Flow的type字段统一为'generic'）
const actualType = computed(() => props.data?.__nodeType || props.type)
const nodeDef = computed(() => NODE_TYPE_MAP[actualType.value])
const categoryColor = computed(() => {
  if (nodeDef.value) {
    const cat = NODE_CATEGORIES.find(c => c.nodes.some(n => n.type === actualType.value))
    return cat?.color || '#64748b'
  }
  return '#64748b'
})
const categoryName = computed(() => {
  const cat = NODE_CATEGORIES.find(c => c.nodes.some(n => n.type === actualType.value))
  return cat?.name || ''
})

// 根据节点类型生成配置摘要
const summary = computed(() => {
  const d = props.data
  if (!d) return ''
  switch (actualType.value) {
    // 数据入参
    case 'context-extract': return `${d.source} → ${d.targetVar || '?'} (${d.fieldPath || '-'})`
    case 'type-cast': return `${d.sourceVar} → ${d.targetType}${d.precision ? ` (${d.precision}${i18n('rule.lbl.precisionUnit')})` : ''}`
    case 'dataset-load': return `${d.source} → ${d.targetVar || '?'}`
    case 'datasource-fetch': return `${d.method} ${d.apiUrl || '?'} → ${d.targetVar || '?'}`
    // 条件判断
    case 'cond-multibranch': return `${d.matchField || '?'} (${d.matchType}) → ${d.branches?.length || 0}${i18n('rule.lbl.branchCount')}`
    case 'cond-set-contains': return `${d.sourceSet} ${d.checkType} ${d.targetSet}`
    case 'cond-dirty-check': return `${d.fields?.length || 0}${i18n('rule.lbl.fieldCount')} (${d.checkRules?.join(',') || '-'})`
    case 'cond-time-window': return `${d.dateField} ${d.windowType}`
    case 'cond-unique': return `${d.fields?.join('+') || '?'} (${d.scope})`
    case 'cond-threshold': return `${d.field} ${d.alertLevel}`
    // 循环
    case 'loop-iterate': return `${d.collectionVar} → ${d.itemVar}[${d.indexVar}]`
    case 'loop-aggregate': return `${d.aggType}(${d.aggField}) → ${d.targetVar}`
    case 'loop-filter': return `${d.collectionVar} → ${d.targetVar}`
    case 'loop-break': return d.breakCondition || i18n('rule.msg.breakOnCondition')
    // 运算
    case 'calc-money': return `${d.operator} → ${d.targetVar} (${d.precision}${i18n('rule.lbl.precisionUnit')},${d.roundMode})`
    case 'calc-date': return `${d.baseDate} +${d.offset}${d.offsetUnit} → ${d.targetVar}`
    case 'calc-string': return `${d.operation} → ${d.targetVar}`
    case 'calc-dict-map': return `${d.sourceVar} [${d.dictCode}] → ${d.targetVar}`
    case 'calc-ratio': return `${d.totalAmount} × ${d.ratioField} → ${d.targetVar}`
    // 动作
    case 'action-assign': return `${d.assignments?.length || 0}${i18n('rule.lbl.itemAssignCount')}`
    case 'action-mark': return `${d.targetField} → ${d.markType}:${d.markValue}`
    case 'action-filter-output': return `${d.sourceVar} → ${d.targetVar}`
    case 'action-split-merge': return `${d.operation} ${d.sourceVar} → ${d.targetVar}`
    // 消息
    case 'msg-push-todo': return `${d.pushType} → ${d.targetUsers || '?'}`
    case 'msg-alert': return `${d.channels?.join(',') || '?'} [${d.alertLevel}]`
    case 'msg-log': return `${d.logType} → ${d.fields?.length || 0}${i18n('rule.lbl.fieldCount')}`
    // 外部集成
    case 'ext-http-call': return `${d.method} ${d.url || '?'} → ${d.responseVar}`
    case 'ext-sp-call': return `SP: ${d.spName} → ${d.resultVar}`
    case 'ext-mq-send': return `MQ → ${d.queueName}`
    case 'ext-file-export': return `${d.exportType} → ${d.fileName || '?'}`
    // 异常控制
    case 'ctrl-degrade': return `${d.degradeCondition}(${d.threshold}ms)`
    case 'ctrl-rollback': return `${d.rollbackScope} (${d.rollbackFields?.length || 0}${i18n('rule.lbl.fieldCount')})`
    case 'ctrl-catch': return `${d.catchTypes?.join(',') || '?'}`
    case 'ctrl-terminate': return `${d.terminateLevel}: ${d.message || ''}`
    case 'ctrl-delay': return `${d.delayValue}${d.delayUnit}`
    // 权限审计
    case 'sec-desensitize': return `${d.fields?.length || 0}${i18n('rule.lbl.fieldCount')} (${d.desensitizeType})`
    case 'sec-audit-trail': return `${d.auditType} (${d.fields?.length || 0}${i18n('rule.lbl.fieldCount')})`
    case 'sec-row-filter': return `${d.filterBy} → ${d.targetVar}`
    // 子规则
    case 'subrule-call': return `${d.subRuleName || d.subRuleCode || '?'}`
    case 'subrule-version': return `${d.ruleCode} (${d.versionType})`
    case 'subrule-gray': return `${d.grayStrategy} ${d.grayPercent}%`
    // 基础节点
    case 'start': return i18n('rule.exec.flowStart')
    case 'end': return i18n('rule.exec.flowEnd')
    case 'condition': return `${d.conditions?.length || 0}${i18n('rule.lbl.conditionCount')} (${d.logic})`
    case 'action': return `${d.actions?.length || 0}${i18n('rule.lbl.actionCount')}`
    case 'variable-assign': return `${d.assignments?.length || 0}${i18n('rule.lbl.itemAssignCount')}`
    default: return ''
  }
})
</script>

<style scoped lang="scss">
.generic-node {
  .node-card {
    width: 240px; background: #fff; border: 1px solid #e2e8f0;
    border-left: 3px solid #64748b; border-radius: 8px; overflow: hidden;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06); transition: box-shadow 0.2s;
    &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  }

  .node-header {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px; border-bottom: 1px solid #f1f5f9;
    .node-icon { font-size: 14px; }
    .node-title { flex: 1; font-size: 12px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .node-cat { font-size: 9px; font-weight: 500; }
  }

  .node-content {
    padding: 6px 10px; min-height: 28px;
    .node-summary {
      font-size: 11px; color: #475569; font-family: 'JetBrains Mono', monospace;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .node-empty { font-size: 11px; color: #cbd5e1; font-style: italic; }
  }

  .node-handle {
    width: 10px; height: 10px; background: #6366f1; border: 2px solid #fff;
    &:hover { background: #4f46e5; }
  }

  &.highlighted .node-card {
    box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16,185,129,0.4);
    animation: node-pulse 1.5s ease-in-out infinite;
  }
  &.dimmed { opacity: 0.3; }
}

@keyframes node-pulse {
  0%, 100% { box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16,185,129,0.4); }
  50% { box-shadow: 0 0 0 5px #10b981, 0 0 30px rgba(16,185,129,0.7); }
}
</style>
