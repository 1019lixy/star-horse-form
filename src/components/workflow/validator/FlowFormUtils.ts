import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
/**
 * 流程表单工具。
 *
 * 从 shdevopsui 移植并解耦：源项目直接调用 `postRequest` 到固定后端 URL，
 * 且硬编码 router 跳转。这里改为通过 `workflowConfig.saveProcess` 注入保存能力，
 * 并以回调形式返回保存结果，使流程设计器不耦合具体后端与路由。
 *
 * 校验部分（doValidate / formatValidateErrors）保持纯函数，可独立使用。
 */
import { isRef } from "vue";
import type { FlowFormInfoType } from "@/components/workflow/types";
import { getWorkflowConfig } from "@/components/workflow/config/workflowConfig";
import { getFlowDesignStore } from "@/store/StoreManager";
import {
  validateAllNodes,
  validateBasicInfo,
  markNodeErrors,
  type NodeValidateResult,
} from "@/components/workflow/validator/NodeValidator";

/** 保存结果回调参数 */
export interface SaveResultCallbackArgs {
  /** 后端响应原始数据 */
  response: any;
  /** 是否为发布操作 */
  isPublish: boolean;
  /** 校验是否通过 */
  validated: boolean;
}

/**
 * 校验流程数据完整性。
 * @param formInfo 流程基础信息
 * @returns 校验结果列表，null 表示校验通过
 */
const doValidate = (formInfo: any): NodeValidateResult[] | null => {
  const allErrors: NodeValidateResult[] = [];
  const flowDesign = getFlowDesignStore();

  const basicResult = validateBasicInfo(formInfo);
  if (!basicResult.valid) {
    allErrors.push(basicResult);
  }

  const nodeResults = validateAllNodes(flowDesign.node);
  if (nodeResults.length > 0) {
    allErrors.push(...nodeResults);
  }

  markNodeErrors(flowDesign.node, nodeResults);

  return allErrors.length > 0 ? allErrors : null;
};

/** 格式化校验错误信息为可读文本 */
const formatValidateErrors = (errors: NodeValidateResult[]): string => {
  return errors
    .map((e) => {
      if (e.nodeType === "basicInfo") {
        return `【基础信息】${e.errors.join("；")}`;
      }
      return `【${e.nodeName}】${e.errors.join("；")}`;
    })
    .join("\n");
};

/**
 * 保存或发布流程数据。
 *
 * 解耦说明：保存动作通过 `workflowConfig.saveProcess` 注入；若未配置则仅做校验与回调。
 * 发布时严格校验，校验未通过则通过 `onValidateFail` 回调通知，不中断流程。
 *
 * @param formInfo 流程基础信息
 * @param type 操作类型：save / publish
 * @param options 回调选项
 */
const doSaveData = async (
  formInfo: any,
  type: string,
  options?: {
    /** 保存成功回调 */
    onSuccess?: (args: SaveResultCallbackArgs) => void;
    /** 校验失败回调（返回错误信息文本） */
    onValidateFail?: (errorMsg: string) => void;
    /** 保存失败回调 */
    onError?: (err: any) => void;
  },
) => {
  const config = getWorkflowConfig();
  const flowDesign = getFlowDesignStore();
  const info: FlowFormInfoType = isRef(formInfo)
    ? (formInfo as any).value
    : formInfo;
  const isPublish = type === "publish";

  const validateResult = doValidate(info);
  const validated = !validateResult;

  if (isPublish && validateResult) {
    const errorMsg = formatValidateErrors(validateResult);
    options?.onValidateFail?.(errorMsg);
    if (config.debug) {
      dwarn("[workflow] publish validate failed:", errorMsg);
    }
    return;
  }

  info.submitType = type;
  info.process = flowDesign.node;

  if (info.flowGroupNameList && Array.isArray(info.flowGroupNameList)) {
    if (!info.flowGroupName) {
      info.flowGroupName = info.flowGroupNameList.join("/");
    }
  }

  if (!config.saveProcess) {
    if (config.debug) {
      dwarn("[workflow] saveProcess not configured, skip request");
    }
    options?.onSuccess?.({ response: null, isPublish, validated });
    return;
  }

  try {
    const response = await config.saveProcess(info, type);
    const res: any = response?.data ?? response;
    if (res?.code) {
      options?.onError?.(res.message || "保存失败");
      return;
    }
    const returnedData = res?.data || res;
    if (returnedData) {
      if (returnedData.idFlowDefine && !info.idFlowDefine) {
        info.idFlowDefine = returnedData.idFlowDefine;
      }
      if (returnedData.flowDeploymentId && !info.flowDeploymentId) {
        info.flowDeploymentId = returnedData.flowDeploymentId;
      }
      flowDesign.flowSetFormInfo(info);
    }
    options?.onSuccess?.({ response: res, isPublish, validated });
  } catch (err) {
    options?.onError?.(err);
  }
};

export { doSaveData, doValidate, formatValidateErrors };