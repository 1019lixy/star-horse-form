<template>
  <div v-if="badges.length" class="exec-overlay" ref="overlayRef">
    <div
      v-for="b in badges"
      :key="b.id"
      class="exec-badge"
      :class="'eb-' + b.status.toLowerCase()"
      :style="{ transform: `translate(${b.x}px, ${b.y}px)` }"
      @mouseenter="hoverId = b.id"
      @mouseleave="hoverId = null"
    >
      <span class="eb-icon">{{ statusIcon(b.status) }}</span>
      <transition name="eb-pop">
        <div v-if="hoverId === b.id" class="eb-popover" @mouseenter="hoverId = b.id">
          <div class="eb-pop-header">
            <span class="eb-pop-name">{{ b.nodeName }}</span>
            <span class="eb-pop-status" :class="'st-' + b.status.toLowerCase()">{{ statusText(b.status) }}</span>
          </div>
          <div class="eb-pop-section">
            <div class="eb-pop-label">{{ i18n('rule.exec.output') }}</div>
            <div class="eb-pop-text">{{ b.output }}</div>
          </div>
          <div v-if="b.duration != null" class="eb-pop-meta">
            {{ i18n('rule.exec.duration') }}: {{ b.duration }}ms
          </div>
          <div v-if="b.changes && b.changes.length" class="eb-pop-section">
            <div class="eb-pop-label">{{ i18n('rule.exec.contextChanges') }}</div>
            <pre class="eb-pop-changes">{{ b.changes.join('\n') }}</pre>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { i18n } from '@/lang'
import type { ExecutionPath } from '../engine/RuleExecutor'

const props = defineProps<{
  executionPath: ExecutionPath | null
  visibleNodeIds?: string[]
}>()

const { onMove, onMoveEnd, onNodeDrag, onNodeDragStop } = useVueFlow()

interface Badge {
  id: string
  nodeName: string
  status: string
  output: string
  duration?: number
  changes: string[]
  x: number
  y: number
}

const overlayRef = ref<HTMLElement>()
const hoverId = ref<string | null>(null)
const badges = ref<Badge[]>([])
let rafId: number | null = null

const visibleIds = computed(() => {
  if (props.visibleNodeIds && props.visibleNodeIds.length) return new Set(props.visibleNodeIds)
  if (props.executionPath) return new Set(props.executionPath.visitedNodeIds)
  return new Set<string>()
})

const rebuild = () => {
  if (!props.executionPath) { badges.value = []; return }
  const stepMap = new Map<string, any>()
  for (const s of props.executionPath.steps) stepMap.set(s.nodeId, s)
  const snapMap = new Map<string, any>()
  for (const s of props.executionPath.snapshots || []) snapMap.set(s.nodeId, s)
  const list: Badge[] = []
  for (const id of visibleIds.value) {
    const step = stepMap.get(id)
    const snap = snapMap.get(id)
    if (!step) continue
    list.push({
      id,
      nodeName: step.nodeName,
      status: step.status,
      output: snap?.output || step.message,
      duration: step.duration,
      changes: snap?.changes || [],
      x: 0, y: 0
    })
  }
  badges.value = list
  nextTick(reposition)
}

const reposition = () => {
  const container = overlayRef.value?.parentElement
  if (!container) return
  const cRect = container.getBoundingClientRect()
  for (const b of badges.value) {
    const el = container.querySelector(`.vue-flow__node[data-id="${b.id}"]`) as HTMLElement | null
    if (el) {
      const r = el.getBoundingClientRect()
      // 定位到节点右上角外侧
      b.x = r.right - cRect.left - 10
      b.y = r.top - cRect.top - 14
    } else {
      b.x = -9999; b.y = -9999
    }
  }
}

const loop = () => {
  reposition()
  rafId = requestAnimationFrame(loop)
}

watch(() => [props.executionPath, props.visibleNodeIds], rebuild, { deep: false })

onMounted(() => {
  rebuild()
  // 持续重定位以跟随平移/缩放/拖拽
  rafId = requestAnimationFrame(loop)
})
onBeforeUnmount(() => {
  if (rafId != null) cancelAnimationFrame(rafId)
})

onMove(() => reposition())
onMoveEnd(() => nextTick(reposition))
onNodeDrag(() => reposition())
onNodeDragStop(() => nextTick(reposition))

const statusIcon = (s: string) => s === 'SUCCESS' ? '✓' : s === 'FAILED' ? '✗' : s === 'SKIPPED' ? '⊘' : '•'
const statusText = (s: string) => ({
  SUCCESS: i18n('rule.exec.statusSuccess'),
  FAILED: i18n('rule.exec.statusFailed'),
  SKIPPED: i18n('rule.exec.statusSkipped'),
  RUNNING: i18n('rule.exec.statusRunning')
}[s] || s)
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';
.exec-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 20;
}

.exec-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  border: 2px solid #fff;
  transition: transform $rd-transition-fast;
  &:hover { transform: scale(1.15); }
  &.eb-success { background: $rd-success; }
  &.eb-failed { background: $rd-error; }
  &.eb-skipped { background: $rd-text-tertiary; }
  &.eb-running { background: $rd-primary; }
}

.eb-popover {
  position: absolute;
  bottom: 28px;
  right: 0;
  min-width: 240px;
  max-width: 320px;
  background: $rd-bg-surface;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  box-shadow: $rd-shadow-lg;
  padding: $rd-space-2 $rd-space-3;
  z-index: 100;
  pointer-events: auto;
}

.eb-pop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $rd-space-2;
  margin-bottom: $rd-space-2;
  padding-bottom: $rd-space-2;
  border-bottom: 1px solid $rd-divider;
  .eb-pop-name {
    font-size: $rd-font-sm; font-weight: $rd-font-weight-semibold; color: $rd-text-primary;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .eb-pop-status {
    font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: $rd-radius-pill; flex-shrink: 0;
    &.st-success { background: rgba(16, 185, 129, 0.12); color: $rd-success; }
    &.st-failed { background: rgba(239, 68, 68, 0.12); color: $rd-error; }
    &.st-skipped { background: rgba(148, 163, 184, 0.15); color: $rd-text-tertiary; }
    &.st-running { background: rgba(79, 70, 229, 0.12); color: $rd-primary; }
  }
}

.eb-pop-section { margin-top: $rd-space-1; }
.eb-pop-label {
  font-size: 10px; font-weight: 600; color: $rd-text-tertiary;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;
}
.eb-pop-text {
  font-size: $rd-font-xs; color: $rd-text-primary; line-height: 1.5;
  word-break: break-word; max-height: 80px; overflow-y: auto;
}
.eb-pop-meta { font-size: 10px; color: $rd-text-tertiary; margin-top: $rd-space-1; }
.eb-pop-changes {
  margin: 2px 0 0; font-size: 10px; color: $rd-text-secondary;
  font-family: ui-monospace, monospace; line-height: 1.5;
  max-height: 120px; overflow-y: auto; white-space: pre-wrap; word-break: break-word;
}

.eb-pop-enter-active, .eb-pop-leave-active { transition: opacity 0.12s, transform 0.12s; }
.eb-pop-enter-from, .eb-pop-leave-to { opacity: 0; transform: translateY(4px); }
</style>
