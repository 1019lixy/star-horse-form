<template>
  <div class="join-node">
    <Handle type="target" :position="Position.Top" />
    <Handle type="target" :position="Position.Left" id="left" />
    <Handle type="target" :position="Position.Right" id="right" />
    <div class="node-wrapper">
      <div class="node-shape">
        <div class="node-content">
          <span class="node-icon">⊕</span>
        </div>
      </div>
    </div>
    <div class="node-label">{{ data.name || '聚合节点' }}</div>
    <div class="node-info">
      <span class="info-tag">{{ data.joinType || 'AND' }}</span>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'

defineProps<{
  id?: string
  data: {
    name?: string
    joinType?: string
    waitAll?: string
  }
}>()
</script>

<style scoped lang="scss">
.join-node {
  display: flex;
  flex-direction: column;
  align-items: center;

  .node-wrapper {
    transition: transform 0.3s ease;
  }

  &:hover .node-wrapper {
    transform: translateY(-1px);
  }

  .node-shape {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    transform: rotate(45deg);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    transition: box-shadow 0.3s ease;
    cursor: pointer;
  }

  &:hover .node-shape {
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.5);
  }

  .node-content {
    transform: rotate(-45deg);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node-icon {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
  }

  .node-label {
    text-align: center;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
  }

  .node-info {
    margin-top: 4px;
    display: flex;
    gap: 4px;

    .info-tag {
      padding: 2px 8px;
      background: #ede9fe;
      color: #7c3aed;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
    }
  }
}
</style>
