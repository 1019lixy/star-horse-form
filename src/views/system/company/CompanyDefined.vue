<script setup lang="ts" name="CompanyDefine">
import {apiInstance, dialogPreps} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/companyDefine");
//主键
const primaryKey = "idCompanyDefine";
const companyDefineRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "公司名称",
      fieldName: "name",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "公司编码",
      fieldName: "code",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "公司简称",
      fieldName: "shortName",
      defaultShow: false,
      matchType: "lk",
      type: "input"
    },
    {
      label: "排序",
      fieldName: "dataSort",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "公司类别",
      fieldName: "category",
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
      label: "公司名称",
      fieldName: "name",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "公司编码",
      fieldName: "code",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "公司简称",
      fieldName: "shortName",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "排序",
      fieldName: "dataSort",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "公司类别",
      fieldName: "category",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
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
    <star-horse-form @refresh="companyDefineRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>companyDefineRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>companyDefineRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="companyDefineRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
