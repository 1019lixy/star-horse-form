<template>
  <div class="decision-table-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <span class="header-icon">📊</span>
        <span class="header-title">{{ data.tableName || i18n('rule.node.decisionTable') }}</span>
      </div>
      <div class="node-body">
        <div v-if="!data.conditions || data.conditions.length === 0" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.decisionTableEmptyTip') }}</span>
        </div>
        <div v-else class="table-summary">
          <div class="summary-row">
            <span class="row-label">{{ i18n('rule.lbl.conditionColumns') }}:</span>
            <span class="row-value">{{ data.conditions.length }}{{ i18n('rule.lbl.columnCount') }}</span>
          </div>
          <div class="summary-row">
            <span class="row-label">{{ i18n('rule.lbl.actionColumns') }}:</span>
            <span class="row-value">{{ data.actions?.length || 0 }}{{ i18n('rule.lbl.columnCount') }}</span>
          </div>
          <div class="summary-row">
            <span class="row-label">{{ i18n('rule.lbl.ruleRows') }}:</span>
            <span class="row-value">{{ data.rules?.length || 0 }}{{ i18n('rule.lbl.rowCount') }}</span>
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '../compat'
import { InfoFilled } from '@element-plus/icons-vue'
import { i18n } from '@/lang'

defineProps<{
  id?: string
  data: {
    tableName?: string
    conditions?: any[]
    actions?: any[]
    rules?: any[]
  }
}>()
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.decision-table-node {
  .node-card {
    min-width: $rd-node-min-width;
    max-width: $rd-node-max-width;
    background: $rd-bg-surface;
    border: 1px solid $rd-border;
    border-radius: $rd-radius-lg;
    box-shadow: $rd-shadow-xs;
    overflow: hidden;
    transition: box-shadow $rd-transition-base, border-color $rd-transition-base;

    &:hover {
      border-color: $rd-primary-border;
      box-shadow: $rd-shadow-sm;
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: $rd-space-2;
    padding: $rd-space-3 $rd-space-4;
    background: rgba(37, 99, 235, 0.08);
    color: $rd-node-condition;
    border-bottom: 1px solid $rd-divider;

    .header-icon {
      font-size: $rd-font-md;
    }

    .header-title {
      flex: 1;
      font-size: $rd-font-base;
      font-weight: $rd-font-weight-semibold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .node-body {
    padding: $rd-space-3 $rd-space-4;
    min-height: 40px;

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $rd-space-2;
      padding: $rd-space-3 0;
      color: $rd-text-tertiary;
      font-size: $rd-font-sm;

      .empty-icon {
        font-size: $rd-font-md;
      }
    }

    .table-summary {
      display: flex;
      flex-direction: column;
      gap: $rd-space-2;

      .summary-row {
        display: flex;
        align-items: center;
        gap: $rd-space-2;
        font-size: $rd-font-sm;
        padding: $rd-space-2 $rd-space-3;
        background: $rd-bg-subtle;
        border-radius: $rd-radius-md;
        border: 1px solid $rd-divider;

        .row-label {
          color: $rd-text-secondary;
          flex-shrink: 0;
          font-weight: $rd-font-weight-medium;
        }

        .row-value {
          color: $rd-text-primary;
          font-weight: $rd-font-weight-semibold;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }
    }
  }
}
</style>
