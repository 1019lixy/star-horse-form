import {reactive, ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps.d.js";
import {PageFieldInfo} from "@/components/types/PageFieldInfo.d.js";

let flowGroups = ref<SelectOption[]>([]);
let formShowTypeList = ref<SelectOption[]>([
    {name: "标签栏", value: "tab"},
    {name: "步进式", value: "step"},
    {name: "顺序显示", value: "seq"},
]);
const flowFormFields = reactive<PageFieldInfo>({
    fieldList: [
        {
            label: "图标",
            fieldName: "icon",
            type: "icon",
            defaultValue: "document",
            formShow: true,
            tableShow: true
        },
        {
            label: "流程名称",
            fieldName: "flowName",
            type: "input",
            required: true,
            formShow: true,
            tableShow: true
        },
        {
            label: "流程分类",
            fieldName: "flowGroup",
            type: "select",
            optionList: flowGroups,
            required: true,
            formShow: true,
            tableShow: true
        },
        {
            label: "绑定表单",
            fieldName: "bindFormName",
            aliasName: "bindForm",
            type: "page-select",
            params: {
                primaryKey: "idDynamicForm",
                dataUrl: {
                    loadByPageUrl: "/userdb-manage/userdb/dynamicForm/pageList",
                },
                needField: [
                    {sourceField: "formName", distField: "bindFormName"},
                    {sourceField: "dataNo", distField: "bindForm"},
                ],
                fieldList: [{
                    label: "表单名称",
                    type: "input",
                    fieldName: "formName",
                    tableShow: true,
                }, {
                    label: "表单图标",
                    type: "icon",
                    fieldName: "formIcon",
                    tableShow: true,
                }, {
                    label: "创建人",
                    type: "input",
                    fieldName: "createdBy",
                    tableShow: true,
                }, {
                    label: "创建时间",
                    type: "input",
                    fieldName: "createdDate",
                    tableShow: true,
                }]
            },
            required: true,
            formShow: true,
            tableShow: true,
            preps: {
                multiple: "Y",
            }
        },
        {
            label: "流程图类型",
            fieldName: "flowType",
            type: "input",
            formShow: false,
            tableShow: true
        },
        {
            label: "流程版本",
            fieldName: "flowVersion",
            type: "input",
            formShow: false,
            tableShow: true
        },
        {
            label: "多表单显示模式",
            fieldName: "formShowType",
            type: "radio",
            optionList: formShowTypeList,
            defaultValue: "step",
            required: true,
            formShow: true,
            tableShow: true,
        },
        {
            label: "谁可以管理这个审批",
            fieldName: "flowManagerName",
            aliasName: "flowManager",
            type: "page-select",
            params: {
                primaryKey: "idUsersinfo",
                dataUrl: {
                    loadByPageUrl: "/system-config/system/usersinfoEntity/pageList"
                },
                needField: [
                    {sourceField: "name", distField: "flowManagerName"},
                    {sourceField: "idUsersinfo", distField: "flowManager"},
                ],
                fieldList: [{
                    label: "姓名",
                    type: "input",
                    fieldName: "name",
                    tableShow: true,
                }, {
                    label: "用户名",
                    type: "input",
                    fieldName: "username",
                    tableShow: true,
                }]
            },
            formShow: true,
            tableShow: true,
            preps: {
                multiple: "Y",
            }
        },
        {
            label: "说明",
            fieldName: "remark",
            type: "textarea",
            formShow: true,
            tableShow: false
        },
    ]
});
const setFlowGroups = (data: any) => {
    flowGroups.value = data;
}
export {
    flowFormFields,
    setFlowGroups
}
