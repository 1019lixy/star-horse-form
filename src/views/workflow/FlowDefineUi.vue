<script setup lang="ts">
import {apiInstance, dialogPreps, dictData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref, onActivated, onDeactivated, nextTick} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo, UserFuncInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {useRouter} from "vue-router";

defineOptions({
  name: 'FlowDefine',
})
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowDefine");
//主键
const primaryKey = "idFlowDefine";
const flowDefineRef = ref();
const router = useRouter();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
let flowGroupList = ref<SelectOption[]>([]);
let flowDeploymentList = ref<SelectOption[]>([
  {name: "已部署", "value": "1"},
  {name: "未部署", "value": "2"}
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  "fieldList": [
    {"label": "流程名称", "fieldName": "name", "type": "input", matchType: "lk", defaultVisible: true},
    {"label": "流程分类", "fieldName": "flowGroup", "type": "select", matchType: "lk", defaultVisible: true, optionList: flowGroupList},
    /* {"label": "流程类型", "fieldName": "flowType", "type": "input",matchType:"lk",defaultVisible: true},*/
    {"label": "是否部署", "fieldName": "flowDeploymentId", "type": "select", matchType: "is", defaultVisible: true, optionList: flowGroupList},
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [
    {"label": "流程名称", "fieldName": "name", "type": "input", "required": true, "formVisible": true, "listVisible": true},
    {"label": "流程不是ID", "fieldName": "flowDeploymentId", "type": "input", "required": true, "formVisible": true, "listVisible": true},
    {"label": "流程分类", "fieldName": "flowGroup", "type": "input", "required": false, "formVisible": true, "listVisible": true},
    {"label": "绑定表单信息", "fieldName": "bindForm", "type": "input", "required": false, "formVisible": true, "listVisible": true},
    {"label": "图标", "fieldName": "flowIcon", "type": "input", "required": false, "formVisible": true, "listVisible": true},
    {"label": "流程类型", "fieldName": "flowType", "type": "input", "required": false, "formVisible": false, "listVisible": false},
    {"label": "流程版本", "fieldName": "flowVersion", "type": "input", "required": false, "formVisible": true, "listVisible": true},
    {"label": "多表单显示模式", "fieldName": "formVisibleType", "type": "input", "required": false, "formVisible": true, "listVisible": true},
    {"label": "流程管理员", "fieldName": "flowManager", "type": "input", "required": false, "formVisible": true, "listVisible": true},
    {"label": "流程Xml文件", "fieldName": "xmlFile", "type": "input", "required": true, "formVisible": true, "listVisible": false},
    {"label": "流程Json文件", "fieldName": "jsonFile", "type": "input", "required": true, "formVisible": true, "listVisible": false},
    {"label": "创建人", "fieldName": "createdBy", "type": "input", "listVisible": true, "preps": {}, "commonFlag": "Y"},
    {"label": "修改人", "fieldName": "updatedBy", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "创建时间", "fieldName": "createdTime", "type": "datetime", "listVisible": true, "preps": {}, "commonFlag": "Y"},
    {"label": "修改时间", "fieldName": "updatedTime", "type": "datetime", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "版本号", "fieldName": "version", "type": "number", "listVisible": true, "preps": {}, "commonFlag": "Y"},
    {"label": "是否删除", "fieldName": "isDel", "type": "number", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "数据编号", "fieldName": "dataNo", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "状态", "fieldName": "statusCode", "type": "select", "listVisible": false, "preps": {"urlOrDictName": "common", "values": [], "name": "statusCode", "dataSource": "dict", "props": {}}, "commonFlag": "Y"},
    {"label": "状态名称", "fieldName": "statusName", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "国际编码", "fieldName": "local", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "备注", "fieldName": "remark", "type": "textarea", "listVisible": false, "preps": {}, "commonFlag": "Y"}],
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
//扩展按钮
const extandBtns = ref<UserFuncInfo[]>([
  {
    icon: "edit",
    btnName: "编辑",
    priority: 1,
    authority: "edit",
    funcName: (row: any) => {
      router.push({path: "/workflow/WorkFlowForm", query: {data: row[primaryKey]}})
    }
  },
  {
    icon: "data-view",
    btnName: "查看",
    priority: 2,
    authority: "view",
    funcName: (row: any) => {
      router.push({path: "/workflow/WorkFlowForm", query: {data: row[primaryKey], isView: "Y"}})
    }
  }
]);
const extandBtns2 = ref<UserFuncInfo[]>([
  {
    icon: "add",
    btnName: "新增",
    authority: "add",
    funcName: () => {
      router.push({path: "/workflow/WorkFlowForm"})
    }
  },
]);
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
  flowGroupList.value = await dictData("flow_group");
};
const activated = async () => {
  await nextTick(() => {
    flowDefineRef.value.loadByPage()
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
      <star-horse-form @refresh="flowDefineRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
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
      <star-horse-search-comp @searchData="(data)=>flowDefineRef.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>flowDefineRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :extand-btns="extandBtns2"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="flowDefineRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :extand-btns="extandBtns"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
