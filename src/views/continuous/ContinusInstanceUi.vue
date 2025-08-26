<script setup lang="ts" name="ContinusInstanceUi">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
} from "star-horse-lowcode";
import { Config } from "@/api/settings";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance(
  "continuous-manage",
  "continuous/continuousInstance",
);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("continuous.project.name"),
      fieldName: "projectName",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("continuous.project.type"),
      fieldName: "projectType",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("continuous.program.language"),
      fieldName: "language",
      matchType: "lk",
      defaultVisible: true,
    },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: i18n("continuous.primary.key"),
      fieldName: "idContinusInst",
      type: "long",
    },
    {
      label: i18n("continuous.instance.name"),
      fieldName: "instanceName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    [
      {
        label: i18n("continuous.template"),
        fieldName: "template",

        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.is.alone"),
        fieldName: "isAlone",
        type: "number",
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: i18n("continuous.link.data.plan"),
        fieldName: "linkDataPlan",

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.cron"),
        fieldName: "cron",
        type: "cron",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: i18n("continuous.target.dir"),
        fieldName: "targetDir",

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.auto.build"),
        fieldName: "autoBuild",

        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: i18n("continuous.remark"),
      fieldName: "remark",
      type: "textarea",
      formVisible: true,
    },
    {
      label: i18n("continuous.created.by"),
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: i18n("continuous.updated.by"),
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: i18n("continuous.created.date"),
      disabled: true,
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: i18n("continuous.updated.date"),
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: i18n("continuous.data.version"),
      fieldName: "version",
      type: "number",
    },
    {
      label: i18n("continuous.is.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("continuous.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("continuous.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("continuous.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("continuous.international.code"),
      fieldName: "local",
    },
  ],
  batchFieldList: [],
});
const primaryKey = "idContinusInst";
const environmentInfoRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const selectItemFun = (data: any) => {};
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {};
onMounted(async () => {
  await init();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="environmentInfoRef?.loadByPage()"
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
    <el-card class="inner_content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => environmentInfoRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
        <hr />
        <star-horse-button-list
          @tableCompFunc="(fun: any) => environmentInfoRef.tableCompFunc(fun)"
          :compUrl="dataUrl"
          :dialogProps="dialogProps"
          :showType="Config.buttonStyle"
        />
      </div>
      <star-horse-table-comp
        ref="environmentInfoRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        @selectItem="selectItemFun"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
