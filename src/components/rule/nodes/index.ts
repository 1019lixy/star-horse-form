/**
 * 内置默认节点集汇总
 *
 * 每个节点的定义、渲染组件、编辑器、行为钩子聚合在各自模块内；
 * 此处仅负责组装默认分类结构与新建流程模板。
 */
import type {NodeCategory, NodeTypeDef} from "../nodeTypes";
import {startDef, FLOW_START_TYPE} from "./start";
import {endDef} from "./end";
import {conditionDef} from "./condition";
import {actionDef} from "./action";
import {exclusiveGatewayDef} from "./exclusive-gateway";
import {variableAssignDef} from "./variable-assign";
import {scriptDef} from "./script";
import {httpCallDef} from "./http-call";

export const BUILT_IN_NODE_DEFS: NodeTypeDef[] = [
  startDef,
  endDef,
  conditionDef,
  actionDef,
  exclusiveGatewayDef,
  variableAssignDef,
  scriptDef,
  httpCallDef,
];

export const BUILT_IN_NODE_TYPES: ReadonlySet<string> = new Set(
  BUILT_IN_NODE_DEFS.map((d) => d.type),
);

export {FLOW_START_TYPE};

/** 内置分类面板结构（可被 configureRuleNodes 扩展/裁剪） */
export const builtinCategories = (): NodeCategory[] => [
  {
    name: "rule.category.basic",
    icon: "🎯",
    color: "#8b5cf6",
    nodes: [startDef, endDef, conditionDef, actionDef, exclusiveGatewayDef],
  },
  {
    name: "rule.category.advanced",
    icon: "⚙️",
    color: "#10b981",
    nodes: [httpCallDef, variableAssignDef, scriptDef],
  },
];

/** 新建流程默认模板：起点 → 终点 */
export const getDefaultFlowTemplate = (): {
  nodes: any[];
  edges: any[];
} => ({
  nodes: [
    {id: "start_1", type: startDef.type, position: {x: 400, y: 50}, data: {}},
    {id: "end_1", type: endDef.type, position: {x: 400, y: 400}, data: {}},
  ],
  edges: [],
});