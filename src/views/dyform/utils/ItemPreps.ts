import {reactive, Ref, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {searchMatchList} from "@/api/sh_api.ts";
import {FieldInfo} from "../../../components/types/PageFieldInfo";
import {ascOrDesc, validDataUrl} from "../../../api/system.ts";
import {warning} from "../../../utils/message.ts";

/**
 * 数据源属性配置
 */
export function dataSourceFields() {
    let dataSourceList: Array<SelectOption> = [
        {value: "url", name: "动态接口"},
        {value: "dict", name: "数据字典"},
        {value: "data", name: "静态数据"},
    ];
    let requestTypeList: Array<SelectOption> = [
        {value: "post", name: "POST"},
        {value: "get", name: "GET"},
    ];
    let matchTypeList = searchMatchList();
    let disableData = ref<Boolean>(false);
    let disableUrl = ref<Boolean>(true);
    let disableDict = ref<Boolean>(true);
    let currentTabName = ref<String>("data");
    return reactive<PageFieldInfo | any>({
        fieldList: [
            [{
                label: "表单属性",
                fieldName: "label",
                type: "text",
                required: false,
                formShow: !false,
                tableShow: !false,
                minWidth: 180
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
                        currentTabName.value = type;
                        if (type == "url") {
                            disableUrl.value = false;
                        } else if (type == "data") {
                            disableData.value = false;
                        } else if (type == "dict") {
                            disableDict.value = false;
                        }
                    },
                    minWidth: 180
                }, {
                label: "验证",
                fieldName: "validBtn",
                type: "button",
                formShow: !false,
                tableShow: !false,
                minWidth: 180,
                actionName: "click",
                actions: (val) => {
                    console.log(val);
                }
            }],
            {
                fieldName: currentTabName,
                tabList: [{
                    title: "静态数据",
                    tabName: "data",
                    disabled: disableData,
                    batchFieldList: [{
                        batchName: "values",
                        fieldList: [{
                            label: "属性名",
                            fieldName: "name",
                            type: "input",
                            required: true,
                            formShow: !false,
                            tableShow: !false,
                            minWidth: 180
                        }, {
                            label: "属性值",
                            fieldName: "value",
                            type: "input",
                            required: true,
                            formShow: !false,
                            tableShow: !false,
                            minWidth: 180
                        }]
                    }]
                }, {
                    title: "动态接口参数",
                    tabName: "url",
                    disabled: disableUrl,
                    fieldList: [
                        [{
                            label: "接口地址",
                            fieldName: "values",
                            type: "input",
                            required: true,
                            formShow: !false,
                            tableShow: !false,
                            minWidth: 180
                        },
                            {
                                label: "请求方式",
                                fieldName: "requestType",
                                type: "select",
                                required: true,
                                formShow: !false,
                                tableShow: !false,
                                optionList: requestTypeList,
                                minWidth: 180
                            }],
                        [{
                            label: "标签名字段",
                            fieldName: "selectLabel",
                            type: "input",
                            required: true,
                            formShow: !false,
                            tableShow: !false,
                            minWidth: 180
                        },
                            {
                                label: "标签值字段",
                                fieldName: "selectValue",
                                type: "input",
                                required: true,
                                formShow: !false,
                                tableShow: !false,
                                minWidth: 180
                            }]],
                    batchFieldList: [
                        {
                            batchName: "queryParams",
                            title: "参数",
                            fieldList: [{
                                label: "参数名",
                                fieldName: "name",
                                type: "input",
                                required: true,
                                formShow: !false,
                                tableShow: !false,
                                minWidth: 180
                            }, {
                                label: "参数值",
                                fieldName: "value",
                                type: "input",
                                required: true,
                                formShow: !false,
                                tableShow: !false,
                                minWidth: 180
                            }, {
                                label: "匹配方式",
                                fieldName: "matchType",
                                type: "select",
                                defaultValue: "eq",
                                required: true,
                                formShow: !false,
                                tableShow: !false,
                                optionList: matchTypeList,
                                minWidth: 180
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
                            required: true,
                            formShow: !false,
                            tableShow: !false,
                            minWidth: 180
                        }]
                    },

                ],
            },

        ],
        batchFieldList: [],
        userTableFuncs: [],
        stopAutoLoad: false
    });
}

/**
 * 组件参数属性配置
 * @param fieldName
 * @param item
 */
export function paramsFields(fieldName: string, item: Object) {
    console.log(fieldName, item);
    let datas = [...item['advancedFields'], ...item['fields']];
    let currentData: Array = [];
    datas.forEach(item => {
        if (item.fieldName == fieldName) {
            currentData = item.configParams;
            return false;
        }
    });
    let fields: FieldInfo[] = [];
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
    let fieldList = ref<SelectOption[]>([]);
    let dataUrls: FieldInfo[] = [
        {
            label: "接口地址",
            fieldName: "interfaceUrl",
            type: "input",
            required: true,
            colSpan: 20,
            helpMsg: helpMsg,
            formShow: true,
        }, {
            label: "验证",
            fieldName: "urlValid",
            type: "button",
            actions: async (val: any) => {
                let result = await validDataUrl(val["interfaceUrl"], {});
                let datas = result.data;
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
            colSpan: 4,
            required: true,
            formShow: true,
        }
    ];
    let orderBys: FieldInfo[] = [
        {
            label: "列名",
            fieldName: "fieldName",
            type: "input",
            required: false,
            formShow: true,
        },
        {
            label: "排序",
            fieldName: "ascOrDesc",
            type: "select",
            required: false,
            formShow: true,
            optionList: ascOrDesc()
        }];
    let fieldLists: FieldInfo[] = [{
        label: "列名",
        fieldName: "label",
        type: "input",
        required: false,
        formShow: true,
    }, {
        label: "属性名称",
        fieldName: "fieldName",
        type: "select",
        allowCreate: true,
        optionList: fieldList,
        required: false,
        formShow: true,
    }, {
        label: "搜索显示",
        fieldName: "searchFlag",
        type: "switch",
        defaultValue: "yes",
        required: false,
        formShow: true,
    }];
    let needFields: FieldInfo[] = [{
        label: "原属性名",
        fieldName: "sourceField",
        type: "select",
        required: false,
        optionList: fieldList,
        formShow: true,
    }, {
        label: "目标属性名",
        fieldName: "distField",
        type: "input",
        required: false,
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
                required: false,
                tableShow: !false,
            });

        }
    }
    fields.push(dataUrls);
    if (otherField) {
        fields.push(...otherField);
    }
    let tabInfo = {
        tabList: [
            {
                title: "属性配置",
                tabName: "0",
                fieldName: "tabName",
                actions: () => {
                },
                batchFieldList: [
                    {
                        title: "显示属性",
                        fieldName: "",
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
                    }
                ]
            },

        ]
    };
    fields.push(tabInfo);
    console.log(fields);

    return reactive<PageFieldInfo | any>({
        fieldList: fields
    });

}

/**
 * 容器属性
 */
export function containerField(fieldName: string) {
    return reactive<PageFieldInfo | any>({
        fieldList: [{
            fieldName: fieldName,
            tabList: [{
                title: "Tab属性",
                tabName: "tab",
                disabled: fieldName != "tab",
                batchFieldList: [{
                    batchName: "elements",
                    fieldList: [{
                        label: "Tab名字",
                        fieldName: "label",
                        type: "input",
                        required: true,
                        formShow: !false,
                        tableShow: !false,
                        minWidth: 180
                    }, {
                        label: "Tab属性",
                        fieldName: "tabName",
                        type: "input",
                        required: true,
                        formShow: !false,
                        tableShow: !false,
                        minWidth: 180
                    }, {
                        label: "对象名字",
                        fieldName: "objectName",
                        type: "input",
                        required: true,
                        formShow: !false,
                        tableShow: !false,
                        minWidth: 180
                    }, {
                        label: "是否子表",
                        fieldName: "subFormFlag",
                        type: "switch",
                        defaultValue: "yes",
                        required: true,
                        formShow: !false,
                        tableShow: !false,
                        minWidth: 180
                    }]
                }]
            }, {
                title: "栅格属性",
                tabName: "box",
                disabled: fieldName != "box",
                batchFieldList: [{
                    batchName: "elements",
                    fieldList: [{
                        label: "列",
                        fieldName: "colIndex",
                        type: "input",
                        required: true,
                        formShow: !false,
                        tableShow: !false,
                        minWidth: 180,
                        batchFieldList: [{
                            batchName: "columns",
                            fieldList: [{
                                label: "列宽",
                                fieldName: "colspan",
                                type: "number",
                                min: 1,
                                max: 24,
                                step: 4,
                                defaultValue: 24,
                                required: true,
                                formShow: !false,
                                tableShow: !false,
                                minWidth: 180,
                                actionName: "change",
                                actions: (val: any, type: string) => {
                                    let cols = val.value?.columns || val?.columns;
                                    if (type == "oper") {
                                        let len = 24 / cols.length;
                                        cols.forEach((item: any) => {
                                            item.colspan = len;
                                        })
                                    }
                                    cols?.forEach((item: any) => {
                                        if (!Object.keys(item).includes("items")) {
                                            item["items"] = [];
                                        }
                                    });
                                    console.log(val, type);
                                }
                            }]
                        }]
                    }]
                }]
            }, ]
        }]
    });
}