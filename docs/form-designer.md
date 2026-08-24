# 表单设计器（StarHorseFormDesign）

表单设计器是 StarHorseForm 的核心组件，提供可视化拖拽式表单设计能力。设计器内置 50+ 表单项、20+ 布局容器，支持配置模板复用、快捷键、预览、导出 HTML、自定义组件接入、规则引擎配置入口等。

源码位置：`src/components/system/StarHorseFormDesign.vue`

## 基本用法

```vue
<script setup lang="ts">
import { StarHorseFormDesign, type FormConfig } from "star-horse-form";

const optional: FormConfig = {
  model: "full",
  primaryKey: "id",
  api: { basePrefix: "/userdb-manage/userdb/formDesign" },
};
</script>

<template>
  <StarHorseFormDesign :optional="optional" />
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `primaryKey` | `string` | `"idDynamicForm"` | 主键名称，指 api 接口中数据对象对应的主键名 |
| `optional` | `FormConfig` | - | 表单设计器配置，详见下方完整字段表 |

## Emits

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `changeDataHandle` | 数据变更处理 | - |
| `loadData` | 加载数据 | - |
| `action` | 操作动作 | - |
| `saveData` | 保存数据 | - |
| `loadMenu` | 加载菜单 | - |
| `loadTableColumns` | 加载表字段 | - |

## Expose（通过 ref 调用）

| 方法 | 说明 |
| --- | --- |
| `validatePreviewForm()` | 校验预览表单 |
| `exportPreviewToHtml()` | 导出预览表单为 HTML |
| `nodeList` | 节点列表 |
| `setFormInfo()` | 设置表单信息 |
| `applySystemTemplate()` | 应用系统模板 |
| `closeAction()` | 关闭操作 |
| `initStoreData()` | 初始化 store 数据 |
| `formShortKeySwitch(disabled: boolean)` | 快捷键开关（`true` 禁用，`false` 开启） |

使用示例：

```vue
<script setup lang="ts">
import { ref } from "vue";
const designRef = ref();

// 校验并导出 HTML
const handleExport = async () => {
  await designRef.value.validatePreviewForm();
  const html = designRef.value.exportPreviewToHtml();
  console.log(html);
};

// 禁用快捷键
designRef.value?.formShortKeySwitch(true);
</script>

<template>
  <StarHorseFormDesign ref="designRef" :optional="optional" />
</template>
```

## FormConfig 完整字段表

`FormConfig` 定义于 `src/components/types/FormConfig.ts`，是表单设计器的核心配置类型。

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model` | `"simple" \| "default" \| "full"` | `"simple"` | 设计器模式，见下方说明 |
| `primaryKey` | `string` | `"id"` | 主键名称，指 api 接口中数据对象对应的主键名 |
| `forbiddenSystemItems` | `boolean` | `false` | 禁用系统自带的组件 |
| `hideConfigBtn` | `boolean` | - | 隐藏配置风格按钮 |
| `api` | `ApiUrls` | - | 表单与后端交互的接口定义 |
| `configTemplateApi` | `ApiUrls` | - | 配置模板接口，未配置时配置数据只能缓存到浏览器 |
| `customCompApi` | `ApiUrls` | - | 自定义第三方组件接口，未配置时使用默认路径 `/userdb-manage/userdb/customComponent` |
| `dbInfoApi` | `ApiUrls` | - | 数据库配置 Api |
| `shotProps` | `Record<string, any>` | `{ label: "formName", value: primaryKey }` | 快捷菜单的参数 |
| `extendButtons` | `ToolBtnType[]` | - | 设计器顶部自定义按钮 |
| `cooperationMode` | `false` | - | 是否支持在线协作（目前不成熟） |
| `permissions` | `Record<string, string>` | 仅查看 | 权限编码，与设计器头部按钮关联 |
| `compSize` | `"small" \| "default" \| "large"` | `"default"` | 组件大小 |
| `containerList` | `() => Promise<CompType[]>` | - | 用户容器组件（显示在容器区域） |
| `itemList` | `() => Promise<CompType[]>` | - | 用户组件（显示在组件区域） |
| `extendItemList` | `() => Promise<CompType[]>` | - | 用户扩展组件（显示在扩展组件区域） |
| `batchCreatePage` | `boolean` | - | 是否批量创建页面 |
| `loadDicts` | `(dictName: string) => Promise<SelectOption[]>` | - | 获取字典数据 |
| `loadMenuList` | `(appId: string) => Promise<SelectOption[]>` | - | 根据应用 ID 加载菜单 |
| `loadTableColumns` | `(dataSourceId: string, tableName: string) => Promise<SelectOption[]>` | - | 根据数据源和表名获取表字段信息 |
| `loadAppList` | `() => Promise<SelectOption[]>` | - | 获取应用列表 |
| `loadRolesList` | `() => Promise<SelectOption[]>` | - | 获取角色列表 |
| `loadDbList` | `() => Promise<SelectOption[]>` | - | 获取所有数据源信息 |

### model 三种模式详解

- **`simple`（极简模式）**：只有简单功能，无需后端，适合快速原型与演示。
- **`default`（默认模式）**：除需要与后台交互的功能外都会正常展示。
- **`full`（完整模式）**：包含所有功能，某些功能需结合后台服务。在全量模式下需要加载数据字典、应用名称、角色信息、权限信息等，下面的 `loadDicts` / `loadMenuList` / `loadTableColumns` / `loadAppList` / `loadRolesList` / `loadDbList` 都需要配置，否则相关功能无法使用或数据无法展示。

### permissions 默认值

```ts
// 默认只有查看权限
{
  add: "add",      // 有新增权限
  edit: "edit",    // 有编辑权限
  view: "view",    // 有查看权限
  delete: "delete" // 有删除权限
}
```

权限编码与设计器头部的按钮关联，传入对应编码即表示拥有该权限。

## ToolBtnType（自定义按钮）

`ToolBtnType` 定义于 `src/components/types/ToolBtnType.ts`，用于 `FormConfig.extendButtons`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `icon` | `string` | 是 | 按钮图标 |
| `key` | `string` | 是 | 按钮唯一标识 |
| `auth` | `string` | 是 | 按钮权限 |
| `label` | `string` | 是 | 按钮显示文本 |
| `defaultEdit` | `boolean` | 否 | 是否默认编辑状态下显示 |
| `shortcut` | `string` | 否 | 按钮快捷键 |
| `help` | `string` | 否 | 按钮帮助文本 |
| `action` | `Function` | 否 | 按钮点击事件 |
| `children` | `ToolBtnType[]` | 否 | 子按钮 |
| `flat` | `boolean` | 否 | 平铺组标记：`true` 时 children 在工具条中平铺渲染（不收进下拉），用于高频操作组（如撤销/重做）；`false`/未设置时 children 渲染为下拉菜单。仅当 `children` 存在时生效 |

示例：

```ts
const extendButtons: ToolBtnType[] = [
  {
    icon: "upload",
    key: "import",
    auth: "form:import",
    label: "导入",
    action: () => handleImport(),
  },
  {
    icon: "history",
    key: "history-group",
    auth: "form:history",
    label: "历史",
    flat: true, // 子按钮平铺渲染
    children: [
      { icon: "undo", key: "undo", auth: "form:undo", label: "撤销", action: undo },
      { icon: "redo", key: "redo", auth: "form:redo", label: "重做", action: redo },
    ],
  },
];
```

## CompType（自定义组件描述）

`CompType` 定义于 `src/components/types/DesignFormTypes.ts`，用于 `itemList` / `containerList` / `extendItemList`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `itemName` | `string` | 是 | 组件名称（显示名） |
| `itemType` | `string` | 是 | 组件类型标识（需以 `xx-item` / `xx-container` 注册） |
| `itemIcon` | `string` | 是 | 组件图标 |
| `category` | `number` | 是 | 分类编号 |
| `itemDesc` | `string` | 否 | 组件描述 |

## 设计器面板体系

表单设计器内部由多个面板与对话框组成（位于 `src/components/system/items/`）：

- **组件面板**：展示所有可拖拽的表单项与容器，分系统组件、用户组件（`itemList`）、扩展组件（`extendItemList`）、容器（`containerList`）。
- **设计画布**：拖拽排列组件，支持嵌套容器、列布局、快捷键操作。
- **属性面板**：编辑选中组件的属性（字段名、标签、默认值、校验规则、数据源、联动策略等）。
- **配置对话框（ConfigDialog）**：表单级配置（表单名、主键、接口、权限等）。
- **预览对话框（PreviewDialog）**：实时预览设计的表单，支持校验与导出 HTML。
- **代码对话框（CodeDialog）**：查看/导出表单配置 JSON。
- **规则配置面板（RuleConfigPanel）**：v2.2.5 新增，表单级规则引擎配置入口，可打开 RuleDesigner。

## 自定义组件接入

### 1. 定义组件

创建自定义 Vue 组件，需通过 `defineOptions({ name: "my-input-item" })` 注册名称，命名规则为 `xx-item`（表单项）或 `xx-container`（容器）：

```vue
<!-- MyInputItem.vue -->
<script setup lang="ts">
defineOptions({ name: "my-input-item" });
const props = defineProps<{ preps: any; formData: any }>();
</script>

<template>
  <el-input v-model="formData[preps.name]" :placeholder="preps.placeholder" />
</template>
```

### 2. 全局注册

在 `main.ts` 中注册：

```ts
import MyInputItem from "./components/MyInputItem.vue";
app.component("my-input-item", MyInputItem);
```

### 3. 注入到设计器

通过 `FormConfig.itemList` 注入：

```ts
const optional: FormConfig = {
  model: "default",
  itemList: async () => [
    {
      itemName: "我的输入框",
      itemType: "my-input",
      itemIcon: "edit",
      category: 1,
      itemDesc: "自定义输入框组件",
    },
  ],
};
```

设计器组件面板会展示该组件，拖入画布后渲染为 `my-input-item`。

> **注意**：`itemType` 值需与组件注册名的 `xx-` 前缀后部分一致。例如 `itemType: "my-input"` 对应注册名 `my-input-item`。

## 数据源与联动配置

表单项的属性面板支持配置数据源与联动策略，相关类型定义于 `src/components/types/DataSourceTypes.ts`：

- **静态数据源**（`dataSource: "data"`）：直接配置选项数组。
- **内部接口数据源**（`dataSource: "url"`）：通过服务名 + 接口名 + 方法名调用内部接口，支持网关转发。
- **字典数据源**（`dataSource: "dict"`）：通过字典编码加载，依赖 `FormConfig.loadDicts`。
- **第三方接口数据源**（`dataSource: "thirdParty"`）：完整 HTTP 请求配置（方法/协议/头/参数/认证/响应映射）。

联动策略：

- **dataRelation**：字段级可见性联动（同步）。
- **apiLinkage**：字段级接口联动（异步，含请求/响应/认证/字段映射完整配置）。
- **规则引擎**：表单级规则（最强，详见 [规则引擎设计器](./rule-engine-designer.md)）。

> 数据源与联动的完整类型定义详见 [DataSourceTypes.ts](../src/components/types/DataSourceTypes.ts)。

## 配置模板

设计器支持配置模板复用（静态数据、第三方数据源、接口联动三类模板），通过 `FormConfig.configTemplateApi` 对接后端持久化。未配置接口时，模板数据缓存到浏览器本地。

相关组件：`ConfigTemplateManager`（详见 [工具与系统组件](./system-components.md)）。

## 快捷键

设计器内置快捷键支持，通过 `formShortKeySwitch(disabled)` 方法开关。快捷键操作定义于 `src/api/short-key-operation.ts` 与 `src/api/dyform-short-key-operation.ts`，键盘事件工具位于 `src/api/keyboard-event-utils.ts`。

## 下一步

- [规则引擎设计器](./rule-engine-designer.md)
- [布局容器](./containers.md)
- [工具与系统组件](./system-components.md)