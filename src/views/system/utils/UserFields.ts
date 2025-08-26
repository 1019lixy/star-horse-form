import { dictData, SelectOption } from "star-horse-lowcode";
import { loadDepartmentInfo, loadRolesInfo } from "@/api/star_horse_utils";
import { ref } from "vue";
import { analysisData } from "@/api/deptment";
import { i18n } from "@/lang";

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
      label: i18n("system.email.address"),
      fieldName: "email",

      rules: "email",
      required: true,

      formVisible: true,
      listVisible: true,
      preps: {
        editDisabled: true,
      },
    },
    {
      label: i18n("system.contact.phone"),
      fieldName: "phone",

      rules: "phone",
      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
  [
    {
      label: i18n("system.name"),
      fieldName: "name",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.sex"),
      fieldName: "sex",
      type: "radio",
      defaultValue: 3,
      formVisible: true,
      listVisible: true,
      preps: {
        values: sexList,
      },
    },
  ],
  {
    label: i18n("system.emergency.contact.phone"),
    fieldName: "bakePhone",
    rules: "phone",

    formVisible: true,
  },
];
const userFormat = (name: string, val: any, row: any) => {
  if (name == "rolesList" && row["rolesList"]) {
    const roles: Array<string> = [];
    row["rolesList"].forEach((item: any) => {
      roles.push(item.roleName);
    });
    return roles.join(";");
  }
  if (name == "deptList" && row["deptList"]) {
    const data = analysisData(row["deptList"], "", "deptName", "idDepartment");
    return data.listNames.join("/");
  }
  return val;
};
const baseUserFields: Array<any> = [
  [
    {
      label: i18n("system.username"),
      fieldName: "username",
      aliasName: "employeeNo",
      type: "user",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        editDisabled: true,
        needField: [
          { sourceField: "name", distField: "name" },
          { sourceField: "employeeNo", distField: "employeeNo" },
          { sourceField: "employeeNo", distField: "username" },
          { sourceField: "phone", distField: "phone" },
          { sourceField: "sex", distField: "sex" },
          { sourceField: "bakePhone", distField: "bakePhone" },
        ],
      },
    },
    {
      label: i18n("system.user.group"),
      fieldName: "rolesList",
      type: "select",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        multiple: true,
        values: rolesList,
      },
    },
  ],
  ...userEditFieldInfo,
  {
    label: i18n("system.status"),
    fieldName: "statusName",

    listVisible: true,
  },
];
const fullUserField: Array<any> = [
  ...baseUserFields,
  ...userEditFieldInfo,

  {
    label: i18n("system.education"),
    fieldName: "education",
    type: "select",
    formVisible: true,
    listVisible: true,
    preps: {
      values: educationList,
    },
  },
  [
    {
      label: i18n("system.entry.time"),
      fieldName: "entryDate",
      type: "date",
    },
    {
      label: i18n("system.leave.time"),
      fieldName: "leaveDate",
      type: "date",
    },
  ],
  {
    label: i18n("system.native.place"),
    fieldName: "nativePlace",
    type: "select",
    formVisible: true,
    listVisible: true,
    preps: {
      values: nativePlaceList,
    },
  },
  {
    label: i18n("system.political.status"),
    fieldName: "politicalStatus",
    type: "select",
    formVisible: true,
    listVisible: true,
    preps: {
      values: politicalStatusList,
    },
  },
  {
    label: i18n("system.identity.type"),
    fieldName: "identityType",
    type: "select",
    formVisible: true,
    listVisible: true,
    preps: {
      values: identityTypeList,
    },
  },
  {
    label: i18n("system.identity.number"),
    fieldName: "identityNo",

    formVisible: true,
    listVisible: true,
  },
  [
    {
      label: i18n("system.status"),
      fieldName: "statusCode",
      type: "select",
      formVisible: true,
      preps: {
        values: statusList,
      },
    },
    {
      label: i18n("system.mailing.address"),
      fieldName: "address",

      formVisible: true,
      listVisible: true,
    },
  ],
  {
    label: i18n("system.remark"),
    fieldName: "remark",
    type: "textarea",
    formVisible: true,
    listVisible: true,
  },
  {
    label: i18n("system.id.photo"),
    fieldName: "imagePath",
  },
  {
    label: i18n("system.created.by"),
    disabled: "Y",
    fieldName: "createdBy",

    listVisible: true,
  },
  {
    label: i18n("system.updated.by"),
    disabled: "Y",
    fieldName: "updatedBy",
  },
  {
    label: i18n("system.created.date"),
    disabled: "Y",
    fieldName: "createdTime",
    type: "date",
    listVisible: true,
  },
  {
    label: i18n("system.updated.date"),
    disabled: "Y",
    fieldName: "updatedTime",
    type: "date",
  },
  {
    label: i18n("system.data.version"),
    fieldName: "version",
    type: "number",
  },
  {
    label: i18n("system.is.logical.deleted"),
    fieldName: "isDel",
    type: "number",
  },
  {
    label: i18n("system.data.number"),
    fieldName: "dataNo",
  },

  {
    label: i18n("system.international.code"),
    fieldName: "local",
  },
];
const initSelectData = async () => {
  rolesList.value = await loadRolesInfo([]);
  deptList.value = await loadDepartmentInfo([]);
  statusList.value = await dictData("common");
  sexList.value = [
    { name: "男", value: 1 },
    { name: "女", value: 2 },
    { name: "保密", value: 3 },
  ];
};
export {
  userFormat,
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
  politicalStatusList,
};
