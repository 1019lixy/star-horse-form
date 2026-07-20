<template>
  <div
    class="rule-handle"
    :class="['rh-' + position, 'rh-' + type]"
    :data-handle-type="type"
    :data-handle-pos="position"
    :data-handle-id="id || position"
    @mousedown.stop="startDrag"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { Position } from './index'

const props = defineProps<{
  type: 'source' | 'target'
  position: Position
  id?: string
}>()

const canvas = inject<{
  startConnection: (nodeId: string, handleType: string, handleId: string, position: string, e: MouseEvent) => void
}>('ruleCanvas')

const startDrag = (e: MouseEvent) => {
  const nodeEl = (e.currentTarget as HTMLElement).closest('[data-node-id]') as HTMLElement | null
  const nodeId = nodeEl?.getAttribute('data-node-id') || ''
  if (!nodeId) return
  canvas?.startConnection(nodeId, props.type, props.id || props.position, props.position, e)
}
</script>

<style scoped lang="scss">
.rule-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6366f1;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.3);
  cursor: crosshair;
  opacity: 0.5;
  transition: opacity 0.15s, transform 0.15s;
  z-index: 5;

  &:hover {
    opacity: 1;
    transform: scale(1.3);
  }

  &.rh-source {
    /* source handles slightly brighter */
    background: #10b981;
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3);
  }

  &.rh-target {
    background: #6366f1;
  }

  /* Positioning - the parent node root must be position: relative */
  &.rh-top {
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    &:hover { transform: translateX(-50%) scale(1.3); }
  }
  &.rh-bottom {
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    &:hover { transform: translateX(-50%) scale(1.3); }
  }
  &.rh-left {
    left: -5px;
    top: 50%;
    transform: translateY(-50%);
    &:hover { transform: translateY(-50%) scale(1.3); }
  }
  &.rh-right {
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    &:hover { transform: translateY(-50%) scale(1.3); }
  }
}
</style>
