<script setup lang="ts" name="NodeProperties">
import { onMounted, provide, reactive, ref } from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
} from "star-horse-lowcode";
import { Config } from "@antv/x6";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance(
  "continuous-manage",
  "continuous/nodeProperties",
);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("continuous.node"),
      fieldName: "idNodeProperty",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("continuous.report.type"),
      fieldName: "projectType",
      type: "reportType",
      matchType: "lk",
      defaultVisible: true,
    },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: i18n("continuous.primary.key"),
      fieldName: "idNodeProperty",
    },
    {
      label: i18n("continuous.instance.id"),
      fieldName: "idContinusInst",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    [
      {
        label: i18n("continuous.node.name"),
        fieldName: "nodeName",
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.column.index"),
        fieldName: "columnIndex",
        type: "number",
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: i18n("continuous.execution.type"),
        fieldName: "executionType",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.program.language"),
        fieldName: "language",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: i18n("continuous.project.code"),
        fieldName: "charset",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.source.code.dir"),
        fieldName: "codeDir",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],

    [
      {
        label: i18n("continuous.failure.notification"),
        fieldName: "failurReport",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.success.notification"),
        fieldName: "successReport",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: i18n("continuous.custom.rules"),
        fieldName: "selfRules",

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("continuous.row.index"),
        fieldName: "rowIndex",
        type: "number",
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