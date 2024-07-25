import {nextTick, reactive, Ref, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {dictData, loadData, searchMatchList} from "@/api/sh_api.ts";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ascOrDesc, dataType, httpMethod, validDataUrl} from "@/api/system.ts";
import {error, success, warning} from "@/utils/message.ts";
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
    }
    `;
/**
 * 验证接口
 * @param formProps
 * @param dataSourceRef
 * @param recall
 */
export async function validInterface(formProps: any, dataSourceRef: Ref<any>, recall: Function, validForm: boolean = true) {
    let flag = false;
    let dataList: SelectOption[] = [];
    let refName = dataSourceRef?.value || dataSourceRef;
    let temp = refName.getFormData().value;
    if (validForm) {
        await nextTick();
        await dataSourceRef?.value?.$refs.starHorseFormRef.validate((res: boolean) => {
            flag = res;
        });
        if (!flag) {
            return flag;
        }
        for (let key in temp) {
            formProps.value[key] = temp[key];
        }
    }
    let dataSource = temp['dataSource'];
    let urlOrDictName = temp['urlOrDictName'];
    let queryParams = temp['queryParams'];
    let validErrorMsg: string = "";
    let validSuccessMsg: string = "";
    if (dataSource == "url") {
        let requestParams = [] as any;
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
        let params = {
            url: url,
            httpMethod: temp.httpMethod || "POST",
            dataType: temp.dataType || "JSON",
            searchInfo: {
                fieldList: requestParams
            }
        }
        url = "/system-config/redirect/execute";
        let validResult = await loadData(url, params);
        if (validResult.error) {
            flag = false;
            validErrorMsg = validResult.error;
        } else {
            dataList = validResult.data;
        }
    } else if (dataSource == "dict") {
        let dicts = await dictData(urlOrDictName);
        if (Object.keys(dicts).length == 0) {
            flag = false;
            validErrorMsg = "验证失败\n数据字典可能未配置";
        } else {
            dataList = dicts;
            validSuccessMsg = "验证成功";
        }
    } else {
        //静态数据
        let datas = temp['values'] as SelectOption[];
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
 */
export function createData(dataSourceRef: any, dataList: any) {
    let refName = dataSourceRef.value || dataSourceRef;
    let temp = refName.getFormData().value;
    let reDataList: SelectOption[] = [];
    let dataSource = temp['dataSource'];
    let errorMsg = "";
    if (dataSource == "url") {
        let element = dataList[0];
        let keys = Object.keys(element);
        if (!(keys.find(item => item == temp["selectLabel"]))) {
            errorMsg = "验证失败\n【标签名字段】错误：" + JSON.stringify(keys);
        } else if (!(keys.find(item => item == temp["selectValue"]))) {
            errorMsg = "验证失败\n【标签值字段】错误：" + JSON.stringify(keys);
        } else {
            dataList.forEach((item: any) => {
                reDataList.push({name: item[temp["selectLabel"]], value: item[temp["selectValue"]]});
            })
        }
    } else {
        reDataList = dataList;
    }
    return {
        reDataList, errorMsg
    }
}
/**
 * 数据源属性配置
 */
export function dataSourceFields(dataSourceRef: Ref<any>, recall: Function) {
    let dataSourceList: Array<SelectOption> = [
        {value: "url", name: "动态接口"},
        {value: "dict", name: "数据字典"},
        {value: "data", name: "静态数据"},
    ];
    let matchTypeList = searchMatchList();
    let disableData = ref<boolean>(false);
    let disableUrl = ref<boolean>(true);
    let disableDict = ref<boolean>(true);
    let dataRequired = ref<boolean>(true);
    let urlRequired = ref<boolean>(false);
    let dictRequired = ref<boolean>(false);
    let currentTabName = ref<String>("data");
    let fieldList = ref<SelectOption[]>([]);
    return reactive<PageFieldInfo | any>({
        fieldList: [
            [{
                label: "表单属性",
                fieldName: "label",
                type: "text",
                formShow: !false,
                tableShow: !false,
            },
                {
                    label: "数据源类型",
                    fieldName: "dataSource",
                    type: "select",
                    required: true,
                    formShow: !false,
                    tableShow: !false,
                    optionList: dataSourceList,
                    actionName: "change",
                    actions: (val: any) => {
                        console.log(val);
                        let type = val["dataSource"];
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
                }, {
                label: "验证",
                fieldName: "validBtn",
                type: "button",
                formShow: !false,
                tableShow: !false,
                actionName: "click",
                actions: async (val: any) => {
                    await validInterface(val, dataSourceRef, (dataList: any, successMsg: string, errorMsg: string) => {
                        if (dataList && !disableUrl.value) {
                            let temp = dataList[0];
                            let keys = Object.keys(temp);
                            console.log(temp, keys);
                            fieldList.value = [];
                            for (let ind in keys) {
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
                    }, false);
                }
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
                                formShow: !false,
                                tableShow: !false,
                            }, {
                                label: "属性值",
                                fieldName: "value",
                                type: "input",
                                required: dataRequired,
                                formShow: !false,
                                tableShow: !false,
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
                                    colSpan: 16,
                                    prependList: [
                                        {name: "HTTP", value: "http://"},
                                        {name: "HTTPS", value: "https://"}]
                                }
                            },
                                {
                                    label: "请求方式",
                                    fieldName: "requestType",
                                    type: "select",
                                    required: urlRequired,
                                    defaultValue: "POST",
                                    formShow: !false,
                                    tableShow: !false,
                                    optionList: httpMethod(),
                                    preps: {
                                        colSpan: 8
                                    }
                                }],
                            [{
                                label: "标签名字段",
                                fieldName: "selectLabel",
                                type: "select",
                                optionList: fieldList,
                                required: urlRequired,
                                formShow: !false,
                                tableShow: !false,
                            },
                                {
                                    label: "标签值字段",
                                    fieldName: "selectValue",
                                    type: "select",
                                    optionList: fieldList,
                                    required: urlRequired,
                                    formShow: !false,
                                    tableShow: !false,
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
                                    formShow: !false,
                                    tableShow: !false,
                                }, {
                                    label: "参数值",
                                    fieldName: "value",
                                    type: "input",
                                    required: urlRequired,
                                    formShow: !false,
                                    tableShow: !false,
                                }, {
                                    label: "匹配方式",
                                    fieldName: "matchType",
                                    type: "select",
                                    defaultValue: "eq",
                                    required: urlRequired,
                                    formShow: !false,
                                    tableShow: !false,
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
                                formShow: !false,
                                tableShow: !false,
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
export function paramsFields(fieldName: string, item: any, successMsg: Ref<any>, errorMsg: Ref<any>) {
    console.log(fieldName, item);
    let datas = [...item['advancedFields'], ...item['fields']];
    let currentData: Array<any> = [];
    datas.forEach(item => {
        if (item.fieldName == fieldName) {
            currentData = item.configParams;
            return false;
        }
    });
    let fields: FieldInfo[] = [];
    let fieldList = ref<SelectOption[]>([]);
    let urlBaseInfo: FieldInfo[] = [
        {
            fieldName: "preinterfaceUrl",
            type: "input",
            formShow: false,
            defaultValue: "http://",
            preps: {
                colSpan: -1
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
                colSpan: 24,
                prependList: [
                    {name: "HTTP", value: "http://"},
                    {name: "HTTPS", value: "https://"}]
            }
        },
    ];
    let dataUrls: FieldInfo[] = [
        {
            label: "请求方式",
            fieldName: "httpMethod",
            type: "select",
            defaultValue: "POST",
            required: true,
            optionList: httpMethod(),
            formShow: true,
            preps: {
                colSpan: 10
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
                colSpan: 10
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
                colSpan: 10
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
                let url = val["preinterfaceUrl"] + val["interfaceUrl"];
                let result = await validDataUrl(url, {});
                let datas: any = result.data;
                let error = result.error;
                if (error) {
                    warning(error);
                    return;
                }
                let data = datas.dataList[0];
                let keys = Object.keys(data);
                fieldList.value = [];
                for (let ind in keys) {
                    fieldList.value.push({name: keys[ind], value: keys[ind]})
                }
            },
            required: true,
            formShow: true,
            preps: {
                colSpan: 4,
            }
        }
    ];
    let orderBys: FieldInfo[] = [
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
    let fieldLists: FieldInfo[] = [{
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
    let needFields: FieldInfo[] = [{
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
    let otherField: FieldInfo[] = [];
    let fieldInfos: string[] = ["dataUrl", "orderby", "fieldList", "needField"];
    for (let index in currentData) {
        let temp = currentData[index];
        if (!fieldInfos.includes(temp.fieldName)) {
            otherField.push({
                label: temp.label,
                fieldName: temp.fieldName,
                type: "input",
                tableShow: !false,
            });
        }
    }
    fields.push(urlBaseInfo);
    fields.push(dataUrls);
    if (otherField) {
        fields.push(...otherField);
    }
    let tabInfo = {
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
    let tabFields = {
        title: "Tab属性",
        tabName: "tab",
        batchFieldList: [{
            batchName: "elements",
            fieldList: [{
                label: "Tab名字",
                fieldName: "label",
                type: "input",
                required: true,
                formShow: !false,
                tableShow: !false,
            }, {
                label: "主键",
                fieldName: "tabName",
                helpMsg: `默认作为tab组件的名称，
                当设置对应关系时,系统作为表的主键`,
                type: "input",
                required: true,
                formShow: !false,
                tableShow: !false,
            }, {
                label: "对象名字",
                fieldName: "objectName",
                type: "input",
                required: true,
                formShow: !false,
                tableShow: !false,
            }, {
                label: "是否子表",
                fieldName: "subFormFlag",
                type: "switch",
                defaultValue: "Y",
                required: true,
                formShow: !false,
                tableShow: !false,
            }]
        }]
    };
    let boxFields = {
        title: "栅格属性",
        tabName: "box",
        batchFieldList: [{
            batchName: "elements",
            fieldList: [{
                label: "列",
                fieldName: "colIndex",
                type: "input",
                required: true,
                formShow: !false,
                tableShow: !false,
                batchFieldList: [{
                    batchName: "columns",
                    batchDefaultData: {items: []},
                    fieldList: [{
                        label: "列宽",
                        fieldName: "colspan",
                        type: "number",
                        defaultValue: 24,
                        required: true,
                        formShow: !false,
                        tableShow: !false,
                        actionName: "change",
                        preps: {
                            min: 1,
                            max: 24,
                            step: 4,
                        },
                        actions: (val: any, type: string) => {
                            let obj = val.value || val;
                            let cols = obj.columns;
                            if (type == "oper") {
                                let len = 24 / cols.length;
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
    return reactive<PageFieldInfo | any>({
        fieldList: [{
            fieldName: fieldName,
            tabList: [fieldName == "tab" ? tabFields : boxFields]
        }]
    });
}
