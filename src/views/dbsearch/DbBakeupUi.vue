<script setup lang="ts" name="DbBakeup">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/dbsearch-manage/dbsearch/dbBakeup/pageList",
  mergeUrl: "/dbsearch-manage/dbsearch/dbBakeup/merge",
  mergeDraftUrl: "/dbsearch-manage/dbsearch/dbBakeup/mergeDraft",
  batchMergeUrl: "/dbsearch-manage/dbsearch/dbBakeup/mergeBatch",
  batchMergeDraftUrl: "/dbsearch-manage/dbsearch/dbBakeup/mergeBatchDraft",
  loadByIdUrl: "/dbsearch-manage/dbsearch/dbBakeup/getById",
  deleteUrl: "/dbsearch-manage/dbsearch/dbBakeup/batchDeleteById",
  exportAllUrl: "/dbsearch-manage/dbsearch/dbBakeup/exportData",
  downloadTemplateUrl: "/dbsearch-manage/dbsearch/dbBakeup/downloadTemplate",
  userConditionUrl: "/dbsearch-manage/dbsearch/dbBakeup/getAllByCondition",
  uploadUrl: "/dbsearch-manage/dbsearch/dbBakeup/importData",
  importUrl: ""
};
//查询属性
const searchFormData = reactive<SearchProps[]>([
  {
    label: "主键",
    fieldName: "idDbBakeup",
    type: "long"
  },
  {
    label: "数据库类型",
    fieldName: "dbType",
    type: "input"
  },
  {
    label: "数据库配置ID",
    fieldName: "datasourcceConfigId",
    type: "input"
  },
  {
    label: "备份文件路径",
    fieldName: "scriptPath",
    type: "input"
  },
  {
    label: "备注",
    fieldName: "remark",
    type: "input"
  },
]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idDbBakeup",
      type: "long",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "数据库类型",
      fieldName: "dbType",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "数据库配置ID",
      fieldName: "datasourcceConfigId",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "备份文件路径",
      fieldName: "scriptPath",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "创建人", disabled: "yes",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "修改人", disabled: "yes",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "创建日期", disabled: "yes",
      fieldName: "createdDate",
      type: "date",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "修改日期", disabled: "yes",
      fieldName: "updatedDate",
      type: "date",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "是否已逻辑",
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
      label: "状态码名称",
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
  stopAutoLoad: false
});
//主键
const primaryKey = "idDbBakeup";
const dbBakeupRef = ref();
//校验
const rules = {

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
  dialogPwdVisible: false,
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false
});
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
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
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="dbBakeupRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">

    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>dbBakeupRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>dbBakeupRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="dbBakeupRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl=
        "dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
