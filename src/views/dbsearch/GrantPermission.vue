<script setup lang="ts" name="DbAssign">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {commonParseCodeToName, createDatetime, loadData, loadGetData} from "@/api/sh_api";
import {warning} from "@/utils/message";
import {Config} from "@/api/settings";

const assignType = ref<SelectOption[]>([{name: "按用户授权", value: 1}, {name: "按角色授权", value: 2}]);
const assignTypeRef = ref(null);
let userOrRoleList = ref<SelectOption[]>([]);
let dbList = ref<SelectOption[]>([]);
let sqlLangs = ref([]);
const dataUrl: ApiUrls = {
  loadByPageUrl: "/dbsearch-manage/dbsearch/dbAssign/pageList",
  mergeUrl: "/dbsearch-manage/dbsearch/dbAssign/merge",
  mergeDraftUrl: "/dbsearch-manage/dbsearch/dbAssign/mergeDraft",
  batchMergeUrl: "/dbsearch-manage/dbsearch/dbAssign/mergeBatch",
  batchMergeDraftUrl: "/dbsearch-manage/dbsearch/dbAssign/mergeBatchDraft",
  loadByIdUrl: "/dbsearch-manage/dbsearch/dbAssign/getById",
  deleteUrl: "/dbsearch-manage/dbsearch/dbAssign/batchDeleteById",
  exportAllUrl: "/dbsearch-manage/dbsearch/dbAssign/exportData",
  downloadTemplateUrl: "/dbsearch-manage/dbsearch/dbAssign/downloadTemplate",
  userConditionUrl: "/dbsearch-manage/dbsearch/dbAssign/getAllByCondition",
  uploadUrl: "/dbsearch-manage/dbsearch/dbAssign/importData",
  importUrl: ""
};
const initData = async () => {
  await initDbList();
};
onMounted(() => {
  initData();
});
const searchFormData = reactive<SearchProps[]>([
  {label: "授权数据库", fieldName: "dbinfoSingle", type: "select", optionList: dbList},
  {label: "被授权人编号", fieldName: "assignNo", type: "input", matchType: "lk"},
  {label: "授权类型 ", fieldName: "assignType", type: "select", optionList: assignType},
  {label: "经办人", fieldName: "operator", type: "input"},
]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "db授权主键", fieldName: "idDbAssign", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "授权数据库", fieldName: "dbinfoSingle", type: "select", optionList: dbList,
      required: true, formShow: !false,
      tableShow: false, minWidth: 180
    },
    {
      label: "授权数据库", fieldName: "dbinfoRespDto['dbComment']", type: "select", optionList: dbList,
      required: true, formShow: false,
      tableShow: true, minWidth: 180
    },
    {
      label: "被授权人账号", fieldName: "assignNo", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "授权类型", fieldName: "assignType", type: "select", optionList: assignType,
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "经办人", fieldName: "operator", type: "input",
      required: false, formShow: false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "被授权人操作范围", fieldName: "operatorRange", type: "textarea",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "授权描述", fieldName: "assginDesc", type: "textarea",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "授权生效日期", fieldName: "effectiveDate", type: "date",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "授权失效日期", fieldName: "expiredDate", type: "date",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: true, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: true, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: true, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: true, fieldName: "updatedDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "国际码", fieldName: "local", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
  ],
  batchFieldList: []
});
const primaryKey = "idDbAssign";
const grantPermissionRef = ref();
const rules = {

};

const searchForm = ref<any>({});
provide("searchForm", searchForm);
const dataForm = ref<any>({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
});
provide("dialogProps", dialogProps);

const searchUserOrRole = (val: any) => {
  let type = dataForm.value.assignType;
  if (!type) {
    warning("请先选择授权类型");
    dataForm.value.assignNo = "";
    assignTypeRef.value!.focus();
    return;
  }
  let obj = {"propertyName": type == 1 ? "name" : "roleName", "value": val, "operation": "lk"};
  queryCondition(obj);
};
const queryCondition = async (obj: any) => {
  let type = dataForm.value.assignType;
  let cond: any = [{"propertyName": "isDel", "value": 0},
    {"propertyName": "statusCode", "value": "1"}];
  if (obj) {
    cond.push(obj);
  }
  let {data, error} = await
      loadData(`/system-config/dbsearch/${type == 1 ? "usersinfoEntity" : "rolesinfoEntity"}/getAllByCondition`,
          cond);
  if (error) {
    warning(error);
    return;
  }
  if (type == 2) {
    data.forEach((item: any, index: number) => {
      userOrRoleList.value.push({name: item.roleName, value: item.roleCode});
    });
  } else {
    data.forEach((item: any, index: number) => {
      userOrRoleList.value.push({name: item.name, value: item.username});
    });
  }
};
const getUserOrRole = () => {
  queryCondition(null);

};
const initDbList = async () => {
  let params = [{"propertyName": "isDel", "value": 0},
    {"propertyName": "statusCode", "value": "1"}];
  let {data, error} = await loadData("/dbsearch-manage/dbsearch/dbinfoEntity/getAllByCondition", params);
  if (error) {
    warning(error);
    return
  }
  data.forEach((item: any) => {
    dbList.value.push({name: item.dbType + ':' + item.host + '/' + item.dbName, value: item.dataNo})
  });
};
const initSqlLang = async () => {
  let {data, error} = await loadGetData("/dbsearch-manage/dbsearch/dbAssign/allSqlLang");
  sqlLangs.value = data;

};


const dataFormat = (name: string, cellValue: Object): any => {
  if (name == "assignType") {
    return assignType.value.find(item => item.value == parseInt(cellValue))?.name;
  }
  if (name == "effectiveDate" || name == "expiredDate") {
    return createDatetime(cellValue);
  }
  return commonParseCodeToName(name, cellValue);
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="grantPermissionRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules=
        "rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>grantPermissionRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>grantPermissionRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="grantPermissionRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl=
        "dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
