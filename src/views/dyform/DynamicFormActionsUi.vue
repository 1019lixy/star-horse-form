<script setup lang="ts" name="DynamicFormActions">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings";
import {getMenuId, loadPagePermission} from "@/api/sh_api.ts";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/userdb-manage/userdb/dynamicFormActions/pageList",
  mergeUrl: "/userdb-manage/userdb/dynamicFormActions/merge",
  mergeDraftUrl: "/userdb-manage/userdb/dynamicFormActions/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/dynamicFormActions/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/dynamicFormActions/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/dynamicFormActions/getById",
  deleteUrl: "/userdb-manage/userdb/dynamicFormActions/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/dynamicFormActions/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/dynamicFormActions/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/dynamicFormActions/getAllByCondition",
  uploadUrl: "/userdb-manage/userdb/dynamicFormActions/importData",
  importUrl: ""
};
//查询属性
const searchFormData = reactive<SearchProps[]>([
  {label: "主键", fieldName: "idFormActions", type: "long"},
  {label: "归属元素", fieldName: "idFormItems", type: "long"},
  {label: "标签名称", fieldName: "label", type: "input"},
  {label: "事件名称", fieldName: "actionName", type: "input"},
  {label: "属性类别", fieldName: "fieldType", type: "input"},
  {label: "备注", fieldName: "remark", type: "input"},
  {label: "元素排序", fieldName: "dataSort", type: "number"},
]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idFormActions",
      type: "long",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "归属元素",
      fieldName: "idFormItems",
      type: "long",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "标签名称",
      fieldName: "label",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "事件名称",
      fieldName: "actionName",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "属性类别",
      fieldName: "fieldType",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",


    },
    {
      label: "创建人", disabled: "Y",
      fieldName: "createdBy",
      type: "input",


    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date",


    },
    {
      label: "修改人", disabled: "Y",
      fieldName: "updatedBy",
      type: "input",


    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date",


    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",


    },
    {
      label: "状态吗",
      fieldName: "statusCode",
      type: "input",


    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",


    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",


    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",


    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",

      formShow: !false,
      tableShow: !false,

    },
    {
      label: "元素排序",
      fieldName: "dataSort",
      type: "number",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
  ],


});
//主键
const primaryKey = "idFormActions";
const dynamicFormActionRef = ref();
//校验
const rules = {};


const dataForm = ref({});
//全局数据对象
provide("dataForm", dataForm);
//控制弹窗相关设置
const dialogProps = reactive<DialogProps>({
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
  dialogPwdVisible: false,
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
//初始化方法
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
};
onMounted(async () => {
  await initData();
});
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="dynamicFormActionRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dynamicFormActionRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions"
                              @tableCompFunc="(fun:any)=>dynamicFormActionRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp :permissions="permissions" ref="dynamicFormActionRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
