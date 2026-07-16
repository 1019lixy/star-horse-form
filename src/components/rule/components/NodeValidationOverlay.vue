<template>
  <div v-if="badges.length" class="val-overlay" ref="overlayRef">
    <div
      v-for="b in badges"
      :key="b.id"
      class="val-badge"
      :class="'vb-' + b.level"
      :style="{ transform: `translate(${b.x}px, ${b.y}px)` }"
      @mouseenter="hoverId = b.id"
      @mouseleave="hoverId = null"
    >
      <span class="vb-icon" v-if="b.level === 'error'">!</span>
      <span class="vb-icon" v-else>?</span>
      <span class="vb-count" v-if="b.count > 1">{{ b.count }}</span>
      <transition name="vb-pop">
        <div v-if="hoverId === b.id" class="vb-popover" @mouseenter="hoverId = b.id">
          <div class="vb-pop-header">
            <span class="vb-pop-name">{{ b.nodeName }}</span>
            <span class="vb-pop-level" :class="'lv-' + b.level">
              {{ b.level === 'error' ? i18n('rule.val.levelError') : i18n('rule.val.levelWarning') }} · {{ b.count }}
            </span>
          </div>
          <ul class="vb-pop-list">
            <li v-for="(iss, idx) in b.issues" :key="idx" :class="'lv-' + iss.level">
              <span class="vb-pop-bullet">{{ iss.level === 'error' ? '✗' : '⚠' }}</span>
              <span class="vb-pop-msg">{{ iss.message }}</span>
            </li>
          </ul>
          <div class="vb-pop-footer">
            <el-button link size="small" @click="emit('locate', b.id)">
              <el-icon><Aim /></el-icon>
              {{ i18n('rule.val.locateNode') }}
            </el-button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { Aim } from '@element-plus/icons-vue'
import { i18n } from '@/lang'
import type { ValidationResult, ValidationIssue } from '../engine/validator'

const props = defineProps<{
  result: ValidationResult | null
}>()
const emit = defineEmits<{
  (e: 'locate', nodeId: string): void
}>()

const { onMove, onMoveEnd, onNodeDrag, onNodeDragStop } = useVueFlow()

interface Badge {
  id: string
  nodeName: string
  level: 'error' | 'warning'
  count: number
  issues: ValidationIssue[]
  x: number
  y: number
}

const overlayRef = ref<HTMLElement>()
const hoverId = ref<string | null>(null)
const badges = ref<Badge[]>([])
let rafId: number | null = null

const rebuild = () => {
  if (!props.result || props.result.nodeMap.size === 0) { badges.value = []; return }
  const list: Badge[] = []
  for (const [nodeId, issues] of props.result.nodeMap) {
    if (!nodeId) continue // 图级问题不在画布上显示气泡
    // 节点级问题：error 优先，error 存在则展示 error 气泡
    const hasError = issues.some(i => i.level === 'error')
    const level = hasError ? 'error' : 'warning'
    const scoped = hasError ? issues.filter(i => i.level === 'error') : issues
    const node = issues[0]
    list.push({
      id: nodeId,
      nodeName: node.nodeName,
      level,
      count: scoped.length,
      issues: scoped,
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
      // 定位到节点左上角外侧
      b.x = r.left - cRect.left - 8
      b.y = r.top - cRect.top - 8
    } else {
      b.x = -9999; b.y = -9999
    }
  }
}

const loop = () => {
  reposition()
  rafId = requestAnimationFrame(loop)
}

watch(() => props.result, rebuild, { deep: false })

onMounted(() => {
  rebuild()
  rafId = requestAnimationFrame(loop)
})
onBeforeUnmount(() => {
  if (rafId != null) cancelAnimationFrame(rafId)
})

onMove(() => reposition())
onMoveEnd(() => nextTick(reposition))
onNodeDrag(() => reposition())
onNodeDragStop(() => nextTick(reposition))
</script>

<style scoped lang="scss">
@import '../styles/design-tokens.scss';
.val-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 25;
}

.val-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  border: 2px solid #fff;
  transition: transform $rd-transition-fast;
  &:hover { transform: scale(1.15); }
  &.vb-error { background: $rd-error; animation: vb-pulse 1.6s ease-in-out infinite; }
  &.vb-warning { background: $rd-warning; }
}

.vb-count {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: $rd-radius-pill;
  background: $rd-text-primary;
  color: #fff;
  font-size: 9px;
  line-height: 14px;
  text-align: center;
  border: 1.5px solid #fff;
}

@keyframes vb-pulse {
  0%, 100% { box-shadow: 0 2px 6px rgba(0,0,0,0.2), 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 2px 6px rgba(0,0,0,0.2), 0 0 0 6px rgba(239, 68, 68, 0); }
}

.vb-popover {
  position: absolute;
  top: 26px;
  left: 0;
  min-width: 260px;
  max-width: 360px;
  background: $rd-bg-surface;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  box-shadow: $rd-shadow-lg;
  padding: $rd-space-2 $rd-space-3;
  z-index: 100;
  pointer-events: auto;
}

.vb-pop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $rd-space-2;
  margin-bottom: $rd-space-2;
  padding-bottom: $rd-space-2;
  border-bottom: 1px solid $rd-divider;
  .vb-pop-name {
    font-size: $rd-font-sm; font-weight: $rd-font-weight-semibold; color: $rd-text-primary;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
  }
  .vb-pop-level {
    font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: $rd-radius-pill; flex-shrink: 0;
    &.lv-error { background: rgba(239, 68, 68, 0.12); color: $rd-error; }
    &.lv-warning { background: rgba(245, 158, 11, 0.12); color: $rd-warning; }
  }
}

.vb-pop-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 180px;
  overflow-y: auto;
  li {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: $rd-font-xs;
    line-height: 1.5;
    padding: 3px 0;
    color: $rd-text-primary;
    &.lv-error .vb-pop-bullet { color: $rd-error; }
    &.lv-warning .vb-pop-bullet { color: $rd-warning; }
  }
  .vb-pop-bullet { flex-shrink: 0; font-weight: 700; }
  .vb-pop-msg { word-break: break-word; }
}

.vb-pop-footer {
  margin-top: $rd-space-2;
  padding-top: $rd-space-2;
  border-top: 1px solid $rd-divider;
  text-align: right;
}

.vb-pop-enter-active, .vb-pop-leave-active { transition: opacity 0.12s, transform 0.12s; }
.vb-pop-enter-from, .vb-pop-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
