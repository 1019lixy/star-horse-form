<script setup lang="ts" name="UsersAudit">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance("system-config", "system/usersAudit");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idUsersAudit",
      type: "long",
    },
    {
      label: i18n("system.primary.key"),
      fieldName: "idUserinfo",
      type: "long",
    },
    { label: i18n("system.password"), fieldName: "password" },
    {
      label: i18n("system.effective.date"),
      fieldName: "effectiveDate",
      type: "date",
    },
    {
      label: i18n("system.expired.date"),
      fieldName: "expiredDate",
      type: "date",
    },
    { label: i18n("system.remark"), fieldName: "remark" },
    { label: i18n("system.data.type"), fieldName: "dataType", type: "number" },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idUsersAudit",
      type: "long",
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.primary.key"),
      fieldName: "idUserinfo",
      type: "long",
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.password"),
      fieldName: "password",

      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.effective.date"),
      fieldName: "effectiveDate",
      type: "date",
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.expired.date"),
      fieldName: "expiredDate",
      type: "date",
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
      label: i18n("system.data.type"),
      fieldName: "dataType",
      type: "number",
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
      label: i18n("system.is.logical.deleted"),
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
  ],
  batchFieldList: [],
});
const primaryKey = "idUsersAudit";
const usersAuditRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: object): any => {
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
        @refresh="usersAuditRef?.loadByPage()"
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
          @searchData="(data: any) => usersAuditRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="usersAuditRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
