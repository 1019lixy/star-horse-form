/**
 * 流程节点
 */
export enum FlowNodeEnums {
    /**
     * 开始节点
     */
    START_NODE = "StartNode",
    /**
     * 发起人节点
     */
    APPLY_NODE = "StartNode",
    /**
     * 抄送节点
     */
    COPYER_NODE = "CopyerNode",
    /**
     * 审批节点
     */
    APPROVER_NODE = "ApprovalNode",
    /**
     * 分支节点
     */
    BRANCH_NODE = "BranchNode",
    /**
     * 排他节点
     */
    EXCLUSIVE_NODE = "ExclusiveNode",
    /**
     * 并行节点
     */
    PARALLEL_NODE = "ParallelNode",
    /**
     * 定时节点
     */
    TIMER_NODE = "TimerNode",
    /**
     * 提醒节点
     */
    NOTICE_NODE = "NoticeNode",
    /**
     * 服务节点
     */
    SERVICE_NODE = "ServiceNode",
    /**
     * 事件节点
     */
    EVENT_NODE = "EventNode",

    /**
     * 结束节点
     */
    END_NODE = "EndNode",
    /**
     * 分支条件节点
     */
    BRANCH_CONDITION_NODE = "ConditionNode",

    /**
     * 分割
     */
    DIVIDE_NODE = "DivideNode",


    /**
     * 并行子节点
     */
    PARALLEL_SUB_NODE = "ParallelSubNode",
    /**
     *聚合节点
     */
    POLYMERIZE_NODE = "PolymerizeNode",
    /**
     * 意见节点
     */
    SUGGEST_NODE = "SuggestNode",
    /**
     * 意见子节点
     */
    SUGGEST_SUB_NODE = "SuggestSubNode",
    /**
     * 任务节点
     */
    TASK_NODE = "TaskNode",

    /**
     * 编辑节点
     */
    WRITE_NODE = "WriteNode",
}
