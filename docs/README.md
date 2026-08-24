# StarHorseForm（star-horse-form）文档

> 版本：v2.2.5　|　基于 `star-horse-lowcode` 核心库打造的动态表单设计器组件包

StarHorseForm 是一套面向低代码平台的**动态表单设计器 + 规则引擎设计器 + 通用页面模板 + 流程图设计器**组件包。它以 Vue 3 + Element Plus + Vue Flow 为技术底座，内置表单可视化设计、规则可视化编排、16 种开箱即用的业务页面模板与流程图编排能力，可独立嵌入任意 Vue 3 项目。

## 在线浏览

打开 [`index.html`](./index.html) 可浏览整合所有文档的单页站点（含侧边栏导航、搜索、移动端适配）。

**同步更新**：修改 `.md` 文件后，运行以下命令重新生成 `index.html`：

```bash
node docs/build-html.cjs
```

## 文档导航

| 文档 | 内容 |
| --- | --- |
| [快速上手](./getting-started.md) | 安装、全局配置、最小可用示例、FormConfig 速查 |
| [架构总览](./architecture.md) | 模块划分、目录结构、与 star-horse-lowcode 的关系、数据流 |
| [表单设计器](./form-designer.md) | StarHorseFormDesign 的 props/emits/expose、FormConfig 全字段、设计器面板体系、自定义组件接入 |
| [规则引擎设计器](./rule-engine-designer.md) | RuleDesigner、8 种节点类型、useRuleEngine/useFormRuleRuntime、RuleExecutor、触发事件、字段控制指令、后端对接 |
| [布局容器](./containers.md) | formcomp/container 全部容器组件（box/dytable/gridtable/card/collapse/tab/table/step/anchor/splitter/fieldset/group/descriptions/dialog/drawer/condition） |
| [通用页面模板](./commonpage.md) | 16 个通用页面组件 + useCommonPage composable |
| [流程图设计器](./diagram-designer.md) | DiagramDesigner + panels + useDiagramDesigner |
| [工具与系统组件](./system-components.md) | DynamicQueryBuilder、ConfigTemplateManager、AiDialog、DataSourceComp 等系统组件 |
| [前端 API 层](./api-layer.md) | rule_engine_api、star_horse_form_api、dataAdapter 等接口清单 |
| [后端接口](./backend-api.md) | Java Spring Boot 后端 FormController + WebSocketConfig |

## 核心能力一览

- **表单可视化设计**：拖拽式设计器，支持 50+ 表单项、20+ 布局容器、自定义组件接入、配置模板复用、快捷键、预览/导出 HTML。
- **规则引擎设计器**（v2.2.5 新增）：基于 Vue Flow 的规则可视化编排，8 种节点（start/end/condition/action/exclusive-gateway/http-call/variable-assign/script），5 种触发事件（ON_LOAD/ON_CHANGE/ON_SUBMIT/ON_VALIDATE/ON_BUTTON_CLICK），字段级控制指令（显隐/必填/只读/禁用/赋值/选项），与表单运行时桥接，300ms 防抖。
- **通用页面模板**：审批页、卡片列表、对比页、仪表盘、详情页、表单页、表单表格页、导入导出、主从表、普通页、打印页、标签页、树形页、查看表单、向导页共 16 种。
- **流程图设计器**：独立 DiagramDesigner，支持自定义节点、连线、属性面板、预览。
- **三套联动机制**：字段级 dataRelation（同步轻量）、接口级 apiLinkage（异步）、规则引擎（表单级，最强）。

## 技术栈

- Vue 3.5 + TypeScript 6 + Element Plus 2.14
- @vue-flow/core（规则/流程图画布）
- Pinia 4（状态管理，含持久化）
- vuedraggable-es（拖拽排序）
- stompjs + sockjs-client（WebSocket 实时协作）
- vanilla-jsoneditor（JSON 编辑）
- star-horse-lowcode（核心库，本地 ../shplugin）

## 快速链接

- [FormConfig 完整字段表](./form-designer.md#formconfig-完整字段表)
- [8 种规则节点类型](./rule-engine-designer.md#节点类型定义)
- [5 种触发事件](./rule-engine-designer.md#触发事件)
- [字段控制指令 FieldAction](./rule-engine-designer.md#字段控制指令-fieldaction)
- [useCommonPage composable](./commonpage.md#usecommonpage-composable)
- [规则引擎 API 清单](./api-layer.md#规则引擎接口-rule_engine_apits)