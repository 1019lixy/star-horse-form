/**
 * 流程节点类型枚举。
 *
 * 该枚举从 shdevopsui 流程设计器移植而来，作为流程节点树的类型标识，
 * 贯穿节点工厂、节点树操作、节点校验与流程设计 Store。
 *
 * 设计说明：
 * - 枚举值与后端流程引擎保持一致，禁止随意修改字符串值。
 * - `BRANCH_CONDITION_NODE` 与 `PARALLEL_SUB_NODE` 在源项目中复用了同一字符串值
 *   "ConditionNode"，这里保留原样以兼容历史数据，但语义上分别表示分支条件节点与并行子节点。
 */
export enum FlowNodeEnums {
  /** 开始节点 */
  START_NODE = "StartNode",
  /** 发起人节点 */
  APPLY_NODE = "ApplyNode",
  /** 抄送节点 */
  COPYER_NODE = "CopyerNode",
  /** 审批节点 */
  APPROVER_NODE = "ApprovalNode",
  /** 分支节点（路由） */
  BRANCH_NODE = "BranchNode",
  /** 排他节点 */
  EXCLUSIVE_NODE = "ExclusiveNode",
  /** 并行节点 */
  PARALLEL_NODE = "ParallelNode",
  /** 定时节点 */
  TIMER_NODE = "TimerNode",
  /** 提醒节点 */
  NOTICE_NODE = "NoticeNode",
  /** 服务节点 */
  SERVICE_NODE = "ServiceNode",
  /** 事件节点 */
  EVENT_NODE = "EventNode",
  /** 结束节点 */
  END_NODE = "EndNode",
  /** 分支条件节点 */
  BRANCH_CONDITION_NODE = "ConditionNode",
  /** 分割节点 */
  DIVIDE_NODE = "DivideNode",
  /** 并行子节点（复用 ConditionNode 字符串以兼容历史数据） */
  PARALLEL_SUB_NODE = "ConditionNode",
  /** 聚合节点 */
  POLYMERIZE_NODE = "PolymerizeNode",
  /** 意见节点 */
  SUGGEST_NODE = "SuggestNode",
  /** 意见子节点 */
  SUGGEST_SUB_NODE = "SuggestSubNode",
  /** 任务节点 */
  TASK_NODE = "TaskNode",
  /** 办理节点 */
  HANDLE_NODE = "HandleNode",
}