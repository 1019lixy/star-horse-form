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
 * 生成数据源-第三方接口配置字段（Tabs布局）
 * Tab1: 接口配置 - 业务接口地址、请求方式、入参、请求头
 * Tab2: 登录配置 - 登录接口地址、请求方式、账号密码、Token路径
 * Tab3: 响应配置 - 响应模板、数据路径、选项映射
 */
export function createApiDataSourceFields(): any {
    return {
        fieldName: "interface",
        formVisible: true,
        tabList: [
            {
                title: i18n("dyform.dataSource.api.tab.interface"),
                tabName: "interface",
                objectName: "interface",
                fieldList: [
                    {
                        label: i18n("dyform.dataSource.api.url"),
                        fieldName: "apiUrl",
                        required: true,
                        helpMsg: i18n("dyform.dataSource.api.url.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {colspan: 24},
                    },
                    [
                        {
                            label: i18n("dyform.dataSource.api.httpMethod"),
                            fieldName: "apiHttpMethod",
                            type: "select",
                            defaultValue: "POST",
                            required: true,
                            formVisible: true,
                            listVisible: true,
                            preps: {values: httpMethod(), colspan: 12},
                        },
                        {
                            label: i18n("dyform.dataSource.api.dataType"),
                            fieldName: "apiDataType",
                            type: "select",
                            defaultValue: "JSON",
                            required: true,
                            formVisible: true,
                            listVisible: true,
                            preps: {values: dataType(), colspan: 12},
                        },
                    ],
                    // 请求头

                    {
                        label: i18n("dyform.dataSource.api.customHeaders"),
                        fieldName: "apiHeaders",
                        type: "json",
                        formVisible: true,
                        listVisible: true,
                        helpMsg: i18n("dyform.dataSource.api.headers.helpMsg"),
                        preps: {colspan: 24, devType: "Y"},
                    },
                    {
                        batchFieldList: [{
                            title: i18n("dyform.dataSource.api.requestParams"),
                            batchName: "apiRequestParams",
                            initRows: 0,
                            fieldList: [
                                {
                                    label: i18n("dyform.dataSource.api.paramName"),
                                    fieldName: "paramName",
                                    required: true,
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 8},
                                },
                                {
                                    label: i18n("dyform.dataSource.api.paramValue"),
                                    fieldName: "paramValue",
                                    helpMsg: i18n("dyform.dataSource.api.paramValue.helpMsg"),
                                    formVisible: true,
                                    listVisible: true,
                                    preps: {colspan: 14},
                                },
                            ],
                        }],
                    },

                ],
            },
            {
                title: i18n("dyform.dataSource.api.tab.login"),
                tabName: "login",
                objectName: "login",
                fieldList: [
                    {
                        label: i18n("dyform.dataSource.api.needLogin"),
                        fieldName: "apiNeedLogin",
                        type: "switch",
                        defaultValue: "N",
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
                                        relationFields: ["apiLoginUrl",
                                            "apiLoginMethod", "apiLoginAccount",
                                            "apiLoginPassword", "apiLoginTokenPath",
                                            "apiLoginHeaderName"],
                                        matchFieldValue: "Y",
                                    },
                                ],
                            },
                        },
                    },
                    {
                        label: i18n("dyform.dataSource.api.loginUrl"),
                        fieldName: "apiLoginUrl",
                        required: true,
                        formVisible: false,
                        helpMsg: i18n("dyform.dataSource.api.loginUrl.helpMsg"),
                        preps: {colspan: 24},
                    },
                    {
                        label: i18n("dyform.dataSource.api.loginMethod"),
                        fieldName: "apiLoginMethod",
                        type: "select",
                        defaultValue: "POST",
                        required: true,
                        formVisible: false,
                        preps: {values: httpMethod(), colspan: 12},
                    },
                    {
                        label: i18n("dyform.dataSource.api.loginAccount"),
                        fieldName: "apiLoginAccount",
                        required: true,
                        formVisible: false,
                        preps: {colspan: 12},
                    },
                    {
                        label: i18n("dyform.dataSource.api.loginPassword"),
                        fieldName: "apiLoginPassword",
                        type: "password",
                        required: true,
                        formVisible: false,
                        preps: {colspan: 12},
                    },
                    [
                        {
                            label: i18n("dyform.dataSource.api.loginTokenPath"),
                            fieldName: "apiLoginTokenPath",
                            defaultValue: "data.token",
                            helpMsg: i18n("dyform.dataSource.api.loginTokenPath.helpMsg"),
                            formVisible: false,
                            preps: {colspan: 12},
                        },
                        {
                            label: i18n("dyform.dataSource.api.loginHeaderName"),
                            fieldName: "apiLoginHeaderName",
                            defaultValue: "Authorization",
                            helpMsg: i18n("dyform.dataSource.api.loginHeaderName.helpMsg"),
                            formVisible: false,
                            preps: {colspan: 12},
                        },
                    ],
                ],
            },
            {
                title: i18n("dyform.dataSource.api.tab.response"),
                tabName: "response",
                objectName: "response",
                fieldList: [
                    {
                        label: i18n("dyform.dataSource.api.responseTemplate"),
                        fieldName: "apiResponseTemplate",
                        type: "select",
                        defaultValue: "result_data",
                        required: true,
                        helpMsg: i18n("dyform.dataSource.api.responseTemplate.helpMsg"),
                        formVisible: true,
                        listVisible: true,
                        preps: {values: responseTemplateList, colspan: 24},
                    },
                    [
                        {
                            label: i18n("dyform.dataSource.api.successCode"),
                            fieldName: "apiSuccessCode",
                            defaultValue: 0,
                            helpMsg: i18n("dyform.dataSource.api.successCode.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.dataSource.api.codePath"),
                            fieldName: "apiCodePath",
                            defaultValue: "code",
                            helpMsg: i18n("dyform.dataSource.api.codePath.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                        {
                            label: i18n("dyform.dataSource.api.dataPath"),
                            fieldName: "apiDataPath",
                            defaultValue: "data",
                            helpMsg: i18n("dyform.dataSource.api.dataPath.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 8},
                        },
                    ],
                    // 选项映射
                    {
                        type: "divider",
                        formVisible: true,
                        fieldName: "apiMappingDivider",
                        preps: {
                            bareFlag: "Y",
                            content: i18n("dyform.dataSource.api.optionMapping"),
                        },
                    },
                    [
                        {
                            label: i18n("dyform.dataSource.api.labelField"),
                            fieldName: "apiLabelField",
                            required: true,
                            helpMsg: i18n("dyform.dataSource.api.labelField.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 12},
                        },
                        {
                            label: i18n("dyform.dataSource.api.valueField"),
                            fieldName: "apiValueField",
                            required: true,
                            helpMsg: i18n("dyform.dataSource.api.valueField.helpMsg"),
                            formVisible: true,
                            listVisible: true,
                            preps: {colspan: 12},
                        },
                    ],
                ],
            },
        ],
    };
}
