# 工具与系统组件

本文档介绍 StarHorseForm 中的工具组件与系统辅助组件。这些组件位于 `src/components/system/items/utils/` 与 `src/components/system/items/form/`，部分通过 `src/components/system/index.ts` 导出。

## 导出组件

通过 `star-horse-form` 包导出的系统组件：

```ts
import {
  StarHorseFormDesign,  // 表单设计器主组件
  PreviewDialog,        // 预览对话框
  DbListComp,           // 数据库列表组件
  FormPreview,          // 表单预览组件
} from "star-horse-form";
```

## 工具组件（system/items/utils/）

| 组件/文件 | 说明 |
| --- | --- |
| **AiDialog.vue** | AI 对话组件，集成 AI 辅助表单设计能力（自然语言生成表单配置） |
| **ApiConfigForm.vue** | API 配置表单，用于配置接口数据源的请求/响应/认证参数 |
| **ApiSharedConfig.ts** | API 共享配置（公共请求/响应模板） |
| **ConfigTemplateManager.vue** | 配置模板管理器，管理静态数据/第三方数据源/接口联动三类配置模板的保存/加载/删除 |
| **DataSourceComp.vue** | 数据源配置组件，配置字段的数据源（静态/接口/字典/第三方） |
| **DbListComp.vue** | 数据库列表组件，选择数据源与表名（full 模式下使用） |
| **DbSearchUtils.ts** | 数据库搜索工具 |
| **DynamicForm.ts** | 动态表单工具 |
| **FieldOperationUtils.ts** | 字段操作工具（字段增删改、批量编辑等） |
| **FormMenuShot.vue** | 表单快捷菜单组件 |
| **FormParamsValid.ts** | 表单参数校验 |
| **ItemPreps.ts** | 表单项 preps 工具 |
| **jsCodeFormatter.ts** | JS 代码格式化工具 |
| **LinkPolicyComp.vue** | 联动策略配置组件，配置 dataRelation（可见性联动）与 apiLinkage（接口联动） |
| **VisibilityRuleFormComp.vue** | 可见性规则表单组件 |
| **WebUrlComp.vue** | Web URL 配置组件 |

## DynamicQueryBuilder（动态查询构建器）

源码位置：`src/components/system/DynamicQueryBuilder.vue`

可视化查询条件构建器，支持动态添加/删除查询条件，配置字段、匹配方式与值。

```vue
<script setup lang="ts">
import { DynamicQueryBuilder } from "star-horse-form";
import { ref } from "vue";

const conditions = ref([]);
</script>

<template>
  <DynamicQueryBuilder
    v-model="conditions"
    :fields="availableFields"
  />
</template>
```

### Props

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `modelValue` | `any[]` | 查询条件列表（v-model） |
| `fields` | `any[]` | 可选字段列表 |

### Emits

| 事件名 | 说明 |
| --- | --- |
| `update:modelValue` | 条件变更 |

## 设计器面板组件（system/items/form/）

表单设计器内部的面板组件：

| 组件 | 说明 |
| --- | --- |
| **PropertyPanel.vue** | 主属性面板，选中组件后展示 |
| **ItemPropertiesPanel.vue** | 表单项属性面板 |
| **FormPropertyPanel.vue** | 表单级属性面板 |
| **CustomerPropertyPanel.vue** | 自定义组件属性面板 |
| **FieldPanel.vue** | 字段面板 |
| **FieldAnalysis.vue** | 字段分析 |
| **FieldLayer.vue** | 字段层级 |
| **BatchEditFields.vue** | 批量编辑字段 |

子目录：

| 目录 | 说明 |
| --- | --- |
| `components/` | 面板子组件（含 FormPreview.vue 表单预览） |
| `composables/` | 面板 composable |
| `dialogs/` | 对话框（含 PreviewDialog.vue 预览对话框） |

## 实时协作

| 文件 | 说明 |
| --- | --- |
| `FormSocketService.ts` | 表单 WebSocket 服务，基于 stompjs + sockjs-client 实现实时协作 |
| `CooperationAction.ts` | 协作操作定义 |

> 在线协作功能目前标记为不成熟（`FormConfig.cooperationMode`）。

## 表单项扩展（formcomp/items/）

| 组件/文件 | 说明 |
| --- | --- |
| **editor-item.vue** | 富文本编辑器表单项 |
| **vedio-item.vue** | 视频播放表单项（基于 flv.js） |
| **allitem.ts** | 全部表单项聚合定义 |

## 配置模板（ConfigTemplateManager）

配置模板管理器支持三类模板的复用：

| 分类 | 说明 |
| --- | --- |
| `staticData` | 静态数据模板 |
| `thirdPartyDataSource` | 第三方数据源模板 |
| `apiLinkage` | 接口联动模板 |

模板可存储于本地（`storage: "local"`）或数据库（`storage: "database"`，需配置 `configTemplateApi`）。

```ts
interface ConfigTemplate {
  id: string;
  name: string;
  category: "staticData" | "thirdPartyDataSource" | "apiLinkage";
  description?: string;
  storage: "local" | "database";
  configData: Record<string, any>;
  createdTime?: string;
  updatedTime?: string;
  createdBy?: string;
}
```

## AI 辅助设计（AiDialog）

AI 对话组件，集成 AI 辅助表单设计能力：

- 自然语言描述 → 生成表单配置
- 接口位于 `src/api/ai_chat_api.ts` 与 `src/api/ai_config_api.ts`
- 需后端提供 AI 对话服务

## 下一步

- [前端 API 层](./api-layer.md)
- [表单设计器](./form-designer.md)
- [布局容器](./containers.md)