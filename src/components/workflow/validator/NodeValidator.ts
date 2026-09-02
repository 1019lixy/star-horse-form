/**
 * 流程节点校验器。
 *
 * 从 shdevopsui 移植并修正：源项目引用了不存在的 `FlowNodeEnums.CONDITION_NODE`，
 * 这里统一改为 `BRANCH_CONDITION_NODE`。校验器为纯函数，递归遍历节点树并收集错误，
 * 不依赖 Vue 与 UI，可独立用于表单设计器或流程引擎侧校验。
 */
import { FlowNodeEnums } from "@/components/workflow/enums/FlowNodeEnums";

/** 节点校验结果 */
export interface NodeValidateResult {
  valid: boolean;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  errors: string[];
}

/** 校验单个节点 */
export const validateNode = (node: any): NodeValidateResult => {
  const errors: string[] = [];
  if (!node || !node.type) {
    return { valid: true, nodeId: "", nodeName: "", nodeType: "", errors: [] };
  }

  switch (node.type) {
    case FlowNodeEnums.APPROVER_NODE:
    case FlowNodeEnums.HANDLE_NODE:
      validateApprovalNode(node, errors);
      break;
    case FlowNodeEnums.COPYER_NODE:
      validateCopyerNode(node, errors);
      break;
    case FlowNodeEnums.NOTICE_NODE:
      validateNoticeNode(node, errors);
      break;
    case FlowNodeEnums.SERVICE_NODE:
      validateServiceNode(node, errors);
      break;
    case FlowNodeEnums.TIMER_NODE:
      validateTimerNode(node, errors);
      break;
    case FlowNodeEnums.BRANCH_NODE:
      validateBranchNode(node, errors);
      break;
    case FlowNodeEnums.SUGGEST_NODE:
      validateSuggestNode(node, errors);
      break;
    case FlowNodeEnums.PARALLEL_NODE:
      validateParallelNode(node, errors);
      break;
    case FlowNodeEnums.BRANCH_CONDITION_NODE:
      validateConditionNode(node, errors);
      break;
    case FlowNodeEnums.APPLY_NODE:
      validateApplyNode(node, errors);
      break;
    default:
      break;
  }

  return {
    valid: errors.length === 0,
    nodeId: node.id || "",
    nodeName: node.name || "",
    nodeType: node.type || "",
    errors,
  };
};

/** 审批/办理节点校验 */
const validateApprovalNode = (node: any, errors: string[]) => {
  if (!node.name || node.name.trim() === "") {
    errors.push("节点名称不能为空");
  }
  if (node.approvalMethod === "manualApproval") {
    if (!node.approvalMode) {
      errors.push("请选择审批方式");
    }
    if (!node.approveGroups || node.approveGroups.length === 0) {
      errors.push("请配置审批人");
    } else {
      node.approveGroups.forEach((group: any, index: number) => {
        if (!group.approveType) {
          errors.push(`第${index + 1}组审批人未选择审批人类型`);
        }
        if (
          group.approveType &&
          ["user", "role", "dept", "userGroup"].includes(group.approveType) &&
          (!group.approverIds || group.approverIds.length === 0)
        ) {
          errors.push(`第${index + 1}组审批人未选择具体人员`);
        }
      });
    }
    if (!node.sameMode) {
      errors.push("请选择审批人与发起人相同时的处理方式");
    }
    if (!node.noHander) {
      errors.push("请选择审批人为空时的处理方式");
    }
  }
};

/** 抄送节点校验 */
const validateCopyerNode = (node: any, errors: string[]) => {
  if (!node.name || node.name.trim() === "") {
    errors.push("节点名称不能为空");
  }
  if (!node.approveGroups || node.approveGroups.length === 0) {
    errors.push("请配置抄送人");
  } else {
    const hasValidGroup = node.approveGroups.some(
      (group: any) =>
        group.approveType &&
        (!["user", "role", "dept", "userGroup"].includes(group.approveType) ||
          (group.approverIds && group.approverIds.length > 0)),
    );
    if (!hasValidGroup) {
      errors.push("请选择具体的抄送人");
    }
  }
};

/** 通知节点校验 */
const validateNoticeNode = (node: any, errors: string[]) => {
  if (!node.name || node.name.trim() === "") {
    errors.push("节点名称不能为空");
  }
  if (!node.noticeType || node.noticeType.length === 0) {
    errors.push("请选择通知方式");
  }
  if (!node.approveGroups || node.approveGroups.length === 0) {
    errors.push("请配置通知接收人");
  }
};

/** 服务节点校验 */
const validateServiceNode = (node: any, errors: string[]) => {
  if (!node.name || node.name.trim() === "") {
    errors.push("节点名称不能为空");
  }
  if (!node.executionListeners || node.executionListeners.length === 0) {
    errors.push("请配置任务监听");
  } else {
    const hasValidListener = node.executionListeners.some(
      (listener: any) => listener.implementationType,
    );
    if (!hasValidListener) {
      errors.push("任务监听配置不完整");
    }
  }
};

/** 时间节点校验 */
const validateTimerNode = (node: any, errors: string[]) => {
  if (!node.name || node.name.trim() === "") {
    errors.push("节点名称不能为空");
  }
  if (!node.waitType) {
    errors.push("请选择等待类型");
  }
};

/** 分支节点校验 */
const validateBranchNode = (node: any, errors: string[]) => {
  if (!node.conditionNodes || node.conditionNodes.length < 2) {
    errors.push("分支节点至少需要2个条件分支");
  }
};

/** 意见分支节点校验 */
const validateSuggestNode = (node: any, errors: string[]) => {
  if (!node.conditionNodes || node.conditionNodes.length < 2) {
    errors.push("意见分支至少需要2个分支");
  }
};

/** 并行节点校验 */
const validateParallelNode = (node: any, errors: string[]) => {
  if (!node.conditionNodes || node.conditionNodes.length < 2) {
    errors.push("并行节点至少需要2个并行分支");
  }
};

/** 条件节点校验 */
const validateConditionNode = (node: any, errors: string[]) => {
  if (!node.otherFlag && (!node.name || node.name.trim() === "")) {
    errors.push("条件分支名称不能为空");
  }
  if (
    !node.otherFlag &&
    node.branchType === "rule" &&
    (!node.conditionGroups || node.conditionGroups.length === 0)
  ) {
    errors.push("条件分支请配置条件规则");
  }
};

/** 发起人节点校验 */
const validateApplyNode = (node: any, errors: string[]) => {
  if (!node.name || node.name.trim() === "") {
    errors.push("节点名称不能为空");
  }
};

/** 递归校验整个流程的所有节点 */
export const validateAllNodes = (node: any): NodeValidateResult[] => {
  const results: NodeValidateResult[] = [];
  const traverse = (currentNode: any) => {
    if (!currentNode || !currentNode.type) return;
    const result = validateNode(currentNode);
    if (!result.valid) {
      results.push(result);
    }
    if (currentNode.childNode) {
      traverse(currentNode.childNode);
    }
    if (currentNode.conditionNodes && currentNode.conditionNodes.length > 0) {
      currentNode.conditionNodes.forEach((condition: any) => {
        traverse(condition);
      });
    }
  };
  traverse(node);
  return results;
};

/** 校验基础信息 */
export const validateBasicInfo = (formInfo: any): NodeValidateResult => {
  const errors: string[] = [];
  if (!formInfo.name || formInfo.name.trim() === "") {
    errors.push("流程名称不能为空");
  }
  if (
    !formInfo.flowGroup &&
    (!formInfo.flowGroupList || formInfo.flowGroupList.length === 0)
  ) {
    errors.push("请选择流程分类");
  }
  return {
    valid: errors.length === 0,
    nodeId: "basicInfo",
    nodeName: "基础信息",
    nodeType: "basicInfo",
    errors,
  };
};

/** 将校验结果标记到节点上（用于 UI 显示） */
export const markNodeErrors = (node: any, results: NodeValidateResult[]) => {
  const errorMap = new Map(results.map((r) => [r.nodeId, r]));
  const mark = (currentNode: any) => {
    if (!currentNode || !currentNode.type) return;
    const result = errorMap.get(currentNode.id);
    if (result) {
      currentNode.error = true;
      currentNode.errorMsg = result.errors.join("；");
    } else {
      currentNode.error = false;
      currentNode.errorMsg = "";
    }
    if (currentNode.childNode) {
      mark(currentNode.childNode);
    }
    if (currentNode.conditionNodes && currentNode.conditionNodes.length > 0) {
      currentNode.conditionNodes.forEach((condition: any) => {
        mark(condition);
      });
    }
  };
  mark(node);
};