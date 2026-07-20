<template>
  <div class="http-call-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.httpCall') }}</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.url" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.httpEmptyTip') }}</span>
        </div>
        <div v-else class="http-content">
          <div class="http-line">
            <el-tag  :type="getMethodTagType(data.method)" class="method-tag">
              {{ data.method || 'GET' }}
            </el-tag>
            <span class="http-url">{{ data.url }}</span>
          </div>
          <div v-if="hasExtra" class="http-extra">
            <span v-if="data.headers && data.headers.length" class="extra-item">
              Headers: {{ data.headers.length }}
            </span>
            <span v-if="data.params && data.params.length" class="extra-item">
              Params: {{ data.params.length }}
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
    method?: string
    url?: string
    headers?: any[]
    params?: any[]
  }
}>()

defineEmits<{
  (e: 'edit'): void
}>()

const getMethodTagType = (method: string) => {
  const map: Record<string, string> = {
    GET: 'success',
    POST: 'warning',
    PUT: 'warning',
    PATCH: 'primary',
    DELETE: 'danger'
  }
  return map[(method || 'GET').toUpperCase()] || 'info'
}

const hasExtra = computed(() => {
  const d = props.data
  return (d?.headers && d.headers.length > 0) || (d?.params && d.params.length > 0)
})
</script>

<style scoped lang="scss">
@use '../styles/design-tokens.scss' as tokens;
.http-call-node {
  .node-card {
    min-width: tokens.$rd-node-min-width;
    max-width: tokens.$rd-node-max-width;
    background: tokens.$rd-bg-surface;
    border: 1px solid tokens.$rd-border;
    border-radius: tokens.$rd-radius-lg;
    box-shadow: tokens.$rd-shadow-xs;
    overflow: hidden;
    transition: box-shadow tokens.$rd-transition-base, border-color tokens.$rd-transition-base;

    &:hover {
      border-color: tokens.$rd-primary-border;
      box-shadow: tokens.$rd-shadow-sm;
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: tokens.$rd-space-2;
    padding: tokens.$rd-space-3 tokens.$rd-space-4;
    background: rgba(14, 165, 233, 0.08);
    color: tokens.$rd-node-business;
    border-bottom: 1px solid tokens.$rd-divider;

    .header-icon {
      width: 16px;
      height: 16px;
    }

    .header-title {
      flex: 1;
      font-size: tokens.$rd-font-base;
      font-weight: tokens.$rd-font-weight-semibold;
    }

    .header-btn {
      color: tokens.$rd-node-business;
      font-size: tokens.$rd-font-md;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .node-body {
    padding: tokens.$rd-space-3 tokens.$rd-space-4;
    min-height: 40px;

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: tokens.$rd-space-2;
      padding: tokens.$rd-space-3 0;
      color: tokens.$rd-text-tertiary;
      font-size: tokens.$rd-font-sm;

      .empty-icon {
        font-size: tokens.$rd-font-md;
      }
    }

    .http-content {
      display: flex;
      flex-direction: column;
      gap: tokens.$rd-space-2;

      .http-line {
        display: flex;
        align-items: center;
        gap: tokens.$rd-space-2;
        padding: tokens.$rd-space-2 tokens.$rd-space-3;
        background: tokens.$rd-bg-subtle;
        border-radius: tokens.$rd-radius-md;
        border: 1px solid tokens.$rd-divider;

        .method-tag {
          flex-shrink: 0;
          font-weight: tokens.$rd-font-weight-bold;
          font-size: tokens.$rd-font-xs;
        }

        .http-url {
          flex: 1;
          font-size: tokens.$rd-font-sm;
          color: tokens.$rd-text-primary;
          font-weight: tokens.$rd-font-weight-medium;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }

      .http-extra {
        display: flex;
        gap: tokens.$rd-space-3;
        padding: 0 tokens.$rd-space-1;

        .extra-item {
          font-size: tokens.$rd-font-xs;
          color: tokens.$rd-text-secondary;
        }
      }
    }
  }
}
</style>
