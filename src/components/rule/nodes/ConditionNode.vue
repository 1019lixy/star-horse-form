<template>
  <div class="condition-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.condition') }}</span>
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
          <span>{{ i18n('rule.node.condEmptyTip') }}</span>
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
              <span class="cond-field">{{ cond.fieldLabel || cond.fieldName || i18n('rule.lbl.fieldName') }}</span>
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
import { Position, Handle } from '../compat'
import { Plus, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import { i18n } from '@/lang'

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
    CONTAINS: i18n('rule.opt.contains'),
    NOT_CONTAINS: i18n('rule.opt.notContains'),
    STARTS_WITH: i18n('rule.opt.startsWith'),
    ENDS_WITH: i18n('rule.opt.endsWith'),
    IN: '∈',
    NOT_IN: '∉',
    IS_NULL: i18n('rule.opt.isNull'),
    IS_NOT_NULL: i18n('rule.opt.isNotNull'),
    BETWEEN: i18n('rule.opt.between')
  }
  return map[op] || op
}
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.condition-node {
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
    padding: $rd-space-2 $rd-space-4;
    background: rgba(37, 99, 235, 0.08);
    color: $rd-node-condition;
    border-bottom: 1px solid $rd-divider;

    .header-icon {
      width: 18px;
      height: 18px;
    }

    .header-title {
      flex: 1;
      font-size: $rd-font-base;
      font-weight: $rd-font-weight-semibold;
    }

    .logic-tag {
      font-size: $rd-font-xs;
      font-weight: $rd-font-weight-semibold;
    }

    .header-btn {
      color: $rd-node-condition;
      font-size: $rd-font-lg;

      &:hover {
        color: $rd-node-condition;
        opacity: 0.8;
      }
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

    .condition-list {
      display: flex;
      flex-direction: column;
      gap: $rd-space-2;

      .condition-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: $rd-space-2;
        padding: $rd-space-2 $rd-space-3;
        background: rgba(37, 99, 235, 0.05);
        border-radius: $rd-radius-md;
        border: 1px solid rgba(37, 99, 235, 0.12);
        transition: background $rd-transition-fast, border-color $rd-transition-fast;

        &:hover {
          border-color: rgba(37, 99, 235, 0.24);
          background: rgba(37, 99, 235, 0.09);
        }

        .logic-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 1px $rd-space-2;
          background: $rd-node-condition;
          color: $rd-text-inverse;
          font-size: $rd-font-xs;
          font-weight: $rd-font-weight-semibold;
          border-radius: $rd-radius-pill;
          line-height: 16px;
        }

        .cond-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: $rd-space-2;
          font-size: $rd-font-sm;
          min-width: 0;

          .cond-field {
            color: $rd-node-condition;
            font-weight: $rd-font-weight-semibold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .cond-operator {
            color: $rd-text-tertiary;
            flex-shrink: 0;
          }

          .cond-value {
            color: $rd-text-secondary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .cond-actions {
          display: flex;
          gap: $rd-space-1;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
