<script setup lang="ts" name="CompanyDefine">
import {apiInstance, createTree, dialogPreps, loadData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref, onActivated, onDeactivated} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo, UserFuncInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {warning} from "@/utils/message.ts";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/companyDefine");
//主键
const primaryKey = "idCompanyDefine";
const companyDefineRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
let companyCategoryList = ref<SelectOption[]>([]);
let companyList = ref<SelectOption[]>([]);
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
      type: "tselect",
      optionList: companyCategoryList,
      defaultShow: true,
      matchType: "lk",
      preps: {
        checkStrictly: "Y"
      }
    },
  ]
});

//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [{
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
        editDisabled: "Y",
        required: true,
        formShow: !false,
        tableShow: !false,
      }],
    [{
      label: "公司类别",
      fieldName: "category",
      type: "tselect",
      optionList: companyCategoryList,
      required: true,
      formShow: !false,
      tableShow: !false,
      preps: {
        checkStrictly: "Y",
        defaultExpandAll:"Y"
      }
    }, {
      label: "排序",
      fieldName: "dataSort",
      type: "number",
      required: true,
      formShow: !false,
      tableShow: !false,
    }], [{
      label: "公司简称",
      fieldName: "shortName",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
      {
        label: "父节点",
        fieldName: "parentId",
        type: "tselect",
        optionList: companyList,
        formShow: !false,
        preps: {
          checkStrictly: "Y",
          defaultExpandAll:"Y"
        }
      }],
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      formShow: !false,
      tableShow: !false,
    }
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
let outerForm = ref<any>({});
provide("dialogProps", dialogProps);
let extandBtns = ref<UserFuncInfo[]>([{
  btnName: "添加子公司",
  authority: "add",
  icon: "plus",
  funcName: (row: any) => {
    outerForm.value["parentId"] = row[primaryKey];
    dialogProps.editVisible = true;
  }
}]);
//初始化方法
const initData = async () => {
  let data = await loadData("/system-config/system/companyCategory/getAllByCondition", {});
  if (data.error) {
    warning(data.error);
    return;
  }
  companyCategoryList.value = createTree(data.data, "categoryCode", "categoryName", "");
  await actived();
};
const actived = async () => {
  let data = await loadData("/system-config/system/companyDefine/getAllByCondition", {});
  if (data.error) {
    warning(data.error);
    return;
  }
  companyList.value = createTree(data.data, primaryKey, "name", "");
  console.log(companyCategoryList.value);
}
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  return cellValue;
}
onMounted(async () => {
  await initData();
});
onActivated(() => {
  actived();
});
onDeactivated(() => {
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="companyDefineRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules" :outerFormData="outerForm"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>companyDefineRef.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>companyDefineRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle" :extandBtns="extandBtns"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="companyDefineRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :extandBtns="extandBtns"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
