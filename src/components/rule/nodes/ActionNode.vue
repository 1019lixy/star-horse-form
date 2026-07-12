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
import { Position, Handle } from '@vue-flow/core'
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
.action-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #22c55e;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
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

    .action-list {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .action-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #f0fdf4;
        border-radius: 6px;
        border: 1px solid #bbf7d0;
        transition: all 0.2s;

        &:hover {
          border-color: #22c55e;
          background: #dcfce7;
        }

        .action-index {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #22c55e;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          min-width: 0;

          .action-type-tag {
            flex-shrink: 0;
          }

          .action-target {
            color: #166534;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .action-value {
            color: #64748b;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .action-ops {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
