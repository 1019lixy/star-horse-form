import {defineStore} from "pinia";

export const useFlowDesign = defineStore("flowDesign", () => {
    /**
     * 流程信息
     */
    let flowForm = ref<any>({});
    /**
     * 节点属性
     */
    let propertiesForm = ref<any>({});
    const setFlowForm = (data: any) => {
        flowForm.value = data;
    };
    const addNodeProp = (nodeId: string, data: any) => {
        propertiesForm.value[nodeId] = data;
    }
    const deleteNodeProp = (nodeId: string) => {
        delete propertiesForm.value[nodeId];
    }
    return {
        flowForm,
        propertiesForm,
        setFlowForm,
        addNodeProp,
        deleteNodeProp
    }
}, {
    persist: {
        enabled: false
    }
});
