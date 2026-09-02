/**
 * 流程节点树操作工具。
 *
 * 从 shdevopsui 移植，提供对流程节点树（含 childNode 线性链与 conditionNodes 分支）
 * 的增删改查能力。该模块为纯函数，不依赖 Vue 响应式与 UI，是流程设计 Store 的底层支撑。
 *
 * 说明：原 `updateMap`（依赖 html2canvas 生成缩略图）已拆分至 `flowMapUtil.ts`，
 * 以避免核心逻辑硬依赖 html2canvas。
 */
import { uuid } from "star-horse-lowcode";
import { isRef, type Ref } from "vue";
import { FlowNodeEnums } from "@/components/workflow/enums/FlowNodeEnums";

/**
 * 新增条件/并行子节点。
 * @param node 父分支节点
 * @param len 当前分支序号
 */
export function addCondition(node: any, len: any) {
  return {
    pid: node.id,
    id: uuid(),
    name: (node.type == FlowNodeEnums.BRANCH_NODE ? "分支" : "并行") + len,
    type:
      node.type == FlowNodeEnums.BRANCH_NODE
        ? FlowNodeEnums.BRANCH_CONDITION_NODE
        : FlowNodeEnums.PARALLEL_SUB_NODE,
    addable: true,
    statusCode: "-1",
    otherFlag: false,
    deletable: false,
    showPriorityLevel: node.type == FlowNodeEnums.BRANCH_NODE,
    priorityLevel: len,
    error: false,
    branchType: node.type == FlowNodeEnums.BRANCH_NODE ? "rule" : null,
    content: node.type == FlowNodeEnums.BRANCH_NODE ? null : "任意(其他)",
    childNode: null,
    errorMsg: "",
    conditionGroups: [],
  };
}

/**
 * 同步分支节点到目标节点树（按 id 匹配后挂载 conditionNodes）。
 * @param node 遍历起点
 * @param currNode 当前操作的分支节点
 */
export function addBranch(node: any, currNode: any) {
  if (node && node.id == currNode.id) {
    node.conditionNodes = currNode.conditionNodes;
  } else if (node) {
    addBranch(node.childNode, currNode);
    if (node.conditionNodes) {
      node.conditionNodes.forEach((conditionNode: any) => {
        addBranch(conditionNode, currNode);
      });
    }
  }
}

/**
 * 删除普通节点：将当前节点的子节点挂载到父节点上。
 * @param node 遍历起点
 * @param currNode 待删除节点
 */
export function delNode(node: any, currNode: any) {
  if (node && currNode && node.id == currNode.pid) {
    const childNode = currNode.childNode;
    if (childNode && Object.prototype.hasOwnProperty.call(childNode, "name")) {
      childNode.pid = currNode.pid;
    }
    node.childNode = childNode;
  } else if (node && currNode) {
    delNode(node.childNode, currNode);
    if (node.conditionNodes) {
      node.conditionNodes.forEach((conditionNode: any) => {
        delNode(conditionNode, currNode);
      });
    }
  }
}

/**
 * 删除分支节点：仅剩两个分支时连带删除路由节点，否则从 conditionNodes 中移除。
 * @param node 根节点
 * @param snode 遍历节点
 * @param currNode 待删除分支节点
 */
export function delBranchNode(node: any, snode: any, currNode: any) {
  if (snode && currNode && snode.id == currNode.pid) {
    if (snode.conditionNodes.length == 2) {
      if (snode.id == node.id) {
        node = {};
      } else {
        delNode(node, snode);
      }
    } else {
      snode.conditionNodes.forEach((conditionNode: any, index: number) => {
        if (conditionNode.id == currNode.id) {
          snode.conditionNodes.splice(index, 1);
        }
      });
    }
  } else if (snode && currNode) {
    delBranchNode(node, snode.childNode, currNode);
    if (snode.conditionNodes) {
      snode.conditionNodes.forEach((conditionNode: any) => {
        delBranchNode(node, conditionNode, currNode);
      });
    }
  }
}

/**
 * 更新节点指定字段值。
 * @param node 遍历起点
 * @param currNode 目标节点
 * @param field 字段名
 * @param value 字段值
 */
export function updateNode(node: any, currNode: any, field: any, value: any) {
  if (node && currNode && node.id == currNode.id) {
    node[field] = value;
  } else if (node && currNode) {
    updateNode(node.childNode, currNode, field, value);
    if (node.conditionNodes) {
      node.conditionNodes.forEach((conditionNode: any) => {
        updateNode(conditionNode, currNode, field, value);
      });
    }
  }
}

/**
 * 递归收集所有审批/办理节点。
 * @param node 遍历起点（可为 Ref）
 * @param approveNodes 输出数组
 */
export function getApproveNodes(node: any, approveNodes: Array<any>) {
  isRef(node) && (node = node.value);
  if (!node || !node.type) return;
  if (node.type == FlowNodeEnums.APPROVER_NODE) {
    approveNodes.push(node);
  }
  const childNode = node.childNode;
  if (childNode) {
    getApproveNodes(childNode, approveNodes);
  }
  const conditionNodes = node.conditionNodes;
  if (conditionNodes) {
    conditionNodes.forEach((conditionNode: any) => {
      getApproveNodes(conditionNode, approveNodes);
    });
  }
}