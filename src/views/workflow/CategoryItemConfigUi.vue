<script setup lang="ts">
import {apiInstance, dialogPreps, dictData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

defineOptions({
  name: 'CategoryItemConfig',
})
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/categoryItemConfig");
//主键
const primaryKey = "idCategoryItemConfig";
const categoryItemConfigRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
let cfgCategoryList = ref<SelectOption[]>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  "fieldList": [{
    "label": "配置类别",
    "fieldName": "cfgCategory",
    "type": "select",
    "matchType": "eq",
    "defaultShow": true,
    optionList: cfgCategoryList,
  }, {
    "label": "名称",
    "fieldName": "name",
    "type": "input",
    "matchType": "lk",
    "defaultShow": true,
    "preps": {}
  }, {
    "label": "编码",
    "fieldName": "code",
    "type": "input",
    "matchType": "lk",
    "defaultShow": true,
    "preps": {}
  }, {
    "label": "是否选中",
    "fieldName": "checkedFlag",
    "type": "select",
    "matchType": "eq",
    "defaultShow": true,
    "preps": {"values": [{"name": "是", "value": "Y"}, {"name": "否", "value": "N"}],}
  }]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [{
    "label": "配置类别",
    "fieldName": "cfgCategory",
    "type": "select",
    "required": true,
    "formShow": true,
    "tableShow": true,
    optionList: cfgCategoryList,
  }, {
    "label": "名称",
    "fieldName": "name",
    "type": "input",
    "required": true,
    "formShow": true,
    "tableShow": true,
    "preps": {}
  }, [{
    "label": "编码",
    "fieldName": "code",
    "type": "input",
    "required": false,
    "formShow": true,
    "tableShow": true,
    "preps": {}
  }, {
    "label": "是否选中",
    "fieldName": "checkedFlag",
    "type": "switch",
    defaultValue: "N",
    "required": false,
    "formShow": true,
    "tableShow": true,
    "preps": {}
  }], [{
    "label": "图片地址",
    "fieldName": "imageUrl",
    "type": "image",
    "required": false,
    "formShow": true,
    "tableShow": true,
    "preps": {
      assignType:"url"
    }
  }, {
    "label": "图标",
    "fieldName": "icon",
    "type": "icon",
    "required": false,
    "formShow": true,
    "tableShow": true,
    "preps": {}
  }], {
    "label": "描述",
    "fieldName": "description",
    "type": "textarea",
    "required": true,
    "formShow": true,
    "tableShow": true,
    "preps": {}
  }, {
    "label": "创建人",
    "fieldName": "createdBy",
    "type": "input",
    "formShow": false,
    "tableShow": true,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "修改人",
    "fieldName": "updatedBy",
    "type": "input",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "创建时间",
    "fieldName": "createdTime",
    "type": "datetime",
    "formShow": false,
    "tableShow": true,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "创建日期",
    "fieldName": "createdDate",
    "type": "datetime",
    "formShow": false,
    "tableShow": true,
    "preps": {},
    "commonFlag": "N"
  }, {
    "label": "修改时间",
    "fieldName": "updatedTime",
    "type": "datetime",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "版本号",
    "fieldName": "version",
    "type": "number",
    "formShow": false,
    "tableShow": true,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "是否删除",
    "fieldName": "isDel",
    "type": "number",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "数据编号",
    "fieldName": "dataNo",
    "type": "input",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "状态码",
    "fieldName": "statusCode",
    "type": "input",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "状态名称",
    "fieldName": "statusName",
    "type": "string",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "国际编码",
    "fieldName": "local",
    "type": "input",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "备注",
    "fieldName": "remark",
    "type": "input",
    "formShow": false,
    "tableShow": false,
    "preps": {},
    "commonFlag": "Y"
  }],
  "batchFieldList": [],
  "userTableFuncs": [],
  "dynamicFormas": [],
  "orderBy": [],
  "batchName": "batchDataList",
  "tableCellEditabled": false,
  "stopAutoLoad": false
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
  cfgCategoryList.value = await dictData("flow_helper_category");
};
const activated = async () => {
  await nextTick(() => {
    categoryItemConfigRef.value.loadByPage()
  });
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
  if(name==='cfgCategory'){
    return cfgCategoryList.value.find(item=>item.value==cellValue)?.name||cellValue;
  }
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
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <div class="dialog-body">
      <star-horse-form @refresh="categoryItemConfigRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                       :rules="rules"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <div class="dialog-body">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
    </div>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>categoryItemConfigRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>categoryItemConfigRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="categoryItemConfigRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
