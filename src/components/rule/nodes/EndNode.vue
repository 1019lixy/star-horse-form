<template>
  <div class="end-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-pill">
      <div class="pill-badge">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor"/>
        </svg>
      </div>
      <span class="pill-label">{{ i18n('rule.node.end') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '../compat'
import { i18n } from '@/lang'
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.end-node {
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
      border-color: $rd-node-end;
      box-shadow: 0 2px 8px rgba(71, 85, 105, 0.15);
    }
  }

  .pill-badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: $rd-node-end;
    color: $rd-text-inverse;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(71, 85, 105, 0.35);

    svg {
      width: 12px;
      height: 12px;
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
