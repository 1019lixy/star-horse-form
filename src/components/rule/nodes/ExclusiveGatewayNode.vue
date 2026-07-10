<template>
  <div class="exclusive-gateway" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="gateway-wrapper">
      <div class="gateway-shape">
        <div class="gateway-content">
          <span class="gateway-icon">×</span>
        </div>
      </div>
    </div>
    <div class="gateway-label">{{ data.name || '排他网关' }}</div>
    <div v-if="data.branches && data.branches.length > 0" class="branch-list">
      <div
        v-for="(branch, index) in data.branches"
        :key="index"
        class="branch-item"
      >
        <span class="branch-condition">{{ branch.condition || '默认' }}</span>
        <span class="branch-arrow">→</span>
        <span class="branch-target">{{ branch.targetLabel || '-' }}</span>
      </div>
    </div>
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
    branches?: Array<{ condition?: string; targetLabel?: string }>
  }
}>()

defineEmits<{
  (e: 'edit'): void
}>()
</script>

<style scoped lang="scss">
.exclusive-gateway {
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
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    transform: rotate(45deg);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    transition: box-shadow 0.3s ease;
    cursor: pointer;
  }

  &:hover .gateway-shape {
    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.5);
  }

  .gateway-content {
    transform: rotate(-45deg);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .gateway-icon {
    font-size: 30px;
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

  .branch-list {
    margin-top: 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-width: 200px;

    .branch-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 4px;
      font-size: 11px;
      color: #92400e;

      .branch-condition {
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .branch-arrow {
        color: #d97706;
        flex-shrink: 0;
      }

      .branch-target {
        color: #64748b;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
