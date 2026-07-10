<template>
  <div class="loop-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">循环执行</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.collectionVar" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>双击配置循环</span>
        </div>
        <div v-else class="loop-content">
          <div class="loop-row">
            <span class="row-label">遍历:</span>
            <span class="row-value collection">{{ data.collectionVar }}</span>
          </div>
          <div v-if="data.itemVar || data.indexVar" class="loop-row sub">
            <span v-if="data.itemVar" class="var-item">
              项变量: <span class="var-text">{{ data.itemVar }}</span>
            </span>
            <span v-if="data.indexVar" class="var-item">
              索引: <span class="var-text">{{ data.indexVar }}</span>
            </span>
          </div>
          <div class="loop-row">
            <span class="row-label">执行:</span>
            <span class="row-value action-count">
              {{ actionCount }} 个动作
            </span>
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import { Edit, InfoFilled } from '@element-plus/icons-vue'
import { computed } from 'vue'

const props = defineProps<{
  id?: string
  data: {
    collectionVar?: string
    itemVar?: string
    indexVar?: string
    actions?: any[]
  }
}>()

defineEmits<{
  (e: 'edit'): void
}>()

const actionCount = computed(() => {
  const actions = props.data?.actions
  return actions && actions.length ? actions.length : 0
})
</script>

<style scoped lang="scss">
.loop-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #ec4899;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(236, 72, 153, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
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

    .loop-content {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .loop-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        padding: 6px 10px;
        background: #fdf2f8;
        border-radius: 6px;
        border: 1px solid #fbcfe8;

        &.sub {
          background: transparent;
          border: none;
          padding: 0 10px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .row-label {
          color: #64748b;
          flex-shrink: 0;
          font-weight: 500;
        }

        .row-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &.collection {
            color: #be185d;
            font-weight: 600;
            font-family: 'Consolas', 'Monaco', monospace;
          }

          &.action-count {
            color: #9d174d;
            font-weight: 600;
          }
        }

        .var-item {
          color: #64748b;
          font-size: 11px;

          .var-text {
            color: #be185d;
            font-family: 'Consolas', 'Monaco', monospace;
          }
        }
      }
    }
  }
}
</style>
