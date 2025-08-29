<script setup lang="ts" name="FormPropertyPanel">
import {
  computed,
  onActivated,
  onMounted,
  onUpdated,
  reactive,
  ref,
  watch,
} from "vue";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  getRequest,
  loadData,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SelectOption,
  useDesignFormStore,
  warning,
} from "star-horse-lowcode";
import { Config } from "@/api/settings";
import { loadDict, permissionMenus } from "@/api/star_horse_apis";
import {
  dbConfigList,
  loadElementPlusIcon,
  loadRolesInfo,
  loadSvgIcons,
  loadSystemInfo,
} from "@/api/star_horse_utils";
import { ascOrDesc, commonField, httpMethod } from "@/api/system";
import { ServiceEnums } from "@/components/enums/ServiceEnums.js";
import { getUserInfo } from "@/utils/auth.js";

const apiUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicForm");
let designForm = useDesignFormStore(piniaInstance);
let formInfo = computed(() => designForm.formInfo);
let dynamicFormItemRef = ref();
let dbList = ref<any>([]);
let systemIconList = ref<SelectOption[]>([]);
let relationDataList = ref<Array<SelectOption>>([]);
let relationTypeList = ref<Array<SelectOption>>([
  { name: "一对一", value: "11" },
  { name: "一对多", value: "1n" },
  { name: "多对一", value: "n1" },
  { name: "多对多", value: "mn" },
]);
let dataSourceData = ref<any>();
let primaryKeyPolicyList = ref<SelectOption[]>([]);
let pageStyleList = ref<SelectOption[]>([]);
let requireAsteriskPositionList = ref<SelectOption[]>([
  { name: "左", value: "left" },
  { name: "右", value: "right" },
]);
let labelPositionList = ref<SelectOption[]>([
  { name: "左", value: "left" },
  { name: "右", value: "right" },
  { name: "顶部", value: "top" },
]);
let formSizeList = ref<SelectOption[]>([
  { name: "大", value: "large" },
  { name: "中", value: "default" },
  { name: "小", value: "small" },
]);
let dataLoadConditionList = ref<SelectOption[]>([]);
let dynamicFieldList = ref<SelectOption[]>([]);
let mainTableFieldList = ref<SelectOption[]>([]);
let allTableFieldList = ref<SelectOption[]>([]);
let orderByFieldList = ref<SelectOption[]>([]);
let tableColumnsList = ref<SelectOption[]>([]);
let authorityList = ref<SelectOption[]>([]);
let eventTypeList = ref<SelectOption[]>([]);
let informationsList = ref<any>([]);
let menusInfoList = ref<any>([]);
let rolesList = ref<any>([]);
let menuFlag = ref<boolean>(false);
let conditionFlag = ref<boolean>(false);
const relationMsg = `
映射关系表示当前表与所选择的表之间的关系:
 一对一: 表示当前表和被选择表数据是一一对应关系;
 一对多: 表示当前表一条数据对应被选择表多条数据;
 多对一: 表示当前表多条数据对应被选择表1条数据;
 多对多: 表示当前表1条数据对应被选择表多条,
        反之被选择表的一条数据也对于当前表的多条数据。`;
const commonColumnsMsg = `
 配置系统公共字段:
  控制公共字段是否显示在页面对于的位置
`;
const dbPositionMsg = `
动态创建的表需要存在那个数据库，
如果为空，则在当前业务数据库创建表信息。`;
const tableListMsg = `
对于关联字段的处理，
将编码或者ID 映射为对应的名称显示。`;
const loadMenus = (val: any) => {
  if (!val) {
    return;
  }
  permissionMenus({}, val).then((res: any) => {
    menusInfoList.value = res.data.data;
  });
  loadRolesInfo([]).then((res: any) => {
    rolesList.value = res;
  });
};
let urlFieldVisible = ref<boolean>(false);
let httpMethodVisible = ref<boolean>(false);
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: "表单名称",
        fieldName: "formName",
        required: true,
        formVisible: true,
      },
      {
        label: "数据源",
        fieldName: "datasourceConfigId",
        helpMsg: dbPositionMsg,
        type: "select",
        actions: {
          change: (val: any) => {
            if (val["datasourceConfigId"]) {
              loadSameDataSourceTables(val);
            }
          },
        },
        required: true,
        formVisible: true,
        preps: {
          values: dbList,
        },
      },
    ],
    {
      fieldName: "tab1",
      actions: {
        tabChange: (val: any) => {
          if (val == "tab2" && !relationDataList.value?.length) {
            warning("请选择数据源");
          }
        },
      },
      tabList: [
        {
          title: "基础属性",
          tabName: "tab1",
          fieldList: [
            [
              {
                label: "表名",
                fieldName: "tbName",
                required: true,
                formVisible: true,
                preps: {
                  editDisabled: true,
                  colspan: 11,
                },
              },
              {
                label: "归属应用",
                fieldName: "sysId",
                type: "tselect",
                actions: {
                  change: (val: any) => {
                    loadMenus(val["sysId"]);
                  },
                },
                formVisible: true,
                required: true,
                preps: {
                  checkStrictly: true,
                  colspan: 8,
                  data: informationsList,
                },
              },
              {
                label: "创建表",
                fieldName: "createTable",
                type: "switch",
                defaultValue: "N",
                formVisible: true,
                preps: {
                  colspan: 5,
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
            ],
            [
              {
                label: "主键",
                fieldName: "formId",
                required: true,
                formVisible: true,
                preps: {
                  editDisabled: true,
                  colspan: 11,
                },
              },
              {
                label: "主键策略",
                fieldName: "primaryKeyPolicy",
                type: "select",
                formVisible: true,
                preps: {
                  editDisabled: true,
                  values: primaryKeyPolicyList,
                  colspan: 8,
                },
              },
              {
                label: "表单图标",
                fieldName: "formIcon",
                type: "icon",
                defaultValue: "document",
                formVisible: true,
                preps: {
                  colspan: 5,
                  iconType: "user",
                  values: loadSvgIcons(),
                },
              },
            ],
            [
              {
                label: "是否创建菜单",
                fieldName: "createMenu",
                type: "switch",
                actions: {
                  change: (val: any) => {
                    loadMenus(val["sysId"]);
                    menuFlag.value = val["createMenu"] == "Y";
                  },
                },
                defaultValue: "N",
                formVisible: true,
                preps: {
                  colspan: 12,
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
              {
                label: "授权用户组",
                fieldName: "userGroupList",
                type: "select",
                formVisible: menuFlag,
                listVisible: true,
                preps: {
                  colspan: 12,
                  multiple: true,
                  values: rolesList,
                },
              },
            ],
            [
              {
                label: "父级菜单",
                fieldName: "parentMenuId",
                type: "tselect",
                formVisible: menuFlag,
                preps: {
                  checkStrictly: true,
                  colspan: 12,
                  data: menusInfoList,
                  props: {
                    label: "menuName",
                    value: "dataNo",
                  },
                },
              },
              {
                label: "按钮权限",
                fieldName: "buttonPermissionsList",
                type: "select",
                required: false,
                formVisible: menuFlag,
                listVisible: true,
                preps: {
                  multiple: true,
                  colspan: 12,
                  urlOrDictName: "button_authority",
                  dataSource: "dict",
                },
              },
            ],
            [
              {
                label: "存为模板",
                fieldName: "templateFlag",
                type: "switch",
                defaultValue: 2,
                formVisible: true,
                preps: {
                  activeValue: 1,
                  inactiveValue: 2,
                  colspan: 8,
                },
              },
              {
                label: "级联删除",
                helpMsg: "页面字段删除时同步删除数据库对应表字段",
                fieldName: "deleteCascade",
                type: "switch",
                defaultValue: "Y",
                formVisible: true,
                preps: {
                  colspan: 8,
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
            ],

            [
              {
                label: "页面风格",
                fieldName: "pageStyle",
                type: "select",
                formVisible: true,
                actions: {
                  change: (val: any) => {
                    conditionFlag.value = val["pageStyle"] == "form";
                  },
                },
                preps: {
                  colspan: 8,
                  values: pageStyleList,
                },
              },
              {
                label: "数据加载条件",
                fieldName: "dataLoadField",
                type: "select",
                formVisible: conditionFlag,
                preps: {
                  colspan: 8,
                  values: dataLoadConditionList,
                },
              },
            ],
          ],
        },
        {
          title: "映射关系配置",
          tabName: "tab2",
          helpMsg: relationMsg,
          batchFieldList: [
            {
              batchName: "relations",
              initRows: 0,
              fieldList: [
                {
                  label: "关联表",
                  fieldName: "tableId",
                  type: "select",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: relationDataList,
                  },
                },
                {
                  label: "映射关系",
                  fieldName: "relationType",
                  type: "select",
                  defaultValue: "1n",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: relationTypeList,
                  },
                },
              ],
            },
          ],
        },
        {
          title: "脚本绑定",
          tabName: "tab3",
          fieldList: [],
        },
        {
          title: "其它属性",
          tabName: "tab4",
          fieldList: [
            [
              {
                label: "标签位置",
                fieldName: "labelPosition",
                defaultValue: "left",
                type: "select",
                formVisible: true,
                preps: {
                  values: labelPositionList,
                },
              },
              {
                label: "标签长度",
                fieldName: "labelWidth",
                helpMsg: "如：50px",
                formVisible: true,
              },
              {
                label: "表单验证规则名称",
                fieldName: "rules",
                defaultValue: "rules",

                formVisible: true,
              },
            ],
            [
              {
                label: "表单风格",
                fieldName: "size",
                defaultValue: Config.compSize,
                type: "select",
                formVisible: true,
                preps: {
                  values: formSizeList,
                },
              },
              {
                label: "表单域标签的后缀",
                fieldName: "labelSuffix",
                formVisible: true,
              },
              {
                label: "禁用所有组件",
                fieldName: "disabled",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
            ],
            [
              {
                label: "隐藏必填字段的红色星号",
                fieldName: "hideRequiredAsterisk",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
              {
                label: "校验失败时，滚动到第一个错误表单项",
                fieldName: "scrollToError",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
              {
                label: "星号的位置",
                fieldName: "requireAsteriskPosition",
                defaultValue: "right",
                type: "radio",
                formVisible: true,
                preps: {
                  values: requireAsteriskPositionList,
                },
              },
            ],
            [
              {
                label: "是否在输入框中显示校验结果反馈图标",
                fieldName: "statusIcon",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
              {
                label: "是否显示校验错误信息",
                fieldName: "showMessage",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
              {
                label: "是否以行内形式展示校验信息",
                fieldName: "inlineMessage",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
            ],
            [
              {
                label: "是否在 rules 属性改变后立即触发一次验证",
                fieldName: "validateOnRuleChange",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
              {
                label: "行内表单模式",
                fieldName: "inline",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
            ],
          ],
        },
        {
          title: "公共属性",
          tabName: "tab5",
          helpMsg: commonColumnsMsg,
          fieldList: [
            [
              {
                label: "需要公共字段",
                fieldName: "needCommonFields",
                type: "switch",
                defaultValue: "Y",
                formVisible: true,
                actions: {
                  change: (val: any) => {
                    if (val["needCommonFields"] == "Y") {
                      orderByFieldList.value = allTableFieldList.value;
                    } else {
                      orderByFieldList.value = mainTableFieldList.value;
                    }
                  },
                },
                preps: {
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
              {
                label: "状态字典",
                helpMsg: "系统字段中配置的类型编码",
                fieldName: "statusDictName",

                defaultValue: "common",
                formVisible: true,
              },
            ],
            {
              batchFieldList: [
                {
                  objectName: "commonFieldControllers",
                  batchName: "commonFieldControllers",
                  initRows: 0,
                  subFormFlag: "Y",
                  fieldList: [
                    {
                      label: "字段信息",
                      fieldName: "fieldName",
                      type: "select",
                      required: true,
                      formVisible: true,
                      preps: {
                        values: commonField(),
                        props: {
                          label: "label",
                          value: "fieldName",
                        },
                      },
                    },
                    {
                      label: "查询显示",
                      fieldName: "searchVisible",
                      type: "switch",
                      defaultValue: false,
                      formVisible: true,
                    },
                    {
                      label: "表单显示",
                      fieldName: "formVisible",
                      type: "switch",
                      defaultValue: false,
                      formVisible: true,
                    },
                    {
                      label: "列表显示",
                      fieldName: "listVisible",
                      type: "switch",
                      defaultValue: true,
                      formVisible: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          tabName: "tab6",
          title: "列表显示配置",
          helpMsg: tableListMsg,
          batchFieldList: [
            {
              objectName: "fieldMappingList",
              batchName: "fieldMappingList",
              subFormFlag: "Y",
              initRows: 0,
              fieldList: [
                {
                  label: "字段信息",
                  fieldName: "fieldName",
                  type: "select",
                  formVisible: true,
                  required: true,
                  preps: {
                    values: dynamicFieldList,
                  },
                },
                {
                  label: "映射表",
                  fieldName: "mappingTable",
                  type: "select",
                  formVisible: true,
                  required: true,
                  preps: {
                    values: dataSourceData,
                    props: {
                      label: "formName",
                      value: "tbName",
                    },
                  },
                  actions: {
                    change: (val: any) => {
                      loadTableColumns(val["mappingTable"]);
                    },
                  },
                },
                {
                  label: "关联字段",
                  fieldName: "mappingField",
                  type: "select",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: tableColumnsList,
                  },
                },
                {
                  label: "显示字段",
                  fieldName: "mappingDisplayField",
                  type: "select",
                  required: true,

                  formVisible: true,
                  preps: {
                    values: tableColumnsList,
                  },
                },
                {
                  label: "显示别名",
                  fieldName: "displayAliasField",

                  helpMsg:
                    "关联字段与主表字段冲突时配置,\n必须以字母开头不能有特殊符号",
                  formVisible: true,
                  rules: [
                    {
                      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                      message: "必须以字母开头不能有特殊符号",
                      trigger: "blur",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          tabName: "tab7",
          title: "列表自定义事件",
          batchFieldList: [
            {
              objectName: "listActions",
              batchName: "listActions",
              subFormFlag: "Y",
              staticData: "Y",
              initRows: 0,
              fieldList: [
                [
                  {
                    label: "事件名称",
                    fieldName: "eventName",
                    formVisible: true,
                    required: true,
                  },
                  {
                    label: "图标",
                    fieldName: "icon",
                    type: "icon",
                    formVisible: true,
                    required: true,
                    preps: {
                      iconType: "user",
                      values: loadSvgIcons(),
                    },
                  },
                ],
                [
                  {
                    label: "操作权限",
                    fieldName: "authority",
                    type: "select",
                    required: true,
                    formVisible: true,
                    preps: {
                      values: authorityList,
                    },
                  },
                  {
                    label: "事件类别",
                    fieldName: "eventType",
                    type: "select",
                    required: true,
                    formVisible: true,
                    actions: {
                      change: (val: any) => {
                        urlFieldVisible.value =
                          val["eventType"] && val["eventType"] != "dialog";
                        httpMethodVisible.value =
                          val["eventType"] && val["eventType"] == "interface";
                      },
                    },
                    preps: {
                      values: eventTypeList,
                    },
                  },
                ],
                [
                  {
                    label: "请求地址",
                    fieldName: "content",
                    helpMsg:
                      "请求接口：填写接口地址， 例如：/userdb-manage/xx/xx/xx;\n页面跳转：填写前端路由，例如：/test/UserInfo;\n弹窗：填写弹窗组件名称，例如：UserInfo。",
                    required: true,
                    formVisible: true,
                    preps: {
                      colspan: 18,
                    },
                  },
                  {
                    label: "请求方式",
                    fieldName: "httpMethod",
                    defaultValue: "POST",
                    type: "select",

                    formVisible: httpMethodVisible,
                    preps: {
                      values: httpMethod(),
                      colspan: 5,
                    },
                  },
                ],
                {
                  label: "参数",
                  fieldName: "parameters",
                  type: "json",
                  formVisible: urlFieldVisible,
                },
              ],
            },
          ],
        },
        {
          tabName: "tab8",
          title: "列表排序字段",
          batchFieldList: [
            {
              objectName: "orderBy",
              batchName: "orderBy",
              subFormFlag: "Y",
              initRows: 0,
              fieldList: [
                {
                  label: "排序字段",
                  fieldName: "fieldName",
                  type: "select",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: orderByFieldList,
                  },
                },
                {
                  label: "排序方式",
                  fieldName: "ascOrDesc",
                  type: "select",

                  formVisible: true,
                  preps: {
                    values: ascOrDesc(),
                  },
                },
                {
                  label: "优先级",
                  fieldName: "priority",
                  type: "number",
                  defaultValue: 1,
                  formVisible: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
const initDbList = async () => {
  dbList.value = await dbConfigList();
};
const initData = async () => {
  let params = [{ propertyName: "statusCode", value: "1" }];
  informationsList.value = await loadSystemInfo(
    params,
    `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
  );
  systemIconList.value = loadElementPlusIcon();
  loadDict("page_style").then((res: any) => {
    pageStyleList.value = res;
  });
  loadDict("button_authority").then((res: any) => {
    authorityList.value = res;
  });
  loadDict("event_type").then((res: any) => {
    eventTypeList.value = res;
  });
  loadDict("DATA_LOAD_CONDITION").then((res: any) => {
    dataLoadConditionList.value = res;
  });
  loadDict("PRIMARY_KEY_POLICY").then((res: any) => {
    primaryKeyPolicyList.value = res;
  });
};
const analysisDynamicFields = async (formInfo: any) => {
  let reData = await loadData(
    apiUrl.basePrefix + "/analysisDynamicDatasourceFields",
    formInfo,
  );
  if (reData.error) {
    // warning(reData.error);
    return;
  }
  dynamicFieldList.value = reData.data;
};
const analysisMainFields = async () => {
  let reData = await loadData(apiUrl.basePrefix + "/analysisMainTableFields", {
    details: {
      content: JSON.stringify(designForm.compList),
    },
  });
  if (reData.error) {
    return;
  }
  mainTableFieldList.value = reData.data;
  orderByFieldList.value = reData.data;
  allTableFieldList.value = [
    ...mainTableFieldList.value,
    ...commonField().map((item: any) => {
      return { name: item.label, value: item.fieldName };
    }),
  ];
  if (formInfo.value?.needCommonFields == "Y") {
    orderByFieldList.value = allTableFieldList.value;
  }
};
let currentDataSourceId = ref<string>("");
//获取同数据源下的表,用来配置对应的关系
const loadSameDataSourceTables = (formInfo: any) => {
  let params: any = [];
  formInfo["relations"] = [];
  currentDataSourceId.value = formInfo["datasourceConfigId"];
  params.push(
    createCondition(
      "datasourceConfigId",
      formInfo["datasourceConfigId"] || null,
      formInfo["datasourceConfigId"] ? "eq" : "is",
    ),
  );
  postRequest(apiUrl.listConditionUrl!, {
    fieldList: params,
  }).then((res: any) => {
    relationDataList.value = [];
    if (res.data.code != 0) {
      return;
    }
    dataSourceData.value = res.data.data;
    dataSourceData.value.forEach((item: any) => {
      relationDataList.value.push({
        name: item.formName,
        value: item.formId,
      });
    });
  });
};

//赋值
const relationChange = (row: any) => {
  let tableId = row.tableId;
  let fdata = dataSourceData.value.find((item: any) => item.formId == tableId);
  row["formName"] = fdata?.formName;
  row["tbName"] = fdata?.tbName;
};
const loadTableColumns = (tbName: any) => {
  if (!tbName) {
    return;
  }
  tableColumnsList.value = [];
  getRequest(
    `/userdb-manage/dbsearch/dbinfo/tableColumns/${currentDataSourceId.value}/${tbName}`,
  ).then((res: any) => {
    if (res.data.code != 0) {
      return;
    }
    let resData = res.data.data;
    resData.forEach((item: any) => {
      tableColumnsList.value.push({
        name: item.comment,
        value: item.fieldName,
      });
    });
  });
};
/**
 * 表单更新的时候，更新表单的属性
 */
const updateCompInfo = () => {};
const getFormData = () => {
  return dynamicFormItemRef.value.getFormData();
};
onMounted(() => {
  initData();
  initDbList();
  loadMenus(formInfo.value["sysId"]);
  analysisMainFields();
});
onActivated(() => {
  console.info("onActivated");
});

watch(
  () => formInfo.value,
  () => {
    updateCompInfo();
  },
  {
    immediate: true,
    deep: true,
  },
);
defineExpose({
  loadMenus,
  getFormData,
  analysisDynamicFields,
});
</script>
<style lang="scss" scoped>
.dynamic-form {
  width: 100%;
}
</style>
<template>
  <star-horse-form
    label-position="right"
    :outerFormData="formInfo"
    :fieldList="tableFieldList"
    ref="dynamicFormItemRef"
  />
</template>
