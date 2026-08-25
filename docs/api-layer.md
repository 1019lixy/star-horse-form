# 前端 API 层

本文档列出 StarHorseForm 前端 API 层的全部接口。所有接口位于 `src/api/`。

## API 文件总览

| 文件 | 说明 |
| --- | --- |
| `rule_engine_api.ts` | 规则引擎 CRUD 接口 + `configureRuleEngine` / `getRuleEngineConfig` |
| `app_config.ts` | 全局端点配置 + `configureAppEndpoints` / `getAppEndpoints` / `appEndpoints` |
| `star_horse_form_api.ts` | 表单设计器 axios 实例 |
| `dataAdapter.ts` | 数据适配器（createDataAdapter / createParamDataAdapter / createBiParamDataAdapter） |
| `form_utils.ts` | 表单工具 |
| `star_horse_form_utils.ts` | 表单设计器工具 |
| `config_template_api.ts` | 配置模板接口 |
| `custom_component_api.ts` | 自定义组件接口（已支持 `initCustomCompApi`） |
| `ai_chat_api.ts` | AI 对话接口（已支持 `initAiApi`） |
| `ai_config_api.ts` | AI 配置接口（已支持 `initAiConfigApi`） |
| `short_key_operation.ts` | 快捷键操作 |
| `dyform-short-key-operation.ts` | 动态表单快捷键操作 |
| `keyboard-event-utils.ts` | 键盘事件工具 |
| `cached_utils.ts` | 缓存工具 |
| `settings.ts` | 设置 |
| `system.ts` | 系统接口 |
| `vueContext.ts` | Vue 上下文 |
| `pcas-code.json` | 省市区编码数据 |

## 端点配置（无状态注入）

遵循无状态 lib 库原则，本组件包**不绑定任何特定业务的接口地址**。所有后端交互路径均通过两个全局配置函数在宿主应用入口（如 `main.ts`）按需注入；未配置时使用内置默认值保证开箱可用。

### configureRuleEngine — 规则引擎 API 端点

定义于 `src/api/rule_engine_api.ts`：

```ts
interface RuleEngineApiConfig {
  serviceName: string;            // apiInstance 服务名，默认 "userdb-manage"
  ruleDefinitionPath: string;     // 规则定义路径，默认 "userdb/ruleDefinition"
  ruleConditionPath: string;      // 规则条件路径，默认 "userdb/ruleCondition"
  ruleActionPath: string;         // 规则动作路径，默认 "userdb/ruleAction"
  ruleSetPath: string;            // 规则集路径，默认 "userdb/ruleSet"
  ruleSetItemPath: string;        // 关联项路径，默认 "userdb/ruleSetItem"
  ruleVariablePath: string;       // 变量路径，默认 "userdb/ruleVariable"
  ruleExecutionLogPath: string;   // 执行日志路径，默认 "userdb/ruleExecutionLog"
  ruleEnginePath: string;         // 引擎执行路径，默认 "userdb/ruleEngine"
  ruleVersionPath: string;        // 版本路径，默认 "userdb/ruleVersion"
}

configureRuleEngine(cfg: Partial<RuleEngineApiConfig>): void
getRuleEngineConfig(): Readonly<RuleEngineApiConfig>
```

最终请求路径为 `/{serviceName}/{xxxPath}/具体操作`。例如默认配置下执行接口为
`POST /userdb-manage/userdb/ruleEngine/executeByForm/{formId}?triggerEvent=ON_LOAD`。

```ts
// 完全自定义
configureRuleEngine({ serviceName: "my-service", ruleEnginePath: "api/v2/ruleEngine" });
// 仅改服务名，其余路径沿用默认
configureRuleEngine({ serviceName: "custom-gateway" });
```

### configureAppEndpoints — 全局通用端点

定义于 `src/api/app_config.ts`，覆盖 WebSocket、代理、字典、网关等非规则引擎端点：

| 字段 | 默认值 | 使用方 |
| --- | --- | --- |
| `wsEndpoint` | `/api/ws/form` | FormSocketService / StarHorseFormDesign（SockJS 协同） |
| `redirectPrefix` | `/system-config/redirect` | ItemPreps（拼接 redirect 类地址） |
| `apiLinkageProxyUrl` | `/system-config/redirect/apiLinkage` | http-call 节点默认 proxyUrl、ApiSharedConfig |
| `executeProxyUrl` | `/system-config/redirect/execute` | ItemPreps 接口执行 |
| `serviceListUrl` | `/userdb-manage/redirect/api/service/list` | 内部服务列表下拉 |
| `dictPageListUrl` | `/system-config/system/dictinfoType/pageList` | 数据源字典分页 |
| `formDesignPageListUrl` | `userdb-manage/userdb/dynamicForm/pageList` | 表单选择分页列表 |
| `formDesignBaseUrl` | `userdb-manage/userdb/dynamicForm` | 表单设计器基础路径（getById 等操作拼接，RuleDesigner 加载表单字段） |
| `gatewayPrefix` | `/userdb-manage` | URL 拼接（custom_component_api、ai_*_api 兜底） |
| `gatewayServiceName` | `userdb-manage` | apiInstance 服务名（commonpage 三页） |

```ts
import { configureAppEndpoints } from "star-horse-form";

configureAppEndpoints({
  wsEndpoint: "/my-ws/form",
  gatewayPrefix: "/my-gateway",
  gatewayServiceName: "my-gateway",
  apiLinkageProxyUrl: "/system-config/redirect/apiLinkage",
});
```

> 配置为模块级单例，应在渲染任何表单/规则组件**之前**调用；重复调用按字段合并覆盖。`getAppEndpoints()` 返回只读快照用于调试。

## 规则引擎接口（rule_engine_api.ts）

以下表格中的路径均为**相对路径片段**，实际请求会拼接 `configureRuleEngine` 注入的 `{serviceName}/{xxxPath}` 前缀。所有请求通过 `postRequest` 发起 POST。

### ruleDefinitionApi（规则定义）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getRuleList(params?)` | `POST /ruleDefinition/pageList` | 获取规则列表（分页） |
| `getRuleById(id)` | `POST /ruleDefinition/getDataById/{id}` | 获取单个规则 |
| `saveRule(data)` | `POST /ruleDefinition/saveData` | 保存规则 |
| `updateRule(data)` | `POST /ruleDefinition/updateData` | 更新规则 |
| `deleteRule(id)` | `POST /ruleDefinition/deleteData/{id}` | 删除规则 |
| `listByRuleType(ruleType)` | `POST /ruleDefinition/listByRuleType/{ruleType}` | 根据规则类型查询 |
| `listByFormId(formId)` | `POST /ruleDefinition/listByFormId/{formId}` | 根据表单 ID 查询 |
| `getByRuleCode(ruleCode)` | `POST /ruleDefinition/getByRuleCode/{ruleCode}` | 根据规则编码查询 |

### ruleConditionApi（规则条件）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getConditionList(params?)` | `POST /ruleCondition/pageList` | 获取条件列表 |
| `listByRuleId(ruleId)` | `POST /ruleCondition/listByRuleId/{ruleId}` | 根据规则 ID 查询条件 |
| `saveCondition(data)` | `POST /ruleCondition/saveData` | 保存条件 |
| `batchSaveConditions(conditions)` | `POST /ruleCondition/batchSaveData` | 批量保存条件 |
| `deleteCondition(id)` | `POST /ruleCondition/deleteData/{id}` | 删除条件 |
| `deleteByRuleId(ruleId)` | `POST /ruleCondition/deleteByRuleId/{ruleId}` | 根据规则 ID 删除条件 |

### ruleActionApi（规则动作）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getActionList(params?)` | `POST /ruleAction/pageList` | 获取动作列表 |
| `listByRuleId(ruleId)` | `POST /ruleAction/listByRuleId/{ruleId}` | 根据规则 ID 查询动作 |
| `saveAction(data)` | `POST /ruleAction/saveData` | 保存动作 |
| `batchSaveActions(actions)` | `POST /ruleAction/batchSaveData` | 批量保存动作 |
| `deleteAction(id)` | `POST /ruleAction/deleteData/{id}` | 删除动作 |
| `deleteByRuleId(ruleId)` | `POST /ruleAction/deleteByRuleId/{ruleId}` | 根据规则 ID 删除动作 |

### ruleSetApi（规则集）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getRuleSetList(params?)` | `POST /ruleSet/pageList` | 获取规则集列表 |
| `getRuleSetById(id)` | `POST /ruleSet/getDataById/{id}` | 获取单个规则集 |
| `saveRuleSet(data)` | `POST /ruleSet/saveData` | 保存规则集 |
| `updateRuleSet(data)` | `POST /ruleSet/updateData` | 更新规则集 |
| `deleteRuleSet(id)` | `POST /ruleSet/deleteData/{id}` | 删除规则集 |
| `listBySetType(setType)` | `POST /ruleSet/listBySetType/{setType}` | 根据类型查询 |
| `listByFormId(formId)` | `POST /ruleSet/listByFormId/{formId}` | 根据表单 ID 查询 |

### ruleSetItemApi（规则集关联项）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getSetItemList(params?)` | `POST /ruleSetItem/pageList` | 获取关联项列表 |
| `listBySetId(setId)` | `POST /ruleSetItem/listBySetId/{setId}` | 根据规则集 ID 查询 |
| `saveSetItem(data)` | `POST /ruleSetItem/saveData` | 保存关联项 |
| `batchSaveSetItems(items)` | `POST /ruleSetItem/batchSaveData` | 批量保存关联项 |
| `deleteSetItem(id)` | `POST /ruleSetItem/deleteData/{id}` | 删除关联项 |
| `deleteBySetId(setId)` | `POST /ruleSetItem/deleteBySetId/{setId}` | 根据规则集 ID 删除 |

### ruleVariableApi（规则变量）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getVariableList(params?)` | `POST /ruleVariable/pageList` | 获取变量列表 |
| `getByVariableCode(code)` | `POST /ruleVariable/getByVariableCode/{code}` | 根据编码查询 |
| `listByFormId(formId)` | `POST /ruleVariable/listByFormId/{formId}` | 根据表单 ID 查询 |
| `saveVariable(data)` | `POST /ruleVariable/saveData` | 保存变量 |
| `updateVariable(data)` | `POST /ruleVariable/updateData` | 更新变量 |
| `deleteVariable(id)` | `POST /ruleVariable/deleteData/{id}` | 删除变量 |

### ruleExecutionLogApi（执行日志）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getLogList(params?)` | `POST /ruleExecutionLog/pageList` | 获取日志列表 |
| `listByRuleId(ruleId)` | `POST /ruleExecutionLog/listByRuleId/{ruleId}` | 根据规则 ID 查询 |
| `listBySetId(setId)` | `POST /ruleExecutionLog/listBySetId/{setId}` | 根据规则集 ID 查询 |
| `listByFormId(formId)` | `POST /ruleExecutionLog/listByFormId/{formId}` | 根据表单 ID 查询 |

### ruleEngineApi（规则引擎执行）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `executeRule(ruleId, context)` | `POST /ruleEngine/execute/{ruleId}` | 执行单个规则 |
| `executeRuleSet(setId, context)` | `POST /ruleEngine/executeSet/{setId}` | 执行规则集 |
| `executeByForm(formId, triggerEvent, context)` | `POST /ruleEngine/executeByForm/{formId}?triggerEvent=xxx` | 按表单执行规则集 |

`executeByForm` 是表单运行时最常用的接口，`triggerEvent` 取值：`ON_LOAD` / `ON_CHANGE` / `ON_SUBMIT` / `ON_VALIDATE` / `ON_BUTTON_CLICK`。

### ruleVersionApi（规则版本）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `getVersionList(params?)` | `POST /ruleVersion/pageList` | 获取版本列表 |
| `listByRuleId(ruleId)` | `POST /ruleVersion/listByRuleId/{ruleId}` | 根据规则 ID 查询版本 |
| `getByRuleIdAndVersion(ruleId, version)` | `POST /ruleVersion/getByRuleIdAndVersion/{ruleId}/{version}` | 根据规则 ID 和版本号查询 |
| `getPublishedVersion(ruleId)` | `POST /ruleVersion/getPublishedVersion/{ruleId}` | 查询已发布版本 |
| `publishVersion(versionId)` | `POST /ruleVersion/publishVersion/{versionId}` | 发布指定版本 |
| `getVersionById(id)` | `POST /ruleVersion/getDataById/{id}` | 获取单个版本 |
| `saveVersion(data)` | `POST /ruleVersion/saveData` | 保存版本 |
| `updateVersion(data)` | `POST /ruleVersion/updateData` | 更新版本 |
| `deleteVersion(id)` | `POST /ruleVersion/deleteData/{id}` | 删除版本 |

## axios 实例（star_horse_form_api.ts）

导出 `axiosInstance`，配置如下：

```ts
const axiosInstance = axios.create({
  baseURL: "/",
  timeout: 10000,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  withCredentials: true,
});
```

### 请求拦截器

自动添加请求头：

| 头 | 值 |
| --- | --- |
| `token` | 固定 token |
| `Authorization` | `Bearer {token}` |
| `Finger-Token` | 指纹 ID（`getFingerId()`） |
| `menuPosition` | `""` |
| `lang` | `zh_Cn` |

### 响应拦截器

| 状态码 | 处理 |
| --- | --- |
| 401 | 提示会话过期 |
| 500 | 提示服务器错误并 reject |
| 其他 | reject |

## 数据适配器（dataAdapter.ts）

提供三个工厂函数，自动处理请求 → 响应校验 → 数据提取 → 字段映射 → `SelectOption[]`。

### DataAdapterOptions

```ts
interface DataAdapterOptions {
  dataPath?: string;       // 响应数据路径，默认 'data.data'
  codePath?: string;       // 成功码路径，默认 'data.code'
  successCode?: number | string;  // 成功码值，默认 0
  messagePath?: string;    // 错误消息路径，默认 'data.message'
}
```

### FieldMapping

支持两种形式：

```ts
// 1. 属性名映射
{ name: "dictName", value: "dictCode" }

// 2. 自定义函数映射
{ name: (item) => item.label, value: (item) => item.id }

// 可选 children（树形数据）
{ name: "label", value: "id", children: "children" }
```

### createDataAdapter（无参数）

用于 `loadAppList` / `loadRolesList` / `loadDbList` 等无参回调：

```ts
loadAppList: createDataAdapter(
  () => loadSystemInfo(params, url),
  { name: "sysName", value: "idInformations" },
),
```

### createParamDataAdapter（单参数）

用于 `loadDicts` / `loadMenuList` 等单参回调：

```ts
loadDicts: createParamDataAdapter(
  (dictName) => postRequest("/api/dict", { fieldList: [{ propertyName: "dictType", value: dictName }] }),
  { name: "dictName", value: "dictCode" },
),

loadMenuList: createParamDataAdapter(
  (appId) => permissionMenus({}, appId),
  { name: "menuName", value: "idMenusinfo" },
  { dataPath: "data.data" },
),
```

### createBiParamDataAdapter（双参数）

用于 `loadTableColumns` 等双参回调：

```ts
loadTableColumns: createBiParamDataAdapter(
  (dataSourceId, tableName) => getRequest(`/api/columns/${dataSourceId}/${tableName}`),
  { name: "comment", value: "fieldName" },
),
```

> 这三个函数通过 `src/components/types/index.ts` 导出，可直接 `import { createDataAdapter, createParamDataAdapter, createBiParamDataAdapter } from "star-horse-form"` 使用。

## 其他 API 文件

| 文件 | 说明 |
| --- | --- |
| `config_template_api.ts` | 配置模板 CRUD 接口（保存/加载/删除模板，对接 `FormConfig.configTemplateApi`） |
| `custom_component_api.ts` | 自定义第三方组件接口（对接 `FormConfig.customCompApi`，默认 `/userdb-manage/userdb/customComponent`） |
| `ai_chat_api.ts` | AI 对话接口（AiDialog 组件使用） |
| `ai_config_api.ts` | AI 配置接口 |
| `form_utils.ts` | 表单工具函数 |
| `star_horse_form_utils.ts` | 表单设计器工具函数 |
| `short_key_operation.ts` | 快捷键操作定义 |
| `dyform-short-key-operation.ts` | 动态表单快捷键操作定义 |
| `keyboard-event-utils.ts` | 键盘事件工具（快捷键绑定/解绑） |
| `cached_utils.ts` | 缓存工具（浏览器本地缓存） |
| `settings.ts` | 设置 |
| `system.ts` | 系统接口 |
| `vueContext.ts` | Vue 上下文注册（`registerVueContext`，install 时注册 `formContext`） |
| `pcas-code.json` | 省市区行政区划编码数据（级联选择器使用） |

## 下一步

- [后端接口](./backend-api.md)
- [规则引擎设计器](./rule-engine-designer.md)
- [表单设计器](./form-designer.md)