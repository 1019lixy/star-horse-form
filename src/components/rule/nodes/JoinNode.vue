<template>
  <div class="join-node">
    <Handle type="target" :position="Position.Top" />
    <Handle type="target" :position="Position.Left" id="left" />
    <Handle type="target" :position="Position.Right" id="right" />
    <div class="node-wrapper">
      <div class="node-shape">
        <div class="node-inner">
          <span class="node-icon">⊕</span>
        </div>
      </div>
    </div>
    <div class="node-label">{{ data.name || '规则聚合' }}</div>
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
  data: { name?: string; joinType?: string; waitAll?: string }
}>()
</script>

<style scoped lang="scss">
.join-node {
  display: flex; flex-direction: column; align-items: center;

  .node-wrapper { transition: transform 0.3s ease; }
  &:hover .node-wrapper { transform: translateY(-2px); }

  .node-shape {
    width: 80px; height: 80px; position: relative;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.35));
    transition: filter 0.3s ease;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  &:hover .node-shape { filter: drop-shadow(0 8px 16px rgba(99, 102, 241, 0.55)); }

  .node-inner {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    display: flex; align-items: center; justify-content: center;
  }

  .node-icon {
    color: #fff; font-size: 28px; font-weight: 700; line-height: 1;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .node-label {
    text-align: center; margin-top: 10px; font-size: 12px; font-weight: 600;
    color: #475569; white-space: nowrap;
  }

  .node-info {
    margin-top: 4px; display: flex; gap: 4px;
    .info-tag {
      padding: 2px 8px; background: #e0e7ff; color: #4f46e5;
      border-radius: 10px; font-size: 10px; font-weight: 600;
    }
  }
}
</style>
