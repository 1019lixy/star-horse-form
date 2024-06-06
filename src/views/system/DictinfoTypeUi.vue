<script setup lang="ts" name="DictinfoType">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {useRouter} from "vue-router";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import DictinfoUI from "@/views/system/DictinfoUI.vue";
import {SearchParams} from "@/components/types/Params";

const router = useRouter();
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/dictinfoType/pageList",
  mergeUrl: "/system-config/system/dictinfoType/merge",
  mergeDraftUrl: "/system-config/system/dictinfoType/mergeDraft",
  batchMergeUrl: "/system-config/system/dictinfoType/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/dictinfoType/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/dictinfoType/getById",
  deleteUrl: "/system-config/system/dictinfoType/batchDeleteById",
  exportAllUrl: "/system-config/system/dictinfoType/exportData",
  downloadTemplateUrl: "/system-config/system/dictinfoType/downloadTemplate",
  userConditionUrl: "/system-config/system/dictinfoType/getAllByCondition",
  importUrl: "/system-config/system/dictinfoType/importData",
  uploadUrl: "",
  condition: []
};
const initData = async () => {
};
initData();
const searchFormData = reactive<SearchProps[]>([
  {label: "字典类型名称", defaultShow: true, fieldName: "dictTypeName", type: "input"},
  {label: "字典类型编码", defaultShow: true, fieldName: "dictTypeCode", type: "input"},
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDictinfoType", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "字典类型名称", fieldName: "dictTypeName", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "字典类型编码", fieldName: "dictTypeCode", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "备注", fieldName: "remark", type: "textarea",
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
      label: "国际码", fieldName: "local", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态名称", fieldName: "statusName", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态值", fieldName: "statusCode", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
  ],
  batchFieldList: [],
  //在表格右侧添加自定义功能
  userTableFuncs: [],
});
const primaryKey = "idDictinfoType";
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
  viewVisible: false

});
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
let dictTypeCode = ref<String>("");
const dictTypeRef = ref();
//在ts中获取不到方法
const selectItemFun = (row: any) => {
  dictTypeCode.value = row["dictTypeCode"];
};
const searchData = (data: SearchParams[]) => {
  dictTypeRef.value.createCreateParams(data);
};

</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="dictTypeRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>dictTypeRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>dictTypeRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="dictTypeRef" @selectItem="selectItemFun" :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
    <dictinfo-u-i :dictType="dictTypeCode"/>
  </el-card>
</template>
