/**
 * 流程设计相关类型定义。
 *
 * 从 shdevopsui 移植并补全：源项目以 `FlowDesignType.js` 形式存在且类型缺失，
 * 这里用 TypeScript 具体类型补全，供流程设计 Store 与校验器使用。
 */

/** 流程变量值类型 */
export type ProcessVariableValueType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "user"
  | "dept"
  | "role"
  | "array";

/** 流程变量定义（用于流程发起/审批时传递业务参数） */
export interface ProcessVariablesType {
  /** 变量名（对应流程引擎中的变量 key） */
  name: string;
  /** 变量显示名称 */
  label?: string;
  /** 变量值类型 */
  type?: ProcessVariableValueType;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  defaultValue?: any;
  /** 候选值（用于枚举类变量） */
  options?: Array<{ name: string; value: any }>;
  /** 来源表单字段名（当变量来自表单字段绑定时） */
  sourceField?: string;
  /** 扩展属性 */
  [key: string]: any;
}

/** 流程基础信息（保存/发布时提交的元数据） */
export interface FlowFormInfoType {
  /** 流程定义 ID */
  idFlowDefine?: string;
  /** 流程部署 ID */
  flowDeploymentId?: string;
  /** 流程名称 */
  name?: string;
  /** 流程分类标识 */
  flowGroup?: string;
  /** 流程分类层级列表 */
  flowGroupList?: string[];
  /** 流程分类名称层级 */
  flowGroupNameList?: string[];
  /** 流程分类全路径名称 */
  flowGroupName?: string;
  /** 关联表单 ID */
  formId?: string;
  /** 提交类型：save(暂存) / publish(发布) */
  submitType?: string;
  /** 流程节点树（序列化后的 node 结构） */
  process?: any;
  /** 扩展属性 */
  [key: string]: any;
}

/** 表单字段选项（从动态表单解析得到的可绑定字段） */
export interface FormColumnOption {
  /** 字段名 */
  name: string;
  /** 字段显示名 */
  label?: string;
  /** 字段类型 */
  type?: string;
  /** 扩展属性 */
  [key: string]: any;
}