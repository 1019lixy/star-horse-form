import {defineStore} from "pinia";
import {Ref, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

/**
 * 用户自定义方法处理逻辑
 */
export const useUserSelfOperation = defineStore("userSelfOperation", () => {
    const formFieldList = ref<PageFieldInfo>({});
    const fieldItemList = ref<any>({});
    const formData = ref<any>({});
    let formInstance = ref();
    /**
     * 设置表单信息
     * @param fieldList
     */
    const setFormFields = (fieldList: PageFieldInfo) => {
        formFieldList.value = fieldList;
    }
    const setFormInstance = (formRef: Ref) => {
        // console.log(formRef.value);
        formInstance.value = formRef.value;
    }
    /**
     * 设置实例数据
     * @param data
     */
    const setFormData = (data: any) => {
        formData.value = data;
    }
    /**
     * 添加
     * @param formItem
     */
    const addFormItem = (formItem: any) => {
        if (!formItem) {
            return;
        }
        fieldItemList.value[formItem.fieldName] = formItem;
    }

    /**
     * 批量添加
     * @param formItems
     */
    const addFormItemList = (formItems: Array<any>) => {
        if (!formItems) {
            return;
        }
        for (let index in formItems) {
            let formItem = formItems[index];
            fieldItemList.value[formItem.fieldName] = formItem;
        }

    }
    /**
     * 获取属性配置信息
     * @param fieldName
     */
    const getFormItem = (fieldName: string) => {
        return fieldItemList.value[fieldName] || {};
    }
    /**
     * 一个模块只能操作一个表单
     * 初始化数据
     */
    const init = (fieldList: PageFieldInfo, data: any, formRef: Ref) => {
        formFieldList.value = fieldList;
        fieldItemList.value = {};
        formData.value = data;
        formInstance = formRef;
    }
    return {formFieldList, fieldItemList, formInstance, formData, setFormInstance, setFormFields, setFormData, addFormItem, addFormItemList, getFormItem, init}
});
