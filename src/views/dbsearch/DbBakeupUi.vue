<script setup lang="ts" name="DbBakeup">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SearchProps, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings.ts";
import {dictData, getMenuId, loadPagePermission} from "@/api/sh_api.ts";
import {initDbList, openDatabase} from "@/views/dbsearch/utils/DbSearchUtils.ts";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/dbsearch-manage/dbsearch/dbBakeup/pageList",
  mergeUrl: "/dbsearch-manage/dbsearch/dbBakeup/merge",
  mergeDraftUrl: "/dbsearch-manage/dbsearch/dbBakeup/mergeDraft",
  batchMergeUrl: "/dbsearch-manage/dbsearch/dbBakeup/mergeBatch",
  batchMergeDraftUrl: "/dbsearch-manage/dbsearch/dbBakeup/mergeBatchDraft",
  loadByIdUrl: "/dbsearch-manage/dbsearch/dbBakeup/getById",
  deleteUrl: "/dbsearch-manage/dbsearch/dbBakeup/batchDeleteById",
  exportAllUrl: "/dbsearch-manage/dbsearch/dbBakeup/exportData",
  downloadTemplateUrl: "/dbsearch-manage/dbsearch/dbBakeup/downloadTemplate",
  userConditionUrl: "/dbsearch-manage/dbsearch/dbBakeup/getAllByCondition",
  uploadUrl: "/dbsearch-manage/dbsearch/dbBakeup/importData",
  importUrl: ""
};
let dbList = ref<SelectOption[]>([]);
let bakePolicyList = ref<SelectOption[]>([]);
//查询属性
const searchFormData = reactive<SearchFields>({fieldList:[
  {
    label: "数据库配置",
    fieldName: "datasourcceConfigId",
    type: "select",
    optionList: dbList,
    defaultShow: true,
  },
  {
    label: "备份日期",
    fieldName: "createdDate",
    defaultShow: true,
    matchType: "bt",
    type: "date",
  },
]});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "数据库类型",
      fieldName: "dbType",
      type: "input",
      required: true,
      formShow: false,
      tableShow: true,
    },
    {
      label: "数据库信息",
      fieldName: "datasourcceConfigId",
      type: "select",
      optionList: dbList,
      required: true,
      formShow: true,
      tableShow: true,
    },
    [{
      label: "备份策略",
      fieldName: "bakePolicy",
      type: "select",
      helpMsg: "数据字段：BAKE_POLICY",
      optionList: bakePolicyList,
      formShow: true,
      tableShow: true,
    },
      {
        label: "定时备份",
        fieldName: "cronPolicy",
        type: "cron",
        helpMsg: "设置定时策略，系统根据策略进行备份",
        formShow: true,
        tableShow: true,
      }],
    {
      label: "备份文件路径",
      fieldName: "scriptPath",
      type: "input",
      formShow: false,
      tableShow: true,
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      formShow: true,
      tableShow: true,
    },
    {
      label: "创建人", disabled: "Y",
      fieldName: "createdBy",
      type: "input",
      tableShow: true,
    },
    {
      label: "修改人", disabled: "Y",
      fieldName: "updatedBy",
      type: "input",
      tableShow: true,
    },
    {
      label: "创建日期", disabled: "Y",
      fieldName: "createdDate",
      type: "date",
      tableShow: true,
    },
    {
      label: "修改日期", disabled: "Y",
      fieldName: "updatedDate",
      type: "date",
      tableShow: true,
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
      type: "input",
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
    },
    {
      label: "状态码名称",
      fieldName: "statusName",
      type: "input",
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",
    },
  ],
});
//主键
const primaryKey = "idDbBakeup";
const dbBakeupRef = ref();
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
  dialogPwdVisible: false,
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
//初始化方法
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId());
  dbList.value = await initDbList();
  bakePolicyList.value = await dictData("BAKE_POLICY");
};
onMounted(() => {
  initData();
});
/**
 * 列表，查看数据时数据转换
 * @param _name 名称
 * @param cellValue 值
 * @param _row 列表行数据
 */
const dataFormat = (_name: string, cellValue: any, _row: any): any => {
  //转换显示信息
  return cellValue;
}
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :box-width="'40%'" :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible"
                     :dialogProps="dialogProps" :title="'新增备份'">
    <star-horse-form  @refresh="dbBakeupRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dbBakeupRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>dbBakeupRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions" ref="dbBakeupRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl=
                               "dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
