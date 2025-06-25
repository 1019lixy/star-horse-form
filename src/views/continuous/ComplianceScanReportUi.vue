<script setup lang="ts" name="ComplianceScanReport">
import {onMounted, provide, reactive} from "vue";
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields} from "star-horse-lowcode";

const dataUrl: ApiUrls = apiInstance("continuous-manage", "continuous/complianceScanReport");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "致命总数", fieldName: "blocker", },
    {label: "严重总数", fieldName: "critical",  matchType: "lk"},
    {label: "中度总数", fieldName: "major",  matchType: "lk"}
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idComplianceReport",
      type: "long"
    },
    {
      label: "主键",
      fieldName: "idNodeProperty",
      type: "long"
    },
    {
      label: "致命总数",
      fieldName: "blocker",
      type: "number",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "严重总数",
      fieldName: "critical",
      type: "number",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "中度总数",
      fieldName: "major",
      type: "",
      formVisible: true,
      listVisible: true
    },
    {
      label: "轻微总数",
      fieldName: "minor",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "Info总数",
      fieldName: "infos",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "重复率",
      fieldName: "repeatRate",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "重复代码行",
      fieldName: "repeatCodeLines",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "重复代码块",
      fieldName: "repeatCodeBlock",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "重复文件",
      fieldName: "repeatFiles",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "总复杂度",
      fieldName: "totalComplex",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "文件平均复杂度",
      fieldName: "fileAvgComplex",
      type: "number",
      formVisible: true,
      listVisible: true
    },
    {
      label: "详情地址",
      fieldName: "detailUrls",
      type: "number",
      formVisible: true,
      listVisible: true
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
      type: "date"
    },
    {
      label: "修改日期",
      disabled: true,
      fieldName: "updatedTime",
      type: "date"
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number"
    },
    {
      label: "是否已逻辑",
      fieldName: "isDel",
      type: "number"
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

    }
  ]
});
const primaryKey = "idComplianceReport";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const initData = async () => {
};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>

  <el-card class="inner_content">
    <star-horse-search-comp :formData="searchFormData" :compUrl="dataUrl"/>
    <hr/>
    <star-horse-button-list :compUrl="dataUrl" :dialogProps="dialogProps"/>
    <hr/>
    <star-horse-table-comp
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
