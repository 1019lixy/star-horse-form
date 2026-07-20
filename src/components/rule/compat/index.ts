/**
 * 轻量级 VueFlow 兼容层
 *
 * 用途：在移除 @vue-flow/core 依赖后，仍保留 Handle / Position / ConnectionMode
 * 的 API 表面，使现有节点组件只需替换 import 路径即可继续工作。
 *
 * 数据结构保持 VueFlow 兼容：
 * - 节点：{ id, type, position: {x, y}, data, selected?, class? }
 * - 边：  { id, source, target, label?, labelStyle?, type?, style?, data?, animated? }
 *
 * 这样后端接口（flowContent JSON）无需变更。
 */

export { default as Handle } from './Handle.vue'

export const Position = {
  Top: 'top' as const,
  Right: 'right' as const,
  Bottom: 'bottom' as const,
  Left: 'left' as const,
}
export type Position = typeof Position[keyof typeof Position]

/**
 * 连接模式（仅做枚举占位，实际行为由 RuleCanvas 控制）
 * - Strict：源 source → 目标 target
 * - Loose：任意 handle 都可作为源/目标
 */
export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

/**
 * VueFlow 节点类型（保持与 @vue-flow/core Node 一致的最小形状）
 * type/data 为必填，与 ExecutionNode 兼容
 */
export interface Node {
  id: string
  type: string
  position: { x: number; y: number }
  data: any
  selected?: boolean
  class?: string
  dimensions?: { width: number; height: number }
  [key: string]: any
}

/**
 * VueFlow 边类型（保持与 @vue-flow/core Edge 一致的最小形状）
 */
export interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
  labelStyle?: Record<string, any>
  labelShowBg?: boolean
  labelBgStyle?: Record<string, any>
  type?: string
  style?: Record<string, any>
  data?: any
  animated?: boolean
  selected?: boolean
  class?: string
  [key: string]: any
}

/**
 * 连接事件参数（保持与 VueFlow @connect 事件一致）
 */
export interface Connection {
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}
