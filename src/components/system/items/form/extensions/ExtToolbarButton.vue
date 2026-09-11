<script setup lang="ts">
/**
 * 设计器工具栏扩展按钮基础组件。
 *
 * 供 #toolbar-extra 插槽中的扩展按钮统一外观：
 * 与内置工具栏按钮（tb-btn）保持一致的尺寸、悬停、禁用样式。
 * 图标支持两类：
 * - lib 内置 SVG 图标名：ai / rule / flow
 * - star-horse-icon 图标名：如 "component"、"setting"
 */
import {i18n} from "@/lang";

defineOptions({name: "ExtToolbarButton"});

withDefaults(
    defineProps<{
      /** 图标：内置 SVG 名（ai/rule/flow）或 star-horse-icon 图标名 */
      icon: string;
      /** 悬停提示文案 */
      label: string;
      /** 是否禁用 */
      disabled?: boolean;
      /** 是否显示文字（下拉触发器样式） */
      showLabel?: boolean;
    }>(),
    {disabled: false, showLabel: false},
);

const emit = defineEmits<{ (e: "click", evt: MouseEvent): void }>();
</script>

<template>
  <el-tooltip
      :content="label"
      effect="dark"
      placement="bottom"
      :show-after="500"
      :disabled="showLabel"
  >
    <el-button class="ext-tb-btn" :disabled="disabled" @click="emit('click', $event)">
      <!-- 内置 SVG：AI -->
      <template v-if="icon === 'ai'">
        <svg class="ext-tb-svg" viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
              fill="url(#ext-ai-grad)"/>
          <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
          <path
              d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5"
              stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="ext-ai-grad" x1="2" y1="2" x2="22" y2="22">
              <stop stop-color="#667eea"/>
              <stop offset="1" stop-color="#764ba2"/>
            </linearGradient>
          </defs>
        </svg>
      </template>
      <!-- 内置 SVG：规则 -->
      <template v-else-if="icon === 'rule'">
        <svg class="ext-tb-svg" viewBox="0 0 24 24" fill="none" width="20" height="20">
          <path d="M12 2L17 7L12 12L7 7Z" fill="url(#ext-rule-grad)"/>
          <path d="M12 12L12 15.5" stroke="url(#ext-rule-grad)" stroke-width="2" stroke-linecap="round"/>
          <rect x="5.5" y="15.5" width="13" height="6.5" rx="1.5" fill="url(#ext-rule-grad)"/>
          <circle cx="10" cy="18.75" r="1" fill="white"/>
          <circle cx="14" cy="18.75" r="1" fill="white"/>
          <defs>
            <linearGradient id="ext-rule-grad" x1="2" y1="2" x2="22" y2="22">
              <stop stop-color="#3b82f6"/>
              <stop offset="1" stop-color="#06b6d4"/>
            </linearGradient>
          </defs>
        </svg>
      </template>
      <!-- 内置 SVG：流程 -->
      <template v-else-if="icon === 'flow'">
        <svg class="ext-tb-svg" viewBox="0 0 24 24" fill="none" width="20" height="20">
          <rect x="3" y="3" width="6" height="5" rx="1" fill="url(#ext-flow-grad)"/>
          <rect x="15" y="3" width="6" height="5" rx="1" fill="url(#ext-flow-grad)"/>
          <rect x="9" y="16" width="6" height="5" rx="1" fill="url(#ext-flow-grad)"/>
          <path d="M6 8v3a2 2 0 002 2h8a2 2 0 002-2V8" stroke="url(#ext-flow-grad)" stroke-width="1.5" fill="none"
                stroke-linecap="round"/>
          <path d="M12 13v3" stroke="url(#ext-flow-grad)" stroke-width="1.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="ext-flow-grad" x1="2" y1="2" x2="22" y2="22">
              <stop stop-color="#f59e0b"/>
              <stop offset="1" stop-color="#ef4444"/>
            </linearGradient>
          </defs>
        </svg>
      </template>
      <!-- star-horse-icon 兜底 -->
      <template v-else>
        <star-horse-icon :icon-class="icon" size="20px"/>
      </template>
      <span v-if="showLabel" class="ext-tb-label">{{ label }}</span>
    </el-button>
  </el-tooltip>
</template>

<style lang="scss" scoped>
.ext-tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 32px;
  padding: 0 8px;
  border: none !important;
  background: transparent !important;
  border-radius: 6px !important;
  cursor: pointer;
  transition: all 0.18s ease;
  color: #606266;
  margin: 0 1px;

  :deep(.star-horse-icon) {
    font-size: 18px;
    color: var(--star-horse-style);
    transition: color 0.15s ease;
  }

  &:hover {
    background: #eef1f6 !important;
    color: #303133;
  }

  &:active {
    background: #e4e7ed !important;
  }

  &.is-disabled {
    cursor: not-allowed !important;
    opacity: 0.45 !important;

    :deep(.star-horse-icon) {
      color: #c0c4cc !important;
    }
  }
}

.ext-tb-svg {
  vertical-align: middle;
}

.ext-tb-label {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  line-height: 1;
  white-space: nowrap;
  margin-left: 4px;
}
</style>