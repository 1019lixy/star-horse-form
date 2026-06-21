import {i18n} from "@/lang";
import {dataType, httpMethod, SelectOption} from "star-horse-lowcode";

/**
 * 响应模板选项
 */
const responseTemplateList: SelectOption[] = [
    {name: i18n("dyform.relation.template.result_data"), value: "result_data"},
    {name: i18n("dyform.relation.template.result_data_list"), value: "result_data_list"},
    {name: i18n("dyform.relation.template.result_data_map"), value: "result_data_map"},
    {name: i18n("dyform.relation.template.map"), value: "map"},
    {name: i18n("dyform.relation.template.list"), value: "list"},
];

/**
 * 认证类型选项
 */
const authTypeList: SelectOption[] = [
    {name: i18n("dyform.relation.auth.none"), value: "none"},
    {name: i18n("dyform.relation.auth.login"), value: "login"},
    {name: i18n("dyform.relation.auth.basic"), value: "basic"},
    {name: i18n("dyform.relation.auth.bearer"), value: "bearer"},
    {name: i18n("dyform.relation.auth.custom"), value: "custom"},
];

/**
 * 类型转换选项
 */
const typeConvertList: SelectOption[] = [
    {name: i18n("dyform.relation.apiLinkage.typeConvert.string"), value: "string"},
    {name: i18n("dyform.relation.apiLinkage.typeConvert.number"), value: "number"},
    {name: i18n("dyform.relation.apiLinkage.typeConvert.boolean"), value: "boolean"},
    {name: i18n("dyform.relation.apiLinkage.typeConvert.array"), value: "array"},
];

/**
 * 生成接口联动配置（Tabs布局）
 * 简化设计：接口联动不需要选"被控制属性"，字段映射已定义目标字段
 * @param formFields 表单字段列表，用于字段映射的目标字段下拉
 */
export function createApiLinkageConfig(formFields: SelectOption[]) {
    return {
        fieldName: "basic",
        formVisible: true,
        tabList: [
            {
                title: i18n("dyform.relation.apiLinkage.tab.basic"),
                tabName: "basic",
                objectName: "basic",
                fieldList: [
                    {
                        label: i18n("dyform.relation.apiLinkage.url"),
                        fieldName: "url",
                        required: true,
                        helpMsg: i18n("dyform.relation.apiLinkage.url.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 24},
                    },
                    [
                        {
                            label: i18n("dyform.relation.apiLinkage.httpMethod"),
                            fieldName: "httpMethod",
                            type: "select",
                            defaultValue: "POST",
                            required: true,
                            formVisible: true,
                            listVisible: true,
                            preps: {values: httpMethod(), colspan: 12},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.dataType"),
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
                            label: i18n("dyform.relation.apiLinkage.protocol"),
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
                            label: i18n("dyform.relation.apiLinkage.host"),
                            fieldName: "host",
                            helpMsg: i18n("dyform.relation.apiLinkage.host.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.port"),
                            fieldName: "port",
                            type: "number",
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                    ],
                    {
                        label: i18n("dyform.relation.apiLinkage.env"),
                        fieldName: "env",
                        helpMsg: i18n("dyform.relation.apiLinkage.env.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 12},
                    },
                    {
                        label: i18n("dyform.relation.apiLinkage.timeout"),
                        fieldName: "timeout",
                        type: "number",
                        defaultValue: 120,
                        helpMsg: i18n("dyform.relation.apiLinkage.timeout.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 12},
                    },
                    // Nacos service name (for microservice internal calls)
                    {
                        label: i18n("dyform.relation.apiLinkage.serviceName"),
                        fieldName: "serviceName",
                        helpMsg: i18n("dyform.relation.apiLinkage.serviceName.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 24},
                    },
                    // Request Parameters - table format
                    {
                        batchFieldList: [{
                            title: i18n("dyform.relation.apiLinkage.tab.params"),
                            batchName: "requestParams",
                            initRows: 0,
                            fieldList: [
                                {
                                    label: i18n("dyform.relation.apiLinkage.paramName"),
                                    fieldName: "paramName",
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                                {
                                    label: i18n("dyform.relation.apiLinkage.paramValue"),
                                    fieldName: "paramValue",
                                    helpMsg: i18n("dyform.relation.apiLinkage.paramValue.helpMsg"),
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 14},
                                },
                            ],
                        }],
                    },
                    // Custom Body
                    {
                        label: i18n("dyform.relation.apiLinkage.body"),
                        fieldName: "body",
                        type: "json",
                        formVisible: true,
                        listVisible: true,
                        helpMsg: i18n("dyform.relation.apiLinkage.body.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                ],
            },
            {
                title: i18n("dyform.relation.apiLinkage.tab.response"),
                tabName: "response",
                objectName: "response",
                fieldList: [
                    {
                        label: i18n("dyform.relation.apiLinkage.responseTemplate"),
                        fieldName: "responseTemplate",
                        type: "select",
                        defaultValue: "result_data",
                        required: true,
                        helpMsg: i18n("dyform.relation.apiLinkage.responseTemplate.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {values: responseTemplateList, colspan: 24},
                    },
                    [
                        {
                            label: i18n("dyform.relation.apiLinkage.successCode"),
                            fieldName: "successCode",
                            helpMsg: i18n("dyform.relation.apiLinkage.successCode.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.codePath"),
                            fieldName: "codePath",
                            defaultValue: "code",
                            helpMsg: i18n("dyform.relation.apiLinkage.codePath.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.dataPath"),
                            fieldName: "dataPath",
                            defaultValue: "data",
                            helpMsg: i18n("dyform.relation.apiLinkage.dataPath.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.relation.apiLinkage.messagePath"),
                            fieldName: "messagePath",
                            defaultValue: "message",
                            helpMsg: i18n("dyform.relation.apiLinkage.messagePath.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                    ],

                    {
                        batchFieldList: [{
                            batchName: "fieldMappings",
                            title:i18n("dyform.relation.apiLinkage.fieldMapping"),
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
                                    fieldName: "targetField",
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
            },
            {
                title: i18n("dyform.relation.apiLinkage.tab.auth"),
                tabName: "auth",
                objectName: "auth",
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
                    // 登录接口配置
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
                    // Basic认证
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
                    // 自定义请求头 (non-auth headers -> po.headers Map)
                    {
                        label: i18n("dyform.relation.apiLinkage.headers"),
                        fieldName: "headers",
                        type: "json",
                        formVisible: true,
                        listVisible: true,
                        helpMsg: i18n("dyform.relation.apiLinkage.headers.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                    // 自定义认证头 (auth custom mode -> po.authInfo Map)
                    {
                        label: i18n("dyform.relation.apiLinkage.customHeaders"),
                        fieldName: "customHeaders",
                        type: "json",
                        formVisible: false,
                        helpMsg: i18n("dyform.relation.apiLinkage.authCustomHeaders.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                ],
            },
        ],
    };
}
