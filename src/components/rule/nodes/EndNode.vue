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
.end-node {
  .node-inner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 28px;
    border-radius: 24px;
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    transition: all 0.3s ease;
    cursor: default;

    &:hover {
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.5);
      transform: translateY(-1px);
    }
  }

  .node-icon {
    width: 18px;
    height: 18px;
  }

  .node-label {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1px;
  }
}
</style>
