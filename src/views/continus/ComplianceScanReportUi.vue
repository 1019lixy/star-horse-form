<script setup lang="ts" name="ComplianceScanReport">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/devops-continus/continus/complianceScanReport/pageList",
  mergeUrl: "/devops-continus/continus/complianceScanReport/merge",
  mergeDraftUrl: "/devops-continus/continus/complianceScanReport/mergeDraft",
  batchMergeUrl: "/devops-continus/continus/complianceScanReport/mergeBatch",
  batchMergeDraftUrl: "/devops-continus/continus/complianceScanReport/mergeBatchDraft",
  loadByIdUrl: "/devops-continus/continus/complianceScanReport/getById",
  deleteUrl: "/devops-continus/continus/complianceScanReport/batchDeleteById",
  exportAllUrl: "/devops-continus/continus/complianceScanReport/exportData",
  downloadTemplateUrl: "/devops-continus/continus/complianceScanReport/downloadTemplate",
  userConditionUrl: "/devops-continus/continus/complianceScanReport/getAllByCondition",
  importUrl: "/devops-continus/continus/complianceScanReport/importData",
  uploadUrl: ""
};
const initData = async () => {

};
onMounted(() => {
  initData();
});

const searchFormData = reactive<SearchProps[]>([
  {label: "致命总数", fieldName: "blocker", type: "input"},
  {label: "严重总数", fieldName: "critical", type: "input", matchType: "lk"},
  {label: "中度总数", fieldName: "major", type: "input", matchType: "lk"},
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idComplianceReport", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    }, {
      label: "主键", fieldName: "idNodeProperty", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },

    {
      label: "致命总数", fieldName: "blocker", type: "number",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },

    {
      label: "严重总数", fieldName: "critical", type: "number",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "中度总数", fieldName: "major", type: "",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },

    {
      label: "轻微总数", fieldName: "minor", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "Info总数", fieldName: "infos", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "重复率", fieldName: "repeatRate", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "重复代码行", fieldName: "repeatCodeLines", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "重复代码块", fieldName: "repeatCodeBlock", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "重复文件", fieldName: "repeatFiles", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "总复杂度", fieldName: "totalComplex", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "文件平均复杂度", fieldName: "fileAvgComplex", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "详情地址", fieldName: "detailUrls", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: "yes", fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: "yes", fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: "yes", fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: "yes", fieldName: "updatedDate", type: "date",
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
  batchFieldList: [],
  userTableFuncs: [],
});
const primaryKey = "idComplianceReport";
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
  viewVisible: false

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
    <star-horse-form :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <star-horse-search-comp :formData="searchFormData" :compUrl="dataUrl"/>
    <hr>
    <star-horse-button-list :compUrl="dataUrl" :dialogProps="dialogProps"/>
    <hr>
    <star-horse-table-comp :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
