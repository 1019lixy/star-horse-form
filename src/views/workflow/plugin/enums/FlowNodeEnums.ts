/**
 * 流程节点
 */
export enum FlowNodeEnums {
    /**
     * 发起人节点
     */
    APPLY_NODE = "ApplyNode",
    /**
     * 审批节点
     */
    APPROVER_NODE = "ApproverNode",
    /**
     * 分支节点
     */
    BRANCH_NODE = "BranchNode",
    /**
     * 分支条件节点
     */
    BRANCH_CONDITION_NODE = "BranchConditionNode",
    /**
     * 抄送节点
     */
    COPYER_NODE = "CopyerNode",
    /**
     * 分割
     */
    DIVIDE_NODE = "DivideNode",
    /**
     * 开始节点
     */
    START_NODE = "StartNode",
    /**
     * 结束节点
     */
    END_NODE = "EndNode",
    /**
     * 事件节点
     */
    EVENT_NODE = "EventNode",
    /**
     * 提醒节点
     */
    NOTICE_NODE = "NoticeNode",
    /**
     * 并行节点
     */
    PARALLEL_NODE = "ParallelNode",
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
