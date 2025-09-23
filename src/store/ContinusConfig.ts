import {defineStore} from "pinia";
import {ref} from "vue";

export const useContinusConfigStore = defineStore(
    "continuousConfig",
    () => {
        /**
         * 节点信息
         */
        const nodeInfo = ref<Record<string, any>>({});
        /**
         * 节点属性
         */
        const nodeFields = ref<Record<string, any>>({});
        /**
         * 子节点列表
         */
        const subNodeList = ref<Record<string, Array<string>>>({});

        /**
         * 添加节点数据
         * @param nodeId 节点ID
         * @param data 节点数据
         */
        const addNodeInfo = (nodeId: string, data: any) => {
            if (nodeId) {
                nodeInfo.value[nodeId] = data;
            }
        };
        /**
         * 添加节点属性
         * @param formNo 表单编号
         * @param data
         */
        const addNodeFields = (formNo: string, data: any) => {
            if (formNo) {
                nodeFields.value[formNo] = data;
            }
        };
        /**
         * 获取节点数据
         * @param nodeId 节点ID
         */
        const getNodeInfo = (nodeId: string) => {
            return nodeInfo.value[nodeId];
        };
        /**
         * 获取表单属性
         * @param formNo
         */
        const getNodeFields = (formNo: string) => {
            return nodeFields.value[formNo];
        };

        /**
         * 添加子节点
         * @param nodeId
         * @param subNodeId
         */
        const addSubNode = (nodeId: string, subNodeId: string) => {
            if (!subNodeList.value[nodeId]) {
                subNodeList.value[nodeId] = [];
            }
            subNodeList.value[nodeId].push(subNodeId);
        };
        /**
         * 获取所有子节点
         * @param nodeId
         */
        const getSubNodes = (nodeId: string) => {
            return subNodeList.value[nodeId] || [];
        };
        /**
         * 删除子节点
         * @param nodeId
         * @param subNodeId
         */
        const removeSubNode = (nodeId: string, subNodeId: string) => {
            if (subNodeList.value[nodeId]) {
                subNodeList.value[nodeId] = subNodeList.value[nodeId].filter((id: string) => id !== subNodeId);
            }
        };

        /**
         * 移除节点数据
         * @param nodeId 节点ID
         */
        const removeNode = (nodeId: string) => {
            delete nodeInfo.value[nodeId];
        };

        const removeNodeFields = (formNo: string) => {
            delete nodeFields.value[formNo];
        };
        /**
         * 清空节点数据
         */
        const clear = () => {
            nodeInfo.value = {};
            nodeFields.value = {};
            subNodeList.value = {};
        };
        return {
            addNodeInfo,
            addNodeFields,
            addSubNode,
            getSubNodes,
            removeSubNode,
            getNodeFields,
            removeNodeFields,
            getNodeInfo,
            removeNode,
            clear,
            nodeInfo,
            nodeFields,
        };
    },
    {},
);
