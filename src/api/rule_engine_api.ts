
// 规则定义相关接口
import {apiInstance, postRequest} from "star-horse-lowcode";
const ruleDefineUrl=apiInstance("userdb-manage","userdb/ruleDefinition");
const ruleConditionUrl=apiInstance("userdb-manage","userdb/ruleCondition");
const ruleActionUrl=apiInstance("userdb-manage","userdb/ruleAction");
const ruleSetUrl=apiInstance("userdb-manage","userdb/ruleSet");
const ruleSetItemUrl=apiInstance("userdb-manage","userdb/ruleSetItem");
const ruleVariableUrl=apiInstance("userdb-manage","userdb/ruleVariable");
const ruleExecutionLogUrl=apiInstance("userdb-manage","userdb/ruleExecutionLog");
const ruleEngineUrl=apiInstance("userdb-manage","userdb/ruleEngine");
const ruleVersionUrl=apiInstance("userdb-manage","userdb/ruleVersion");
export const ruleDefinitionApi = {
  // 获取规则列表
  getRuleList: (params?: any) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/pageList`, params);
  },

  // 获取单个规则
  getRuleById: (id: string) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/getDataById/${id}`,{});
  },

  // 保存规则
  saveRule: (data: any) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/saveData`, data);
  },

  // 更新规则
  updateRule: (data: any) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/updateData`, data);
  },

  // 删除规则
  deleteRule: (id: string) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/deleteData/${id}`,{});
  },

  // 根据规则类型查询
  listByRuleType: (ruleType: string) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/listByRuleType/${ruleType}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/listByFormId/${formId}`,{});
  },

  // 根据规则编码查询
  getByRuleCode: (ruleCode: string) => {
    return postRequest(`${ruleDefineUrl.basePrefix}/getByRuleCode/${ruleCode}`,{});
  }
};

// 规则条件相关接口
export const ruleConditionApi = {
  // 获取条件列表
  getConditionList: (params?: any) => {
    return postRequest(`${ruleConditionUrl.basePrefix}/pageList`, params);
  },

  // 根据规则ID查询条件
  listByRuleId: (ruleId: string) => {
    return postRequest(`${ruleConditionUrl.basePrefix}/listByRuleId/${ruleId}`,{});
  },

  // 保存条件
  saveCondition: (data: any) => {
    return postRequest(`${ruleConditionUrl.basePrefix}/saveData`, data);
  },

  // 批量保存条件
  batchSaveConditions: (conditions: any[]) => {
    return postRequest(`${ruleConditionUrl.basePrefix}/batchSaveData`, conditions);
  },

  // 删除条件
  deleteCondition: (id: string) => {
    return postRequest(`${ruleConditionUrl.basePrefix}/deleteData/${id}`,{});
  },

  // 根据规则ID删除条件
  deleteByRuleId: (ruleId: string) => {
    return postRequest(`${ruleConditionUrl.basePrefix}/deleteByRuleId/${ruleId}`,{});
  }
};

// 规则动作相关接口
export const ruleActionApi = {
  // 获取动作列表
  getActionList: (params?: any) => {
    return postRequest(`${ruleActionUrl.basePrefix}/pageList`, params);
  },

  // 根据规则ID查询动作
  listByRuleId: (ruleId: string) => {
    return postRequest(`${ruleActionUrl.basePrefix}/listByRuleId/${ruleId}`,{});
  },

  // 保存动作
  saveAction: (data: any) => {
    return postRequest(`${ruleActionUrl.basePrefix}/saveData`, data);
  },

  // 批量保存动作
  batchSaveActions: (actions: any[]) => {
    return postRequest(`${ruleActionUrl.basePrefix}/batchSaveData`, actions);
  },

  // 删除动作
  deleteAction: (id: string) => {
    return postRequest(`${ruleActionUrl.basePrefix}/deleteData/${id}`,{});
  },

  // 根据规则ID删除动作
  deleteByRuleId: (ruleId: string) => {
    return postRequest(`${ruleActionUrl.basePrefix}/deleteByRuleId/${ruleId}`,{});
  }
};

// 规则集相关接口
export const ruleSetApi = {
  // 获取规则集列表
  getRuleSetList: (params?: any) => {
    return postRequest(`${ruleSetUrl.basePrefix}/pageList`, params);
  },

  // 获取单个规则集
  getRuleSetById: (id: string) => {
    return postRequest(`${ruleSetUrl.basePrefix}/getDataById/${id}`,{});
  },

  // 保存规则集
  saveRuleSet: (data: any) => {
      return postRequest(`${ruleSetUrl.basePrefix}/saveData`, data);
  },

  // 更新规则集
  updateRuleSet: (data: any) => {
    return postRequest(`${ruleSetUrl.basePrefix}/updateData`, data);
  },

  // 删除规则集
  deleteRuleSet: (id: string) => {
    return postRequest(`${ruleSetUrl.basePrefix}/deleteData/${id}`,{});
  },

  // 根据类型查询
  listBySetType: (setType: string) => {
    return postRequest(`${ruleSetUrl.basePrefix}/listBySetType/${setType}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`${ruleSetUrl.basePrefix}/listByFormId/${formId}`,{});
  }
};

// 规则集关联项接口
export const ruleSetItemApi = {
  // 获取关联项列表
  getSetItemList: (params?: any) => {
    return postRequest(`${ruleSetItemUrl.basePrefix}/pageList`, params);
  },

  // 根据规则集ID查询
  listBySetId: (setId: string) => {
    return postRequest(`${ruleSetItemUrl.basePrefix}/listBySetId/${setId}`,{});
  },

  // 保存关联项
  saveSetItem: (data: any) => {
    return postRequest(`${ruleSetItemUrl.basePrefix}/saveData`, data);
  },

  // 批量保存关联项
  batchSaveSetItems: (items: any[]) => {
    return postRequest(`${ruleSetItemUrl.basePrefix}/batchSaveData`, items);
  },

  // 删除关联项
  deleteSetItem: (id: string) => {
    return postRequest(`${ruleSetItemUrl.basePrefix}/deleteData/${id}`,{});
  },

  // 根据规则集ID删除
  deleteBySetId: (setId: string) => {
    return postRequest(`${ruleSetItemUrl.basePrefix}/deleteBySetId/${setId}`,{});
  }
};

// 规则变量相关接口
export const ruleVariableApi = {
  // 获取变量列表
  getVariableList: (params?: any) => {
    return postRequest(`${ruleVariableUrl.basePrefix}/pageList`, params);
  },

  // 根据编码查询
  getByVariableCode: (code: string) => {
    return postRequest(`${ruleVariableUrl.basePrefix}/getByVariableCode/${code}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`${ruleVariableUrl.basePrefix}/listByFormId/${formId}`,{});
  },

  // 保存变量
  saveVariable: (data: any) => {
    return postRequest(`${ruleVariableUrl.basePrefix}/saveData`, data);
  },

  // 更新变量
  updateVariable: (data: any) => {
    return postRequest(`${ruleVariableUrl.basePrefix}/updateData`, data);
  },

  // 删除变量
  deleteVariable: (id: string) => {
    return postRequest(`${ruleVariableUrl.basePrefix}/deleteData/${id}`,{});
  }
};

// 规则执行日志接口
export const ruleExecutionLogApi = {
  // 获取日志列表
  getLogList: (params?: any) => {
    return postRequest(`${ruleExecutionLogUrl.basePrefix}/pageList`, params);
  },

  // 根据规则ID查询
  listByRuleId: (ruleId: string) => {
    return postRequest(`${ruleExecutionLogUrl.basePrefix}/listByRuleId/${ruleId}`,{});
  },

  // 根据规则集ID查询
  listBySetId: (setId: string) => {
    return postRequest(`${ruleExecutionLogUrl.basePrefix}/listBySetId/${setId}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`${ruleExecutionLogUrl.basePrefix}/listByFormId/${formId}`,{});
  }
};

// 规则引擎执行接口
export const ruleEngineApi = {
  // 执行单个规则
  executeRule: (ruleId: string, context: any) => {
    return postRequest(`${ruleEngineUrl.basePrefix}/execute/${ruleId}`, context);
  },

  // 执行规则集
  executeRuleSet: (setId: string, context: any) => {
    return postRequest(`${ruleEngineUrl.basePrefix}/executeSet/${setId}`, context);
  },

  // 根据表单执行规则集
  executeByForm: (formId: string, triggerEvent: string, context: any) => {
    return postRequest(`${ruleEngineUrl.basePrefix}/executeByForm/${formId}?triggerEvent=${triggerEvent}`, context);
  }
};

// 规则版本相关接口
export const ruleVersionApi = {
  // 获取版本列表
  getVersionList: (params?: any) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/pageList`, params);
  },

  // 根据规则ID查询版本列表
  listByRuleId: (ruleId: string) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/listByRuleId/${ruleId}`,{});
  },

  // 根据规则ID和版本号查询
  getByRuleIdAndVersion: (ruleId: string, version: number) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/getByRuleIdAndVersion/${ruleId}/${version}`,{});
  },

  // 查询已发布的版本
  getPublishedVersion: (ruleId: string) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/getPublishedVersion/${ruleId}`,{});
  },

  // 发布指定版本
  publishVersion: (versionId: string) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/publishVersion/${versionId}`,{});
  },

  // 获取单个版本
  getVersionById: (id: string) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/getDataById/${id}`,{});
  },

  // 保存版本
  saveVersion: (data: any) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/saveData`, data);
  },

  // 更新版本
  updateVersion: (data: any) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/updateData`, data);
  },

  // 删除版本
  deleteVersion: (id: string) => {
    return postRequest(`${ruleVersionUrl.basePrefix}/deleteData/${id}`,{});
  }
};
