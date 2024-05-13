import {reactive, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {searchMatchList} from "@/api/sh_api.ts";

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
};

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
                        fieldName: "name",
                        type: "input",
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
                                actions: (val) => {
                                    console.log(val);
                                }
                            }]
                        }]
                    }]
                }]
            }, {tabName: "表格属性"}]
        }]
    });
}