import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
/**
 * 流程设计器组件注册器。
 *
 * 将设计器的节点组件（nodes/）与通用组件（common/）注册为全局组件。
 * 节点树通过 `<component :is="node.type">` 动态渲染，组件名与节点 type 一致，
 * 因此节点组件必须全局注册（与 shdevopsui 原实现保持一致）。
 *
 * 使用方式（宿主项目入口）：
 * ```ts
 * import { registerWorkflowDesigner } from "star-horse-form";
 * app.use(registerWorkflowDesigner);
 * ```
 */
import type { App, Component } from "vue";
import { defineAsyncComponent } from "vue";
import { isDebugEnabled } from "@/utils/debugLog";

/** 节点组件（组件名 = 文件名 = 节点 type） */
const nodeItems = import.meta.glob("@/components/workflow/designer/nodes/*.vue");
/** 通用组件（EditName / DeleteConfirm / FlowZoom 等） */
const commonItems = import.meta.glob("@/components/workflow/designer/common/*.vue");

const collect = (items: Record<string, unknown>) => {
  const map: Record<string, Component> = {};
  for (const [key, value] of Object.entries(items)) {
    const name = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."));
    map[name] = defineAsyncComponent(value as any);
  }
  return map;
};

const nodeComponents = collect(nodeItems);
const commonComponents = collect(commonItems);

/** 安装函数（兼容 app.use 调用） */
export default function install(app: App<Element>) {
  for (const [name, comp] of Object.entries(nodeComponents)) {
    app.component(name, comp);
  }
  for (const [name, comp] of Object.entries(commonComponents)) {
    app.component(name, comp);
  }
  if (isDebugEnabled()) {
    dlog(
      "[workflow-designer] registered components:",
      Object.keys(nodeComponents).length + Object.keys(commonComponents).length,
    );
  }
}

export { nodeComponents, commonComponents };
