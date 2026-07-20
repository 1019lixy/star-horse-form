<template>
  <div class="action-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.action') }}</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.actions || data.actions.length === 0" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.actionEmptyTip') }}</span>
        </div>
        <div v-else class="action-list">
          <div
            v-for="(action, index) in data.actions"
            :key="index"
            class="action-item"
          >
            <div class="action-index">{{ index + 1 }}</div>
            <div class="action-content">
              <el-tag  :type="getActionTagType(action.actionType)" class="action-type-tag">
                {{ getActionTypeName(action.actionType) }}
              </el-tag>
              <span class="action-target" v-if="action.targetField">{{ action.targetField }}</span>
              <span class="action-value" v-if="action.actionValue && needsValueDisplay(action.actionType)">
                = {{ action.actionValue }}
              </span>
            </div>
            <div class="action-ops">
              <el-button type="primary" link  @click.stop="$emit('editAction', index)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button type="danger" link  @click.stop="$emit('deleteAction', index)">
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
    actions: any[]
  }
}>()

defineEmits<{
  (e: 'edit'): void
  (e: 'editAction', index: number): void
  (e: 'deleteAction', index: number): void
}>()

const getActionTypeName = (type: string) => {
  const map: Record<string, string> = {
    SHOW: i18n('rule.opt.showField'),
    HIDE: i18n('rule.opt.hideField'),
    ENABLE: i18n('rule.opt.setEnabled'),
    DISABLE: i18n('rule.opt.setDisabled'),
    SET_VALUE: i18n('rule.opt.setValue'),
    CLEAR_VALUE: i18n('rule.opt.clearValue'),
    VALIDATE: i18n('rule.opt.validate'),
    SHOW_MESSAGE: i18n('rule.opt.showMessage'),
    HIDE_MESSAGE: i18n('rule.opt.hideMessage'),
    CALL_API: i18n('rule.opt.callApi'),
    EXECUTE_SCRIPT: i18n('rule.opt.executeScript')
  }
  return map[type] || type
}

const getActionTagType = (type: string) => {
  const map: Record<string, string> = {
    SHOW: 'success',
    HIDE: 'info',
    ENABLE: 'success',
    DISABLE: 'info',
    SET_VALUE: 'warning',
    CLEAR_VALUE: 'info',
    VALIDATE: 'danger',
    SHOW_MESSAGE: '',
    HIDE_MESSAGE: 'info',
    CALL_API: 'primary',
    EXECUTE_SCRIPT: 'warning'
  }
  return map[type] || 'info'
}

const needsValueDisplay = (type: string) => {
  return ['SET_VALUE', 'VALIDATE'].includes(type)
}
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.action-node {
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
    background: rgba(5, 150, 105, 0.08);
    color: $rd-node-action;
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
      color: $rd-node-action;
      font-size: $rd-font-lg;

      &:hover {
        color: $rd-node-action;
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

    .action-list {
      display: flex;
      flex-direction: column;
      gap: $rd-space-2;

      .action-item {
        display: flex;
        align-items: center;
        gap: $rd-space-2;
        padding: $rd-space-2 $rd-space-3;
        background: rgba(5, 150, 105, 0.05);
        border-radius: $rd-radius-md;
        border: 1px solid rgba(5, 150, 105, 0.12);
        transition: background $rd-transition-fast, border-color $rd-transition-fast;

        &:hover {
          border-color: rgba(5, 150, 105, 0.24);
          background: rgba(5, 150, 105, 0.09);
        }

        .action-index {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: $rd-node-action;
          color: $rd-text-inverse;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: $rd-font-xs;
          font-weight: $rd-font-weight-semibold;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: $rd-space-2;
          font-size: $rd-font-sm;
          min-width: 0;

          .action-type-tag {
            flex-shrink: 0;
          }

          .action-target {
            color: $rd-node-action;
            font-weight: $rd-font-weight-medium;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .action-value {
            color: $rd-text-secondary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .action-ops {
          display: flex;
          gap: $rd-space-1;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
