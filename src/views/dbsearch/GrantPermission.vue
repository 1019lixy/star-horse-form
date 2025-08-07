<script setup lang="ts" name="DbAssign">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  commonParseCodeToName,
  CompParams,
  createDatetime,
  dialogPreps,
  loadData,
  SearchFields,
  SelectOption,
  warning,
} from "star-horse-lowcode";
import { Config } from "@/api/settings";
import { loadDict } from "@/api/star_horse_apis.js";

const assignType = ref<SelectOption[]>([
  { name: "按用户授权", value: 1 },
  { name: "按角色授权", value: 2 },
]);
const assignTypeRef = ref(null);
let userOrRoleList = ref<SelectOption[]>([]);
let dbList = ref<SelectOption[]>([]);
let permissionList = ref<SelectOption[]>([]);
let sqlLangs = ref([]);
const dataUrl: ApiUrls = apiInstance("userdb-manage", "dbsearch/dbAssign");

const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "授权数据库",
      fieldName: "dbinfoSingle",
      defaultVisible: true,
      type: "select",
      preps: {
        values: dbList,
      },
    },
    {
      label: "被授权人编号",
      fieldName: "assignNo",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: "授权类型 ",
      fieldName: "assignType",
      defaultVisible: true,
      type: "select",
      preps: {
        values: assignType,
      },
    },
    { label: "经办人", fieldName: "operator" },
  ],
});
let params = ref<CompParams | any>({
  dataUrl: {},
  fieldList: [],
  needField: [],
  primaryKey: "",
  editdisabled: true,
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: "db授权主键",
      fieldName: "idDbAssign",
      type: "long",
    },

    {
      label: "授权数据库",
      fieldName: "dbinfoSingle",
      type: "select",
      required: true,
      formVisible: true,
      listVisible: true,

      preps: {
        editDisabled: true,
        values: dbList,
      },
    },
    [
      {
        label: "授权类型",
        fieldName: "assignType",
        type: "select",
        required: true,
        formVisible: true,

        actions: {
          change: (val: any) => {
            searchUserOrRole(val);
          },
        },
        listVisible: true,
        preps: {
          editdisabled: true,
          values: assignType,
        },
      },
      {
        label: "被授权账号/角色",
        fieldName: "assignNo",
        type: "page-select",
        required: true,
        formVisible: true,

        // optionList: userOrRoleList,
        preps: params,
        listVisible: true,
      },
    ],
    [
      {
        label: "授权生效日期",
        fieldName: "effectiveDate",
        type: "date",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
      {
        label: "授权失效日期",
        fieldName: "expiredDate",
        type: "date",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: "经办人",
      fieldName: "operator",

      listVisible: true,
    },
    {
      label: "被授权人操作权限",
      fieldName: "permissionList",
      type: "transfer",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        props: {
          label: "name",
          key: "value",
        },
        data: permissionList,
      },
    },
    {
      label: "授权描述",
      fieldName: "assginDesc",
      type: "textarea",
      required: true,
      formVisible: true,
      listVisible: true,
    },

    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: "创建日期",
      disabled: true,
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: "修改日期",
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number",
    },
    {
      label: "是否已逻辑",
      fieldName: "isDel",
      type: "number",
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
    },
    {
      label: "状态码",
      fieldName: "statusCode",
    },
    {
      label: "状态码名称",
      fieldName: "statusName",
    },
    {
      label: "国际码",
      fieldName: "local",
    },
  ],
  batchFieldList: [],
});
const primaryKey = "idDbAssign";
const grantPermissionRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const searchUserOrRole = (val: any) => {
  let type = val["assignType"];
  if (!type) {
    // warning("请先选择授权类型");
    return;
  }
  params.value.condition = [
    { propertyName: "isDel", value: 0 },
    { propertyName: "statusCode", value: "1" },
  ];
  if (type == 1) {
    params.value.fieldList = [
      {
        label: "用户名",
        fieldName: "username",

        listVisible: true,
      },
      {
        label: "姓名",
        fieldName: "name",

        listVisible: true,
      },
      {
        label: "工号",
        fieldName: "employeeNo",

        listVisible: true,
      },
    ];
    params.value.needField = [
      { sourceField: "username", distField: "assignTo" },
    ];
    params.value.dataUrl = {
      pageListUrl: "/system-config/system/usersinfo/pageList",
    };
    params.value.primaryKey = "idUsersinfo";
  } else {
    params.value.fieldList = [
      {
        label: "角色名称",
        fieldName: "roleName",

        listVisible: true,
      },
      {
        label: "角色编码",

        fieldName: "roleCode",
        listVisible: true,
      },
      {
        label: "角色类型",

        fieldName: "roleType",
        listVisible: true,
      },
    ];
    params.value.needField = [
      { sourceField: "roleCode", distField: "assignTo" },
      /* {sourceField: 'roleName', distField: 'roleName'},*/
    ];
    params.value.dataUrl = {
      pageListUrl: "/system-config/system/rolesinfo/pageList",
    };
    params.value.primaryKey = "idRolesinfo";
  }
  params.value.displayField = "roleName";
  // params.value.multiple = true;
  /*params.value.props = {
    name: 'roleName',
    value: 'assignTo',
  };*/
};
const initDbList = async () => {
  let params = [
    { propertyName: "isDel", value: 0 },
    { propertyName: "statusCode", value: "1" },
  ];
  let { data, error } = await loadData(
    "/userdb-manage/dbsearch/dbinfo/getAllByCondition",
    params,
  );
  loadDict("TABLE_OPERATION_AUTHORITY").then((res) => {
    permissionList.value = res;
  });
  if (error) {
    warning(error);
    return;
  }
  data.forEach((item: any) => {
    dbList.value.push({
      name: item.dbType + ":" + item.host + "/" + item.dbName,
      value: item.dataNo,
    });
  });
};
const dataFormat = (name: string, cellValue: object, row: any): any => {
  if (name == "assignType") {
    return assignType.value.find((item) => item.value == parseInt(cellValue))
      ?.name;
  } else if (name == "dbinfoSingle") {
    let data = row["dbinfoRespDto"];
    return data.host + "/" + data.dbName || cellValue;
  }
  if (name == "effectiveDate" || name == "expiredDate") {
    return createDatetime(cellValue);
  }
  return commonParseCodeToName(name, cellValue);
};
const initData = async () => {
  await initDbList();
};
onMounted(() => {
  initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="grantPermissionRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => grantPermissionRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
        <hr />
        <star-horse-button-list
          @tableCompFunc="(fun: any) => grantPermissionRef.tableCompFunc(fun)"
          :compUrl="dataUrl"
          :dialogProps="dialogProps"
          :showType="Config.buttonStyle"
        />
      </div>
      <star-horse-table-comp
        ref="grantPermissionRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
