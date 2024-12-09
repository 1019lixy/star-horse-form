import {defineStore} from "pinia";
import {Ref, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

/**
 * 用户自定义方法处理逻辑
 */
export const copyerOperation = defineStore("copyerOperation", () => {
    //执行的动作
    const action = ref<string>("");
    //父级容器
    const parentContainer = ref<any>({});
    //拷贝数据
    const copyerData = ref<any>({});
    /**
     * 执行操作
     * @param act 操作动作
     * @param container 父级容器
     * @param data 数据
     */
    const operation = (act: string, container: any, data: any) => {
        action.value = act;
        parentContainer.value = container;
        copyerData.value = data;
    }
    //设置动作
    const setAction = (act: string) => {
        action.value = act;
    }
    //设置父级容器
    const setParentContainer = (container: any) => {
        parentContainer.value = container;
    }
    //设置拷贝数据
    const setCopyerData = (data: any) => {
        copyerData.value = data;
    }
    //清除所有数据
    const clearAll = () => {
        action.value = "";
        parentContainer.value = {};
        copyerData.value = {};
    }

    return {
        action, parentContainer, copyerData,
        operation, setAction, setParentContainer,
        setCopyerData, clearAll
    }
});
