/**
 * 流程通用操作。
 *
 * 从 shdevopsui 移植：封装与流程设计 Store 交互的常用操作，供节点组件调用。
 * 依赖 StoreManager 提供的 `getFlowDesignStore`，避免直接耦合 pinia 实例。
 */
import { scale } from "@/components/workflow/utils/deviceUtil";
import { getFlowDesignStore } from "@/store/StoreManager";

/**
 * 打开节点侧边配置。
 * @param _name 预留（原 UI 侧边栏句柄，逻辑层不再使用）
 * @param node 目标节点
 * @param _routeNode 预留
 */
export function open(_name: any, node: any, _routeNode: any) {
  getFlowDesignStore().activeNode(node);
}

/** 关闭配置：取消当前激活节点 */
export function close() {
  getFlowDesignStore().setActive(false);
}

/**
 * 删除节点（store 编排版，带回调）。
 * @param node 待删除节点
 * @param fun 删除后回调
 */
export function flowDelNode(node: any, fun: Function) {
  getFlowDesignStore().flowDelNode(node);
  if (fun) {
    fun(node);
  }
}

/** 添加分支节点（store 编排版） */
export function flowAddBranch(node: any) {
  getFlowDesignStore().flowAddBranch(node);
}

/** 审批配置审批人 Radio 组件样式 */
export function radioStyle() {
  return {
    display: "block",
    height: "22px",
    lineHeight: "22px",
    "margin-bottom": "16px",
  };
}

/** 审批配置审批人 Radio 组件样式（按设备宽度自适应） */
export function approvalRadioStyle() {
  const width = scale.isMobile() ? "45%" : "31%";
  return {
    width: width,
    lineHeight: "22px",
    marginBottom: "16px",
  };
}

/** 节点头部状态样式类 */
export function nameClass(node: any, defaultStyle: any) {
  if (node.statusCode == -1) {
    return defaultStyle;
  }
  return {
    "node-status-not": node.statusCode == 0,
    "node-status-current": node.statusCode == 1,
    "node-status-complete": node.statusCode == 2,
  };
}

/** 流程通用常量（样式/尺寸） */
export const flowCommon = {
  isActive: false,
  size: "default",
  bodyStyle: {
    height: "100%",
    "overflow-y": "auto",
  },
};