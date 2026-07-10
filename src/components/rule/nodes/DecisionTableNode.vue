<template>
  <div class="decision-table-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <span class="header-icon">📊</span>
        <span class="header-title">{{ data.tableName || '决策表' }}</span>
      </div>
      <div class="node-body">
        <div v-if="!data.conditions || data.conditions.length === 0" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>双击配置决策表</span>
        </div>
        <div v-else class="table-summary">
          <div class="summary-row">
            <span class="row-label">条件列:</span>
            <span class="row-value">{{ data.conditions.length }}列</span>
          </div>
          <div class="summary-row">
            <span class="row-label">动作列:</span>
            <span class="row-value">{{ data.actions?.length || 0 }}列</span>
          </div>
          <div class="summary-row">
            <span class="row-label">规则行:</span>
            <span class="row-value">{{ data.rules?.length || 0 }}行</span>
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import { InfoFilled } from '@element-plus/icons-vue'

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
.decision-table-node {
  .node-card {
    min-width: 240px;
    max-width: 320px;
    background: #fff;
    border: 2px solid #10b981;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;

    .header-icon {
      font-size: 16px;
    }

    .header-title {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .node-body {
    padding: 12px 14px;
    min-height: 40px;

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 0;
      color: #94a3b8;
      font-size: 12px;

      .empty-icon {
        font-size: 14px;
      }
    }

    .table-summary {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .summary-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        padding: 6px 10px;
        background: #f0fdf4;
        border-radius: 6px;
        border: 1px solid #bbf7d0;

        .row-label {
          color: #64748b;
          flex-shrink: 0;
          font-weight: 500;
        }

        .row-value {
          color: #059669;
          font-weight: 600;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }
    }
  }
}
</style>
