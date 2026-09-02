import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
/**
 * 流程设计器可插拔配置。
 *
 * 设计目的：流程设计器的核心逻辑（节点树操作、校验、Store）不直接耦合后端 API，
 * 所有需要与后端交互的能力（加载表单字段、保存/发布流程等）均通过该配置注入。
 * 这符合"后端驱动、外部注入"的原则，使流程设计器可在不同项目中复用而无需修改内部代码。
 *
 * 使用方式：
 * ```ts
 * import { configureWorkflow } from "star-horse-form";
 * configureWorkflow({
 *   loadFormColumns: async (formId) => (await api.getFields(formId)).data,
 *   saveProcess: async (formInfo, type) => (await api.save(formInfo, type)).data,
 * });
 * ```
 */
import type { FormColumnOption, FlowFormInfoType } from "@/components/workflow/types";
import { setDebugEnabled } from "@/utils/debugLog";

/** 流程设计器运行时配置 */
export interface WorkflowRuntimeConfig {
  /**
   * 加载表单可绑定字段列表。
   * @param formId 表单 ID
   * @returns 表单字段选项数组
   */
  loadFormColumns?: (formId: string | string[]) => Promise<FormColumnOption[]>;

  /**
   * 保存或发布流程定义。
   * @param formInfo 流程基础信息（含节点树 process）
   * @param type 操作类型：save / publish
   * @returns 后端响应（约定返回 { code, message, data } 结构）
   */
  saveProcess?: (
    formInfo: FlowFormInfoType,
    type: string,
  ) => Promise<any>;

  /**
   * 加载流程节点预置配置（可选，用于从后端拉取节点映射预置数据）。
   * @param prepId 预置配置 ID
   */
  loadNodePreps?: (prepId: string) => Promise<any>;

  /** 是否在控制台输出调试日志 */
  debug?: boolean;
}

/** 当前生效的配置（模块级单例） */
let currentConfig: WorkflowRuntimeConfig = {
  debug: false,
};

/**
 * 配置流程设计器运行时能力。
 * @param config 配置项，与已有配置合并
 */
export const configureWorkflow = (config: Partial<WorkflowRuntimeConfig>) => {
  currentConfig = { ...currentConfig, ...config };
  if (currentConfig.debug) {
    setDebugEnabled(true);
    dlog("[workflow] configureWorkflow:", currentConfig);
  }
};

/** 获取当前流程设计器配置 */
export const getWorkflowConfig = (): WorkflowRuntimeConfig => currentConfig;

/** 重置为默认配置（主要用于测试） */
export const resetWorkflowConfig = () => {
  currentConfig = { debug: false };
};