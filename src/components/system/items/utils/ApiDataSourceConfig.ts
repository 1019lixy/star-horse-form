import {i18n} from "@/lang";
import {dataType, httpMethod, SelectOption} from "star-horse-lowcode";

/**
 * Response template options for API data source
 */
const responseTemplateList: SelectOption[] = [
    {name: i18n("dyform.relation.template.result_data"), value: "result_data"},
    {name: i18n("dyform.relation.template.result_data_list"), value: "result_data_list"},
    {name: i18n("dyform.relation.template.result_data_map"), value: "result_data_map"},
    {name: i18n("dyform.relation.template.map"), value: "map"},
    {name: i18n("dyform.relation.template.list"), value: "list"},
];

/**
 * Auth type options
 */
const authTypeList: SelectOption[] = [
    {name: i18n("dyform.relation.auth.none"), value: "none"},
    {name: i18n("dyform.relation.auth.login"), value: "login"},
    {name: i18n("dyform.relation.auth.basic"), value: "basic"},
    {name: i18n("dyform.relation.auth.bearer"), value: "bearer"},
    {name: i18n("dyform.relation.auth.custom"), value: "custom"},
];

/**
 * Value type options (static / dynamic)
 */
const valueTypeList: SelectOption[] = [
    {name: i18n("dyform.apiSource.valueType.static"), value: "static"},
    {name: i18n("dyform.apiSource.valueType.dynamic"), value: "dynamic"},
];

/**
 * Generate API Data Source configuration (Tabs layout)
 * Used to configure a third-party API as the data source for dropdown/select fields.
 */
export function createApiDataSourceConfig() {
    return {
        fieldName: "apiSourceRequest",
        formVisible: true,
        tabList: [
            // ── Tab 1: Request ──
            {
                title: i18n("dyform.apiSource.tab.request"),
                tabName: "apiSourceRequest",
                objectName: "apiSourceRequest",
                fieldList: [
                    {
                        label: i18n("dyform.apiSource.url"),
                        fieldName: "url",
                        required: true,
                        helpMsg: i18n("dyform.apiSource.url.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 24},
                    },
                    [
                        {
                            label: i18n("dyform.apiSource.httpMethod"),
                            fieldName: "httpMethod",
                            type: "select",
                            defaultValue: "GET",
                            required: true,
                            formVisible: true,
                            listVisible: true,
                            preps: {values: httpMethod(), colspan: 12},
                        },
                        {
                            label: i18n("dyform.apiSource.dataType"),
                            fieldName: "dataType",
                            type: "select",
                            defaultValue: "JSON",
                            required: true,
                            formVisible: true,
                            listVisible: true,
                            preps: {values: dataType(), colspan: 12},
                        },
                    ],
                    [
                        {
                            label: i18n("dyform.apiSource.protocol"),
                            fieldName: "protocol",
                            type: "select",
                            defaultValue: "http",
                            formVisible: true,
                            listVisible: true,
                            preps: {
                                values: [{name: "HTTP", value: "http"}, {name: "HTTPS", value: "https"}],
                                colspan: 8,
                            },
                        },
                        {
                            label: i18n("dyform.apiSource.host"),
                            fieldName: "host",
                            helpMsg: i18n("dyform.apiSource.host.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.apiSource.port"),
                            fieldName: "port",
                            type: "number",
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                    ],
                    {
                        label: i18n("dyform.apiSource.env"),
                        fieldName: "env",
                        helpMsg: i18n("dyform.apiSource.env.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 24},
                    },
                    // Headers
                    {
                        batchFieldList: [{
                            title: i18n("dyform.apiSource.headers"),
                            batchName: "headers",
                            helpMsg: i18n("dyform.apiSource.headers.helpMsg"),
                            initRows: 0,
                            fieldList: [
                                {
                                    label: i18n("dyform.apiSource.headerName"),
                                    fieldName: "name",
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                                {
                                    label: i18n("dyform.apiSource.headerValue"),
                                    fieldName: "value",
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 10},
                                },
                                {
                                    label: i18n("dyform.apiSource.valueType"),
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
                    // Request Parameters
                    {
                        batchFieldList: [{
                            title: i18n("dyform.apiSource.requestParams"),
                            batchName: "requestParams",
                            helpMsg: i18n("dyform.apiSource.requestParams.helpMsg"),
                            initRows: 0,
                            fieldList: [
                                {
                                    label: i18n("dyform.apiSource.paramName"),
                                    fieldName: "paramName",
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                                {
                                    label: i18n("dyform.apiSource.paramValue"),
                                    fieldName: "paramValue",
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 10},
                                },
                                {
                                    label: i18n("dyform.apiSource.valueType"),
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
                    // Custom Body
                    {
                        label: i18n("dyform.apiSource.customBody"),
                        fieldName: "customBody",
                        type: "json",
                        formVisible: true,
                        listVisible: true,
                        helpMsg: i18n("dyform.apiSource.customBody.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                ],
            },
            // ── Tab 2: Response ──
            {
                title: i18n("dyform.apiSource.tab.response"),
                tabName: "apiSourceResponse",
                objectName: "apiSourceResponse",
                fieldList: [
                    {
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
                    ],
                    {type: "divider", formVisible: true, listVisible: true},
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
            },
            // ── Tab 3: Authentication ──
            {
                title: i18n("dyform.apiSource.tab.auth"),
                tabName: "apiSourceAuth",
                objectName: "apiSourceAuth",
                fieldList: [
                    {
                        label: i18n("dyform.relation.apiLinkage.authType"),
                        fieldName: "authType",
                        type: "select",
                        defaultValue: "none",
                        formVisible: true,
                        listVisible: true,
                        preps: {
                            values: authTypeList,
                            colspan: 24,
                            dataRelation: {
                                actionName: "change",
                                relationDetails: [
                                    {
                                        matchType: "eq",
                                        controlCondition: "eqVisible",
                                        relationFields: ["loginUrl", "loginMethod", "loginAccount", "loginPassword", "loginParams", "loginTokenPath", "loginHeaderName"],
                                        matchFieldValue: "login",
                                    },
                                    {
                                        matchType: "eq",
                                        controlCondition: "eqVisible",
                                        relationFields: ["basicUsername", "basicPassword"],
                                        matchFieldValue: "basic",
                                    },
                                    {
                                        matchType: "eq",
                                        controlCondition: "eqVisible",
                                        relationFields: ["bearerToken"],
                                        matchFieldValue: "bearer",
                                    },
                                    {
                                        matchType: "eq",
                                        controlCondition: "eqVisible",
                                        relationFields: ["customHeaders"],
                                        matchFieldValue: "custom",
                                    },
                                ],
                            },
                        },
                    },
                    // Login config
                    {
                        type: "divider",
                        formVisible: false,
                        fieldName: "loginDivider",
                        preps: {
                            bareFlag: "Y",
                            content: i18n("dyform.relation.apiLinkage.loginConfig"),
                        },
                    },
                    {
                        label: i18n("dyform.relation.apiLinkage.loginUrl"),
                        fieldName: "loginUrl",
                        formVisible: false,
                        helpMsg: i18n("dyform.relation.apiLinkage.loginUrl.helpMsg"),
                        preps: {colspan: 24},
                    },
                    {
                        label: i18n("dyform.relation.apiLinkage.loginMethod"),
                        fieldName: "loginMethod",
                        type: "select",
                        defaultValue: "POST",
                        formVisible: false,
                        preps: {values: httpMethod(), colspan: 12},
                    },
                    [
                        {
                            label: i18n("dyform.relation.apiLinkage.loginAccount"),
                            fieldName: "loginAccount",
                            helpMsg: i18n("dyform.relation.apiLinkage.loginAccount.helpMsg"),
                            formVisible: false,
                            preps: {colspan: 12},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.loginPassword"),
                            fieldName: "loginPassword",
                            type: "password",
                            formVisible: false,
                            preps: {colspan: 12},
                        },
                    ],
                    {
                        label: i18n("dyform.relation.apiLinkage.loginParams"),
                        fieldName: "loginParams",
                        type: "json",
                        formVisible: false,
                        helpMsg: i18n("dyform.relation.apiLinkage.loginParams.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                    {
                        label: i18n("dyform.relation.apiLinkage.loginTokenPath"),
                        fieldName: "loginTokenPath",
                        formVisible: false,
                        helpMsg: i18n("dyform.relation.apiLinkage.loginTokenPath.helpMsg"),
                        preps: {colspan: 24},
                    },
                    {
                        label: i18n("dyform.relation.apiLinkage.loginHeaderName"),
                        fieldName: "loginHeaderName",
                        formVisible: false,
                        defaultValue: "Authorization",
                        helpMsg: i18n("dyform.relation.apiLinkage.loginHeaderName.helpMsg"),
                        preps: {colspan: 24},
                    },
                    // Basic auth
                    {
                        label: i18n("dyform.relation.apiLinkage.basicUsername"),
                        fieldName: "basicUsername",
                        formVisible: false,
                        preps: {colspan: 12},
                    },
                    {
                        label: i18n("dyform.relation.apiLinkage.basicPassword"),
                        fieldName: "basicPassword",
                        type: "password",
                        formVisible: false,
                        preps: {colspan: 12},
                    },
                    // Bearer Token
                    {
                        label: i18n("dyform.relation.apiLinkage.bearerToken"),
                        fieldName: "bearerToken",
                        type: "textarea",
                        formVisible: false,
                        preps: {colspan: 24},
                    },
                    // Custom headers
                    {
                        label: i18n("dyform.relation.apiLinkage.customHeaders"),
                        fieldName: "customHeaders",
                        type: "json",
                        formVisible: false,
                        helpMsg: i18n("dyform.relation.apiLinkage.headers.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                ],
            },
        ],
    };
}
