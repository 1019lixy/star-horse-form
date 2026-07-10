<template>
  <div class="variable-assign-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">变量赋值</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.assignments || data.assignments.length === 0" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>双击添加变量赋值</span>
        </div>
        <div v-else class="assign-list">
          <div
            v-for="(item, index) in data.assignments"
            :key="index"
            class="assign-item"
          >
            <div class="assign-content">
              <span class="assign-var">{{ item.variableName || '变量' }}</span>
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
    CONSTANT: '常量',
    VARIABLE: '变量',
    EXPRESSION: '表达式'
  }
  return map[type] || type || '常量'
}

const formatValue = (item: any) => {
  if (item.valueType === 'VARIABLE') {
    return item.valueField || item.value || '-'
  }
  return item.value || '-'
}
</script>

<style scoped lang="scss">
.variable-assign-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #f59e0b;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

    .assign-list {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .assign-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #fffbeb;
        border-radius: 6px;
        border: 1px solid #fde68a;
        transition: all 0.2s;

        &:hover {
          border-color: #f59e0b;
          background: #fef3c7;
        }

        .assign-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          min-width: 0;

          .assign-var {
            color: #92400e;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .assign-eq {
            color: #64748b;
            flex-shrink: 0;
          }

          .assign-type-tag {
            flex-shrink: 0;
          }

          .assign-value {
            color: #334155;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .assign-ops {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
