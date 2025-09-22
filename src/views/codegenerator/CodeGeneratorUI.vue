<script setup lang="ts" name="EnvInfo">
import { i18n } from "@/lang";
import { initDbList, tableList } from "@/views/dbsearch/utils/DbSearchUtils";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  createDatetime,
  dialogPreps,
  dictData,
  download,
  load,
  OrderByInfo,
  PageFieldInfo,
  SearchFields,
  SelectOption,
  UserFuncInfo,
  warning,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";

const dataUrl: ApiUrls = apiInstance("userdb-manage", "generator/code");

let dbInfoList = ref<Array<SelectOption>>([]);
let tableInfoList = ref<Array<SelectOption>>([]);
let templateVersionList = ref<Array<SelectOption>>([]);
let languageList = ref<Array<SelectOption>>([]);
let fileTypeList = ref<Array<SelectOption>>([]);
//,可用值:VUE_3,VUE_3_TS,REACT,REACT_TS
let uiTypeList = ref<Array<SelectOption>>([]);
let packagingList = ref<Array<SelectOption>>([]);
const loadTabInfo = async (val: any) => {
  let dataId = val["datasourceConfigId"];
  if (!dataId || dataId == "undefined") {
    return;
  }
  tableInfoList.value = await tableList(dataId);
};
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("codegen.database.info"),
      fieldName: "datasourceConfigId",
      type: "select",
      defaultVisible: true,
      preps: {
        values: dbInfoList,
      },
    },
    {
      label: i18n("codegen.project.name"),
      fieldName: "projectName",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("codegen.application.name"),
      fieldName: "applicationName",
      matchType: "lk",
      defaultVisible: true,
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("codegen.primary.key"),
      fieldName: "idCodeGenerator",
      type: "long",
    },
    [
      {
        label: i18n("codegen.database.info"),
        fieldName: "datasourceConfigId",
        type: "select",
        required: true,
        formVisible: true,
        actions: { change: loadTabInfo },
        listVisible: true,
        preps: {
          values: dbInfoList,
          stopInitCallAction: true,
        },
      },
      {
        label: i18n("codegen.backend.language"),
        fieldName: "language",
        type: "select",
        formVisible: true,
        defaultValue: "java",
        helpMsg: i18n("codegen.currently.only.support.java"),
        listVisible: true,
        preps: {
          values: languageList,
        },
      },
    ],
    [
      {
        label: i18n("codegen.backend.template.version"),
        fieldName: "backendTemplateVersion",
        type: "select",
        formVisible: true,
        defaultValue: "2_6",

        listVisible: true,
        preps: {
          values: templateVersionList,
        },
      },
      {
        label: i18n("codegen.frontend.template.version"),
        fieldName: "frontTemplateVersion",
        type: "select",
        formVisible: true,
        defaultValue: "2_6",
        listVisible: true,
        preps: {
          values: templateVersionList,
        },
      },
    ],
    {
      label: i18n("codegen.tables.to.generate"),
      fieldName: "tablesList",
      type: "select",
      helpMsg: `${i18n("codegen.this.property.empty")}`,
      formVisible: true,
      listVisible: true,
      preps: {
        multiple: true,
        values: tableInfoList,
      },
    },
    {
      label: i18n("codegen.excluded.tables"),
      fieldName: "excludesList",
      type: "select",
      formVisible: true,
      listVisible: true,
      preps: {
        multiple: true,
        values: tableInfoList,
      },
    },
    [
      {
        label: i18n("codegen.table.prefix"),
        fieldName: "prefixesStr",
        aliasName: "prefixes",
        formVisible: true,
        helpMsg: `${i18n("codegen.if.this.property.empty")}`,
        listVisible: true,
      },
      {
        label: i18n("codegen.package.name"),
        fieldName: "packageName",

        required: true,
        formVisible: true,
        helpMsg: "eg: com.starhorse.test",
        listVisible: true,
      },
    ],
    [
      {
        label: i18n("codegen.file.types"),
        fieldName: "fileTypesList",
        type: "select",
        formVisible: true,
        helpMsg: i18n("codegen.empty.generate.all.types"),
        listVisible: true,
        preps: {
          colspan: 12,
          multiple: true,
          values: fileTypeList,
        },
      },
      {
        label: i18n("codegen.group.condition"),
        fieldName: "visibleColumns",
        type: "number",
        formVisible: true,
        helpMsg: i18n("codegen.field.visible.columns"),
        listVisible: true,
        defaultValue: -1,
        preps: {
          colspan: 6,
          min: -1,
          max: 10,
        },
      },
      {
        label: i18n("codegen.group.columns"),
        fieldName: "groupColumns",
        type: "number",
        formVisible: true,
        helpMsg: i18n("codegen.form.page.group.columns"),
        listVisible: true,
        defaultValue: 2,
        preps: {
          colspan: 6,
          min: 2,
          max: 6,
        },
      },
    ],
    {
      fieldName: "tab2",
      tabList: [
        {
          title: i18n("codegen.module.related"),
          tabName: "tab2",
          fieldList: [
            {
              label: i18n("codegen.project.name"),
              fieldName: "projectName",

              formVisible: true,
              helpMsg: i18n("codegen.code.belong.project"),
            },
            {
              label: i18n("codegen.category.name"),
              fieldName: "categoryName",

              required: true,
              formVisible: true,
              helpMsg: i18n("codegen.maven.project.module.name"),
              listVisible: true,
            },
            {
              label: i18n("codegen.application.name"),
              fieldName: "applicationName",

              required: true,
              formVisible: true,
              helpMsg: i18n("codegen.config.file.application.name"),
              listVisible: true,
            },
            {
              label: i18n("codegen.application.port"),
              fieldName: "port",
              type: "number",
              formVisible: true,
              helpMsg: i18n("codegen.config.file.server.port"),
            },
            {
              label: i18n("codegen.target.directory"),
              fieldName: "targetDir",

              formVisible: true,
              helpMsg: i18n("codegen.files.deploy.server.directory"),
            },
            {
              label: i18n("codegen.restful.api"),
              fieldName: "restFul",
              type: "switch",
              formVisible: true,
              defaultValue: "Y",
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
            {
              label: i18n("codegen.packaging.type"),
              fieldName: "war",
              type: "select",
              formVisible: true,
              defaultValue: "jar",

              helpMsg: i18n("codegen.pom.xml.packaging"),
              preps: {
                values: packagingList,
              },
            },
            {
              label: i18n("codegen.code.version"),
              fieldName: "version",

              helpMsg: i18n("codegen.pom.xml.version"),
              formVisible: true,
            },
          ],
        },
        {
          title: i18n("codegen.comment.related"),
          tabName: "tab1",
          fieldList: [
            {
              label: i18n("codegen.developer"),
              fieldName: "author",

              formVisible: true,
            },
            {
              label: i18n("codegen.email"),
              fieldName: "email",

              formVisible: true,
            },
            {
              label: i18n("codegen.need.copyright"),
              fieldName: "needCopyright",
              type: "switch",
              formVisible: true,
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
          ],
        },
        {
          title: i18n("codegen.ui.related"),
          tabName: "tab3",
          fieldList: [
            {
              label: i18n("codegen.generate.ui"),
              fieldName: "needUi",
              type: "switch",
              formVisible: true,
              defaultValue: "Y",
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
            {
              label: i18n("codegen.separate.ui"),
              fieldName: "needSplitUI",
              type: "switch",
              formVisible: true,
              helpMsg: i18n("codegen.ui.files.business.files"),
              defaultValue: "N",
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
            {
              label: i18n("codegen.ui.suffix"),
              fieldName: "uiSuffix",
              formVisible: true,
              defaultValue: ".vue",
            },
            {
              label: i18n("codegen.ui.type"),
              fieldName: "uiType",
              type: "select",
              formVisible: true,
              defaultValue: "VUE_3_TS",
              preps: {
                values: uiTypeList,
              },
            },
          ],
        },
        {
          title: i18n("codegen.dto.related"),
          tabName: "tab4",
          fieldList: [
            {
              label: i18n("codegen.separate.dto"),
              fieldName: "needSplitDto",
              type: "switch",
              formVisible: true,
              helpMsg: i18n("codegen.dto.files.business.files"),
              defaultValue: "N",
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
          ],
        },
      ],
    },
    {
      label: i18n("codegen.created.by"),
      disabled: true,
      fieldName: "createdBy",

      listVisible: true,
    },
    {
      label: i18n("codegen.created.date"),
      disabled: true,
      fieldName: "createdTime",
      type: "date",
      listVisible: true,
    },
    {
      label: i18n("codegen.updated.by"),
      disabled: true,
      fieldName: "updatedBy",

      listVisible: true,
    },

    {
      label: i18n("codegen.updated.date"),
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
      listVisible: true,
    },
    {
      label: i18n("codegen.is.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("codegen.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("codegen.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("codegen.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("codegen.international.code"),
      fieldName: "local",
    },
  ],
  batchFieldList: [],
});
const primaryKey = "idCodeGenerator";
const codeGeneratorRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const orderBy = ref<OrderByInfo[]>([
  {
    fieldName: "updatedTime",
    ascOrDesc: "desc",
  },
]);

const selectItemFun = (_data: any) => {};
const dataFormat = (name: string, cellValue: any): any => {
  if (name == "datasourceConfigId") {
    return (
      dbInfoList.value.find((item: any) => item.value == cellValue)?.name ||
      cellValue
    );
  }
  if (name == "createdTime" || name == "updatedTime") {
    return createDatetime(cellValue);
  }
  return cellValue;
};
const init = async () => {
  dbInfoList.value = await initDbList();
  fileTypeList.value = await dictData("program_file_type");
  templateVersionList.value = await dictData("template_version");
  languageList.value = await dictData("program_language");
  uiTypeList.value = await dictData("ui_type");
  packagingList.value = await dictData("packaging_type");
};
onMounted(async () => {
  await init();
});
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: "重新生成代码",
    authority: "add",
    icon: "code",
    priority: 1,
    funcName: (row: any) => {
      load("代码生成中，请稍后");
      download(
        `/userdb-manage/generator/code/convertToCodeById/${row[primaryKey]}`,{}
      )
        .catch((err) => {
          warning(err);
        })
        .finally(() => {
          closeLoad();
        });
    },
  },
]);
const generateFormRef = ref();
const generateMerge = (type: string) => {
  generateFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    let dataForm: any = generateFormRef.value.getFormData()?.value;
    if (res) {
      load("代码生成中,请稍后...");
      if (dataForm["prefixesStr"]) {
        dataForm["prefixesList"] = dataForm["prefixesStr"].split(";");
      }
      let isError = false;
      download("/userdb-manage/generator/code/convertToCode", dataForm)
        .catch((err) => {
          isError = true;
          warning(err);
        })
        .finally(() => {
          closeLoad();
          if (type != "continue" && !isError) {
            closeAction();
          }
        });
    }
  });
};
const closeAction = () => {
  dialogProps.editVisible = false;
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
      :selfFunc="true"
      @merge="generateMerge"
      @closeAction="closeAction"
      boxHeight="85%"
    >
      <star-horse-form
        ref="generateFormRef"
        @refresh="codeGeneratorRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => codeGeneratorRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="codeGeneratorRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :orderBy="orderBy"
        :extendBtns="extendBtns"
        :dataFormat="dataFormat"
        @selectItem="selectItemFun"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
