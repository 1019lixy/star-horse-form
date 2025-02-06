<script setup lang="ts" name="DbAssign">
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref, nextTick} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {commonParseCodeToName, loadData, apiInstance, dialogPreps} from "@/api/sh_api";
import {createDatetime} from "@/api/date_utils.ts";
import {warning} from "@/utils/message";
import {Config} from "@/api/settings.ts";
import {CompParams} from "@/components/types/PageFieldInfo";

const assignType = ref<SelectOption[]>([{name: "按用户授权", value: 1}, {name: "按角色授权", value: 2}]);
const assignTypeRef = ref(null);
let userOrRoleList = ref<SelectOption[]>([]);
let dbList = ref<SelectOption[]>([]);
let sqlLangs = ref([]);
const dataUrl: ApiUrls = apiInstance("userdb-manage", "dbsearch/dbAssign");


const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "授权数据库", fieldName: "dbinfoSingle", defaultVisible: true, type: "select", optionList: dbList},
    {label: "被授权人编号", fieldName: "assignNo", defaultVisible: true, type: "input", matchType: "lk"},
    {label: "授权类型 ", fieldName: "assignType", defaultVisible: true, type: "select", optionList: assignType},
    {label: "经办人", fieldName: "operator", type: "input"},
  ]
});
let params = ref<CompParams>({dataUrl: {}, fieldList: [], needField: [], primaryKey: ""});
const tableFieldList = reactive({
  fieldList: [
    {
      label: "db授权主键", fieldName: "idDbAssign", type: "long",
    },

    {
      label: "授权数据库", fieldName: "dbinfoSingle", type: "select", optionList: dbList,
      required: true, formVisible: true, listVisible: true, editDisabled: "Y"
    },
    [{
      label: "授权类型", fieldName: "assignType", type: "select", optionList: assignType,
      required: true, formVisible: true, editDisabled: "Y", actionName: "change", actions: (val: any) => {
        searchUserOrRole(val);
      },
      listVisible: true
    }, {
      label: "被授权账号/角色", fieldName: "assignNo", type: "page-select",
      required: true, formVisible: true, editDisabled: "Y",
      // optionList: userOrRoleList,
      params: params,
      listVisible: true
    },
    ],
    [{
      label: "授权生效日期", fieldName: "effectiveDate", type: "date",
      required: true, formVisible: true,
      listVisible: true,
      preps: {}
    },
      {
        label: "授权失效日期", fieldName: "expiredDate", type: "date",
        required: true, formVisible: true,
        listVisible: true
      }],
    {
      label: "经办人", fieldName: "operator", type: "input",
      listVisible: true
    },
    {
      label: "被授权人操作范围", fieldName: "operatorRange", type: "textarea",
      required: true, formVisible: true,
      listVisible: true
    },
    {
      label: "授权描述", fieldName: "assginDesc", type: "textarea",
      required: true, formVisible: true,
      listVisible: true
    },

    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  batchFieldList: []
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
  params.value.condition = [{"propertyName": "isDel", "value": 0},
    {"propertyName": "statusCode", "value": "1"}];
  if (type == 1) {
    params.value.fieldList = [{
      label: "用户名",
      fieldName: "username",
      type: "input",
      listVisible: true,
    }, {
      label: "姓名",
      fieldName: "name",
      type: "input",
      listVisible: true,
    }, {
      label: "工号",
      fieldName: "employeeNo",
      type: "input",
      listVisible: true,
    }];
    params.value.needField = [
      {sourceField: "username", distField: "assignTo"}
    ];
    params.value.dataUrl = {
      loadByPageUrl: "/system-config/system/usersinfoEntity/pageList"
    };
    params.value.primaryKey = "idUsersinfo";
  } else {
    params.value.fieldList = [{
      label: "角色名称",
      fieldName: "roleName",
      type: "input",
      listVisible: true,
    }, {
      label: "角色编码",
      type: "input",
      fieldName: "roleCode",
      listVisible: true,
    }, {
      label: "角色类型",
      type: "input",
      fieldName: "roleType",
      listVisible: true,
    }];
    params.value.needField = [
      {sourceField: "roleCode", distField: "assignTo"}
    ];
    params.value.dataUrl = {
      loadByPageUrl: "/system-config/system/rolesinfoEntity/pageList"
    };
    params.value.primaryKey = "idRolesinfo";
  }
};
const initDbList = async () => {
  let params = [{"propertyName": "isDel", "value": 0},
    {"propertyName": "statusCode", "value": "1"}];
  let {data, error} = await loadData("/userdb-manage/dbsearch/dbinfoEntity/getAllByCondition", params);
  if (error) {
    warning(error);
    return
  }
  data.forEach((item: any) => {
    dbList.value.push({name: item.dbType + ':' + item.host + '/' + item.dbName, value: item.dataNo})
  });
};
const dataFormat = (name: string, cellValue: object, row: any): any => {
  if (name == "assignType") {
    return assignType.value.find(item => item.value == parseInt(cellValue))?.name;
  } else if (name == "dbinfoSingle") {
    let data = row["dbinfoRespDto"];
    return data.host + "/" + data.dbName || cellValue;
  }
  if (name == "effectiveDate" || name == "expiredDate") {
    return createDatetime(cellValue);
  }
  return commonParseCodeToName(name, cellValue);
}
const initData = async () => {

  await initDbList();
};
onMounted(() => {
  initData();
});
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
      <star-horse-form @refresh="grantPermissionRef.loadByPage()" :compUrl="dataUrl"
                       :fieldList="tableFieldList" :rules=
                           "rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>grantPermissionRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list
          @tableCompFunc="(fun:any)=>grantPermissionRef.tableCompFunc(fun)" :compUrl="dataUrl"
          :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="grantPermissionRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl=
                               "dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
