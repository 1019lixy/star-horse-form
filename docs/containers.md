# 布局容器（formcomp/container）

布局容器是表单设计器的容器组件扩展，提供多种布局能力。所有容器组件位于 `src/components/formcomp/container/`，通过 `src/index.ts` 的 install 方法自动全局注册。

## 容器组件清单

| 组件 | 文件 | 说明 |
| --- | --- | --- |
| **box-container** | `box-container.vue` | 栅格盒子容器，支持行列布局，最常用 |
| **box-col** | `box-col.vue` | box 容器的列项 |
| **dytable-container** | `dytable-container.vue` | 动态表格容器，支持行增删、列配置 |
| **dytable-col** | `dytable-col.vue` | dytable 容器的列项 |
| **gridtable-container** | `gridtable-container.vue` | 网格表格容器，纯展示型表格 |
| **gridtable-col** | `gridtable-col.vue` | gridtable 容器的列项 |
| **table-container** | `table-container.vue` | 普通表格容器 |
| **card-container** | `card-container.vue` | 卡片容器，支持多卡片分区 |
| **collapse-container** | `collapse-container.vue` | 折叠面板容器 |
| **tab-container** | `tab-container.vue` | 标签页容器 |
| **step-container** | `step-container.vue` | 步骤条容器（向导式表单） |
| **anchor-container** | `anchor-container.vue` | 锚点容器，支持锚点导航 |
| **splitter-container** | `splitter-container.vue` | 分割面板容器 |
| **fieldset-container** | `fieldset-container.vue` | 字段集容器（带标题分组） |
| **group-container** | `group-container.vue` | 分组容器 |
| **descriptions-container** | `descriptions-container.vue` | 描述列表容器（只读详情展示） |
| **dialog-container** | `dialog-container.vue` | 对话框容器（弹窗内嵌表单） |
| **drawer-container** | `drawer-container.vue` | 抽屉容器（侧滑内嵌表单） |
| **condition-container** | `condition-container.vue` | 条件容器（按条件渲染不同子项） |
| **condition-node** | `condition-node.vue` | 条件容器的节点项 |

## 辅助文件

| 文件 | 说明 |
| --- | --- |
| `index.ts` | 容器导出 |
| `container-types.ts` | 容器类型定义 |
| `container-utils.ts` | 容器工具函数 |
| `boxUtils.ts` | box 容器工具（行列计算） |
| `dytableUtils.ts` | dytable 容器工具 |
| `gridtableUtils.ts` | gridtable 容器工具 |
| `callitem.ts` | 容器项调用工具 |
| `useInlineEdit.ts` | 内联编辑 composable |

## 容器通用结构

所有容器组件遵循统一的配置结构，挂载在 `preps` 上：

```ts
{
  compType: "container",
  itemType: "box" | "dytable" | "tab" | ...,  // 容器类型
  preps: {
    name: string;           // 容器名（非字段名）
    label?: string;         // 标签
    elements?: any[];       // 元素列表（box/dytable/tab/card/collapse/splitter）
    children?: any[];       // 子项（condition）
    items?: any[];          // 字段项（tab/card/collapse/splitter 的 element）
    columns?: any[];        // 列定义（box/dytable）
    containerType?: string; // 容器类型标识（table）
    containerFields?: any[];// 表格容器的字段批次
    dytableList?: any[];    // dytable 二维数组
    tabList?: any[];        // tab 项列表
    cardList?: any[];       // card 项列表
    // ...各容器特有配置
  }
}
```

## box-container（栅格盒子）

最常用的布局容器，支持行列栅格布局。

- **配置结构**：`preps.elements[]`，每个 element 含 `columns[]`，每个 column 含 `items[]`（字段数组）
- **行数/列数**：通过 `rowNums` / `columnNums` 描述（由 `boxUtils.ts` 从 elements 网格结构推导）
- **渲染**：经 `analysisCompDatas` 解析后，box 的 fieldList 会扁平化为二维数组（多个字段可共享同一单元格列）

## dytable-container（动态表格）

支持动态行增删的表格容器，适用于明细表、子表单场景。

- **配置结构**：`preps.elements[]` + `preps.dytableList`（二维数组）
- **列项**：`dytable-col.vue`
- **能力**：行增删、列配置、单元格字段编辑

## table-container / gridtable-container

- **table-container**：普通表格容器，`preps.containerType === "table"`，`preps.containerFields[]` 含 `fieldList`
- **gridtable-container**：网格表格容器，纯展示型，列项为 `gridtable-col.vue`

## tab / card / collapse / splitter 容器

这四种容器结构相似，均通过 `preps.elements[]` 组织，每个 element 含 `items[]`（字段数组）：

- **tab-container**：标签页，`preps.tabList[]`
- **card-container**：卡片分区，`preps.cardList[]`
- **collapse-container**：折叠面板
- **splitter-container**：分割面板（水平/垂直分割）

## step-container（步骤条）

向导式表单容器，按步骤分页填写，适用于多步表单流程。

## anchor-container（锚点）

锚点导航容器，长表单场景下提供锚点快速定位。

## condition-container（条件容器）

按条件渲染不同子项的容器：

- **配置结构**：`preps.children[]` 或 `preps.items[]`
- **渲染**：`condition-node.vue` 作为条件节点项
- **经 analysisCompDatas 解析后**：产出 `{ fieldName, children, compType: "container", itemType: "condition" }`

## dialog-container / drawer-container

弹窗/抽屉容器，内嵌表单：

- **dialog-container**：对话框内嵌表单
- **drawer-container**：抽屉侧滑内嵌表单

## fieldset-container / group-container / descriptions-container

- **fieldset-container**：字段集，带标题的分组容器
- **group-container**：通用分组容器
- **descriptions-container**：描述列表，只读详情展示（Element Plus Descriptions 风格）

## 自定义容器接入

通过 `FormConfig.containerList` 注入自定义容器，需以 `xx-container` 方式注册组件：

```ts
const optional: FormConfig = {
  model: "default",
  containerList: async () => [
    {
      itemName: "我的容器",
      itemType: "my-container",
      itemIcon: "grid",
      category: 2,
      itemDesc: "自定义布局容器",
    },
  ],
};
```

并在 `main.ts` 注册组件：

```ts
app.component("my-container", MyContainer);
```

## 字段查找与嵌套

容器内的字段查找通过递归实现（与 shplugin `findField` 逻辑一致），支持：

- `children` 嵌套（condition 容器）
- `items` 嵌套（列布局中的字段）
- `preps.elements[].columns[].items`（box/dytable）
- `preps.elements[].items`（tab/card/collapse/splitter）
- `preps.containerFields[].fieldList`（table）

> 详见 `useFormRuleRuntime.ts` 的 `findFieldByName` 与 `useRuleEngine.ts` 的 `findFieldInCompList`。

## 下一步

- [表单设计器](./form-designer.md)
- [通用页面模板](./commonpage.md)