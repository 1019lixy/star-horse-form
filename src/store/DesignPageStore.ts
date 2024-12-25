import {defineStore} from "pinia";
import {ref} from "vue";
import {DynamicNode} from "@/components/types/DynamicNode";

export const DesignPage = defineStore("DesignPage", () => {
        const nodeList = ref<Array<DynamicNode>>([]);
        const currentNode = ref<DynamicNode>({});
        const isEdit = ref<boolean>(false);
        /**
         * 清除所有数据
         */
        const clearAll = () => {
            isEdit.value = true;
            nodeList.value = [];
            currentNode.value = null;
        }
        const removeNode = (id: string) => {
            nodeList.value = nodeList.value.filter((node: DynamicNode) => {
                return node.id != id;
            });
        }
        const setNodeList = (list: Array<DynamicNode>) => {
            nodeList.value = list;
        }
        const addNode = (node: DynamicNode) => {
            nodeList.value.push(node);
        }
        const selectNode = (node: DynamicNode) => {
            currentNode.value = node;
        }
        return {
            nodeList,
            currentNode,
            isEdit,
            setNodeList,
            removeNode,
            addNode,
            selectNode,
            clearAll,

        }
    }
);
