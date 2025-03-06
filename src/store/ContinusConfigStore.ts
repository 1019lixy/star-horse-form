import {defineStore} from "pinia";
import {ref} from "vue";

export const continusConfig = defineStore(
    "continusConfig",
    () => {
        /**
         * 节点信息
         */
        const nodeInfo = ref<any>({});

        /**
         * 添加节点数据
         * @param nodeName
         * @param data
         */
        const addNodeInfo = (nodeName: string, data: any) => {
            if (nodeName) {
                nodeInfo.value[nodeName] = data;
            }
        };
        /**
         * 获取节点数据
         * @param nodeName
         */
        const getNodeInfo = (nodeName: string) => {
            return nodeInfo.value[nodeName];
        }
        /**
         * 移除节点数据
         * @param nodeName
         */
        const removeNode = (nodeName: string) => {
            delete nodeInfo.value[nodeName];
        };
        /**
         * 清空节点数据
         */
        const clear = () => {
            nodeInfo.value = {};
        };
        return {
            addNodeInfo,
            getNodeInfo,
            removeNode,
            clear,
            nodeInfo
        };
    },
    {}
);
