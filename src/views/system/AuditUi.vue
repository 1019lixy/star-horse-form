<script setup lang="ts" name="Audit">
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields} from "star-horse-lowcode";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref} from "vue";

const dataUrl: ApiUrls = apiInstance("system-config", "system/auditEntity");
const requestMethod = [
  {name: "POST", value: "POST"},
  {name: "GET", value: "GET"},
  {name: "PUT", value: "PUT"},
  {name: "DELETE", value: "DELETE"}
];
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "请求方法", fieldName: "requestMethod", type: "select", optionList: requestMethod},
    {label: "操作人", defaultVisible: true, fieldName: "operator", type: "input", matchType: "lk"},
    {label: "访问接口", defaultVisible: true, fieldName: "signature", type: "input", matchType: "lk"},
    {label: "访问地址", fieldName: "url", type: "input", matchType: "lk"}
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idAudit",
      type: "long"
    },
    {
      label: "操作人",
      fieldName: "operator",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "访问接口",
      fieldName: "signature",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "请求参数",
      fieldName: "params",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
      type: "input"
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
      type: "input"
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
    },
    {
      label: "接口地址",
      fieldName: "url",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "请求方法",
      fieldName: "requestMethod",
      type: "input",
      formVisible: true,
      listVisible: true
    }
  ],
  cellEditable: false
});
const primaryKey = "idAudit";
const auditRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (_name: string, cellValue: object): any => {
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
    <star-horse-form @refresh="auditRef?.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => auditRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="auditRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
