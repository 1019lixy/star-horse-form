<script setup lang="ts" name="Customer">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {loadElementPlusIcon} from "@/api/sh_api";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/customer/pageList",
  mergeUrl: "/system-config/system/customer/merge",
  mergeDraftUrl: "/system-config/system/customer/mergeDraft",
  batchMergeUrl: "/system-config/system/customer/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/customer/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/customer/getById",
  deleteUrl: "/system-config/system/customer/batchDeleteById",
  exportAllUrl: "/system-config/system/customer/exportData",
  downloadTemplateUrl: "/system-config/system/customer/downloadTemplate",
  userConditionUrl: "/system-config/system/customer/getAllByCondition",
  importUrl: "/system-config/system/customer/importData",
  uploadUrl: "",
  condition: []
};
//查询属性
const searchFormData = reactive<SearchProps[]>([
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
    matchType: "lk"
  },


]);
let systemIconList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idCustomer",
      type: "long",
      required: true,
      formShow: false,
      tableShow: false,
      minWidth: 180
    },
    {
      label: "主体名称",
      fieldName: "customerName",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "主体编码",
      fieldName: "customerCode",
      type: "input",
      disabled: 1,
      required: false,
      formShow: false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "Logo",
      fieldName: "customerLogo",
      type: "icon",
      required: false,
      formShow: !false,
      tableShow: !false,
      minWidth: 180,
      optionList: systemIconList,
    },
    {
      label: "主体描述",
      fieldName: "customerDesc",
      type: "textarea",
      required: false,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },


    {
      label: "创建人", disabled: 1,
      fieldName: "createdBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "修改人", disabled: 1,
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "创建时间",
      fieldName: "createdDate",
      type: "date",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "修改时间",
      fieldName: "updatedDate",
      type: "date",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "是否逻辑删除",
      fieldName: "isDel",
      type: "number",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  tableCellEditabled: false,
  stopAutoLoad: false
});
//主键
const primaryKey = "idCustomer";
const customerRef = ref();
//校验
const rules = {
  idCustomer: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  customerName: [{required: true, message: "必填项不能为空", trigger: "blur"}],
};
const searchForm = ref({});
//全局查询对象
provide("searchForm", searchForm);
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
  systemIconList.value = loadElementPlusIcon();
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
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="customerRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>customerRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>customerRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="customerRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
