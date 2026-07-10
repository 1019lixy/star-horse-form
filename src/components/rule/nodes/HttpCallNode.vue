<template>
  <div class="http-call-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">HTTP调用</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.url" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>双击配置请求</span>
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
import { Position, Handle } from '@vue-flow/core'
import { Edit, InfoFilled } from '@element-plus/icons-vue'
import { computed } from 'vue'

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
.http-call-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #0ea5e9;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(14, 165, 233, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
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

    .http-content {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .http-line {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #f0f9ff;
        border-radius: 6px;
        border: 1px solid #bae6fd;

        .method-tag {
          flex-shrink: 0;
          font-weight: 700;
          font-size: 11px;
        }

        .http-url {
          flex: 1;
          font-size: 12px;
          color: #075985;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: 'Consolas', 'Monaco', monospace;
        }
      }

      .http-extra {
        display: flex;
        gap: 10px;
        padding: 0 4px;

        .extra-item {
          font-size: 11px;
          color: #64748b;
        }
      }
    }
  }
}
</style>
