<template>
  <div class="parallel-gateway">
    <Handle type="target" :position="Position.Top" />
    <div class="gateway-wrapper">
      <div class="gateway-shape">
        <div class="gateway-inner">
          <span class="gateway-icon">+</span>
        </div>
      </div>
    </div>
    <div class="gateway-label">{{ data.name || i18n('rule.node.parallelGateway') }}</div>
    <Handle type="source" :position="Position.Bottom" id="bottom" />
    <Handle type="source" :position="Position.Left" id="left" />
    <Handle type="source" :position="Position.Right" id="right" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import { i18n } from '@/lang'

defineProps<{ id?: string; data: { name?: string } }>()
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';
.parallel-gateway {
  display: flex; flex-direction: column; align-items: center;

  .gateway-shape {
    width: 80px; height: 80px; position: relative;
    background: $rd-node-gw-and;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: drop-shadow(0 2px 4px rgba(17, 24, 39, 0.1));
    transition: filter $rd-transition-base;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  &:hover .gateway-shape { filter: drop-shadow(0 4px 8px rgba(17, 24, 39, 0.15)); }

  .gateway-inner {
    width: 64px; height: 64px;
    background: rgba(255, 255, 255, 0.18);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    display: flex; align-items: center; justify-content: center;
  }

  .gateway-icon {
    color: #fff; font-size: 30px; font-weight: 700; line-height: 1;
  }

  .gateway-label {
    text-align: center; margin-top: $rd-space-2; font-size: $rd-font-sm; font-weight: $rd-font-weight-semibold;
    color: $rd-text-secondary; white-space: nowrap;
  }
}
</style>
