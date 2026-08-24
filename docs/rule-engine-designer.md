# 规则引擎设计器（RuleDesigner）

规则引擎设计器是 v2.2.5 新增的核心特性，提供基于 Vue Flow 的规则可视化编排能力。它将表单业务规则抽象为流程图节点，支持 8 种节点类型、5 种触发事件、字段级控制指令，并与表单运行时桥接，实现表单加载/字段变更/提交校验/按钮点击等场景的动态控制。

源码位置：`src/components/rule/`

## 基本用法

```vue
<script setup lang="ts">
import { RuleDesigner } from "star-horse-form";
import { ref } from "vue";

const formId = ref("form-001");
const formFields = ref([
  { fieldName: "amount", label: "金额", itemType: "number", type: "number" },
  { fieldName: "type", label: "类型", itemType: "select", type: "select" },
  { fieldName: "remark", label: "备注", itemType: "input", type: "input" },
]);
</script>

<template>
  <RuleDesigner
    :form-id="formId"
    :form-fields="formFields"
    @saved="onSaved"
    @close="onClose"
  />
</template>
```

## RuleDesigner Props

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `ruleId` | `string` | 编辑已有规则时传入规则 ID |
| `formId` | `string` | 表单 ID，传入后会自动写入 `ruleData.formId`，并加载该表单的规则变量库 |
| `formFields` | `FormFieldMeta[]` | 表单字段元数据列表，提供给属性面板/字段选择器用于字段下拉选择 |
| `prefilledData` | `object` | 预填数据（如联动策略转换结果），新建时作为初始流程 |

`prefilledData` 结构：

```ts
{
  ruleName?: string;
  ruleCode?: string;
  ruleType?: string;
  flowContent?: { nodes: any[]; edges: any[]; variables: any[] };
}
```

`FormFieldMeta` 结构：

```ts
interface FormFieldMeta {
  fieldName: string;
  label: string;
  itemType: string;
  type: string;
}
```

### 字段来源优先级

`formFields` 有两个来源，按优先级自动选择：

1. `props.formFields`：从表单设计器规则配置面板传入，实时同步 compList 变化。
2. `autoLoadedFormFields`：独立打开规则时根据 `formId` 调用表单详情 API 自动加载。

## RuleDesigner Emits

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `saved` | 规则保存成功 | 无 |
| `close` | 关闭设计器 | 无 |

## 设计器组成

| 文件 | 说明 |
| --- | --- |
| `RuleDesigner.vue` | 主组件，集成工具栏、画布、节点面板、属性面板 |
| `RuleCanvas.vue` | Vue Flow 画布封装，暴露 fitView/zoom/addNodes/removeNodes 等方法 |
| `NodePanel.vue` | 左侧节点面板，展示 8 种可拖拽节点 |
| `PropertyPanel.vue` | 右侧属性面板，根据选中节点渲染 paramSchema 表单 |
| `RuleCodeView.vue` | 规则代码视图（查看生成的规则 JSON/DSL） |
| `ExecutionLogViewer.vue` | 执行日志查看器 |
| `nodes/*.vue` | 9 个节点渲染组件（StartNode/EndNode/ConditionNode/ActionNode/ExclusiveGatewayNode/HttpCallNode/VariableAssignNode/ScriptNode/GenericNode） |
| `dialogs/*.vue` | 8 个编辑对话框（ConditionEdit/ActionEdit/GatewayConfig/VariableAssign/ScriptEdit/HttpCall/RuleProperty/RuleTest） |
| `engine/RuleExecutor.ts` | 规则执行器 |
| `engine/validator.ts` | 规则校验器 |
| `nodeTypes.ts` | 8 种节点类型定义（含 paramSchema） |
| `useRuleEngine.ts` | 规则引擎业务驱动 composable |
| `useFormRuleRuntime.ts` | 表单运行时桥接 composable |

## RuleCanvas Expose

通过 ref 可调用以下方法：

| 方法 | 说明 |
| --- | --- |
| `fitView()` | 自适应视图 |
| `screenToFlowCoordinate(x, y)` | 屏幕坐标转画布坐标 |
| `addNodes(nodes)` | 添加节点 |
| `addEdges(edges)` | 添加连线 |
| `removeNodes(ids)` | 删除节点 |
| `removeEdges(ids)` | 删除连线 |
| `zoomIn()` | 放大 |
| `zoomOut()` | 缩小 |
| `resetZoom()` | 重置缩放 |
| `getZoom()` | 获取缩放比例 |
| `setViewport(viewport)` | 设置视口 |
| `getNodeDim(id)` | 获取节点尺寸 |

## 节点类型定义

定义于 `src/components/rule/nodeTypes.ts`，分基础节点与高级节点两大类共 8 种。

### ParamField（节点参数字段 schema）

每个节点的可配置参数由 `ParamField[]` 描述：

```ts
interface ParamField {
  name: string;          // 参数名
  label: string | Function;  // 标签（支持 i18n 函数）
  type: "input" | "number" | "select" | "multiselect" | "textarea" | "date" | "switch" | "table";
  required?: boolean;    // 是否必填
  options?: { label: string | Function; value: any }[];  // 选项（select/multiselect）
  placeholder?: string;
  default?: any;
  group?: string;        // 分组
  min?: number;          // number 类型最小值
  max?: number;          // number 类型最大值
  step?: number;         // number 类型步进
  rows?: number;         // textarea 行数
  fieldSelect?: boolean; // 是否为字段选择器（从 formFields 下拉选）
  columns?: {            // table 类型的列定义
    prop: string;
    label: string;
    type?: "input" | "select";
    options?: any[];
    width?: string;
    fieldSelect?: boolean;
    hideOnActionTypes?: string[];  // 在特定 actionType 时隐藏
    showOnActionTypes?: string[];  // 仅在特定 actionType 时显示
  }[];
}
```

### 基础节点（5 种）

#### 1. start（开始节点）

- **类型**：`start`
- **分类**：flow
- **图标**：▶
- **说明**：流程起点，无配置参数
- **defaultData**：`{}`
- **paramSchema**：`[]`

#### 2. end（结束节点）

- **类型**：`end`
- **分类**：flow
- **图标**：■
- **说明**：流程终点，配置结果类型
- **defaultData**：`{ endType: "success" }`
- **paramSchema**：

| 参数 | 类型 | 说明 | 选项 |
| --- | --- | --- | --- |
| `endType` | select | 结果类型 | `success`（通过）/ `fail`（拒绝）/ `skip`（跳过） |

#### 3. condition（条件节点）

- **类型**：`condition`
- **分类**：logic
- **图标**：❓
- **说明**：条件判断，支持 AND/OR 逻辑组合多个条件
- **defaultData**：`{ logic: "AND", conditions: [] }`
- **paramSchema**：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `logic` | select | 逻辑组合：`AND`（且）/ `OR`（或） |
| `conditions` | table | 条件列表，每行含 fieldName + operator + value |

**条件操作符（operator）**：

| 值 | 说明 |
| --- | --- |
| `EQ` | 等于 |
| `NEQ` | 不等于 |
| `GT` | 大于 |
| `LT` | 小于 |
| `GTE` | 大于等于 |
| `LTE` | 小于等于 |
| `CONTAINS` | 包含 |
| `NOT_CONTAINS` | 不包含 |
| `IS_EMPTY` | 为空 |
| `IS_NOT_EMPTY` | 不为空 |
| `IN` | 在集合中 |
| `NOT_IN` | 不在集合中 |
| `BETWEEN` | 区间 |
| `REGEX` | 正则匹配 |
| `STARTS_WITH` | 以...开头 |
| `ENDS_WITH` | 以...结尾 |

`fieldName` 列标记为 `fieldSelect: true`，会从 `formFields` 生成字段下拉选择。

#### 4. action（动作节点）

- **类型**：`action`
- **分类**：logic
- **图标**：▶
- **说明**：执行字段控制动作
- **defaultData**：`{ actions: [] }`
- **paramSchema**：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `actions` | table | 动作列表，每行含 actionType + targetField + actionValue |

**动作类型（actionType）**：

| 值 | 说明 |
| --- | --- |
| `SHOW_FIELD` | 显示字段 |
| `HIDE_FIELD` | 隐藏字段 |
| `SET_VALUE` | 设置字段值 |
| `CLEAR_VALUE` | 清空字段值 |
| `SET_REQUIRED` | 设置必填 |
| `SET_OPTIONS` | 设置选项数据源 |
| `SHOW_MESSAGE` | 显示消息（此时 targetField 隐藏） |

`targetField` 列标记为 `fieldSelect: true`，且通过 `hideOnActionTypes: ["SHOW_MESSAGE"]` 在消息动作时隐藏。

#### 5. exclusive-gateway（排他网关）

- **类型**：`exclusive-gateway`
- **分类**：flow
- **图标**：✕
- **说明**：排他网关，根据条件分支路由
- **defaultData**：`{ name: "", branches: [] }`
- **paramSchema**：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `name` | input | 路由名称 |
| `branches` | table | 条件分支列表，每行含 label + condition |

### 高级节点（3 种）

#### 6. http-call（HTTP 调用节点）

- **类型**：`http-call`
- **分类**：logic
- **图标**：🌐
- **说明**：调用外部 HTTP 接口，支持字段映射、请求参数、请求头、超时、重试
- **defaultData**：

```ts
{
  apiMode: "custom",
  apiType: "thirdApi",
  url: "",
  httpMethod: "GET",
  protocol: "https",
  timeout: 5000,
  requestDataType: "json",
  headers: [],
  requestParams: [],
  body: "",
  successCode: "200",
  codePath: "code",
  messagePath: "message",
  dataPath: "data",
  fieldMappings: [],
  authEnabled: false,
  authInfo: null,
  proxyEnabled: true,
  proxyUrl: "/system-config/redirect/apiLinkage",
  retryCount: 0,
  description: "",
}
```

- **paramSchema**：

| 参数 | 类型 | 分组 | 说明 |
| --- | --- | --- | --- |
| `httpMethod` | select | request | HTTP 方法：GET/POST/PUT/DELETE（必填） |
| `url` | input | request | 接口地址（必填） |
| `fieldMappings` | table | mapping | 字段映射：sourceField → distField（distField 为字段选择器） |
| `requestParams` | table | request | 请求参数：paramName + valueType（static/dynamic） + paramValue（字段选择器） |
| `body` | textarea | request | 请求体（JSON） |
| `successCode` | input | response | 成功码（默认 200） |
| `dataPath` | input | response | 数据路径（默认 data） |
| `headers` | table | advanced | 请求头：paramName + valueType + paramValue |
| `timeout` | number | advanced | 超时毫秒（min 1000，step 1000，默认 5000） |
| `retryCount` | number | advanced | 重试次数（0-5，默认 0） |

#### 7. variable-assign（变量赋值节点）

- **类型**：`variable-assign`
- **分类**：logic
- **图标**：=
- **说明**：变量赋值，支持常量/变量/表达式三种值类型
- **defaultData**：`{ assignments: [] }`
- **paramSchema**：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `assignments` | table | 赋值列表：variableName + valueType + value |

**值类型（valueType）**：

| 值 | 说明 |
| --- | --- |
| `CONSTANT` | 常量 |
| `VARIABLE` | 变量引用 |
| `EXPRESSION` | 表达式 |

#### 8. script（脚本节点）

- **类型**：`script`
- **分类**：logic
- **图标**：📜
- **说明**：自定义脚本执行
- **defaultData**：`{ scriptContent: "", description: "" }`
- **paramSchema**：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `scriptContent` | textarea | 脚本内容（8 行） |
| `description` | textarea | 节点描述（2 行） |

### 节点分类汇总

| 分类 | 节点 |
| --- | --- |
| 基础节点（🎯 #8b5cf6） | start、end、condition、action、exclusive-gateway |
| 高级节点（⚙️ #10b981） | http-call、variable-assign、script |

辅助函数：

- `getNodeDef(type)`：获取节点类型定义
- `getNodeDefaultData(type)`：获取节点默认数据
- `getNodeLabel(type)`：获取节点标签（支持 i18n）
- `getCategoryColor(type)`：获取分类颜色

## 触发事件

定义于 `useRuleEngine.ts`，规则集通过触发事件与表单生命周期绑定：

| 事件 | 说明 | 桥接方式 |
| --- | --- | --- |
| `ON_LOAD` | 表单加载初始化 | 复用 StarHorseForm 的 `@dataLoaded` 事件 |
| `ON_CHANGE` | 字段变更触发 | 表单级 watch formData（300ms 防抖） |
| `ON_SUBMIT` | 提交前校验 | 复用 StarHorseForm 的 merge/validate 流程 |
| `ON_VALIDATE` | 数据校验 | 独立校验触发 |
| `ON_BUTTON_CLICK` | 按钮点击触发 | 携带 `__buttonKey` / `__buttonEvent` 上下文 |

```ts
type TriggerEvent = "ON_CHANGE" | "ON_SUBMIT" | "ON_LOAD" | "ON_VALIDATE" | "ON_BUTTON_CLICK";
```

## 字段控制指令（FieldAction）

定义于 `useRuleEngine.ts`，规则执行结果通过 FieldAction 应用到表单字段：

```ts
interface FieldAction {
  field: string;        // 字段名
  visible?: boolean;    // 显隐
  required?: boolean;   // 必填
  readonly?: boolean;   // 只读
  disabled?: boolean;   // 禁用
  value?: any;          // 赋值
  options?: any[];      // 选项数据源（select/cascade/checkbox 等）
}
```

### 后端 context 前缀解析

后端返回的 `mergedContext` 中，字段控制指令通过特殊前缀编码：

| 前缀 | 对应 FieldAction 属性 | 说明 |
| --- | --- | --- |
| `__visible_xxx` | `visible` | 字段显隐 |
| `__required_xxx` | `required` | 字段必填 |
| `__readonly_xxx` | `readonly` | 字段只读 |
| `__disabled_xxx` | `disabled` | 字段禁用 |
| `__options_xxx` | `options` | 字段选项数据源 |
| 直接字段名 | `value` | 字段赋值（非 `__` 前缀且值非 undefined） |

`parseFieldActions(context)` 函数将 context 解析为 `FieldAction[]`。

### 应用到表单字段（与 shplugin 对齐）

`applyActionsToFormFields()` / `applyToCompList()` 将 FieldAction 应用到 compList，与 `star-horse-lowcode` 的 `ItemRelationEventUtils.controlFieldProps` 逻辑一致：

| FieldAction 属性 | 应用位置 | 对齐的 shplugin 方法 |
| --- | --- | --- |
| `visible` | `field.formVisible` | `eqHide` / `eqVisible` |
| `required` | `field.required` | `eqRequired` / `eqUnRequired` |
| `disabled` | `field.preps.disabled` | `eqDisable` / `eqEditable` |
| `readonly` | `field.preps.readonly` | - |
| `options` | `field.preps.options` | - |
| `value` | 按字段类型选择（见下） | `fieldAssign` |

**value 赋值按字段类型分流**：

| 字段 itemType | 赋值位置 |
| --- | --- |
| `select` / `autocomplete` / `radio` / `checkbox` | `field.preps.values` |
| `tselect` / `transfer` | `field.preps.data` |
| `cascade` | `field.preps.options` |
| 其他 | `formData[fieldName]` |

字段查找通过 `findFieldInCompList()` 递归查找，支持 children 嵌套与列布局 items。

## useRuleEngine composable

定义于 `src/components/rule/useRuleEngine.ts`，规则引擎业务驱动层。

```ts
const {
  executeByForm,
  executeRule,
  triggerOnChange,
  triggerOnLoad,
  triggerOnSubmit,
  triggerOnValidate,
  triggerButtonClick,
  parseFieldActions,
  applyFieldActions,
  applyToCompList,
} = useRuleEngine();
```

### 方法说明

#### executeByForm

按表单触发规则集，返回 `RuleExecutionOutcome`。

```ts
async executeByForm(
  formId: string,
  triggerEvent: TriggerEvent,
  formData: Record<string, any>
): Promise<RuleExecutionOutcome>
```

内部逻辑：
1. 调用 `ruleEngineApi.executeByForm(formId, triggerEvent, formData)`
2. 合并所有规则集的 `mergedContext`
3. 通过 `parseFieldActions()` 解析字段控制指令
4. 返回 `{ success, message, fieldActions, rawContext }`

#### triggerOnLoad

表单加载初始化，执行后自动应用 fieldActions。

```ts
async triggerOnLoad(
  formId: string,
  formData: Record<string, any>,
  fieldStates?: Record<string, Record<string, boolean>>
): Promise<RuleExecutionOutcome>
```

#### triggerOnChange

字段变更触发（**内置 300ms 防抖**），返回防抖触发函数。

```ts
triggerOnChange(
  formId: string,
  formData: Record<string, any>,
  fieldStates?: Record<string, Record<string, boolean>>,
  debounceMs = 300
): () => Promise<void>
```

#### triggerOnSubmit

表单提交前校验，返回 `true` 表示通过。

```ts
async triggerOnSubmit(
  formId: string,
  formData: Record<string, any>
): Promise<boolean>
```

校验逻辑：
1. 执行 `ON_SUBMIT` 规则
2. 若 `success === false`，报错并返回 `false`
3. 检查是否有阻断性动作（`field === "__block_submit"` 且 `value === false`），有则报错返回 `false`
4. 通过则提示成功并返回 `true`

#### triggerOnValidate

数据校验。

```ts
async triggerOnValidate(
  formId: string,
  formData: Record<string, any>
): Promise<RuleExecutionOutcome>
```

#### triggerButtonClick

按钮点击触发，注入 `__buttonKey` / `__buttonEvent` 上下文。

```ts
async triggerButtonClick(
  formId: string,
  formData: Record<string, any>,
  buttonKey?: string,
  evtName: string = "click"
): Promise<RuleExecutionOutcome>
```

> 与 shplugin `buttonAction` 的自定义代码、actions、selfFunc 逻辑互不干扰。仅当按钮配置 `ruleEngineConfig.formId` 且无自定义代码/actions 时才会调用此路径。

#### executeRule

执行单个规则。

```ts
async executeRule(
  ruleId: string,
  formData: Record<string, any>
): Promise<RuleExecutionOutcome>
```

### RuleExecutionOutcome

```ts
interface RuleExecutionOutcome {
  success: boolean;
  message: string;
  fieldActions: FieldAction[];
  rawContext: Record<string, any>;
}
```

### 受控字段追踪器（ControlledFieldTracker）

避免规则引擎与已有联动冲突，记录哪些字段属性受规则引擎控制：

```ts
const tracker = createControlledFieldTracker();
tracker.markControlled("amount", "visible");  // 标记
tracker.isControlled("amount", "visible");     // true
tracker.clear();                                // 清除
```

## useFormRuleRuntime composable

定义于 `src/components/rule/useFormRuleRuntime.ts`，表单运行时桥接层。封装 useRuleEngine，自动管理 formId/formFields/formData 的响应式引用与结果应用。

### RuleRuntimeOptions

```ts
interface RuleRuntimeOptions {
  formId: Ref<string> | string;      // 表单 ID
  formFields: Ref<any[]>;            // 表单字段列表（compList / formInfo）
  formData: Ref<Record<string, any>>;// 表单数据（响应式）
  enabled?: Ref<boolean> | boolean;  // 是否启用（默认 true）
}
```

### 返回值

```ts
const {
  loading,              // Ref<boolean> 执行状态
  triggerOnLoad,        // () => Promise<boolean>
  triggerOnChange,      // () => Promise<{ success, fieldActions }>
  triggerOnSubmit,      // () => Promise<boolean>
  triggerOnValidate,    // () => Promise<...>
  triggerButtonClick,   // (buttonKey?, evtName?) => Promise<{ success, fieldActions }>
  applyRuleActions,     // (actions: FieldAction[]) => void
  extractFormData,      // () => Record<string, any>
  extractFieldMetaList, // (compList) => FormFieldMeta[]
  fieldMetaList,        // ComputedRef<FormFieldMeta[]>
  currentFormId,        // ComputedRef<string>
  isEnabled,            // ComputedRef<boolean>
} = useFormRuleRuntime(options);
```

### 使用示例

```ts
// 在 FormPage.vue 中
const { triggerOnLoad, triggerOnSubmit, triggerOnChange, loading } = useFormRuleRuntime({
  formId: computed(() => props.compList?.[0]?.formId ?? ""),
  formFields: tableFieldList,
  formData: computed(() => formPageRef.value?.getFormData()?.value ?? {}),
  enabled: computed(() => !!ruleFormId.value),
});

// ON_LOAD: 在 StarHorseForm 的 @dataLoaded 事件中调用
const onFormLoad = async () => {
  await triggerOnLoad();
};

// ON_CHANGE: 由调用方 watch formData（300ms 防抖）后调用
watch(formData, useDebounceFn(triggerOnChange, 300));

// ON_SUBMIT: 在 merge 前调用
const handleMerge = async (type: string) => {
  const ok = await triggerOnSubmit();
  if (!ok) return;
  formPageRef.value?.merge(type);
};
```

### 设计原则

1. **融入已有事件流**，不新增并行事件系统
2. **ON_LOAD** → 复用 `@dataLoaded`
3. **ON_CHANGE** → 表单级 watch formData（debounced），规则引擎是表单级服务
4. **ON_SUBMIT** → 复用 merge/validate
5. **applyActionsToFormFields** → 与 shplugin `controlFieldProps` 保持一致

### 与 dataRelation 的关系

- `dataRelation`：字段级轻量联动，同步执行
- 规则引擎：表单级，异步执行（300ms 防抖）
- **执行时序**：字段变更 → dataRelation 同步 → 300ms 后规则引擎异步 → 覆盖前者（业务规则优先级更高）

### extractFieldMetaList

从 compList 提取字段元数据列表（双轨制 + 互补）：

1. **主路径**：`star-horse-lowcode` 的 `analysisCompDatas`（与表单渲染侧一致）
2. **补充路径**：直接遍历原始 compList，捕获 analysisCompDatas 可能遗漏的字段

支持所有容器结构：box（二维数组扁平化）、dytable、table、tab、card、collapse、splitter、condition、step，以及 children/items 嵌套。

## RuleExecutor

定义于 `src/components/rule/engine/RuleExecutor.ts`，规则执行器，负责按流程图拓扑顺序执行节点。

校验器定义于 `src/components/rule/engine/validator.ts`，提供 `validateRule()` 函数用于表单提交前的字段级验证（required/readonly/value 三种校验类型）。

## 后端对接

规则引擎通过 `src/api/rule_engine_api.ts` 与后端交互，所有接口基于 `apiInstance("userdb-manage", "userdb/xxx")` 构建，不写死地址。

### 执行接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `executeRule(ruleId, context)` | `POST /ruleEngine/execute/{ruleId}` | 执行单个规则 |
| `executeRuleSet(setId, context)` | `POST /ruleEngine/executeSet/{setId}` | 执行规则集 |
| `executeByForm(formId, triggerEvent, context)` | `POST /ruleEngine/executeByForm/{formId}?triggerEvent=xxx` | 按表单执行规则集 |

> 完整 API 清单详见 [前端 API 层](./api-layer.md#规则引擎接口-rule_engine_apits)。

### flowContent 结构

规则流程图持久化结构：

```ts
{
  nodes: [
    {
      id: string;          // 节点 ID
      type: string;        // 节点类型（start/end/condition/...）
      position: { x: number; y: number };  // 画布位置
      data: Record<string, any>;           // 节点配置数据（对应 defaultData）
    }
  ],
  edges: [
    {
      id: string;
      source: string;      // 源节点 ID
      target: string;      // 目标节点 ID
      label?: string;      // 边标签（网关分支条件）
    }
  ],
  variables: any[];         // 规则变量库
}
```

## 下一步

- [前端 API 层](./api-layer.md)
- [通用页面模板（规则引擎集成）](./commonpage.md#规则引擎集成)
- [表单设计器](./form-designer.md)