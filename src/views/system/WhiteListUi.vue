<script setup lang="ts" name="WhiteList">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {dictData} from "@/api/sh_api";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/whiteList/pageList",
  mergeUrl: "/system-config/system/whiteList/merge",
  mergeDraftUrl: "/system-config/system/whiteList/mergeDraft",
  batchMergeUrl: "/system-config/system/whiteList/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/whiteList/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/whiteList/getById",
  deleteUrl: "/system-config/system/whiteList/batchDeleteById",
  exportAllUrl: "/system-config/system/whiteList/exportData",
  downloadTemplateUrl: "/system-config/system/whiteList/downloadTemplate",
  userConditionUrl: "/system-config/system/whiteList/getAllByCondition",
  importUrl: "/system-config/system/whiteList/importData",
  condition: []
};
let typeList = ref({});
const initData = async () => {
  let reDictData = await dictData("white_name_filter_type");
  typeList.value = reDictData;
};
initData();
const searchFormData = reactive<SearchProps[]>([
  {label: "过滤类型", fieldName: "whiteType", defaultShow: true, type: "select", optionList: typeList},
  {label: "过滤内容", fieldName: "whiteName", defaultShow: true, type: "input", matchType: "lk"},
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idWhiteList", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "过滤类型", fieldName: "whiteType", type: "select", optionList: typeList,
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "过滤内容", fieldName: "whiteName", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: 1, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },

    {
      label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },
    {
      label: "修改人", disabled: 1, fieldName: "updatedBy", type: "input",
      required: false, formShow: false,
      tableShow: true, minWidth: 180
    },
    {
      label: "修改日期", disabled: 1, fieldName: "updatedDate", type: "date",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
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
    {
      label: "备注", fieldName: "remark", type: "textarea",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
  ],
  batchFieldList: []
});
const primaryKey = "idWhiteList";
const whiteListRef = ref();
const rules = {

};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
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
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="whiteListRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>whiteListRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>whiteListRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="whiteListRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
