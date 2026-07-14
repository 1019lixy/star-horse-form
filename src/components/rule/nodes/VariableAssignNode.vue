<template>
  <div class="variable-assign-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.variableAssign') }}</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.assignments || data.assignments.length === 0" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.varAssignEmptyTip') }}</span>
        </div>
        <div v-else class="assign-list">
          <div
            v-for="(item, index) in data.assignments"
            :key="index"
            class="assign-item"
          >
            <div class="assign-content">
              <span class="assign-var">{{ item.variableName || i18n('rule.lbl.varName') }}</span>
              <span class="assign-eq">=</span>
              <el-tag  :type="item.valueType === 'VARIABLE' ? 'warning' : 'info'" class="assign-type-tag">
                {{ getValueTypeLabel(item.valueType) }}
              </el-tag>
              <span class="assign-value">{{ formatValue(item) }}</span>
            </div>
            <div class="assign-ops">
              <el-button type="primary" link  @click.stop="$emit('editAssignment', index)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link  @click.stop="$emit('deleteAssignment', index)">
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
import { i18n } from '@/lang'

defineProps<{
  id?: string
  data: {
    assignments?: Array<{
      variableName?: string
      valueType?: string
      value?: string
      valueField?: string
    }>
  }
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'editAssignment', index: number): void
  (e: 'deleteAssignment', index: number): void
}>()

const getValueTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    CONSTANT: i18n('rule.opt.constant'),
    VARIABLE: i18n('rule.opt.variable'),
    EXPRESSION: i18n('rule.opt.expression')
  }
  return map[type] || type || i18n('rule.opt.constant')
}

const formatValue = (item: any) => {
  if (item.valueType === 'VARIABLE') {
    return item.valueField || item.value || '-'
  }
  return item.value || '-'
}
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.variable-assign-node {
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
    background: rgba(124, 58, 237, 0.08);
    color: $rd-node-variable;
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

    .header-btn {
      color: $rd-node-variable;
      font-size: $rd-font-lg;

      &:hover {
        color: $rd-node-variable;
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

    .assign-list {
      display: flex;
      flex-direction: column;
      gap: $rd-space-2;

      .assign-item {
        display: flex;
        align-items: center;
        gap: $rd-space-2;
        padding: $rd-space-2 $rd-space-3;
        background: rgba(124, 58, 237, 0.05);
        border-radius: $rd-radius-md;
        border: 1px solid rgba(124, 58, 237, 0.12);
        transition: background $rd-transition-fast, border-color $rd-transition-fast;

        &:hover {
          border-color: rgba(124, 58, 237, 0.24);
          background: rgba(124, 58, 237, 0.09);
        }

        .assign-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: $rd-space-2;
          font-size: $rd-font-sm;
          min-width: 0;

          .assign-var {
            color: $rd-node-variable;
            font-weight: $rd-font-weight-semibold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .assign-eq {
            color: $rd-text-tertiary;
            flex-shrink: 0;
          }

          .assign-type-tag {
            flex-shrink: 0;
          }

          .assign-value {
            color: $rd-text-secondary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .assign-ops {
          display: flex;
          gap: $rd-space-1;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
