<template>
  <div class="start-node">
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-inner">
      <svg class="node-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      <span class="node-label">{{ i18n('rule.node.start') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { i18n } from '@/lang'
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';
.start-node {
  .node-inner {
    display: flex;
    align-items: center;
    gap: $rd-space-2;
    padding: $rd-space-2 $rd-space-5;
    border-radius: $rd-radius-pill;
    background: $rd-node-start;
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
