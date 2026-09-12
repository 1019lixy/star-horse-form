# 流程设计器核心模块（workflow）

> 从 `shdevopsui/src/views/workflow` 移植而来的**非 UI**核心逻辑，已解耦后端 API 与路由，可作为独立能力在其他项目中引用。

## 一、概述

本模块提供工作流设计器的状态管理、节点树操作、节点配置工厂、节点校验与可插拔运行时配置，**不包含任何 Vue UI 组件**。UI 层（节点渲染、配置面板等）由消费方自行实现，核心逻辑通过本模块驱动。

设计原则：
- **高内聚低耦合**：核心逻辑不直接调用后端，所有与后端交互的能力通过 `configureWorkflow` 注入。
- **可插拔**：节点用途、流程定义列表等均支持外部传入，避免硬编码。
- **后端驱动**：表单字段、流程定义等数据由外部加载后注入，前端不主动发请求。

## 二、目录结构

```
src/components/workflow/
├── enums/FlowNodeEnums.ts        # 节点类型枚举
├── types/
│   ├── FlowDesignType.ts         # 流程变量/基础信息/表单字段类型
│   ├── FlowNodeTypes.ts          # 多字段绑定类型（NodeFieldBinding 等）
│   └── index.ts
├── config/workflowConfig.ts      # 可插拔运行时配置（configureWorkflow）
├── utils/
│   ├── deviceUtil.ts             # 设备/屏幕工具
│   ├── nodeUtil.ts               # 节点树增删改查
│   ├── nodePreps.ts              # 节点默认配置工厂
│   ├── flowCommon.ts             # 流程通用操作（依赖 Store）
│   ├── flowMapUtil.ts            # 缩略图（html2canvas 可选）
│   └── index.ts
├── validator/
│   ├── NodeValidator.ts          # 节点校验
│   ├── FlowFormUtils.ts          # 保存/发布与校验编排（解耦 API）
│   └── index.ts
└── index.ts                      # 统一导出

src/store/FlowDesign.ts           # 流程设计 Store（pinia）
```

## 三、对外导出

通过包入口 `star-horse-form` 统一导出：

```ts
import {
  FlowNodeEnums,            // 节点类型枚举
  nodePrepList,             // 节点配置工厂
  nodeInfoList,             // 节点元信息列表
  addCondition, addBranch, delNode, delBranchNode, updateNode, getApproveNodes, // 节点树操作
  validateNode, validateAllNodes, validateBasicInfo, markNodeErrors, // 校验
  doSaveData, doValidate, formatValidateErrors,                          // 保存/校验编排
  configureWorkflow, getWorkflowConfig, resetWorkflowConfig,            // 运行时配置
  useFlowDesignStore, getFlowDesignStore,                                // Store
  flowCommon,                                                            // 通用操作
  scale,                                                                 // 设备工具
  updateMap,                                                             // 缩略图
  // 类型
  ProcessVariablesType, FlowFormInfoType, FormColumnOption,
  NodeFieldBinding, FieldBindingUsage, FieldValueMode, NodeFieldBindingConfig,
  FieldBindingUsageOption, BindableField,
  WorkflowRuntimeConfig, NodeInfo, NodeValidateResult,
} from "star-horse-form";
```

## 四、可插拔运行时配置

`configureWorkflow` 用于注入与后端交互的能力，未配置时核心逻辑仅做降级处理。

```ts
interface WorkflowRuntimeConfig {
  /** 加载表单可绑定字段 */
  loadFormColumns?: (formId: string | string[]) => Promise<FormColumnOption[]>;
  /** 保存或发布流程定义 */
  saveProcess?: (formInfo: FlowFormInfoType, type: string) => Promise<any>;
  /** 加载节点预置配置（可选） */
  loadNodePreps?: (prepId: string) => Promise<any>;
  /** 是否输出调试日志 */
  debug?: boolean;
}
```

使用示例：

```ts
import { configureWorkflow } from "star-horse-form";

configureWorkflow({
  debug: true,
  loadFormColumns: async (formId) => (await api.post("/analysisMainTableFieldsByIds", [formId])).data.data,
  saveProcess: async (formInfo, type) => (await api.post("/flowDefine/saveOrDeployProcess", { ...formInfo, submitType: type })).data,
});
```

## 五、流程设计 Store（useFlowDesignStore）

Pinia store，承载流程节点树状态与操作。

### State

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| node | ref\<any\> | 节点树根节点 |
| currentNode | ref\<any\> | 当前选中节点 |
| parentNode | ref\<any\> | 父节点 |
| flowFormInfo | ref\<any\> | 流程基础信息 |
| formId | ref\<string\> | 关联表单 ID |
| formColumns | ref\<FormColumnOption[]\> | 表单可绑定字段 |
| processVariables | ref\<ProcessVariablesType[]\> | 流程变量 |
| mapImg | ref\<string\> | 缩略图 dataURL |
| active | ref\<boolean\> | 是否激活配置 |
| mapVisible | ref\<boolean\> | 缩略图可见 |
| navable / readable | ref\<boolean\> | 导航/只读开关 |

### Actions

| 方法 | 说明 |
| --- | --- |
| flowSetNode(snode) | 初始化/设置节点树 |
| activeNode(node) | 选中节点 |
| flowAddNode(currentNode, parentNode, parentNodeType, id) | 添加节点 |
| flowAddBranch(snode) | 添加分支 |
| flowDelNode(snode) | 删除节点 |
| flowUpdateNode({currNode, field, value}) | 更新节点字段 |
| setFormId(id) | 设置表单 ID 并加载字段 |
| setFormColumns(columns) | 直接注入表单字段（后端驱动） |
| getFormColumns() | 获取表单字段（未加载时自动加载） |
| flowSetFormInfo(formInfo) | 设置流程基础信息 |
| init(stopInitFormInfo?) | 初始化 |
| refreshMap(autoRefresh) | 刷新缩略图 |

获取方式：

```ts
import { getFlowDesignStore } from "star-horse-form";
const store = getFlowDesignStore();
store.node;          // 节点树
store.flowAddNode(...);
```

## 六、节点类型枚举（FlowNodeEnums）

| 枚举 | 值 | 说明 |
| --- | --- | --- |
| START_NODE | "StartNode" | 开始节点 |
| APPLY_NODE | "ApplyNode" | 发起人节点 |
| APPROVER_NODE | "ApprovalNode" | 审批节点 |
| HANDLE_NODE | "HandleNode" | 办理节点 |
| COPYER_NODE | "CopyerNode" | 抄送节点 |
| BRANCH_NODE | "BranchNode" | 分支节点（路由） |
| BRANCH_CONDITION_NODE | "ConditionNode" | 分支条件节点 |
| PARALLEL_NODE | "ParallelNode" | 并行节点 |
| TIMER_NODE | "TimerNode" | 定时节点 |
| NOTICE_NODE | "NoticeNode" | 通知节点 |
| SERVICE_NODE | "ServiceNode" | 服务节点 |
| EVENT_NODE | "EventNode" | 事件节点 |
| SUGGEST_NODE | "SuggestNode" | 意见节点 |
| END_NODE | "EndNode" | 结束节点 |

## 七、节点配置工厂（nodePrepList）

```ts
import { nodePrepList, FlowNodeEnums } from "star-horse-form";
const startNode = nodePrepList(FlowNodeEnums.START_NODE);
const approverNode = nodePrepList(FlowNodeEnums.APPROVER_NODE);
```

`nodeInfoList()` 返回节点元信息（名称/编码/图标），供添加节点面板渲染。

## 八、节点树操作（nodeUtil）

纯函数，对节点树（childNode 线性链 + conditionNodes 分支）增删改查：

| 函数 | 说明 |
| --- | --- |
| addCondition(node, len) | 新增条件/并行子节点 |
| addBranch(node, currNode) | 同步分支节点 |
| delNode(node, currNode) | 删除普通节点 |
| delBranchNode(node, snode, currNode) | 删除分支节点 |
| updateNode(node, currNode, field, value) | 更新节点字段 |
| getApproveNodes(node, out) | 收集所有审批节点 |

## 九、校验器（NodeValidator）

```ts
import { validateAllNodes, validateBasicInfo, markNodeErrors, formatValidateErrors } from "star-horse-form";

const nodeResults = validateAllNodes(store.node);     // 校验所有节点
const basicResult = validateBasicInfo(formInfo);      // 校验基础信息
markNodeErrors(store.node, nodeResults);              // 标记错误到节点
```

`NodeValidateResult`：`{ valid, nodeId, nodeName, nodeType, errors[] }`。

## 十、保存/发布编排（FlowFormUtils）

```ts
import { doSaveData } from "star-horse-form";

await doSaveData(formInfo, "publish", {
  onSuccess: ({ response, isPublish, validated }) => { ... },
  onValidateFail: (errorMsg) => { ... },
  onError: (err) => { ... },
});
```

- 发布（publish）时严格校验，校验未通过触发 `onValidateFail`；
- 保存动作通过 `configureWorkflow({ saveProcess })` 注入，未配置则仅回调。

## 十一、多字段绑定模型

替代旧版"字段→流程变量"的单一映射，支持一个节点绑定多个字段、每个字段承担不同用途。

### NodeFieldBinding

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 绑定项唯一标识 |
| fieldName | string | 绑定的表单字段名 |
| fieldLabel | string? | 字段显示名（冗余回显） |
| usage | FieldBindingUsage \| string | 用途（param/assignee/cc/notice/condition/title/urgency 或自定义） |
| valueMode | FieldValueMode? | 取值方式（direct/ref/expression/constant） |
| flowVar | string? | 流程变量名（usage=param 时） |
| required | boolean? | 是否必填 |
| expression | string? | 表达式（valueMode=expression） |
| constantValue | any? | 常量值（valueMode=constant） |
| extra | Record\<string,any\>? | 扩展属性 |

### FieldBindingUsageOption（用途选项，可插拔）

```ts
interface FieldBindingUsageOption {
  value: FieldBindingUsage | string;
  label: string;
  multiple?: boolean;       // 是否允许多个字段
  needValueMode?: boolean;  // 是否需要取值方式
  needFlowVar?: boolean;    // 是否需要流程变量名
}
```

用途选项由外部传入 `FlowNodeConfigPanel` 的 `usageOptions` prop，不传则使用内置默认。

## 十二、表单级流程绑定

表单属性面板（`FormPropertyPanel`）"流程绑定"tab 支持两种绑定方式，绑定结果统一写入
`formInfo.flowConfigures`，**随表单一并提交后台**（对象名固定为 `flowConfigures`）：

```ts
// 方式一：绑定已有流程（从后台流程定义列表中选择）
formInfo.flowConfigures = {
  mode: "reuse",
  flowDefineId: "xxx",   // 选中的流程定义 ID
};

// 方式二：在线设计（打开可视化流程设计器，节点树保存进表单）
formInfo.flowConfigures = {
  mode: "design",
  process: { /* 节点树根节点，结构与流程定义 jsonFile.process 一致 */ },
};
```

交互说明：
- `flowFlag` 开关：是否为该表单启用流程；
- `flowBindMode` 单选：绑定已有流程 / 在线设计流程；
- reuse 模式显示"流程定义"下拉（选项通过 `FormConfig.flowDefineOptions` 注入或
  `FormConfig.loadFlowDefines` 动态加载）；
- design 模式显示"打开流程设计器"按钮，全屏对话框内嵌 `FlowDesigner`
  （已完成的设计会回显节点树，支持重新设计）；
- `starterField`：发起人字段（从表单内人员字段中选择）。

## 十三、可视化流程设计器（designer）

设计器 UI 从 shdevopsui 整体移植，目录 `src/components/workflow/designer/`：

```
designer/
├── FlowDesigner.vue        # 主设计器（画布 + 属性面板 + 缩放/缩略图工具）
├── nodes/                  # 节点组件（组件名 = 节点 type，动态渲染依赖全局注册）
│   ├── nodes.ts            # registerWorkflowDesigner 注册器
│   ├── FlowNode.vue        # 递归节点渲染器
│   ├── ApprovalNode.vue    # 审批/办理节点
│   ├── BranchNode.vue      # 条件分支
│   ├── CopyerNode.vue      # 抄送节点
│   └── ...（Start/End/Timer/Notice/Event/Service/Parallel 等）
├── preps/                  # 节点属性面板（PrepIndex 按节点类型分发）
├── common/                 # FlowZoom 缩放工具、FlowMap 缩略图、EditName、DeleteConfirm 等
└── styles/flow-designer.scss  # 设计器全局样式（画布、节点、连线）
```

宿主项目接入（一次性注册全局组件）：

```ts
import StarHorseForm, { registerWorkflowDesigner } from "star-horse-form";
app.use(StarHorseForm, { ... });
app.use(registerWorkflowDesigner);   // 注册节点/通用组件（<component :is="node.type"> 依赖）
```

嵌入方式（表单设计器内部即采用此方式）：

```vue
<FlowDesigner
  ref="designerRef"
  :stopInitFormInfo="true"   <!-- 初始化不重置流程表单信息 -->
  :saveBtnVisible="false"    <!-- 嵌入场景关闭独立保存/发布，节点树由外部读取 -->
  :mapBtnVisible="false"
/>
<!-- 读取结果：designerRef.value.nodeData -->
```

节点树数据流转：外部通过 `getFlowDesignStore().flowSetNode(tree)` 注入初始树 →
设计器内部增删改节点 → `designerRef.value.nodeData` 读取最新树。

## 十四、在其他项目中引用

```ts
// 1. 安装组件库
import StarHorseForm from "star-horse-form";
app.use(StarHorseForm, { ... });

// 2. 注册流程设计器组件（使用可视化设计器时必须）
import { registerWorkflowDesigner } from "star-horse-form";
app.use(registerWorkflowDesigner);

// 3. 注入流程设计器运行时能力
import { configureWorkflow, getFlowDesignStore, nodePrepList, FlowNodeEnums } from "star-horse-form";
configureWorkflow({
  loadFormColumns: async (id) => (await api.getFields(id)).data,
  saveProcess: async (info, type) => (await api.save(info, type)).data,
});

// 4. 使用 Store 驱动自研 UI
const store = getFlowDesignStore();
store.flowSetNode(nodePrepList(FlowNodeEnums.START_NODE));
```

## 十五、与原 shdevopsui 的差异

| 项 | 原项目 | 移植后 |
| --- | --- | --- |
| API 调用 | 直接 postRequest 固定 URL | 通过 configureWorkflow 注入 |
| 路由跳转 | 硬编码 router.push（FlowDesigner 从路由 query 加载） | FlowDesigner 解耦路由，数据由 Store 注入；FlowZoom 返回按钮加判空与显隐控制 |
| 组件注册 | main.ts 中 appInstance.use 全局注册 | 导出 registerWorkflowDesigner，由宿主按需注册 |
| 样式 | 全局 flow.scss（main.ts 引入） | designer/styles/flow-designer.scss 随 FlowDesigner 组件引入 |
| html2canvas | 硬依赖 | 拆至 flowMapUtil，动态 import 可选 |
| FlowDesignType | .js 缺类型 | TS 具体类型补全 |
| NodeValidator | 引用不存在的 CONDITION_NODE | 修正为 BRANCH_CONDITION_NODE |
| 字段绑定 | 单一 paramFields 映射 | 多字段多用途 fieldBindings |
| 表单绑定流程 | 无（仅独立流程管理页） | FormPropertyPanel 流程绑定 tab，flowConfigures 随表单提交 |
