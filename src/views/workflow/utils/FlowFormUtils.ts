import {isRef, reactive, ref} from "vue";
import {error, PageFieldInfo, piniaInstance, postRequest, SelectOption, success,} from "star-horse-lowcode";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {loadSvgIcons} from "@/api/star_horse_utils";

const flowDesign = useFlowDesignStore(piniaInstance);
const flowGroups = ref<SelectOption[]>([]);
const formVisibleTypeList = ref<SelectOption[]>([
    {name: "标签栏", value: "tab"},
    {name: "步进式", value: "step"},
    {name: "顺序显示", value: "seq"},
]);
const flowFormFields = reactive<PageFieldInfo>({
    fieldList: [
        {
            label: "流程名称",
            fieldName: "name",

            required: true,
            formVisible: true,
            listVisible: true,
        },
        {
            label: "流程分类",
            fieldName: "flowGroup",
            type: "radio",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
                radioType:"button",
                values: flowGroups,
            },
        },

        {
            label: "绑定表单",
            fieldName: "bindFormName",
            aliasName: "formId",
            type: "dialog-input",
            preps: {
                multiple: false,
                primaryKey: "idDynamicForm",
                dataUrl: {
                    pageListUrl: "/userdb-manage/userdb/dynamicForm/pageList",
                },
                needField: [
                    {sourceField: "formName", distField: "bindFormName"},
                    {sourceField: "idDynamicForm", distField: "formId"},
                ],
                searchFieldList:[],
                fieldList: [
                    {
                        label: "表单名称",
                        fieldName: "formName",
                        searchVisible: true,
                        listVisible: true,
                    },
                    {
                        label: "表单图标",
                        type: "icon",
                        fieldName: "formIcon",
                        listVisible: true,
                        preps: {
                            iconType: "user",
                            values: loadSvgIcons(),
                        },
                    },
                    {
                        label: "创建人",

                        fieldName: "createdBy",
                        listVisible: true,
                    },

                ],
            },
            required: false,
            formVisible: true,
            listVisible: true,
            actions: {
                change: (val: any) => {
                    flowDesign.flowSetFormInfo(val);
                },
            },
        },
        {
            label: "流程图类型",
            fieldName: "flowType",
            listVisible: true,
        },
        {
            label: "流程版本",
            fieldName: "flowVersion",

            listVisible: true,
        },
        [{
            label: "多表单显示模式",
            fieldName: "formVisibleType",
            type: "radio",
            defaultValue: "step",
            formVisible: true,
            listVisible: true,
            preps: {
                radioType:"button",
                values: formVisibleTypeList,
            },
        },
        {
            label: "图标",
            fieldName: "flowIcon",
            type: "icon",
            defaultValue: "document",
            formVisible: true,
            listVisible: true,
            preps: {
                iconType: "user",
                values: loadSvgIcons(),
            },
        }],
        {
            label: "谁可以管理这个流程",
            fieldName: "flowManagerName",
            aliasName: "flowManager",
            type: "page-select",
            formVisible: true,
            listVisible: true,
            preps: {
                multiple: true,
                primaryKey: "idEmployeeInfo",
                dataUrl: {
                    pageListUrl: "/system-config/system/employeeInfo/pageList",
                },
                needField: [
                    {sourceField: "name", distField: "flowManagerName"},
                    {sourceField: "idEmployeeInfo", distField: "flowManager"},
                ],
                fieldList: [
                    {
                        label: "姓名",

                        searchVisible: true,
                        fieldName: "name",
                        listVisible: true,
                    },
                    {
                        label: "用户名",

                        searchVisible: true,
                        fieldName: "employeeNo",
                        listVisible: true,
                    },
                ],
            },
        },
        {
            label: "说明",
            fieldName: "remark",
            type: "textarea",
            formVisible: true,
            preps: {
                rows: 7
            }
        },
    ],
});
const setFlowGroups = (data: any) => {
    flowGroups.value = data;
};
/**
 * 保存数据
 * @param formInfo
 * @param type
 * @param router
 */
const doSaveData = (formInfo: any, type: string, router?: any) => {
    formInfo = isRef(formInfo) ? formInfo.value : formInfo;
    formInfo.submitType = type;
    formInfo.process = flowDesign.node;
    postRequest(
        "/flow-engine/workflow/flowdefinition/saveOrDeployProcess",
        formInfo,
    ).then((reData) => {
        const res = reData.data;
        if (res.code) {
            error(res.message);
            return;
        } else {
            success(type == "publish" ? "发布成功" : "保存成功");
            if (router) {
                router.push({
                    path: "/workflow/FlowDefineUi",
                });
            }
        }
    });
};
export {flowFormFields, formVisibleTypeList, doSaveData, setFlowGroups};
