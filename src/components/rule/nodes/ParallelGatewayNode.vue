<template>
  <div class="parallel-gateway">
    <Handle type="target" :position="Position.Top" />
    <div class="gateway-wrapper">
      <div class="gateway-shape">
        <div class="gateway-content">
          <span class="gateway-icon">+</span>
        </div>
      </div>
    </div>
    <div class="gateway-label">{{ data.name || '并行网关' }}</div>
    <Handle type="source" :position="Position.Bottom" id="bottom" />
    <Handle type="source" :position="Position.Left" id="left" />
    <Handle type="source" :position="Position.Right" id="right" />
  </div>
</template>

<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'

defineProps<{
  id?: string
  data: {
    name?: string
  }
}>()
</script>

<style scoped lang="scss">
.parallel-gateway {
  display: flex;
  flex-direction: column;
  align-items: center;

  .gateway-wrapper {
    transition: transform 0.3s ease;
  }

  &:hover .gateway-wrapper {
    transform: translateY(-1px);
  }

  .gateway-shape {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    transform: rotate(45deg);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
    transition: box-shadow 0.3s ease;
    cursor: pointer;
  }

  &:hover .gateway-shape {
    box-shadow: 0 8px 20px rgba(6, 182, 212, 0.5);
  }

  .gateway-content {
    transform: rotate(-45deg);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gateway-icon {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
  }

  .gateway-label {
    text-align: center;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    white-space: nowrap;
  }
}
</style>
