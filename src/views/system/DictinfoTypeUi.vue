<script setup lang="ts" name="DictinfoType">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import DictinfoUI from "@/views/system/DictinfoUI.vue";
import {SearchParams} from "@/components/types/Params";
import {getMenuId, loadPagePermission} from "@/api/sh_api.ts";
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/dictinfoType/pageList",
  mergeUrl: "/system-config/system/dictinfoType/merge",
  mergeDraftUrl: "/system-config/system/dictinfoType/mergeDraft",
  batchMergeUrl: "/system-config/system/dictinfoType/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/dictinfoType/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/dictinfoType/getById",
  deleteUrl: "/system-config/system/dictinfoType/batchDeleteById",
  exportAllUrl: "/system-config/system/dictinfoType/exportData",
  downloadTemplateUrl: "/system-config/system/dictinfoType/downloadTemplate",
  userConditionUrl: "/system-config/system/dictinfoType/getAllByCondition",
  importUrl: "/system-config/system/dictinfoType/importData",
  uploadUrl: "",
  condition: []
};
const searchFormData = reactive<SearchProps[]>([
  {label: "字典类型名称", defaultShow: true, fieldName: "dictTypeName", type: "input"},
  {label: "字典类型编码", defaultShow: true, fieldName: "dictTypeCode", type: "input"},
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDictinfoType", type: "long",
    },
    {
      label: "字典类型名称", fieldName: "dictTypeName", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "字典类型编码", fieldName: "dictTypeCode", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "备注", fieldName: "remark", type: "textarea",
      formShow: !false,
      tableShow: !false
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
      label: "国际码", fieldName: "local", type: "input",
    },
    {
      label: "状态名称", fieldName: "statusName", type: "input",
    },
    {
      label: "状态值", fieldName: "statusCode", type: "input",
    },
  ],
  //在表格右侧添加自定义功能
});
const primaryKey = "idDictinfoType";
const rules = {};
const dataForm = ref({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
let dictTypeCode = ref<String>("");
const dictTypeRef = ref();
//在ts中获取不到方法
const selectItemFun = (row: any) => {
  dictTypeCode.value = row["dictTypeCode"];
};
const searchData = (data: SearchParams[]) => {
  dictTypeRef.value.createCreateParams(data);
};
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
};
onMounted(async () => {
  await initData();
})
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="dictTypeRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dictTypeRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>dictTypeRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions" ref="dictTypeRef" @selectItem="selectItemFun"
                           :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
    <dictinfo-u-i :dictType="dictTypeCode"/>
  </el-card>
</template>
