/**
 * 流程节点默认配置工厂。
 *
 * 从 shdevopsui 移植：为每种节点类型生成初始配置对象。所有节点共享基础属性
 *（id/name/type/statusCode/nodeKey/dataIndex/error 等），各节点类型再叠加自身业务属性。
 *
 * 设计说明：
 * - `nodePrepList` 为统一入口，按节点类型查表生成，避免外部 switch-case。
 * - `nodeInfoList` 提供节点元数据（名称/编码/图标），供节点添加面板渲染。
 */
import { FlowNodeEnums } from "@/components/workflow/enums/FlowNodeEnums";
import { uuid } from "star-horse-lowcode";

/** 节点元信息（用于添加节点面板） */
export interface NodeInfo {
  nodeName: string;
  nodeCode: string;
  nodeIcon: string;
}

/** 全局 nodeKey 计数器，保证节点 key 单调递增 */
let nodeKeyCounter = 0;

/** 生成唯一 nodeKey */
const generateNodeKey = (baseKey: string): string => {
  nodeKeyCounter++;
  return `${baseKey}_${nodeKeyCounter}`;
};

/** 提取公共节点基础属性 */
const createBaseNode = (
  id: string,
  name: string,
  type: FlowNodeEnums,
  nodeKeyBase: string,
) => {
  return {
    id,
    name,
    type,
    /** 流程节点状态（只读模式：0 未进行 / 1 进行中 / 2 已完成） */
    statusCode: -1,
    /** 节点 Key（每次调用自动 +1） */
    nodeKey: generateNodeKey(nodeKeyBase),
    /** 节点排序 */
    dataIndex: nodeKeyCounter,
    error: false,
    errorMsg: "",
    addable: true,
    deletable: false,
  };
};

/** 节点元信息列表（供添加节点面板使用） */
const nodeInfoList = (): NodeInfo[] => {
  return [
    { nodeName: "审批节点", nodeCode: "ApprovalNode", nodeIcon: "audit_node" },
    { nodeName: "办理节点", nodeCode: "HandleNode", nodeIcon: "handle_node" },
    { nodeName: "条件节点", nodeCode: "BranchNode", nodeIcon: "branch_node" },
    { nodeName: "并行分支", nodeCode: "ParallelNode", nodeIcon: "parallel_node" },
    { nodeName: "服务节点", nodeCode: "ServiceNode", nodeIcon: "task" },
    { nodeName: "抄送节点", nodeCode: "CopyerNode", nodeIcon: "copy_node" },
    { nodeName: "时间节点", nodeCode: "TimerNode", nodeIcon: "timer" },
    { nodeName: "意见分支", nodeCode: "SuggestNode", nodeIcon: "text" },
    { nodeName: "通知节点", nodeCode: "NoticeNode", nodeIcon: "copy_node" },
  ];
};

/** 开始节点 */
const startNode = () => {
  const id = uuid();
  return {
    ...createBaseNode(id, "开始", FlowNodeEnums.START_NODE, "start"),
    childNode: applyNode(id),
  };
};

/** 发起人节点 */
const applyNode = (pid?: string) => {
  return {
    ...createBaseNode(uuid(), "发起人", FlowNodeEnums.APPLY_NODE, "apply"),
    pid: pid,
    formId: "",
    formType: "",
    privilege: "edit",
    childNode: endNode(),
  };
};

/** 结束节点 */
const endNode = () => {
  return {
    ...createBaseNode(uuid(), "结束", FlowNodeEnums.END_NODE, "end"),
  };
};

/** 审批/办理节点 */
const approverNodePreps = (type: string) => {
  return {
    ...createBaseNode(
      uuid(),
      type == "approve" ? "审批人" : "办理人",
      type == "approve" ? FlowNodeEnums.APPROVER_NODE : FlowNodeEnums.HANDLE_NODE,
      type == "approve" ? "approvalNode" : "handleNode",
    ),
    subType: type,
    approvalMethod: "manualApproval",
    approvalMode: "sequential",
    multiPercent: 100,
    sameMode: "B",
    noHander: "A",
    approveGroups: [
      {
        id: uuid(),
        approveType: "directLeader",
        levelMode: 1,
        approverIds: [],
        approverNames: [],
      },
    ],
    nobodyUses: [],
    privilege: "edit",
    operations: {
      complete: true,
      turn: true,
      cc: true,
      back: true,
      revoke: false,
      addSign: false,
      subSign: false,
      trace: false,
      rejected: true,
      delegate: false,
      allowUrge: true,
      timeoutType: "1",
      timeout: false,
      timeoutValue: -1,
      sign: false,
      password: false,
    },
    childNode: null,
    content: null,
  };
};

/** 抄送节点 */
const copyerNodePreps = () => {
  return {
    ...createBaseNode(uuid(), "抄送人", FlowNodeEnums.COPYER_NODE, "copyer"),
    childNode: null,
    secretApproveGroups: [],
    approveGroups: [
      {
        id: uuid(),
        approveType: null,
        levelMode: 1,
        approverIds: [],
        approverNames: [],
      },
    ],
    privilege: "readonly",
    operations: {},
    content: null,
  };
};

/** 通知节点 */
const noticeNodePreps = () => {
  return {
    ...createBaseNode(uuid(), "通知", FlowNodeEnums.NOTICE_NODE, "notice"),
    childNode: null,
    noticeType: [],
    secretApproveGroups: [],
    approveGroups: [
      {
        id: uuid(),
        approveType: null,
        levelMode: 1,
        approverIds: [],
        approverNames: [],
      },
    ],
    privilege: "readonly",
  };
};

/** 服务节点 */
const serviceNodePreps = () => {
  return {
    ...createBaseNode(uuid(), "服务节点", FlowNodeEnums.SERVICE_NODE, "service"),
    executionListeners: [
      { event: "start", implementationType: "class" },
    ],
    operations: {},
    childNode: null,
  };
};

/** 时间节点 */
const timerNodePreps = () => {
  return {
    ...createBaseNode(uuid(), "计时等待", FlowNodeEnums.TIMER_NODE, "timer"),
    waitType: "duration",
    unit: "PT%sS",
    childNode: null,
  };
};

/** 事件节点 */
const eventNodePreps = () => {
  return {
    ...createBaseNode(uuid(), "事件", FlowNodeEnums.EVENT_NODE, "event"),
    childNode: null,
  };
};

/** 分支节点（路由） */
const branchNodePreps = () => {
  const uid = uuid();
  return {
    ...createBaseNode(uid, "路由", FlowNodeEnums.BRANCH_NODE, "branch"),
    childNode: null,
    conditionNodes: [
      {
        id: uuid(),
        pid: uid,
        name: "分支 1",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        nodeKey: generateNodeKey("branch_node"),
        error: false,
        otherFlag: false,
        errorMsg: "",
        childNode: null,
        addable: true,
        deletable: false,
        conditionGroups: [],
        branchType: "rule",
        priorityLevel: 1,
        showPriorityLevel: true,
      },
      {
        id: uuid(),
        pid: uid,
        name: "其他情况",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        otherFlag: true,
        nodeKey: generateNodeKey("branch_node"),
        childNode: null,
        addable: true,
        deletable: false,
        conditionGroups: [],
        branchType: "rule",
        priorityLevel: 2,
        showPriorityLevel: true,
        error: false,
        errorMsg: "",
        content: "其他情况进入此流程",
      },
    ],
  };
};

/** 意见分支节点 */
const suggestNodePreps = () => {
  const uid = uuid();
  return {
    ...createBaseNode(uid, "意见", FlowNodeEnums.SUGGEST_NODE, "suggest"),
    childNode: null,
    conditionNodes: [
      {
        id: uuid(),
        pid: uid,
        name: "同意",
        type: FlowNodeEnums.SUGGEST_SUB_NODE,
        attr: { priorityLevel: 2 },
        nodeKey: generateNodeKey("suggest_node"),
        childNode: null,
        addable: true,
        errorMsg: "",
        deletable: false,
        error: false,
      },
      {
        id: uuid(),
        pid: uid,
        name: "不同意",
        type: FlowNodeEnums.SUGGEST_SUB_NODE,
        attr: { priorityLevel: 2 },
        nodeKey: generateNodeKey("suggest_node"),
        childNode: null,
        addable: true,
        deletable: false,
        errorMsg: "",
        error: false,
      },
    ],
  };
};

/** 并行节点 */
const parallelNodePreps = () => {
  const uid = uuid();
  return {
    ...createBaseNode(uid, "并行", FlowNodeEnums.PARALLEL_NODE, "parallel"),
    childNode: null,
    outLines: {},
    inLines: {},
    conditionNodes: [
      {
        id: uuid(),
        pid: uid,
        name: "并行 1",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        nodeKey: generateNodeKey("parallel_node"),
        error: false,
        errorMsg: "",
        content: "任意 (其他)",
        childNode: null,
        addable: true,
        deletable: false,
        branchType: "other",
        conditionGroups: [],
      },
      {
        id: uuid(),
        pid: uid,
        name: "并行 2",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        nodeKey: generateNodeKey("parallel_node"),
        error: false,
        errorMsg: "",
        content: "任意 (其他)",
        childNode: null,
        addable: true,
        deletable: false,
        branchType: "other",
        conditionGroups: [],
      },
    ],
  };
};

/** 节点工厂表 */
const nodePreps: any = {
  [FlowNodeEnums.HANDLE_NODE]: approverNodePreps,
  [FlowNodeEnums.APPROVER_NODE]: approverNodePreps,
  [FlowNodeEnums.PARALLEL_NODE]: parallelNodePreps,
  [FlowNodeEnums.SUGGEST_NODE]: suggestNodePreps,
  [FlowNodeEnums.BRANCH_NODE]: branchNodePreps,
  [FlowNodeEnums.EVENT_NODE]: eventNodePreps,
  [FlowNodeEnums.NOTICE_NODE]: noticeNodePreps,
  [FlowNodeEnums.COPYER_NODE]: copyerNodePreps,
  [FlowNodeEnums.SERVICE_NODE]: serviceNodePreps,
  [FlowNodeEnums.TIMER_NODE]: timerNodePreps,
  [FlowNodeEnums.APPLY_NODE]: applyNode,
  [FlowNodeEnums.END_NODE]: endNode,
  [FlowNodeEnums.START_NODE]: startNode,
};

/**
 * 按节点类型生成默认配置。
 * @param node 节点类型枚举
 */
const nodePrepList = (node: FlowNodeEnums) => {
  let param = "";
  if (node == FlowNodeEnums.HANDLE_NODE) {
    param = "handle";
  } else if (node == FlowNodeEnums.APPROVER_NODE) {
    param = "approve";
  }
  return nodePreps[node](param);
};

export { nodePrepList, nodeInfoList };