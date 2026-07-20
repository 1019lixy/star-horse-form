<template>
  <div class="start-node">
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-pill">
      <div class="pill-badge">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" fill="currentColor"/>
        </svg>
      </div>
      <span class="pill-label">{{ i18n('rule.node.start') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '../compat'
import { i18n } from '@/lang'
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.start-node {
  position: relative;
  display: inline-block;

  .node-pill {
    display: inline-flex;
    align-items: center;
    gap: $rd-space-2;
    padding: 6px 14px 6px 6px;
    background: $rd-bg-surface;
    border: 1px solid $rd-border;
    border-radius: $rd-radius-pill;
    box-shadow: $rd-shadow-xs;
    transition: box-shadow $rd-transition-base, border-color $rd-transition-base;

    &:hover {
      border-color: $rd-node-start;
      box-shadow: 0 2px 8px rgba(71, 85, 105, 0.15);
    }
  }

  .pill-badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: $rd-node-start;
    color: $rd-text-inverse;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(71, 85, 105, 0.35);

    svg {
      width: 12px;
      height: 12px;
      margin-left: 1px; // 视觉居中（播放图标偏右）
    }
  }

  .pill-label {
    font-size: $rd-font-sm;
    font-weight: $rd-font-weight-semibold;
    color: $rd-text-primary;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
}
</style>
