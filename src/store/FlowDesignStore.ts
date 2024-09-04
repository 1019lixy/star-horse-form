import {defineStore} from "pinia";
import {ref} from "vue";
import {
    addBranch,
    addCondition,
    addNode,
    delBranchNode,
    delNode,
    getStartNode,
    updateMap,
    updateNode
} from "@/views/workflow/plugin/util/nodeUtil.ts";

export const useFlowDesign = defineStore("flowDesignStore", () => {
    let currentNode = ref<any>({});
    let flowFormInfo = ref<any>({});
    //  节点数据
    let node = ref<any>(getStartNode());
    //  缩略图
    let mapImg = ref<string>("");
    // 意见分支
    let suggestBranchEnable = ref<boolean>(true);
    // 并行节点
    let parallelBranchEnable = ref<boolean>(true);
    let navable = ref<boolean>(true);
    let readable = ref<boolean>(false);
    const setNavable = (flag: boolean) => {
        navable.value = flag;
    }
    const setReadable = (flag: boolean) => {
        readable.value = flag;
    }
    /**
     *  初始节点
     */
    const flowSetNode = (snode: any) => {
        if (snode) {
            node.value = snode;
        } else {
            node.value = getStartNode();
        }
    }
    /**
     * 选中
     * @param node
     */
    const flowSetCurrentNode = (node: any) => {
        currentNode.value = node;
    }
    /**
     * 设置表单信息
     * @param formInfo
     */
    const flowSetFormInfo = (formInfo: any) => {
        flowFormInfo.value = formInfo;
    }
    /**
     * 添加节点
     */
    const flowAddNode = (data: any) => {
        console.log("flowAddNode", data);
        if (data.nodeType == 0) {
            //  开始
            if (node.value.hasOwnProperty('name')) {
                // 如果添加的是并行节点
                if (data.addNode.type == 9) {
                    data.addNode.childNode.childNode = node.value;
                    data.addNode.childNode.childNode.pid = data.addNode.childNode.id;
                } else {
                    data.addNode.childNode = node.value;
                    data.addNode.childNode.pid = data.addNode.id;
                }
                data.addNode.pid = 0;
            }
            node.value = data.addNode;
        } else {
            if (data.id) {
                data.currNode.conditionNodes.forEach((conditionNode: any) => {
                    if (conditionNode.id == data.id) {
                        // 获取当前操作节点
                        addNode(node.value, conditionNode, data.addNode);
                    }
                });
            } else {
                // 获取当前操作节点
                addNode(node.value, data.currNode, data.addNode);
            }
        }
        // 更新地图
        updateMap(mapImg);
        //console.log('node', state.node);
        console.info(JSON.stringify(node.value));
    }
    /**
     * 添加分支
     */
    const flowAddBranch = (snode: any) => {
        let len = snode.conditionNodes.length;
        let conditionNode = snode.conditionNodes[len - 1];
        conditionNode.attr.priorityLevel = len + 1 + '';
        if (conditionNode.type == 3) {
            // 分支
            snode.conditionNodes.splice(len - 1, 0, addCondition(snode, len));
        } else {
            // 并行
            snode.conditionNodes.push(addCondition(snode, len + 1));
        }
        addBranch(node.value, snode);
        // 更新地图
        updateMap(mapImg);
    }
    /**
     * 删除节点
     */
    const flowDelNode = (snode: any) => {
        if (snode.id == node.value.id) {
            if (snode.childNode) {
                node.value = snode.childNode;
            } else {
                node.value = {};
            }
        } else if (snode.type == 3 || snode.type == 8 || snode.type == 10) {
            // 条件(意见)分支节点和并行节点
            delBranchNode(node.value, node.value, snode);
        } else {
            delNode(node.value, snode);
        }
        // 更新地图
        updateMap(mapImg);
    }
    /**
     * 更新节点
     */
    const flowUpdateNode = ({currNode, field, value}) => {
        if (currNode.id == node.value.id) {
            node.value[field] = value;
        } else {
            updateNode(node.value, currNode, field, value);
        }
        console.info(JSON.stringify(node.value));
    }
    /**
     * 更新地图
     */
    const flowUpdateMap = () => {
        updateMap(mapImg);
    }
    return {
        currentNode,
        node, mapImg, suggestBranchEnable,
        parallelBranchEnable, flowFormInfo, navable, readable,
        setNavable,
        setReadable,
        flowSetFormInfo,
        flowSetCurrentNode,
        flowSetNode,
        flowAddNode,
        flowAddBranch,
        flowDelNode,
        flowUpdateNode,
        flowUpdateMap
    }
});
