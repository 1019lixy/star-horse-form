/**
 * 工具参数
 */
import {ref} from "vue";
import {FieldInfo, SelectOption,} from "star-horse-lowcode";
// @ts-ignore
import {loadDict} from "@/api/star_horse_apis";

const linkExecServerList = ref<SelectOption[]>([]);
const codeCommitorList = ref<SelectOption[]>([]);

const reportPersonList = ref<SelectOption[]>([]);
const reportTypeList = ref<SelectOption[]>([]);


/**
 * 其它拓展配置
 */
const extendCommonFields: FieldInfo[] | any = [
    {
        fieldName: "row1",
        collapseList: [
            {
                title: "高级设置",
                tabName: "row1",
                subFormFlag: "N",
                objectName: "advancedSetting",
                fieldList: [[
                    {
                        label: "  ",
                        type: "checkbox",
                        formVisible: true,
                        fieldName: "singleImageFlag",
                        preps: {
                            values: [{name: "使用唯一镜像名称", value: "Y"}],
                            colspan: 6,
                            border: "Y",
                        },
                    },
                    {
                        label: "关联使用执行机",
                        type: "select",
                        formVisible: true,
                        fieldName: "linkExecServer",
                        preps: {
                            values: linkExecServerList,
                            colspan: 6,
                        },
                    },
                ],
                ],
            },
            {
                title: "运行结果通知",
                tabName: "result",
                subFormFlag: "Y",
                objectName: "resultReport",
                fieldList: [
                    [
                        {
                            label: "失败时通知",
                            type: "switch",
                            defaultValue: "N",
                            fieldName: "errorReport",
                            formVisible: true,

                            preps: {
                                dataRelation: {
                                    actionName: "change",
                                    relationDetails: [
                                        {
                                            matchType: "eq",
                                            controlCondition: "eqVisible",
                                            relationFields: ["errorReportPerson", "errorReportType"],
                                            matchFieldValue: "Y",
                                        },
                                    ]
                                },
                                activeValue: "Y",
                                inactiveValue: "N",
                                colspan: 6,
                            },
                        },
                    ],
                    {
                        label: "通知人",
                        type: "checkbox",
                        formVisible: false,
                        fieldName: "errorReportPerson",
                        preps: {
                            dataRelation: {
                                actionName: "change",
                                relationDetails: [
                                    {
                                        matchType: "eq",
                                        controlCondition: "eqVisible",
                                        relationFields: ["errorCodeCommitor"],
                                        matchFieldValue: "coder",
                                    },
                                ]
                            },
                            values: reportPersonList,
                            border: "Y",
                        },
                        brotherNodes: [
                            {
                                type: "select",
                                label: "  ",
                                fieldName: "errorCodeCommitor",
                                preps: {
                                    values: codeCommitorList,
                                    multiple: true,
                                },
                            },
                        ],
                    },
                    {
                        label: "通知方式",
                        type: "checkbox",
                        formVisible: false,
                        fieldName: "errorReportType",
                        preps: {
                            values: reportTypeList,
                            border: "Y",
                        },
                    },
                    [
                        {
                            label: "成功时通知",
                            type: "switch",
                            defaultValue: "N",
                            fieldName: "successReport",
                            formVisible: true,
                            preps: {
                                dataRelation: {
                                    actionName: "change",
                                    relationDetails: [
                                        {
                                            matchType: "eq",
                                            controlCondition: "eqVisible",
                                            relationFields: ["successReportPerson", "successReportType"],
                                            matchFieldValue: "Y",
                                        },
                                    ]
                                },
                                activeValue: "Y",
                                inactiveValue: "N",
                                colspan: 6,
                            },
                        },
                    ],
                    {
                        label: "通知人",
                        type: "checkbox",
                        formVisible: false,
                        fieldName: "successReportPerson",
                        preps: {
                            dataRelation: {
                                actionName: "change",
                                relationDetails: [
                                    {
                                        matchType: "eq",
                                        controlCondition: "eqVisible",
                                        relationFields: ["successCodeCommitor"],
                                        matchFieldValue: "coder",
                                    },
                                ]
                            },
                            values: reportPersonList,
                            border: "Y",
                        },
                        brotherNodes: [
                            {
                                type: "select",
                                label: "  ",
                                fieldName: "successCodeCommitor",
                                preps: {
                                    values: codeCommitorList,
                                    multiple: true,
                                },
                            },
                        ],
                    },
                    {
                        label: "通知方式",
                        type: "checkbox",
                        formVisible: false,
                        fieldName: "successReportType",
                        preps: {
                            values: reportTypeList,
                        },
                    },
                ],
            },
        ],
    },
];


const dataInit = () => {

    loadDict("message_tools").then((res: any) => {
        reportTypeList.value = res;
    });
    loadDict("CONTINUS_JOB_REPORT_PERSON").then((res: any) => {
        console.log(res);
        reportPersonList.value = res;
    });
};


export {
    linkExecServerList,
    codeCommitorList,
    extendCommonFields,
    dataInit,
};
