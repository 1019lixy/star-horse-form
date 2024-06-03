<script setup lang="ts" name="Areainfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/areainfo/pageList",
  mergeUrl: "/system-config/system/areainfo/merge",
  mergeDraftUrl: "/system-config/system/areainfo/mergeDraft",
  batchMergeUrl: "/system-config/system/areainfo/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/areainfo/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/areainfo/getById",
  deleteUrl: "/system-config/system/areainfo/batchDeleteById",
  exportAllUrl: "/system-config/system/areainfo/exportData",
  downloadTemplateUrl: "/system-config/system/areainfo/downloadTemplate",
  userConditionUrl: "/system-config/system/areainfo/getAllByCondition",
  importUrl: "/system-config/system/areainfo/importData",
  uploadUrl: "",
  condition: []
};
const initData = async () => {
};
initData();
const searchFormData = reactive<SearchProps[]>([{label: "区域主键", fieldName: "idAreainfo", type: "long"},
  {label: "区域名称", defaultShow: true, fieldName: "areaName", type: "input"},
  {label: "区域编码", fieldName: "areaCode", type: "input"},
  {label: "父节点编号", fieldName: "parentNo", type: "input"},
]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "区域主键", fieldName: "idAreainfo", type: "long",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "区域名称", fieldName: "areaName", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "区域编码", fieldName: "areaCode", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "父节点编号", fieldName: "parentNo", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: 1, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: 1, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: 1, fieldName: "updatedDate", type: "date",
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
const primaryKey = "idAreainfo";
const areainfoRef = ref();
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

<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="areainfoRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>areainfoRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr>
      <star-horse-button-list @tableCompFunc="(fun)=>areainfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="areainfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
