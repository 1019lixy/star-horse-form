/**
 * 流程设计器核心模块统一导出。
 *
 * 该模块从 shdevopsui 流程设计器移植而来，包含流程节点树操作、节点配置工厂、
 * 节点校验、流程设计 Store 与可插拔运行时配置，**不包含任何 UI 组件**。
 *
 * 对外引用方式：
 * ```ts
 * import {
 *   FlowNodeEnums,
 *   nodePrepList,
 *   configureWorkflow,
 *   useFlowDesignStore,
 *   getFlowDesignStore,
 * } from "star-horse-form";
 * ```
 */
export * from "@/components/workflow/enums/FlowNodeEnums";
export * from "@/components/workflow/types";
export * from "@/components/workflow/config/workflowConfig";
export * from "@/components/workflow/utils";
export * from "@/components/workflow/validator";
export { useFlowDesignStore } from "@/store/FlowDesign";
