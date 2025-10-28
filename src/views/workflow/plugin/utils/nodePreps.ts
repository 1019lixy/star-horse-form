import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums";
import { uuid } from "star-horse-lowcode";

export interface NodeInfo {
  // 节点名称
  nodeName: string;
  // 节点编码
  nodeCode: string;
  // 节点图标
  nodeIcon: string;
}

const nodeInfoList = (): NodeInfo[] => {
  return [
    {
      nodeName: "审批节点",
      nodeCode: "ApprovalNode",
      nodeIcon: "audit_node",
    },
    {
      nodeName: "办理节点",
      nodeCode: "HandleNode",
      nodeIcon: "handle_node",
    },
    {
      nodeName: "条件节点",
      nodeCode: "BranchNode",
      nodeIcon: "branch_node",
    },
    {
      nodeName: "并行分支",
      nodeCode: "ParallelNode",
      nodeIcon: "parallel_node",
    },

    {
      nodeName: "服务节点",
      nodeCode: "ServiceNode",
      nodeIcon: "task",
    },
    /*认知里还没有对事件节点有进一步认识*/
    /*   {
                       "nodeName": "事件节点",
                       "nodeCode": "EventNode",
                       "nodeIcon": "event_node",
                   },*/
    {
      nodeName: "抄送节点",
      nodeCode: "CopyerNode",
      nodeIcon: "copy_node",
    },
    {
      nodeName: "时间节点",
      nodeCode: "TimerNode",
      nodeIcon: "timer",
    },
    {
      nodeName: "意见分支",
      nodeCode: "SuggestNode",
      nodeIcon: "text",
    },

    {
      nodeName: "通知节点",
      nodeCode: "NoticeNode",
      nodeIcon: "copy_node",
    },
  ];
};

/**
 * 开始节点
 */
const startNode = () => {
  return {
    id: uuid(),
    name: "发起人",
    type: FlowNodeEnums.APPLY_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    // 是否有错误
    error: false,
    //错误提示
    errorMsg: "",
    // 表单ID
    formId: "",
    //表单类型
    formType: "",
    //表单默认可编辑
    privilege: "edit",
    // 子节点
    childNode: endNode(),
    // 显示添加按钮
    addable: true,
  };
};
/**
 * 结束节点
 */
const endNode = () => {
  return {
    id: uuid(),
    name: "结束",
    type: FlowNodeEnums.END_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    //错误提示
    errorMsg: "",
    // 是否有错误
    error: false,
  };
};
/**
 * 添加审批节点 ||
 */
const approverNodePreps = (type: string) => {
  return {
    id: uuid(),
    name: type == "approve" ? "审批人" : "办理人",
    subType: type,
    type:
      type == "approve"
        ? FlowNodeEnums.APPROVER_NODE
        : FlowNodeEnums.HANDLE_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    //错误提示
    errorMsg: "",
    // 流程基础配置属性
    approvalMethod: "assign",
    // 审批方式
    approvalMode: "sequential",
    // 审批模式
    multiPercent: 100,
    // 审批人与发起人为同一人时
    sameMode: "B",
    // 审批人为空时
    noHander: "A",
    // 审批设置
    approveGroups: [
      {
        id: uuid(),
        // 审批人模式
        approveType: null,
        // 层级模式
        levelMode: 1,
        // 审批人ID
        approverIds: [],
        // 审批人名称
        approverNames: [],
      },
    ],
    //无审批人
    nobodyUsers: [],
    // 表单权限
    privilege: "edit",
    // 高级配置
    operations: {},
    // 子节点
    childNode: null,
    // 显示添加按钮
    addable: true,
    // 可删除提示
    deletable: false,
    // 是否有错误
    error: false,
    // 显示内容
    content: null,
  };
};
/**
 * 添加抄送节点
 */
const copyerNodePreps = () => {
  return {
    id: uuid(),
    name: "抄送人",
    type: FlowNodeEnums.COPYER_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    //错误提示
    errorMsg: "",
    // 子节点
    childNode: null,
    //密送人
    secretApproveGroups: [],
    // 抄送人设置
    approveGroups: [
      {
        id: uuid(),
        // 审批人模式
        approveType: null,
        // 层级模式
        levelMode: 1,
        // 审批人ID
        approverIds: [],
        // 审批人名称
        approverNames: [],
      },
    ],
    // 表单权限
    privilege: "readonly",
    // 高级配置
    operations: {},
    // 显示添加按钮
    addable: true,
    // 可删除提示
    deletable: false,
    // 是否有错误
    error: false,
    // 显示内容
    content: null,
  };
};
/**
 * 添加通知节点
 */
const noticeNodePreps = () => {
  return {
    id: uuid(),
    name: "通知",
    type: FlowNodeEnums.NOTICE_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    //错误提示
    errorMsg: "",
    // 子节点
    childNode: null,
    //通知方式
    noticeType: [],
    //密送人
    secretApproveGroups: [],
    // 审批设置
    approveGroups: [
      {
        id: uuid(),
        // 审批人模式
        approveType: null,
        // 层级模式
        levelMode: 1,
        // 审批人ID
        approverIds: [],
        // 审批人名称
        approverNames: [],
      },
    ],
    // 表单权限
    privilege: "readonly",
    // 显示添加按钮
    addable: true,
    // 可删除提示
    deletable: false,
    // 是否有错误
    error: false,
  };
};
/**
 * 添加任务节点
 */
const serviceNodePreps = () => {
  return {
    id: uuid(),
    name: "服务节点",
    type: FlowNodeEnums.SERVICE_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    executionListeners: [
      {
        event: "start",
        implementationType: "class",
      },
    ],
    // 服务节点参数
    params:{},
    // 子节点
    childNode: null,
    // 显示添加按钮
    addable: true,
    // 可删除提示
    deletable: false,
    //错误提示
    errorMsg: "",
    // 是否有错误
    error: false,
  };
};

/**
 * 时间节点
 */
const timerNodePreps = () => {
  return {
    id: uuid(),
    name: "计时等待",
    type: FlowNodeEnums.TIMER_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    waitType: "duration",
    //等待时间单位
    unit: "PT%sS",
    // 子节点
    childNode: null,
    // 审批设置
    // 显示添加按钮
    addable: true,
    //错误提示
    errorMsg: "",
    // 可删除提示
    deletable: false,
    // 是否有错误
    error: false,
  };
};
/**
 * 添加事件节点
 */
const eventNodePreps = () => {
  return {
    id: uuid(),
    name: "事件",
    type: FlowNodeEnums.EVENT_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    // 子节点
    childNode: null,
    // 显示添加按钮
    addable: true,
    // 可删除提示
    deletable: false,
    //错误提示
    errorMsg: "",
    // 是否有错误
    error: false,
  };
};
/**
 * 添加分支节点
 */
const branchNodePreps = () => {
  const uid = uuid();
  return {
    id: uid,
    name: "路由",
    type: FlowNodeEnums.BRANCH_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    //错误提示
    errorMsg: "",
    // 子节点
    childNode: null,
    // 显示添加按钮
    addable: true,
    // 条件节点
    conditionNodes: [
      {
        id: uuid(),
        pid: uid,
        name: "分支1",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        statusCode: -1,
        // 是否有错误
        error: false,
        otherFlag: false,
        //错误提示
        errorMsg: "",
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 条件组
        conditionGroups: [],
        // 流程基础配置属性
        // 分支类型
        branchType: "rule",
        // 优先级
        priorityLevel: 1,
        // 显示优先级
        showPriorityLevel: true,
      },
      {
        id: uuid(),
        pid: uid,
        name: "其他情况",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        statusCode: -1,
        otherFlag: true,
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 条件组
        conditionGroups: [],
        // 分支类型
        branchType: "rule",
        // 优先级
        priorityLevel: 2,
        // 显示优先级
        showPriorityLevel: true,
        // 是否有错误
        error: false,
        //错误提示
        errorMsg: "",
        // 显示内容
        content: "其他情况进入此流程",
      },
    ],
  };
};
/**
 * 添加意见分支节点
 */
const suggestNodePreps = () => {
  const uid = uuid();
  return {
    id: uid,
    name: "意见",
    type: FlowNodeEnums.SUGGEST_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    // 子节点
    childNode: null,
    // 显示添加按钮
    addable: true,
    //错误提示
    errorMsg: "",
    // 是否有错误
    error: false,
    conditionNodes: [
      {
        id: uuid(),
        pid: uid,
        name: "同意",
        type: FlowNodeEnums.SUGGEST_SUB_NODE,
        // 流程基础配置属性
        attr: {
          // 优先级
          priorityLevel: 2,
        },
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        statusCode: -1,
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        //错误提示
        errorMsg: "",
        // 可删除提示
        deletable: false,
        // 是否有错误
        error: false,
      },
      {
        id: uuid(),
        pid: uid,
        name: "不同意",
        type: FlowNodeEnums.SUGGEST_SUB_NODE,
        // 流程基础配置属性
        attr: {
          // 优先级
          priorityLevel: 2,
        },
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        statusCode: -1,
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        //错误提示
        errorMsg: "",
        // 是否有错误
        error: false,
      },
    ],
  };
};
/**
 * 添加并行节点
 */
const parallelNodePreps = () => {
  const uid = uuid();
  return {
    id: uid,
    name: "并行",
    type: FlowNodeEnums.PARALLEL_NODE,
    // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
    statusCode: -1,
    // 显示添加按钮
    addable: true,
    //错误提示
    errorMsg: "",
    // 聚合节点
    childNode: null,
    //每个分支的第一个节点
    outLines: {},
    //每个分支的最后一个节点
    inLines: {},
    conditionNodes: [
      {
        id: uuid(),
        pid: uid,
        name: "并行1",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        statusCode: -1,
        // 是否有错误
        error: false,
        //错误提示
        errorMsg: "",
        // 显示内容
        content: "任意(其他)",
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 流程基础配置属性
        branchType: "other",
        // 条件组
        conditionGroups: [],
      },
      {
        id: uuid(),
        pid: uid,
        name: "并行2",
        type: FlowNodeEnums.BRANCH_CONDITION_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        statusCode: -1,
        // 是否有错误
        error: false,
        //错误提示
        errorMsg: "",
        // 显示内容
        content: "任意(其他)",
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 流程基础配置属性
        // 分支类型
        branchType: "other",
        // 条件组
        conditionGroups: [],
      },
    ],
  };
};
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
  [FlowNodeEnums.APPLY_NODE]: startNode,
  [FlowNodeEnums.END_NODE]: endNode,
};
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
