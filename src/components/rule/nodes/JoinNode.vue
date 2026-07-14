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
    <div class="node-label">{{ data.name || i18n('rule.node.join') }}</div>
    <div class="node-info">
      <span class="info-tag">{{ data.joinType || 'AND' }}</span>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import { i18n } from '@/lang'

defineProps<{
  id?: string
  data: { name?: string; joinType?: string; waitAll?: string }
}>()
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';

.join-node {
  display: flex;
  flex-direction: column;
  align-items: center;

  .node-shape {
    width: 80px;
    height: 80px;
    position: relative;
    background: $rd-node-join;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: drop-shadow(0 1px 2px rgba(17, 24, 39, 0.08));
    transition: filter $rd-transition-base;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover .node-shape {
    filter: drop-shadow(0 2px 6px rgba(17, 24, 39, 0.12));
  }

  .node-inner {
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.12);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .node-icon {
    color: $rd-text-inverse;
    font-size: $rd-font-xl;
    font-weight: $rd-font-weight-bold;
    line-height: 1;
  }

  .node-label {
    text-align: center;
    margin-top: $rd-space-2;
    font-size: $rd-font-sm;
    font-weight: $rd-font-weight-semibold;
    color: $rd-text-secondary;
    white-space: nowrap;
  }

  .node-info {
    margin-top: $rd-space-1;
    display: flex;
    gap: $rd-space-1;

    .info-tag {
      padding: 1px $rd-space-2;
      background: rgba(79, 70, 229, 0.08);
      color: $rd-node-join;
      border-radius: $rd-radius-pill;
      font-size: $rd-font-xs;
      font-weight: $rd-font-weight-semibold;
    }
  }
}
</style>
