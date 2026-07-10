<template>
  <div class="rule-set-ref-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">规则集引用</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.ruleSetName && !data.ruleSetCode" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>双击选择规则集</span>
        </div>
        <div v-else class="ref-content">
          <div class="ref-name">
            <el-icon class="ref-icon"><Link /></el-icon>
            <span class="ref-text">{{ data.ruleSetName || '未命名规则集' }}</span>
          </div>
          <div v-if="data.ruleSetCode" class="ref-code">
            编码: {{ data.ruleSetCode }}
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import { Edit, InfoFilled, Link } from '@element-plus/icons-vue'

defineProps<{
  id?: string
  data: {
    ruleSetId?: string | number
    ruleSetName?: string
    ruleSetCode?: string
  }
}>()

defineEmits<{
  (e: 'edit'): void
}>()
</script>

<style scoped lang="scss">
.rule-set-ref-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #a855f7;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(168, 85, 247, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
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

    .ref-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 6px 10px;
      background: #faf5ff;
      border-radius: 6px;
      border: 1px solid #e9d5ff;

      .ref-name {
        display: flex;
        align-items: center;
        gap: 6px;

        .ref-icon {
          font-size: 14px;
          color: #a855f7;
          flex-shrink: 0;
        }

        .ref-text {
          font-size: 13px;
          font-weight: 600;
          color: #6b21a8;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .ref-code {
        font-size: 11px;
        color: #7c3aed;
        font-family: 'Consolas', 'Monaco', monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
