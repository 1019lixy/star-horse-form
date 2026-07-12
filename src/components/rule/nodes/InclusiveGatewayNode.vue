<template>
  <div class="inclusive-gateway" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <el-tooltip placement="right" :show-after="300" :disabled="!hasBranches">
      <template #content>
        <div class="branch-tooltip">
          <div v-for="(branch, index) in data.branches" :key="index" class="tooltip-item">
            <span class="tooltip-num">{{ index + 1 }}.</span>
            <span class="tooltip-text">{{ branch.condition || branch.label || i18n('rule.opt.default') }}</span>
          </div>
        </div>
      </template>
      <div class="gateway-wrapper">
        <div class="gateway-shape">
          <div class="gateway-inner">
            <svg class="gateway-circle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="2.5" />
            </svg>
          </div>
        </div>
      </div>
    </el-tooltip>
    <div class="gateway-label">{{ data.name || i18n('rule.node.inclusiveGateway') }}</div>
    <Handle type="source" :position="Position.Bottom" id="bottom" />
    <Handle type="source" :position="Position.Left" id="left" />
    <Handle type="source" :position="Position.Right" id="right" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Position, Handle } from '@vue-flow/core'
import { i18n } from '@/lang'

const props = defineProps<{
  id?: string
  data: {
    name?: string
    branches?: Array<{ condition?: string; label?: string }>
  }
}>()

defineEmits<{ (e: 'edit'): void }>()

const hasBranches = computed(() => props.data?.branches && props.data.branches.length > 0)
</script>

<style scoped lang="scss">
.inclusive-gateway {
  display: flex; flex-direction: column; align-items: center;

  .gateway-wrapper { transition: transform 0.3s ease; }
  &:hover .gateway-wrapper { transform: translateY(-2px); }

  .gateway-shape {
    width: 80px; height: 80px; position: relative;
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    filter: drop-shadow(0 4px 8px rgba(139, 92, 246, 0.35));
    transition: filter 0.3s ease;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  &:hover .gateway-shape { filter: drop-shadow(0 8px 16px rgba(139, 92, 246, 0.55)); }

  .gateway-inner {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    display: flex; align-items: center; justify-content: center;
  }

  .gateway-circle {
    width: 26px; height: 26px; color: #fff;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
  }

  .gateway-label {
    text-align: center; margin-top: 10px; font-size: 12px; font-weight: 600;
    color: #475569; white-space: nowrap;
  }
}
</style>
