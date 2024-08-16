<script setup lang="ts" name="Dbinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {loadGetData} from "@/api/sh_api";
import {warning} from "@/utils/message";
import {Config} from "@/api/settings.ts";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/pageList",
  mergeUrl: "/dbsearch-manage/dbsearch/dbinfoEntity//merge",
  mergeDraftUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/mergeDraft",
  batchMergeUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/getById",
  deleteUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/batchDeleteById",
  exportAllUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/exportData",
  downloadTemplateUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/downloadTemplate",
  userConditionUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/getAllByCondition",
  uploadUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/importData",
  importUrl: ""
};
let dbTypeList = ref<Array<any>>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "数据库类型", fieldName: "dbType", type: "select", defaultShow: true, optionList: dbTypeList},
    {label: "数据库名称", fieldName: "dbName", type: "input", defaultShow: true, matchType: "lk"},
  ]
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键", fieldName: "idDbinfo", type: "long",
    },
    [{
      label: "数据库类型", fieldName: "dbType", type: "select", optionList: dbTypeList,
      required: true, formShow: true,
      actionName: "change", actions: (val: any) => {
        val["port"] = dbTypeList.value.find(item => item.value == val["dbType"])?.port;
      },
      tableShow: true
    },
      {
        label: "数据库名称", fieldName: "dbName", type: "input",
        formShow: true, required: true,
        tableShow: true
      }],
    [{
      label: "数据库地址", fieldName: "host", type: "input",
      formShow: true, required: true,
      tableShow: true
    },

      {
        label: "数据库端口", fieldName: "port", type: "number",
        formShow: true, required: true,
        tableShow: true
      }],
    [{
      label: "用户名", fieldName: "userName", type: "input",
      formShow: true, required: true,
      tableShow: true
    },
      {
        label: "密码", fieldName: "password", type: "password",
        formShow: true, required: true,
        tableShow: true
      }],
    {
      label: "禁用操作权限", fieldName: "exclusions", type: "textarea",
      formShow: true,
      tableShow: true
    },
    {
      label: "数据库描述", fieldName: "dbComment", type: "textarea",
      formShow: true,
      tableShow: true
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  batchFieldList: []
});
const primaryKey = "idDbinfo";
const dbinfoRef = ref();
const rules = {};
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
});
provide("dialogProps", dialogProps);

const loadDbTypeList = async () => {
  let {data, error} = await loadGetData("/dbsearch-manage/dbsearch/dbinfoEntity/dbType");
  if (error) {
    warning(error);
    return;
  }
  for (let val in data) {
    let sdata: any = {name: data[val].dbTypeName, value: data[val].dbTypeCode, port: data[val].dbDefaultPort};
    dbTypeList.value.push(sdata);
  }
};
const dataFormat = (name: string, cellValue: Object): any => {
  if (name == "password") {
    return "******";
  } else if (name == "dbType") {
    let data = dbTypeList.value.find(item => item.value == cellValue);
    return data ? data.name : cellValue;
  }
  return cellValue;
}
const initData = async () => {

  await loadDbTypeList();
};
onMounted(() => {
  initData();
});
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="dbinfoRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dbinfoRef.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list  @tableCompFunc="(fun:any)=>dbinfoRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp  ref="dbinfoRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
