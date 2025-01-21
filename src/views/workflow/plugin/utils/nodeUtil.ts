import {uuid} from '@/api/system.ts';
import html2canvas from 'html2canvas';
import {isRef, Ref} from "vue";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";


/**
 *   获取条件/并行节点
 */
export function addCondition(node: any, len: any) {
    return {
        pid: node.id,
        id: uuid(),
        name: (node.type == FlowNodeEnums.BRANCH_NODE ? '分支' : '并行') + len,
        type: node.type == FlowNodeEnums.BRANCH_NODE ? FlowNodeEnums.BRANCH_CONDITION_NODE : FlowNodeEnums.PARALLEL_SUB_NODE,
        // 显示添加按钮
        addable: true,
        //状态
        status: "-1",
        otherFlag: false,
        // 可删除提示
        deletable: false,
        showPriorityLevel: node.type == FlowNodeEnums.BRANCH_NODE,
        // 优先级
        priorityLevel: len,
        // 是否有错误
        error: false,
        // 分支类型
        branchType: node.type == FlowNodeEnums.BRANCH_NODE ? "rule" : null,
        // 显示内容
        content: node.type == FlowNodeEnums.BRANCH_NODE ? null : '任意(其他)',
        // 子节点
        childNode: null,
        errorMsg: '',
        // 条件组
        conditionGroups: [],
    };
}

/**
 *   添加节点
 */
export function addNode(node: any, currNode: any, addNodeData: any) {
    if (node && node.id == currNode.id) {
        // 当前节点的子节点暂存
        const childNode = currNode.childNode;
        if (childNode) {
            childNode.pid = addNodeData.id;
        }
        // 如果添加的是并行节点
        if (addNodeData.type == FlowNodeEnums.PARALLEL_NODE) {
            if (childNode) {
                // 聚合节点作为其父节点
                childNode.pid = addNodeData.childNode.id;
            }
            //  将需要添加的节点后面挂载当前聚合节点子节点
            addNodeData.childNode.childNode = childNode;
        } else {
            //  将需要添加的节点后面挂载当前子节点
            addNodeData.childNode = childNode;
        }
        //  当前添加节点父节点
        addNodeData.pid = currNode.id;
        //  当前子节点上添加需要添加的节点
        node.childNode = addNodeData;
    } else if (node) {
        addNode(node.childNode, currNode, addNodeData);
        if (node.conditionNodes) {
            node.conditionNodes.forEach((conditionNode: any) => {
                addNode(conditionNode, currNode, addNodeData);
            });
        }
    }
}

/**
 *   添加分支
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
 *   删除节点
 */
export function delNode(node: any, currNode: any) {
    if (node && currNode && node.id == currNode.pid) {
        // 当前节点的子节点暂存
        let childNode = currNode.childNode;
        // 如果删除的是并行节点
        if (currNode.type == FlowNodeEnums.PARALLEL_NODE) {
            childNode = currNode.childNode?.childNode;
        }
        if (childNode && childNode.hasOwnProperty('name')) {
            childNode.pid = currNode.pid;
        }
        //  将当前节点的子节点挂载到父节点
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
 *   删除分支节点
 */
export function delBranchNode(node: any, snode: any, currNode: any) {
    if (snode && currNode && snode.id == currNode.pid) {
        // 只有两个分支
        if (snode.conditionNodes.length == 2) {
            if (snode.id == node.id) {
                node = {};
            } else {
                // 需要将路由节点删除
                delNode(node, snode);
            }
        } else {
            // 执行删除当前分支
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
 * 更新节点
 *
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
 * 所有审批节点
 * @param {*} node
 * @param {*} approveNodes
 */
export function getApproveNodes(node: any, approveNodes: Array<any>) {
    console.log("getApproveNodes", node);
    isRef(node) && (node = node.value);
    if (node.type == FlowNodeEnums.APPROVER_NODE) {
        approveNodes.push(node);
    }
    // 如果有孩子节点
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

/**
 * 更新地图
 *
 */
export async function updateMap(mapImg: Ref<string>) {
    // await nextTick();
    setTimeout(() => {
        const content: any = document.querySelector('#sh-flow-editor-content');
        html2canvas(content, {
            backgroundColor: '#aaa',
            scale: 1,
            width: content.clientWidth,
            height: content.scrollHeight,
            windowHeight: content.scrollHeight,
        }).then((canvas) => {
            mapImg.value = canvas.toDataURL('image/jpeg', 0.8);
        });
    }, 300);
}
