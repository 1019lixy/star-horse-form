import {nextTick, reactive, Ref, ref} from "vue";
import {FieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {dictData, loadData, searchMatchList} from "@/api/sh_api.ts";
import {ascOrDesc, dataType, httpMethod, validDataUrl} from "@/api/system.ts";
import {error, success, warning} from "@/utils/message.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store";

const designForm = DesignForm(piniaInstance);

const helpMsg = `
    接口返回的数据格式必须是：
        {
        "data": {
            "pageSize": 0,
            "currentPage": 0,
            "totalDatas": 34,
            "totalPages": 4,
            "dataList": [ {} ]
        },
        "code": 0, //0 表示数据正常 
        "message": "success",
        "cnMessage": "操作成功"
    }或者：
    {
        "data":  [ {} ],
        "code": 0, //0 表示数据正常 
        "message": "success",
        "cnMessage": "操作成功"
    }
    `;

/**
 * 验证接口
 * @param formProps
 * @param dataSourceRef
 * @param recall
 * @param validForm
 */
export async function validInterface(formProps: any, dataSourceRef: Ref<any>, recall: Function, validForm: boolean = true) {
    let flag = false;
    let dataList: SelectOption[] = [];
    const refName = dataSourceRef?.value || dataSourceRef;
    if (!refName) {
        return false;
    }
    const temp = refName.getFormData().value;
    if (validForm) {
        await nextTick();
        await dataSourceRef?.value?.$refs.starHorseFormRef.validate((res: boolean) => {
            flag = res;
        });
        if (!flag) {
            return flag;
        }
        for (const key in temp) {
            formProps.value[key] = temp[key];
        }
    }
    const dataSource = temp['dataSource'];
    const urlOrDictName = temp['urlOrDictName'];
    const queryParams = temp['queryParams'];
    let validErrorMsg: string = "";
    let validSuccessMsg: string = "";
    if (dataSource == "url") {
        const requestParams = [] as any;
        queryParams?.forEach((item: any) => {
            if (!item.name) {
                return;
            }
            requestParams.push({
                propertyName: item.name,
                value: item.value,
                operation: item.matchType
            });
        });
        let url = temp["preinterfaceUrl"] + temp["interfaceUrl"];
        const params = {
            url: url,
            httpMethod: temp.httpMethod || "POST",
            dataType: temp.dataType || "JSON",
            searchInfo: {
                fieldList: requestParams
            }
        }
        url = "/system-config/redirect/execute";
        const validResult = await loadData(url, params);
        if (validResult.error) {
            flag = false;
            validErrorMsg = validResult.error;
        } else {
            validSuccessMsg = "验证成功";
            dataList = validResult.data;
        }
    } else if (dataSource == "dict") {
        const dicts = await dictData(urlOrDictName);
        if (Object.keys(dicts).length == 0) {
            flag = false;
            validErrorMsg = "验证失败\n数据字典可能未配置";
        } else {
            dataList = dicts;
            validSuccessMsg = "验证成功";
        }
    } else {
        //静态数据
        const datas = temp['values'] as SelectOption[];
        if (Object.keys(datas).length == 0) {
            flag = false;
            validErrorMsg = "验证失败\n请设置数据";
        } else {
            dataList = datas;
            validSuccessMsg = "验证成功";
        }
    }
    if (recall) {
        recall(dataList, validSuccessMsg, validErrorMsg);
    }
    return flag;
}

/**
 * 创建数据
 * @param dataSourceRef
 * @param dataList
 * @param needDynamicData
 */
export function createData(dataSourceRef: any, dataList: any, needDynamicData: boolean = false) {
    const refName = dataSourceRef.value || dataSourceRef;
    const temp = refName.getFormData().value;
    let reDataList: SelectOption[] = [];
    const dataSource = temp['dataSource'];
    let errorMsg = "";
    if (dataSource == "data") {
        reDataList = dataList;
    } else {
        if (dataSource == "url") {
            const element = dataList[0];
            const keys = Object.keys(element);
            if (!(keys.find(item => item == temp["selectLabel"]))) {
                errorMsg = "验证失败\n【标签名字段】错误：" + JSON.stringify(keys);
            } else if (!(keys.find(item => item == temp["selectValue"]))) {
                errorMsg = "验证失败\n【标签值字段】错误：" + JSON.stringify(keys);
            } else {
                dataList.forEach((item: any) => {
                    reDataList.push({name: item[temp["selectLabel"]], value: item[temp["selectValue"]]});
                });
            }
        } else {
            reDataList = dataList;
        }
        if (!needDynamicData) {
            reDataList = [];
        }
    }
    return {
        reDataList, errorMsg
    }
}

const validOperation = async (val: any, dataSourceRef: Ref<any>, fieldList: Ref<any>, disableUrl: Ref<any>) => {
    await validInterface(val, dataSourceRef, (dataList: any, successMsg: string, errorMsg: string) => {
        if (dataList && !disableUrl.value) {
            const temp = dataList[0];
            const keys = Object.keys(temp);
            console.log(temp, keys);
            fieldList.value = [];
            for (const ind in keys) {
                fieldList.value.push({name: keys[ind], value: keys[ind]})
            }
        }
        if (successMsg) {
            success(successMsg);
        }
        if (errorMsg) {
            error(errorMsg);
        }
        // if (recall) {
        //     recall(dataList, successMsg, errorMsg);
        // }
    }, false)
};

/**
 * 数据源属性配置
 */
export function dataSourceFields(dataSourceRef: Ref<any>, _recall: Function) {
    const dataSourceList: Array<SelectOption> = [
        {value: "url", name: "动态接口"},
        {value: "dict", name: "数据字典"},
        {value: "data", name: "静态数据"},
    ];
    const matchTypeList = searchMatchList();
    const disableData = ref<boolean>(false);
    const disableUrl = ref<boolean>(true);
    const disableDict = ref<boolean>(true);
    const dataRequired = ref<boolean>(true);
    const urlRequired = ref<boolean>(false);
    const dictRequired = ref<boolean>(false);
    const currentTabName = ref<string>("data");
    const fieldList = ref<SelectOption[]>([]);
    return reactive<PageFieldInfo | any>({
        fieldList: [
            [{
                label: "表单属性",
                fieldName: "label",
                type: "text",
                formShow: true,
                tableShow: true,
            },
                {
                    label: "数据源类型",
                    fieldName: "dataSource",
                    type: "select",
                    required: true,
                    formShow: true,
                    tableShow: true,
                    optionList: dataSourceList,
                    actionName: "change",
                    actions: (val: any) => {
                        console.log(val);
                        const type = val["dataSource"];
                        disableData.value = true;
                        disableUrl.value = true;
                        disableDict.value = true;
                        dataRequired.value = false;
                        urlRequired.value = false;
                        dictRequired.value = false;
                        currentTabName.value = type;
                        if (type == "url") {
                            disableUrl.value = false;
                            urlRequired.value = true;
                        } else if (type == "data") {
                            disableData.value = false;
                            dataRequired.value = true;
                        } else if (type == "dict") {
                            disableDict.value = false;
                            dictRequired.value = true;
                        }
                    },
                }],
            {
                fieldName: currentTabName,
                tabList:
                    [{
                        title: "静态数据",
                        tabName: "data",
                        disabled: disableData,
                        batchFieldList: [{
                            batchName: "values",
                            fieldList: [{
                                label: "属性名",
                                fieldName: "name",
                                type: "input",
                                required: dataRequired,
                                formShow: true,
                                tableShow: true,
                            }, {
                                label: "属性值",
                                fieldName: "value",
                                type: "input",
                                required: dataRequired,
                                formShow: true,
                                tableShow: true,
                            }]
                        }]
                    }, {
                        title: "动态接口参数",
                        tabName: "url",
                        disabled: disableUrl,
                        fieldList: [
                            [{
                                label: "接口地址",
                                fieldName: "interfaceUrl",
                                type: "input",
                                defaultValue: {"preinterfaceUrl": "http://"},
                                required: urlRequired,
                                helpMsg: helpMsg,
                                formShow: true,
                                preps: {
                                    colspan: 16,
                                    prependList: [
                                        {name: "HTTP", value: "http://"},
                                        {name: "HTTPS", value: "https://"}],
                                    appendAction: {
                                        icon: "valid",
                                        actions: async (val: any) => {
                                            await validOperation(val, dataSourceRef, fieldList, disableUrl);
                                        }
                                    }
                                }
                            },
                                {
                                    label: "请求方式",
                                    fieldName: "requestType",
                                    type: "select",
                                    required: urlRequired,
                                    defaultValue: "POST",
                                    formShow: true,
                                    tableShow: true,
                                    optionList: httpMethod(),
                                    preps: {
                                        colspan: 8
                                    }
                                }],
                            [{
                                label: "标签名字段",
                                fieldName: "selectLabel",
                                type: "select",
                                optionList: fieldList,
                                required: urlRequired,
                                formShow: true,
                                tableShow: true,
                            },
                                {
                                    label: "标签值字段",
                                    fieldName: "selectValue",
                                    type: "select",
                                    optionList: fieldList,
                                    required: urlRequired,
                                    formShow: true,
                                    tableShow: true,
                                }]],
                        batchFieldList: [
                            {
                                batchName: "queryParams",
                                title: "参数",
                                fieldList: [{
                                    label: "参数名",
                                    fieldName: "name",
                                    type: "select",
                                    optionList: fieldList,
                                    required: urlRequired,
                                    formShow: true,
                                    tableShow: true,
                                }, {
                                    label: "参数值",
                                    fieldName: "value",
                                    type: "input",
                                    required: urlRequired,
                                    formShow: true,
                                    tableShow: true,
                                }, {
                                    label: "匹配方式",
                                    fieldName: "matchType",
                                    type: "select",
                                    defaultValue: "eq",
                                    required: urlRequired,
                                    formShow: true,
                                    tableShow: true,
                                    optionList: matchTypeList,
                                },]
                            }]
                    },
                        {
                            title: "数据字典",
                            tabName: "dict",
                            disabled: disableDict,
                            fieldList: [{
                                label: "字典名称",
                                fieldName: "urlOrDictName",
                                type: "input",
                                required: dictRequired,
                                formShow: true,
                                tableShow: true,
                                preps: {
                                    appendAction: {
                                        icon: "valid",
                                        actionTitle: "验证",
                                        actions: async (val: any) => {
                                            await validOperation(val, dataSourceRef, fieldList, disableUrl);
                                        }
                                    }
                                }
                            }]
                        },
                    ],
            }
        ],
    });
}

/**
 * 组件参数属性配置
 * @param fieldName
 * @param item
 */
export function paramsFields(fieldName: string, item: any) {
    console.log(fieldName, item);
    const datas = [...item['advancedFields'], ...item['fields']];
    let currentData: Array<any> = [];
    datas.forEach(item => {
        if (item.fieldName == fieldName) {
            currentData = item.configParams;
            return false;
        }
    });
    const fields: Array<any> = [];
    const fieldList = ref<SelectOption[]>([]);
    const urlBaseInfo: FieldInfo[] = [
        {
            fieldName: "preinterfaceUrl",
            type: "input",
            formShow: false,
            defaultValue: "http://",
            preps: {
                colspan: -1
            }
        },
        {
            label: "接口地址",
            fieldName: "interfaceUrl",
            type: "input",
            required: true,
            helpMsg: helpMsg,
            formShow: true,
            preps: {
                colspan: 24,
                prependList: [
                    {name: "HTTP", value: "http://"},
                    {name: "HTTPS", value: "https://"}]
            }
        },
    ];
    const dataUrls: FieldInfo[] = [
        {
            label: "请求方式",
            fieldName: "httpMethod",
            type: "select",
            defaultValue: "POST",
            required: true,
            optionList: httpMethod(),
            formShow: true,
            preps: {
                colspan: 10
            }
        },
        {
            label: "请求数据格式",
            fieldName: "dataType",
            type: "select",
            defaultValue: "JSON",
            formShow: true,
            required: true,
            optionList: dataType(),
            preps: {
                colspan: 10
            }
        },
        {
            label: "主键",
            fieldName: "primaryKey",
            type: "select",
            helpMsg: "在列表中需用到",
            formShow: true,
            required: true,
            optionList: fieldList,
            preps: {
                colspan: 10
            }
        },
        {
            label: "验证",
            fieldName: "urlValid",
            type: "button",
            actions: async (val: any) => {
                if (!val["interfaceUrl"]) {
                    return;
                }
                const url = val["preinterfaceUrl"] + val["interfaceUrl"];
                const result = await validDataUrl(url, {});
                const datas: any = result.data;
                const error = result.error;
                if (error) {
                    warning(error);
                    return;
                }
                const data = datas.dataList[0];
                const keys = Object.keys(data);
                fieldList.value = [];
                for (const ind in keys) {
                    fieldList.value.push({name: keys[ind], value: keys[ind]})
                }
            },
            required: true,
            formShow: true,
            preps: {
                colspan: 4,
            }
        }
    ];
    const orderBys: FieldInfo[] = [
        {
            label: "列名",
            fieldName: "fieldName",
            type: "input",
            formShow: true,
        },
        {
            label: "排序",
            fieldName: "ascOrDesc",
            type: "select",
            formShow: true,
            optionList: ascOrDesc()
        }];
    const fieldLists: FieldInfo[] = [{
        label: "列名",
        fieldName: "label",
        type: "input",
        formShow: true,
    }, {
        label: "属性名称",
        fieldName: "fieldName",
        type: "select",
        allowCreate: true,
        optionList: fieldList,
        formShow: true,
    }, {
        label: "搜索显示",
        fieldName: "searchFlag",
        type: "switch",
        defaultValue: "Y",
        formShow: true,
    }];
    const needFields: FieldInfo[] = [{
        label: "原属性名",
        fieldName: "sourceField",
        type: "select",
        optionList: fieldList,
        formShow: true,
    }, {
        label: "目标属性名",
        fieldName: "distField",
        type: "input",
        formShow: true,
    }];
    const otherField: FieldInfo[] = [];
    const fieldInfos: string[] = ["dataUrl", "orderby", "fieldList", "needField"];
    for (const index in currentData) {
        const temp = currentData[index];
        if (!fieldInfos.includes(temp.fieldName)) {
            otherField.push({
                label: temp.label,
                fieldName: temp.fieldName,
                type: "input",
                tableShow: true,
            });
        }
    }
    fields.push(urlBaseInfo);
    fields.push(dataUrls);
    if (otherField) {
        fields.push(...otherField);
    }
    const tabInfo = {
        tabList: [{
            title: "属性配置",
            tabName: "0",
            fieldName: "tabName",
            batchFieldList: [{
                title: "显示属性",
                batchName: "fieldLists",
                fieldList: fieldLists
            }, {
                title: "回调字段",
                batchName: "needField",
                fieldList: needFields
            }, {
                title: "接口排序",
                batchName: "orderBy",
                fieldList: orderBys
            }]
        },]
    };
    fields.push(tabInfo);
    return reactive<PageFieldInfo | any>({
        fieldList: fields
    });
}

/**
 * 容器属性
 */
export function containerField(fieldName: string) {
    const tabFields = {
        title: "Tab属性",
        tabName: "tab",
        batchFieldList: [{
            batchName: "elements",
            fieldList: [{
                label: "Tab名字",
                fieldName: "label",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
            }, {
                label: "主键",
                fieldName: "tabName",
                helpMsg: `默认作为tab组件的名称，
                当设置对应关系时,系统作为表的主键`,
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
            }, {
                label: "对象名字",
                fieldName: "objectName",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
            }, {
                label: "是否子表",
                fieldName: "subFormFlag",
                type: "switch",
                defaultValue: "Y",
                required: true,
                formShow: true,
                tableShow: true,
            }]
        }]
    };
    const collapseFields = {
        title: "Collapse属性",
        tabName: "collapse",
        batchFieldList: [{
            batchName: "elements",
            fieldList: [{
                label: "Collapse名字",
                fieldName: "label",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
            }, {
                label: "主键",
                fieldName: "tabName",
                helpMsg: `默认作为Collapse组件的名称，
                当设置对应关系时,系统作为表的主键`,
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
            }, {
                label: "对象名字",
                fieldName: "objectName",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
            }, {
                label: "是否子表",
                fieldName: "subFormFlag",
                type: "switch",
                defaultValue: "Y",
                required: true,
                formShow: true,
                tableShow: true,
            }]
        }]
    };

    const boxFields = {
        title: "栅格属性",
        tabName: "box",
        batchFieldList: [{
            batchName: "elements",
            fieldList: [{
                label: "列",
                fieldName: "colIndex",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
                batchFieldList: [{
                    batchName: "columns",
                    batchDefaultData: {items: []},
                    fieldList: [{
                        label: "列宽",
                        fieldName: "colspan",
                        type: "number",
                        defaultValue: 24,
                        required: true,
                        formShow: true,
                        tableShow: true,
                        actionName: "change",
                        preps: {
                            min: 1,
                            max: 24,
                            step: 4,
                        },
                        actions: (val: any, type: string) => {
                            const obj = val.value || val;
                            const cols = obj.columns;
                            if (type == "oper") {
                                const len = 24 / cols.length;
                                cols.forEach((item: any) => {
                                    item.colspan = len;
                                })
                            }
                        }
                    }]
                }]
            }]
        }]
    };
    const dyTableFields = {
        title: "动态表格属性",
        tabName: "dytable",
        batchFieldList: [{
            batchName: "elements",
            fieldList: [{
                label: "列",
                fieldName: "colIndex",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
                batchFieldList: [{
                    batchName: "columns",
                    batchDefaultData: {items: []},
                    fieldList: [{
                        label: "列宽",
                        fieldName: "colWidth",
                        type: "number",
                        defaultValue: 100,
                        required: true,
                        formShow: true,
                        tableShow: true,
                        actionName: "change",
                        preps: {
                            min: 10,
                            max: 100,
                            step: 2,
                        },
                        actions: (val: any, type: string) => {
                            const obj = val.value || val;
                            const cols = obj.columns;
                            if (type == "oper") {
                                const len = 100 / cols.length;
                                cols.forEach((item: any) => {
                                    item.colWidth = len;
                                })
                            }
                        }
                    }, {
                        label: "行高",
                        fieldName: "colHeight",
                        type: "number",
                        defaultValue: 30,
                        required: true,
                        formShow: true,
                        tableShow: true,
                        actionName: "change",
                        preps: {
                            min: 30,
                            max: 100,
                            step: 1,
                        }
                    }]
                }]
            }]
        }]
    };
    const fields: any = {
        tab: tabFields,
        collapse: collapseFields,
        box: boxFields,
        dytable: dyTableFields
    }
    return reactive<PageFieldInfo | any>({
        fieldList: [{
            fieldName: fieldName,
            tabList: [fields[fieldName]]
        }]
    });
}

/**
 * 关联
 */
export function relationDataField() {
    let fields: SelectOption[] = designForm.loadCompNames();
    let eventList: SelectOption[] = [
        {name: "Change", value: "change"},
        {name: "Input", value: "input"},
    ];
    let controlConditionList: SelectOption[] = [
        {name: "作为查询条件", value: "query"},
        {name: "等于指定值隐藏", value: "eqHide"},
        {name: "等于指定值隐藏否则显示", value: "eqHideOrShow"},
        {name: "等于指定值显示", value: "eqShow"},
        {name: "等于指定值显示否则隐藏", value: "eqShowOrHide"},
    ];
    return reactive<PageFieldInfo | any>({
        fieldList: [
            {
                label: "触发事件",
                fieldName: "eventName",
                type: "select",
                optionList: eventList,
                defaultValue: "change",
                required: true,
                formShow: true,
                tableShow: true,
            },
            {
                batchFieldList: [
                    {
                        batchName: "relationDetails",
                        fieldList: [{
                            label: "控制条件",
                            fieldName: "controlCondition",
                            type: "select",
                            optionList: controlConditionList,
                            required: true,
                            formShow: true,
                            tableShow: true,
                        }, {
                            label: "被控制属性",
                            fieldName: "relationFields",
                            type: "tselect",
                            optionList: fields,
                            required: true,
                            formShow: true,
                            tableShow: true,
                            preps: {
                                checkStrictly: "Y"
                            }
                        }, {
                            label: "参数",
                            fieldName: "params",
                            type: "input",
                            required: false,
                            formShow: true,
                            tableShow: true,
                        }]
                    }
                ]
            }
        ]
    });
}

