# 快速上手

本文档介绍如何安装、配置并在 Vue 3 项目中使用 StarHorseForm。

## 环境要求

- Node.js >= 20.13.0
- Vue 3.5+
- Element Plus 2.14+
- 依赖核心库 `star-horse-lowcode`（本组件包以 `../shplugin` 本地引用，发布时随包打包）

## 安装

```bash
npm install star-horse-form
# 或
pnpm add star-horse-form
```

> 若以源码方式使用（monorepo），`package.json` 中已配置 `"star-horse-lowcode": "../shplugin"`，确保同级目录存在 `shplugin` 项目。

## 全局配置

在 `main.ts` / `main.js` 中引入样式并安装插件：

```ts
// 样式（顺序：核心库 → 本组件包 → element-plus）
import "star-horse-lowcode/assets/index.css";
import "star-horse-form/assets/index.css";
import "element-plus/dist/index.css";

import { createApp } from "vue";
import App from "./App.vue";
import StarHorseForm from "star-horse-form";

const app = createApp(App);

app.use(StarHorseForm, {
  // 可选配置项
  router,                 // Vue Router 实例
  axiosInstance,          // 外部传入 axios 实例（否则使用默认）
  elementPlusOptions,     // Element Plus 配置选项
  lang: "zh-CN",          // 国际化语音
  initElementPlus: true,  // 是否初始化 element-plus（默认 true）
});

app.mount("#app");
```

### install 方法签名

```ts
install(
  app: App,
  options?: {
    router?: any;
    axiosInstance?: any;        // 外部传入 axios 实例，否则使用默认
    elementPlusOptions?: any;   // Element Plus 配置选项
    lang?: LangType;            // 国际化语音
    initElementPlus?: boolean;  // 是否初始化 element-plus
  }
)
```

install 内部执行顺序：
1. 注册全局 `draggable` 组件（vuedraggable-es）
2. 初始化本组件包的 Pinia store
3. 安装 `star-horse-lowcode` 核心库（透传 options）
4. 异步注册 `system/*.vue`、`system/items/utils/*.vue`、`formcomp/items/*.vue`、`formcomp/container/*.vue` 下所有组件
5. 注册 `formContext` 上下文

### 后端端点配置（无状态注入）

本组件包遵循无状态 lib 库原则，**不绑定任何特定业务的接口地址**。对接自有后端时，请在 `main.ts` 中、渲染任何表单/规则组件之前调用两个全局配置函数：

```ts
import {
  configureRuleEngine,
  configureAppEndpoints,
} from "star-horse-form";

// 1) 规则引擎 9 组 CRUD/执行接口的服务名与路径
configureRuleEngine({
  serviceName: "my-service",       // 默认 userdb-manage
  ruleEnginePath: "api/ruleEngine", // 其余 8 组路径同理可覆盖，未传则用默认
});

// 2) 全局通用端点（WebSocket / 代理 / 字典 / 网关等），按需覆盖
configureAppEndpoints({
  wsEndpoint: "/my-ws/form",                    // 协同编辑 WebSocket，默认 /api/ws/form
  apiLinkageProxyUrl: "/gw/redirect/apiLinkage", // http-call 代理，默认 /system-config/redirect/apiLinkage
  executeProxyUrl: "/gw/redirect/execute",       // 接口执行代理，默认 /system-config/redirect/execute
  gatewayPrefix: "/my-service",                  // 网关前缀，默认 /userdb-manage
  gatewayServiceName: "my-service",              // apiInstance 服务名，默认 userdb-manage
});
```

> 未配置时使用内置默认值保证开箱可用；重复调用按字段合并覆盖。字段含义详见 [前端 API 层 - 端点配置](./api-layer.md#端点配置无状态注入)。

## 最小可用示例

### 1. 表单设计器（极简模式）

```vue
<script setup lang="ts">
import { StarHorseFormDesign, type FormConfig } from "star-horse-form";

const optional: FormConfig = {
  model: "simple", // 极简模式，无需后端
};
</script>

<template>
  <StarHorseFormDesign :optional="optional" />
</template>
```

### 2. 表单设计器（完整模式，对接后端）

```vue
<script setup lang="ts">
import { StarHorseFormDesign, type FormConfig } from "star-horse-form";

const optional: FormConfig = {
  model: "full",
  primaryKey: "id",
  api: {
    // 表单 CRUD 接口（ApiUrls 结构，详见 star-horse-lowcode）
    basePrefix: "/userdb-manage/userdb/formDesign",
  },
  configTemplateApi: {
    basePrefix: "/userdb-manage/userdb/configTemplate",
  },
  permissions: {
    add: "form:add",
    edit: "form:edit",
    view: "form:view",
    delete: "form:delete",
  },
  // 数据字典加载
  loadDicts: async (dictName: string) => {
    return await fetchDictFromBackend(dictName);
  },
  // 应用列表
  loadAppList: async () => {
    return await fetchAppList();
  },
  // 角色列表
  loadRolesList: async () => {
    return await fetchRoles();
  },
  // 数据源列表
  loadDbList: async () => {
    return await fetchDbList();
  },
  // 菜单列表
  loadMenuList: async (appId: string) => {
    return await fetchMenuList(appId);
  },
  // 表字段
  loadTableColumns: async (dataSourceId, tableName) => {
    return await fetchTableColumns(dataSourceId, tableName);
  },
};
</script>

<template>
  <StarHorseFormDesign :optional="optional" />
</template>
```

### 3. 规则引擎设计器

```vue
<script setup lang="ts">
import { RuleDesigner } from "star-horse-form";
import { ref } from "vue";

const formId = ref("your-form-id");
const formFields = ref([
  { fieldName: "amount", label: "金额", itemType: "number", type: "number" },
  { fieldName: "type", label: "类型", itemType: "select", type: "select" },
]);
</script>

<template>
  <RuleDesigner
    :form-id="formId"
    :form-fields="formFields"
    @saved="onRuleSaved"
    @close="onRuleClose"
  />
</template>
```

### 4. 通用页面模板

```vue
<script setup lang="ts">
import { FormTablePage } from "star-horse-form";
import { ref } from "vue";

const compList = ref([]); // 从后端加载的表单配置
const preview = ref(false);
</script>

<template>
  <FormTablePage
    current-page-class="my-business-page"
    :preview="preview"
    :comp-list="compList"
  />
</template>
```

## FormConfig 速查

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `model` | `"simple" \| "default" \| "full"` | `"simple"` | 设计器模式 |
| `primaryKey` | `string` | `"id"` | 主键名 |
| `forbiddenSystemItems` | `boolean` | `false` | 禁用系统自带组件 |
| `hideConfigBtn` | `boolean` | - | 隐藏配置风格按钮 |
| `api` | `ApiUrls` | - | 表单 CRUD 接口 |
| `configTemplateApi` | `ApiUrls` | - | 配置模板接口 |
| `customCompApi` | `ApiUrls` | - | 自定义第三方组件接口 |
| `dbInfoApi` | `ApiUrls` | - | 数据库配置接口 |
| `shotProps` | `Record<string, any>` | `{label:"formName", value:primaryKey}` | 快捷菜单参数 |
| `extendButtons` | `ToolBtnType[]` | - | 设计器顶部自定义按钮 |
| `permissions` | `Record<string, string>` | 仅查看 | 权限编码 |
| `compSize` | `"small" \| "default" \| "large"` | `"default"` | 组件大小 |
| `containerList` | `() => Promise<CompType[]>` | - | 用户容器组件 |
| `itemList` | `() => Promise<CompType[]>` | - | 用户组件 |
| `extendItemList` | `() => Promise<CompType[]>` | - | 用户扩展组件 |
| `batchCreatePage` | `boolean` | - | 是否批量创建页面 |
| `loadDicts` | `(dictName: string) => Promise<SelectOption[]>` | - | 获取字典数据 |
| `loadMenuList` | `(appId: string) => Promise<SelectOption[]>` | - | 根据应用ID加载菜单 |
| `loadTableColumns` | `(dataSourceId, tableName) => Promise<SelectOption[]>` | - | 获取表字段信息 |
| `loadAppList` | `() => Promise<SelectOption[]>` | - | 获取应用列表 |
| `loadRolesList` | `() => Promise<SelectOption[]>` | - | 获取角色列表 |
| `loadDbList` | `() => Promise<SelectOption[]>` | - | 获取数据源列表 |

> 完整字段说明详见 [表单设计器文档](./form-designer.md#formconfig-完整字段表)。

## 三种模式对比

| 模式 | 功能范围 | 后端依赖 | 适用场景 |
| --- | --- | --- | --- |
| `simple` | 极简，仅基础设计功能 | 无 | 快速原型、演示 |
| `default` | 除后端交互外的全部功能 | 部分 | 独立部署、本地存储 |
| `full` | 全部功能（字典/应用/角色/权限/数据源） | 必需 | 企业级低代码平台 |

## 自定义组件接入

通过 `itemList` / `containerList` / `extendItemList` 注入自定义组件，组件需在初始化时以 `xx-item` / `xx-container` 方式注册到上下文：

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

> 详见 [表单设计器 - 自定义组件接入](./form-designer.md#自定义组件接入)。

## 下一步

- [架构总览](./architecture.md)
- [表单设计器](./form-designer.md)
- [规则引擎设计器](./rule-engine-designer.md)