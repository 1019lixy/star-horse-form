<script setup lang="ts" name="Areainfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getMenuId, loadPagePermission} from "@/api/sh_api.ts";
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/areainfo/pageList",
  mergeUrl: "/system-config/system/areainfo/merge",
  mergeDraftUrl: "/system-config/system/areainfo/mergeDraft",
  batchMergeUrl: "/system-config/system/areainfo/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/areainfo/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/areainfo/getById",
  deleteUrl: "/system-config/system/areainfo/batchDeleteById",
  exportAllUrl: "/system-config/system/areainfo/exportData",
  downloadTemplateUrl: "/system-config/system/areainfo/downloadTemplate",
  userConditionUrl: "/system-config/system/areainfo/getAllByCondition",
  importUrl: "/system-config/system/areainfo/importData",
  uploadUrl: "",
  condition: []
};
const searchFormData = reactive<SearchFields>({fieldList:[{label: "区域主键", fieldName: "idAreainfo", type: "long"},
  {label: "区域名称", defaultShow: true, fieldName: "areaName", type: "input"},
  {label: "区域编码", fieldName: "areaCode", type: "input"},
  {label: "父节点编号", fieldName: "parentNo", type: "input"},
]});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "区域主键", fieldName: "idAreainfo", type: "long",
      formShow: true,
      tableShow: true
    },
    {
      label: "区域名称", fieldName: "areaName", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "区域编码", fieldName: "areaCode", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "父节点编号", fieldName: "parentNo", type: "input",
      formShow: true,
      tableShow: true
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  batchFieldList: []
});
const primaryKey = "idAreainfo";
const areainfoRef = ref();
const rules = {};
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
const dataFormat = (_name: string, cellValue: Object): any => {
  return cellValue;
}
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
};
onMounted(() => {
  initData();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form  @refresh="areainfoRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>areainfoRef.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr>
      <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>areainfoRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions" ref="areainfoRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
