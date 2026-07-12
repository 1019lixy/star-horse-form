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
.parallel-gateway {
  display: flex; flex-direction: column; align-items: center;

  .gateway-wrapper { transition: transform 0.3s ease; }
  &:hover .gateway-wrapper { transform: translateY(-2px); }

  .gateway-shape {
    width: 80px; height: 80px; position: relative;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: drop-shadow(0 4px 8px rgba(6, 182, 212, 0.35));
    transition: filter 0.3s ease;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  &:hover .gateway-shape { filter: drop-shadow(0 8px 16px rgba(6, 182, 212, 0.55)); }

  .gateway-inner {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    display: flex; align-items: center; justify-content: center;
  }

  .gateway-icon {
    color: #fff; font-size: 30px; font-weight: 700; line-height: 1;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .gateway-label {
    text-align: center; margin-top: 10px; font-size: 12px; font-weight: 600;
    color: #475569; white-space: nowrap;
  }
}
</style>
