# 通用页面模板（commonpage）

通用页面模板是 StarHorseForm 提供的 16 种开箱即用的业务页面组件，覆盖常见企业级应用场景。所有组件位于 `src/components/commonpage/`，公共逻辑抽取到 `useCommonPage` composable。

## 页面组件清单

| 组件 | 文件 | 适用场景 |
| --- | --- | --- |
| **ApprovalPage** | `ApprovalPage.vue` | 审批流程页（审批意见、流程节点、审批操作） |
| **CardListPage** | `CardListPage.vue` | 卡片列表页（卡片式数据展示） |
| **CommonSkeleton** | `CommonSkeleton.vue` | 通用骨架屏（加载占位） |
| **ComparePage** | `ComparePage.vue` | 数据对比页（左右/多列对比） |
| **DashboardPage** | `DashboardPage.vue` | 仪表盘页（统计卡片 + 图表） |
| **DetailPage** | `DetailPage.vue` | 详情页（只读详情展示） |
| **FormPage** | `FormPage.vue` | 表单页（纯表单编辑/查看） |
| **FormTablePage** | `FormTablePage.vue` | 表单表格页（搜索 + 表格 + 表单弹窗） |
| **ImportExportPage** | `ImportExportPage.vue` | 导入导出页（Excel 导入导出） |
| **MasterDetailPage** | `MasterDetailPage.vue` | 主从表页（主表 + 从表联动） |
| **NormalPage** | `NormalPage.vue` | 普通页（通用容器，自由组合） |
| **PrintPage** | `PrintPage.vue` | 打印页（打印格式预览与打印） |
| **TabPage** | `TabPage.vue` | 标签页（多 Tab 页面） |
| **TreePage** | `TreePage.vue` | 树形页（左树右表） |
| **ViewFormPage** | `ViewFormPage.vue` | 查看表单页（只读表单） |
| **WizardPage** | `WizardPage.vue` | 向导页（多步骤向导） |

## 基本用法

```vue
<script setup lang="ts">
import { FormTablePage } from "star-horse-form";
import { ref } from "vue";

const compList = ref([]);   // 从后端加载的表单配置
const preview = ref(false);  // 预览模式
</script>

<template>
  <FormTablePage
    current-page-class="my-page"
    :preview="preview"
    :comp-list="compList"
  />
</template>
```

## 通用 Props（CommonPageProps）

所有页面组件共享以下 props：

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `currentPageClass` | `string` | 页面类名（用于样式定制与页面标识） |
| `preview` | `boolean` | 是否预览模式 |
| `compList` | `any[]` | 组件配置列表（从后端加载的表单配置） |

## useCommonPage composable

定义于 `src/components/commonpage/useCommonPage.ts`，抽取所有页面的公共逻辑。

### CommonPageOptions

```ts
interface CommonPageOptions {
  props: CommonPageProps;
  formRef: Ref<any>;
  enableOnChange?: boolean;      // 是否启用 ON_CHANGE 规则引擎（300ms 防抖 watch formData）
  defaultApiEndpoints?: ApiUrls;      // 默认数据源 URL
  autoLoad?: boolean;            // 加载完成后是否自动调用 tableRef.loadByPage
  tableRef?: Ref<any>;
}
```

### 统一模式

useCommonPage 封装以下统一逻辑：

1. **props 解析**：`{ currentPageClass, preview, compList }`
2. **字段解析**：`analysisCompDatas` 解析字段 + 移动端 `convertCompToAppComps`
3. **对话框管理**：`dialogPreps` + `provide("dialogProps")`
4. **规则引擎集成**：`useFormRuleRuntime` 集成（ON_LOAD / ON_SUBMIT / ON_CHANGE / ON_VALIDATE / ON_BUTTON_CLICK）
5. **骨架屏状态**：`CommonSkeleton` 加载占位
6. **数据格式化**：`dataFormat` / `dataRecall` 数据格式化与回调
7. **响应式重载**：watch `compList` + `currentPageClass` 触发 reload

### 返回的状态与方法

```ts
const {
  // 加载状态
  isLoading,        // Ref<boolean>
  hasData,          // Ref<boolean>
  errorMsg,         // Ref<string>
  // 表单元数据
  primaryKey,       // Ref<string>
  rules,            // Ref<any>
  relationTables,   // Ref<any>
  tableFieldList,   // Ref<{ fieldList, stopAutoLoad }>
  searchFormData,   // Ref<SearchFields>
  apiEndpoints,          // Ref<ApiUrls>
  dateFields,       // Ref<string[]>
  fieldMappingList, // Ref<any[]>
  dataSource,       // Ref<any>
  extBtns,          // Ref<UserFuncInfo[]>
  // 对话框
  dialogProps,      // provide("dialogProps")
  // 规则引擎
  triggerOnLoad,
  triggerOnSubmit,
  triggerOnChange,
  triggerOnValidate,
  triggerButtonClick,
  ruleLoading,
  currentFormId,
  isEnabled,
  // 事件
  onFormDataLoaded,    // ON_LOAD 触发
  handleBeforeSubmit,  // ON_SUBMIT 触发
} = useCommonPage(options);
```

### 默认按钮权限

```ts
const DEFAULT_BTN_PERMISSIONS = {
  add: "add",
  edit: "edit",
  view: "view",
  delete: "delete",
};
```

## 规则引擎集成

useCommonPage 自动集成规则引擎，通过 `useFormRuleRuntime` 实现：

```ts
// 规则引擎自动配置
const ruleFormId = computed(() => {
  const list = props.compList as any[];
  if (!list || list.length === 0) return "";
  return list[0]?.formId || list[0]?.preps?.formId || "";
});

const ruleFormData = computed(() => formRef.value?.getFormData()?.value ?? {});

const { triggerOnLoad, triggerOnSubmit, triggerOnChange, ... } = useFormRuleRuntime({
  formId: ruleFormId,
  formFields: tableFieldList,
  formData: ruleFormData,
  enabled: computed(() => !!ruleFormId.value),
});
```

### ON_CHANGE 通用化

通过 `enableOnChange` 开关启用，内置 300ms 防抖 watch：

```ts
const options: CommonPageOptions = {
  props,
  formRef,
  enableOnChange: true,  // 启用 ON_CHANGE 规则引擎
};
```

### 事件桥接

- **ON_LOAD**：`onFormDataLoaded()` 在表单数据加载完成后调用
- **ON_SUBMIT**：`handleBeforeSubmit({ type, formData })` 在提交前调用，返回 `false` 则阻断提交
- **ON_CHANGE**：`enableOnChange` 启用时，watch formData（300ms 防抖）触发
- **ON_BUTTON_CLICK**：`triggerButtonClick(buttonKey)` 按钮点击触发

## CommonSkeleton（骨架屏）

通用骨架屏组件，在数据加载期间提供占位：

```vue
<CommonSkeleton :loading="isLoading" :has-data="hasData" :error="errorMsg">
  <template #default>
    <!-- 实际内容 -->
  </template>
</CommonSkeleton>
```

## 各页面特有能力

### FormTablePage

最常用的业务页面，集成搜索 + 表格 + 表单弹窗：

- 搜索区（searchFormData）
- 表格区（tableFieldList + 分页）
- 表单弹窗（新增/编辑/查看）
- 导入导出
- 批量操作

### MasterDetailPage

主从表联动：

- 左侧/上方主表
- 右侧/下方从表（根据主表选中行联动加载）

### TreePage

左树右表：

- 左侧树形导航
- 右侧表格（根据树节点联动加载）

### WizardPage / ApprovalPage

- **WizardPage**：多步骤向导，按步骤填写
- **ApprovalPage**：审批流程，含审批意见、流程节点、通过/驳回操作

### DashboardPage

仪表盘：

- 统计卡片
- 图表区（复用图表组件）
- 可配置布局

### ImportExportPage

Excel 导入导出：

- 导入：上传 Excel → 解析 → 校验 → 入库
- 导出：查询条件 → 导出 Excel

### PrintPage

打印页：

- 打印格式预览
- 调用浏览器打印

## 下一步

- [规则引擎设计器](./rule-engine-designer.md)
- [表单设计器](./form-designer.md)
- [布局容器](./containers.md)
