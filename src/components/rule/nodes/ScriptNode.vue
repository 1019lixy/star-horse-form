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
@import '../styles/design-tokens.scss';

.script-node {
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
    background: rgba(124, 58, 237, 0.08);
    color: $rd-node-variable;
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
      color: $rd-node-variable;
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

    .script-content {
      display: flex;
      flex-direction: column;
      gap: $rd-space-2;

      .script-meta {
        .lang-tag {
          font-size: $rd-font-xs;
          font-weight: $rd-font-weight-semibold;
        }
      }

      .script-preview {
        margin: 0;
        padding: $rd-space-2 $rd-space-3;
        background: $rd-bg-subtle;
        border: 1px solid $rd-divider;
        border-radius: $rd-radius-md;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: $rd-font-xs;
        color: $rd-text-secondary;
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
