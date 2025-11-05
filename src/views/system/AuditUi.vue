<script setup lang="ts" name="Audit">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance("system-config", "system/audit");
const requestMethod = [
  { name: "POST", value: "POST" },
  { name: "GET", value: "GET" },
  { name: "PUT", value: "PUT" },
  { name: "DELETE", value: "DELETE" },
];
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.request.method"),
      fieldName: "requestMethod",
      type: "select",
      preps: {
        values: requestMethod,
      },
    },
    {
      label: i18n("system.operator"),
      defaultVisible: true,
      fieldName: "operator",
      matchType: "lk",
    },
    {
      label: i18n("system.access.interface"),
      defaultVisible: true,
      fieldName: "signature",
      matchType: "lk",
    },
    { label: i18n("system.access.address"), fieldName: "url", matchType: "lk" },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idAudit",
      type: "long",
    },
    {
      label: i18n("system.operator"),
      fieldName: "operator",

      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.access.interface"),
      fieldName: "signature",

      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.request.parameters"),
      fieldName: "params",

      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: i18n("system.updated.by"),
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: i18n("system.created.date"),
      disabled: true,
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: i18n("system.updated.date"),
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: i18n("system.data.version"),
      fieldName: "version",
      type: "number",
    },
    {
      label: i18n("system.is.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",
    },
    {
      label: i18n("system.interface.address"),
      fieldName: "url",

      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.remark"),
      fieldName: "remark",

      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.request.method"),
      fieldName: "requestMethod",

      formVisible: true,
      listVisible: true,
    },
  ],
  cellEditable: false,
});
const primaryKey = "idAudit";
const auditRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (_name: string, cellValue: object): any => {
  return cellValue;
};
const initData = async () => {};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="auditRef?.loadByPage()"
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
    <div class="search-content">
      <div class="search_btn">
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
  </div>
</template>
