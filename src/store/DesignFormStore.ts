import {defineStore} from "pinia";
import {SearchParams} from "@/components/types/Params";
import {loadData} from "@/api/sh_api.ts";
import {SelectOption} from "@/components/types/SearchProps";
import {Config} from "@/api/settings.ts";
import {ref, unref} from "vue";

export const DesignForm: any = defineStore("DesignForm", () => {
    const containerList = ref<Array<any>>([]);
    const formDataList = ref<Array<any>>([]);
    const selfFormDataList = ref<Array<any>>([]);
    const allFormDataList = ref<Array<any>>([]);
    const formInfo = ref<any>({});
    const compList = ref<any>([]);
    const formData = ref<any>({});
    const currentComp = ref<Array<any> | any>();
    const currentItemType = ref<string>("");
    const currentCompCategory = ref<string>("");
    const parentCompType = ref<string>("");
    const currentItemId = ref<string>("");
    const currentSubItemId = ref<string>("");
    const isEdit = ref<boolean>(false);
    const refresh = ref<number>(0);
    const currentFormPreps = ref<any>({});
    const draggingItem = ref<any>({});
    const historyRecord = ref<any>({
        index: -1,
        maxStep: 20,
        datas: [],
    });


    /**
     * 添加历史记录
     * @param reOrUnDoFlag 是否点击按钮时触发
     */
    const addHistoryRecord = (reOrUnDoFlag: boolean) => {
        if (reOrUnDoFlag || compList.value.length == 0) {
            console.log("不需要添加历史记录");
            return;
        }
        const record = historyRecord;
        const recordData: any = {
            complist: unref(compList),
            currentCompCategory: unref(currentCompCategory),
            currentItemId: unref(currentItemId),
            parentCompType: unref(parentCompType),
            currentItemType: unref(currentItemType),
            currentFormPreps: unref(currentFormPreps),
        }
        record.value.index = -1;
        record.value.datas.splice(0, 0, JSON.stringify(recordData));
        //数据只存20条，当大于20条时，删除最旧的一条
        if (record.value.datas.length > record.value.maxStep) {
            record.value.datas.splice(record.value.datas.length - 1, 1);
        }
        console.log(record);
    }
    /**
     * 下一步
     */
    const redo = () => {
        //数据本身就是最新的
        if (historyRecord.value.index < 0) {
            return;
        }
        historyRecord.value.index = historyRecord.value.index - 1;
        reAndUnDo();

    }

    const reAndUnDo = () => {
        const record = unref(historyRecord);
        if (!record.datas[record.index]) {
            currentFormPreps.value = {};
            currentItemType.value = "";
            currentComp.value = {};
            currentItemId.value = "";
            parentCompType.value = "";
            currentCompCategory.value = "";
            compList.value = [];
        } else {
            const data = JSON.parse(record.datas[record.index]);
            setCompList(data.complist);
            currentCompCategory.value = data.currentCompCategory;
            currentItemId.value = data.currentItemId;
            parentCompType.value = data.parentCompType;
            currentItemType.value = data.currentItemType;
            currentFormPreps.value = data.currentFormPreps;
        }
    }

    /**
     * 上一步
     */
    const undo = () => {
        const record = unref(historyRecord);
        console.log(record);
        historyRecord.value.index = record.index < 0 ? 1 : record.index + 1;
        //上一步大于已存在的数据量
        if (historyRecord.value.index > record.datas.length) {
            historyRecord.value.index = record.datas.length - 1;
        }
        //达到最大步骤，取允许的最大数据
        if (historyRecord.value.index > record.maxStep) {
            historyRecord.value.index = record.maxStep;
        }
        reAndUnDo();
    }
    /**
     * 激活组件的数下
     * @param data 数据
     * @param itemType 数据类型
     * @param parentType 父组件类型
     */
    const selectItem = (data: any, itemType: string, parentType: string) => {

        currentCompCategory.value = data.compType;
        currentItemId.value = data?.id;
        parentCompType.value = parentType;
        currentItemType.value = itemType || data.itemType;
        currentFormPreps.value = data.preps || data;
    }
    /**
     * 刷新页面
     */
    const setRefresh = () => {
        refresh.value++;
    }
    /**
     * 选中子组件
     * @param subItemId
     */
    const setSubItemId = (subItemId: string) => {
        currentSubItemId.value = subItemId;
    }
    /**
     * 设置表单信息
     * @param formData
     */
    const setFormInfo = (formData: any) => {
        formInfo.value = {
            ...unref(formInfo),
            ...formData
        };
    }
    const setCompList = (comps: Array<any>) => {
        compList.value = comps;
    }
    /**
     * 获取属性列表
     */
    const loadCompNames = () => {
        const innerFunc = (datas: Array<any>) => {
            let selectList: Array<any> = [];
            for (let index in datas) {
                let temp: any = datas[index];
                if (temp.itemType == "box" || temp.itemType == "dytable") {
                    let elements = temp.preps.elements;
                    for (let sindex in elements) {
                        let columns = elements[sindex].columns;
                        for (let ssindex in columns) {
                            let column = columns[ssindex];
                            console.log(column)
                            if (column.items && column.items.length > 0) {
                                selectList.push(...column.items?.map((item: any) =>
                                    ({name: item.preps?.label, type: "item", value: item.preps?.name}))
                                    .filter((item: SelectOption) => item.name));
                            }
                        }
                    }
                } else if (temp.itemType == "table") {
                    let elements = temp.preps.elements;
                    let children: SelectOption[] = [];
                    for (let index in elements) {
                        let element = elements[index];
                        if (element.items && element.items.length > 0) {
                            children.push(...element.items?.map((item: any) =>
                                ({name: item.preps?.label, value: item.preps?.name}))
                                .filter((item: SelectOption) => item.name))
                        }
                    }
                    selectList.push({
                        name: temp.preps?.label,
                        value: temp.preps?.batchFieldName,
                        type: "container",
                        children: children
                    });

                } else if (temp.itemType == "tab" || temp.itemType == "collapse" || temp.itemType == "card") {
                    let elements = temp.preps?.elements;
                    for (let index in elements) {
                        let element = elements[index];
                        selectList.push({
                            name: element.label,
                            value: element.objectName,
                            type: "container",
                            children: innerFunc(element.items)
                        })
                    }
                } else {
                    selectList.push({
                        name: temp.preps?.label,
                        value: temp.preps?.name,
                        type: "item",
                    });
                }

            }
            return selectList;
        }
        console.log(JSON.stringify(compList.value));
        return innerFunc(compList.value);
    }

    /**
     * 手动添加组件
     * @param comp
     */
    const addComp = (comp: any) => {
        //如果已存在，则要过滤掉,不能重复添加
        if (comp instanceof Array) {
            compList.value = [...compList.value, ...comp];
        } else {
            compList.value.push(comp);
        }
    }
    const setFormData = (data: any) => {
        formData.value = data;
    }
    const setIsEdit = (editFlag: boolean) => {
        isEdit.value = editFlag;
    }
    const setCurrentComp = (currComp: object) => {
        currentComp.value = currComp;
    }
    const setCurrentItemType = (currItemType: string) => {
        currentItemType.value = currItemType;
    }
    const setParentCompType = (parentType: string) => {
        parentCompType.value = parentType;
    }
    const setCurrentItemId = (currItemId: string) => {
        currentItemId.value = currItemId;
    }
    const setCurrentFormPreps = (currFormPreps: any) => {
        currentFormPreps.value = currFormPreps["preps"] || currFormPreps;
    }
    /**
     * 正在拖动中的组件
     * @param dragItem
     */
    const setDraggingItem = (dragItem: any) => {
        draggingItem.value = dragItem;
    }
    /**
     * 删除数据
     */
    const removePromise = () => {
        const comps = unref(compList);
        for (let i = 0; i < comps.length; i++) {
            const temp = comps[i];
            if (temp instanceof Promise) {
                temp.then(res => {
                    if (res instanceof Array) {
                        comps.splice(i, 1, ...res);
                    } else {
                        comps.splice(i, 1, res);
                    }
                })
            }
        }
        // compList = [...JSON.parse(JSON.stringify(comps))];
    }
    /**
     * 清除所有数据
     */
    const clearAll = (initComp: boolean = true) => {
        const ms = new Date().getTime();
        isEdit.value = true;
        currentFormPreps.value = {};
        currentItemType.value = "";
        currentComp.value = {};
        currentItemId.value = "";
        currentItemType.value = "";
        parentCompType.value = "";
        currentCompCategory.value = "";
        formInfo.value = {
            rules: "",
            inline: "N",
            labelPosition: "left",
            labelWidth: "",
            labelSuffix: "",
            hideRequiredAsterisk: "N",
            requireAsteriskPosition: "left",
            showMessage: "Y",
            inlineMessage: "N",
            statusIcon: "N",
            primaryKeyPolicy: "manual",
            createTable: "Y",
            validateOnRuleChange: "Y",
            size: Config.compSize,
            disabled: "N",
            index: 1,
            scrollToError: "N",
            formId: "id" + ms,
            tbName: "tb" + ms
        };
        compList.value = [];
        formData.value = {index: 1};
        historyRecord.value = {
            index: -1,
            maxStep: 20,
            datas: []
        };
        if (initComp) {
            const url = "/userdb-manage/userdb/dynamicFormItems/getAllByCondition";
            const initContainer = async () => {
                const params: SearchParams[] = [{
                    propertyName: "category",
                    value: 2
                }, {
                    propertyName: "isDel",
                    value: 0
                }];
                const query = {
                    fieldList: params,
                    orderBy: [{fieldName: "dataSort", ascOrDesc: "asc"}]
                }
                const result = await loadData(url, query);
                containerList.value = result.data;
            };
            const initItems = async () => {
                const params: SearchParams[] = [{
                    propertyName: "category",
                    value: 1
                }, {
                    propertyName: "isDel",
                    value: 0
                }];
                const query = {
                    fieldList: params,
                    orderBy: [{fieldName: "dataSort", ascOrDesc: "asc"}]
                }
                const result = await loadData(url, query);
                formDataList.value = result.data;
            };
            const initSelfItems = async () => {
                const params: SearchParams[] = [{
                    propertyName: "category",
                    value: 3
                }, {
                    propertyName: "isDel",
                    value: 0
                }];
                const query = {
                    fieldList: params,
                    orderBy: [{fieldName: "dataSort", ascOrDesc: "asc"}]
                }
                const result = await loadData(url, query);
                selfFormDataList.value = result.data;
            };
            const init = async () => {

                await initContainer();
                await initItems();
                await initSelfItems();
                const temp: Array<any> = [];
                if (formDataList.value) {
                    temp.push(...formDataList.value);
                }
                if (selfFormDataList) {
                    temp.push(...selfFormDataList.value);
                }
                temp.forEach((item: any) => {
                    allFormDataList.value.push({
                        name: item.itemName,
                        value: item.itemType
                    })
                });
            };
            init();
        }
    }

    return {
        formData,
        formInfo,
        compList,
        containerList,
        formDataList,
        selfFormDataList,
        allFormDataList,
        currentCompCategory,
        currentItemId,
        parentCompType,
        currentItemType,
        currentFormPreps,
        currentSubItemId,
        isEdit,
        currentComp,
        draggingItem,
        refresh,
        historyRecord,
        addHistoryRecord,
        redo,
        undo,
        selectItem,
        setRefresh,
        setSubItemId,
        setFormInfo,
        setCompList,
        loadCompNames,
        addComp,
        setFormData,
        setIsEdit,
        setCurrentComp,
        setCurrentItemType,
        setParentCompType,
        setCurrentItemId,
        setCurrentFormPreps,
        setDraggingItem,
        removePromise,
        clearAll
    }
});
