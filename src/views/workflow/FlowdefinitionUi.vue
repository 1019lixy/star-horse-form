<script setup lang="ts" name="EnvInfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps.d.ts";
import {Config} from "@/api/settings.js";
import {DialogProps} from "@/components/types/DialogProps";
const dataUrl: ApiUrls = {
  loadByPageUrl: "/flow-engine/workflow/flowoperation/pageList",
  mergeUrl: "/flow-engine/workflow/flowoperation/merge",
  mergeDraftUrl: "/flow-engine/workflow/flowoperation/mergeDraft",
  batchMergeUrl: "/flow-engine/workflow/flowoperation/mergeBatch",
  batchMergeDraftUrl: "/flow-engine/workflow/flowoperation/mergeBatchDraft",
  loadByIdUrl: "/flow-engine/workflow/flowoperation/getById",
  deleteUrl: "/flow-engine/workflow/flowoperation/batchDeleteById",
  exportAllUrl: "/flow-engine/workflow/flowoperation/exportData",
  downloadTemplateUrl: "/flow-engine/workflow/flowoperation/downloadTemplate",
  userConditionUrl: "/flow-engine/workflow/flowoperation/getAllByCondition",
  importUrl: "/flow-engine/workflow/flowoperation/importData",
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
      label: "主键", fieldName: "defineId", type: "long",
    }, [{
      label: "流程名称", fieldName: "flowName", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
      {
        label: "流程Id", fieldName: "flowId", type: "input",
        formShow: !false,
        tableShow: !false
      }],
    [{
      label: "流程定义Xml文件", fieldName: "flowXml", type: "number",
      formShow: !false,
      tableShow: !false
    }, {
      label: "流程定义图片", fieldName: "flowSvg", type: "number",
      formShow: !false,
      tableShow: !false
    }],
    {
      label: "备注", fieldName: "remark", type: "textarea",
      formShow: true,
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
const primaryKey = "idEnvInfo";
const flowDefinitionRef = ref();
const rules = {};
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
provide("dialogProps", dialogProps);let permissions = ref<any>({});
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
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="flowDefinitionRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>flowDefinitionRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions"  @tableCompFunc="(fun:any)=>flowDefinitionRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp :permissions="permissions"   ref="flowDefinitionRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat" @selectItem="selectItemFun"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
