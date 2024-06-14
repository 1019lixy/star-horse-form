<script setup lang="ts" name="Audit">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

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
const initData = async () => {
};
initData();
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
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "操作人", fieldName: "operator", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "操作接口", fieldName: "signature", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "操作内容", fieldName: "operContent", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: 1, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: 1, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: 1, fieldName: "updatedDate", type: "date",
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
    {
      label: "接口地址", fieldName: "url", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "备注", fieldName: "remark", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "请求方法", fieldName: "requestMethod", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  cellEditable: false
});
const primaryKey = "idAudit";
const auditRef = ref();
const rules = {

};
const searchForm = ref({});
provide("searchForm", searchForm);
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
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="auditRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>auditRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr>
      <star-horse-button-list @tableCompFunc="(fun)=>auditRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="auditRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
