<template>
  <div class="script-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card">
      <div class="node-header">
        <svg class="header-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="header-title">{{ i18n('rule.node.script') }}</span>
        <el-button type="primary" link  @click.stop="$emit('edit')" class="header-btn">
          <el-icon><Edit /></el-icon>
        </el-button>
      </div>
      <div class="node-body">
        <div v-if="!data.scriptContent" class="empty-tip">
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n('rule.node.scriptEmptyTip') }}</span>
        </div>
        <div v-else class="script-content">
          <div class="script-meta">
            <el-tag  :type="data.scriptLang === 'typescript' ? 'primary' : 'info'" class="lang-tag">
              {{ getLangLabel(data.scriptLang) }}
            </el-tag>
          </div>
          <pre class="script-preview">{{ scriptPreview }}</pre>
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
import { i18n } from '@/lang'

const props = defineProps<{
  id?: string
  data: {
    scriptLang?: string
    scriptContent?: string
  }
}>()

defineEmits<{
  (e: 'edit'): void
}>()

const getLangLabel = (lang: string) => {
  const map: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript'
  }
  return map[lang] || lang || 'JavaScript'
}

const scriptPreview = computed(() => {
  const content = props.data?.scriptContent || ''
  const lines = content.split('\n').slice(0, 2)
  return lines.join('\n')
})
</script>

<style scoped lang="scss">
.script-node {
  .node-card {
    min-width: 260px;
    max-width: 360px;
    background: #fff;
    border: 2px solid #64748b;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(100, 116, 139, 0.15);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(100, 116, 139, 0.25);
      transform: translateY(-1px);
    }
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
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

    .script-content {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .script-meta {
        .lang-tag {
          font-size: 11px;
          font-weight: 600;
        }
      }

      .script-preview {
        margin: 0;
        padding: 8px 10px;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 11px;
        color: #334155;
        line-height: 1.5;
        white-space: pre-wrap;
        word-break: break-all;
        max-height: 60px;
        overflow: hidden;
      }
    }
  }
}
</style>
