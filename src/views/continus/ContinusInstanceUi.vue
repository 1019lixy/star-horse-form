
<script setup lang="ts" name="ContinusInstanceUi">
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps.d.ts";
import {Config} from "@/api/settings.js";
const dataUrl: ApiUrls = {
  loadByPageUrl: "/devops-continus/continus/continusInstance/pageList",
  mergeUrl: "/devops-continus/continus/continusInstance/merge",
  mergeDraftUrl: "/devops-continus/continus/continusInstance/mergeDraft",
  batchMergeUrl: "/devops-continus/continus/continusInstance/mergeBatch",
  batchMergeDraftUrl: "/devops-continus/continus/continusInstance/mergeBatchDraft",
  loadByIdUrl: "/devops-continus/continus/continusInstance/getById",
  deleteUrl: "/devops-continus/continus/continusInstance/batchDeleteById",
  exportAllUrl: "/devops-continus/continus/continusInstance/exportData",
  downloadTemplateUrl: "/devops-continus/continus/continusInstance/downloadTemplate",
  userConditionUrl: "/devops-continus/continus/continusInstance/getAllByCondition",
  importUrl: "/devops-continus/continus/continusInstance/importData",
  uploadUrl: ""
};
const searchFormData = reactive<SearchProps[]>([
  {label: "项目名称", fieldName: "projectName", type: "input", matchType: "lk", defaultShow: true},
  {label: "项目类型", fieldName: "projectType", type: "input", matchType: "lk", defaultShow: true},
  {label: "程序语言", fieldName: "language", type: "input", matchType: "lk", defaultShow: true},
]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键", fieldName: "idContinusInst", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    }, {
      label: "实例名称", fieldName: "instanceName", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    [{
      label: "模板", fieldName: "template", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "是否独占 1是 2否 默认2", fieldName: "isAlone", type: "number",
        required: false, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    [{
      label: "关联计划", fieldName: "linkDataPlan", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },

      {
        label: "Cron定时触发执行", fieldName: "cron", type: "cron",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    [{
      label: "代码下载后存放目录", fieldName: "targetDir", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "是否自动触发构建 1是 2否 默认2", fieldName: "autoBuild", type: "input",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      }],

    {
      label: "备注", fieldName: "remark", type: "textarea",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建人", disabled: "yes", fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: "yes", fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: "yes", fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: "yes", fieldName: "updatedDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "国际码", fieldName: "local", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
  ],
  batchFieldList: []
});
const primaryKey = "idContinusInst";
const environmentInfoRef = ref();
const rules = {};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);
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
const dataFormat = (name: string, cellValue: Object): any => {

  return cellValue;
}
const init = async () => {

};

onMounted(async () => {
  await init();
})
</script>

<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="environmentInfoRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>environmentInfoRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>environmentInfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="environmentInfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat" @selectItem="selectItemFun"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>

