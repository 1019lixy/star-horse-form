/**
 * 规则引擎节点注册表（机制层）
 *
 * 无状态 lib 库原则：
 * - 本文件只提供"类型定义 + 注册表机制"，不穷举任何具体节点；
 * - 内置节点作为默认注册集位于 nodes/{type}/ 目录，每个节点的
 *   画布渲染、编辑器、面板片段、行为钩子全部聚合在各自目录内；
 * - 宿主应用通过 configureRuleNodes / registerRuleNode 在运行时
 *   增删节点与分类；注册表为 Vue 响应式状态。
 */

import {ref} from "vue";
import type {Component} from "vue";
import {i18n} from "@/lang";

import {builtinCategories} from "./nodes";

export interface ParamField {
  name: string;
  label: string | Function;
  type:
    | "input"
    | "number"
    | "select"
    | "multiselect"
    | "textarea"
    | "date"
    | "switch"
    | "table";
  required?: boolean;
  options?: { label: string | Function; value: any }[];
  placeholder?: string;
  default?: any;
  group?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  fieldSelect?: boolean;
  columns?: {
    prop: string;
    label: string;
    type?: "input" | "select";
    options?: any[];
    width?: string;
    fieldSelect?: boolean;
    hideOnActionTypes?: string[];
    showOnActionTypes?: string[];
  }[];
}

// ═══════════════════════════════════════════════════════
// 统一数据结构体系：基础节点 + 动作派生
// ═══════════════════════════════════════════════════════

/**
 * 节点大类标识——区分基础节点与动作派生节点。
 * - flow:      流程锚点（start / end）
 * - condition: 条件判断（condition / exclusive-gateway）
 * - action:    动作执行（action 及其所有派生类型）
 */
export type NodeClass = "flow" | "condition" | "action";

/** 触发事件类型（与 useRuleEngine.TriggerEvent 对齐） */
export type TriggerEventType =
  | "ON_LOAD"
  | "ON_CHANGE"
  | "ON_SUBMIT"
  | "ON_VALIDATE"
  | "ON_BUTTON_CLICK";

/** 开始节点的触发事件配置 */
export interface TriggerEventConfig {
  type: TriggerEventType;
  /** ON_CHANGE 时指定监听字段 */
  field?: string;
  /** ON_BUTTON_CLICK 时指定按钮 ID */
  buttonId?: string;
}

/** 动作节点的 actionType 标识——所有动作派生节点的统一枚举 */
export const ActionType = {
  FORM_CONTROL: "FORM_CONTROL",
  HTTP_CALL: "HTTP_CALL",
  SCRIPT: "SCRIPT",
  VARIABLE_ASSIGN: "VARIABLE_ASSIGN",
} as const;

/** 动作节点统一基类数据 */
export interface BaseActionNodeData {
  /** 动作类型标识（派生标记） */
  actionType: string;
}

/** 出边标签生成上下文 */
export interface EdgeLabelContext {
  /** 源节点 data */
  data: Record<string, any>;
  /** 当前是源节点的第几条出边（0 起） */
  outIndex: number;
}

export interface EdgeLabelResult {
  label: string;
  labelStyle?: Record<string, any>;
}

/**
 * 节点画布交互事件映射：
 * 将自定义渲染组件 emit 的事件名映射为 RuleNodeHost 的统一宿主动作，
 * 设计器不感知任何具体事件名。
 */
export interface NodeUiEvents {
  /** 编辑节点数据中某列表项的子组件 emit 名，如 "editCondition" */
  editItemEvent?: string;
  /** 删除某列表项的子组件 emit 名，如 "deleteCondition" */
  deleteItemEvent?: string;
  /** 列表项所在的 data 键名（如 "conditions"），供统一删除/编辑动作定位 */
  listKey?: string;
}

export interface NodeTypeDef {
  type: string;
  label: string;
  icon: string;
  /** 节点逻辑类别标记（写入 flowContent，供执行器识别） */
  category: string;
  /** 节点大类：flow（流程锚点）/ condition（条件判断）/ action（动作执行） */
  nodeClass: NodeClass;
  desc: string;
  /** 画布渲染组件；缺省回退 GenericNode */
  component?: Component;
  /**
   * 统一协议属性编辑器组件。
   * props: { nodeData, itemIndex, variables }；emits: save(patch) / close。
   * save 必须返回要 merge 进 node.data 的补丁对象。
   */
  editor?: Component;
  /** 属性面板弹窗编辑入口的提示文案（i18n key）；缺省不显示提示 */
  editorHint?: string;
  /**
   * 属性面板片段组件（节点参数编辑 UI 内聚到节点模块）。
   * props: { nodeData, variables }；emits: update(patch) / configure(itemIndex?)。
   * 缺省时面板仅显示节点信息头 + 通用 paramSchema 渲染。
   */
  panelSection?: Component;
  /** 节点配置摘要（画布/列表展示用）；由节点自行计算，设计器不硬编码类型 */
  getSummary?: (data: Record<string, any>) => string;
  /** 子组件事件名映射（edit / editItem / deleteItem → 宿主动作） */
  uiEvents?: NodeUiEvents;
  defaultData: () => Record<string, any>;
  paramSchema: ParamField[];
  /** 画布尺寸估算（拖拽布局 fallback 用） */
  estimateSize?: (data: Record<string, any>) => {
    width: number;
    height: number;
  };
  /** 出边标签自动生成；未注册的节点不做自动标签 */
  getEdgeLabel?: (ctx: EdgeLabelContext) => EdgeLabelResult | string;
  /** 测试面板参数提取：向 fields 中追加去重后的字段引用 */
  collectTestFields?: (
    data: Record<string, any>,
    fields: { name: string; type: string }[],
    seen: Set<string>,
  ) => void;
  /**
   * 收集节点内可持久化条目（保存时按 listKey 拆解批量入库，
   * 如 condition → conditions、action → actions）
   */
  collectItems?: (
    data: Record<string, any>,
  ) => { listKey: string; items: any[] };
}

export interface NodeCategory {
  name: string;
  icon: string;
  color: string;
  nodes: NodeTypeDef[];
}

// ═══════════════════════════════════════════════════════
// 响应式注册表
// ═══════════════════════════════════════════════════════

const registry = ref<NodeCategory[]>([]);

/** 已移除但保留查询的节点定义（旧流程数据兼容渲染用） */
const retiredDefs = ref<Map<string, NodeTypeDef>>(new Map());

const findCategory = (name: string) =>
  registry.value.find((c) => c.name === name);

function removeDefFromRegistry(type: string): NodeTypeDef | undefined {
  for (const cat of registry.value) {
    const idx = cat.nodes.findIndex((n) => n.type === type);
    if (idx >= 0) return cat.nodes.splice(idx, 1)[0];
  }
  return undefined;
}

export interface ConfigureRuleNodesOptions {
  /** 追加整个新分类 */
  extraCategories?: NodeCategory[];
  /** 向指定分类追加节点；分类不存在时自动创建 */
  extraNodes?: {
    categoryName: string;
    icon?: string;
    color?: string;
    nodes: NodeTypeDef[];
  }[];
  /** 从面板隐藏指定类型（旧数据仍可渲染） */
  disabledNodeTypes?: string[];
}

/**
 * 批量配置节点注册表（无状态注入）
 *
 * @example 屏蔽内置 script 节点并追加自定义节点
 * ```ts
 * import MyAuditNode from "./MyAuditNode.vue";
 * configureRuleNodes({
 *   disabledNodeTypes: ["script"],
 *   extraNodes: {
 *     categoryName: "业务节点",
 *     icon: "🏢",
 *     color: "#f59e0b",
 *     nodes: [{ type: "my-audit", ..., component: MyAuditNode }],
 *   },
 * });
 * ```
 */
export function configureRuleNodes(opts: ConfigureRuleNodesOptions): void {
  if (opts.extraCategories?.length) {
    for (const cat of opts.extraCategories) {
      const existing = findCategory(cat.name);
      if (existing) existing.nodes.push(...cat.nodes);
      else registry.value.push({...cat, nodes: [...cat.nodes]});
    }
  }
  if (opts.extraNodes) {
    for (const {categoryName, icon, color, nodes} of opts.extraNodes) {
      let cat = findCategory(categoryName);
      if (!cat) {
        cat = {
          name: categoryName,
          icon: icon || "🧩",
          color: color || "#64748b",
          nodes: [],
        };
        registry.value.push(cat);
      }
      cat.nodes.push(...nodes);
    }
  }
  if (opts.disabledNodeTypes?.length) {
    disableRuleNodeTypes(opts.disabledNodeTypes);
  }
}

/**
 * 注册单个节点。同 type 重复注册覆盖旧定义；
 * categoryName 缺省归入第一个已存在分类。
 */
export function registerRuleNode(
  def: NodeTypeDef,
  categoryName?: string,
): void {
  removeDefFromRegistry(def.type);
  const cat =
    (categoryName && findCategory(categoryName)) ||
    (categoryName ? null : registry.value[0]);
  if (cat) cat.nodes.push(def);
  else
    registry.value.push({
      name: categoryName || "rule.category.custom",
      icon: "🧩",
      color: "#64748b",
      nodes: [def],
    });
}

/** 彻底移除节点类型（getNodeTypeMap 不再可查） */
export function unregisterRuleNodeType(type: string): void {
  removeDefFromRegistry(type);
}

/** 从面板隐藏节点类型；定义转入退役区供旧数据兜底查询 */
export function disableRuleNodeTypes(types: string[]): void {
  for (const t of types) {
    const def = removeDefFromRegistry(t);
    if (def) retiredDefs.value.set(t, def);
  }
}

/** 由内置模块调用：清空并重建默认注册集（仅 install 时使用） */
export function initRegistry(categories: NodeCategory[]): void {
  registry.value = categories;
  retiredDefs.value = new Map();
}

// ═══════════════════════════════════════════════════════
// 动态读取 API（消费方一律通过函数读取，勿缓存结果）
// ═══════════════════════════════════════════════════════

/** 当前分类面板结构（响应式） */
export const getNodeCategories = (): NodeCategory[] =>
  registry.value
    .map((c) => ({...c, nodes: [...c.nodes]}))
    .filter((c) => c.nodes.length > 0);

/** type → 定义映射（含退役定义，保证旧数据可渲染） */
export function getNodeTypeMap(): Record<string, NodeTypeDef> {
  const map: Record<string, NodeTypeDef> = {};
  for (const [, def] of retiredDefs.value) map[def.type] = def;
  for (const cat of registry.value)
    for (const n of cat.nodes) map[n.type] = n;
  return map;
}

export const getCategoryColor = (type: string): string => {
  const cat = registry.value.find((c) => c.nodes.some((n) => n.type === type));
  return cat?.color || "#64748b";
};

export const getNodeDef = (type: string): NodeTypeDef | undefined =>
  getNodeTypeMap()[type];

export const getNodeDefaultData = (type: string): Record<string, any> =>
  getNodeTypeMap()[type]?.defaultData() ?? {};

export const getNodeLabel = (type: string): string => {
  const raw = getNodeTypeMap()[type]?.label || type;
  return typeof raw === "string" && raw.startsWith("rule.") ? i18n(raw) : raw;
};
export const getParamSchema = (type: string): ParamField[] =>
  getNodeTypeMap()[type]?.paramSchema ?? [];

/**
 * 解析 Vue Flow 节点的真实类型：
 * generic 包装节点的真实类型存于 data.__nodeType，其余即 type 本身。
 */
export const resolveNodeType = (node: {
  type?: string;
  data?: any;
}): string =>
  node?.type === "generic"
    ? node?.data?.__nodeType || "generic"
    : node?.type || "";

/** 恢复内置默认节点注册集（清空宿主运行时增删的节点与分类） */
export function resetRuleNodes(): void {
  initRegistry(builtinCategories());
}

/**
 * 节点数据迁移：补齐旧数据缺失的统一结构字段。
 * - start 节点补 triggerEvent
 * - action 派生节点补 actionType
 * 在加载已保存规则时调用，保证旧数据兼容新结构。
 */
export function migrateNodeData(node: { type?: string; data?: any }): void {
  if (!node.data) return;
  const t = resolveNodeType(node);
  switch (t) {
    case "start":
      if (!node.data.triggerEvent) node.data.triggerEvent = {type: "ON_LOAD"};
      break;
    case "action":
      if (!node.data.actionType) node.data.actionType = ActionType.FORM_CONTROL;
      break;
    case "http-call":
      if (!node.data.actionType) node.data.actionType = ActionType.HTTP_CALL;
      break;
    case "script":
      if (!node.data.actionType) node.data.actionType = ActionType.SCRIPT;
      break;
    case "variable-assign":
      if (!node.data.actionType) node.data.actionType = ActionType.VARIABLE_ASSIGN;
      break;
  }
}

/** 批量迁移流程图中所有节点 */
export function migrateFlowNodes(nodes: any[]): void {
  if (!Array.isArray(nodes)) return;
  nodes.forEach((n) => migrateNodeData(n));
}

// 初始化内置默认注册集（registry 已声明，无 TDZ 风险）
initRegistry(builtinCategories());
