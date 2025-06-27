<script setup lang="ts" name="Areainfo">
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields} from "star-horse-lowcode";
import {commonField} from "@/api/system";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref} from "vue";

const dataUrl: ApiUrls = apiInstance("system-config", "system/areainfo");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "区域名称", defaultVisible: true, matchType: "lk", fieldName: "areaName", },
    {label: "区域编码", defaultVisible: true, matchType: "lk", fieldName: "areaCode", }
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "区域主键",
      fieldName: "idAreainfo",
      type: "long"
    },
    {
      label: "父节点编号",
      fieldName: "parentNo",
      type: "select",
      formVisible: true,
      listVisible: true
    },
    {
      label: "区域名称",
      fieldName: "areaName",

      formVisible: true,
      listVisible: true
    },
    {
      label: "区域编码",
      fieldName: "areaCode",

      formVisible: true,
      listVisible: true
    },
    ...commonField()
  ],
  batchFieldList: []
});
const primaryKey = "idAreainfo";
const areainfoRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (_name: string, cellValue: object): any => {
  return cellValue;
};
const initData = async () => {
};
onMounted(() => {
  initData();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="areainfoRef?.loadByPage()"
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
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => areainfoRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="areainfoRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :showPageBar="false"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
