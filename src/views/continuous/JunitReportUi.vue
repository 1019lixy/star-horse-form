<script setup lang="ts" name="JunitReport">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
} from "star-horse-lowcode";
import { Config } from "@/api/settings";

const dataUrl: ApiUrls = apiInstance(
  "continuous-manage",
  "continuous/junitReport",
);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "节点",
      fieldName: "idNodeProperty",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: "测试报告类型",
      fieldName: "projectType",
      type: "reportType",
      matchType: "lk",
      defaultVisible: true,
    },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键",
      fieldName: "idJunitReport",
    },
    {
      label: "节点主键",
      fieldName: "idNodeProperty",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    [
      {
        label: "类覆盖率",
        fieldName: "classCoverRate",
        type: "number",
        formVisible: true,
        listVisible: true,
      },
      {
        label: "类总数",
        fieldName: "classNums",
        type: "number",
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "类覆盖数",
        fieldName: "classCoverNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "方法覆盖率",
        fieldName: "methodCoverRate",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "方法总数",
        fieldName: "methodNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "方法覆盖数",
        fieldName: "methodCoverNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],

    [
      {
        label: "行覆盖率",
        fieldName: "lineCoverRate",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "行总数",
        fieldName: "lineNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "分支覆盖率",
        fieldName: "branchCoverRate",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "分支总数",
        fieldName: "branchNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "分支覆盖数",
        fieldName: "branchCoverNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "测试报告类型 1 权利覆盖报告，2变更覆盖报告",
        fieldName: "reportType",

        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      formVisible: true,
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
const primaryKey = "idJunitReport";
const junitReportRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const selectItemFun = (data: any) => {};
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {};
onMounted(async () => {
  await init();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="junitReportRef?.loadByPage()"
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
          @searchData="(data: any) => junitReportRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
        <hr />
        <star-horse-button-list
          @tableCompFunc="(fun: any) => junitReportRef.tableCompFunc(fun)"
          :compUrl="dataUrl"
          :dialogProps="dialogProps"
          :showType="Config.buttonStyle"
        />
      </div>
      <star-horse-table-comp
        ref="junitReportRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        @selectItem="selectItemFun"
      />
    </el-card>
  </div>
</template>
