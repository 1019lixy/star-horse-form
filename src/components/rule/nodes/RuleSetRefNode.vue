<template>
  <div class="rule-set-ref-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.ruleSetRef') }}</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.ruleSetName && !data.ruleSetCode" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.ruleSetRefEmptyTip') }}</span>
        </div>
        <div v-else class="ref-content">
          <div class="ref-name">
            <el-icon class="ref-icon"><Link /></el-icon>
            <span class="ref-text">{{ data.ruleSetName || i18n('rule.msg.unnamedRuleSet') }}</span>
          </div>
          <div v-if="data.ruleSetCode" class="ref-code">
            {{ i18n('rule.lbl.code') }}: {{ data.ruleSetCode }}
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '../compat'
import { Edit, InfoFilled, Link } from '@element-plus/icons-vue'
import { i18n } from '@/lang'

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
@import '../styles/design-tokens.scss';

.rule-set-ref-node {
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
    background: rgba(79, 70, 229, 0.08);
    color: $rd-node-join;
    border-bottom: 1px solid $rd-divider;

    .header-icon {
      width: 16px;
      height: 16px;
    }

    .header-title {
      flex: 1;
      font-size: $rd-font-base;
      font-weight: $rd-font-weight-semibold;
    }

    .header-btn {
      color: $rd-node-join;
      font-size: $rd-font-md;

      &:hover {
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

    .ref-content {
      display: flex;
      flex-direction: column;
      gap: $rd-space-1;
      padding: $rd-space-2 $rd-space-3;
      background: $rd-bg-subtle;
      border-radius: $rd-radius-md;
      border: 1px solid $rd-divider;

      .ref-name {
        display: flex;
        align-items: center;
        gap: $rd-space-2;

        .ref-icon {
          font-size: $rd-font-md;
          color: $rd-node-join;
          flex-shrink: 0;
        }

        .ref-text {
          font-size: $rd-font-base;
          font-weight: $rd-font-weight-semibold;
          color: $rd-text-primary;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .ref-code {
        font-size: $rd-font-xs;
        color: $rd-text-secondary;
        font-family: 'Consolas', 'Monaco', monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
