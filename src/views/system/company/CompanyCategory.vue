<script setup lang="ts" name="CompanyCategory">
import {apiInstance, dialogPreps} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {PageFieldInfo, UserFuncInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {commonField} from "@/api/system.ts";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/companyCategory");
//主键
const primaryKey = "idCompanyCategory";
const companyCategoryRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "名称",
      fieldName: "categoryName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: "编码",
      fieldName: "categoryCode",
      defaultVisible: true,
      matchType: "lk",
    },

  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: "名称",
      fieldName: "categoryName",
      required: true,
      formVisible: !false,
      listVisible: !false,
      listPrototypeDisplay:"text",
      preps:{
        tagType:"info",
      }
    },
    {
      label: "编码",
      fieldName: "categoryCode",
      required: true,
      editDisabled: "Y",
      formVisible: !false,
      listVisible: !false,
    },
    {
      label: "序号",
      fieldName: "dataSort",
      type: "number",
      required: false,
      formVisible: !false,
      listVisible: !false,
      listPrototypeDisplay:"text",
    }, ...commonField()
  ],
  cellEditable: true,
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let outerForm = ref<any>({});
let extandBtns = ref<UserFuncInfo[]>([{
  btnName: "添加子节点",
  authority: "add",
  icon: "plus",
  priority: 1,
  funcName: (row: any) => {
    outerForm.value["parentId"] = row[primaryKey];
    dialogProps.editVisible = true;
  }
}]);
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
  console.log(row);
  //转换显示信息
  if (name == "parentId" && row.parent) {
    row.parent.categoryName;
  }
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
                       :outerFormData="outerForm"
                       :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>companyCategoryRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>companyCategoryRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="companyCategoryRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :extandBtns="extandBtns"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
