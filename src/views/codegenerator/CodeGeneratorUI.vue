<script setup lang="ts" name="EnvInfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps.d.ts";
import {Config} from "@/api/settings.js";
import {PageFieldInfo} from "@/components/types/PageFieldInfo.d.ts";
import {initDbList, tableList} from "@/views/dbsearch/utils/DbSearchUtils.ts";
import {closeLoad, dictData, getMenuId, load, loadPagePermission} from "@/api/sh_api.ts";
import {download} from "@/api/star_horse.ts";
import {warning} from "@/utils/message.ts";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/code-generator/generator/code/pageList",
  mergeUrl: "/code-generator/generator/code/merge",
  mergeDraftUrl: "/code-generator/generator/code/mergeDraft",
  batchMergeUrl: "/code-generator/generator/code/mergeBatch",
  batchMergeDraftUrl: "/code-generator/generator/code/mergeBatchDraft",
  loadByIdUrl: "/code-generator/generator/code/getById",
  deleteUrl: "/code-generator/generator/code/batchDeleteById",
  exportAllUrl: "/code-generator/generator/code/exportData",
  downloadTemplateUrl: "/code-generator/generator/code/downloadTemplate",
  userConditionUrl: "/code-generator/generator/code/getAllByCondition",
  importUrl: "/code-generator/generator/code/importData",
  uploadUrl: ""
};
const searchFormData = reactive<SearchProps[]>([
  {label: "应用名称", fieldName: "projectName", type: "input", matchType: "lk", defaultShow: true},
  {label: "项目名称", fieldName: "applicationName", type: "input", matchType: "lk", defaultShow: true},
]);
let dbInfoList = ref<Array<SelectOption>>([]);
let tableInfoList = ref<Array<SelectOption>>([]);
let templateVersionList = ref<Array<SelectOption>>([]);
let fileTypeList = ref<Array<SelectOption>>([]);
//,可用值:VUE_3,VUE_3_TS,REACT,REACT_TS
let uiTypeList = ref<Array<SelectOption>>([]);
let packagingList = ref<Array<SelectOption>>([]);
const loadTabInfo = async (val) => {
  tableInfoList.value = await tableList(val["datasourceConfigId"]);
};
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idCodeGenerator", type: "long",


    },
    [{
      label: "数据库信息", fieldName: "datasourceConfigId", type: "select",
      required: true, formShow: true,
      optionList: dbInfoList,
      actionNames: "change",
      actions: loadTabInfo,
      tableShow: true
    }, {
      label: "模版版本", fieldName: "templateVersion", type: "select",
      formShow: true,
      optionList: templateVersionList,
      tableShow: true
    },],
    {
      label: "需要生成的表名", fieldName: "tablesList", type: "select",
      multiple: "Y",
      optionList: tableInfoList,
      helpMsg: `该属性为空表示生成所有数据库表的代码,
如果表数量太多（>100），程序自动转异步执行，
有构建失败风险.`,
      formShow: !false,

    },
    {
      label: "需要排除的表", fieldName: "excludesList",
      type: "select",
      multiple: "Y",
      optionList: tableInfoList,
      formShow: !false,
      tableShow: !false
    },
    [{
      label: "去除表前缀", fieldName: "prefixesStr", type: "input",
      aliasName: "prefixes",
      formShow: !false,
      helpMsg: `如果该属性为空，所生成的文件会带上表前缀，
eg: 表：dev_userinfo ,生成的文件是DevUserinfo.java;
多个前缀请用英文分号（;）隔开。`,
      tableShow: !false
    },
      {
        label: "包名", fieldName: "packageName", type: "input",
        required: true, formShow: true,
        helpMsg: `eg: com.starhorse.test`,
        tableShow: true
      }],
    {
      label: "要生成的文件", fieldName: "fileTypesList", type: "select",
      formShow: true,
      multiple: "Y",
      optionList: fileTypeList,
      helpMsg: `为空生成所有类型文件`,
      tableShow: true
    },
    {
      fieldName: "tab2",
      tabList: [{
        title: "模块相关",
        tabName: "tab2",
        fieldList: [{
          label: "项目名称", fieldName: "projectName", type: "input",
          formShow: true,
          helpMsg: "生成代码归属项目",

        },
          {
            label: "模块名称", fieldName: "categoryName", type: "input",
            required: true, formShow: true,
            helpMsg: "Maven 项目的模块名",
            tableShow: true
          },
          {
            label: "应用名称", fieldName: "applicationName", type: "input",
            required: true, formShow: true,
            helpMsg: "在配置文件application.yml中对应spring.application.name",
            tableShow: true
          },
          {
            label: "应用端口", fieldName: "port", type: "number",
            formShow: true,
            helpMsg: "在配置文件application.yml中对应server.port",

          }, {
            label: "发布目录", fieldName: "targetDir", type: "input",
            formShow: true,
            helpMsg: "文件部署到服务器上的目录",

          }, {
            label: "RestFul风格接口", fieldName: "restFul", type: "switch",
            formShow: true,
            defaultValue: "Y",

          },
          {
            label: "包构建类型", fieldName: "war", type: "select",
            formShow: true,
            defaultValue: "jar",
            optionList: packagingList,
            helpMsg: "对应pom.xml文件中的packaging",

          },
          {
            label: "代码版本", fieldName: "version", type: "input",
            helpMsg: "对应pom.xml文件中version",
            formShow: true,

          },],

      }, {
        title: "注释相关",
        tabName: "tab1",
        fieldList: [{
          label: "开发人员", fieldName: "author", type: "input",
          formShow: true,

        },
          {
            label: "邮箱地址", fieldName: "email", type: "input",
            formShow: true,

          },
          {
            label: "是否需要版权", fieldName: "needCopyright", type: "switch",
            formShow: true,

          }],
      },
        {
          title: "UI相关",
          tabName: "tab3",
          fieldList: [
            {
              label: "是否生成UI页面", fieldName: "needUi", type: "switch",
              formShow: true,
              defaultValue: "Y",

            },
            {
              label: "是否分离UI", fieldName: "needSplitUI", type: "switch",
              formShow: true,
              helpMsg: "UI文件和业务文件是否放在同一个module里面",
              defaultValue: "N",

            },
            {
              label: "Ui 文件后缀", fieldName: "uiSuffix", type: "input",
              formShow: true,
              defaultValue: ".vue",

            },
            {
              label: "UI 类型", fieldName: "uiType", type: "select",
              formShow: true,
              optionList: uiTypeList,
              defaultValue: "VUE_3_TS",

            },
          ]
        },
        {
          title: "Dto相关",
          tabName: "tab4",
          fieldList: [
            {
              label: "是否分离DTO", fieldName: "needSplitDto", type: "switch",
              formShow: true,
              helpMsg: "DTO文件和业务文件是否放在同一个module里面",
              defaultValue: "N",

            },
          ]
        }
      ]
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
const primaryKey = "idCodeGenerator";
const codeGeneratorRef = ref();
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
let permissions = ref<any>({});
const selectItemFun = (data: any) => {

}
const dataFormat = (name: string, cellValue: Object): any => {

  return cellValue;
}
const init = async () => {
  permissions.value = await loadPagePermission(getMenuId())
  dbInfoList.value = await initDbList();
  fileTypeList.value = await dictData("program_file_type");
  templateVersionList.value = await dictData("template_version");
  uiTypeList.value = await dictData("ui_type");
  packagingList.value = await dictData("packaging_type");

};

onMounted(async () => {
  await init();
});
const generateFormRef = ref();
const generateMerge = () => {
  generateFormRef.value.$refs.starHorseFormRef.validate(res => {
    if (res) {
      load("代码生成中...");
      if (dataForm.value["prefixesStr"]) {
        dataForm.value["prefixesList"] = dataForm.value["prefixesStr"].split(";");
      }
      download("/code-generator/generator/code/convertToCode", dataForm.value).catch(err => {
        warning(err);
      }).finally(() => {
        closeLoad();
      });
    }
  });

};
const closeAction = () => {
  dialogProps.editVisible = false;
  dataForm.value = {};
}
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps"
                     :selfFunc="true"
                     @merge="generateMerge" @closeAction="closeAction">
    <star-horse-form v-model:data-form="dataForm" ref="generateFormRef" @refresh="codeGeneratorRef.loadByPage()"
                     :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>codeGeneratorRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>codeGeneratorRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp :permissions="permissions" ref="codeGeneratorRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat" @selectItem="selectItemFun"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
