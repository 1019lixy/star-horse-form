# 架构总览

本文档描述 StarHorseForm 的整体架构、模块划分、目录结构、与核心库的关系及核心数据流。

## 与 star-horse-lowcode 的关系

```
┌─────────────────────────────────────────────────────┐
│                   star-horse-form                    │
│  (本项目：表单设计器 + 规则引擎 + 通用页面 + 流程图)  │
│                                                       │
│  依赖 star-horse-lowcode 提供：                       │
│  · 50+ 表单项组件（input/select/cascade/...）         │
│  · analysisCompDatas / convertCompToAppComps 解析     │
│  · dialogPreps / SearchFields / UserFuncInfo          │
│  · ItemRelationEventUtils（字段级联动 controlFieldProps）│
│  · apiInstance / postRequest（HTTP 封装）             │
│  · success/error/warning（消息提示）                  │
│  · ApiUrls / CompType / SelectOption 类型             │
└───────────────────────┬─────────────────────────────┘
                        │ 依赖
┌───────────────────────▼─────────────────────────────┐
│                 star-horse-lowcode                    │
│        (核心库：表单渲染引擎 + 联动 + 数据源)          │
└──────────────────────────────────────────────────────┘
```

**核心库无状态原则**：`star-horse-lowcode` 是纯前端核心库，所有后端交互通过外部注入配置（`configureRuleEngine` / `FormConfig.api` 等），不写死接口地址。StarHorseForm 在此之上叠加设计器与规则引擎，同样遵循该原则。

## 七大模块划分

| 模块 | 目录 | 职责 |
| --- | --- | --- |
| **表单设计器** | `src/components/system/` | `StarHorseFormDesign` 主组件 + 设计面板 + 预览 + 配置对话框 |
| **规则引擎设计器** | `src/components/rule/` | `RuleDesigner` + Vue Flow 画布 + 8 种节点 + 属性面板 + 执行器 + composables |
| **通用页面模板** | `src/components/commonpage/` | 16 个业务页面组件 + `useCommonPage` composable |
| **流程图设计器** | `src/components/diagram/` | `DiagramDesigner` + 画布/节点面板/属性面板/工具条 |
| **布局容器** | `src/components/formcomp/container/` | box/dytable/gridtable/card/collapse/tab/table/step/anchor/splitter/fieldset/group/descriptions/dialog/drawer/condition |
| **表单项扩展** | `src/components/formcomp/items/` | editor-item（富文本）、vedio-item（视频）、allitem 聚合 |
| **类型定义** | `src/components/types/` | FormConfig / ToolBtnType / FormulaConfig / DataSourceTypes / DesignFormTypes |

辅助模块：

| 模块 | 目录 | 职责 |
| --- | --- | --- |
| **枚举** | `src/components/enums/` | ModuleEnums / ServiceEnums |
| **前端 API 层** | `src/api/` | rule_engine_api / star_horse_form_api / dataAdapter / form_utils 等 18 个文件 |
| **后端** | `server/src/main/java/com/starhorse/form/` | FormController + WebSocketConfig（Spring Boot） |

## 目录结构

```
dynamicform/
├── src/
│   ├── index.ts                    # 插件入口（install + 导出）
│   ├── api/                        # 前端 API 层
│   │   ├── rule_engine_api.ts      # 规则引擎 CRUD 接口
│   │   ├── star_horse_form_api.ts  # 表单设计器接口
│   │   ├── dataAdapter.ts          # 数据适配器
│   │   ├── form_utils.ts           # 表单工具
│   │   ├── config_template_api.ts  # 配置模板接口
│   │   ├── custom_component_api.ts # 自定义组件接口
│   │   ├── ai_chat_api.ts          # AI 对话接口
│   │   ├── ai_config_api.ts        # AI 配置接口
│   │   ├── star_horse_form_utils.ts
│   │   ├── dyform-short-key-operation.ts
│   │   ├── short-key-operation.ts
│   │   ├── keyboard-event-utils.ts
│   │   ├── cached_utils.ts
│   │   ├── settings.ts
│   │   ├── system.ts
│   │   ├── vueContext.ts
│   │   └── pcas-code.json          # 省市区编码数据
│   └── components/
│       ├── system/                 # 表单设计器
│       │   ├── StarHorseFormDesign.vue
│       │   ├── DynamicQueryBuilder.vue
│       │   ├── SystemComp.ts
│       │   ├── index.ts
│       │   └── items/              # 设计器面板与表单项配置
│       ├── rule/                   # 规则引擎设计器
│       │   ├── RuleDesigner.vue
│       │   ├── RuleCanvas.vue
│       │   ├── NodePanel.vue
│       │   ├── PropertyPanel.vue
│       │   ├── RuleCodeView.vue
│       │   ├── ExecutionLogViewer.vue
│       │   ├── nodeTypes.ts        # 8 种节点类型定义
│       │   ├── useRuleEngine.ts    # 规则引擎业务驱动
│       │   ├── useFormRuleRuntime.ts # 表单运行时桥接
│       │   ├── nodes/              # 9 个节点渲染组件
│       │   ├── dialogs/            # 8 个编辑对话框
│       │   ├── engine/             # RuleExecutor + validator
│       │   ├── components/         # 子组件
│       │   ├── compat/             # 兼容层
│       │   ├── utils/
│       │   ├── demos/
│       │   └── styles/
│       ├── commonpage/             # 16 个通用页面模板
│       │   ├── useCommonPage.ts
│       │   ├── ApprovalPage.vue
│       │   ├── CardListPage.vue
│       │   ├── CommonSkeleton.vue
│       │   ├── ComparePage.vue
│       │   ├── DashboardPage.vue
│       │   ├── DetailPage.vue
│       │   ├── FormPage.vue
│       │   ├── FormTablePage.vue
│       │   ├── ImportExportPage.vue
│       │   ├── MasterDetailPage.vue
│       │   ├── NormalPage.vue
│       │   ├── PrintPage.vue
│       │   ├── TabPage.vue
│       │   ├── TreePage.vue
│       │   ├── ViewFormPage.vue
│       │   └── WizardPage.vue
│       ├── diagram/                # 流程图设计器
│       │   ├── DiagramDesigner.vue
│       │   ├── types.ts
│       │   ├── constants.ts
│       │   ├── index.ts
│       │   ├── composables/useDiagramDesigner.ts
│       │   ├── panels/             # Canvas/NodePanel/PropertyPanel/Toolbar
│       │   └── dialogs/
│       ├── formcomp/
│       │   ├── container/          # 20+ 布局容器
│       │   └── items/              # editor-item / vedio-item / allitem
│       ├── types/                  # 类型定义
│       │   ├── FormConfig.ts
│       │   ├── ToolBtnType.ts
│       │   ├── FormulaConfig.ts
│       │   ├── DataSourceTypes.ts
│       │   ├── DesignFormTypes.ts
│       │   └── index.ts
│       └── enums/
├── server/                         # Java Spring Boot 后端
│   └── src/main/java/com/starhorse/form/
│       ├── FormController.java
│       └── WebSocketConfig.java
├── docs/                           # 本文档
└── package.json
```

## 核心数据流

### 表单设计数据流

```
用户拖拽配置
      │
      ▼
StarHorseFormDesign ──→ compList（组件树配置）
      │                      │
      │                      ├── 保存到后端（api.saveData）
      │                      └── 预览渲染
      ▼
StarHorseForm（核心库）──→ analysisCompDatas(compList) ──→ fieldList
                              │
                              └── 渲染表单项 + 联动 + 数据源
```

### 规则引擎数据流

```
表单运行时
      │
      ├─ ON_LOAD  ──→ triggerOnLoad()  ──→ executeByForm(formId, "ON_LOAD", formData)
      ├─ ON_CHANGE ──→ triggerOnChange() (300ms 防抖) ──→ executeByForm(formId, "ON_CHANGE", formData)
      ├─ ON_SUBMIT ──→ triggerOnSubmit() ──→ executeByForm(formId, "ON_SUBMIT", formData)
      ├─ ON_VALIDATE ──→ triggerOnValidate()
      └─ ON_BUTTON_CLICK ──→ triggerButtonClick(buttonKey)
                                    │
                                    ▼
                        后端规则引擎执行
                                    │
                                    ▼
                        mergedContext（含 __visible_xxx 等前缀字段）
                                    │
                                    ▼
                        parseFieldActions() ──→ FieldAction[]
                                    │
                                    ▼
                        applyActionsToFormFields() ──→ 应用到 compList
                              ├─ field.formVisible    （显隐）
                              ├─ field.required       （必填）
                              ├─ field.preps.disabled （禁用）
                              ├─ field.preps.readonly （只读）
                              ├─ field.preps.options  （选项）
                              └─ formData[field]      （赋值）
```

### 三套联动机制的关系

| 机制 | 层级 | 执行方式 | 触发时机 | 优先级 |
| --- | --- | --- | --- | --- |
| **dataRelation** | 字段级 | 同步 | 字段变更立即执行 | 低（先执行） |
| **apiLinkage** | 字段级 | 异步 | 字段变更触发接口 | 中 |
| **规则引擎** | 表单级 | 异步（300ms 防抖） | 表单级 watch formData | 高（覆盖前者） |

执行时序：字段变更 → dataRelation 同步 → apiLinkage 异步 → 300ms 后规则引擎异步 → 覆盖前者。

## 插件注册机制

`src/index.ts` 的 install 方法：

1. 注册全局 `draggable` 组件
2. 初始化本组件包 Pinia store
3. 安装 `star-horse-lowcode`（透传 options）
4. 通过 `import.meta.glob` 异步注册以下目录的所有 `.vue` 组件：
   - `components/system/*.vue`
   - `components/system/items/utils/*.vue`
   - `components/formcomp/items/*.vue`
   - `components/formcomp/container/*.vue`
5. 注册 `formContext` 上下文

导出内容：

```ts
export * from "@/components/formcomp/items";    // 表单项扩展
export * from "@/components/formcomp/container"; // 布局容器
export * from "@/components/types";              // 类型定义
export * from "@/components/system";             // 系统组件
```

## 技术选型说明

| 依赖 | 用途 |
| --- | --- |
| `@vue-flow/core` | 规则引擎与流程图的节点画布 |
| `element-plus` | UI 组件库 |
| `pinia` + `pinia-plugin-persistedstate` | 状态管理 + 持久化 |
| `vuedraggable-es` | 拖拽排序 |
| `stompjs` + `sockjs-client` | WebSocket 实时协作 |
| `vanilla-jsoneditor` | JSON 可视化编辑 |
| `axios` | HTTP 请求 |
| `lodash` | 工具函数 |
| `json5` | 宽松 JSON 解析 |
| `flv.js` | 视频播放（vedio-item） |

## 下一步

- [表单设计器](./form-designer.md)
- [规则引擎设计器](./rule-engine-designer.md)
- [布局容器](./containers.md)
- [通用页面模板](./commonpage.md)