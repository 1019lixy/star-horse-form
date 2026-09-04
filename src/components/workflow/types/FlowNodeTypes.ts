/**
 * 流程节点字段绑定类型定义。
 *
 * 该类型体系支撑"一个节点可绑定多个字段、每个字段可承担不同用途"的配置模型，
 * 替代旧版"字段→流程变量"的单一映射。例如一个多人协作审批节点可同时绑定：
 * 审批人来源字段、抄送人来源字段、条件判断字段等。
 *
 * 设计原则（可插拔）：
 * - `FieldBindingUsage` 用字符串联合类型描述内置用途，同时允许外部通过
 *   `registerFieldBindingUsage` 扩展自定义用途，避免在面板里堆砌 case-when 分支。
 * - 每个绑定项独立描述"取哪个字段、作什么用途、如何取值"，节点配置面板只负责
 *   渲染与收集，具体业务语义由消费方（流程引擎/后端）解释。
 */

/** 内置字段绑定用途 */
export type FieldBindingUsage =
  | "param" /** 作为流程参数传递 */
  | "assignee" /** 作为审批人/办理人来源 */
  | "cc" /** 作为抄送人来源 */
  | "notice" /** 作为通知接收人来源 */
  | "condition" /** 作为分支条件字段 */
  | "title" /** 作为流程标题来源 */
  | "urgency" /** 作为催办优先级来源 */;

/** 字段取值方式 */
export type FieldValueMode =
  | "direct" /** 直接取字段值 */
  | "ref" /** 取字段值引用（人员/部门 id） */
  | "expression" /** 取表达式计算结果 */
  | "constant" /** 使用常量值 */;

/** 单个字段绑定项 */
export interface NodeFieldBinding {
  /** 绑定项唯一标识 */
  id: string;
  /** 绑定的表单字段名 */
  fieldName: string;
  /** 字段显示名（冗余存储，便于回显） */
  fieldLabel?: string;
  /** 该字段的用途 */
  usage: FieldBindingUsage | string;
  /** 取值方式 */
  valueMode?: FieldValueMode;
  /** 流程变量名（usage=param 时使用，默认等于 fieldName） */
  flowVar?: string;
  /** 是否必填（该字段在节点提交时是否必填） */
  required?: boolean;
  /** 取值表达式（valueMode=expression 时使用） */
  expression?: string;
  /** 常量值（valueMode=constant 时使用） */
  constantValue?: any;
  /** 扩展属性，供自定义用途携带额外配置 */
  extra?: Record<string, any>;
}

/** 节点字段绑定用途的元数据（用于面板渲染选项） */
export interface FieldBindingUsageOption {
  /** 用途标识 */
  value: FieldBindingUsage | string;
  /** 用途显示名 */
  label: string;
  /** 该用途是否允许多个字段绑定 */
  multiple?: boolean;
  /** 该用途是否需要取值方式配置 */
  needValueMode?: boolean;
  /** 该用途是否需要流程变量名 */
  needFlowVar?: boolean;
}

/** 可绑定字段（由表单设计器从分段/表单字段中提取后传入） */
export interface BindableField {
  /** 字段名 */
  fieldName: string;
  /** 字段显示名 */
  label: string;
  /** 字段类型（可选，用于过滤可绑定字段） */
  fieldType?: string;
}

/** 节点字段绑定配置（存入节点 flowConfig.fieldBindings） */
export interface NodeFieldBindingConfig {
  /** 绑定项列表 */
  bindings: NodeFieldBinding[];
}

// ==================== 流程节点双模式（配置节点 / 绑定已有流程） ====================

/** 流程节点绑定模式 */
export type FlowNodeMode =
  | "design" /** 在线配置节点：字段绑定 + 流转设置 */
  | "reuse"; /** 绑定已有流程定义：选择流程 → 参数与表单字段映射 */

/** 已有流程定义的参数描述（由 loadFlowParams 加载） */
export interface FlowParam {
  /** 参数名 */
  name: string;
  /** 参数显示名 */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 参数描述 */
  description?: string;
  /** 参数类型 */
  type?: string;
}

/** 流程参数与表单字段的绑定项（reuse 模式） */
export interface FlowParamBinding {
  /** 绑定项唯一标识 */
  id: string;
  /** 流程参数名 */
  param: string;
  /** 绑定的表单字段名 */
  fieldName: string;
  /** 是否必填（冗余存储 FlowParam.required，便于回显） */
  required?: boolean;
}

/** 流程定义选项（供 reuse 模式下拉选择） */
export interface FlowDefineOption {
  /** 流程定义 ID / key */
  value: string;
  /** 流程定义名称 */
  label: string;
}