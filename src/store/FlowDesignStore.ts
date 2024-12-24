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
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {apiInstance, createCondition} from "@/api/sh_api.ts";
import {SearchParams} from "@/components/types/Params";

const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/formInstance/shFlowNode/idFlowNode/337537414606095357");
const prepUrl: ApiUrls = apiInstance("userdb-manage", "userdb/formInstance/shNodeMappingPreps/idNodeMappingPrep/337537414606095357");
export const useFlowDesign = defineStore("flowDesignStore", () => {

    const nodeList = ref<any>([]);
    const nodePrepMap = ref<any>({});
    const commonPreps = ref<any>({});
    const currentNode = ref<any>({});
    const flowFormInfo = ref<any>({});
    //  节点数据
    const node = ref<any>(getStartNode());
    //  缩略图
    const mapImg = ref<string>("");
    // 意见分支
    const suggestBranchEnable = ref<boolean>(true);
    // 并行节点
    const parallelBranchEnable = ref<boolean>(true);
    const navable = ref<boolean>(true);
    const readable = ref<boolean>(false);
    const lintData = ref<any>({});
    const setNavable = (flag: boolean) => {
        navable.value = flag;
    }
    const setLintData = (data: any) => {
        lintData.value = data;
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
     * 设置节点数据
     * @param node
     */
    const putNodePrepMap = (nodeId: string, prep: any) => {
        nodePrepMap.value[nodeId] = prep;
    }
    /**
     * 获取节点数据
     * @param nodeId
     */
    const getPrepMap = (nodeId: string) => {
        return nodePrepMap.value[nodeId];
    }
    /**
     * 添加节点
     */
    const flowAddNode = (data: any) => {
        console.log("flowAddNode", data);
        if (data.nodeType == FlowNodeEnums.WRITE_NODE) {
            //  开始
            if (node.value.hasOwnProperty('name')) {
                // 如果添加的是并行节点
                if (data.addNode.type == FlowNodeEnums.PARALLEL_NODE) {
                    data.addNode.childNode.childNode = node.value;
                    data.addNode.childNode.childNode['pid'] = data.addNode.childNode.id;
                    console.log("data.addNode.childNode", data.addNode.childNode);
                } else {
                    data.addNode.childNode = node.value;
                    console.log("data.currNode.childNode", data.currNode.childNode);
                    data.addNode.childNode["pid"] = data.addNode.id;
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
        const len = snode.conditionNodes.length;
        const conditionNode = snode.conditionNodes[len - 1];
        conditionNode.attr.priorityLevel = len + 1 + '';
        if (conditionNode.type == FlowNodeEnums.BRANCH_CONDITION_NODE) {
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
        console.log("flowDelNode", snode, node.value);
        if (snode.id == node.value.id) {
            if (snode.childNode) {
                node.value = snode.childNode;
            } else {
                node.value = {};
            }
        } else if (snode.type == FlowNodeEnums.BRANCH_CONDITION_NODE
            || snode.type == FlowNodeEnums.SUGGEST_SUB_NODE
            || snode.type == FlowNodeEnums.PARALLEL_SUB_NODE) {
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
    const init = () => {
        const innerInit = async () => {
            let res = await dataUrl.queryConditionAction!([]);
            nodeList.value = res.data;
            let params: SearchParams[] = [
                createCondition("attrType", "common")
            ];
            res = await prepUrl.queryConditionAction!(params);
            let temp: any = {};
            res.data?.forEach((item: any) => {
                temp[item.attrName] = temp[item.defaultValue];
            });
            commonPreps.value = temp;
        }
        innerInit();

    }
    return {
        currentNode,
        nodeList,
        commonPreps,
        node,
        mapImg,
        suggestBranchEnable,
        parallelBranchEnable,
        flowFormInfo,
        navable,
        readable,
        lintData,
        putNodePrepMap,
        getPrepMap,
        setLintData,
        setNavable,
        setReadable,
        flowSetFormInfo,
        flowSetCurrentNode,
        flowSetNode,
        flowAddNode,
        flowAddBranch,
        flowDelNode,
        flowUpdateNode,
        flowUpdateMap,
        init
    }
});
