import {i18n} from "@/lang";
import {dataType, httpMethod, SelectOption} from "star-horse-lowcode";

/**
 * Response template options (shared)
 */
export const responseTemplateList: SelectOption[] = [
    {name: i18n("dyform.relation.template.result_data"), value: "result_data"},
    {name: i18n("dyform.relation.template.result_data_list"), value: "result_data_list"},
    {name: i18n("dyform.relation.template.result_data_map"), value: "result_data_map"},
    {name: i18n("dyform.relation.template.map"), value: "map"},
    {name: i18n("dyform.relation.template.list"), value: "list"},
];

/**
 * Auth type options (shared)
 */
export const authTypeList: SelectOption[] = [
    {name: i18n("dyform.relation.auth.none"), value: "none"},
    {name: i18n("dyform.relation.auth.login"), value: "login"},
    {name: i18n("dyform.relation.auth.basic"), value: "basic"},
    {name: i18n("dyform.relation.auth.bearer"), value: "bearer"},
    {name: i18n("dyform.relation.auth.custom"), value: "custom"},
];

/**
 * Value type options (static / dynamic)
 */
export const valueTypeList: SelectOption[] = [
    {name: i18n("dyform.apiSource.valueType.static"), value: "static"},
    {name: i18n("dyform.apiSource.valueType.dynamic"), value: "dynamic"},
];

/**
 * Type convert options (for linkage field mapping)
 */
export const typeConvertList: SelectOption[] = [
    {name: i18n("dyform.relation.apiLinkage.typeConvert.string"), value: "string"},
    {name: i18n("dyform.relation.apiLinkage.typeConvert.number"), value: "number"},
    {name: i18n("dyform.relation.apiLinkage.typeConvert.boolean"), value: "boolean"},
    {name: i18n("dyform.relation.apiLinkage.typeConvert.array"), value: "array"},
];

/**
 * Create shared Request tab config
 * @param title
 * @param i18nPrefix - i18n key prefix: "dyform.apiSource" or "dyform.relation.apiLinkage"
 * @param objectName - tab object name
 * @param defaultMethod - default HTTP method
 */
export function createRequestTab(title: string, i18nPrefix: string, objectName: string, defaultMethod: string = "GET") {
    return {
        title: title,
        tabName: objectName,
        objectName,
        subFormFlag: "Y",
        fieldList: [
            {
                fieldName: "a",
                tabList: [
                    {
                        title: "接口信息",
                        tabName: "a",
                        objectName: "a",
                        fieldList: [
                            {
                                label: i18n(`${i18nPrefix}.url`),
                                fieldName: "url",
                                required: true,
                                helpMsg: i18n(`${i18nPrefix}.url.helpMsg`),
                                formVisible: true,
                                listVisible: true,
                                preps: {colspan: 24},
                            },

                            {
                                label: i18n(`${i18nPrefix}.httpMethod`),
                                fieldName: "httpMethod",
                                type: "select",
                                defaultValue: defaultMethod,
                                required: true,
                                formVisible: true,
                                listVisible: true,
                                preps: {values: httpMethod(), colspan: 12},
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
                                    allowCreate: true,
                                    values: [
                                        {name: "HTTP", value: "http"},
                                        {name: "HTTPS", value: "https"},
                                    ],
                                },
                            },
                            {
                                label: i18n(`${i18nPrefix}.dataType`),
                                fieldName: "dataType",
                                type: "select",
                                defaultValue: "JSON",
                                required: true,
                                formVisible: true,
                                listVisible: true,
                                preps: {values: dataType(), colspan: 12},
                            },
                        ]
                    }, {
                        title: "入参配置",
                        tabName: "b",
                        objectName: "b",
                        fieldList: [{
                            batchFieldList: [{
                                title: i18n(`${i18nPrefix}.headers`),
                                batchName: "headers",
                                helpMsg: i18n(`${i18nPrefix}.headers.helpMsg`),
                                initRows: 0,
                                subFormFlag: "Y",
                                fieldList: [
                                    {
                                        label: i18n(`${i18nPrefix}.headerName`),
                                        fieldName: "paramName",
                                        required: true,
                                        formVisible: true,
                                        listVisible: true,
                                        preps: {colspan: 8},
                                    },
                                    {
                                        label: i18n(`${i18nPrefix}.headerValue`),
                                        fieldName: "paramValue",
                                        formVisible: true,
                                        listVisible: true,
                                        preps: {colspan: 10},
                                    },
                                    {
                                        label: i18n(`${i18nPrefix}.valueType`),
                                        fieldName: "valueType",
                                        type: "select",
                                        defaultValue: "static",
                                        formVisible: true,
                                        listVisible: true,
                                        preps: {values: valueTypeList, colspan: 6},
                                    },
                                ],
                            }],
                        },
                            {
                                batchFieldList: [{
                                    title: i18n(`${i18nPrefix}.requestParams`),
                                    batchName: "requestParams",
                                    helpMsg: i18n(`${i18nPrefix}.requestParams.helpMsg`),
                                    initRows: 0,
                                    fieldList: [
                                        {
                                            label: i18n(`${i18nPrefix}.paramName`),
                                            fieldName: "paramName",
                                            required: true,
                                            formVisible: true,
                                            listVisible: true,
                                            preps: {colspan: 8},
                                        },
                                        {
                                            label: i18n(`${i18nPrefix}.paramValue`),
                                            fieldName: "paramValue",
                                            formVisible: true,
                                            listVisible: true,
                                            preps: {colspan: 10},
                                        },
                                        {
                                            label: i18n(`${i18nPrefix}.valueType`),
                                            fieldName: "valueType",
                                            type: "select",
                                            defaultValue: "static",
                                            formVisible: true,
                                            listVisible: true,
                                            preps: {values: valueTypeList, colspan: 6},
                                        },
                                    ],
                                }],
                            }]
                    }, {
                        title: "出参配置",
                        tabName: "c",
                        objectName: "c",
                        fieldList: [{
                            label: i18n("dyform.apiSource.responseTemplate"),
                            fieldName: "responseTemplate",
                            type: "select",
                            defaultValue: "result_data_list",
                            required: true,
                            helpMsg: i18n("dyform.apiSource.responseTemplate.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {values: responseTemplateList, colspan: 24},
                        },
                            [
                                {
                                    label: i18n("dyform.apiSource.successCode"),
                                    fieldName: "successCode",
                                    helpMsg: i18n("dyform.apiSource.successCode.helpMsg"),
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                                {
                                    label: i18n("dyform.apiSource.codePath"),
                                    fieldName: "codePath",
                                    defaultValue: "code",
                                    helpMsg: i18n("dyform.apiSource.codePath.helpMsg"),
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                                {
                                    label: i18n("dyform.apiSource.dataPath"),
                                    fieldName: "dataPath",
                                    defaultValue: "data",
                                    helpMsg: i18n("dyform.apiSource.dataPath.helpMsg"),
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                            ]
                        ]
                    }
                ]
            },
        ],
    };
}


/**
 * Create Response tab for Data Source mode (labelField + valueField)
 */
export function createDataSourceResponseTab() {
    return {
        title: i18n("dyform.apiSource.tab.response"),
        tabName: "response",
        objectName: "response",
        fieldList: [
            [
                {
                    label: i18n("dyform.apiSource.labelField"),
                    fieldName: "labelField",
                    required: true,
                    helpMsg: i18n("dyform.apiSource.labelField.helpMsg"),
                    formVisible: true,
                    listVisible: true,
                    preps: {colspan: 12},
                },
                {
                    label: i18n("dyform.apiSource.valueField"),
                    fieldName: "valueField",
                    required: true,
                    helpMsg: i18n("dyform.apiSource.valueField.helpMsg"),
                    formVisible: true,
                    listVisible: true,
                    preps: {colspan: 12},
                },
            ],
        ],
    };
}

/**
 * Create Response tab for Linkage mode (fieldMappings)
 * @param formFields - form field options for target field dropdown
 */
export function createLinkageResponseTab(formFields: SelectOption[]) {
    return {
        title: i18n("dyform.relation.apiLinkage.tab.response"),
        tabName: "response",
        objectName: "response",
        fieldList: [
            // Field Mappings
            {
                batchFieldList: [{
                    batchName: "fieldMappings",
                    title: i18n("dyform.relation.apiLinkage.fieldMapping"),
                    initRows: 0,
                    fieldList: [
                        {
                            label: i18n("dyform.relation.apiLinkage.sourceField"),
                            fieldName: "sourceField",
                            required: true,
                            helpMsg: i18n("dyform.relation.apiLinkage.sourceField.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 6},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.targetField"),
                            fieldName: "distField",
                            type: "select",
                            required: true,
                            helpMsg: i18n("dyform.relation.apiLinkage.targetField.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {
                                values: formFields,
                                allowCreate: true,
                                filterable: true,
                                colspan: 6,
                            },
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.typeConvert"),
                            fieldName: "typeConvert",
                            type: "select",
                            helpMsg: i18n("dyform.relation.apiLinkage.typeConvert.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {
                                values: typeConvertList,
                                allowCreate: true,
                                colspan: 6,
                            },
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.transform"),
                            fieldName: "transform",
                            helpMsg: i18n("dyform.relation.apiLinkage.transform.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 6},
                        },
                    ],
                }],
            },
        ],
    };
}

/**
 * Build complete API config with mode-specific response tab
 * @param mode - "dataSource" or "linkage"
 * @param formFields - form field options (only used in linkage mode)
 */
export function createApiConfig(mode: "dataSource" | "linkage", formFields?: SelectOption[]) {
    const i18nPrefix = mode === "dataSource" ? "dyform.apiSource" : "dyform.relation.apiLinkage";
    const defaultMethod = mode === "dataSource" ? "GET" : "POST";

    const responseTab = mode === "dataSource"
        ? createDataSourceResponseTab()
        : createLinkageResponseTab(formFields || []);

    return {
        fieldList: [
            {
                fieldName: "apiInfo",
                formVisible: true,
                tabList: [
                    createRequestTab("接口配置", i18nPrefix, "apiInfo", defaultMethod),
                    responseTab,
                    createRequestTab("认证配置", i18nPrefix, "authInfo", defaultMethod),
                ],
            }]
    };
}
