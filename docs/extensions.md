# 设计器扩展架构

> 版本：v2.3.0　|　设计器所有业务能力均已剥离为自包含扩展组件，lib 只提供插槽与通道

## 设计理念

**lib 只留位置，业务全部外置。**

`StarHorseFormDesign` 是纯通用的表单设计器 lib，不内置任何业务逻辑（AI、规则、流程、存为组件等）。
所有业务能力通过 **插槽 + 自包含扩展组件** 按需引入，接入方不用的功能零开销、零代码。

```
┌─────────────────────────────────────────────────────────────┐
│                    StarHorseFormDesign (lib)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  FormToolbar                                          │  │
│  │  [内置按钮] [内置按钮] ... [#toolbar-extra 插槽]      │  │
│  │                                  ↑                    │  │
│  │                    AiChatButton / RuleConfigButton    │  │
│  │                    / FlowDesignButton / SaveAsCompBtn │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ConfigDialog → FormPropertyPanel                     │  │
│  │  [Tab1 基硎设置] [Tab2 数据与关系] [Tab4 列表与事件]  │  │
│  │  [...advancedProps 扩展 Tab]                          │  │
│  │  [#property-panel-extra 插槽]                         │  │
│  │                                  ↑                    │  │
│  │                    FlowBindingTab (流程绑定)          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 两大扩展通道

| 通道 | 用途 | 注入方式 |
| --- | --- | --- |
| `#toolbar-extra` | 设计器顶部工具栏扩展按钮 | 在 `<StarHorseFormDesign>` 模板中放入自包含按钮组件 |
| `#property-panel-extra` | 保存弹窗属性面板扩展内容（参数绑定表、弹窗等） | 在 `<StarHorseFormDesign>` 模板中放入自包含组件，接收 `currentTab` / `allTableFieldList` 插槽 prop |
| `FormConfig.advancedProps` | 保存弹窗属性面板扩展 Tab（纯字段定义） | 在 `optional` 配置中传入 `FormExtraTab[]` |
| `FormConfig.formBasicProps` | 基硎设置 Tab 的自定义字段 | 在 `optional` 配置中传入 `FieldInfo[]` |

---

## 一、工具栏扩展（#toolbar-extra）

### 1.1 通用扩展按钮基础组件 — `ExtToolbarButton`

所有工具栏扩展按钮的统一样式外壳，与内置按钮保持一致的尺寸、悬停、禁用效果。

```vue
<ExtToolbarButton icon="ai" label="AI 助手" @click="handleClick"/>
```

**Props**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `icon` | `string` | 图标：内置 SVG 名 `ai` / `rule` / `flow`，或 `star-horse-icon` 图标名（如 `component`） |
| `label` | `string` | 悬停提示文案 |
| `disabled` | `boolean` | 禁用按钮 |
| `showLabel` | `boolean` | 显示文字（下拉触发器样式） |

**Events**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `click` | `MouseEvent` | 按钮点击 |

### 1.2 AI 助手 — `AiChatButton`

自包含：按钮 + AI 对话弹窗 + 应用生成表单到设计器。

```vue
<template #toolbar-extra>
  <AiChatButton/>
</template>
```

**无需任何 props。** 组件内部通过 `getDesignFormStore()` 访问设计器状态，AI 生成的表单组件列表直接应用到当前设计器画布。

**依赖**

- `AiDialog` — AI 对话弹窗（需配置 API Key / URL / Model）
- `initContainerDimensions` — 容器维度初始化（从 `FieldOperationUtils` 导出）

### 1.3 规则配置 — `RuleConfigButton`

自包含：按钮 + 规则配置面板。表单 ID 与字段元数据自动从设计器 store 提取。

```vue
<template #toolbar-extra>
  <RuleConfigButton :optional="optional"/>
</template>
```

**Props**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `optional` | `FormConfig` | 与设计器一致的配置（取 `primaryKey`） |
| `primaryKey` | `string` | 主键兜底（与 `StarHorseFormDesign.primaryKey` 一致） |

**内部逻辑**

- `ruleFormId` = `formInfo[primaryKey]` || `formInfo.formId`
- `ruleFormFields` = `extractFieldMetaList(compList)` — 从组件列表提取字段元数据

### 1.4 流程设计 — `FlowDesignButton`

自包含：按钮 + 可视化流程设计器弹窗。设计结果写入 `formInfo.flowConfigures`（mode=design）随表单保存。

```vue
<template #toolbar-extra>
  <FlowDesignButton/>
</template>
```

**无需任何 props。** 组件内部通过 `getDesignFormStore()` 读写 `formInfo.flowConfigures`。

**内部逻辑**

- 点击按钮 → 打开 `FlowDesigner` 全屏弹窗
- 保存 → `validateAllNodes(node)` 校验节点完整性 → 写入 `formInfo.flowConfigures = { mode: "design", process: node }`
- 按钮文案根据 `flowDesigned` 状态切换为"重新设计"

### 1.5 存为组件 — `SaveAsCompButton`

自包含：按钮 + 保存自定义组件弹窗。

```vue
<template #toolbar-extra>
  <SaveAsCompButton :optional="optional"/>
</template>
```

**Props**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `optional` | `FormConfig` | 自定义组件保存 API 由 optional 配置 |

> **配套要求**：`SaveAsCompButton` 与左侧"我的组件"Tab（`MyComponentsPanel`）必须同步引入。保存成功后会调用 `loadCustomComponents` 刷新组件列表，未引入 `MyComponentsPanel` 时按钮保存后无可见效果。

---

## 二、属性面板扩展（advancedProps + #property-panel-extra）

### 2.1 扩展 Tab — `FormConfig.advancedProps`

在保存弹窗的属性面板中新增 Tab，纯字段定义，由 `star-horse-form` 渲染。

```ts
import type { FormExtraTab } from "@/components/types";

const advancedProps: FormExtraTab[] = [
  {
    title: "表单说明",
    subTablePrimaryKey: "tabExtDesc",
    fieldList: [
      {
        label: "表单描述",
        fieldName: "formDescription",
        type: "textarea",
        formVisible: true,
        preps: { colspan: 24, rows: 4 },
      },
      {
        label: "头部展示",
        fieldName: "showDescriptionInHeader",
        type: "switch",
        defaultValue: "N",
        formVisible: true,
        preps: { colspan: 12, activeValue: "Y", inactiveValue: "N" },
      },
    ],
  },
];
```

**FormExtraTab 接口**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `title` | `string` | Tab 标题 |
| `subTablePrimaryKey` | `string?` | Tab 唯一标识，用于 tab 切换 key |
| `fieldList` | `FieldInfo[] \| any[]` | Tab 内字段定义，支持 `containerType` 嵌套容器 |

### 2.2 属性面板扩展内容 — `#property-panel-extra`

某些扩展不仅需要 Tab 字段，还需要在属性面板中渲染额外 UI（如参数绑定表、弹窗等）。
`FormPropertyPanel` 提供 `#property-panel-extra` 作用域插槽，渲染在 `star-horse-form` 之后。

```vue
<template #property-panel-extra="{ currentTab, allTableFieldList }">
  <!-- currentTab: 当前激活的 Tab 标识 -->
  <!-- allTableFieldList: 全表字段列表（SelectOption[]），供参数绑定等使用 -->
  <FlowBindingTab
      :state="flowBinding.state"
      :currentTab="currentTab"
      :allTableFieldList="allTableFieldList"
  />
</template>
```

**插槽 prop**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `currentTab` | `string` | 当前激活的 Tab `subTablePrimaryKey` |
| `allTableFieldList` | `SelectOption[]` | 全表字段列表（动态字段 + 公共字段） |

---

## 三、流程绑定扩展 — `FlowBindingTab`

### 3.1 概述

流程绑定是表单设计器中最复杂的业务能力，包含：

- **流程启用开关**（`flowFlag`）
- **两种绑定模式**（`flowBindMode`）：
  - `reuse` — 从后台流程定义列表选择已有流程 + 流程参数与表单字段映射
  - `design` — 打开可视化流程设计器在线设计，节点树保存到 `formInfo.flowConfigures.process`
- **保存前校验** — 检查流程设计节点树完整性
- **保存前数据转换** — `flowConfigures` → 后端格式（`flowDefineIds` / `pendingFlowProcess`）

以上全部封装在 `FlowBindingTab` 中，lib 内零流程代码。

### 3.2 架构：composable + 组件

`FlowBindingTab.vue` 导出两部分：

| 导出 | 类型 | 用途 |
| --- | --- | --- |
| `useFlowBinding(getOptional, tabKey?)` | composable 函数 | 创建状态 + Tab 字段定义 + 校验/转换函数 |
| `default` (组件) | Vue 组件 | 渲染参数绑定表 + 流程设计器弹窗 |

**为什么用 composable？**

Tab 字段定义中的 `actions.change` 需要引用组件内部方法（如 `openFlowDesigner`、`loadFormFlowParams`）。
composable 在 setup 中创建响应式状态和闭包，字段定义中的 actions 直接引用这些闭包，
组件部分只负责渲染额外 UI。两者共享同一份状态，无需 provide/inject。

### 3.3 完整接入步骤

```ts
import FlowBindingTab, { useFlowBinding } from "@/components/system/items/form/extensions/FlowBindingTab.vue";

// 1. 调用 composable 创建流程绑定状态
//    getOptional 延迟求值，打破 "optional 需要 tabConfig，tabConfig 需要 optional" 的循环依赖
const flowBinding = useFlowBinding(() => optional.value);

// 2. 将 tabConfig 放入 advancedProps，将校验/转换放入 optional 回调
const optional = ref<FormConfig>({
  // ...其他配置
  loadFlowDefines,                    // 流程定义列表加载
  loadFlowParams,                     // 流程参数加载
  validateFlowDesign: flowBinding.validateFlowDesign,           // 保存前校验
  transformFlowConfigures: flowBinding.transformFlowConfigures, // 保存前数据转换
  advancedProps: [
    flowBinding.tabConfig,            // 流程绑定 Tab（含 flowFlag/flowBindMode/flowDefineId 字段）
    // ...其他扩展 Tab
  ],
});
```

```vue
<template>
  <StarHorseFormDesign :optional="optional" ...>
    <!-- 3. 在属性面板插槽中渲染 FlowBindingTab 组件 -->
    <template #property-panel-extra="{ currentTab, allTableFieldList }">
      <FlowBindingTab
          :state="flowBinding.state"
          :currentTab="currentTab"
          :allTableFieldList="allTableFieldList"
          :compSize="optional?.compSize"
      />
    </template>
  </StarHorseFormDesign>
</template>
```

### 3.4 useFlowBinding 返回值

| 属性 | 类型 | 用途 |
| --- | --- | --- |
| `state` | `FlowBindingState` | 响应式状态对象，传给 `<FlowBindingTab :state>` |
| `tabConfig` | `FormExtraTab` | Tab 配置，放入 `advancedProps` |
| `validateFlowDesign` | `(data) => string \| null` | 保存前校验，放入 `optional.validateFlowDesign` |
| `transformFlowConfigures` | `(data) => void` | 保存前数据转换，放入 `optional.transformFlowConfigures` |

### 3.5 FlowBindingTab 组件 Props

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `state` | `FlowBindingState` | `useFlowBinding` 返回的 `state` |
| `currentTab` | `string?` | 当前激活 Tab（来自插槽 prop） |
| `allTableFieldList` | `SelectOption[]?` | 全表字段列表（来自插槽 prop） |
| `compSize` | `'small' \| 'default' \| 'large'?` | 组件大小 |

### 3.6 流程绑定数据结构

```ts
// formInfo.flowConfigures 统一结构
interface FlowConfigures {
  mode: "reuse" | "design";
  // reuse 模式
  flowDefineId?: string;
  flowParamBindings?: FlowParamBinding[];
  // design 模式
  process?: FlowNode; // 流程节点树
}

// 保存时转换后的后端格式
// reuse: formInfo.flowDefineIds = "id1;id2;id3"
// design: formInfo.pendingFlowProcess = JSON.stringify(process)
```

### 3.7 后端接口要求

| 接口 | 用途 | 配置方式 |
| --- | --- | --- |
| `POST /flow-engine/workflow/flowDefine/pageList` | 流程定义列表 | `optional.loadFlowDefines` |
| `POST /flow-engine/workflow/processNode/loadByDefineId` | 流程参数列表 | `optional.loadFlowParams` |

**接入方自行实现加载函数：**

```ts
const loadFlowDefines = async (): Promise<SelectOption[]> => {
  const res = await postRequest("/flow-engine/workflow/flowDefine/pageList", {
    pageNum: 1, pageSize: 400,
  });
  if (res?.data?.code !== 200) return [];
  return res.data.data?.dataList.map((item: any) => ({
    name: item.name || item.flowName,
    value: item.flowDeploymentId,
  }));
};

const loadFlowParams = async (flowDefineId: string) => {
  const res = await postRequest("/flow-engine/workflow/processNode/loadByDefineId", {
    item: flowDefineId,
  });
  if (res?.data?.code !== 200) return [];
  return res.data.data.map((item: any) => ({
    name: item.nodeKey,
    label: item.nodeName,
    required: false,
    type: item.nodeType,
  }));
};
```

---

## 四、自定义扩展开发指南

### 4.1 自定义工具栏按钮

```vue
<!-- MyExtButton.vue -->
<script setup lang="ts">
import {ref} from "vue";
import ExtToolbarButton from "@/components/system/items/form/extensions/ExtToolbarButton.vue";

const dialogVisible = ref(false);
const handleClick = () => { dialogVisible.value = true; };
</script>

<template>
  <ExtToolbarButton icon="setting" label="我的扩展" @click="handleClick"/>
  <el-dialog v-model="dialogVisible" title="我的扩展">
    <!-- 扩展内容 -->
  </el-dialog>
</template>
```

```vue
<!-- 使用 -->
<template #toolbar-extra>
  <MyExtButton/>
</template>
```

### 4.2 自定义属性面板 Tab

```ts
const optional = ref<FormConfig>({
  // ...
  advancedProps: [
    {
      title: "我的配置",
      subTablePrimaryKey: "tabMyExt",
      fieldList: [
        { label: "自定义字段", fieldName: "myField", type: "input", formVisible: true },
      ],
    },
  ],
});
```

### 4.3 自定义属性面板扩展内容

如果扩展 Tab 需要额外 UI（如弹窗、表格），在 `#property-panel-extra` 插槽中渲染：

```vue
<template #property-panel-extra="{ currentTab, allTableFieldList }">
  <MyExtPanel v-if="currentTab === 'tabMyExt'" :fields="allTableFieldList"/>
</template>
```

### 4.4 自定义保存前校验和数据转换

```ts
const optional = ref<FormConfig>({
  // ...
  validateFlowDesign: (data) => {
    // 返回错误消息字符串表示校验失败，null 表示通过
    if (data?.myField && data.myField.length < 5) {
      return "自定义字段至少 5 个字符";
    }
    return null;
  },
  transformFlowConfigures: (data) => {
    // 直接修改 data 对象，转换为后端格式
    if (data["myConfig"]) {
      data["myConfigJson"] = JSON.stringify(data["myConfig"]);
      delete data["myConfig"];
    }
  },
});
```

---

## 五、完整接入示例

```vue
<script setup lang="ts">
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import MyComponentsPanel from "@/components/system/items/form/panels/MyComponentsPanel.vue";
// 工具栏扩展按钮
import AiChatButton from "@/components/system/items/form/extensions/AiChatButton.vue";
import RuleConfigButton from "@/components/system/items/form/extensions/RuleConfigButton.vue";
import FlowDesignButton from "@/components/system/items/form/extensions/FlowDesignButton.vue";
import SaveAsCompButton from "@/components/system/items/form/extensions/SaveAsCompButton.vue";
// 流程绑定扩展
import FlowBindingTab, { useFlowBinding } from "@/components/system/items/form/extensions/FlowBindingTab.vue";
import { ref } from "vue";
import { FormConfig } from "@/components/types";

// 1. 创建流程绑定状态
const flowBinding = useFlowBinding(() => optional.value);

// 2. 配置 FormConfig
const optional = ref<FormConfig>({
  model: "full",
  primaryKey: "idDynamicForm",
  api: api,
  loadFlowDefines,
  loadFlowParams,
  validateFlowDesign: flowBinding.validateFlowDesign,
  transformFlowConfigures: flowBinding.transformFlowConfigures,
  formBasicProps: myBasicProps,
  advancedProps: [
    flowBinding.tabConfig,
    // 可继续添加其他扩展 Tab
  ],
});
</script>

<template>
  <StarHorseFormDesign :optional="optional">
    <!-- 工具栏扩展按钮 -->
    <template #toolbar-extra>
      <AiChatButton/>
      <RuleConfigButton :optional="optional"/>
      <FlowDesignButton/>
      <SaveAsCompButton :optional="optional"/>
    </template>

    <!-- 属性面板扩展内容（流程绑定参数表 + 在线设计弹窗） -->
    <template #property-panel-extra="{ currentTab, allTableFieldList }">
      <FlowBindingTab
          :state="flowBinding.state"
          :currentTab="currentTab"
          :allTableFieldList="allTableFieldList"
      />
    </template>

    <!-- 左侧"我的组件"Tab（与 SaveAsCompButton 配套） -->
    <template #tab-mycomp>
      <MyComponentsPanel/>
    </template>
  </StarHorseFormDesign>
</template>
```

---

## 六、扩展组件清单

| 组件 | 位置 | 通道 | 说明 |
| --- | --- | --- | --- |
| `ExtToolbarButton` | `extensions/` | `#toolbar-extra` | 通用扩展按钮基础组件 |
| `AiChatButton` | `extensions/` | `#toolbar-extra` | AI 助手 |
| `RuleConfigButton` | `extensions/` | `#toolbar-extra` | 规则配置 |
| `FlowDesignButton` | `extensions/` | `#toolbar-extra` | 流程设计（在线设计弹窗） |
| `SaveAsCompButton` | `extensions/` | `#toolbar-extra` | 存为自定义组件 |
| `FlowBindingTab` | `extensions/` | `advancedProps` + `#property-panel-extra` | 流程绑定 Tab（含参数绑定 + 在线设计） |

**导出**

```ts
// from "@/components/system"
export {
  ExtToolbarButton,
  AiChatButton,
  RuleConfigButton,
  FlowDesignButton,
  SaveAsCompButton,
  FlowBindingTab,
  useFlowBinding,
};
```

---

## 七、FormConfig 扩展字段速查

| 字段 | 类型 | 用途 |
| --- | --- | --- |
| `formBasicProps` | `FieldInfo[]` | 基硎设置 Tab 自定义字段 |
| `advancedProps` | `FormExtraTab[]` | 属性面板扩展 Tab |
| `loadFlowDefines` | `() => Promise<SelectOption[]>` | 流程定义列表加载 |
| `loadFlowParams` | `(id) => Promise<FlowParam[]>` | 流程参数列表加载 |
| `validateFlowDesign` | `(data) => string \| null` | 保存前校验 |
| `transformFlowConfigures` | `(data) => void` | 保存前数据转换 |
| `flowDefineOptions` | `SelectOption[]` | 流程定义静态列表（可选，替代 loadFlowDefines） |