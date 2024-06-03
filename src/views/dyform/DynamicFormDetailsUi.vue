<script setup lang="ts" name="DynamicFormDetails">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {Config} from "@/api/settings";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/userdb-manage/userdb/dynamicFormDetails/pageList",
  mergeUrl: "/userdb-manage/userdb/dynamicFormDetails/merge",
  mergeDraftUrl: "/userdb-manage/userdb/dynamicFormDetails/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/dynamicFormDetails/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/dynamicFormDetails/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/dynamicFormDetails/getById",
  deleteUrl: "/userdb-manage/userdb/dynamicFormDetails/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/dynamicFormDetails/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/dynamicFormDetails/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/dynamicFormDetails/getAllByCondition",
  importUrl: "/userdb-manage/userdb/dynamicFormDetails/importData",
  uploadUrl: "",
};
const initData = async () => {
};
initData();
const searchFormData = reactive<SearchProps[]>([{label: "主键", fieldName: "idDynamicFormDetails", type: "long"},
  {label: "主键", fieldName: "idDynamicForm", type: "long"},
  {label: "表单内容", fieldName: "content", type: "input"},
  {label: "表单属性", fieldName: "fieldNames", type: "input"},
]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键", fieldName: "idDynamicFormDetails", type: "long",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "主键", fieldName: "idDynamicForm", type: "long",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "表单内容", fieldName: "content", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "表单属性", fieldName: "fieldNames", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: true, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: true, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: true, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: true, fieldName: "updatedDate", type: "date",
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
const primaryKey = "idDynamicFormDetails";
const dynamicFormDetailsRef = ref();
const rules = {

};
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
  dialogPwdVisible: false
});
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="dynamicFormDetailsRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>dynamicFormDetailsRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>dynamicFormDetailsRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="dynamicFormDetailsRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
