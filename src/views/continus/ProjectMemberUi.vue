<script setup lang="ts" name="ProjectMember">

import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref, watch} from "vue";
import {SearchProps} from "@/components/types/SearchProps.d.ts";
import {SearchParams} from "@/components/types/Params.d.ts";

const props = defineProps({
  projectId: {type: Number}
});
const dataUrl: ApiUrls = {
  loadByPageUrl: "/devops-continus/continus/projectMember/pageList",
  mergeUrl: "/devops-continus/continus/projectMember/merge",
  mergeDraftUrl: "/devops-continus/continus/projectMember/mergeDraft",
  batchMergeUrl: "/devops-continus/continus/projectMember/mergeBatch",
  batchMergeDraftUrl: "/devops-continus/continus/projectMember/mergeBatchDraft",
  loadByIdUrl: "/devops-continus/continus/projectMember/getById",
  deleteUrl: "/devops-continus/continus/projectMember/batchDeleteById",
  exportAllUrl: "/devops-continus/continus/projectMember/exportData",
  downloadTemplateUrl: "/devops-continus/continus/projectMember/downloadTemplate",
  userConditionUrl: "/devops-continus/continus/projectMember/getAllByCondition",
  importUrl: "/devops-continus/continus/projectMember/importData",
  uploadUrl: ""
};
const searchFormData = reactive<SearchProps[]>([]);
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键", fieldName: "idprojectMember", type: "long",


    },
    {
      label: "归属项目", fieldName: "projectId", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "用户名", fieldName: "username", type: "input",
      formShow: !false,
      tableShow: !false
    },

    {
      label: "姓名", fieldName: "name", type: "input",
      formShow: !false,
      tableShow: !false
    },

    {
      label: "角色名称", fieldName: "roleName", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "生效时间", fieldName: "effectiveDate", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "失效日期", fieldName: "expirationDate", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否管理员 1是 2否", fieldName: "isManager", type: "input",
      formShow: !false,
      tableShow: !false
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

  stopAutoLoad: true,
});
const primaryKey = "idDbinfo";
const projectMemberRef = ref();
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
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: Object): any => {

  return cellValue;
}
const init = async () => {

};
let filterCondition = ref<SearchParams[]>([]);
const filterFun = () => {
  filterCondition.value = [];
  filterCondition.value.push({
    propertyName: "idProjectInfo",
    value: props.projectId
  });
  projectMemberRef.value.setCondition(filterCondition.value, []);
};
watch(() => props.mainId,
    () => {
      if (projectMemberRef.value && props.projectId) {
        filterFun();
      }
    }, {deep: true, immediate: true});
onMounted(async () => {
  await init();
})
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="projectMemberRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <!--    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
          <star-horse-search-comp   @searchData="(data:any)=>projectMemberRef.createCreateParams(data)" :formData="searchFormData"
                                  :compUrl="dataUrl"/>
          <hr/>
          <star-horse-button-list @tableCompFunc="(fun:any)=>projectMemberRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                  :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
        </div>-->
    <star-horse-table-comp ref="projectMemberRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
