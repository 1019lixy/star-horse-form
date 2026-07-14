<template>
  <div class="end-node">
    <Handle type="target" :position="Position.Top" />
    <div class="node-inner">
      <svg class="node-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
      </svg>
      <span class="node-label">{{ i18n('rule.node.end') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { i18n } from '@/lang'
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';
.end-node {
  .node-inner {
    display: flex;
    align-items: center;
    gap: $rd-space-2;
    padding: $rd-space-2 $rd-space-5;
    border-radius: $rd-radius-pill;
    background: $rd-node-end;
    color: $rd-text-inverse;
    box-shadow: $rd-shadow-sm;
    transition: box-shadow $rd-transition-base;
    cursor: default;

    &:hover {
      box-shadow: $rd-shadow-md;
    }
  }

  .node-icon {
    width: 16px;
    height: 16px;
  }

  .node-label {
    font-size: $rd-font-md;
    font-weight: $rd-font-weight-semibold;
    letter-spacing: 0.5px;
  }
}
</style>
