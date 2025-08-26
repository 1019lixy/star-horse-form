<script setup lang="ts">
import {
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  PageFieldInfo,
  SearchFields,
  SelectOption,
} from "star-horse-lowcode";
import { loadSvgIcons } from "@/api/star_horse_utils.js";
import { i18n } from "@/lang";

defineOptions({
  name: "CategoryItemConfig",
});
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance(
  "flow-engine",
  "workflow/categoryItemConfig",
);
//主键
const primaryKey = "idCategoryItemConfig";
const categoryItemConfigRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let cfgCategoryList = ref<SelectOption[]>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("workflow.config.category"),
      fieldName: "cfgCategory",
      type: "select",
      matchType: "eq",
      defaultVisible: true,
      preps: {
        values: cfgCategoryList,
      },
    },
    {
      label: i18n("workflow.name"),
      fieldName: "name",

      matchType: "lk",
      defaultVisible: true,
      preps: {},
    },
    {
      label: i18n("workflow.code"),
      fieldName: "code",

      matchType: "lk",
      defaultVisible: true,
      preps: {},
    },
    {
      label: i18n("workflow.is.checked"),
      fieldName: "checkedFlag",
      type: "select",
      matchType: "eq",
      defaultVisible: true,
      preps: {
        values: [
          { name: i18n("workflow.yes"), value: "Y" },
          { name: i18n("workflow.no"), value: "N" },
        ],
      },
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("workflow.config.category"),
      fieldName: "cfgCategory",
      type: "select",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        values: cfgCategoryList,
      },
    },
    {
      label: i18n("workflow.name"),
      fieldName: "name",

      required: true,
      formVisible: true,
      listVisible: true,
      preps: {},
    },
    [
      {
        label: i18n("workflow.code"),
        fieldName: "code",

        required: false,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
      {
        label: i18n("workflow.is.checked"),
        fieldName: "checkedFlag",
        type: "switch",
        defaultValue: "N",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          activeValue: "Y",
          inactiveValue: "N",
        },
      },
    ],
    [
      {
        label: i18n("workflow.image.url"),
        fieldName: "imageUrl",
        type: "image",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          assignType: "url",
        },
      },
      {
        label: i18n("workflow.icon"),
        fieldName: "icon",
        type: "icon",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          iconType: "user",
          values: loadSvgIcons(),
        },
      },
    ],
    {
      label: i18n("workflow.description"),
      fieldName: "description",
      type: "textarea",
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {},
    },
    {
      label: i18n("workflow.created.by"),
      fieldName: "createdBy",

      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.updated.by"),
      fieldName: "updatedBy",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.created.time"),
      fieldName: "createdTime",
      type: "datetime",

      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.created.date"),
      fieldName: "createdTime",
      type: "datetime",

      listVisible: true,
      preps: {},
      commonFlag: "N",
    },
    {
      label: i18n("workflow.updated.time"),
      fieldName: "updatedTime",
      type: "datetime",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.version.number"),
      fieldName: "version",
      type: "number",

      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.is.deleted"),
      fieldName: "isDel",
      type: "number",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.data.number"),
      fieldName: "dataNo",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.status.code"),
      fieldName: "statusCode",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.status.name"),
      fieldName: "statusName",
      type: "string",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.international.code"),
      fieldName: "local",

      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("workflow.remark"),
      fieldName: "remark",

      preps: {},
      commonFlag: "Y",
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  dynamicFormas: [],
  orderBy: [],
  batchName: "batchDataList",
  tableCellEditabled: false,
  stopAutoLoad: false,
});