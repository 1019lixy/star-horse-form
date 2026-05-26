<script setup lang="ts">
import { loadSvgIconsByPath } from "@/api/star_horse_form_utils.js";
import {i18n} from "@/lang";
import {
  createData,
  getInterfaceUtils,
  getUrlFieldConfig,
  validInterface,
  validOperation,
} from "@/components/system/items/utils/ItemPreps.js";
import {
  error,
  FieldInfo,
  PageFieldInfo,
  searchMatchList,
  SelectOption,
} from "star-horse-lowcode";
import {
  computed,
  ModelRef,
  nextTick,
  onMounted,
  PropType,
  reactive,
  ref,
  unref,
  watch,
} from "vue";

defineOptions({
  name: "DataSourceComp",
});
const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => {},
  },

  preps: {
    type: Object as PropType<any>,
    default: () => {},
  },

  item: {
    type: Object as PropType<PageFieldInfo>,
    default: () => {},
  },
  model: {
    type: String,
    default: "simple",
  },
});
const dataSourceList = computed(() => {
  const arr: SelectOption[] = [{ value: "data", name: i18n("dyform.utils.586") }];
  if (props.model == "full") {
    arr.push(
      { value: "url", name: i18n("dyform.utils.587") },
      { value: "dict", name: i18n("dyform.utils.588") },
    );
  }
  return arr;
});
const dataSourceFormRef = ref();
const dataForm: ModelRef<any> = defineModel("dataForm");
const matchTypeList = searchMatchList();
const dataRequired = ref<boolean>(true);
const urlRequired = ref<boolean>(false);
const currentTabName = ref<FieldInfo[] | any>([]);

// 创建接口工具对象
// 使用从ItemPreps导入的接口工具函数
const interfaceUtils = getInterfaceUtils();
const { fieldList, disableUrl } = interfaceUtils;

// 生成URL配置字段
const urlFields = getUrlFieldConfig(interfaceUtils, {
  showValidateButton: true,
  validateButtonText: i18n("dyform.utils.589"),
  validateButtonIcon: "valid",
  urlColspan: 20,
  validateButtonColspan: 4,
  showLabelFields: true,
  showPrimaryKey: false,
  validateCallback: {
    click: async (val: any) => {
      await validOperation(
        val,
        dataSourceFormRef,
        fieldList,
        disableUrl,
        !dataForm.value,
        dataForm,
      );
      console.log("校验结果", fieldList.value);
    },
  },
});

const analysisOptionData = (val: any) => {
  const temp = unref(val);
  console.log("开始解析数据", temp);
  const analysisValue = temp["analysisValue"];
  if (temp["analysisType"] === "path") {
    if (!analysisValue) {
      error(i18n("dyform.utils.590"));
      return;
    }
    // 添加public路径处理
    const publicPath = `/${analysisValue}`.replace(/\/+/g, "/");
    temp["values"] = loadSvgIconsByPath(publicPath);
  } else if (temp["analysisType"] === "func") {
    if (!analysisValue) {
      error(i18n("dyform.utils.591"));
      return;
    }
    import("@/api/star_horse_form_utils.js").then(async (utils: any) => {
      if (utils && utils[analysisValue]) {
        // 确保函数存在
        if (typeof utils[analysisValue] === "function") {
          try {
            const result = await utils[analysisValue]();
            temp.values = Array.isArray(result) ? result : [];
          } catch (e) {
            error(i18n("dyform.utils.592"));
          }
        } else {
          error(i18n("dyform.utils.593"));
        }
      } else {
        error(i18n("dyform.utils.594"));
      }
    });
  }
};
const baseDataField: FieldInfo[] | any = [
  [
    {
      label: i18n("dyform.utils.595"),
      fieldName: "analysisType",
      helpMsg:
        i18n("dyform.utils.596"),
      type: "radio",
      formVisible: true,
      defaultValue: "func",
      preps: {
        values: [
          { name: i18n("dyform.item.297"), value: "path", disabled: true },
          { name: i18n("dyform.utils.499"), value: "func" },
        ],
        colspan: 8,
      },
    },
    {
      label: i18n("dyform.dialog.420"),
      fieldName: "analysisValue",
      type: "input",
      formVisible: true,
      preps: {
        colspan: 14,
      },
    },
    {
      label: i18n("dyform.utils.597"),
      fieldName: "btn",
      type: "button",
      formVisible: true,
      actions: { click: (val: any) => analysisOptionData(val) },
      preps: {
        colspan: 2,
      },
    },
  ],
  {
    batchFieldList: [
      {
        batchName: "values",
        importInfo: {
          importDataUrl: "/api/star_horse/dyform/importData",
          downloadTemplateUrl: "/api/star_horse/dyform/downloadData",
        },
        fieldList: [
          {
            label: i18n("dyform.utils.598"),
            fieldName: "name",

            required: dataRequired,
            formVisible: true,
            listVisible: true,
          },
          {
            label: i18n("dyform.utils.599"),
            fieldName: "value",
            required: dataRequired,
            formVisible: true,
            listVisible: true,

          },
        ],
      },
    ],
  },
];
const dynamicUrlField: FieldInfo[] | any = [
  ...urlFields,
  {
    fieldName: "queryParams",
    tabList: [
      {
        title: i18n("dyform.utils.600"),
        tabName: "queryParams",
        objectName: "queryParams",
        batchFieldList: [
          {
            batchName: "queryParams",
            helpMsg: i18n("dyform.utils.601"),
            fieldList: [
              {
                label: i18n("dyform.utils.467"),
                fieldName: "name",
                type: "select",
                required: true,
                formVisible: true,
                listVisible: true,
                preps: {
                  values: fieldList,
                  filterable:true,
                  allowCreate: true,
                },
              },
              {
                label: i18n("dyform.utils.468"),
                fieldName: "matchType",
                type: "select",
                defaultValue: "eq",
                required: urlRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  values: matchTypeList,
                  allowCreate: true,
                  filterable:true,
                  dataRelation: {
                    actionName: "change",
                    relationDetails: [
                      {
                        matchType: "eq",
                        controlCondition: "eqUnRequired",
                        relationFields: "value",
                        matchFieldValue: ["isnull", "notnull", "neq"],
                      },
                    ],
                  },
                },
              },
              {
                label: i18n("dyform.utils.469"),
                fieldName: "value",
                required: true,
                formVisible: true,
                listVisible: true,
              },
            ],
          },
        ],
      },
      {
        title: i18n("dyform.utils.602"),
        tabName: "customParams",
        objectName: "customParams",
        fieldList: [
          {
            fieldName: "customParams",
            label: i18n("dyform.utils.603"),
            type: "json",
            formVisible: true,
            listVisible: true,
            defaultValue: "",
            preps: {
              devType: "Y",
            },
          },
        ],
      },
    ],
  },
];
const dictField: FieldInfo[] | any = [
  {
    label: i18n("dyform.utils.604"),
    fieldName: "urlOrDictName",
    required: true,
    type: "datapicker",
    formVisible: true,
    listVisible: true,
    preps: {
      dataUrl: "/system-config/system/dictinfoType/pageList",
      displayName: "dictTypeName",
      multiple:false,
      displayValue: "dictTypeCode",
      pageSize: 100,
      colspan: 16,
    },
  },
  {
    label: i18n("dyform.utils.452"),
    fieldName: "urlOrDictNameBtn",
    type: "button",
    actions: {
      click: async (val: any) => {
        await validOperation(
          val,
          dataSourceFormRef,
          fieldList,
          disableUrl,
          !dataForm.value,
          dataForm,
        );
      },
    },
    formVisible: true,
    listVisible: true,
    preps: {
      colspan: 8,
      icon: "valid",
    },
  },
];

const dataSourceField = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: i18n("dyform.utils.605"),
        fieldName: "label",
        type: "tag",
        formVisible: true,
        listVisible: true,
        preps: {
          colspan: 8,
        },
      },
      {
        label: i18n("dyform.utils.606"),
        fieldName: "dataSource",
        type: "radio",
        required: true,
        formVisible: true,
        listVisible: true,
        defaultValue: "data",
        actions: {
          change: (val: any) => {
            const type = val["dataSource"];
            innerFunc(type);
          },
        },
        preps: {
          values: dataSourceList,
          radioType: "button",
        },
      },
    ],
    { type: "divider", formVisible: true, listVisible: true },
  ],
});

const innerFunc = (type: string) => {
  // 先清空fieldList中从索引2开始的所有元素
  dataSourceField.fieldList.splice(2);
  // 根据类型添加对应的数据
  if (type == "url") {
    dataSourceField.fieldList.push(...dynamicUrlField);
  } else if (type == "data") {
    dataSourceField.fieldList.push(...baseDataField);
  } else if (type == "dict") {
    dataSourceField.fieldList.push(...dictField);
  }
};

const submitValid = async () => {
  let flag: boolean = false;
  await validInterface(
    props.formProps,
    dataSourceFormRef,
    (dataList: any, _successMsg: string, errorMsg: string) => {
      if (!errorMsg) {
        //只保存静态数据,
        if (props.formProps) {
          props.formProps["values"] = createData(
            dataSourceFormRef,
            dataList,
          )?.reDataList;
        }
        flag = true;
      } else {
        error(errorMsg);
        flag = false;
      }
    },
    !dataForm.value,
    dataForm,
  );
  return flag;
};
const isInited = ref<boolean>(false);
const init = () => {
  nextTick(() => {
    if (props.preps?.objectName && dataForm.value) {
      let temp = dataForm.value;

      setFormData(temp);
      currentTabName.value = temp.dataSource || "data";
      isInited.value = true;
    }
  });
};
const setFormData = (data: any) => {
  nextTick(() => {
    !dataForm.value && dataSourceFormRef.value?.setFormData(data);
  });
};
const getFormData = () => {
  return dataSourceFormRef.value?.getFormData();
};
watch(
  () => dataForm.value?.dataSource,
  (val) => {
    currentTabName.value = val || "data";
  },
);
onMounted(() => {
  init();
});

defineExpose({
  submitValid,
  setFormData,
  getFormData,
});
</script>

<template>
  <star-horse-form
    :fieldList="dataSourceField"
    ref="dataSourceFormRef"
    v-if="!dataForm"
  />
  <star-horse-form-item
    v-else
    ref="dataSourceFormRef"
    :fieldList="dataSourceField"
    :dataIndex="(props.preps?.params?.totalTab || 1) - 1"
    :subFormFlag="'Y'"
    :objectName="'dataSource'"
    v-model:dataForm="dataForm"
  />
</template>

<style scoped lang="scss"></style>
