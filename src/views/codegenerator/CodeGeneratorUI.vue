<script setup lang="ts" name="EnvInfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps.d.ts";
import {Config} from "@/api/settings.js";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/code-generator-dev/generator/code/pageList",
  mergeUrl: "/code-generator-dev/generator/code/merge",
  mergeDraftUrl: "/code-generator-dev/generator/code/mergeDraft",
  batchMergeUrl: "/code-generator-dev/generator/code/mergeBatch",
  batchMergeDraftUrl: "/code-generator-dev/generator/code/mergeBatchDraft",
  loadByIdUrl: "/code-generator-dev/generator/code/getById",
  deleteUrl: "/code-generator-dev/generator/code/batchDeleteById",
  exportAllUrl: "/code-generator-dev/generator/code/exportData",
  downloadTemplateUrl: "/code-generator-dev/generator/code/downloadTemplate",
  userConditionUrl: "/code-generator-dev/generator/code/getAllByCondition",
  importUrl: "/code-generator-dev/generator/code/importData",
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
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "数据库信息", fieldName: "datasourceConfigId", type: "select",
      required: true, formShow: true,
      tableShow: !true, minWidth: 180
    },
    [{
      label: "需要生成的表名", fieldName: "tables", type: "select",
      multiple: true,
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "需要排除的表", fieldName: "excludes",
        type: "select",
        multiple: true,
        required: false, formShow: !false,
        tableShow: !false, minWidth: 180
      }, {
      label: "表前缀", fieldName: "prefixes", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }],
    [{
      label: "开发人员", fieldName: "author", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "邮箱地址", fieldName: "email", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否需要版权", fieldName: "needCopyright", type: "switch",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    }],

    [{
      label: "项目名称", fieldName: "projectName", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "应用名称", fieldName: "applicationName", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "应用端口", fieldName: "port", type: "number",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    }],
    {
      label: "包名", fieldName: "categoryName", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否生成前端页面", fieldName: "needUi", type: "switch",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "Ui 文件后缀", fieldName: "uiSuffix", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "UI 类型,可用值:VUE_3,VUE_3_TS,REACT,REACT_TS", fieldName: "uiType", type: "select",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },

    {
      label: "前端代码目录（为空则和后端代码放一起）", fieldName: "uiFilePath", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "后端代码存放目录", fieldName: "sourcePath", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },


    {
      label: "是否分离DTO", fieldName: "needSplitDto", type: "switch",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否以旧版本构建", fieldName: "buildWithOldVersion", type: "switch",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "模版版本", fieldName: "templateVersion", type: "select",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    }, {
      label: "发布目录", fieldName: "targetDir", type: "input",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    }, {
      label: "RestFul风格接口", fieldName: "restFul", type: "switch",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "包构建类型", fieldName: "war", type: "select",
      required: false, formShow: true,
      tableShow: !true, minWidth: 180
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
const primaryKey = "idEnvInfo";
const codeGeneratorRef = ref();
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
    <star-horse-form @refresh="codeGeneratorRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>codeGeneratorRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>codeGeneratorRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="codeGeneratorRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat" @selectItem="selectItemFun"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
