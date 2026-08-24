# 流程图设计器（DiagramDesigner）

流程图设计器是独立于规则引擎的通用流程图编排组件，支持自定义节点、连线、属性面板与预览。基于 Vue Flow 实现。

源码位置：`src/components/diagram/`

## 基本用法

```vue
<script setup lang="ts">
import { DiagramDesigner } from "star-horse-form";
import { ref } from "vue";

const diagram = ref();
</script>

<template>
  <DiagramDesigner
    v-model:diagram="diagram"
    @save="onSave"
  />
</template>
```

## Props

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `diagram` | `DiagramData` | 流程图数据（双向绑定，配合 `v-model:diagram`） |
| `initialDiagram` | `Partial<DiagramData>` | 初始流程图数据（用于非受控模式初始化） |
| `readonly` | `boolean` | 是否只读模式 |

## Emits

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `update:diagram` | 流程图数据更新 | `DiagramData` |
| `save` | 保存流程图 | `DiagramData` |

## 组成文件

| 文件 | 说明 |
| --- | --- |
| `DiagramDesigner.vue` | 主组件 |
| `types.ts` | 类型定义（DiagramData / NodeTypePreset 等） |
| `constants.ts` | 常量定义 |
| `index.ts` | 导出 |
| `composables/useDiagramDesigner.ts` | 核心 composable |
| `panels/DiagramCanvas.vue` | 画布面板 |
| `panels/DiagramNodePanel.vue` | 节点面板（左侧可拖拽节点列表） |
| `panels/DiagramPropertyPanel.vue` | 属性面板（右侧节点属性编辑） |
| `panels/DiagramToolbar.vue` | 工具栏 |
| `dialogs/DiagramPreviewDialog.vue` | 预览对话框 |

## useDiagramDesigner composable

核心逻辑 composable，管理流程图状态与操作：

```ts
const designer = useDiagramDesigner(initialDiagram);
```

提供的能力：

- `state.diagram`：流程图响应式状态
- `loadDiagram(data)`：加载流程图
- 节点增删改
- 连线增删改
- 画布操作（缩放、平移、适应视图）
- 序列化/反序列化

## 设计器交互

1. **左侧节点面板**：展示可拖拽的节点预设（NodeTypePreset），拖入画布生成节点
2. **中间画布**：Vue Flow 画布，支持节点拖拽、连线、缩放、平移
3. **右侧属性面板**：选中节点后展示属性编辑表单
4. **顶部工具栏**：保存、预览、撤销/重做、缩放等操作

## 与规则引擎设计器的区别

| 特性 | DiagramDesigner | RuleDesigner |
| --- | --- | --- |
| 定位 | 通用流程图编排 | 表单规则编排 |
| 节点类型 | 自定义（NodeTypePreset） | 固定 8 种 |
| 触发事件 | 无 | 5 种（ON_LOAD/ON_CHANGE/...） |
| 字段控制 | 无 | FieldAction（显隐/必填/赋值等） |
| 后端对接 | 通用保存 | 规则引擎执行接口 |
| 属性面板 | 通用 | paramSchema 驱动 |

## 下一步

- [规则引擎设计器](./rule-engine-designer.md)
- [工具与系统组件](./system-components.md)