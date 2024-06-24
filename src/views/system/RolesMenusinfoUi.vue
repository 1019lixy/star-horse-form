<script setup lang="ts" name="RolesMenusinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/rolesMenusinfo/pageList",
  mergeUrl: "/system-config/system/rolesMenusinfo/merge",
  mergeDraftUrl: "/system-config/system/rolesMenusinfo/mergeDraft",
  batchMergeUrl: "/system-config/system/rolesMenusinfo/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/rolesMenusinfo/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/rolesMenusinfo/getById",
  deleteUrl: "/system-config/system/rolesMenusinfo/batchDeleteById",
  exportAllUrl: "/system-config/system/rolesMenusinfo/exportData",
  downloadTemplateUrl: "/system-config/system/rolesMenusinfo/downloadTemplate",
  userConditionUrl: "/system-config/system/rolesMenusinfo/getAllByCondition",
  importUrl: "/system-config/system/rolesMenusinfo/importData",
  uploadUrl: "",
  condition: []
};

//查询属性
const searchFormData = reactive<SearchProps[]>([
  {
    label: "系统名称",
    defaultShow: true,
    fieldName: "idInformations",
    type: "select"
  },
  {
    label: "菜单名称",
    defaultShow: true,
    fieldName: "idMenusinfo",
    type: "input"
  },
]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idRolesMenusinfo",
      type: "long",
      required: true,


    },
    {
      label: "角色Id",
      fieldName: "idRolesinfo",
      type: "long",
      required: true,


    },
    {
      label: "系统Id",
      fieldName: "idInformations",
      type: "long",


    },
    {
      label: "菜单Id",
      fieldName: "idMenusinfo",
      type: "long",
      required: true,


    },
    {
      label: "系统名称",
      fieldName: "sysName",
      type: "input",


      tableShow: !false,

    },
    {
      label: "菜单名称",
      fieldName: "menuName",
      type: "input",
      required: true,

      tableShow: !false,

    },
    {
      label: "创建人", disabled: "Y",
      fieldName: "createdBy",
      type: "input",


    },
    {
      label: "修改人", disabled: "Y",
      fieldName: "updatedBy",
      type: "input",


    },
    {
      label: "创建时间",
      fieldName: "createdDate",
      type: "date",


    },
    {
      label: "修改时间",
      fieldName: "updatedDate",
      type: "date",


    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",


    },
    {
      label: "是否逻辑删除",
      fieldName: "isDel",
      type: "number",


    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",


    },
    {
      label: "数据状态码",
      fieldName: "statusCode",
      type: "input",


    },
    {
      label: "数据状态名称",
      fieldName: "statusName",
      type: "input",


    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",


    },
  ],


  cellEditable: false,

});
//主键
const primaryKey = "idRolesMenusinfo";
const rolesMenusinfoRef = ref();
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

  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false
});
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
};
onMounted(() => {
  initData();
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

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="rolesMenusinfoRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>rolesMenusinfoRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun:any)=>rolesMenusinfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="rolesMenusinfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
