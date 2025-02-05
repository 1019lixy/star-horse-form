import {defineStore} from "pinia";
import {ref} from "vue";
import {addCondition, delBranchNode, delNode, updateMap, updateNode} from "@/views/workflow/plugin/utils/nodeUtil.ts";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {apiInstance} from "@/api/sh_api.ts";
import {nodePrepList} from "@/views/workflow/plugin/utils/nodePreps.ts";

const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/formInstance/shFlowNode/idFlowNode/337537414606095357");
const prepUrl: ApiUrls = apiInstance("userdb-manage", "userdb/formInstance/shNodeMappingPreps/idNodeMappingPrep/337537414606095357");

export const useFlowDesign = defineStore("flowDesignStore", () => {

            const nodeList = ref<any>([]);
            const nodePrepMap = ref<any>({});
            const commonPreps = ref<any>({});
            const currentNode = ref<any>({});
            const parentNode = ref<any>({});
            const flowFormInfo = ref<any>({});
            //  节点数据
            const node = ref<any>(nodePrepList(FlowNodeEnums.APPLY_NODE));
            //  缩略图
            const mapImg = ref<string>("");
            // 意见分支
            const suggestBranchEnable = ref<boolean>(true);
            // 并行节点
            const parallelBranchEnable = ref<boolean>(true);
            const navable = ref<boolean>(true);
            const readable = ref<boolean>(false);
            const lintData = ref<any>({});
            const active = ref<boolean>(false);
            const mapVisible = ref<boolean>(false);

            const setNavable = (flag: boolean) => {
                navable.value = flag;
            }
            const setActive = (flag: boolean) => {
                active.value = flag;
            }
            const setMapVisible = (flag: boolean) => {
                mapVisible.value = flag;
            }
            const setLintData = (data: any) => {
                lintData.value = data;
            }
            const setReadable = (flag: boolean) => {
                readable.value = flag;
            }
            const setNode = (data: any) => {
                node.value = data;
            }
            /**
             *  初始节点
             */
            const flowSetNode = (snode: any) => {
                if (snode) {
                    node.value = snode;
                } else {
                    node.value = nodePrepList(FlowNodeEnums.APPLY_NODE);
                }
            }
            /**
             * 选中
             * @param node
             */
            const activeNode = (node: any) => {
                currentNode.value = node;
                active.value = true;
            }
            const setParentNode = (node: any) => {
                parentNode.value = node;
            }
            /**
             * 设置表单信息
             * @param formInfo
             */
            const flowSetFormInfo = (formInfo: any) => {
                flowFormInfo.value = formInfo;
            }
            /**
             * 添加表单属性
             * @param key
             * @param value
             */
            const formAddField = (key: string, value: any) => {
                flowFormInfo.value[key] = value;
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
            const flowAddNode = (currentNode: any, parentNode: any, parentNodeType: string, id: string) => {
                // console.log("flowAddNode", data);
                /**
                 * 如果是开始节点，则将当前节点放在最前面，否则放在当前节点后面
                 */
                if (parentNodeType == FlowNodeEnums.START_NODE) {
                    //  开始
                    if (parentNode.hasOwnProperty('name')) {
                        // 如果添加的是并行节点
                        if (currentNode.type == FlowNodeEnums.PARALLEL_NODE) {
                            currentNode.childNode.childNode = parentNode;
                            currentNode.childNode.childNode['pid'] = currentNode.childNode.id;
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
                                    console.log("conditionNode", conditionNode);
                                    let bakeNode = conditionNode.childNode;
                                    // 获取当前操作节点
                                    if (bakeNode) {
                                        bakeNode.pid = currentNode.id;
                                        currentNode.childNode = bakeNode;
                                    }
                                    currentNode.pid = conditionNode.id;
                                    conditionNode.childNode = currentNode;
                                    // addNode(node.value, conditionNode, currentNode);
                                }
                            }
                        );
                    } else {
                        let bakeNode = parentNode.childNode;
                        // 获取当前操作节点
                        if (bakeNode) {
                            bakeNode.pid = currentNode.id;
                            currentNode.childNode = bakeNode;
                        }
                        currentNode.pid = parentNode.id;
                        parentNode.childNode = currentNode;
                        // 获取当前操作节点
                        // addNode(node.value, parentNode, currentNode);
                    }
                }
                console.log(node.value);
                // 更新地图
                refreshMap(true);
                //console.log('node', state.node);
                // console.info(JSON.stringify(node.value));

            }
            /**
             * 添加分支
             */
            const flowAddBranch = (snode: any) => {
                const len = snode.conditionNodes.length;
                const conditionNode = snode.conditionNodes[len - 1];
                conditionNode.priorityLevel = len + 1;
                if (conditionNode.type == FlowNodeEnums.BRANCH_CONDITION_NODE) {
                    // 分支
                    snode.conditionNodes.splice(len - 1, 0, addCondition(snode, len));
                } else {
                    // 并行
                    snode.conditionNodes.push(addCondition(snode, len + 1));
                }
                // addBranch(node.value, snode);
                // 更新地图
                refreshMap(true);
            }
            const refreshMap = (autoRefresh: boolean = false) => {
                if (autoRefresh && mapVisible.value) {
                    updateMap(mapImg);
                }
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
                refreshMap(true);
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
            }

            const init = () => {
                refreshMap(true);
                nodeList.value = [];
                nodePrepMap.value = {};
                parentNode.value = {};
                node.value = nodePrepList(FlowNodeEnums.APPLY_NODE);
                flowFormInfo.value = {};
            }
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
                setNode
            }
        }
    )
;
