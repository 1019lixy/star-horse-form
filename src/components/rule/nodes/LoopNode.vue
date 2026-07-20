<template>
  <div class="loop-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 2l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v1a4 4 0 0 1-4 4H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.loop') }}</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.collectionVar" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.loopEmptyTip') }}</span>
        </div>
        <div v-else class="loop-content">
          <div class="loop-row">
            <span class="row-label">{{ i18n('rule.lbl.collectionVar') }}:</span>
            <span class="row-value collection">{{ data.collectionVar }}</span>
          </div>
          <div v-if="data.itemVar || data.indexVar" class="loop-row sub">
            <span v-if="data.itemVar" class="var-item">
              {{ i18n('rule.lbl.itemVar') }}: <span class="var-text">{{ data.itemVar }}</span>
            </span>
            <span v-if="data.indexVar" class="var-item">
              {{ i18n('rule.lbl.indexVar') }}: <span class="var-text">{{ data.indexVar }}</span>
            </span>
          </div>
          <div class="loop-row">
            <span class="row-label">{{ i18n('rule.lbl.execute') }}:</span>
            <span class="row-value action-count">
              {{ actionCount }} {{ i18n('rule.lbl.actionCount') }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '../compat'
import { Edit, InfoFilled } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { i18n } from '@/lang'

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
@import '../styles/design-tokens.scss';

.loop-node {
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
    background: rgba(219, 39, 119, 0.08);
    color: $rd-node-loop;
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
      color: $rd-node-loop;
      font-size: $rd-font-lg;

      &:hover {
        color: $rd-node-loop;
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

    .loop-content {
      display: flex;
      flex-direction: column;
      gap: $rd-space-2;

      .loop-row {
        display: flex;
        align-items: center;
        gap: $rd-space-2;
        font-size: $rd-font-sm;
        padding: $rd-space-2 $rd-space-3;
        background: rgba(219, 39, 119, 0.05);
        border-radius: $rd-radius-md;
        border: 1px solid rgba(219, 39, 119, 0.12);

        &.sub {
          background: transparent;
          border: none;
          padding: 0 $rd-space-3;
          flex-wrap: wrap;
          gap: $rd-space-3;
        }

        .row-label {
          color: $rd-text-tertiary;
          flex-shrink: 0;
          font-weight: $rd-font-weight-medium;
        }

        .row-value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;

          &.collection {
            color: $rd-node-loop;
            font-weight: $rd-font-weight-semibold;
            font-family: 'Consolas', 'Monaco', monospace;
          }

          &.action-count {
            color: $rd-node-loop;
            font-weight: $rd-font-weight-semibold;
          }
        }

        .var-item {
          color: $rd-text-tertiary;
          font-size: $rd-font-xs;

          .var-text {
            color: $rd-node-loop;
            font-family: 'Consolas', 'Monaco', monospace;
          }
        }
      }
    }
  }
}
</style>
