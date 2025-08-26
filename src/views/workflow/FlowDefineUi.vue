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
import { formVisibleTypeList } from "@/views/workflow/utils/FlowFormUtils";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { useRouter } from "vue-router";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SelectOption,
  UserFuncInfo,
} from "star-horse-lowcode";
import { loadSvgIcons } from "@/api/star_horse_utils.js";
import { i18n } from "@/lang";

defineOptions({
  name: "FlowDefine",
});
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowDefine");
//主键
const primaryKey = "idFlowDefine";
const flowDefineRef = ref();
const router = useRouter();
const flowDesign = useFlowDesignStore(piniaInstance);
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let flowGroupList = ref<SelectOption[]>([]);
let statusList = ref<SelectOption[]>([]);
let flowDeploymentList = ref<SelectOption[]>([
  { name: i18n("workflow.deployed"), value: "not null" },
  { name: i18n("workflow.not.deployed"), value: "null" },
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("workflow.process.name"),
      fieldName: "name",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: i18n("workflow.process.category"),
      fieldName: "flowGroup",
      type: "select",
      matchType: "lk",
      defaultVisible: true,
      preps: {
        values: flowGroupList,
      },
    },
    /* {"label": "流程类型", "fieldName": "flowType", "type": "input",matchType:"lk",defaultVisible: true},*/
    {
      label: i18n("workflow.is.deployed"),
      fieldName: "flowDeploymentId",
      type: "select",
      matchType: "is",
      defaultVisible: true,
      preps: {
        values: flowDeploymentList,
      },
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("workflow.process.name"),
      fieldName: "name",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.flow.deployment.id"),
      fieldName: "flowDeploymentId",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.process.category"),
      fieldName: "flowGroup",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.bind.form.info"),
      fieldName: "bindForm",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.flow.icon"),
      fieldName: "flowIcon",
      type: "icon",
      listPrototypeDisplay: true,
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        iconType: "user",
        values: loadSvgIcons(),
        listView: "Y",
      },
    },
    {
      label: i18n("workflow.flow.type"),
      fieldName: "flowType",

      required: false,
    },
    {
      label: i18n("workflow.status"),
      fieldName: "statusCode",
      type: "select",
      listVisible: true,
      preps: {
        values: statusList,
        listPrototypeDisplay: "text",
        tagMap: {
          "1": "success",
          "2": "default",
        },
      },
    },
    {
      label: i18n("workflow.flow.version"),
      fieldName: "flowVersion",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.form.visible.type"),
      fieldName: "formVisibleType",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.flow.manager"),
      fieldName: "flowManager",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("workflow.flow.xml.file"),
      fieldName: "xmlFile",

      required: true,
      formVisible: true,
    },
    {
      label: i18n("workflow.flow.json.file"),
      fieldName: "jsonFile",

      required: true,
      formVisible: true,
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
    { label: i18n("workflow.data.number"), fieldName: "dataNo", preps: {}, commonFlag: "Y" },
    {
      label: i18n("workflow.status.name"),
      fieldName: "statusName",

      preps: {},
      commonFlag: "Y",
    },
    { label: i18n("workflow.international.code"), fieldName: "local", preps: {}, commonFlag: "Y" },
    {
      label: i18n("workflow.remark"),
      fieldName: "remark",
      type: "textarea",
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
//校验
const rules = {};
//扩展按钮
const extendBtns = ref<UserFuncInfo[]>([
  {
    icon: "edit",
    btnName: i18n("workflow.edit"),
    priority: 1,
    authority: "edit",
    funcName: (row: any) => {
      router.push({ path: "/flowDesign", query: { data: row[primaryKey] } });
    },
  },
  {
    icon: "data-view",
    btnName: i18n("workflow.view"),
    priority: 2,
    authority: "view",
    funcName: (row: any) => {
      router.push({
        path: "/flowDesign",
        query: { data: row[primaryKey], isView: "Y" },
      });
    },
  },
  {
    icon: "add",
    btnName: i18n("workflow.add"),
    authority: "add",
    position:"toolbar",
    funcName: () => {
      flowDesign.init();
      router.push({ path: "/flowDesign" });
    },
  },
]);