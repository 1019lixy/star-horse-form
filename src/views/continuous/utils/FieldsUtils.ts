import {reactive, ref} from "vue";
import {loadData, PageFieldInfo, SelectOption} from "star-horse-lowcode";

const branchList = ref<SelectOption[]>([])
const loadBranch = (idProjectInfo: string) => {
    loadData(`/continuous-manage/continuous/repoHooks/branches/${idProjectInfo}`, {}).then((res) => {
        branchList.value = res.data
    });
}
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
                                
                                defaultValue: "测试",
                                required: true,
                                formVisible: true,
                                listVisible: true
                            },
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


                        ],[{
                            label: "项目名称",
                            fieldName: "projectName",
                            aliasName: "idProjectInfo",
                            type: "dialog-input",
                            required: true,
                            formVisible: true,
                            listVisible: true,
                            preps:{
                                recall: (data: any) => {
                                    loadBranch(data.idProjectInfo)
                                },
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
                                    
                                    required: true,
                                    prefix: "a",
                                    formVisible: true,
                                    listVisible: true,
                                    searchVisible: true,
                                },
                                    {
                                        label: "程序语言",
                                        fieldName: "programLanguage",
                                        
                                        prefix: "a",
                                        required: false,
                                        formVisible: true,
                                        listVisible: true,
                                        searchVisible: true,
                                    },
                                    {
                                        label: "代码库地址",
                                        fieldName: "repoUrl",
                                        
                                        required: false,
                                        formVisible: true,
                                        listVisible: true,

                                    }
                                ]
                            },
                        },
                            {
                                label: "代码分支",
                                fieldName: "codeBranch",
                                type: "select",
                                required: false,
                                defaultValue: "master",
                                optionList: branchList,
                                formVisible: true,
                                listVisible: true,

                            }],
                            [ {
                                label: "Cron定时触发",
                                fieldName: "cron",
                                type: "cron",
                                helpMsg: "不设置则表示手动触发",
                                required: false,
                                formVisible: true,
                                listVisible: true
                            },{
                                label: "代码下载目标目录",
                                fieldName: "targetDir",
                                
                                required: false,
                                formVisible: true,
                                listVisible: true,

                            }
                        ]
                    ]
                }
            ]
        }
    ]
});
export {pipelineFields}
