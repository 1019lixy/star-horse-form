# 规则引擎与低代码表单闭环方案

## 一、背景与问题

规则引擎和低代码表单目前是两套独立系统，存在六个核心断点：

| # | 断点 | 证据 |
|---|------|------|
| 1 | **`useRuleEngine` 零调用** | 搜索整个 `src` 目录，该 composable 仅在自身文件中定义，没有任何表单组件导入使用 |
| 2 | **规则设计器与表单设计器完全独立** | `RuleDesigner.vue` 和 `StarHorseFormDesign.vue` 无共享上下文/props/事件 |
| 3 | **规则变量 fieldPath 手动输入** | `context-extract` 节点的 `fieldPath` 参数类型为 `input`，无法从表单字段列表选择 |
| 4 | **联动策略与规则引擎是两套体系** | `LinkPolicyComp` 的 visibility/apiFill/custom 是组件级简单配置，与规则引擎流程图无关 |
| 5 | **后端 `executeByForm` 已就绪但前端未调用** | `ruleEngineApi.executeByForm` 已定义，但表单运行时从未触发 |
| 6 | **表单运行时无 fieldStates 管理** | `useRuleEngine` 设计了 `applyFieldActions`，但表单运行时通过 `compList preps` 控制UI，两者脱节 |

## 二、闭环架构总览

```
┌──────────────────────────────────────────────────────────────┐
│                       管理层                                  │
│  规则列表 + 版本管理(草稿→测试→发布) + 执行日志监控             │
└──────────┬──────────────────────────────┬────────────────────┘
           │                              │
┌──────────▼──────────┐    ┌──────────────▼──────────────────┐
│  设计时闭环           │    │  运行时闭环                       │
│                      │    │                                  │
│  表单设计器 ──→       │    │  FormPage/NormalPage/TabPage     │
│  规则配置面板(新增)   │    │       ↓                          │
│       ↓              │    │  useFormRuleRuntime(新增)         │
│  规则设计器           │    │       ↓                          │
│  (感知表单字段)       │    │  useRuleEngine(已有,桥接改造)     │
│       ↓              │    │       ↓                          │
│  联动→规则自动转换    │    │  applyActionsToCompList(新增)     │
└──────────┬──────────┘    └──────────────┬──────────────────┘
           │                              │
┌──────────▼──────────────────────────────▼────────────────────┐
│                       数据层                                   │
│  ruleDefinition.formId ←→ formInfo.idDynamicForm             │
│  ruleVariable.fieldPath ←→ compItem.preps.name               │
│  ruleAction.__visible_/__required_ ←→ compList.preps         │
└──────────────────────────────────────────────────────────────┘
```

## 三、运行时闭环（第一阶段 - 核心打通）

### 3.1 新增 `useFormRuleRuntime.ts`

**文件**: `src/components/rule/useFormRuleRuntime.ts`

核心职责：将 `useRuleEngine` 的规则执行能力与表单 `compList` 的 `preps` 属性桥接。

```typescript
// 关键接口
export function useFormRuleRuntime(
  formId: Ref<string>,
  compList: Ref<any[]>,
  formData: Ref<any>
) {
  // 1. 从 compList 提取扁平化的 formData（传给后端规则引擎）
  const extractFormData = (): Record<string, any> => { ... }

  // 2. 将规则执行结果直接应用到 compList 的 preps（而非独立 fieldStates）
  const applyActionsToCompList = (actions: FieldAction[]) => {
    for (const action of actions) {
      const comp = findCompByFieldName(compList.value, action.field)
      if (!comp) continue
      if (action.visible !== undefined) comp.preps.formVisible = action.visible ? 'Y' : 'N'
      if (action.required !== undefined) {
        comp.preps.required = action.required ? 'Y' : 'N'
        comp.required = action.required
      }
      if (action.readonly !== undefined) comp.preps.readonly = action.readonly ? 'Y' : 'N'
      if (action.disabled !== undefined) comp.preps.disabled = action.disabled ? 'Y' : 'N'
      if (action.value !== undefined) comp.preps.defaultValue = action.value
    }
  }

  // 3. ON_LOAD：表单加载后触发
  const triggerOnLoad = async () => { ... }

  // 4. ON_CHANGE：字段变更触发（防抖300ms + 增量传递变更字段）
  const triggerOnChange = debounce(async (changedField: string) => { ... }, 300)

  // 5. ON_SUBMIT：提交前校验
  const triggerOnSubmit = async (): Promise<boolean> => { ... }

  return { triggerOnLoad, triggerOnChange, triggerOnSubmit, loading }
}
```

**关键设计决策**：
- `applyActionsToCompList` 直接修改 `compList` 中组件的 `preps` 属性，因为 `star-horse-form` 运行时直接读取 `preps.formVisible`/`preps.required`/`preps.disabled` 控制 UI
- 利用 Vue 响应式特性，修改 `preps` 后表单 UI 自动更新，无需额外渲染触发

### 3.2 改造表单运行时页面

**涉及文件**:
- `src/components/commonpage/FormPage.vue`
- `src/components/commonpage/NormalPage.vue`
- `src/components/commonpage/TabPage.vue`
- `src/components/commonpage/FormTablePage.vue`

每个页面的改造模式一致：

```typescript
import { useFormRuleRuntime } from '@/components/rule/useFormRuleRuntime'

// 从 compList 中提取 formId
const formId = computed(() => /* 从props.compList或配置中获取 */)
const { triggerOnLoad, triggerOnChange, triggerOnSubmit, loading: ruleLoading } = 
  useFormRuleRuntime(formId, toRef(props, 'compList'), formData)

onMounted(async () => {
  await init()
  await triggerOnLoad()  // 表单加载后触发 ON_LOAD 规则
})

// 字段变更监听：深度 watch formData，提取变更字段后触发
watch(() => formData, (newVal, oldVal) => {
  const changedField = detectChangedField(newVal, oldVal)
  if (changedField) triggerOnChange(changedField)
}, { deep: true })
```

### 3.3 改造 `useRuleEngine.ts`

**文件**: `src/components/rule/useRuleEngine.ts`

增加 `applyToCompList` 方法，与现有 `applyFieldActions` 并存：

```typescript
// 新增：直接操作 compList preps 的方法
const applyToCompList = (
  actions: FieldAction[],
  compList: any[]
) => {
  for (const action of actions) {
    const comp = compList.find(c => 
      c.preps?.name === action.field || c.preps?.fieldName === action.field
    )
    if (!comp) continue
    // ... 同 applyActionsToCompList 逻辑
  }
}
```

## 四、设计时闭环（第二阶段）

### 4.1 表单设计器集成规则配置入口

**新增文件**: `src/components/system/items/form/components/RuleConfigPanel.vue`

在 `StarHorseFormDesign.vue` 的工具栏增加"规则配置"按钮：
- 展示当前表单关联的规则列表（调用 `ruleDefinitionApi.listByFormId`）
- 新建规则（跳转 `RuleDesigner`，自动携带 `formId` 和 `formFields`）
- 编辑/删除/启用/禁用规则
- 快速联动配置转换入口

**修改文件**:
- `src/components/system/StarHorseFormDesign.vue` — 工具栏增加"规则配置"按钮
- `src/components/system/items/form/components/FormToolbar.vue` — 增加"规则配置"图标按钮

### 4.2 规则设计器感知表单字段

**修改文件**: `src/components/rule/RuleDesigner.vue`

```typescript
// 新增 props
const props = defineProps<{
  ruleId?: string
  formId?: string           // 新增：表单ID
  formFields?: FormFieldOption[]  // 新增：表单字段列表
}>()
```

当 `formId` 存在时：
1. 自动填入 `ruleData.formId`
2. 将 `formFields` 注入到 `NodePanel` 和 `PropertyPanel`
3. 在条件/动作/变量赋值节点中提供字段下拉选择

**新增文件**: `src/components/rule/components/FieldSelector.vue`

通用的表单字段下拉选择器组件，支持搜索和字段类型展示：
```vue
<el-select v-model="modelValue" filterable :placeholder="placeholder">
  <el-option-group v-for="group in fieldGroups" :key="group.label" :label="group.label">
    <el-option v-for="f in group.fields" :key="f.value" :label="f.label" :value="f.value">
      <span>{{ f.label }}</span>
      <el-tag size="small" type="info">{{ f.type }}</el-tag>
    </el-option>
  </el-option-group>
</el-select>
```

### 4.3 修改 `nodeTypes.ts` 支持字段选择

**修改文件**: `src/components/rule/nodeTypes.ts`

为 `ParamField` 接口新增 `fieldSelect` 属性：

```typescript
export interface ParamField {
  // ... 现有属性
  fieldSelect?: boolean  // 新增：标记为表单字段选择器
}
```

对以下节点类型中涉及字段名的参数标记 `fieldSelect: true`：
- `context-extract` 的 `fieldPath`
- `condition` 的 `conditions[].fieldName`
- `action` 的 `actions[].targetField`
- `action-assign` 的 `assignments[].targetField`
- `cond-multibranch` 的 `matchField`
- `cond-dirty-check` 的 `fields`
- `cond-unique` 的 `fields`
- `cond-threshold` 的 `field`
- `calc-money`/`calc-date`/`calc-string` 等运算节点的 `operands`

### 4.4 联动配置自动生成规则

**新增文件**: `src/components/rule/utils/linkageToRule.ts`

将 `LinkPolicyComp` 的配置自动转换为规则流程图节点：

| 联动配置 | 转换结果 |
|---------|---------|
| `visibility` (eqHide/eqVisible) | `condition`(字段值比较) + `action`(SHOW_FIELD/HIDE_FIELD) |
| `visibility` (eqRequired/eqDisable/eqEditable) | `condition` + `action`(SET_REQUIRED/SET_DISABLED/SET_EDITABLE) |
| `apiFill` | `http-call` + `variable-assign`(解析响应并赋值) |
| `custom` JS代码 | `script` 节点 |
| 触发事件 `change` | 对应 `ON_CHANGE` |
| 触发事件 `load` | 对应 `ON_LOAD` |

## 五、管理闭环（第三阶段）

### 5.1 规则版本管理流程

在 `RuleDesigner.vue` 工具栏中完善版本管理：

```
DRAFT(草稿) → saveVersion → TEST(测试) → publishVersion → PUBLISHED(发布) → DISABLED(禁用)
```

- 运行时只执行 `PUBLISHED` 状态的规则
- 测试状态可在设计器中通过"测试"按钮手动触发
- 调用已有 `ruleVersionApi` 接口

### 5.2 执行日志集成

- 在规则列表页为每条规则增加"日志"操作按钮
- 复用已有 `ExecutionLogViewer.vue` 组件
- 调用已有 `ruleExecutionLogApi.listByRuleId`

### 5.3 规则与表单关联管理

**新增文件**: `src/components/system/items/form/components/RuleBindManager.vue`

- 列表展示当前表单绑定的所有规则和规则集
- 支持从规则库选择已有规则绑定
- 支持一键创建新规则（自动填充 `formId`）
- 展示字段覆盖范围（哪些字段受规则控制）

## 六、数据闭环映射

```
规则引擎侧                    →    表单侧
─────────────────────────────────────────────
ruleDefinition.formId         →    formInfo.idDynamicForm
ruleDefinition.triggerEvent   →    ON_LOAD / ON_CHANGE / ON_SUBMIT / ON_VALIDATE
ruleVariable.variableName     →    compItem.preps.name (表单字段名)
ruleVariable.variableType     →    compItem.preps.itemType → STRING/NUMBER/DATE/BOOLEAN
ruleAction.__visible_xxx      →    compItem.preps.formVisible (Y/N)
ruleAction.__required_xxx     →    compItem.preps.required (Y/N) + compItem.required
ruleAction.__readonly_xxx     →    compItem.preps.readonly (Y/N)
ruleAction.__disabled_xxx     →    compItem.preps.disabled (Y/N)
ruleAction.xxx (字段赋值)     →    compItem.preps.defaultValue
```

## 七、实施计划

| 阶段 | 内容 | 预估工时 | 优先级 |
|------|------|---------|--------|
| **第一阶段** | 运行时闭环：`useFormRuleRuntime` + 表单页面注入 + `useRuleEngine` 桥接 | 3-4天 | 🔴 最高 |
| **第二阶段** | 设计时闭环：规则配置入口 + 字段感知 + 联动转规则 | 5-6天 | 🟡 高 |
| **第三阶段** | 管理闭环：版本管理 + 执行日志 + 关联管理 | 3-4天 | 🟢 中 |
| **第四阶段** | 优化增强：缓存优化 + 性能监控 + 冲突检测 + 调试模式 | 3-4天 | 🔵 低 |

## 八、新增/修改文件清单

| 操作 | 文件路径 | 说明 |
|------|---------|------|
| **新增** | `src/components/rule/useFormRuleRuntime.ts` | 运行时规则触发与表单桥接核心 |
| **新增** | `src/components/system/items/form/components/RuleConfigPanel.vue` | 表单设计器中的规则管理入口 |
| **新增** | `src/components/system/items/form/components/RuleBindManager.vue` | 规则与表单关联管理面板 |
| **新增** | `src/components/rule/utils/linkageToRule.ts` | 联动配置到规则流程图转换 |
| **新增** | `src/components/rule/components/FieldSelector.vue` | 表单字段下拉选择器组件 |
| **修改** | `src/components/rule/useRuleEngine.ts` | 增加 `applyToCompList` 方法 |
| **修改** | `src/components/rule/RuleDesigner.vue` | 接收 `formId`/`formFields` props |
| **修改** | `src/components/rule/nodeTypes.ts` | `ParamField` 增加 `fieldSelect` 属性 |
| **修改** | `src/components/rule/PropertyPanel.vue` | 字段参数渲染为 FieldSelector |
| **修改** | `src/components/commonpage/FormPage.vue` | 注入 `useFormRuleRuntime` |
| **修改** | `src/components/commonpage/NormalPage.vue` | 注入 `useFormRuleRuntime` |
| **修改** | `src/components/commonpage/TabPage.vue` | 注入 `useFormRuleRuntime` |
| **修改** | `src/components/commonpage/FormTablePage.vue` | 注入 `useFormRuleRuntime` |
| **修改** | `src/components/system/StarHorseFormDesign.vue` | 工具栏增加"规则配置"按钮 |

## 九、验证方案

1. **运行时闭环验证**：在表单运行时页面配置一条 ON_LOAD 规则（如：当类型=X时隐藏某字段），验证表单加载后字段自动隐藏
2. **ON_CHANGE 验证**：修改字段值后，验证 300ms 内相关字段状态/值自动更新
3. **ON_SUBMIT 验证**：配置校验规则，验证提交时被规则阻断并显示错误消息
4. **设计时验证**：在规则设计器中选择表单字段（而非手动输入），验证字段下拉列表正确展示
5. **联动转换验证**：将现有 LinkPolicyComp 配置一键转为规则流程图，验证节点逻辑正确
