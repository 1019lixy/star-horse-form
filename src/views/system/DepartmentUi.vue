<script setup lang="ts">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {loadDepartmentInfo} from "@/api/sh_api";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/departmentEntity/pageList",
  mergeUrl: "/system-config/system/departmentEntity/merge",
  mergeDraftUrl: "/system-config/system/departmentEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/departmentEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/departmentEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/departmentEntity/getById",
  deleteUrl: "/system-config/system/departmentEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/departmentEntity/exportData",
  downloadTemplateUrl: "/system-config/system/departmentEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/departmentEntity/getAllByCondition",
  importUrl: "/system-config/system/departmentEntity/importData",
  uploadUrl: "",
  condition: []
};
let departmentList = ref<SelectOption[]>([]);
const initData = async () => {
  departmentList.value = await loadDepartmentInfo([{propertyName: "isDel", value: 0}])
};
initData();
const searchFormData = reactive<SearchProps[]>([
  {label: "部门名称", defaultShow: true, fieldName: "deptName", type: "input", matchType: "lk"},
  {label: "部门编码", fieldName: "deptCode", type: "input", matchType: "lk"},
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDepartment", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "上级部门", fieldName: "parentDeptList", type: "cascade", optionList: departmentList,
      required: false, formShow: !false,
      tableShow: false, minWidth: 180
    },
    {
      label: "部门名称", fieldName: "deptName", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },

    {
      label: "部门编码", fieldName: "deptCode", type: "input",
      required: true, formShow: false, disabled: 1,
      tableShow: !false, minWidth: 180
    },
    {
      label: "部门电话", fieldName: "deptPhone", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },

    {
      label: "部门描述", fieldName: "deptDesc", type: "textarea",
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
  batchFieldList: [],
  userTableFuncs: [],
});
const primaryKey = "idDepartment";
const departmentRef = ref();
const rules = {
  idDepartment: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  deptName: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  deptCode: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  deptDesc: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  deptPhone: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  parentDept: [{required: true, message: "必填项不能为空", trigger: "blur"}],
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
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="departmentRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>departmentRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>departmentRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="departmentRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
