<script setup lang="ts" name="WhiteList">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  PageFieldInfo,
  SearchFields,
  SelectOption,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance("system-config", "system/whiteList");
let typeList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.filter.type"),
      fieldName: "whiteType",
      defaultVisible: true,
      type: "select",
      preps: {
        values: typeList,
      },
    },
    {
      label: i18n("system.filter.content"),
      fieldName: "whiteName",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idWhiteList",
      type: "long",
    },
    {
      label: i18n("system.filter.type"),
      fieldName: "whiteType",
      type: "select",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        values: typeList,
      },
    },
    {
      label: i18n("system.filter.content"),
      fieldName: "whiteName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      disabled: true,
      fieldName: "createdBy",

      listVisible: true,
    },
    {
      label: i18n("system.created.date"),
      disabled: true,
      fieldName: "createdTime",
      type: "date",
      listVisible: true,
    },
    {
      label: i18n("system.updated.by"),
      disabled: true,
      fieldName: "updatedBy",

      listVisible: true,
    },
    {
      label: i18n("system.updated.date"),
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
      listVisible: true,
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
    {
      label: i18n("system.remark"),
      fieldName: "remark",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
  ],
  batchFieldList: [],
});
const primaryKey = "idWhiteList";
const whiteListRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  if (name === "whiteType") {
    return (
      typeList.value.find((item: any) => item.value === cellValue)?.name ||
      cellValue
    );
  }
  return cellValue;
};
const initData = async () => {
  typeList.value = await dictData("white_name_filter_type");
};
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
        @refresh="whiteListRef?.loadByPage()"
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
          @searchData="(data: any) => whiteListRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="whiteListRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
