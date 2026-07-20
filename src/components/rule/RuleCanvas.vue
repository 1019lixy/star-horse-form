<template>
  <div
    class="rule-canvas-wrapper"
    ref="wrapperRef"
    :class="{ 'is-panning': isSpacePressed }"
    @mousedown="onWrapperMouseDown"
    @wheel="onWheel"
  >
    <!-- SVG 层：网格 + 边 + 连线预览 + 框选 -->
    <svg class="rule-canvas-svg" :width="size.w" :height="size.h">
      <defs>
        <pattern v-if="showGrid" id="rule-grid" :width="gridSize" :height="gridSize" patternUnits="userSpaceOnUse">
          <path :d="`M ${gridSize} 0 L 0 0 0 ${gridSize}`" fill="none" :stroke="gridColor" stroke-width="0.5"/>
        </pattern>
        <marker id="rule-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" :fill="arrowColor"/>
        </marker>
        <marker id="rule-arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981"/>
        </marker>
      </defs>
      <rect v-if="showGrid" class="rule-grid-bg" x="0" y="0" :width="size.w" :height="size.h" fill="url(#rule-grid)"/>
      <g :transform="`translate(${pan.x}, ${pan.y}) scale(${zoom})`">
        <!-- 边 -->
        <g
          v-for="edge in edges"
          :key="edge.id"
          :data-edge-id="edge.id"
          :data-id="edge.id"
          :class="['rule-canvas-edge', edge.class, { selected: edge.selected }]"
        >
          <!-- 透明命中区 -->
          <path
            class="edge-hit"
            :d="edgeGeom(edge).path"
            fill="none"
            stroke="transparent"
            stroke-width="14"
            @click.stop="onEdgeClick($event, edge)"
            @dblclick.stop="onEdgeDoubleClick($event, edge)"
          />
          <!-- 可见连线 -->
          <path
            class="edge-line"
            :d="edgeGeom(edge).path"
            fill="none"
            :stroke="edgeStroke(edge)"
            :stroke-width="edgeStrokeWidth(edge)"
            :stroke-dasharray="edgeDash(edge)"
            :marker-end="showArrow(edge) ? (edge.class === 'edge-highlighted' ? 'url(#rule-arrow-active)' : 'url(#rule-arrow)') : ''"
          />
          <!-- 标签 -->
          <g
            v-if="edge.label"
            class="edge-label"
            :transform="`translate(${edgeGeom(edge).labelX}, ${edgeGeom(edge).labelY})`"
          >
            <rect
              v-if="edge.labelShowBg !== false"
              :x="-labelHalfW(edge)"
              :y="-9"
              :width="labelW(edge)"
              :height="18"
              rx="3"
              :fill="(edge.labelBgStyle && edge.labelBgStyle.fill) || '#fff'"
              :fill-opacity="(edge.labelBgStyle && edge.labelBgStyle.fillOpacity) ?? 0.92"
            />
            <text
              text-anchor="middle"
              dominant-baseline="middle"
              :fill="(edge.labelStyle && edge.labelStyle.fill) || '#64748b'"
              :font-size="(edge.labelStyle && edge.labelStyle.fontSize) || 11"
              :font-weight="(edge.labelStyle && edge.labelStyle.fontWeight) || 500"
            >{{ edge.label }}</text>
          </g>
        </g>
        <!-- 连线预览 -->
        <path
          v-if="connecting"
          class="edge-connecting"
          :d="connectingPath"
          stroke="#6366f1"
          stroke-width="2"
          stroke-dasharray="6 3"
          fill="none"
        />
        <!-- 框选 -->
        <rect
          v-if="boxSel"
          class="box-sel-rect"
          :x="boxSel.x"
          :y="boxSel.y"
          :width="boxSel.w"
          :height="boxSel.h"
          fill="rgba(79,70,229,0.06)"
          stroke="#4f46e5"
          stroke-width="1"
          stroke-dasharray="4 2"
        />
      </g>
    </svg>

    <!-- HTML 节点层 -->
    <div
      class="rule-canvas-nodes"
      :style="{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }"
    >
      <div
        v-for="node in nodes"
        :key="node.id"
        :ref="el => setNodeEl(node.id, el as HTMLElement | null)"
        class="rule-canvas-node"
        :class="[node.class, { selected: node.selected }]"
        :data-id="node.id"
        :data-node-id="node.id"
        :style="{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }"
        @click.stop="onNodeClick($event, node)"
        @mousedown.stop="onNodeMouseDown($event, node)"
        @dblclick.stop="onNodeDoubleClick($event, node)"
      >
        <slot
          :name="`node-${node.type || 'default'}`"
          :id="node.id"
          :type="node.type"
          :data="node.data"
          :selected="node.selected"
        >
          <div class="rule-canvas-default-node">{{ node.type }}</div>
        </slot>
      </div>
    </div>

    <!-- 缩放控制 -->
    <div class="rule-canvas-controls">
      <button class="rc-ctrl-btn" @click="zoomIn" :title="i18n('rule.fitCanvas') + ' +'" tabindex="-1">＋</button>
      <button class="rc-ctrl-btn" @click="zoomOut" :title="i18n('rule.fitCanvas') + ' -'" tabindex="-1">−</button>
      <button class="rc-ctrl-btn" @click="resetZoom" title="1:1" tabindex="-1">1:1</button>
      <button class="rc-ctrl-btn" @click="() => fitView()" :title="i18n('rule.fitCanvas')" tabindex="-1">⊡</button>
    </div>

    <!-- 小地图（可选） -->
    <div v-if="showMinimap" class="rule-minimap" ref="minimapRef" @mousedown.stop="onMinimapMouseDown">
      <div class="minimap-header">
        <span>{{ i18n('rule.minimap') }}</span>
        <button class="minimap-close" @click.stop="$emit('update:showMinimap', false)" :title="i18n('rule.minimapClose')" tabindex="-1">×</button>
      </div>
      <svg class="minimap-svg" :width="minimapSize.w" :height="minimapSize.h">
        <!-- 节点 -->
        <rect
          v-for="n in minimapNodes"
          :key="n.id"
          :x="n.x" :y="n.y" :width="n.w" :height="n.h"
          :class="['mini-node', { 'mini-node-selected': n.selected }]"
        />
        <!-- 视口矩形 -->
        <rect
          :x="viewportRect.x" :y="viewportRect.y"
          :width="viewportRect.w" :height="viewportRect.h"
          class="mini-viewport"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, provide, reactive, ref, watch, nextTick } from 'vue'
import { i18n } from '@/lang'
import type { Connection, Edge, Node } from './compat'

/* ============================================================
 * Props & Emits
 * 数据结构保持 VueFlow 兼容（不修改后端接口）
 * - Node: { id, type, position:{x,y}, data, selected?, class? }
 * - Edge: { id, source, target, label?, labelStyle?, type?, style?, data?, animated? }
 * ============================================================ */
const props = withDefaults(defineProps<{
  nodes: Node[]
  edges: Edge[]
  defaultViewport?: { zoom?: number; x?: number; y?: number }
  minZoom?: number
  maxZoom?: number
  snapToGrid?: boolean
  snapGrid?: [number, number]
  connectionMode?: 'strict' | 'loose'
  fitViewOnInit?: boolean
  showGrid?: boolean
  gridSize?: number
  gridColor?: string
  arrowColor?: string
  showMinimap?: boolean
}>(), {
  defaultViewport: () => ({ zoom: 1 }),
  minZoom: 0.2,
  maxZoom: 2,
  snapToGrid: true,
  snapGrid: () => [15, 15] as [number, number],
  connectionMode: 'strict',
  fitViewOnInit: false,
  showGrid: true,
  gridSize: 20,
  gridColor: '#e5e7eb',
  arrowColor: '#94a3b8',
  showMinimap: false,
})

const emit = defineEmits<{
  (e: 'node-click', payload: { node: Node; event: MouseEvent }): void
  (e: 'node-double-click', payload: { node: Node; event: MouseEvent }): void
  (e: 'edge-click', payload: { edge: Edge; event: MouseEvent }): void
  (e: 'edge-double-click', payload: { edge: Edge; event: MouseEvent }): void
  (e: 'connect', conn: Connection): void
  (e: 'nodes-moved'): void
  (e: 'update:showMinimap', val: boolean): void
}>()

/* ============================================================
 * 视口状态：pan / zoom / 尺寸
 * ============================================================ */
const wrapperRef = ref<HTMLElement | null>(null)
const size = reactive({ w: 0, h: 0 })
const pan = reactive({ x: 0, y: 0 })
const zoom = ref(props.defaultViewport.zoom ?? 1)

let resizeRo: ResizeObserver | null = null
const measureWrapper = () => {
  const el = wrapperRef.value
  if (!el) return
  size.w = el.clientWidth
  size.h = el.clientHeight
}
onMounted(() => {
  measureWrapper()
  resizeRo = new ResizeObserver(() => measureWrapper())
  if (wrapperRef.value) resizeRo.observe(wrapperRef.value)
  if (props.fitViewOnInit) {
    nextTick(() => setTimeout(() => fitView(), 50))
  }
  document.addEventListener('keydown', onKeyDownSpace)
  document.addEventListener('keyup', onKeyUpSpace)
})
onBeforeUnmount(() => {
  resizeRo?.disconnect()
  document.removeEventListener('mousemove', onDocMouseMove)
  document.removeEventListener('mouseup', onDocMouseUp)
  document.removeEventListener('keydown', onKeyDownSpace)
  document.removeEventListener('keyup', onKeyUpSpace)
})

/* ============================================================
 * 节点尺寸测量（用于边端点计算与 fitView）
 * ============================================================ */
const nodeElMap = new Map<string, HTMLElement>()
const dims = reactive(new Map<string, { w: number; h: number }>())
let dimsRo: ResizeObserver | null = null

const setNodeEl = (id: string, el: HTMLElement | null) => {
  if (el) {
    nodeElMap.set(id, el)
    if (!dimsRo) {
      dimsRo = new ResizeObserver(entries => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement
          const nid = target.getAttribute('data-node-id')
          if (nid) {
            dims.set(nid, { w: target.offsetWidth, h: target.offsetHeight })
          }
        }
      })
    }
    dimsRo.observe(el)
    dims.set(id, { w: el.offsetWidth, h: el.offsetHeight })
  } else {
    const old = nodeElMap.get(id)
    if (old) dimsRo?.unobserve(old)
    nodeElMap.delete(id)
    dims.delete(id)
  }
}
onBeforeUnmount(() => {
  dimsRo?.disconnect()
  dimsRo = null
})

const getDim = (id: string) => {
  const d = dims.get(id)
  if (d && d.w > 0) return d
  // fallback：从 DOM 重新测量
  const el = nodeElMap.get(id)
  if (el && el.offsetWidth > 0) {
    const nd = { w: el.offsetWidth, h: el.offsetHeight }
    dims.set(id, nd)
    return nd
  }
  return { w: 220, h: 80 }
}

/* ============================================================
 * 边几何计算
 * ============================================================ */
interface EdgeGeom { path: string; labelX: number; labelY: number }

const getAnchors = (src: Node, tgt: Node) => {
  const sd = getDim(src.id)
  const td = getDim(tgt.id)
  const srcCx = src.position.x + sd.w / 2
  const srcCy = src.position.y + sd.h / 2
  const tgtCx = tgt.position.x + td.w / 2
  const tgtCy = tgt.position.y + td.h / 2
  const dx = tgtCx - srcCx
  const dy = tgtCy - srcCy
  if (Math.abs(dy) >= Math.abs(dx)) {
    if (dy >= 0) {
      return { sx: srcCx, sy: src.position.y + sd.h, tx: tgtCx, ty: tgt.position.y, sDir: 'bottom' as const, tDir: 'top' as const }
    }
    return { sx: srcCx, sy: src.position.y, tx: tgtCx, ty: tgt.position.y + td.h, sDir: 'top' as const, tDir: 'bottom' as const }
  }
  if (dx >= 0) {
    return { sx: src.position.x + sd.w, sy: srcCy, tx: tgt.position.x, ty: tgtCy, sDir: 'right' as const, tDir: 'left' as const }
  }
  return { sx: src.position.x, sy: srcCy, tx: tgt.position.x + td.w, ty: tgtCy, sDir: 'left' as const, tDir: 'right' as const }
}

const buildPath = (edge: Edge): EdgeGeom => {
  const src = props.nodes.find(n => n.id === edge.source)
  const tgt = props.nodes.find(n => n.id === edge.target)
  if (!src || !tgt) return { path: '', labelX: 0, labelY: 0 }
  const { sx, sy, tx, ty, sDir, tDir } = getAnchors(src, tgt)
  const type = edge.type || 'default'
  let path = ''
  if (type === 'straight') {
    path = `M ${sx} ${sy} L ${tx} ${ty}`
  } else if (type === 'step' || type === 'smoothstep') {
    if (sDir === 'bottom' || sDir === 'top') {
      const my = (sy + ty) / 2
      path = `M ${sx} ${sy} L ${sx} ${my} L ${tx} ${my} L ${tx} ${ty}`
    } else {
      const mx = (sx + tx) / 2
      path = `M ${sx} ${sy} L ${mx} ${sy} L ${mx} ${ty} L ${tx} ${ty}`
    }
    if (type === 'smoothstep') {
      // 简易圆角：用 Q 替换 L 拐角
      const r = 6
      if (sDir === 'bottom' || sDir === 'top') {
        const my = (sy + ty) / 2
        const dy = my - sy
        path = `M ${sx} ${sy} L ${sx} ${my - Math.sign(dy) * r} Q ${sx} ${my} ${sx + Math.sign(tx - sx) * r} ${my} L ${tx - Math.sign(tx - sx) * r} ${my} Q ${tx} ${my} ${tx} ${my + Math.sign(ty - my) * r} L ${tx} ${ty}`
      }
    }
  } else {
    // bezier（默认）
    const offset = Math.max(40, Math.abs(ty - sy) * 0.5, Math.abs(tx - sx) * 0.5)
    let c1x = sx, c1y = sy, c2x = tx, c2y = ty
    if (sDir === 'bottom') c1y += offset
    else if (sDir === 'top') c1y -= offset
    else if (sDir === 'right') c1x += offset
    else if (sDir === 'left') c1x -= offset
    if (tDir === 'bottom') c2y += offset
    else if (tDir === 'top') c2y -= offset
    else if (tDir === 'right') c2x += offset
    else if (tDir === 'left') c2x -= offset
    path = `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`
  }
  return { path, labelX: (sx + tx) / 2, labelY: (sy + ty) / 2 }
}

// 缓存计算结果（依赖 dims 变化）
const edgeGeom = (edge: Edge): EdgeGeom => {
  // 引用 dims 触发响应式
  void dims.size
  return buildPath(edge)
}

/* ============================================================
 * 边样式计算
 * ============================================================ */
const edgeStroke = (edge: Edge) => {
  if (edge.class === 'edge-highlighted') return '#10b981'
  if (edge.class === 'edge-dimmed') return '#cbd5e1'
  if (edge.selected) return '#4f46e5'
  return (edge.style && edge.style.stroke) || '#6366f1'
}
const edgeStrokeWidth = (edge: Edge) => {
  if (edge.class === 'edge-highlighted') return 3
  if (edge.class === 'edge-dimmed') return 1
  return (edge.style && edge.style.strokeWidth) || 2
}
const edgeDash = (edge: Edge) => {
  if (edge.class === 'edge-highlighted') return '8'
  return ''
}
const showArrow = (edge: Edge) => true
const edgeW = (edge: Edge) => String(edge.label || '').length * 7 + 16
const labelW = (edge: Edge) => edgeW(edge)
const labelHalfW = (edge: Edge) => edgeW(edge) / 2

/* ============================================================
 * 缩放与平移
 * ============================================================ */
const clampZoom = (z: number) => Math.min(props.maxZoom, Math.max(props.minZoom, z))

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const el = wrapperRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  // 以鼠标为中心缩放
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newZoom = clampZoom(zoom.value * delta)
  // 保持鼠标点在画布坐标系不变：world = (screen - pan) / zoom
  const wx = (mx - pan.x) / zoom.value
  const wy = (my - pan.y) / zoom.value
  zoom.value = newZoom
  pan.x = mx - wx * newZoom
  pan.y = my - wy * newZoom
}

const zoomIn = () => { zoom.value = clampZoom(zoom.value * 1.2) }
const zoomOut = () => { zoom.value = clampZoom(zoom.value / 1.2) }
const resetZoom = () => { zoom.value = 1 }

const fitView = (opts?: { duration?: number; padding?: number; maxZoom?: number; nodes?: string[] }) => {
  if (!props.nodes.length || !wrapperRef.value) return
  const padding = opts?.padding ?? 60
  // 支持仅拟合指定节点（VueFlow fitView 兼容）
  const targetNodes = opts?.nodes?.length
    ? props.nodes.filter(n => opts.nodes!.includes(n.id))
    : props.nodes
  if (!targetNodes.length) return
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of targetNodes) {
    const d = getDim(n.id)
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + d.w)
    maxY = Math.max(maxY, n.position.y + d.h)
  }
  const w = maxX - minX
  const h = maxY - minY
  if (w <= 0 || h <= 0) return
  const availW = Math.max(100, size.w - padding * 2)
  const availH = Math.max(100, size.h - padding * 2)
  const z = Math.min(availW / w, availH / h)
  zoom.value = clampZoom(Math.min(z, opts?.maxZoom ?? props.maxZoom))
  pan.x = (size.w - w * zoom.value) / 2 - minX * zoom.value
  pan.y = (size.h - h * zoom.value) / 2 - minY * zoom.value
}

const screenToFlowCoordinate = (client: { x: number; y: number }) => {
  const el = wrapperRef.value
  if (!el) return { x: 0, y: 0 }
  const rect = el.getBoundingClientRect()
  return {
    x: (client.x - rect.left - pan.x) / zoom.value,
    y: (client.y - rect.top - pan.y) / zoom.value,
  }
}

/* ============================================================
 * 选择：单击 / Ctrl / Shift / 框选
 * ============================================================ */
const clearSelection = () => {
  props.nodes.forEach(n => { n.selected = false })
  props.edges.forEach(e => { e.selected = false })
}
const selectSingle = (node: Node) => {
  clearSelection()
  node.selected = true
}
const toggleSelect = (node: Node) => {
  node.selected = !node.selected
}

const onNodeClick = (e: MouseEvent, node: Node) => {
  emit('node-click', { node, event: e })
}
const onNodeDoubleClick = (e: MouseEvent, node: Node) => {
  emit('node-double-click', { node, event: e })
}
const onEdgeClick = (e: MouseEvent, edge: Edge) => {
  clearSelection()
  edge.selected = true
  emit('edge-click', { edge, event: e })
}
const onEdgeDoubleClick = (e: MouseEvent, edge: Edge) => {
  emit('edge-double-click', { edge, event: e })
}

/* ============================================================
 * 节点拖拽
 * ============================================================ */
interface DragState {
  startX: number
  startY: number
  nodes: Array<{ id: string; origX: number; origY: number }>
  moved: boolean
}
let dragState: DragState | null = null

const onNodeMouseDown = (e: MouseEvent, node: Node) => {
  // 仅左键
  if (e.button !== 0) return
  // 修饰键：切换选择，不启动拖拽
  if (e.ctrlKey || e.metaKey) {
    toggleSelect(node)
    return
  }
  if (e.shiftKey) {
    if (!node.selected) node.selected = true
    return
  }
  // 若点击的节点未选中，先单选
  if (!node.selected) {
    selectSingle(node)
  }
  // 收集所有选中节点
  const selectedNodes = props.nodes.filter(n => n.selected)
  dragState = {
    startX: e.clientX,
    startY: e.clientY,
    nodes: selectedNodes.map(n => ({ id: n.id, origX: n.position.x, origY: n.position.y })),
    moved: false,
  }
  document.addEventListener('mousemove', onDocMouseMove)
  document.addEventListener('mouseup', onDocMouseUp)
}

/* ============================================================
 * 平移 & 框选（在空白区域 mousedown）
 *
 * 交互约定（与 Figma/Miro 等设计工具一致）：
 * - 左键拖拽空白区域 = 框选（默认行为，最直观）
 * - 中键拖拽 / 按住 Space + 左键拖拽 = 平移画布
 * - 滚轮 = 缩放（以鼠标为中心）
 * - Shift + 左键拖拽 = 框选（附加到已选）
 * - Ctrl/Cmd + 左键拖拽 = 框选（附加到已选）
 * - 右键 = 上下文菜单（由 RuleDesigner 处理）
 * ============================================================ */
let panState: { startX: number; startY: number; origPanX: number; origPanY: number; moved: boolean } | null = null
const boxSel = ref<{ x: number; y: number; w: number; h: number } | null>(null)
let boxSelStart: { x: number; y: number } | null = null
let boxSelAdditive = false // 框选时是否附加到已选
const isSpacePressed = ref(false)

const onKeyDownSpace = (e: KeyboardEvent) => {
  if (e.code === 'Space' && !isSpacePressed.value) {
    // 避免在输入框中触发
    const target = e.target as HTMLElement
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
    isSpacePressed.value = true
    e.preventDefault()
  }
}
const onKeyUpSpace = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    isSpacePressed.value = false
  }
}

const onWrapperMouseDown = (e: MouseEvent) => {
  // 中键 / 按住 Space 的左键 = 平移（备用，兼容 Figma 习惯）
  const isPanGesture =
    e.button === 1 || // 中键
    (e.button === 0 && isSpacePressed.value) // Space + 左键

  if (isPanGesture) {
    panState = { startX: e.clientX, startY: e.clientY, origPanX: pan.x, origPanY: pan.y, moved: false }
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)
    e.preventDefault()
    return
  }

  if (e.button !== 0) return

  // Shift/Ctrl/Cmd + 左键 = 框选（保留已选并追加）
  // 左键 = 平移画布（默认）；若无拖动则视为点击 → 清空选择
  const isBoxSelect = e.shiftKey || e.ctrlKey || e.metaKey
  if (!isBoxSelect) {
    // 默认：左键拖拽 = 平移画布；松开时若未拖动则清空选择
    panState = { startX: e.clientX, startY: e.clientY, origPanX: pan.x, origPanY: pan.y, moved: false }
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)
    return
  }

  // 框选模式：Shift/Ctrl + 左键
  boxSelAdditive = true
  const pt = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
  boxSelStart = { x: pt.x, y: pt.y }
  boxSel.value = { x: pt.x, y: pt.y, w: 0, h: 0 }
  document.addEventListener('mousemove', onDocMouseMove)
  document.addEventListener('mouseup', onDocMouseUp)
}

/* ============================================================
 * 全局 mousemove / mouseup
 * ============================================================ */
const onDocMouseMove = (e: MouseEvent) => {
  // 拖拽节点
  if (dragState) {
    const dx = (e.clientX - dragState.startX) / zoom.value
    const dy = (e.clientY - dragState.startY) / zoom.value
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragState.moved = true
    for (const item of dragState.nodes) {
      const n = props.nodes.find(x => x.id === item.id)
      if (!n) continue
      let nx = item.origX + dx
      let ny = item.origY + dy
      if (props.snapToGrid) {
        const [gx, gy] = props.snapGrid
        nx = Math.round(nx / gx) * gx
        ny = Math.round(ny / gy) * gy
      }
      n.position = { x: nx, y: ny }
    }
    return
  }
  // 平移
  if (panState) {
    const dx = e.clientX - panState.startX
    const dy = e.clientY - panState.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) panState.moved = true
    pan.x = panState.origPanX + dx
    pan.y = panState.origPanY + dy
    return
  }
  // 框选
  if (boxSelStart && boxSel.value) {
    const pt = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
    const x = Math.min(boxSelStart.x, pt.x)
    const y = Math.min(boxSelStart.y, pt.y)
    const w = Math.abs(pt.x - boxSelStart.x)
    const h = Math.abs(pt.y - boxSelStart.y)
    boxSel.value = { x, y, w, h }
    // 选择相交节点（附加模式下：保留已选并追加新选）
    for (const n of props.nodes) {
      const d = getDim(n.id)
      const intersects = n.position.x < x + w && n.position.x + d.w > x &&
                         n.position.y < y + h && n.position.y + d.h > y
      if (boxSelAdditive) {
        // 附加模式：仅追加，不清空
        if (intersects) n.selected = true
      } else {
        n.selected = intersects
      }
    }
    return
  }
  // 连线拖拽
  if (connecting.value) {
    const pt = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
    connecting.value.curX = pt.x
    connecting.value.curY = pt.y
    return
  }
}

const onDocMouseUp = (e: MouseEvent) => {
  if (dragState) {
    if (dragState.moved) emit('nodes-moved')
    dragState = null
  }
  if (panState) {
    // 若未发生明显拖动，则视为"点击空白" → 清空选择
    if (!panState.moved) {
      clearSelection()
    }
    panState = null
  }
  if (boxSel.value) {
    boxSel.value = null
    boxSelStart = null
  }
  if (connecting.value) {
    // 检测目标节点
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
    const nodeEl = el?.closest('[data-node-id]') as HTMLElement | null
    if (nodeEl) {
      const targetId = nodeEl.getAttribute('data-node-id') || ''
      if (targetId && targetId !== connecting.value.sourceId) {
        emit('connect', {
          source: connecting.value.sourceId,
          target: targetId,
          sourceHandle: connecting.value.sourceHandle,
          targetHandle: connecting.value.sourcePos, // 简化：目标侧使用命中位置
        })
      }
    }
    connecting.value = null
  }
  document.removeEventListener('mousemove', onDocMouseMove)
  document.removeEventListener('mouseup', onDocMouseUp)
}

/* ============================================================
 * 连线创建（由 Handle 通过 provide/inject 触发）
 * ============================================================ */
const connecting = ref<{
  sourceId: string
  sourceHandle: string
  sourcePos: string
  startX: number
  startY: number
  curX: number
  curY: number
} | null>(null)

const startConnection = (nodeId: string, _handleType: string, handleId: string, position: string, e: MouseEvent) => {
  const node = props.nodes.find(n => n.id === nodeId)
  if (!node) return
  const d = getDim(nodeId)
  let sx = node.position.x + d.w / 2
  let sy = node.position.y + d.h / 2
  if (position === 'bottom') sy = node.position.y + d.h
  else if (position === 'top') sy = node.position.y
  else if (position === 'right') sx = node.position.x + d.w
  else if (position === 'left') sx = node.position.x
  connecting.value = {
    sourceId: nodeId,
    sourceHandle: handleId,
    sourcePos: position,
    startX: sx,
    startY: sy,
    curX: sx,
    curY: sy,
  }
  document.addEventListener('mousemove', onDocMouseMove)
  document.addEventListener('mouseup', onDocMouseUp)
  e.preventDefault()
}

provide('ruleCanvas', { startConnection })

const connectingPath = computed(() => {
  if (!connecting.value) return ''
  const c = connecting.value
  const dx = c.curX - c.startX
  const dy = c.curY - c.startY
  const offset = Math.max(40, Math.abs(dy) * 0.5)
  return `M ${c.startX} ${c.startY} C ${c.startX} ${c.startY + (Math.abs(dy) > Math.abs(dx) ? Math.sign(dy || 1) * offset : 0)}, ${c.curX} ${c.curY - (Math.abs(dy) > Math.abs(dx) ? Math.sign(dy || 1) * offset : 0)}, ${c.curX} ${c.curY}`
})

/* ============================================================
 * v-model 兼容方法：addNodes / addEdges / removeNodes / removeEdges
 * ============================================================ */
const addNodes = (n: Node | Node[]) => {
  const arr = Array.isArray(n) ? n : [n]
  props.nodes.push(...arr)
}
const addEdges = (e: Edge | Edge[]) => {
  const arr = Array.isArray(e) ? e : [e]
  props.edges.push(...arr)
}
const removeNodes = (ids: string | string[]) => {
  const set = new Set(Array.isArray(ids) ? ids : [ids])
  const arr = props.nodes
  for (let i = arr.length - 1; i >= 0; i--) {
    if (set.has(arr[i].id)) arr.splice(i, 1)
  }
}
const removeEdges = (ids: string | string[]) => {
  const set = new Set(Array.isArray(ids) ? ids : [ids])
  const arr = props.edges
  for (let i = arr.length - 1; i >= 0; i--) {
    if (set.has(arr[i].id)) arr.splice(i, 1)
  }
}

/* ============================================================
 * 暴露给父组件
 * ============================================================ */
defineExpose({
  fitView,
  screenToFlowCoordinate,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  zoomIn,
  zoomOut,
  resetZoom,
  getZoom: () => zoom.value,
  // 获取节点实测尺寸（来自 DOM ResizeObserver）
  getNodeDim: (id: string) => getDim(id),
  setViewport: (v: { x?: number; y?: number; zoom?: number }) => {
    if (v.x !== undefined) pan.x = v.x
    if (v.y !== undefined) pan.y = v.y
    if (v.zoom !== undefined) zoom.value = v.zoom
  },
})

// 当节点尺寸首次可用时触发一次边重算
watch(() => dims.size, () => { /* 触发响应式更新 */ })

/* ============================================================
 * 小地图（Minimap）
 * - 计算所有节点的 bounding box
 * - 按比例缩放到 minimap 尺寸（最大 200x140）
 * - 显示当前视口矩形
 * - 支持点击/拖拽小地图来平移画布
 * ============================================================ */
const minimapRef = ref<HTMLElement | null>(null)
const minimapSize = reactive({ w: 200, h: 140 })

// 计算所有节点的 bounding box（flow 坐标系）
const flowBounds = computed(() => {
  if (!props.nodes.length) return { minX: 0, minY: 0, maxX: 100, maxY: 100 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const n of props.nodes) {
    const d = getDim(n.id)
    minX = Math.min(minX, n.position.x)
    minY = Math.min(minY, n.position.y)
    maxX = Math.max(maxX, n.position.x + d.w)
    maxY = Math.max(maxY, n.position.y + d.h)
  }
  // 加 padding 避免节点贴边
  const pad = 20
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad }
})

// 小地图缩放比例（flow → minimap）
const minimapScale = computed(() => {
  const b = flowBounds.value
  const fw = b.maxX - b.minX
  const fh = b.maxY - b.minY
  if (fw <= 0 || fh <= 0) return 1
  // 保持宽高比，适应 minimapSize
  const sx = minimapSize.w / fw
  const sy = minimapSize.h / fh
  return Math.min(sx, sy)
})

// 小地图中节点的位置/尺寸（minimap 坐标系）
const minimapNodes = computed(() => {
  const b = flowBounds.value
  const s = minimapScale.value
  return props.nodes.map(n => {
    const d = getDim(n.id)
    return {
      id: n.id,
      x: (n.position.x - b.minX) * s,
      y: (n.position.y - b.minY) * s,
      w: Math.max(2, d.w * s),
      h: Math.max(2, d.h * s),
      selected: !!n.selected
    }
  })
})

// 当前视口在小地图中的矩形
const viewportRect = computed(() => {
  const b = flowBounds.value
  const s = minimapScale.value
  // 视口左上角在 flow 坐标系中的位置：屏幕(0,0) → flow
  // screen = pan + flow * zoom → flow = (screen - pan) / zoom
  const flowLeft = -pan.x / zoom.value
  const flowTop = -pan.y / zoom.value
  const flowW = size.w / zoom.value
  const flowH = size.h / zoom.value
  return {
    x: (flowLeft - b.minX) * s,
    y: (flowTop - b.minY) * s,
    w: flowW * s,
    h: flowH * s
  }
})

// 小地图点击/拖拽：将点击位置转为画布平移
const onMinimapMouseDown = (e: MouseEvent) => {
  if (!minimapRef.value) return
  const rect = minimapRef.value.getBoundingClientRect()
  const b = flowBounds.value
  const s = minimapScale.value
  // 点击位置（minimap 坐标系）
  const moveViewport = (clientX: number, clientY: number) => {
    // minimap 坐标
    const mx = clientX - rect.left
    const my = clientY - rect.top
    // 转换为 flow 坐标（小地图中心对齐到鼠标）
    const flowX = mx / s + b.minX
    const flowY = my / s + b.minY
    // 让该 flow 坐标对应屏幕中心 → pan = center - flow * zoom
    pan.x = size.w / 2 - flowX * zoom.value
    pan.y = size.h / 2 - flowY * zoom.value
  }
  // 立即响应一次点击
  moveViewport(e.clientX, e.clientY)
  // 支持拖拽
  const onMove = (ev: MouseEvent) => moveViewport(ev.clientX, ev.clientY)
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
  e.preventDefault()
}
</script>

<style scoped lang="scss">
@import './styles/design-tokens.scss';

.rule-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: $rd-bg-canvas;
  cursor: grab;
  user-select: none;

  /* 按下时变 grabbing，明确告知画布可拖拽 */
  &:active { cursor: grabbing; }

  /* 按住 Space 时强化提示（与默认相同） */
  &.is-panning {
    cursor: grab;
    &:active { cursor: grabbing; }
  }
}

.rule-canvas-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  display: block;
}

/* 边命中区可接收事件 */
.rule-canvas-svg :deep(.edge-hit) {
  pointer-events: stroke;
  cursor: pointer;
}

/* 边选中/悬停效果 */
.rule-canvas-svg :deep(.rule-canvas-edge) {
  .edge-line {
    transition: stroke 0.15s, stroke-width 0.15s;
  }
  &.selected .edge-line {
    stroke: $rd-primary !important;
    stroke-width: 3 !important;
  }
  &:hover:not(.selected) .edge-line {
    stroke: $rd-primary-border !important;
    stroke-width: 2.5 !important;
  }
}

/* 边高亮（执行回溯） */
.rule-canvas-svg :deep(.edge-highlighted) .edge-line {
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
  stroke-dasharray: 8;
  animation: rule-dash 0.5s linear infinite;
}
.rule-canvas-svg :deep(.edge-dimmed) .edge-line {
  opacity: 0.15;
}
@keyframes rule-dash {
  to { stroke-dashoffset: -16; }
}

/* HTML 节点层 */
.rule-canvas-nodes {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.rule-canvas-node {
  position: absolute;
  pointer-events: auto;
  cursor: grab;
  transition: outline-color $rd-transition-base, box-shadow $rd-transition-base;
  outline: 2px solid transparent;
  outline-offset: 3px;
  border-radius: $rd-radius-lg;

  &:active {
    cursor: grabbing;
  }
  &.selected {
    outline-color: $rd-primary;
    :deep(.gateway-shape) {
      filter: drop-shadow(0 0 0 2px $rd-primary);
    }
  }
  /* 节点高亮（执行回溯） */
  &:deep(.node-highlighted),
  &.node-highlighted {
    :deep(.node-card), :deep(.gateway-shape) {
      box-shadow: 0 0 0 3px $rd-success, 0 0 20px rgba(16, 185, 129, 0.4) !important;
      animation: rule-pulse 1.5s ease-in-out infinite;
    }
  }
  &.node-dimmed {
    opacity: 0.3;
    transition: opacity 0.3s;
  }
}

@keyframes rule-pulse {
  0%, 100% { box-shadow: 0 0 0 3px $rd-success, 0 0 20px rgba(16, 185, 129, 0.4); }
  50% { box-shadow: 0 0 0 5px $rd-success, 0 0 30px rgba(16, 185, 129, 0.7); }
}

.rule-canvas-default-node {
  padding: $rd-space-2 $rd-space-3;
  background: $rd-bg-surface;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  font-size: $rd-font-sm;
  color: $rd-text-secondary;
}

/* 缩放控制 */
.rule-canvas-controls {
  position: absolute;
  right: $rd-space-3;
  bottom: $rd-space-3;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: $rd-bg-surface;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  box-shadow: $rd-shadow-sm;
  overflow: hidden;
  z-index: 10;

  .rc-ctrl-btn {
    width: 30px;
    height: 30px;
    border: none;
    background: $rd-bg-surface;
    color: $rd-text-secondary;
    font-size: 16px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: $rd-bg-hover;
      color: $rd-primary;
    }
    & + .rc-ctrl-btn {
      border-top: 1px solid $rd-divider;
    }
  }
}

/* 框选矩形已在 SVG 中绘制，这里无需额外样式 */

/* 小地图 */
.rule-minimap {
  position: absolute;
  right: $rd-space-3;
  bottom: 50px; // 避开缩放控制按钮
  width: 200px;
  background: $rd-bg-surface;
  border: 1px solid $rd-border;
  border-radius: $rd-radius-md;
  box-shadow: $rd-shadow-md;
  z-index: 10;
  user-select: none;
  overflow: hidden;

  .minimap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 600;
    color: $rd-text-secondary;
    background: $rd-bg-hover;
    border-bottom: 1px solid $rd-divider;

    .minimap-close {
      width: 18px;
      height: 18px;
      border: none;
      background: transparent;
      color: $rd-text-tertiary;
      font-size: 14px;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: $rd-error;
      }
    }
  }

  .minimap-svg {
    display: block;
    background: $rd-bg-canvas;
    cursor: pointer;

    .mini-node {
      fill: $rd-text-tertiary;
      stroke: $rd-border;
      stroke-width: 0.5;
      opacity: 0.7;

      &.mini-node-selected {
        fill: $rd-primary;
        opacity: 1;
      }
    }

    .mini-viewport {
      fill: rgba(59, 130, 246, 0.08);
      stroke: $rd-primary;
      stroke-width: 1.2;
      pointer-events: none;
    }
  }
}
</style>
