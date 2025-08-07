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

const dataUrl: ApiUrls = apiInstance("system-config", "system/whiteList");
let typeList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "过滤类型",
      fieldName: "whiteType",
      defaultVisible: true,
      type: "select",
      preps: {
        values: typeList,
      },
    },
    {
      label: "过滤内容",
      fieldName: "whiteName",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idWhiteList",
      type: "long",
    },
    {
      label: "过滤类型",
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
      label: "过滤内容",
      fieldName: "whiteName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",

      listVisible: true,
    },
    {
      label: "创建日期",
      disabled: true,
      fieldName: "createdTime",
      type: "date",
      listVisible: true,
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",

      listVisible: true,
    },
    {
      label: "修改日期",
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
      listVisible: true,
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
    {
      label: "备注",
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
