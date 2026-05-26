<script setup lang="ts" name="FormPropertyPanel">
import {computed, onActivated, onMounted, reactive, ref, watch} from "vue";
import {
  analysisCompDatas,
  commonField,
  createCondition,
  httpMethod,
  loadData,
  orderBy,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SelectOption,
  useDesignFormStore,
  warning,
} from "star-horse-lowcode";
import {Config} from "@/api/settings.js";
import {loadElementPlusIcon, loadSvgIcons,} from "@/api/star_horse_form_utils.js";
import {FormConfig} from "@/components/types";
import {i18n} from "@/lang/index.js";

const props = defineProps<{
  optional: FormConfig;
}>();
let designForm = useDesignFormStore(piniaInstance);
let formInfo = computed(() => designForm.formInfo);
const model = computed(() => props.optional?.model ?? "simple");
let dynamicFormItemRef = ref();
let dbList = ref<any>([]);
let systemIconList = ref<SelectOption[]>([]);
let relationDataList = ref<SelectOption[]>([]);
let relationTypeList = ref<SelectOption[]>([
  {name: i18n("dyform.formProp.relation.11"), value: "11"},
  {name: i18n("dyform.formProp.relation.1n"), value: "1n"},
  {name: i18n("dyform.formProp.relation.n1"), value: "n1"},
  {name: i18n("dyform.formProp.relation.mn"), value: "mn"},
]);
let cloneDatasList = ref<SelectOption[]>([
  {name: i18n("dyform.formProp.modelType.form"), value: "form"},
  {name: i18n("dyform.formProp.modelType.authority"), value: "authority"},
  {name: i18n("dyform.formProp.modelType.all"), value: "all"},
]);
let dataSourceData = ref<any>();
let requireAsteriskPositionList = ref<SelectOption[]>([
  {name: i18n("dyform.formProp.align.left"), value: "left"},
  {name: i18n("dyform.formProp.align.right"), value: "right"},
]);
let labelPositionList = ref<SelectOption[]>([
  ...requireAsteriskPositionList.value,
  {name: i18n("dyform.formProp.labelPosition.top"), value: "top"},
]);
let formSizeList = ref<SelectOption[]>([
  {name: i18n("dyform.formProp.size.large"), value: "large"},
  {name: i18n("dyform.formProp.size.default"), value: "default"},
  {name: i18n("dyform.formProp.size.small"), value: "small"},
]);
let dataLoadConditionList = ref<SelectOption[]>([]);
let dynamicFieldList = ref<SelectOption[]>([]);
let mainTableFieldList = ref<SelectOption[]>([]);
let allTableFieldList = ref<SelectOption[]>([]);
let orderByFieldList = ref<SelectOption[]>([]);
let tableColumnsList = ref<SelectOption[]>([]);
let authorityList = ref<SelectOption[]>([]);
let eventTypeList = ref<SelectOption[]>([]);
let primaryKeyPolicyList = ref<SelectOption[]>([]);
let pageStyleList = ref<SelectOption[]>([]);
let informationsList = ref<any>([]);
let menusInfoList = ref<any>([]);
let rolesList = ref<any>([]);
const relationMsg = i18n("dyform.formProp.relation.helpMsg");
const commonColumnsMsg = i18n("dyform.formProp.publicFields.helpMsg");
const dbPositionMsg = i18n("dyform.formProp.dbName.helpMsg");
const tableListMsg = i18n("dyform.formProp.relationField.helpMsg");

const loadMenus = (sysId: string) => {
  if (
      props.optional?.loadMenuList &&
      typeof props.optional.loadMenuList == "function"
  ) {
    props.optional?.loadMenuList(sysId).then((res: SelectOption[]) => {
      menusInfoList.value = res;
    });
  }
};
let urlFieldVisible = ref<boolean>(false);
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: i18n("dyform.formProp.formName"),
        fieldName: "formName",
        required: true,
        formVisible: true,
      },
      {
        label: i18n("dyform.formProp.dataSource"),
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
        formVisible: ["full"].includes(model.value),
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
            warning(i18n("dyform.formProp.dataSource.warning"));
          }
        },
      },
      tabList: [
        {
          title: i18n("dyform.formProp.basicProps"),
          tabName: "tab1",
          fieldList: [
            [
              {
                label: i18n("dyform.formProp.tableName"),
                fieldName: "tbName",
                required: true,
                formVisible: true,
                preps: {
                  editDisabled: true,
                  colspan: ["simple"].includes(model.value) ? 24 : 11,
                },
              },
              {
                label: i18n("dyform.formProp.appName"),
                fieldName: "sysId",
                type: "tselect",
                actions: {
                  change: (val: any) => {
                    loadMenus(val["sysId"]);
                  },
                },
                formVisible: ["full"].includes(model.value),
                required: true,
                preps: {
                  checkStrictly: true,
                  colspan: 8,
                  data: informationsList,
                },
              },
              {
                label: i18n("dyform.formProp.createTable"),
                fieldName: "createTable",
                type: "switch",
                defaultValue: "N",
                formVisible: ["full"].includes(model.value),
                preps: {
                  colspan: 5,
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
            ],
            [
              {
                label: i18n("dyform.formProp.primaryKey"),
                fieldName: "formId",
                required: true,
                formVisible: true,
                preps: {
                  editDisabled: true,
                  colspan: ["simple"].includes(model.value) ? 24 : 11,
                },
              },
              {
                label: i18n("dyform.formProp.primaryKeyStrategy"),
                fieldName: "primaryKeyPolicy",
                type: "select",
                formVisible: ["full"].includes(model.value),
                preps: {
                  editDisabled: true,
                  values: primaryKeyPolicyList,
                  colspan: 8,
                },
              },
              {
                label: i18n("dyform.formProp.formIcon"),
                fieldName: "formIcon",
                type: "icon",
                defaultValue: "document",
                formVisible: true,
                preps: {
                  colspan: ["simple"].includes(model.value) ? 24 : 5,
                  iconType: "user",
                  values: loadSvgIcons(),
                },
              },
            ],
            [
              {
                label: i18n("dyform.formProp.createMenu"),
                fieldName: "createMenu",
                type: "switch",
                defaultValue: "N",
                formVisible: ["full"].includes(model.value),
                preps: {
                  colspan: 12,
                  dataRelation: {
                    actionName: "change",
                    relationDetails: [
                      {
                        matchType: "eq",
                        controlCondition: "eqVisible",
                        relationFields: [
                          "userGroupList",
                          "parentMenuId",
                          "buttonPermissionsList",
                        ],
                        matchFieldValue: "Y",
                      },
                    ],
                  },
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
              {
                label: i18n("dyform.formProp.authGroup"),
                fieldName: "userGroupList",
                type: "select",
                formVisible: false,
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
                label: i18n("dyform.formProp.parentMenu"),
                fieldName: "parentMenuId",
                type: "tselect",
                formVisible: false,
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
                label: i18n("dyform.formProp.buttonAuth"),
                fieldName: "buttonPermissionsList",
                type: "select",
                required: false,
                formVisible: false,
                listVisible: true,
                preps: {
                  multiple: true,
                  colspan: 12,
                  values: authorityList,
                },
              },
            ],
            [
              {
                label: i18n("dyform.formProp.saveAsTemplate"),
                fieldName: "templateFlag",
                type: "switch",
                defaultValue: 2,
                formVisible: ["full"].includes(model.value),
                preps: {
                  activeValue: 1,
                  inactiveValue: 2,
                  colspan: 6,
                },
              },
              {
                label: i18n("dyform.formProp.cascadeDelete"),
                helpMsg: i18n("dyform.formProp.cascadeDelete.helpMsg"),
                fieldName: "deleteCascade",
                type: "switch",
                defaultValue: "Y",
                formVisible: ["full"].includes(model.value),
                preps: {
                  colspan: 6,
                  activeValue: "Y",
                  inactiveValue: "N",
                },
              },
              {
                label: i18n("dyform.formProp.cloneData"),
                helpMsg: i18n("dyform.formProp.cloneData.helpMsg"),
                fieldName: "cloneData",
                type: "select",
                formVisible: ["full"].includes(model.value),
                preps: {
                  colspan: 12,
                  values: cloneDatasList
                },
              },
            ],

            [
              {
                label: i18n("dyform.formProp.pageStyle"),
                fieldName: "pageStyle",
                type: "select",
                formVisible: ["default", "full"].includes(model.value),
                preps: {
                  colspan: 8,
                  dataRelation: {
                    actionName: "change",
                    relationDetails: [
                      {
                        matchType: "eq",
                        controlCondition: "eqVisible",
                        relationFields: ["dataLoadField"],
                        matchFieldValue: "form",
                      },
                    ],
                  },
                  values: pageStyleList,
                },
              },
              {
                label: i18n("dyform.formProp.loadCondition"),
                fieldName: "dataLoadField",
                type: "select",
                formVisible: false,
                preps: {
                  colspan: 8,
                  values: dataLoadConditionList,
                },
              },
            ],
          ],
        },
        {
          title: i18n("dyform.formProp.relationConfig"),
          tabName: "tab2",
          disVisible: model.value != "full",
          helpMsg: relationMsg,
          batchFieldList: [
            {
              batchName: "relations",
              initRows: 0,
              fieldList: [
                {
                  label: i18n("dyform.formProp.relationTable"),
                  fieldName: "tableId",
                  type: "select",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: relationDataList,
                  },
                },
                {
                  label: i18n("dyform.formProp.relationType"),
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
          title: i18n("dyform.formProp.scriptBinding"),
          tabName: "tab3",
          disVisible: !["default", "full"].includes(model.value),
          fieldList: [],
        },
        {
          title: i18n("dyform.formProp.otherProps"),
          tabName: "tab4",
          disVisible: !["default", "full"].includes(model.value),
          fieldList: [
            [
              {
                label: i18n("dyform.formProp.labelPosition2"),
                fieldName: "labelPosition",
                defaultValue: "left",
                type: "select",
                formVisible: true,
                preps: {
                  values: labelPositionList,
                },
              },
              {
                label: i18n("dyform.formProp.labelWidth"),
                fieldName: "labelWidth",
                helpMsg: i18n("dyform.formProp.labelWidth.helpMsg"),
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.validRuleName"),
                fieldName: "rules",
                defaultValue: "rules",
                formVisible: true,
              },
            ],
            [
              {
                label: i18n("dyform.formProp.formStyle"),
                fieldName: "size",
                defaultValue: Config.compSize,
                type: "select",
                formVisible: true,
                preps: {
                  values: formSizeList,
                },
              },
              {
                label: i18n("dyform.formProp.labelSuffix"),
                fieldName: "labelSuffix",
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.disableAll"),
                fieldName: "disabled",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
            ],
            [
              {
                label: i18n("dyform.formProp.hideRequiredAsterisk"),
                fieldName: "hideRequiredAsterisk",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.scrollToError"),
                fieldName: "scrollToError",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.asteriskPosition"),
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
                label: i18n("dyform.formProp.showValidateIcon"),
                fieldName: "statusIcon",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.showErrorMessage"),
                fieldName: "showMessage",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.inlineMessage"),
                fieldName: "inlineMessage",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
            ],
            [
              {
                label: i18n("dyform.formProp.validateOnRuleChange"),
                fieldName: "validateOnRuleChange",
                defaultValue: false,
                type: "switch",
                formVisible: true,
              },
              {
                label: i18n("dyform.formProp.inlineForm"),
                fieldName: "inline",
                defaultValue: true,
                type: "switch",
                formVisible: true,
              },
            ],
          ],
        },
        {
          title: i18n("dyform.formProp.publicProps"),
          tabName: "tab5",
          disVisible: !["default", "full"].includes(model.value),
          helpMsg: commonColumnsMsg,
          fieldList: [
            [
              {
                label: i18n("dyform.formProp.needPublicFields"),
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
                label: i18n("dyform.formProp.statusDict"),
                helpMsg: i18n("dyform.formProp.statusDict.helpMsg"),
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
                      label: i18n("dyform.formProp.fieldInfo"),
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
                      label: i18n("dyform.formProp.searchDisplay"),
                      fieldName: "searchVisible",
                      type: "switch",
                      defaultValue: false,
                      formVisible: true,
                    },
                    {
                      label: i18n("dyform.formProp.formDisplay"),
                      fieldName: "formVisible",
                      type: "switch",
                      defaultValue: false,
                      formVisible: true,
                    },
                    {
                      label: i18n("dyform.formProp.listDisplay"),
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
          title: i18n("dyform.formProp.listConfig"),
          disVisible: !["full"].includes(model.value),
          helpMsg: tableListMsg,
          batchFieldList: [
            {
              objectName: "fieldMappingList",
              batchName: "fieldMappingList",
              subFormFlag: "Y",
              initRows: 0,
              fieldList: [
                {
                  label: i18n("dyform.formProp.fieldInfo"),
                  fieldName: "fieldName",
                  type: "select",
                  formVisible: true,
                  required: true,
                  preps: {
                    values: dynamicFieldList,
                  },
                },
                {
                  label: i18n("dyform.formProp.mappingTable"),
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
                  label: i18n("dyform.formProp.relationField2"),
                  fieldName: "mappingField",
                  type: "select",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: tableColumnsList,
                  },
                },
                {
                  label: i18n("dyform.formProp.displayField"),
                  fieldName: "mappingDisplayField",
                  type: "select",
                  required: true,

                  formVisible: true,
                  preps: {
                    values: tableColumnsList,
                  },
                },
                {
                  label: i18n("dyform.formProp.displayAlias"),
                  fieldName: "displayAliasField",

                  helpMsg:
                      i18n("dyform.formProp.displayAlias.helpMsg"),
                  formVisible: true,
                  rules: [
                    {
                      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
                      message: i18n("dyform.formProp.displayAlias.validate"),
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
          title: i18n("dyform.formProp.listCustomEvent"),
          disVisible: !["full"].includes(model.value),
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
                    label: i18n("dyform.formProp.eventName"),
                    fieldName: "eventName",
                    formVisible: true,
                    required: true,
                  },
                  {
                    label: i18n("dyform.formProp.eventIcon"),
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
                    label: i18n("dyform.formProp.operationAuth"),
                    fieldName: "authority",
                    type: "select",
                    required: true,
                    formVisible: true,
                    preps: {
                      dataSource: "dict",
                      urlOrDictName: "button_authority",
                    },
                  },
                  {
                    label: i18n("dyform.formProp.eventCategory"),
                    fieldName: "eventType",
                    type: "select",
                    required: true,
                    formVisible: true,
                    actions: {
                      change: (val: any) => {
                        urlFieldVisible.value =
                            val["eventType"] && val["eventType"] != "dialog";
                      },
                    },
                    preps: {
                      dataRelation: {
                        actionName: "change",
                        relationDetails: [
                          {
                            matchType: "eq",
                            controlCondition: "eqVisible",
                            relationFields: ["httpMethod"],
                            matchFieldValue: "interface",
                          },
                        ],
                      },
                      values: eventTypeList,
                    },
                  },
                ],
                [
                  {
                    label: i18n("dyform.formProp.requestUrl"),
                    fieldName: "content",
                    helpMsg:
                        i18n("dyform.formProp.requestUrl.helpMsg"),
                    required: true,
                    formVisible: true,
                    preps: {
                      colspan: 18,
                    },
                  },
                  {
                    label: i18n("dyform.formProp.requestMethod"),
                    fieldName: "httpMethod",
                    defaultValue: "POST",
                    type: "select",

                    formVisible: false,
                    preps: {
                      values: httpMethod(),
                      colspan: 5,
                    },
                  },
                ],
                {
                  label: i18n("dyform.formProp.params"),
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
          title: i18n("dyform.formProp.listSortField"),
          disVisible: !["default", "full"].includes(model.value),
          batchFieldList: [
            {
              objectName: "orderBy",
              batchName: "orderBy",
              subFormFlag: "Y",
              initRows: 0,
              fieldList: [
                {
                  label: i18n("dyform.formProp.sortField"),
                  fieldName: "fieldName",
                  type: "select",
                  required: true,
                  formVisible: true,
                  preps: {
                    values: orderByFieldList,
                  },
                },
                {
                  label: i18n("dyform.formProp.sortOrder"),
                  fieldName: "orderBy",
                  type: "select",

                  formVisible: true,
                  preps: {
                    values: orderBy(),
                  },
                },
                {
                  label: i18n("dyform.formProp.priority"),
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

const initData = async () => {
  if (
      props.optional?.loadAppList &&
      typeof props.optional.loadAppList == "function"
  ) {
    props.optional?.loadAppList()?.then((res: SelectOption[]) => {
      informationsList.value = res;
    });
  }
  if (
      props.optional?.loadRolesList &&
      typeof props.optional.loadRolesList == "function"
  ) {
    props.optional?.loadRolesList()?.then((res: SelectOption[]) => {
      rolesList.value = res;
    });
  }
  if (
      props.optional?.loadDicts &&
      typeof props.optional.loadDicts == "function"
  ) {
    props.optional?.loadDicts("page_style")?.then((res: SelectOption[]) => {
      pageStyleList.value = res;
    });
    props.optional
        ?.loadDicts("button_authority")
        ?.then((res: SelectOption[]) => {
          console.log(res);
          authorityList.value = res;
        });
    props.optional?.loadDicts("event_type")?.then((res: SelectOption[]) => {
      eventTypeList.value = res;
    });
    props.optional
        ?.loadDicts("DATA_LOAD_CONDITION")
        ?.then((res: SelectOption[]) => {
          dataLoadConditionList.value = res;
        });
    props.optional
        ?.loadDicts("PRIMARY_KEY_POLICY")
        ?.then((res: SelectOption[]) => {
          primaryKeyPolicyList.value = res;
        });
  }
  if (
      props.optional?.loadDbList &&
      typeof props.optional.loadDbList == "function"
  ) {
    props.optional?.loadDbList()?.then((res) => {
      dbList.value = res;
    });
  }
  systemIconList.value = loadElementPlusIcon();
};

const analysisDynamicFields = async (formInfo: any) => {
  let reData = await loadData(
      props.optional?.api?.basePrefix + "/analysisDynamicDatasourceFields",
      formInfo,
  );
  if (reData.error) {
    return;
  }
  dynamicFieldList.value = reData.data;
};
const analysisMainFields = async () => {
  let {fieldList} = analysisCompDatas(designForm.compList);
  const selectDatas: SelectOption[] = fieldList?.filter((item) => item.label)
      .map((item) => {
        return {
          name: item.label,
          value: item.fieldName,
        };
      });
  mainTableFieldList.value = selectDatas;
  orderByFieldList.value = selectDatas;
  allTableFieldList.value = [
    ...mainTableFieldList.value,
    ...commonField().map((item: any) => {
      return {name: item.label, value: item.fieldName};
    }),
  ];
  if (formInfo.value?.needCommonFields == "Y") {
    orderByFieldList.value = allTableFieldList.value;
  }
};
let currentDataSourceId = ref<string>("");
//获取同数据源下的表,用来配置对应的关系
const loadSameDataSourceTables = (formInfo: any) => {
  if (!props.optional?.api?.listConditionUrl) {
    warning(i18n("dyform.formProp.listConditionUrl.warning"));
    return;
  }
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
  postRequest(props.optional?.api?.listConditionUrl!, {
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
  props.optional
      ?.loadTableColumns(currentDataSourceId.value, tbName)
      ?.then((columns: SelectOption[]) => {
        tableColumnsList.value = columns;
      });
};

/**
 * 表单更新的时候，更新表单的属性
 */
const updateCompInfo = () => {
};
const getFormData = () => {
  return dynamicFormItemRef.value.getFormData();
};
onMounted(() => {
  initData();
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
