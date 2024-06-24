<script setup lang="ts" name="DynamicFormItems">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings";
import {getMenuId, loadPagePermission} from "@/api/sh_api.ts";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/userdb-manage/userdb/dynamicFormItems/pageList",
  mergeUrl: "/userdb-manage/userdb/dynamicFormItems/merge",
  mergeDraftUrl: "/userdb-manage/userdb/dynamicFormItems/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/dynamicFormItems/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/dynamicFormItems/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/dynamicFormItems/getById",
  deleteUrl: "/userdb-manage/userdb/dynamicFormItems/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/dynamicFormItems/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/dynamicFormItems/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/dynamicFormItems/getAllByCondition",
  uploadUrl: "/userdb-manage/userdb/dynamicFormItems/importData",
  importUrl: ""
};
const categoryList = ref<SelectOption[]>([{
  name: "容器", value: "2"
}, {
  name: "标准组件", value: "1"
}, {
  name: "自定义组件", value: "3"
}]);
//查询属性
const searchFormData = reactive<SearchProps[]>([
  {label: "名称", fieldName: "itemName", type: "input", matchType: "lk"},
  {label: "类别", fieldName: "itemType", type: "input", matchType: "lk"},
  {label: "分类", fieldName: "category", type: "select", optionList: categoryList},
]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idFormItems",
      type: "long",
      required: true,


    },
    {
      label: "名称",
      fieldName: "itemName",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "类别",
      fieldName: "itemType",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "图标",
      fieldName: "itemIcon",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "分类",
      fieldName: "category",
      type: "select",
      optionList: categoryList,
      required: true,
      formShow: !false,
      tableShow: !false,

    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",


    },
    {
      label: "创建人", disabled: "Y",
      fieldName: "createdBy",
      type: "input",


    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date",


    },
    {
      label: "修改人", disabled: "Y",
      fieldName: "updatedBy",
      type: "input",


    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date",


    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",


    },
    {
      label: "状态吗",
      fieldName: "statusCode",
      type: "input",


    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",


    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",


    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",


    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",

      formShow: !false,
      tableShow: !false,

    },
    {
      label: "元素排序",
      fieldName: "dataSort",
      type: "number",
      required: true,
      formShow: !false,
      tableShow: !false,

    },
  ],


});
//主键
const primaryKey = "idFormItems";
const dynamicFormItemsRef = ref();
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
  dialogPwdVisible: false,
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false
});
provide("dialogProps", dialogProps);let permissions = ref<any>({});
//初始化方法
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
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
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  if (name == "category") {
    let redata = categoryList.value.find(item => item.value == cellValue);
    return redata?.name || cellValue;
  }
  return cellValue;
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="dynamicFormItemsRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dynamicFormItemsRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions"  @tableCompFunc="(fun:any)=>dynamicFormItemsRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions"   ref="dynamicFormItemsRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
