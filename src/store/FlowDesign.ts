import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
/**
 * 流程设计 Store。
 *
 * 从 shdevopsui 移植并解耦 API：
 * - 原直接调用 `postRequest` 加载表单字段，改为通过 `workflowConfig.loadFormColumns` 注入；
 * - 新增 `setFormColumns` 供外部直接注入字段（后端驱动场景）；
 * - `updateMap` 改从 `flowMapUtil` 引入（html2canvas 可选依赖）。
 *
 * 该 Store 承载流程节点树状态与操作，是流程设计器的状态中枢。
 */
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  addCondition,
  delBranchNode,
  delNode,
  updateNode,
} from "@/components/workflow/utils/nodeUtil";
import { updateMap } from "@/components/workflow/utils/flowMapUtil";
import { FlowNodeEnums } from "@/components/workflow/enums/FlowNodeEnums";
import { nodePrepList } from "@/components/workflow/utils/nodePreps";
import { getWorkflowConfig } from "@/components/workflow/config/workflowConfig";
import type {
  FormColumnOption,
  ProcessVariablesType,
} from "@/components/workflow/types";

export const useFlowDesignStore = defineStore("flowDesign", () => {
  const nodeList = ref<any>([]);
  const nodePrepMap = ref<any>({});
  const commonPreps = ref<any>({});
  const currentNode = ref<any>({});
  const parentNode = ref<any>({});
  const flowFormInfo = ref<any>({});
  const formId = ref<string>("");
  /** 节点树根节点 */
  const node = ref<any>(nodePrepList(FlowNodeEnums.START_NODE));
  /** 缩略图 dataURL */
  const mapImg = ref<string>("");
  const suggestBranchEnable = ref<boolean>(true);
  const parallelBranchEnable = ref<boolean>(true);
  const navable = ref<boolean>(true);
  const readable = ref<boolean>(false);
  const lintData = ref<any>({});
  const active = ref<boolean>(false);
  const mapVisible = ref<boolean>(false);
  /** 表单可绑定字段 */
  const formColumns = ref<FormColumnOption[]>([]);
  /** 流程变量 */
  const processVariables = ref<ProcessVariablesType[]>([]);

  const getProcessVariables = () => processVariables.value;
  const setProcessVariables = (variables: ProcessVariablesType[]) => {
    processVariables.value = variables;
  };

  /**
   * 加载表单字段：优先使用注入的 loadFormColumns，未配置则清空。
   * @param id 表单 ID
   */
  const loadDynamicForm = async (id: string | string[]) => {
    const config = getWorkflowConfig();
    if (!config.loadFormColumns) {
      if (config.debug) {
        dwarn("[flowDesign] loadFormColumns not configured");
      }
      return;
    }
    try {
      const columns = await config.loadFormColumns(id);
      formColumns.value = columns || [];
    } catch (e) {
      if (config.debug) {
        derror("[flowDesign] loadDynamicForm error:", e);
      }
    }
  };

  const setFormId = (id: string) => {
    formId.value = id;
    loadDynamicForm(id);
  };

  const getFormId = () => formId.value;

  /** 外部直接注入表单字段（后端驱动场景，避免前端再发请求） */
  const setFormColumns = (columns: FormColumnOption[]) => {
    formColumns.value = columns || [];
  };

  const getFormColumns = () => {
    if (!formColumns.value.length) {
      loadDynamicForm(formId.value);
    }
    return formColumns.value;
  };

  const setNavable = (flag: boolean) => {
    navable.value = flag;
  };
  const setActive = (flag: boolean) => {
    active.value = flag;
  };
  const setMapVisible = (flag: boolean) => {
    mapVisible.value = flag;
  };
  const setLintData = (data: any) => {
    lintData.value = data;
  };
  const setReadable = (flag: boolean) => {
    readable.value = flag;
  };
  const setNode = (data: any) => {
    node.value = data;
  };

  /** 初始化节点树 */
  const flowSetNode = (snode: any) => {
    if (snode) {
      node.value = snode;
    } else {
      node.value = nodePrepList(FlowNodeEnums.START_NODE);
    }
  };

  /** 选中节点 */
  const activeNode = (n: any) => {
    currentNode.value = n;
    active.value = true;
  };

  const setParentNode = (n: any) => {
    parentNode.value = n;
  };

  /** 设置表单信息 */
  const flowSetFormInfo = (formInfo: any) => {
    flowFormInfo.value = formInfo;
    formId.value = formInfo.formId;
  };

  /** 添加表单属性 */
  const formAddField = (key: string, value: any) => {
    flowFormInfo.value[key] = value;
  };

  /** 设置节点预置数据 */
  const putNodePrepMap = (nodeId: string, prep: any) => {
    nodePrepMap.value[nodeId] = prep;
  };

  /** 获取节点预置数据 */
  const getPrepMap = (nodeId: string) => nodePrepMap.value[nodeId];

  /** 添加节点 */
  const flowAddNode = (
    currentNode: any,
    parentNode: any,
    parentNodeType: string,
    id: string,
  ) => {
    if (parentNodeType == FlowNodeEnums.START_NODE) {
      if (Object.prototype.hasOwnProperty.call(parentNode, "name")) {
        if (currentNode.type == FlowNodeEnums.PARALLEL_NODE) {
          currentNode.childNode.childNode = parentNode;
          currentNode.childNode.childNode["pid"] = currentNode.childNode.id;
        } else {
          currentNode.childNode = parentNode;
          currentNode.childNode["pid"] = currentNode.id;
        }
        currentNode.pid = 0;
      }
      node.value = currentNode;
    } else {
      if (id) {
        parentNode.conditionNodes.forEach((conditionNode: any) => {
          if (conditionNode.id == id) {
            const bakeNode = conditionNode.childNode;
            if (bakeNode) {
              bakeNode.pid = currentNode.id;
              currentNode.childNode = bakeNode;
            }
            currentNode.pid = conditionNode.id;
            conditionNode.childNode = currentNode;
          }
        });
      } else {
        const bakeNode = parentNode.childNode;
        if (bakeNode) {
          bakeNode.pid = currentNode.id;
          currentNode.childNode = bakeNode;
        }
        currentNode.pid = parentNode.id;
        parentNode.childNode = currentNode;
      }
    }
    refreshMap(true);
  };

  /** 添加分支 */
  const flowAddBranch = (snode: any) => {
    const len = snode.conditionNodes.length;
    const conditionNode = snode.conditionNodes[len - 1];
    conditionNode.priorityLevel = len + 1;
    if (conditionNode.type == FlowNodeEnums.BRANCH_CONDITION_NODE) {
      snode.conditionNodes.splice(len - 1, 0, addCondition(snode, len));
    } else {
      snode.conditionNodes.push(addCondition(snode, len + 1));
    }
    refreshMap(true);
  };

  /** 刷新缩略图 */
  const refreshMap = (autoRefresh: boolean = false) => {
    if (autoRefresh && mapVisible.value) {
      updateMap(mapImg);
    }
  };

  /** 删除节点 */
  const flowDelNode = (snode: any) => {
    if (snode.id == node.value.id) {
      if (snode.childNode) {
        node.value = snode.childNode;
      } else {
        node.value = {};
      }
    } else if (
      snode.type == FlowNodeEnums.BRANCH_CONDITION_NODE ||
      snode.type == FlowNodeEnums.SUGGEST_SUB_NODE ||
      snode.type == FlowNodeEnums.PARALLEL_SUB_NODE
    ) {
      delBranchNode(node.value, node.value, snode);
    } else {
      delNode(node.value, snode);
    }
    refreshMap(true);
  };

  /** 更新节点字段 */
  const flowUpdateNode = ({
    currNode,
    field,
    value,
  }: {
    currNode: any;
    field: any;
    value: any;
  }) => {
    if (currNode.id == node.value.id) {
      node.value[field] = value;
    } else {
      updateNode(node.value, currNode, field, value);
    }
  };

  /** 初始化 */
  const init = (stopInitFormInfo?: boolean) => {
    refreshMap(true);
    nodeList.value = [];
    nodePrepMap.value = {};
    parentNode.value = {};
    node.value = nodePrepList(FlowNodeEnums.START_NODE);
    if (!stopInitFormInfo) {
      flowFormInfo.value = {};
    }
  };

  return {
    currentNode,
    nodeList,
    active,
    commonPreps,
    parentNode,
    node,
    mapImg,
    suggestBranchEnable,
    parallelBranchEnable,
    flowFormInfo,
    navable,
    readable,
    lintData,
    mapVisible,
    formId,
    processVariables,
    formColumns,
    getFormColumns,
    setFormColumns,
    getProcessVariables,
    setProcessVariables,
    setFormId,
    getFormId,
    setMapVisible,
    putNodePrepMap,
    setActive,
    getPrepMap,
    setLintData,
    setNavable,
    setReadable,
    flowSetFormInfo,
    activeNode,
    flowSetNode,
    flowAddNode,
    flowAddBranch,
    flowDelNode,
    flowUpdateNode,
    refreshMap,
    init,
    formAddField,
    setParentNode,
    setNode,
  };
});