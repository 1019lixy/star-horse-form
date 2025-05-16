<script setup lang="ts" name="SafetyScanReport">
import {onMounted, provide, reactive, ref} from "vue";
import {apiInstance, ApiUrls, dialogPreps, SearchFields} from "star-horse-lowcode";
import {Config} from "@/api/settings.ts";

const dataUrl: ApiUrls = apiInstance("continuous-manage", "continuous/safetyScanReport");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "节点", fieldName: "idNodeProperty", type: "input", matchType: "lk", defaultVisible: true},
    {label: "测试报告类型", fieldName: "projectType", type: "reportType", matchType: "lk", defaultVisible: true}
  ]
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键",
      fieldName: "idSafetyReport",
      type: "input"
    },
    {
      label: "节点主键",
      fieldName: "idNodeProperty",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    [
      {
        label: "致命总数",
        fieldName: "blocker",
        type: "number",
        formVisible: true,
        listVisible: true
      },
      {
        label: "严重总数",
        fieldName: "critical",
        type: "number",
        formVisible: true,
        listVisible: true
      }
    ],
    [
      {
        label: "中度总数",
        fieldName: "major",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "方法覆盖率",
        fieldName: "methodCoverRate",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true
      }
    ],
    [
      {
        label: "轻微总数",
        fieldName: "minor",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "方法覆盖数",
        fieldName: "methodCoverNums",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true
      }
    ],

    {
      label: "详情地址",
      fieldName: "detailUrls",
      type: "number",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      formVisible: true
    },
    {
      label: "创建人",
      disabled: "Y",
      fieldName: "createdBy",
      type: "input"
    },
    {
      label: "修改人",
      disabled: "Y",
      fieldName: "updatedBy",
      type: "input"
    },
    {
      label: "创建日期",
      disabled: "Y",
      fieldName: "createdDate",
      type: "date"
    },
    {
      label: "修改日期",
      disabled: "Y",
      fieldName: "updatedDate",
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
      type: "input"
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input"
    },
    {
      label: "状态码名称",
      fieldName: "statusName",
      type: "input"
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input"
    }
  ],
  batchFieldList: []
});
const primaryKey = "idSafetyReport";
const safetyScanReportRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const selectItemFun = (data: any) => {
};
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="safetyScanReportRef.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
    />
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
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => safetyScanReportRef.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
      <hr/>
      <star-horse-button-list
          @tableCompFunc="(fun: any) => safetyScanReportRef.tableCompFunc(fun)"
          :compUrl="dataUrl"
          :dialogProps="dialogProps"
          :showType="Config.buttonStyle"
      />
    </div>
    <star-horse-table-comp
        ref="safetyScanReportRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        @selectItem="selectItemFun"
    />
  </el-card>
</template>
