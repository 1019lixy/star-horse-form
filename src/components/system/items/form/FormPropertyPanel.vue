<script setup lang="ts" name="FormPropertyPanel">
import {dinfo, dlog} from "@/utils/debugLog";
import {computed, onActivated, onMounted, reactive, ref, unref, watch} from "vue";
import {
  analysisCompDatas,
  commonField,
  createCondition,
  httpMethod,
  orderBy,
  PageFieldInfo,
  postRequest,
  SelectOption,
  warning,
} from "star-horse-lowcode";
import {Config} from "@/api/settings.js";
import {loadSvgIcons} from "@/api/star_horse_form_utils.js";
import {FormConfig} from "@/components/types";
import {i18n} from "@/lang/index.js";
import {getDesignFormStore, getFlowDesignStore} from "@/store/StoreManager";
import FlowDesigner from "@/components/workflow/designer/FlowDesigner.vue";
import {designDataNames} from "@/api/form_utils";

const props = defineProps<{
  optional: FormConfig;
}>();
let designForm = getDesignFormStore();
let formInfo = computed(() => designForm.formInfo);
const compList = computed(() => designForm.compList);
const model = computed(() => props.optional?.model ?? "simple");
let dynamicFormItemRef = ref();
let dbList = ref<any>([]);
let relationDataList = ref<SelectOption[]>([]);
let relationTypeList = ref<SelectOption[]>([
  {name: i18n("dyform.formProp.relation.11"), value: "11"},
  {name: i18n("dyform.formProp.relation.1n"), value: "1n"},
  {name: i18n("dyform.formProp.relation.n1"), value: "n1"},
  {name: i18n("dyform.formProp.relation.mn"), value: "mn"},
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

let dynamicFieldList = ref<SelectOption[]>([]);
let mainTableFieldList = ref<SelectOption[]>([]);
let allTableFieldList = ref<SelectOption[]>([]);
let orderByFieldList = ref<SelectOption[]>([]);
let tableColumnsList = ref<SelectOption[]>([]);
let eventTypeList = ref<SelectOption[]>([]);
const relationMsg = i18n("dyform.formProp.relation.helpMsg");
const commonColumnsMsg = i18n("dyform.formProp.publicFields.helpMsg");
const dbPositionMsg = i18n("dyform.formProp.dbName.helpMsg");
const tableListMsg = i18n("dyform.formProp.relationField.helpMsg");

let urlFieldVisible = ref<boolean>(false);

/** 流程定义选项（表单级流程绑定 tab，外部注入或加载） */
let flowDefineOptions = ref<SelectOption[]>(props.optional?.flowDefineOptions || []);
/** 发起人字段候选（由全表字段转换） */
let starterFieldOptions = ref<SelectOption[]>([]);
watch(
    () => allTableFieldList.value,
    (list) => {
      starterFieldOptions.value = (list || []).map((f: SelectOption) => ({
        name: f.name,
        value: f.value,
      }));
    },
    {immediate: true},
);

// ==================== 流程在线设计（表单级绑定） ====================
/** 设计器对话框可见性 */
let flowDesignerVisible = ref<boolean>(false);
/** 设计器组件引用（读取节点树） */
const flowDesignerRef = ref();
/** 是否已保存过在线设计结果（控制按钮文案） */
const flowDesigned = ref<boolean>(false);

/**
 * 流程绑定字段同步兜底：StarHorseForm 的 outerFormData 是单向拷贝，
 * 字段值只写内部 dataForm；且旧版 star-horse-lowcode 的 getDynamicEvents
 * 会被 dataRelation 覆盖同名 actions 事件，actions.change 不可靠。
 * 这里深度监听内部 dataForm（getFormData 已 expose），把流程绑定字段同步回
 * formInfo，驱动面板底部"打开流程设计器"入口的显隐。
 */
const FLOW_SYNC_FIELDS = ["flowFlag", "flowBindMode", "flowDefineId", "starterField"];
watch(
    () => dynamicFormItemRef.value?.getFormData?.()?.value,
    (data: any) => {
      if (!data) return;
      FLOW_SYNC_FIELDS.forEach((k) => {
        if (data[k] !== undefined && data[k] !== formInfo.value[k]) {
          formInfo.value[k] = data[k];
        }
      });
    },
    {deep: true, immediate: true},
);

/**
 * 打开在线设计对话框。
 * 已有设计结果时先载入节点树（深拷贝，避免直接修改表单数据）。
 */
const openFlowDesigner = () => {
  const flowDesign = getFlowDesignStore();
  const existed = formInfo.value?.flowConfigures?.process;
  dlog("[FormPropertyPanel] openFlowDesigner, existed process:", !!existed, "flowConfigures:", formInfo.value?.flowConfigures);
  if (existed) {
    flowDesign.flowSetNode(JSON.parse(JSON.stringify(existed)));
  } else {
    flowDesign.flowSetNode(null);
  }
  flowDesignerVisible.value = true;
};

/**
 * 保存在线设计结果：节点树写入 formInfo.flowConfigures，随表单一并提交后台。
 * 约定对象名 flowConfigures = { mode: "design", process: 节点树 }。
 */
const saveFlowDesign = () => {
  const node = unref(flowDesignerRef.value?.nodeData);
  dlog("[FormPropertyPanel] saveFlowDesign, node:", !!node, "childNode:", !!node?.childNode);
  if (!node || !node.childNode) {
    warning(i18n("dyform.step.flowDesignEmpty"));
    return;
  }
  formInfo.value.flowConfigures = {
    mode: "design",
    process: JSON.parse(JSON.stringify(node)),
  };

  flowDesigned.value = true;
  flowDesignerVisible.value = false;
  dlog("[FormPropertyPanel] flowConfigures saved:", formInfo.value.flowConfigures);

};


// ==================== 表单属性字段定义（按业务分组提取） ====================
/**
 * 通用基础属性字段（与业务解耦，仅保留表单自身通用属性）。
 * 菜单/权限/建表策略等强业务字段已从 lib 中移除，
 * 接入方通过 FormConfig.formBasicProps 注入自定义字段（见 basicPropsFields）。
 */
const genericBasicPropsFields = [
  {
    label: i18n("dyform.formProp.tableName"),
    fieldName: "tbName",
    required: true,
    formVisible: true,
    preps: {editDisabled: true, colspan: ["simple"].includes(model.value) ? 24 : 12},
  },
  {
    label: i18n("dyform.formProp.primaryKey"),
    fieldName: "formId",
    required: true,
    formVisible: true,
    preps: {editDisabled: true, colspan: ["simple"].includes(model.value) ? 24 : 12},
  },
  {
    label: i18n("dyform.formProp.formIcon"),
    fieldName: "formIcon",
    type: "icon",
    defaultValue: "document",
    formVisible: true,
    preps: {colspan: ["simple"].includes(model.value) ? 24 : 12, iconType: "user", values: loadSvgIcons()},
  },
];
/**
 * 基础配置字段 = lib 通用字段 + 外部注入字段（FormConfig.formBasicProps）。
 * 外部字段需自包含（options 数据、actions 均由外部提供），
 * 支持 label/fieldName/type/defaultValue/required/formVisible/preps/actions 等标准结构。
 */
const basicPropsFields = [
  ...genericBasicPropsFields,
  ...(props.optional?.formBasicProps ?? []),
];
/** 表单样式字段 */
const otherPropsFields = [
  {
    label: i18n("dyform.formProp.labelPosition2"),
    fieldName: "labelPosition",
    defaultValue: "left",
    type: "select",
    formVisible: true,
    preps: {values: labelPositionList}
  },
  {
    label: i18n("dyform.formProp.labelWidth"),
    fieldName: "labelWidth",
    helpMsg: i18n("dyform.formProp.labelWidth.helpMsg"),
    formVisible: true
  },
  {label: i18n("dyform.formProp.validRuleName"), fieldName: "rules", defaultValue: "rules", formVisible: true},
  {
    label: i18n("dyform.formProp.formStyle"),
    fieldName: "size",
    defaultValue: Config.compSize,
    type: "select",
    formVisible: true,
    preps: {values: formSizeList}
  },
  {label: i18n("dyform.formProp.labelSuffix"), fieldName: "labelSuffix", formVisible: true},
  {
    label: i18n("dyform.formProp.disableAll"),
    fieldName: "disabled",
    defaultValue: false,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.hideRequiredAsterisk"),
    fieldName: "hideRequiredAsterisk",
    defaultValue: false,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.scrollToError"),
    fieldName: "scrollToError",
    defaultValue: true,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.asteriskPosition"),
    fieldName: "requireAsteriskPosition",
    defaultValue: "right",
    type: "radio",
    formVisible: true,
    preps: {values: requireAsteriskPositionList}
  },
  {
    label: i18n("dyform.formProp.showValidateIcon"),
    fieldName: "statusIcon",
    defaultValue: false,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.showErrorMessage"),
    fieldName: "showMessage",
    defaultValue: true,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.inlineMessage"),
    fieldName: "inlineMessage",
    defaultValue: true,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.validateOnRuleChange"),
    fieldName: "validateOnRuleChange",
    defaultValue: false,
    type: "switch",
    formVisible: true
  },
  {
    label: i18n("dyform.formProp.inlineForm"),
    fieldName: "inline",
    defaultValue: true,
    type: "switch",
    formVisible: true
  },
];
/** 关系配置表格 */
const relationConfigTable = {
  containerType: "table",
  containerFields: [
    {
      subTableName: "relations",
      initRows: 0,
      fieldList: [
        {
          label: i18n("dyform.formProp.relationTable"),
          fieldName: "tableId",
          type: "select",
          required: true,
          formVisible: true,
          preps: {values: relationDataList}
        },
        {
          label: i18n("dyform.formProp.relationType"),
          fieldName: "relationType",
          type: "select",
          defaultValue: "1n",
          required: true,
          formVisible: true,
          preps: {values: relationTypeList}
        },
      ],
    },
  ],
};
/** 公共属性字段 */
const publicPropsFields = [
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
      preps: {activeValue: "Y", inactiveValue: "N"},
    },
    {
      label: i18n("dyform.formProp.statusDict"),
      helpMsg: i18n("dyform.formProp.statusDict.helpMsg"),
      fieldName: "statusDictName",
      defaultValue: "common",
      formVisible: true
    },
  ],
  {
    containerType: "table",
    containerFields: [
      {
        subTableName: "commonFieldControllers",
        subTablePrimaryKey: "commonFieldControllers",
        initRows: 0,
        subFormFlag: "Y",
        fieldList: [
          {
            label: i18n("dyform.formProp.fieldInfo"),
            fieldName: "fieldName",
            type: "select",
            required: true,
            formVisible: true,
            preps: {values: commonField(), props: {label: "label", value: "fieldName"}}
          },
          {
            label: i18n("dyform.formProp.searchDisplay"),
            fieldName: "searchVisible",
            type: "switch",
            defaultValue: false,
            formVisible: true
          },
          {
            label: i18n("dyform.formProp.formDisplay"),
            fieldName: "formVisible",
            type: "switch",
            defaultValue: false,
            formVisible: true
          },
          {
            label: i18n("dyform.formProp.listDisplay"),
            fieldName: "listVisible",
            type: "switch",
            defaultValue: true,
            formVisible: true
          },
        ],
      },
    ],
  },
];
/** 列表字段映射表格 */
const listConfigTable = {
  containerType: "table",
  containerFields: [
    {
      subTableName: "fieldMappingList",
      subTablePrimaryKey: "fieldMappingList",
      subFormFlag: "Y",
      initRows: 0,
      fieldList: [
        {
          label: i18n("dyform.formProp.fieldInfo"),
          fieldName: "fieldName",
          type: "select",
          formVisible: true,
          required: true,
          preps: {values: dynamicFieldList}
        },
        {
          label: i18n("dyform.formProp.mappingTable"),
          fieldName: "mappingTable",
          type: "select",
          formVisible: true,
          required: true,
          preps: {values: dataSourceData, props: {label: "formName", value: "tbName"}},
          actions: {
            change: (val: any) => {
              loadTableColumns(val["mappingTable"]);
            }
          }
        },
        {
          label: i18n("dyform.formProp.relationField2"),
          fieldName: "mappingField",
          type: "select",
          required: true,
          formVisible: true,
          preps: {values: tableColumnsList}
        },
        {
          label: i18n("dyform.formProp.displayField"),
          fieldName: "mappingDisplayField",
          type: "select",
          required: true,
          formVisible: true,
          preps: {values: tableColumnsList}
        },
        {
          label: i18n("dyform.formProp.displayAlias"),
          fieldName: "displayAliasField",
          helpMsg: i18n("dyform.formProp.displayAlias.helpMsg"),
          formVisible: true,
          rules: [{
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: i18n("dyform.formProp.displayAlias.validate"),
            trigger: "blur"
          }]
        },
      ],
    },
  ],
};
/** 列表自定义事件表格 */
const listCustomEventTable = {
  containerType: "table",
  containerFields: [
    {
      subTableName: "listActions",
      subTablePrimaryKey: "listActions",
      subFormFlag: "Y",
      staticData: "Y",
      initRows: 0,
      fieldList: [
        [
          {label: i18n("dyform.formProp.eventName"), fieldName: "eventName", formVisible: true, required: true},
          {
            label: i18n("dyform.formProp.eventIcon"),
            fieldName: "icon",
            type: "icon",
            formVisible: true,
            required: true,
            preps: {iconType: "user", values: loadSvgIcons()}
          },
        ],
        [
          {

            label: i18n("dyform.formProp.eventCategory"),
            fieldName: "eventType",
            type: "select",
            required: true,
            formVisible: true,
            actions: {
              change: (val: any) => {
                urlFieldVisible.value = val["eventType"] && val["eventType"] != "dialog";
              }
            },
            preps: {
              dataRelation: {
                actionName: "change",
                relationDetails: [{
                  matchType: "eq",
                  controlCondition: "eqVisible",
                  relationFields: ["httpMethod"],
                  matchFieldValue: "interface"
                }]
              },
              values: eventTypeList,
            },
          },
        ],
        [
          {
            label: i18n("dyform.formProp.requestUrl"),
            fieldName: "content",
            helpMsg: i18n("dyform.formProp.requestUrl.helpMsg"),
            required: true,
            formVisible: true,
            preps: {colspan: 18}
          },
          {
            label: i18n("dyform.formProp.requestMethod"),
            fieldName: "httpMethod",
            defaultValue: "POST",
            type: "select",
            formVisible: false,
            preps: {values: httpMethod(), colspan: 5}
          },
        ],
        {label: i18n("dyform.formProp.params"), fieldName: "parameters", type: "json", formVisible: urlFieldVisible},
      ],
    },
  ],
};
/** 列表排序字段表格 */
const listSortFieldTable = {
  containerType: "table",
  containerFields: [
    {
      subTableName: "orderBy",
      subTablePrimaryKey: "orderBy",
      subFormFlag: "Y",
      initRows: 0,
      fieldList: [
        {
          label: i18n("dyform.formProp.sortField"),
          fieldName: "fieldName",
          type: "select",
          required: true,
          formVisible: true,
          preps: {values: orderByFieldList}
        },
        {
          label: i18n("dyform.formProp.sortOrder"),
          fieldName: "orderBy",
          type: "select",
          formVisible: true,
          preps: {values: orderBy()}
        },
        {
          label: i18n("dyform.formProp.priority"),
          fieldName: "priority",
          type: "number",
          defaultValue: 1,
          formVisible: true
        },
      ],
    },
  ],
};
/**
 * 流程绑定字段（表单级绑定）。
 *
 * 两种绑定方式：
 * - reuse：从后台流程定义列表中选择已有流程（flowDefineId）；
 * - design：打开可视化流程设计器在线设计，节点树保存到 flowConfigures.process。
 *
 * 绑定结果统一写入 formInfo.flowConfigures = { mode, flowDefineId?, process? }，
 * flowConfigures 随表单一并提交后台。
 */
const bindModeField = {
  label: i18n("dyform.step.flowBindMode"),
  fieldName: "flowBindMode",
  type: "radio",
  defaultValue: "reuse",
  helpMsg: i18n("dyform.step.flowBindMode.helpMsg"),
  formVisible: false,
  actions: {
    change: (val: any) => {
      dlog(val);
      // StarHorseForm 的 outerFormData 是单向拷贝，字段值需同步回 formInfo，
      // 否则面板底部的流程在线设计入口（v-show 依赖 formInfo.flowBindMode）无法联动显示

    },
  },
  preps: {
    values: [
      {name: i18n("dyform.step.flowBindMode.reuse"), value: "reuse"},
      {name: i18n("dyform.step.flowBindMode.design"), value: "design"},
    ],
    dataRelation: {
      actionName: "change",
      relationDetails: [
        {matchType: "eq", controlCondition: "eqVisible", relationFields: ["flowDefineId"], matchFieldValue: "reuse"},
        {
          matchType: "eq",
          controlCondition: "eqExecution",
          relationFields: ["abc"],
          func: (val) => {
            formInfo.value.flowBindMode = val["flowBindMode"];
            formInfo.value.flowConfigures = {
              ...(formInfo.value.flowConfigures || {}),
              mode: "design",
            };
            openFlowDesigner();
          },
          matchFieldValue: "design"
        },
      ],
    },
  },
};
const flowDefineIdField = {
  label: i18n("dyform.step.formFlowDefine"),
  fieldName: "flowDefineIdList",
  type: "select",
  formVisible: false,
  actions: {
    change: (val: any) => {
      if (val["flowDefineIdList"]) {
        formInfo.value.flowConfigures = {
          mode: "reuse",
          flowDefineIdList: val["flowDefineIdList"],
        };
      }
    },
  },
  preps: {values: flowDefineOptions, multiple: true},
};

const starterFieldField = {
  label: i18n("dyform.step.formFlowStarterField"),
  fieldName: "starterField",
  type: "select",
  formVisible: false,
  preps: {values: starterFieldOptions},
};
const flowBindingFields = [
  {
    label: i18n("dyform.step.flowFlag"),
    fieldName: "flowFlag",
    type: "switch",
    defaultValue: "N",
    formVisible: true,
    actions: {
      change: (val: any) => {
        // 同步回 formInfo：入口按钮与回显依赖 formInfo.flowFlag
        formInfo.value.flowFlag = val["flowFlag"];
      },
    },
    preps: {
      activeValue: "Y", inactiveValue: "N",
      dataRelation: {
        actionName: "change",
        relationDetails: [
          {
            matchType: "eq",
            controlCondition: "eqVisible",
            relationFields: ["flowBindMode", "flowDefineId", "starterField"],
            matchFieldValue: "Y"
          },
        ],
      },
    },
  },
  bindModeField,
  flowDefineIdField,

  //starterFieldField,
];

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
      containerType: "tab",
      preps: {
        mustCompleteTab: false
      },
      containerFields: [
        {
          title: i18n("dyform.formProp.tabBasic"),
          subTablePrimaryKey: "tab1",
          fieldList: [
            {
              containerType: "fieldset",
              containerFields: [
                {
                  title: i18n("dyform.formProp.basicProps"), fieldList: [{
                    preps: {
                      border: true,
                      column: 3,
                    },
                    containerType: "descriptions", containerFields: [{
                      fieldList: basicPropsFields,
                    }]
                  }], preps: {collapsible: true, innerCollapsed: false}
                },
                {
                  title: i18n("dyform.formProp.otherProps"),
                  fieldList: [{
                    preps: {
                      border: true,
                      column: 3,
                    },
                    containerType: "descriptions",
                    containerFields: [{
                      fieldList: otherPropsFields,
                    }]
                  }],
                  formVisible: ["default", "full"].includes(model.value),
                  preps: {collapsible: true, innerCollapsed: true}
                },
              ],
            },
          ],
        },
        {
          title: i18n("dyform.formProp.tabData"),
          subTablePrimaryKey: "tab2",
          fieldList: [
            {
              containerType: "fieldset",
              containerFields: [
                {
                  title: i18n("dyform.formProp.publicProps"),
                  helpMsg: commonColumnsMsg,
                  fieldList: publicPropsFields,
                  formVisible: ["default", "full"].includes(model.value),
                  preps: {collapsible: true, innerCollapsed: false}
                },
                {
                  title: i18n("dyform.formProp.listSortField"),
                  fieldList: [listSortFieldTable],
                  formVisible: ["default", "full"].includes(model.value),
                  preps: {collapsible: true, innerCollapsed: false}
                },
              ],
            },
          ],
        },
        {
          title: i18n("dyform.step.formFlowBind"),
          subTablePrimaryKey: "tab3",
          fieldList: flowBindingFields,
        },
        {
          title: i18n("dyform.formProp.tabList"),
          subTablePrimaryKey: "tab4",
          fieldList: [
            {
              containerType: "fieldset",
              containerFields: [
                {
                  title: i18n("dyform.formProp.relationConfig"),
                  helpMsg: relationMsg,
                  fieldList: [relationConfigTable],
                  formVisible: model.value == "full",
                  preps: {collapsible: true, innerCollapsed: false}
                },
                {
                  title: i18n("dyform.formProp.listConfig"),
                  helpMsg: tableListMsg,
                  fieldList: [listConfigTable],
                  formVisible: ["full"].includes(model.value),
                  preps: {collapsible: true, innerCollapsed: false}
                },
                {
                  title: i18n("dyform.formProp.listCustomEvent"),
                  fieldList: [listCustomEventTable],
                  formVisible: ["full"].includes(model.value),
                  preps: {collapsible: true, innerCollapsed: false}
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
      props.optional?.loadDicts &&
      typeof props.optional.loadDicts == "function"
  ) {
    props.optional?.loadDicts("event_type")?.then((res: SelectOption[]) => {
      eventTypeList.value = res;
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
};

const analysisDynamicFields = async (formInfo: any) => {
  debugger;
  dynamicFieldList.value = designDataNames(compList.value);
  /*const apiUrl =
      props.optional?.api?.basePrefix + "/analysisDynamicDatasourceFields";
  dlog(
      "[FormPropertyPanel] analysisDynamicFields called, apiUrl:",
      apiUrl,
  );
  let reData = await loadData(apiUrl, formInfo);
  dlog(
      "[FormPropertyPanel] loadData result:",
      JSON.stringify({
        error: reData.error,
        dataLength: reData.data?.length,
        data: reData.data,
      }),
  );
  if (reData.error) {
    derror("[FormPropertyPanel] loadData error:", reData.error);
    return;
  }
  dynamicFieldList.value = reData.data;
  dlog(
      "[FormPropertyPanel] dynamicFieldList updated, length:",
      dynamicFieldList.value?.length,
  );*/
};
const analysisMainFields = async () => {
  let datas = analysisCompDatas(compList.value);
  const selectDatas: SelectOption[] = datas.selectList;
  mainTableFieldList.value = selectDatas;
  orderByFieldList.value = selectDatas;
  dynamicFieldList.value = selectDatas;
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
    if (res.data.code != 200) {
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
};
onMounted(() => {
  initData();
  analysisMainFields();
  if (!flowDefineOptions.value.length && props.optional?.loadFlowDefines) {
    props.optional.loadFlowDefines().then((list: SelectOption[]) => {
      flowDefineOptions.value = list || [];
    });
  }
  /** 回显流程绑定状态：flowConfigures 中的 mode/flowDefineId/process 还原到表单字段 */
  const flowConfigures = formInfo.value?.flowConfigures;
  if (flowConfigures?.mode) {
    formInfo.value.flowBindMode = flowConfigures.mode;
    formInfo.value.flowFlag = "Y";
    if (flowConfigures.mode == "reuse" && flowConfigures.flowDefineId) {
      formInfo.value.flowDefineId = flowConfigures.flowDefineId;
    }
    if (flowConfigures.mode == "design" && flowConfigures.process) {
      flowDesigned.value = true;
    }
  }

});
onActivated(() => {
  dinfo("onActivated");
});

watch(
    () => formInfo.value,
    () => {
      updateCompInfo();
    },
    {
      immediate: true,
      deep: true,
      flush: "post",
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

.flow-design-entry {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: center;
}
</style>
<template>
  <star-horse-form
      label-position="right"
      :outerFormData="formInfo"
      :fieldList="tableFieldList"
      ref="dynamicFormItemRef"
  />
  <!-- 流程在线设计对话框：节点树写入 formInfo.flowConfigures 随表单提交 -->
  <star-horse-panel
      v-model="flowDesignerVisible"
      :title="flowDesigned ? i18n('dyform.step.flowDesignerTitle.reedit') : i18n('dyform.step.flowDesignerTitle')"
      :selfFunc="true"
      :fullScreen="true"
      @closeAction="flowDesignerVisible = false"
      @merge="saveFlowDesign"
  >
    <FlowDesigner
        ref="flowDesignerRef"
        :stopInitFormInfo="true"
        :saveBtnVisible="false"
        :mapBtnVisible="false"
        :initialNode="formInfo?.flowConfigures?.process || {}"
    />
  </star-horse-panel>
</template>
