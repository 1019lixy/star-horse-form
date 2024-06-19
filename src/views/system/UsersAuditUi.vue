<script setup lang="ts" name="UsersAudit">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/usersAudit/pageList",
  mergeUrl: "/system-config/system/usersAudit/merge",
  mergeDraftUrl: "/system-config/system/usersAudit/mergeDraft",
  batchMergeUrl: "/system-config/system/usersAudit/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/usersAudit/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/usersAudit/getById",
  deleteUrl: "/system-config/system/usersAudit/batchDeleteById",
  exportAllUrl: "/system-config/system/usersAudit/exportData",
  downloadTemplateUrl: "/system-config/system/usersAudit/downloadTemplate",
  userConditionUrl: "/system-config/system/usersAudit/getAllByCondition",
  importUrl: "/system-config/system/usersAudit/importData",
  uploadUrl: "",
  condition: []
};
const initData = async () => {
};
onMounted(() => {
  initData();
});
const searchFormData = reactive<SearchProps[]>([{label: "主键", fieldName: "idUsersAudit", type: "long"},
  {label: "主键", fieldName: "idUserinfo", type: "long"},
  {label: "密码", fieldName: "password", type: "input"},
  {label: "生效日期", fieldName: "effectiveDate", type: "date"},
  {label: "失效日期", fieldName: "expiredDate", type: "date"},
  {label: "备注", fieldName: "remark", type: "input"},
  {label: "数据类型", fieldName: "dataType", type: "number"},
]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键", fieldName: "idUsersAudit", type: "long",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "主键", fieldName: "idUserinfo", type: "long",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "密码", fieldName: "password", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "生效日期", fieldName: "effectiveDate", type: "date",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "失效日期", fieldName: "expiredDate", type: "date",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "备注", fieldName: "remark", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "数据类型", fieldName: "dataType", type: "number",
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
  ],
  batchFieldList: []
});
const primaryKey = "idUsersAudit";
const usersAuditRef = ref();
const rules = {

};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
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
  dialogPwdVisible: false
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
    <star-horse-form v-model:data-form="dataForm" @refresh="usersAuditRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>usersAuditRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>usersAuditRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="usersAuditRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
