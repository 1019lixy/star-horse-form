<script setup lang="ts" name="Customer">
import {apiInstance, dialogPreps} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {loadElementPlusIcon} from "@/api/sh_api";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/customer");
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "主体名称",
      defaultShow: true,
      fieldName: "customerName",
      type: "input",
      matchType: "lk"
    },
    {
      label: "主体编码",
      fieldName: "customerCode",
      type: "input",
      defaultShow: true,
      matchType: "lk"
    },
  ]
});
let systemIconList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idCustomer",
      type: "long",
      required: true,
    },
    {
      label: "主体名称",
      fieldName: "customerName",
      type: "input",
      required: true,
      formShow: true,
      tableShow: true,
    },
    {
      label: "主体编码",
      fieldName: "customerCode",
      type: "input",
      disabled: "Y",
      tableShow: true,
    },
    {
      label: "Logo",
      fieldName: "customerLogo",
      type: "icon",
      formShow: true,
      tableShow: true,
      optionList: systemIconList,
    },
    {
      label: "主体描述",
      fieldName: "customerDesc",
      type: "textarea",
      formShow: true,
      tableShow: true,
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
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",
    },
  ],
  cellEditable: true,
});
//主键
const primaryKey = "idCustomer";
const customerRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

//初始化方法
const initData = async () => {
  systemIconList.value = loadElementPlusIcon();
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
const dataFormat = (_name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
}
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="customerRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>customerRef.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun:any)=>customerRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="customerRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
