import {reactive, ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps.d.js";
import {PageFieldInfo} from "@/components/types/PageFieldInfo.d.js";

const flowGroups = ref<SelectOption[]>([]);
const formVisibleTypeList = ref<SelectOption[]>([
    {name: "标签栏", value: "tab"},
    {name: "步进式", value: "step"},
    {name: "顺序显示", value: "seq"},
]);
const flowFormFields = reactive<PageFieldInfo>({
    fieldList: [
        {
            label: "图标",
            fieldName: "flowIcon",
            type: "icon",
            defaultValue: "document",
            formVisible: true,
            listVisible: true
        },
        {
            label: "流程名称",
            fieldName: "name",
            type: "input",
            required: true,
            formVisible: true,
            listVisible: true
        },
        {
            label: "流程分类",
            fieldName: "flowGroup",
            type: "select",
            optionList: flowGroups,
            required: true,
            formVisible: true,
            listVisible: true
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
                    searchVisible: true,
                    listVisible: true,
                }, {
                    label: "表单图标",
                    type: "icon",
                    fieldName: "formIcon",
                    listVisible: true,
                }, {
                    label: "创建人",
                    type: "input",
                    fieldName: "createdBy",
                    listVisible: true,
                }, {
                    label: "创建时间",
                    type: "input",
                    fieldName: "createdDate",
                    listVisible: true,
                }]
            },
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
                multiple: "Y",
            }
        },
        {
            label: "流程图类型",
            fieldName: "flowType",
            type: "input",
            formVisible: false,
            listVisible: true
        },
        {
            label: "流程版本",
            fieldName: "flowVersion",
            type: "input",
            formVisible: false,
            listVisible: true
        },
        {
            label: "多表单显示模式",
            fieldName: "formVisibleType",
            type: "radio",
            optionList: formVisibleTypeList,
            defaultValue: "step",
            required: true,
            formVisible: true,
            listVisible: true,
        },
        {
            label: "谁可以管理这个流程",
            fieldName: "flowManagerName",
            aliasName: "flowManager",
            type: "page-select",
            params: {
                primaryKey: "idEmployeeInfo",
                dataUrl: {
                    loadByPageUrl: "/system-config/system/employeeInfo/pageList"
                },
                needField: [
                    {sourceField: "name", distField: "flowManagerName"},
                    {sourceField: "idEmployeeInfo", distField: "flowManager"},
                ],
                fieldList: [{
                    label: "姓名",
                    type: "input",
                    searchVisible: true,
                    fieldName: "name",
                    listVisible: true,
                }, {
                    label: "用户名",
                    type: "input",
                    searchVisible: true,
                    fieldName: "employeeNo",
                    listVisible: true,
                }]
            },
            formVisible: true,
            listVisible: true,
            preps: {
                multiple: "Y",
            }
        },
        {
            label: "说明",
            fieldName: "remark",
            type: "textarea",
            formVisible: true,
            listVisible: false
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
