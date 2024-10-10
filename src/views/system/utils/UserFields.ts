import {SelectOption} from "@/components/types/SearchProps";
import {dictData, loadDepartmentInfo, loadRolesInfo} from "@/api/sh_api.ts";
import {ref} from "vue";

const deptList = ref<SelectOption[]>([]);
const rolesList = ref<SelectOption[]>([]);
const sexList = ref<SelectOption[]>([]);
const statusList = ref<SelectOption[]>([]);
const educationList = ref<SelectOption[]>([]);
const nativePlaceList = ref<SelectOption[]>([]);
const politicalStatusList = ref<SelectOption[]>([]);
const identityTypeList = ref<SelectOption[]>([]);
const userEditFieldInfo: Array<any> = [
    [
        {
            label: "邮箱地址", fieldName: "email", type: "input",
            required: true, formShow: true,
            tableShow: true
        },
        {
            label: "联系电话", fieldName: "phone", type: "input",
            required: true, formShow: true,
            tableShow: true
        }
    ],
    [
        {
            label: "姓名", fieldName: "name", type: "input",
            required: true, formShow: true,
            tableShow: true
        },
        {
            label: "性别", fieldName: "sex", type: "radio", optionList: sexList,
            defaultValue: 3,
            formShow: true,
            tableShow: true
        }
    ],
    {
        label: "紧急联系人电话", fieldName: "bakePhone", type: "input", formShow: true,
    },
];
const baseUserFields: Array<any> = [
    [
        {
            label: "用户名", fieldName: "username", type: "input",
            required: true, formShow: true, editDisabled: "Y",
            tableShow: true
        },
        {
            label: "员工编号", fieldName: "employeeNo", type: "input",
            required: true, formShow: true, editDisabled: "Y",
            tableShow: true
        }
    ],
    [
        {
            label: "归属部门", fieldName: "deptList", type: "cascade", optionList: deptList,
            required: true, formShow: true, multiple: "Y",
            tableShow: true
        },
        {
            label: "所属用户组", fieldName: "rolesList", type: "select", optionList: rolesList,
            required: true, formShow: true, multiple: "Y",
            tableShow: true
        }
    ],
    ...userEditFieldInfo,
    {
        label: "状态", fieldName: "statusName", type: "input",
        tableShow: true
    },
];
const fullUserField: Array<any> = [
    ...baseUserFields,
    ...userEditFieldInfo,

    {
        label: "学历", fieldName: "education", type: "select", optionList: educationList,
        formShow: true,
        tableShow: true
    },
    [{
        label: "入职时间", fieldName: "entryDate", type: "date",
    },
        {
            label: "离职时间", fieldName: "leaveDate", type: "date",
        }],
    {
        label: "籍贯", fieldName: "nativePlace", type: "select", optionList: nativePlaceList,
        formShow: true,
        tableShow: true
    },
    {
        label: "政治面貌", fieldName: "politicalStatus", type: "select", optionList: politicalStatusList,
        formShow: true,
        tableShow: true
    },
    {
        label: "证件类型", fieldName: "identityType", type: "select", optionList: identityTypeList,
        formShow: true,
        tableShow: true
    },
    {
        label: "证件编号", fieldName: "identityNo", type: "input",
        formShow: true,
        tableShow: true
    },
    [{
        label: "状态", fieldName: "statusCode", type: "select",
        formShow: true,
        optionList: statusList,
    },
        {
            label: "通信地址", fieldName: "address", type: "input",
            formShow: true,
            tableShow: true
        }],
    {
        label: "备注", fieldName: "remark", type: "textarea",
        formShow: true,
        tableShow: true
    },
    {
        label: "证件照", fieldName: "imagePath", type: "input",
    },
    {
        label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
        tableShow: true
    },
    {
        label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
        label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
        tableShow: true
    },
    {
        label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
        label: "数据版本号", fieldName: "version", type: "number",
    },
    {
        label: "是否已逻辑删除", fieldName: "isDel", type: "number",
    },
    {
        label: "数据编号", fieldName: "dataNo", type: "input",
    },

    {
        label: "国际码", fieldName: "local", type: "input",
    }
];
const initSelectData = async () => {
    rolesList.value = await loadRolesInfo([]);
    deptList.value = await loadDepartmentInfo([]);
    statusList.value = await dictData("common");
    sexList.value = ([{name: "男", value: 1}, {name: "女", value: 2}, {name: "保密", value: 3}]);

}
export {
    initSelectData,
    userEditFieldInfo,
    baseUserFields,
    fullUserField,
    rolesList,
    deptList,
    sexList,
    statusList,
    educationList,
    nativePlaceList,
    identityTypeList,
    politicalStatusList
}
