import {computed, nextTick, reactive, ref, Ref, unref, watch} from "vue";
import {i18n} from "@/lang";
import {
    analysisCompDatas,
    compDynamicData,
    dataType,
    dictData,
    error,
    FieldInfo,
    getDesignFormStore,
    httpMethod,
    loadData,
    loadGetData,
    orderBy,
    PageFieldInfo,
    searchMatchList,
    SelectOption,
    success,
    validRulesList,
    warning,
} from "star-horse-lowcode";
import {validDataUrl} from "@/api/system.js";
import WebUrlComp from "./WebUrlComp.vue";


export const urlReturnDataHelpMsg = i18n("dyform.preps.urlReturnDataHelpMsg");

/**
 * 验证接口
 * @param formProps
 * @param dataSourceRef
 * @param recall
 * @param validForm
 * @param formData
 */
export async function validInterface(
    formProps: any,
    dataSourceRef: any,
    recall: Function,
    validForm: boolean = true,
    formData?: any,
    onlyUrl: boolean = false,
) {
    let flag = false;
    let dataList: SelectOption[] = [];
    const refName = unref(dataSourceRef);
    if (!refName) {
        return false;
    }
    const temp = unref(formData) ?? unref(refName.getFormData());
    if (validForm) {
        await nextTick();
        await refName?.$refs.starHorseFormRef.validate((res: boolean) => {
            flag = res;
        });
        if (!flag) {
            return flag;
        }
        for (const key in temp) {
            unref(formProps)[key] = temp[key];
        }
    }
    const dataSource = temp["dataSource"];
    const urlOrDictName = temp["urlOrDictName"];
    const queryParams = temp["queryParams"];
    const customParams = temp["customParams"];
    let validErrorMsg: string = "";
    let validSuccessMsg: string = "";
    if (dataSource == "url" || onlyUrl) {
        const requestParams = [] as any;
        queryParams?.forEach((item: any) => {
            if (!item.name) {
                return;
            }
            requestParams.push({
                propertyName: item.name,
                value: item.value || "",
                operation: item.matchType,
            });
        });
        let url = temp["url"];
        let httpMethod = temp["httpMethod"];
        let validResult: any = {};
        if (temp["redirect"]) {
            const params = {
                url: temp["url"] ?? temp["interfaceUrl"],
                protocol: temp["protocol"],
                host: temp["host"],
                port: temp["port"],
                httpMethod: temp.httpMethod || "POST",
                dataType: temp.dataType || "JSON",
                env: temp["env"] || "",
                searchInfo: {
                    fieldList: requestParams,
                },
            };
            const custom = customParams ? JSON.parse(customParams) : {};
            if (Object.keys(custom).length > 0) {
                params.searchInfo = {
                    ...params.searchInfo,
                    ...custom,
                };
            }
            url = "/system-config/redirect/execute";
            validResult = await loadData(url, params);
        } else {
            if (httpMethod && httpMethod.toUpperCase() === "POST") {
                validResult = await loadData(url, {
                    fieldList: requestParams,
                });
            } else {
                validResult = await loadGetData(url);
            }
        }
        if (validResult.error) {
            flag = false;
            validErrorMsg = validResult.error;
        } else {
            validSuccessMsg = i18n("dyform.utils.447");
            dataList = validResult.data;
        }
    } else if (dataSource == "dict") {
        const dicts = await dictData(urlOrDictName);
        if (Object.keys(dicts || {}).length == 0) {
            flag = false;
            validErrorMsg = i18n("dyform.utils.448");
        } else {
            dataList = dicts;
            validSuccessMsg = i18n("dyform.utils.447");
        }
    } else {
        //静态数据
        const datas = temp["values"] as SelectOption[];
        if (Object.keys(datas || {}).length == 0) {
            flag = false;
            validErrorMsg = i18n("dyform.utils.449");
        } else {
            dataList = datas;
            validSuccessMsg = i18n("dyform.utils.447");
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
export function createData(
    dataSourceRef: any,
    dataList: any,
    needDynamicData: boolean = false,
) {
    const refName = dataSourceRef.value || dataSourceRef;
    const temp = refName.getFormData().value;
    let reDataList: SelectOption[] = [];
    const dataSource = temp["dataSource"];
    let errorMsg = "";
    if (dataSource == "data") {
        reDataList = dataList;
    } else {
        if (dataSource == "url" && needDynamicData && dataList.length > 0) {
            const element = dataList[0];
            const keys = Object.keys(element);
            if (!keys.find((item) => item == temp["selectLabel"])) {
                errorMsg = i18n("dyform.utils.450") + JSON.stringify(keys);
            } else if (!keys.find((item) => item == temp["selectValue"])) {
                errorMsg = i18n("dyform.utils.451") + JSON.stringify(keys);
            } else {
                dataList.forEach((item: any) => {
                    reDataList.push({
                        name: item[temp["selectLabel"]],
                        value: item[temp["selectValue"]],
                    });
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
        reDataList,
        errorMsg,
    };
}

/**
 * 获取URL配置字段列表
 * @param interfaceUtils 接口工具对象，包含interfaceDatas, methodList, interfaceList, fieldList, disableUrl等
 * @param options 配置选项
 * @returns URL配置字段列表
 */
export function getUrlFieldConfig(interfaceUtils: any, options: any = {}) {
    const {
        methodList,
        interfaceList,
        fieldList,
        disableUrl,
        loadInterface,
        loadMethods,
    } = interfaceUtils;

    const {
        showValidateButton = true,
        showPrimaryKey = false,
        validateButtonText = i18n("dyform.utils.452"),
        validateCallback,
        urlColspan = undefined,
        showLabelFields = false,
    } = options;

    //很奇怪，此数组 没有加一个隐藏的数据，后面第一个host 会变成radio
    const urlFields: FieldInfo[] | any = [
        [
            {
                label: i18n("dyform.utils.453"),
                fieldName: "host",
                type: "select",
                formVisible: true,
                listVisible: true,
                actions: {
                    change: (val: any) => {
                        loadInterface(val["host"]);
                    },
                },
                preps: {
                    dataSource: "url",
                    redirect: false,
                    httpMethod: "GET",
                    url: "/userdb-manage/redirect/api/service/list",
                },
            },
            {
                label: i18n("dyform.utils.454"),
                fieldName: "interfaceName",
                type: "select",
                formVisible: true,
                listVisible: true,
                actions: {
                    change: (val: any) => {
                        loadMethods(val["interfaceName"]);
                    },
                },
                preps: {
                    values: interfaceList,
                },
            },
        ],
        [
            {
                label: i18n("dyform.utils.455"),
                fieldName: "method",
                type: "select",
                formVisible: true,
                listVisible: true,
                actions: {
                    change: (val: any) => {
                        let temp = val["method"];
                        let result: any = methodList.value?.find(
                            (item: any) => item.methodName == temp,
                        );
                        if (result) {
                            val["httpMethod"] = result.method;
                            val["url"] = result.serviceUrl;
                        }
                    },
                },
                preps: {
                    values: methodList,
                    props: {
                        label: "summary",
                        value: "methodName",
                    },
                },
            },
            {
                label: i18n("dyform.utils.456"),
                fieldName: "redirect",
                type: "switch",
                defaultValue: true,
                formVisible: true,
                listVisible: true,
            },
        ],
        [
            {
                label: i18n("dyform.utils.457"),
                fieldName: "httpMethod",
                type: "select",
                required: true,
                defaultValue: "POST",
                formVisible: true,
                listVisible: true,
                preps: {
                    values: httpMethod(),
                },
            },
            {
                label: i18n("dyform.utils.458"),
                fieldName: "protocol",
                type: "select",
                required: true,
                defaultValue: "http",
                formVisible: true,
                listVisible: true,
                preps: {
                    values: [
                        {name: "HTTP", value: "http"},
                        {name: "HTTPS", value: "https"},
                    ],
                },
            },
        ],
        {
            label: i18n("dyform.extend.349"),
            fieldName: "url",
            required: true,
            helpMsg: urlReturnDataHelpMsg,
            formVisible: true,
            ...(urlColspan && {colspan: urlColspan}),
        },
    ];

    // 添加验证按钮和主键选择
    if (showValidateButton) {
        const validateRow: any = [];

        validateRow.push({
            label: validateButtonText,
            fieldName: "valid",
            type: "button",
            formVisible: true,
            actions: validateCallback || {
                click: async (val: any) => {
                    unref(val)["dataSource"] = "url";
                    await validOperation(
                        val,
                        interfaceUtils.paramsConfigRef || null,
                        fieldList,
                        disableUrl,
                    );
                },
            },
            preps: {
                icon: "valid",
                colspan: showPrimaryKey ? 8 : 24,
            },
        });

        if (showPrimaryKey) {
            validateRow.push({
                label: i18n("dyform.container.334"),
                fieldName: "primaryKey",
                type: "select",
                required: false,
                formVisible: true,
                preps: {
                    values: fieldList,
                    colspan: 16,
                },
            });
        }

        urlFields.push(validateRow);
    }

    // 添加标签名字段和标签值字段
    if (showLabelFields) {
        urlFields.push([
            {
                label: i18n("dyform.utils.459"),
                fieldName: "selectLabel",
                type: "select",
                formVisible: true,
                listVisible: true,
                preps: {
                    allowCreate: true,
                    values: fieldList,
                },
            },
            {
                label: i18n("dyform.utils.460"),
                fieldName: "selectValue",
                type: "select",
                preps: {
                    allowCreate: true,
                    values: fieldList,
                },
                formVisible: true,
                listVisible: true,
            },
        ]);
    }

    return urlFields;
}

export const validOperation = async (
    val: any,
    dataSourceRef: Ref<any>,
    fieldList: Ref<any>,
    disableUrl: Ref<any>,
    validForm: boolean = true,
    formData?: any,
    onlyUrl: boolean = false,
) => {
    await validInterface(
        val,
        dataSourceRef,
        (dataList: any, successMsg: string, errorMsg: string) => {
            if (dataList && !disableUrl.value) {
                const temp = dataList[0];
                const keys = Object.keys(temp || {});
                fieldList.value = [];
                for (const ind in keys) {
                    fieldList.value.push({name: keys[ind], value: keys[ind]});
                }
            }
            if (successMsg) {
                success(successMsg);
            }
            if (errorMsg) {
                error(errorMsg);
            }
        },
        validForm,
        formData,
        onlyUrl,
    );
};

/**
 * 数据源属性配置
 */
export function dataSourceFields(
    dataSourceRef: Ref<any>,
    envList: Array<SelectOption>,
    _recall: Function,
) {
}

const urlBaseInfo: FieldInfo[] = [
    {
        fieldName: "preinterfaceUrl",

        defaultValue: "http://",
        preps: {
            colspan: -1,
        },
    },
    {
        label: i18n("dyform.extend.349"),
        fieldName: "interfaceUrl",

        required: true,
        helpMsg: urlReturnDataHelpMsg,
        formVisible: true,
        preps: {
            colspan: 24,
            prependList: [
                {name: "HTTP://", value: "http://"},
                {name: "HTTPS://", value: "https://"},
            ],
        },
    },
];

/**
 * 组件参数属性配置
 * @param fieldName
 * @param item
 */
export function urlFields() {
    const fields: Array<any> = [];
    const fieldList = ref<SelectOption[]>([]);

    const dataUrls: FieldInfo[] = [
        {
            label: i18n("dyform.utils.457"),
            fieldName: "httpMethod",
            type: "select",
            defaultValue: "POST",
            required: true,
            formVisible: true,
            preps: {
                values: httpMethod(),
                colspan: 10,
            },
        },
        {
            label: i18n("dyform.utils.461"),
            fieldName: "dataType",
            type: "select",
            defaultValue: "JSON",
            formVisible: true,
            required: true,
            preps: {
                values: dataType(),
                colspan: 10,
            },
        },
        {
            label: i18n("dyform.utils.452"),
            fieldName: "urlValid",
            type: "button",
            preps: {
                icon: "valid",
                actionTitle: i18n("dyform.utils.452"),
                colspan: 4,
            },
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
                const data = datas[0];
                const keys = Object.keys(data);
                fieldList.value = [];
                for (const ind in keys) {
                    fieldList.value.push({name: keys[ind], value: keys[ind]});
                }
            },
            required: true,
            formVisible: true,
        },
    ];
    const orderBys: FieldInfo[] = [
        {
            label: i18n("dyform.utils.462"),
            fieldName: "fieldName",
            type: "select",
            formVisible: true,
            preps: {
                allowCreate: true,
                values: fieldList,
            },
        },
        {
            label: i18n("dyform.extend.352"),
            fieldName: "orderBy",
            type: "select",
            formVisible: true,
            preps: {
                values: orderBy(),
            },
        },
    ];

    const needFields: FieldInfo[] = [
        {
            label: i18n("dyform.utils.463"),
            fieldName: "sourceField",
            type: "select",
            formVisible: true,
            preps: {
                allowCreate: true,
                values: fieldList,
            },
        },
        {
            label: i18n("dyform.utils.464"),
            fieldName: "distField",
            formVisible: true,
        },
    ];
    //需考虑或查询
    const paramFields: FieldInfo[] | any = [
        {
            batchFieldList: [
                {
                    batchName: "queryParams",
                    fieldList: [
                        {
                            label: i18n("dyform.utils.465"),
                            helpMsg: i18n("dyform.utils.466"),
                            fieldName: "isDynamicParam",
                            type: "switch",
                            defaultValue: "N",
                            formVisible: true,
                            preps: {
                                activeValue: "Y",
                                inactiveValue: "N",
                            },
                        },
                        {
                            label: i18n("dyform.utils.467"),
                            fieldName: "paramName",
                            required: true,
                            formVisible: true,
                        },
                        {
                            label: i18n("dyform.utils.468"),
                            fieldName: "matchType",
                            type: "select",
                            defaultValue: "eq",
                            formVisible: true,
                            preps: {
                                values: searchMatchList(),
                            },
                        },
                        {
                            label: i18n("dyform.utils.469"),
                            fieldName: "paramValue",
                            type: "textarea",
                            formVisible: true,
                        },
                    ],
                },
            ],
        },
    ];

    fields.push(urlBaseInfo);
    fields.push(dataUrls);

    const tabInfo = {
        fieldName: "params",
        tabList: [
            {
                title: i18n("dyform.utils.470"),
                tabName: "params",
                objectName: "params",
                fieldList: paramFields,
            },
            {
                title: i18n("dyform.utils.471"),
                tabName: "needField",
                objectName: "needField",
                fieldList: needFields,
            },
            {
                title: i18n("dyform.utils.472"),
                tabName: "orderBy",
                objectName: "orderBy",
                fieldList: orderBys,
            },
        ],
    };
    fields.push(tabInfo);
    return fields;
}

/**
 * 获取接口相关的工具函数和响应式数据
 */
export function getInterfaceUtils() {
    const interfaceDatas = ref<any>({});
    const methodList = ref<SelectOption[]>([]);
    const interfaceList = ref<SelectOption[]>([]);
    const fieldList = ref<SelectOption[]>([]);
    const disableUrl = ref<boolean>(false);

    const loadInterface = (serviceName: string) => {
        loadGetData(`/userdb-manage/redirect/api/webApis2/${serviceName}`).then(
            (res: any) => {
                interfaceDatas.value = [];
                interfaceList.value = [];
                if (res.error) {
                    warning(res.error);
                    return;
                }
                interfaceDatas.value = res.data?.apiList;
                interfaceList.value = res.data?.options;
            },
        );
    };

    const loadMethods = (interName: string) => {
        if (!interfaceDatas.value[interName]) {
            const dataWatch = watch(
                () => interfaceDatas.value[interName],
                (newVal) => {
                    if (newVal) {
                        methodList.value = newVal;
                        dataWatch();
                    }
                },
            );
        } else {
            methodList.value = interfaceDatas.value[interName];
        }
    };

    return {
        interfaceDatas,
        methodList,
        interfaceList,
        fieldList,
        disableUrl,
        loadInterface,
        loadMethods,
    };
}

/**
 * 组件参数属性配置
 * @param fieldName
 * @param item
 */
export function paramsFields(
    paramsConfigRef: Ref<any>,
    fieldName: string,
    item: any,
    returnField: boolean = false,
) {
    let datas: any = [];
    if (Object.entries(item).length > 0) {
        datas = [...item["advancedFields"], ...item["fields"]];
    }

    let currentData: Array<any> = [];
    datas?.forEach((item: any) => {
        if (item.fieldName == fieldName) {
            currentData = item.configParams;
            return false;
        }
    });

    const fields: Array<any> = [];
    const interfaceUtils = getInterfaceUtils();
    const {fieldList, disableUrl} = interfaceUtils;

    // 使用getUrlFieldConfig函数生成URL配置字段列表
    const dataUrls: FieldInfo[] | any = getUrlFieldConfig(
        {
            ...interfaceUtils,
            paramsConfigRef,
        },
        {
            showPrimaryKey: true,
            validateCallback: async (val: any) => {
                unref(val)["dataSource"] = "url";
                await validOperation(val, paramsConfigRef, fieldList, disableUrl);
            },
        },
    );
    const orderBys: FieldInfo[] = [
        {
            label: i18n("dyform.utils.462"),
            fieldName: "fieldName",
            type: "select",
            formVisible: true,
            preps: {
                values: fieldList,
            },
        },
        {
            label: i18n("dyform.extend.352"),
            fieldName: "orderBy",
            type: "select",
            formVisible: true,
            preps: {
                values: orderBy(),
            },
        },
    ];
    const fieldLists: FieldInfo[] | any = [
        {
            label: i18n("dyform.utils.462"),
            fieldName: "label",

            formVisible: true,
        },
        {
            label: i18n("dyform.fieldAnalysis.407"),
            fieldName: "fieldName",
            type: "select",
            allowCreate: true,
            formVisible: true,
            preps: {
                values: fieldList,
            },
        },
        {
            label: i18n("dyform.utils.473"),
            fieldName: "searchFlag",
            type: "switch",
            defaultValue: "Y",
            formVisible: true,
            preps: {
                activeValue: "Y",
                inactiveValue: "N",
            },
        },
    ];
    const needFields: FieldInfo[] = [
        {
            label: i18n("dyform.utils.463"),
            fieldName: "sourceField",
            type: "select",
            formVisible: true,
            preps: {
                values: fieldList,
            },
        },
        {
            label: i18n("dyform.utils.464"),
            fieldName: "distField",
            formVisible: true,
        },
    ];
    const otherField: FieldInfo[] = [];
    const fieldInfos: string[] = ["dataUrl", "orderby", "fieldList", "needField"];
    for (const index in currentData) {
        const temp = currentData[index];
        if (!fieldInfos.includes(temp.fieldName)) {
            otherField.push({
                label: temp.label,
                fieldName: temp.fieldName,
                listVisible: true,
            });
        }
    }
    // fields.push(urlBaseInfo);
    fields.push(...dataUrls);
    if (otherField) {
        fields.push(...otherField);
    }
    const tabInfo: any = {
        fieldName: "fieldLists",
        fieldList: [
            {
                label: i18n("dyform.utils.474"),
                fieldName: "dataSource",
                required: true,
                defaultValue: "data",
                formVisible: true,
                listVisible: true,
            },
        ],
        batchFieldList: [
            {
                title: i18n("dyform.utils.475"),
                tabName: "fieldLists",
                batchName: "fieldLists",
                fieldList: fieldLists,
            },
            {
                title: i18n("dyform.utils.476"),
                tabName: "needField",
                batchName: "needField",
                fieldList: needFields,
            },
            {
                title: i18n("dyform.utils.477"),
                tabName: "orderBy",
                batchName: "orderBy",
                fieldList: orderBys,
            },
            {
                title: i18n("dyform.utils.470"),
                tabName: "params",
                batchName: "params",
                formFlag: "Y",
                fieldList: [
                    {
                        label: i18n("dyform.utils.470"),
                        fieldName: "params",
                        type: "json-array",
                        formVisible: true,
                        preps: {
                            devType: "Y",
                        },
                    },
                ],
            },
        ],
    };
    fields.push(tabInfo);
    if (returnField) {
        return fields;
    } else {
        return reactive<PageFieldInfo | any>({
            fieldList: fields,
        });
    }
}

const mappingList: SelectOption[] = [
    {name: i18n("dyform.utils.478"), value: "1"},
    {name: i18n("dyform.utils.479"), value: "n"},
];
const containerCommonFields = [{
    label: i18n("dyform.container.333"),
    fieldName: "subFormFlag",
    type: "switch",
    defaultValue: "Y",
    required: true,
    formVisible: true,
    listVisible: true,
    preps: {
        activeValue: "Y",
        inactiveValue: "N",
        dataRelation: {
            actionName: "change",
            relationDetails: [
                {
                    matchType: "eq",
                    controlCondition: "eqVisible",
                    relationFields: ["objectName", "mapping"],
                    matchFieldValue: "Y",
                }]
        }
    },
},
    {
        label: i18n("dyform.utils.480"),
        fieldName: "objectName",
        required: true,
        formVisible: false,
        listVisible: true,
    },
    {
        label: i18n("dyform.utils.481"),
        fieldName: "mapping",
        type: "select",
        defaultValue: "1",
        formVisible: false,
        listVisible: true,
        preps: {
            values: mappingList
        }
    }];
const tabFields = {
    title: i18n("dyform.utils.482"),
    tabName: "tab",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.utils.483"),
                    fieldName: "label",

                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                {
                    label: i18n("dyform.container.334"),
                    fieldName: "tabName",
                    helpMsg: i18n("dyform.preps.tabNameHelp"),

                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                ...containerCommonFields
            ],
        },
    ],
};
const collapseFields = {
    title: i18n("dyform.utils.484"),
    tabName: "collapse",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.utils.485"),
                    fieldName: "label",

                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                {
                    label: i18n("dyform.container.334"),
                    fieldName: "tabName",
                    helpMsg: i18n("dyform.preps.collapseNameHelp"),

                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                ...containerCommonFields
            ],
        },
    ],
};
const splitterFields = {
    title: i18n("dyform.utils.486"),
    tabName: "splitter",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.utils.487"),
                    fieldName: "label",

                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                {
                    label: i18n("dyform.container.334"),
                    fieldName: "tabName",
                    helpMsg: i18n("dyform.preps.splitterNameHelp"),

                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                ...containerCommonFields,
                {
                    label: i18n("dyform.utils.488"),
                    fieldName: "preps",
                    type: "json",
                    formVisible: true,
                    listVisible: true,
                },
            ],
        },
    ],
};
const cardFields = {
    title: i18n("dyform.utils.489"),
    tabName: "card",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.utils.490"),
                    fieldName: "title",
                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                {
                    label: i18n("dyform.container.334"),
                    fieldName: "tabName",
                    helpMsg: i18n("dyform.preps.cardNameHelp"),
                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                ...containerCommonFields

            ],
        },
    ],
};

const boxFields = {
    title: i18n("dyform.utils.491"),
    tabName: "box",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.utils.492"),
                    fieldName: "colIndex",

                    required: true,
                    formVisible: true,
                    listVisible: true,
                    batchFieldList: [
                        {
                            batchName: "columns",
                            batchDefaultData: {items: []},
                            fieldList: [
                                {
                                    label: i18n("dyform.utils.435"),
                                    fieldName: "colspan",
                                    type: "number",
                                    defaultValue: 24,
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {
                                        min: 1,
                                        max: 24,
                                        step: 4,
                                    },
                                    actions: {
                                        change: (val: any, type: string) => {
                                            const obj = val.value || val;
                                            const cols = obj.columns;
                                            if (type == "oper") {
                                                const len = 24 / cols.length;
                                                cols.forEach((item: any) => {
                                                    item.colspan = len;
                                                });
                                            }
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
const dyTableFields = {
    title: i18n("dyform.utils.493"),
    tabName: "dytable",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.utils.492"),
                    fieldName: "colIndex",

                    required: true,
                    formVisible: true,
                    listVisible: true,
                    batchFieldList: [
                        {
                            batchName: "columns",
                            batchDefaultData: {items: []},
                            fieldList: [
                                {
                                    label: i18n("dyform.utils.435"),
                                    fieldName: "colWidth",
                                    type: "number",
                                    defaultValue: 100,
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {
                                        min: 10,
                                        max: 100,
                                        step: 2,
                                    },
                                    actions: {
                                        change: (val: any, type: string) => {
                                            const obj = val.value || val;
                                            const cols = obj.columns;
                                            if (type == "oper") {
                                                const len = 100 / cols.length;
                                                cols.forEach((item: any) => {
                                                    item.colWidth = len;
                                                });
                                            }
                                        },
                                    },
                                },
                                {
                                    label: i18n("dyform.utils.434"),
                                    fieldName: "colHeight",
                                    type: "number",
                                    defaultValue: 30,
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {
                                        min: 30,
                                        max: 100,
                                        step: 1,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
};
const conditionFields = {
    title: i18n("dyform.condition.containerName"),
    tabName: "condition",
    batchFieldList: [
        {
            batchName: "elements",
            fieldList: [
                {
                    label: i18n("dyform.condition.label"),
                    fieldName: "label",
                    required: true,
                    formVisible: true,
                    listVisible: true,
                },
                {
                    label: i18n("dyform.condition.placeholder"),
                    fieldName: "placeholder",
                    required: false,
                    formVisible: true,
                    listVisible: true,
                },
            ],
        },
    ],
};
const fields: any = {
    tab: tabFields,
    collapse: collapseFields,
    splitter: splitterFields,
    card: cardFields,
    box: boxFields,
    dytable: dyTableFields,
    condition: conditionFields,
};

/**
 * 容器属性
 */
export function containerField(fieldName: string) {
    return reactive<PageFieldInfo | any>({
        fieldList: [
            {
                fieldName: fieldName,
                tabList: [fields[fieldName]],
            },
        ],
    });
}

const fieldMap: any = reactive({
    form: {
        title: i18n("dyform.utils.494"),
        tabName: "form",
        fieldList: [
            {
                label: i18n("dyform.utils.495"),
                fieldName: "formName",
                aliasName: "idDynamicForm",
                type: "dialog-input",
                required: true,
                formVisible: true,
                listVisible: true,
                preps: {
                    primaryKey: "idDynamicForm",
                    dataUrl: {
                        pageListUrl: "userdb-manage/userdb/dynamicForm/pageList",
                    },
                    needField: [
                        {sourceField: "formName", distField: "formName"},
                        {sourceField: "dataNo", distField: "idDynamicForm"},
                    ],

                    fieldList: [
                        {
                            label: i18n("dyform.utils.495"),
                            fieldName: "formName",
                            searchVisible: true,
                            formVisible: true,
                            listVisible: true,
                        },
                        {
                            label: i18n("dyform.utils.496"),
                            fieldName: "tbName",
                            searchVisible: true,
                            formVisible: true,
                            listVisible: true,
                        },
                        {
                            label: i18n("dyform.container.334"),
                            fieldName: "formId",
                            formVisible: true,
                            listVisible: true,
                        },
                        {
                            label: i18n("dyform.utils.474"),
                            fieldName: "datasourceConfigId",
                            type: "select",
                            formVisible: true,
                            listVisible: true,
                        },
                    ],
                },
            },
        ],
    },
    comp: {
        title: i18n("dyform.utils.497"),
        tabName: "comp",
        fieldList: [
            {
                label: i18n("dyform.item.0"),
                fieldName: "componentName",

                required: true,
                formVisible: true,
                listVisible: true,
            },
        ],
    },
    inter: {
        title: i18n("dyform.utils.498"),
        tabName: "interface",
        fieldList: urlFields(),
    },
    method: {
        title: i18n("dyform.utils.499"),
        tabName: "method",
        fieldList: [
            {
                label: i18n("dyform.utils.500"),
                fieldName: "method",

                required: true,
                formVisible: true,
                listVisible: true,
            },
        ],
    },
    code: {
        title: i18n("dyform.utils.501"),
        tabName: "code",
        fieldList: [
            {
                label: i18n("dyform.utils.500"),
                fieldName: "StarHorseEditor",
                type: "usercomp",
                required: true,
                formVisible: true,
                listVisible: true,
            },
        ],
    },
});
let currentField = ref<FieldInfo[]>([fieldMap["form"]]);

export function buttonClickDataField() {
    const eventList: SelectOption[] = [
        {name: i18n("dyform.utils.494"), value: "form"},
        {name: i18n("dyform.utils.502"), value: "comp"},
        {name: i18n("dyform.utils.503"), value: "inter"},
        {name: i18n("dyform.utils.504"), value: "method"},
        {name: i18n("dyform.utils.505"), value: "code"},
    ];
    return reactive<PageFieldInfo>({
        fieldList: [
            {
                label: i18n("dyform.utils.506"),
                fieldName: "viewType",
                type: "radio",
                required: true,
                defaultValue: "form",
                formVisible: true,
                listVisible: true,
                actions: {
                    change: (val: any) => {
                        const viewType = val.viewType;
                        if (viewType) {
                            currentField.value = [fieldMap[viewType]];
                        }
                    },
                },
                preps: {
                    values: eventList,
                },
            },
            {
                cardList: currentField,
            },
        ],
    });
}

const formFields = computed(
    () => analysisCompDatas(getDesignFormStore().compList).selectList,
);
export const linkPolicyTypeEvent: SelectOption[] = [
    {name: i18n("dyform.relation.event.change"), value: "change"},
    {name: i18n("dyform.relation.event.input"), value: "input"},
    {name: i18n("dyform.relation.event.focus"), value: "focus"},
    {name: i18n("dyform.relation.event.blur"), value: "blur"},
    {name: i18n("dyform.relation.event.enter"), value: "enter"},
];
/**
 * 关联
 * @param preps 当前组件参数

 * @param model 模式
 */
export function relationDataField(preps: any, model: string) {
    const currentFieldValues = ref<SelectOption[]>([]);
    compDynamicData({preps: preps}).then((res) => {
        currentFieldValues.value = res;
    });


    const controlConditionList: SelectOption[] = [
        {name: i18n("dyform.utils.507"), value: "eqDisable"},
        {name: i18n("dyform.utils.508"), value: "eqEditable"},
        {name: i18n("dyform.utils.509"), value: "eqHide"},
        {name: i18n("dyform.utils.510"), value: "eqVisible"},
        {name: i18n("dyform.utils.511"), value: "eqRequired"},
        {name: i18n("dyform.utils.512"), value: "assignValue"},
    ];
    if (model == "full") {
        controlConditionList.splice(
            0,
            0,
            {name: i18n("dyform.utils.513"), value: "eqConditionDataLinkage"},
            {name: i18n("dyform.utils.514"), value: "asParamDataLinkage"},
        );
        controlConditionList.push({
            name: i18n("dyform.utils.515"),
            value: "changeType",
        });
    }

    return reactive<PageFieldInfo | any>({
        fieldList: [
            {
                batchFieldList: [
                    {
                        staticData: "Y",
                        subFormFlag: "Y",
                        batchName: "relationDetails",
                        fieldList: [
                            [
                                {
                                    label: i18n("dyform.utils.517"),
                                    fieldName: "controlCondition",
                                    type: "select",
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,

                                    preps: {
                                        values: controlConditionList,
                                        dataRelation: {
                                            actionName: "change",
                                            relationDetails: [
                                                {
                                                    matchType: "eq",
                                                    controlCondition: "eqVisible",
                                                    relationFields: ["params", "dataSourceDivider"],
                                                    matchFieldValue: [
                                                        "eqConditionDataLinkage",
                                                        "asParamDataLinkage",
                                                    ],
                                                },
                                                {
                                                    matchType: "eq",
                                                    controlCondition: "eqVisible",
                                                    relationFields: ["newValue"],
                                                    matchFieldValue: "assignValue",
                                                },
                                                {
                                                    matchType: "eq",
                                                    controlCondition: "eqVisible",
                                                    relationFields: ["newType"],
                                                    matchFieldValue: "changeType",
                                                },
                                                {
                                                    matchType: "eq",
                                                    controlCondition: "eqVisible",
                                                    relationFields: ["matchFieldName"],
                                                    matchFieldValue: "asParamDataLinkage",
                                                },
                                                {
                                                    matchType: "eq",
                                                    controlCondition: "eqRequired",
                                                    relationFields: ["matchFieldValue"],
                                                    matchFieldValue: [
                                                        "eqDisable",
                                                        "eqVisible",
                                                        "eqEditable",
                                                        "eqRequired",
                                                        "eqHide",
                                                        "eqConditionDataLinkage",
                                                    ],
                                                },
                                                {
                                                    matchType: "eq",
                                                    controlCondition: "eqRequired",
                                                    relationFields: ["matchFieldName"],
                                                    matchFieldValue: ["asParamDataLinkage"],
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                            [
                                {
                                    label: i18n("dyform.utils.518"),
                                    fieldName: "relationFields",
                                    type: "tselect",
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    helpMsg:
                                        i18n("dyform.utils.519"),
                                    preps: {
                                        data: formFields.value,

                                        multiple: true,
                                        checkStrictly: true,
                                    },
                                },

                                {
                                    label: i18n("dyform.utils.520"),
                                    fieldName: "matchType",
                                    type: "select",
                                    defaultValue: "eq",
                                    required: false,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {
                                        disabled: true,
                                        values: searchMatchList(),
                                    },
                                },
                            ],
                            [
                                {
                                    label: i18n("dyform.utils.467"),
                                    fieldName: "matchFieldName",
                                    required: false,
                                    defaultValue: preps.name,
                                    helpMsg: i18n("dyform.utils.521"),
                                    formVisible: false,
                                    listVisible: true,
                                },
                                {
                                    label: i18n("dyform.utils.522"),
                                    fieldName: "matchFieldValue",
                                    type: "select",
                                    required: false,
                                    helpMsg:
                                        i18n("dyform.utils.523"),

                                    formVisible: true,
                                    listVisible: true,
                                    preps: {
                                        values: currentFieldValues,
                                        multiple: true,
                                        allowCreate: true,
                                    },
                                },
                            ],
                            
                            {
                                label: i18n("dyform.utils.524"),
                                type: "input",
                                fieldName: "newValue",
                                formVisible: false,
                                preps: {},
                            },
                            {
                                label: i18n("dyform.utils.525"),
                                type: "select",
                                fieldName: "newType",
                                helpMsg: i18n("dyform.utils.526"),
                                formVisible: false,
                                preps: {
                                    dataSource: "dict",
                                    urlOrDictName: "field_type",
                                },
                            },
                            {
                                label: i18n("dyform.utils.527"),
                                type: "usercomp",
                                fieldName: "params",
                                formVisible: false,
                                preps: {
                                    batchName: "params",
                                    bareFlag: "Y",
                                    subFormFlag: true,
                                    compName: WebUrlComp,
                                },
                            },
                        ],
                    },
                ],
            },
        ],
    });
}

const inputType = [
    "input",
    "textarea",
    "password",
    "number",
    "view-markdown",
    "json",
    "json-array",
];
const selectType = [
    "select",
    "tselect",
    "cascader",
    "autocomplete",
    "area",
    "cron",
    "transfer",
    "dialog-input",
    "page-select",
];

/**
 * 给组件添加placeholder属性
 * @param item
 * @param itemType
 */
export function fieldPlaceholder(item: any, compInfo?: any) {
    let preps: any = compInfo ?? unref(getDesignFormStore().currentComp);
    if (!preps) {
        return "";
    }
    let itemType: string = preps?.itemType;
    preps["fieldName"] = item.name;
    if (item["noPlaceholder"]) {
        delete item["placeholder"];
        delete item["startPlaceholder"];
        delete item["endPlaceholder"];
        delete item["minPlaceholder"];
        delete item["maxPlaceholder"];
        return;
    }
    if (inputType.includes(itemType)) {
        item["placeholder"] = i18n("dyform.utils.528") + item.label;
    } else if (selectType.includes(itemType)) {
        item["placeholder"] = i18n("dyform.utils.529") + item.label;
    }
    if (itemType == "datetime") {
        if (preps?.preps?.type?.includes("range")) {
            item["startPlaceholder"] = i18n("dyform.utils.530");
            item["endPlaceholder"] = i18n("dyform.utils.531");
        } else {
            item["placeholder"] = i18n("dyform.utils.529") + item.label;
        }
    } else if (itemType == "number-range") {
        item["minPlaceholder"] = i18n("dyform.utils.532");
        item["maxPlaceholder"] = i18n("dyform.utils.533");
    }
}

const listPrototypeVisible = ref<boolean>(false);

/**
 * 定义所有组件的公共属性
 */
export function compCommonFields(
    customerValid: Function,
    isNumber: boolean,
): FieldInfo[] {
    return [
        {
            label: i18n("dyform.fieldAnalysis.406"),
            fieldName: "label",
            required: true,
            formVisible: true,
            actions: {
                blur: (val: any) => {
                    fieldPlaceholder(val);
                },
            },
        },
        {
            label: i18n("dyform.fieldAnalysis.407"),
            fieldName: "name",
            required: true,
            formVisible: true,
            actions: {
                blur: (val: any) => {
                    fieldPlaceholder(val);
                },
            },
        },

        {
            label: i18n("dyform.utils.534"),
            fieldName: "maxLength",
            required: true,
            defaultValue: isNumber ? 10 : 255,
            type: "number",
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.535"),
            fieldName: "rules",
            defaultValue: [],
            type: "select",
            formVisible: true,
            actions: {
                change: (val: any) => {
                    if (val?.rules?.includes("custom")) {
                        customerValid(val);
                    }
                },
            },
            preps: {
                values: validRulesList,
                multiple: true,
            },
        },
        {
            label: i18n("dyform.utils.536"),
            fieldName: "formVisible",
            type: "switch",
            defaultValue: true,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.537"),
            fieldName: "searchVisible",
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.538"),
            fieldName: "listVisible",
            type: "switch",
            defaultValue: true,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.539"),
            fieldName: "viewVisible",
            type: "switch",
            defaultValue: true,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.540"),
            fieldName: "hideLabel",
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.541"),
            fieldName: "required",
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.542"),
            fieldName: "disabled",
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.543"),
            fieldName: "editDisabled",
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.544"),
            fieldName: "clearable",
            type: "switch",
            defaultValue: true,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.545"),
            fieldName: "readonly",
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.546"),
            fieldName: "defaultVisible",
            helpMsg:
                i18n("dyform.utils.547"),
            type: "switch",
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.548"),
            helpMsg: i18n("dyform.utils.549"),
            fieldName: "prototypeDisplay",
            type: "switch",
            defaultValue: false,
            actions: {
                change: (val: any) => {
                    if (val.prototypeDisplay) {
                        val["listPrototypeDisplay"] = true;
                        listPrototypeVisible.value = true;
                    } else {
                        listPrototypeVisible.value = false;
                        val["listPrototypeDisplay"] = false;
                    }
                },
            },
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.550"),
            helpMsg: i18n("dyform.utils.551"),
            fieldName: "listPrototypeDisplay",

            defaultValue: false,
            formVisible: listPrototypeVisible,
        },
        {
            label: i18n("dyform.utils.552"),
            fieldName: "uniqueValid",
            type: "switch",
            helpMsg: i18n("dyform.utils.553"),
            defaultValue: false,
            formVisible: true,
        },
        {
            label: i18n("dyform.utils.554"),
            fieldName: "helpMsg",
            type: "textarea",
            formVisible: true,
        },
    ];
}
