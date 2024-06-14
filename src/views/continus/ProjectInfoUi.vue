<script setup lang="ts" name="ProjectInfoUi">
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, reactive, ref, provide} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps.d.ts";
import {Config} from "@/api/settings.js";
import ProjectMemberUi from "@/views/continus/ProjectMemberUi.vue";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/devops-continus/continus/projectInfo/pageList",
  mergeUrl: "/devops-continus/continus/projectInfo/merge",
  mergeDraftUrl: "/devops-continus/continus/projectInfo/mergeDraft",
  batchMergeUrl: "/devops-continus/continus/projectInfo/mergeBatch",
  batchMergeDraftUrl: "/devops-continus/continus/projectInfo/mergeBatchDraft",
  loadByIdUrl: "/devops-continus/continus/projectInfo/getById",
  deleteUrl: "/devops-continus/continus/projectInfo/batchDeleteById",
  exportAllUrl: "/devops-continus/continus/projectInfo/exportData",
  downloadTemplateUrl: "/devops-continus/continus/projectInfo/downloadTemplate",
  userConditionUrl: "/devops-continus/continus/projectInfo/getAllByCondition",
  importUrl: "/devops-continus/continus/projectInfo/importData",
  uploadUrl: ""
};
let libTypeList = ref<Array<SelectOption>>([]);
const searchFormData = reactive<SearchProps[]>([
  {label: "项目名称", fieldName: "projectName", type: "input", matchType: "lk", defaultShow: true},
  {label: "项目类型", fieldName: "projectType", type: "input", matchType: "lk", defaultShow: true},
  {label: "程序语言", fieldName: "language", type: "input", matchType: "lk", defaultShow: true},
]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键", fieldName: "idProjectInfo", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    }, {
      label: "代码库类型", fieldName: "type", type: "select", optionList: libTypeList,
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    [{
      label: "代码库地址", fieldName: "host", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "代码库端口", fieldName: "port", type: "number",
        required: false, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    [{
      label: "项目名称", fieldName: "projectName", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },

      {
        label: "项目编码", fieldName: "projectCharset", type: "input",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    [{
      label: "项目类型", fieldName: "projectType", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "程序语言", fieldName: "language", type: "input",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    [{
      label: "流水线账号", fieldName: "account", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "流水线密码", fieldName: "security", type: "input",
        required: false, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    {
      label: "备注", fieldName: "remark", type: "textarea",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      batchFieldList: [{
        batchName: "memberList",
        title: "项目成员",
        fieldList: [{
          label: "用户名", fieldName: "username", type: "input",
          required: false, formShow: !false,
          tableShow: !false, minWidth: 180
        },

          {
            label: "姓名", fieldName: "name", type: "input",
            required: false, formShow: !false,
            tableShow: !false, minWidth: 180
          },

          {
            label: "角色名称", fieldName: "roleName", type: "input",
            required: false, formShow: !false,
            tableShow: !false, minWidth: 180
          },
          {
            label: "生效时间", fieldName: "effectiveDate", type: "input",
            required: false, formShow: !false,
            tableShow: !false, minWidth: 180
          },
          {
            label: "失效日期", fieldName: "expirationDate", type: "input",
            required: false, formShow: !false,
            tableShow: !false, minWidth: 180
          },
          {
            label: "是否管理员 1是 2否", fieldName: "isManager", type: "input",
            required: false, formShow: !false,
            tableShow: !false, minWidth: 180
          },]
      }]
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
const primaryKey = "idProjectInfo";
const projectInfoRef = ref();
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
let projectId = ref<Number>(-1);
const selectItemFun = (row: any) => {
  projectId.value = row[primaryKey];
};
onMounted(async () => {
  await init();
})
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="projectInfoRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>projectInfoRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>projectInfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="projectInfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat" @selectItem="selectItemFun"/>
    <project-member-ui :projectId="projectId"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
