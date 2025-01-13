import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {uuid} from "@/api/system.ts";

const nodeInfoList = () => {
    return [
        {
            "nodeName": "分支节点",
            "nodeCode": "BranchNode",
            "nodeIcon": "branch_node",
        },
        {
            "nodeName": "意见分支",
            "nodeCode": "SuggestNode",
            "nodeIcon": "text",
        },
        {
            "nodeName": "并行分支",
            "nodeCode": "ParallelNode",
            "nodeIcon": "parallel_node",
        },
        {
            "nodeName": "抄送节点",
            "nodeCode": "CopyerNode",
            "nodeIcon": "copy_node",
        },
        {
            "nodeName": "服务节点",
            "nodeCode": "ServiceNode",
            "nodeIcon": "task",
        },
        {
            "nodeName": "时间节点",
            "nodeCode": "TimerNode",
            "nodeIcon": "timer",
        },
        {
            "nodeName": "事件节点",
            "nodeCode": "EventNode",
            "nodeIcon": "event_node",
        },
        {
            "nodeName": "通知节点",
            "nodeCode": "NoticeNode",
            "nodeIcon": "copy_node",
        },
        {
            "nodeName": "审批节点",
            "nodeCode": "ApprovalNode",
            "nodeIcon": "audit_node",
        },
        {
            "nodeName": "办理节点",
            "nodeCode": "ApprovalNode",
            "nodeIcon": "handle_node",
        }
    ];
}

/**
 * 开始节点
 */
const startNode = () => {
    return {
        id: uuid(),
        name: '发起人',
        type: FlowNodeEnums.WRITE_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 是否有错误
        error: false,
        // 子节点
        childNode: endNode(),
        // 显示添加按钮
        addable: true,
    };
}
/**
 * 结束节点
 */
const endNode = () => {
    return {
        id: uuid(),
        name: '结束',
        type: FlowNodeEnums.END_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 是否有错误
        error: false,
    }
}
/**
 * 添加审批节点 ||
 */
const approverNodePreps = (type: String) => {
    return {
        id: uuid(),
        name: type == "approve" ? '审批人' : '办理人',
        subType: type,
        type: type == "approve" ? FlowNodeEnums.APPROVER_NODE : FlowNodeEnums.APPLY_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 流程基础配置属性
        attr: {
            // 审批类型
            approvalMethod: 1,
            // 审批方式
            approvalMode: 1,
            // 审批人与发起人为同一人时
            sameMode: 2,
            // 审批人为空时
            noHander: 4,
        },
        // 审批设置
        approveGroups: [
            {
                id: uuid(),
                // 审批人模式
                approveType: 1,
                // 层级模式
                levelMode: 1,
                // 审批人ID
                approverIds: [],
                // 审批人名称
                approverNames: [],
            },
        ],
        // 表单权限
        privileges: [],
        // 高级配置
        configure: {},
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
}
/**
 * 添加抄送节点
 */
const copyerNodePreps = () => {
    return {
        id: uuid(),
        name: '抄送人',
        type: FlowNodeEnums.COPYER_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 子节点
        childNode: null,
        // 抄送人设置
        approveGroups: [
            {
                id: uuid(),
                // 审批人模式
                approveType: 1,
                // 层级模式
                levelMode: 1,
                // 审批人ID
                approverIds: [],
                // 审批人名称
                approverNames: [],
            },
        ],
        // 表单权限
        privileges: [],
        // 高级配置
        configure: {},
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 是否有错误
        error: false,
        // 显示内容
        content: null,
    };
}
/**
 * 添加通知节点
 */
const noticeNodePreps = () => {
    return {
        id: uuid(),
        name: '通知',
        type: FlowNodeEnums.NOTICE_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 子节点
        childNode: null,
        // 审批设置
        approveGroups: [
            {
                id: uuid(),
                // 审批人模式
                approveType: 1,
                // 层级模式
                levelMode: 1,
                // 审批人ID
                approverIds: [],
                // 审批人名称
                approverNames: [],
            },
        ],
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 是否有错误
        error: false,
    };
}
/**
 * 添加任务节点
 */
const serviceNodePreps = () => {
    return {
        id: uuid(),
        name: '服务节点',
        type: FlowNodeEnums.SERVICE_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        implementationType: "class",
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 是否有错误
        error: false,
    };
}

/**
 * 时间节点
 */
const timerNodePreps = () => {
    return {
        id: uuid(),
        name: '计时等待',
        type: FlowNodeEnums.TIMER_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        waitType: "duration",
        // 子节点
        childNode: null,
        // 审批设置
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 是否有错误
        error: false,
    };
}
/**
 * 添加事件节点
 */
const eventNodePreps = () => {
    return {
        id: uuid(),
        name: '事件',
        type: FlowNodeEnums.EVENT_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 可删除提示
        deletable: false,
        // 是否有错误
        error: false,
    };
}
/**
 * 添加分支节点
 */
const branchNodePreps = () => {
    const uid = uuid();
    return {
        id: uid,
        name: '路由',
        type: FlowNodeEnums.BRANCH_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 条件节点
        conditionNodes: [
            {
                id: uuid(),
                pid: uid,
                name: '分支1',
                type: FlowNodeEnums.BRANCH_CONDITION_NODE,
                // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
                status: -1,
                // 是否有错误
                error: false,
                // 子节点
                childNode: null,
                // 显示添加按钮
                addable: true,
                // 可删除提示
                deletable: false,
                // 条件组
                conditionGroup: [],
                // 流程基础配置属性
                attr: {
                    // 分支类型
                    branchType: "rule",
                    // 优先级
                    priorityLevel: 1,
                    // 显示优先级
                    showPriorityLevel: true,
                },
            },
            {
                id: uuid(),
                pid: uid,
                name: '其他情况',
                type: FlowNodeEnums.BRANCH_CONDITION_NODE,
                // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
                status: -1,
                // 子节点
                childNode: null,
                // 显示添加按钮
                addable: true,
                // 可删除提示
                deletable: false,
                // 条件组
                conditionGroup: [],
                // 流程基础配置属性
                attr: {
                    // 分支类型
                    branchType: "rule",
                    // 优先级
                    priorityLevel: 2,
                    // 显示优先级
                    showPriorityLevel: true,
                },
                // 是否有错误
                error: false,
                // 显示内容
                content: '其他情况进入此流程',
            },
        ],
    };
}
/**
 * 添加意见分支节点
 */
const suggestNodePreps = () => {
    const uid = uuid();
    return {
        id: uid,
        name: '意见',
        type: FlowNodeEnums.SUGGEST_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 子节点
        childNode: null,
        // 显示添加按钮
        addable: true,
        // 是否有错误
        error: false,
        conditionNodes: [
            {
                id: uuid(),
                pid: uid,
                name: '同意',
                type: FlowNodeEnums.SUGGEST_SUB_NODE,
                // 流程基础配置属性
                attr: {
                    // 优先级
                    priorityLevel: 2,
                },
                // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
                status: -1,
                // 子节点
                childNode: null,
                // 显示添加按钮
                addable: true,
                // 可删除提示
                deletable: false,
                // 是否有错误
                error: false,
            },
            {
                id: uuid(),
                pid: uid,
                name: '不同意',
                type: FlowNodeEnums.SUGGEST_SUB_NODE,
                // 流程基础配置属性
                attr: {
                    // 优先级
                    priorityLevel: 2,
                },
                // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
                status: -1,
                // 子节点
                childNode: null,
                // 显示添加按钮
                addable: true,
                // 可删除提示
                deletable: false,
                // 是否有错误
                error: false,
            },
        ],
    };
}
/**
 * 添加并行节点
 */
const parallelNodePreps = () => {
    const uid = uuid();
    return {
        id: uid,
        name: '并行',
        type: FlowNodeEnums.PARALLEL_NODE,
        // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
        status: -1,
        // 显示添加按钮
        addable: true,
        // 聚合节点
        childNode: {
            id: uuid(),
            pid: uid,
            name: '聚合',
            type: FlowNodeEnums.POLYMERIZE_NODE,
            status: -1,
            childNode: null,
            // 显示添加按钮
            addable: true,
            // 可删除提示
            deletable: false,
        },
        conditionNodes: [
            {
                id: uuid(),
                pid: uid,
                name: '并行1',
                type: FlowNodeEnums.PARALLEL_SUB_NODE,
                // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
                status: -1,
                // 是否有错误
                error: false,
                // 显示内容
                content: '任意(其他)',
                // 子节点
                childNode: null,
                // 显示添加按钮
                addable: true,
                // 可删除提示
                deletable: false,
                // 流程基础配置属性
                attr: {
                    // 分支类型
                    branchType: "other",
                },
                // 条件组
                conditionGroup: [],
            },
            {
                id: uuid(),
                pid: uid,
                name: '并行2',
                type: FlowNodeEnums.PARALLEL_SUB_NODE,
                // 流程节点状态(用于只读模式, 0:未进行 1:进行中  2:已完成)
                status: -1,
                // 是否有错误
                error: false,
                // 显示内容
                content: '任意(其他)',
                // 子节点
                childNode: null,
                // 显示添加按钮
                addable: true,
                // 可删除提示
                deletable: false,
                // 流程基础配置属性
                attr: {
                    // 分支类型
                    branchType: "other",
                },
                // 条件组
                conditionGroup: [],
            },
        ],
    };
}
const nodePrepList: any = {
    [FlowNodeEnums.APPLY_NODE]: approverNodePreps("apply"),
    [FlowNodeEnums.APPROVER_NODE]: approverNodePreps("approve"),
    [FlowNodeEnums.PARALLEL_NODE]: parallelNodePreps(),
    [FlowNodeEnums.SUGGEST_NODE]: suggestNodePreps(),
    [FlowNodeEnums.BRANCH_NODE]: branchNodePreps(),
    [FlowNodeEnums.EVENT_NODE]: eventNodePreps(),
    [FlowNodeEnums.NOTICE_NODE]: noticeNodePreps(),
    [FlowNodeEnums.COPYER_NODE]: copyerNodePreps(),
    [FlowNodeEnums.SERVICE_NODE]: serviceNodePreps(),
    [FlowNodeEnums.TIMER_NODE]: timerNodePreps(),
    [FlowNodeEnums.WRITE_NODE]: startNode(),
    [FlowNodeEnums.END_NODE]: endNode(),
}
export {
    nodePrepList, nodeInfoList
}
