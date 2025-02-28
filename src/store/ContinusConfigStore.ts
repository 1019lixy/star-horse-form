import { defineStore } from "pinia";
import { ref } from "vue";

export const continusConfig = defineStore(
  "continusConfig",
  () => {
    /**
     * 节点信息
     */
    const nodeInfo = ref<any>({});

    const addNodeInfo = (nodeName: string, data: any) => {
      nodeInfo.value[nodeName] = data;
    };
    const removeNode = (nodeName: string) => {
      delete nodeInfo.value[nodeName];
    };
    const clear = () => {
      nodeInfo.value = {};
    };
    return {
      addNodeInfo,
      removeNode,
      clear,
      nodeInfo
    };
  },
  {}
);
