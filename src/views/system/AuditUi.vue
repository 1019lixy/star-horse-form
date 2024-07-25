<script setup lang="ts" name="Audit">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getMenuId, loadPagePermission} from "@/api/sh_api.ts";
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/auditEntity/pageList",
  mergeUrl: "/system-config/system/auditEntity/merge",
  mergeDraftUrl: "/system-config/system/auditEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/auditEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/auditEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/auditEntity/getById",
  deleteUrl: "/system-config/system/auditEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/auditEntity/exportData",
  downloadTemplateUrl: "/system-config/system/auditEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/auditEntity/getAllByCondition",
  importUrl: "/system-config/system/auditEntity/importData",
  uploadUrl: "",
  condition: []
};
const requestMethod = [{name: "POST", value: "POST"}, {name: "GET", value: "GET"},
  {name: "PUT", value: "PUT"}, {name: "DELETE", value: "DELETE"},];
const searchFormData = reactive<SearchProps[]>([
  {label: "请求方法", fieldName: "requestMethod", type: "select", optionList: requestMethod},
  {label: "操作人", defaultShow: true, fieldName: "operator", type: "input", matchType: "lk"},
  {label: "操作接口", defaultShow: true, fieldName: "signature", type: "input", matchType: "lk"},
  {label: "接口地址", fieldName: "url", type: "input", matchType: "lk"},
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idAudit", type: "long",
    },
    {
      label: "操作人", fieldName: "operator", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "操作接口", fieldName: "signature", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "操作内容", fieldName: "operContent", type: "input",
      formShow: true,
      tableShow: true
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
    {
      label: "接口地址", fieldName: "url", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "备注", fieldName: "remark", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "请求方法", fieldName: "requestMethod", type: "input",
      formShow: true,
      tableShow: true
    },
  ],
  cellEditable: false
});
const primaryKey = "idAudit";
const auditRef = ref();
const rules = {};
const dataForm = ref({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
};
onMounted(async () => {
  await initData()
})
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="auditRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>auditRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr>
      <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>auditRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions" ref="auditRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
