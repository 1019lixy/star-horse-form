
// 规则定义相关接口
import { postRequest } from "star-horse-lowcode";

export const ruleDefinitionApi = {
  // 获取规则列表
  getRuleList: (params?: any) => {
    return postRequest('/userdb/ruleDefinition/pageList', params);
  },

  // 获取单个规则
  getRuleById: (id: string) => {
    return postRequest(`/userdb/ruleDefinition/getDataById/${id}`,{});
  },

  // 保存规则
  saveRule: (data: any) => {
    return postRequest('/userdb/ruleDefinition/saveData', data);
  },

  // 更新规则
  updateRule: (data: any) => {
    return postRequest('/userdb/ruleDefinition/updateData', data);
  },

  // 删除规则
  deleteRule: (id: string) => {
    return postRequest(`/userdb/ruleDefinition/deleteData/${id}`,{});
  },

  // 根据规则类型查询
  listByRuleType: (ruleType: string) => {
    return postRequest(`/userdb/ruleDefinition/listByRuleType/${ruleType}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`/userdb/ruleDefinition/listByFormId/${formId}`,{});
  },

  // 根据规则编码查询
  getByRuleCode: (ruleCode: string) => {
    return postRequest(`/userdb/ruleDefinition/getByRuleCode/${ruleCode}`,{});
  }
};

// 规则条件相关接口
export const ruleConditionApi = {
  // 获取条件列表
  getConditionList: (params?: any) => {
    return postRequest('/userdb/ruleCondition/pageList', params);
  },

  // 根据规则ID查询条件
  listByRuleId: (ruleId: string) => {
    return postRequest(`/userdb/ruleCondition/listByRuleId/${ruleId}`,{});
  },

  // 保存条件
  saveCondition: (data: any) => {
    return postRequest('/userdb/ruleCondition/saveData', data);
  },

  // 批量保存条件
  batchSaveConditions: (conditions: any[]) => {
    return postRequest('/userdb/ruleCondition/batchSaveData', conditions);
  },

  // 删除条件
  deleteCondition: (id: string) => {
    return postRequest(`/userdb/ruleCondition/deleteData/${id}`,{});
  },

  // 根据规则ID删除条件
  deleteByRuleId: (ruleId: string) => {
    return postRequest(`/userdb/ruleCondition/deleteByRuleId/${ruleId}`,{});
  }
};

// 规则动作相关接口
export const ruleActionApi = {
  // 获取动作列表
  getActionList: (params?: any) => {
    return postRequest('/userdb/ruleAction/pageList', params);
  },

  // 根据规则ID查询动作
  listByRuleId: (ruleId: string) => {
    return postRequest(`/userdb/ruleAction/listByRuleId/${ruleId}`,{});
  },

  // 保存动作
  saveAction: (data: any) => {
    return postRequest('/userdb/ruleAction/saveData', data);
  },

  // 批量保存动作
  batchSaveActions: (actions: any[]) => {
    return postRequest('/userdb/ruleAction/batchSaveData', actions);
  },

  // 删除动作
  deleteAction: (id: string) => {
    return postRequest(`/userdb/ruleAction/deleteData/${id}`,{});
  },

  // 根据规则ID删除动作
  deleteByRuleId: (ruleId: string) => {
    return postRequest(`/userdb/ruleAction/deleteByRuleId/${ruleId}`,{});
  }
};

// 规则集相关接口
export const ruleSetApi = {
  // 获取规则集列表
  getRuleSetList: (params?: any) => {
    return postRequest('/userdb/ruleSet/pageList', params);
  },

  // 获取单个规则集
  getRuleSetById: (id: string) => {
    return postRequest(`/userdb/ruleSet/getDataById/${id}`,{});
  },

  // 保存规则集
  saveRuleSet: (data: any) => {
    return postRequest('/userdb/ruleSet/saveData', data);
  },

  // 更新规则集
  updateRuleSet: (data: any) => {
    return postRequest('/userdb/ruleSet/updateData', data);
  },

  // 删除规则集
  deleteRuleSet: (id: string) => {
    return postRequest(`/userdb/ruleSet/deleteData/${id}`,{});
  },

  // 根据类型查询
  listBySetType: (setType: string) => {
    return postRequest(`/userdb/ruleSet/listBySetType/${setType}`);
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`/userdb/ruleSet/listByFormId/${formId}`,{});
  }
};

// 规则集关联项接口
export const ruleSetItemApi = {
  // 获取关联项列表
  getSetItemList: (params?: any) => {
    return postRequest('/userdb/ruleSetItem/pageList', params);
  },

  // 根据规则集ID查询
  listBySetId: (setId: string) => {
    return postRequest(`/userdb/ruleSetItem/listBySetId/${setId}`,{});
  },

  // 保存关联项
  saveSetItem: (data: any) => {
    return postRequest('/userdb/ruleSetItem/saveData', data);
  },

  // 批量保存关联项
  batchSaveSetItems: (items: any[]) => {
    return postRequest('/userdb/ruleSetItem/batchSaveData', items);
  },

  // 删除关联项
  deleteSetItem: (id: string) => {
    return postRequest(`/userdb/ruleSetItem/deleteData/${id}`,{});
  },

  // 根据规则集ID删除
  deleteBySetId: (setId: string) => {
    return postRequest(`/userdb/ruleSetItem/deleteBySetId/${setId}`,{});
  }
};

// 规则变量相关接口
export const ruleVariableApi = {
  // 获取变量列表
  getVariableList: (params?: any) => {
    return postRequest('/userdb/ruleVariable/pageList', params);
  },

  // 根据编码查询
  getByVariableCode: (code: string) => {
    return postRequest(`/userdb/ruleVariable/getByVariableCode/${code}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`/userdb/ruleVariable/listByFormId/${formId}`,{});
  },

  // 保存变量
  saveVariable: (data: any) => {
    return postRequest('/userdb/ruleVariable/saveData', data);
  },

  // 更新变量
  updateVariable: (data: any) => {
    return postRequest('/userdb/ruleVariable/updateData', data);
  },

  // 删除变量
  deleteVariable: (id: string) => {
    return postRequest(`/userdb/ruleVariable/deleteData/${id}`,{});
  }
};

// 规则执行日志接口
export const ruleExecutionLogApi = {
  // 获取日志列表
  getLogList: (params?: any) => {
    return postRequest('/userdb/ruleExecutionLog/pageList', params);
  },

  // 根据规则ID查询
  listByRuleId: (ruleId: string) => {
    return postRequest(`/userdb/ruleExecutionLog/listByRuleId/${ruleId}`,{});
  },

  // 根据规则集ID查询
  listBySetId: (setId: string) => {
    return postRequest(`/userdb/ruleExecutionLog/listBySetId/${setId}`,{});
  },

  // 根据表单ID查询
  listByFormId: (formId: string) => {
    return postRequest(`/userdb/ruleExecutionLog/listByFormId/${formId}`,{});
  }
};

// 规则引擎执行接口
export const ruleEngineApi = {
  // 执行单个规则
  executeRule: (ruleId: string, context: any) => {
    return postRequest(`/userdb/ruleEngine/execute/${ruleId}`, context);
  },

  // 执行规则集
  executeRuleSet: (setId: string, context: any) => {
    return postRequest(`/userdb/ruleEngine/executeSet/${setId}`, context);
  },

  // 根据表单执行规则集
  executeByForm: (formId: string, triggerEvent: string, context: any) => {
    return postRequest(`/userdb/ruleEngine/executeByForm/${formId}?triggerEvent=${triggerEvent}`, context);
  }
};
