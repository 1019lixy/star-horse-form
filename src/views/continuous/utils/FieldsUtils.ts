import {reactive} from "vue";
import {PageFieldInfo} from "star-horse-lowcode";

const pipelineFields = reactive<PageFieldInfo | any>({
    fieldList: [
        {
            cardList: [
                {
                    title: "基础信息",
                    tabName: "baseInfo",
                    fieldList: [
                        [
                            {
                                label: "流水线名称",
                                fieldName: "lineName",
                                type: "input",
                                defaultValue: "测试",
                                required: true,
                                formVisible: true,
                                listVisible: true
                            },
                            {
                                label: "代码分支",
                                fieldName: "codeBranch",
                                type: "input",
                                defaultValue: "1",
                                required: true,
                                formVisible: true,
                                listVisible: true
                            }
                        ],
                        [
                            {
                                label: "流水线类型",
                                fieldName: "lineType",
                                type: "select",
                                required: true,
                                defaultValue: "single",
                                formVisible: true,
                                listVisible: true,
                                preps: {
                                    dataSource: "dict",
                                    urlOrDictName: "PIPELINE_EXECUTION_TYPE",
                                }
                            },
                            {
                                label: "Cron定时触发",
                                fieldName: "cron",
                                type: "cron",
                                helpMsg: "不设置则表示手动触发",
                                required: false,
                                formVisible: true,
                                listVisible: true
                            }
                        ]
                    ]
                },
                {
                    title: "项目信息",
                    tableName: "dataSource",
                    fieldList: [
                        [
                            {
                                label: "项目名称",
                                fieldName: "projectName",
                                aliasName:"idProjectInfo",
                                type: "dialog-input",
                                required: true,
                                formVisible: true,
                                listVisible: true,
                                actionName:"change",
                                actions:(data:any)=>{

                                },
                                params: {
                                    primaryKey: "idProjectInfo",
                                    dataUrl: {
                                        pageListUrl: "continuous-manage/continuous/projectInfo/pageList",
                                    },
                                    needField: [
                                        {sourceField: "idProjectInfo", distField: "idProjectInfo"},
                                        {sourceField: "projectName", distField: "projectName"}
                                    ],

                                    fieldList: [{
                                        label: "项目名称",
                                        fieldName: "projectName",
                                        type: "input",
                                        required: true,
                                        prefix: "a",
                                        formVisible: !false,
                                        listVisible: !false,
                                        searchVisible: true,
                                    },
                                        {
                                            label: "程序语言",
                                            fieldName: "programLanguage",
                                            type: "input",
                                            prefix: "a",
                                            required: false,
                                            formVisible: !false,
                                            listVisible: !false,
                                            searchVisible: true,
                                        },
                                        {
                                            label: "代码库地址",
                                            fieldName: "repoUrl",
                                            type: "input",
                                            required: false,
                                            formVisible: !false,
                                            listVisible: !false,

                                        }
                                       ]
                                },
                            },

                            {
                                label: "自动触发",
                                fieldName: "autoExecution",
                                type: "switch",
                                defaultValue: "N",
                                required: false,
                                formVisible: true,
                                listVisible: true,

                            }
                        ],
                        [
                            {
                                label: "代码分支",
                                fieldName: "dataVersion",
                                type: "select",
                                required: false,
                                formVisible: true,
                                listVisible: true,
                                preps: {
                                    colspan: 8
                                }
                            },
                            {
                                label: "代码下载目标目录",
                                fieldName: "targetDir",
                                type: "input",
                                required: false,
                                formVisible: true,
                                listVisible: true,
                                preps: {
                                    colspan: 16
                                }
                            }
                        ]
                    ]
                }
            ]
        }
    ]
});
export {pipelineFields}
