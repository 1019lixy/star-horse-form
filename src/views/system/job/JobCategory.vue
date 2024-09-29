<script lang="ts" name="RankType" setup>
import {apiInstance, dialogPreps} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/rankType");
//主键
const primaryKey = "idRankType";
const rankTypeRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "分类名称",
      fieldName: "rankTypeName",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "编码",
      fieldName: "rankTypeCode",
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
      label: "分类名称",
      fieldName: "rankTypeName",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "编码",
      fieldName: "rankTypeCode",
      type: "input",
      editDisabled: "Y",
      required: true,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "排序",
      fieldName: "rankTypeSort",
      type: "number",
      defaultValue: 1,
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "职能描述",
      fieldName: "remark",
      type: "textarea",
      required: false,
      formShow: true,
      tableShow: true,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
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
      type: "number",
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
const activated = () => {

}
const deactivated = () => {

}
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
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
</script>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :boxWidth="'400px'" :dialogProps="dialogProps"
                     :isShowBtnContinue="true">
    <star-horse-form :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules" @refresh="rankTypeRef.loadByPage()"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :isView="true"
                     :title="'查看数据'">
    <star-horse-data-view :compUrl="dataUrl" :dataFormat="dataFormat" :field-list="tableFieldList"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}" class="search_btn">
      <star-horse-search-comp :compUrl="dataUrl" :formData="searchFormData"
                              @searchData="(data)=>rankTypeRef.createSearchParams(data)"/>
      <hr/>
      <star-horse-button-list :compUrl="dataUrl" :dialogProps="dialogProps"
                              :showType="Config.buttonStyle" @tableCompFunc="(fun)=>rankTypeRef.tableCompFunc(fun)"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="rankTypeRef" :compUrl="dataUrl" :dataFormat="dataFormat"
                           :fieldList="tableFieldList"
                           :primaryKey="primaryKey"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
