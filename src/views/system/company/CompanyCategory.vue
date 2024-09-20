<script setup lang="ts" name="CompanyCategory">
import {getMenuId, loadPagePermission} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SearchParams} from "@/components/types/Params";
import {getCustomerParam} from "@/utils/auth";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/companyCategory/pageList",
  mergeUrl: "/system-config/system/companyCategory/merge",
  mergeDraftUrl: "/system-config/system/companyCategory/mergeDraft",
  batchMergeUrl: "/system-config/system/companyCategory/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/companyCategory/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/companyCategory/getById",
  deleteUrl: "/system-config/system/companyCategory/batchDeleteById",
  exportAllUrl: "/system-config/system/companyCategory/exportData",
  downloadTemplateUrl: "/system-config/system/companyCategory/downloadTemplate",
  userConditionUrl: "/system-config/system/companyCategory/getAllByCondition",
  uploadUrl: "/system-config/system/companyCategory/uploadData",
  importUrl: "/system-config/system/companyCategory/importData",
  condition: [getCustomerParam()]
};
//主键
const primaryKey = "idCompanyCategory";
const companyCategoryRef = ref();
//全局数据对象
// const dataForm = ref({});
// provide("dataForm", dataForm);
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "名称",
      fieldName: "categoryName",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "编码",
      fieldName: "categoryCode",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },

  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: "主键",
      fieldName: "idCompanyCategory",
      type: "input",
      required: true,
      formShow: false,
      tableShow: false,
    },
    {
      label: "名称",
      fieldName: "categoryName",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "编码",
      fieldName: "categoryCode",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "序号",
      fieldName: "dataSort",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "创建人",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "国际编码",
      fieldName: "local",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = reactive<DialogProps>({
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
  bakeVisible1: false,
  bakeVisible2: false,
  bakeVisible3: false
});
provide("dialogProps", dialogProps);
// let permissions = ref<any>({});
//初始化方法
const initData = async () => {
  // permissions.value = await loadPagePermission(getMenuId());
};
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
onMounted(async () => {
  await initData();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="companyCategoryRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>companyCategoryRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>companyCategoryRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="companyCategoryRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
