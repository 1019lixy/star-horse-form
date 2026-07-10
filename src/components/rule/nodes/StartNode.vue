<template>
  <div class="start-node">
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-inner">
      <svg class="node-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z" fill="currentColor"/>
      </svg>
      <span class="node-label">开始</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
</script>

<style scoped lang="scss">
.start-node {
  .node-inner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 28px;
    border-radius: 24px;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: #fff;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
    transition: all 0.3s ease;
    cursor: default;

    &:hover {
      box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
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
