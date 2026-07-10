<template>
  <div class="condition-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">条件判断</span>
        <el-tag  :type="data.logic === 'OR' ? 'warning' : 'primary'" class="logic-tag">
          {{ data.logic || 'AND' }}
        </el-tag>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.conditions || data.conditions.length === 0" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>双击或点击 + 添加条件</span>
        </div>
        <div v-else class="condition-list">
          <div
            v-for="(cond, index) in data.conditions"
            :key="index"
            class="condition-item"
          >
            <div class="logic-badge" v-if="index > 0 && data.logic">
              {{ data.logic }}
            </div>
            <div class="cond-content">
              <span class="cond-field">{{ cond.fieldLabel || cond.fieldName || '字段' }}</span>
              <span class="cond-operator">{{ getOperatorSymbol(cond.operator) }}</span>
              <span class="cond-value">{{ cond.valueType === 'VARIABLE' ? cond.valueField : cond.value || '-' }}</span>
            </div>
            <div class="cond-actions">
              <el-button type="primary" link  @click.stop="$emit('editCondition', index)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link  @click.stop="$emit('deleteCondition', index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import { Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'

defineProps<{
  data: {
    conditions: any[]
    logic: string
  }
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'editCondition', index: number): void
  (e: 'deleteCondition', index: number): void
}>()

const getOperatorSymbol = (op: string) => {
  const map: Record<string, string> = {
    EQ: '=',
    NEQ: '≠',
    GT: '>',
    GTE: '≥',
    LT: '<',
    LTE: '≤',
    CONTAINS: '包含',
    NOT_CONTAINS: '不包含',
    STARTS_WITH: '开头',
    ENDS_WITH: '结尾',
    IN: '∈',
    NOT_IN: '∉',
    IS_NULL: '为空',
    IS_NOT_NULL: '不为空',
    BETWEEN: '介于'
  }
  return map[op] || op
}
</script>

<style scoped lang="scss">
.condition-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #3b82f6;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;

    .header-icon {
      width: 18px;
      height: 18px;
    }

    .header-title {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
    }

    .logic-tag {
      font-size: 11px;
      font-weight: 700;
    }

    .header-btn {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;

      &:hover {
        color: #fff;
      }
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

    .condition-list {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .condition-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #eff6ff;
        border-radius: 6px;
        border: 1px solid #bfdbfe;
        transition: all 0.2s;

        &:hover {
          border-color: #3b82f6;
          background: #dbeafe;
        }

        .logic-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 1px 8px;
          background: #3b82f6;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 8px;
          line-height: 16px;
        }

        .cond-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          min-width: 0;

          .cond-field {
            color: #1e40af;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .cond-operator {
            color: #64748b;
            flex-shrink: 0;
          }

          .cond-value {
            color: #334155;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .cond-actions {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
