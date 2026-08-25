import {apiInstance, postRequest} from "star-horse-lowcode";

/**
 * 规则引擎 API 配置
 *
 * serviceName + path 由 apiInstance 生成完整的 basePrefix，
 * 最终请求路径为：/{serviceName}/{path}/具体操作
 *
 * 示例：serviceName="userdb-manage", path="userdb/ruleEngine"
 *      → basePrefix="/userdb-manage/userdb/ruleEngine"
 *      → POST /userdb-manage/userdb/ruleEngine/executeByForm/{formId}?triggerEvent=xxx
 */
export interface RuleEngineApiConfig {
  serviceName: string;
  ruleDefinitionPath: string;
  ruleConditionPath: string;
  ruleActionPath: string;
  ruleSetPath: string;
  ruleSetItemPath: string;
  ruleVariablePath: string;
  ruleExecutionLogPath: string;
  ruleEnginePath: string;
  ruleVersionPath: string;
}

let ruleConfig: RuleEngineApiConfig = {
  serviceName: "userdb-manage",
  ruleDefinitionPath: "userdb/ruleDefinition",
  ruleConditionPath: "userdb/ruleCondition",
  ruleActionPath: "userdb/ruleAction",
  ruleSetPath: "userdb/ruleSet",
  ruleSetItemPath: "userdb/ruleSetItem",
  ruleVariablePath: "userdb/ruleVariable",
  ruleExecutionLogPath: "userdb/ruleExecutionLog",
  ruleEnginePath: "userdb/ruleEngine",
  ruleVersionPath: "userdb/ruleVersion",
};

/**
 * 配置规则引擎 API 端点
 *
 * 无状态 lib 库原则：所有后端交互必须通过此函数注入配置，
 * 不绑定任何特定业务的接口路径。
 *
 * @example 完全自定义
 * ```ts
 * import { configureRuleEngine } from "star-horse-form";
 * configureRuleEngine({
 *   serviceName: "my-service",
 *   ruleEnginePath: "api/v2/ruleEngine",
 * });
 * ```
 *
 * @example 仅改 serviceName，其余路径沿用默认
 * ```ts
 * configureRuleEngine({ serviceName: "custom-gateway" });
 * ```
 */
export function configureRuleEngine(
  cfg: Partial<RuleEngineApiConfig>,
): void {
  Object.assign(ruleConfig, cfg);
}

/** 获取当前规则引擎 API 配置（只读） */
export function getRuleEngineConfig(): Readonly<RuleEngineApiConfig> {
  return { ...ruleConfig };
}

function ruleApi(pathKey: keyof Omit<RuleEngineApiConfig, "serviceName">) {
  return apiInstance(ruleConfig.serviceName, ruleConfig[pathKey]);
}

// 规则定义
export const ruleDefinitionApi = {
  getRuleList: (params?: any) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/pageList`, params),
  getRuleById: (id: string) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/getDataById/${id}`, {}),
  saveRule: (data: any) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/saveData`, data),
  updateRule: (data: any) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/updateData`, data),
  deleteRule: (id: string) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/deleteData/${id}`, {}),
  listByRuleType: (ruleType: string) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/listByRuleType/${ruleType}`, {}),
  listByFormId: (formId: string) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/listByFormId/${formId}`, {}),
  getByRuleCode: (ruleCode: string) =>
    postRequest(`${ruleApi("ruleDefinitionPath").basePrefix}/getByRuleCode/${ruleCode}`, {}),
};

// 规则条件
export const ruleConditionApi = {
  getConditionList: (params?: any) =>
    postRequest(`${ruleApi("ruleConditionPath").basePrefix}/pageList`, params),
  listByRuleId: (ruleId: string) =>
    postRequest(`${ruleApi("ruleConditionPath").basePrefix}/listByRuleId/${ruleId}`, {}),
  saveCondition: (data: any) =>
    postRequest(`${ruleApi("ruleConditionPath").basePrefix}/saveData`, data),
  batchSaveConditions: (conditions: any[]) =>
    postRequest(`${ruleApi("ruleConditionPath").basePrefix}/batchSaveData`, conditions),
  deleteCondition: (id: string) =>
    postRequest(`${ruleApi("ruleConditionPath").basePrefix}/deleteData/${id}`, {}),
  deleteByRuleId: (ruleId: string) =>
    postRequest(`${ruleApi("ruleConditionPath").basePrefix}/deleteByRuleId/${ruleId}`, {}),
};

// 规则动作
export const ruleActionApi = {
  getActionList: (params?: any) =>
    postRequest(`${ruleApi("ruleActionPath").basePrefix}/pageList`, params),
  listByRuleId: (ruleId: string) =>
    postRequest(`${ruleApi("ruleActionPath").basePrefix}/listByRuleId/${ruleId}`, {}),
  saveAction: (data: any) =>
    postRequest(`${ruleApi("ruleActionPath").basePrefix}/saveData`, data),
  batchSaveActions: (actions: any[]) =>
    postRequest(`${ruleApi("ruleActionPath").basePrefix}/batchSaveData`, actions),
  deleteAction: (id: string) =>
    postRequest(`${ruleApi("ruleActionPath").basePrefix}/deleteData/${id}`, {}),
  deleteByRuleId: (ruleId: string) =>
    postRequest(`${ruleApi("ruleActionPath").basePrefix}/deleteByRuleId/${ruleId}`, {}),
};

// 规则集
export const ruleSetApi = {
  getRuleSetList: (params?: any) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/pageList`, params),
  getRuleSetById: (id: string) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/getDataById/${id}`, {}),
  saveRuleSet: (data: any) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/saveData`, data),
  updateRuleSet: (data: any) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/updateData`, data),
  deleteRuleSet: (id: string) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/deleteData/${id}`, {}),
  listBySetType: (setType: string) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/listBySetType/${setType}`, {}),
  listByFormId: (formId: string) =>
    postRequest(`${ruleApi("ruleSetPath").basePrefix}/listByFormId/${formId}`, {}),
};

// 规则集关联项
export const ruleSetItemApi = {
  getSetItemList: (params?: any) =>
    postRequest(`${ruleApi("ruleSetItemPath").basePrefix}/pageList`, params),
  listBySetId: (setId: string) =>
    postRequest(`${ruleApi("ruleSetItemPath").basePrefix}/listBySetId/${setId}`, {}),
  saveSetItem: (data: any) =>
    postRequest(`${ruleApi("ruleSetItemPath").basePrefix}/saveData`, data),
  batchSaveSetItems: (items: any[]) =>
    postRequest(`${ruleApi("ruleSetItemPath").basePrefix}/batchSaveData`, items),
  deleteSetItem: (id: string) =>
    postRequest(`${ruleApi("ruleSetItemPath").basePrefix}/deleteData/${id}`, {}),
  deleteBySetId: (setId: string) =>
    postRequest(`${ruleApi("ruleSetItemPath").basePrefix}/deleteBySetId/${setId}`, {}),
};

// 规则变量
export const ruleVariableApi = {
  getVariableList: (params?: any) =>
    postRequest(`${ruleApi("ruleVariablePath").basePrefix}/pageList`, params),
  getByVariableCode: (code: string) =>
    postRequest(`${ruleApi("ruleVariablePath").basePrefix}/getByVariableCode/${code}`, {}),
  listByFormId: (formId: string) =>
    postRequest(`${ruleApi("ruleVariablePath").basePrefix}/listByFormId/${formId}`, {}),
  saveVariable: (data: any) =>
    postRequest(`${ruleApi("ruleVariablePath").basePrefix}/saveData`, data),
  updateVariable: (data: any) =>
    postRequest(`${ruleApi("ruleVariablePath").basePrefix}/updateData`, data),
  deleteVariable: (id: string) =>
    postRequest(`${ruleApi("ruleVariablePath").basePrefix}/deleteData/${id}`, {}),
};

// 执行日志
export const ruleExecutionLogApi = {
  getLogList: (params?: any) =>
    postRequest(`${ruleApi("ruleExecutionLogPath").basePrefix}/pageList`, params),
  listByRuleId: (ruleId: string) =>
    postRequest(`${ruleApi("ruleExecutionLogPath").basePrefix}/listByRuleId/${ruleId}`, {}),
  listBySetId: (setId: string) =>
    postRequest(`${ruleApi("ruleExecutionLogPath").basePrefix}/listBySetId/${setId}`, {}),
  listByFormId: (formId: string) =>
    postRequest(`${ruleApi("ruleExecutionLogPath").basePrefix}/listByFormId/${formId}`, {}),
};

// 引擎执行
export const ruleEngineApi = {
  executeRule: (ruleId: string, context: any) =>
    postRequest(`${ruleApi("ruleEnginePath").basePrefix}/execute/${ruleId}`, context),
  executeRuleSet: (setId: string, context: any) =>
    postRequest(`${ruleApi("ruleEnginePath").basePrefix}/executeSet/${setId}`, context),
  executeByForm: (formId: string, triggerEvent: string, context: any) =>
    postRequest(
      `${ruleApi("ruleEnginePath").basePrefix}/executeByForm/${formId}?triggerEvent=${triggerEvent}`,
      context,
    ),
};

// 版本管理
export const ruleVersionApi = {
  getVersionList: (params?: any) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/pageList`, params),
  listByRuleId: (ruleId: string) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/listByRuleId/${ruleId}`, {}),
  getByRuleIdAndVersion: (ruleId: string, version: number) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/getByRuleIdAndVersion/${ruleId}/${version}`, {}),
  getPublishedVersion: (ruleId: string) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/getPublishedVersion/${ruleId}`, {}),
  publishVersion: (versionId: string) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/publishVersion/${versionId}`, {}),
  getVersionById: (id: string) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/getDataById/${id}`, {}),
  saveVersion: (data: any) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/saveData`, data),
  updateVersion: (data: any) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/updateData`, data),
  deleteVersion: (id: string) =>
    postRequest(`${ruleApi("ruleVersionPath").basePrefix}/deleteData/${id}`, {}),
};