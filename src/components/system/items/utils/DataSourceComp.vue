<script setup lang="ts">
import { loadSvgIconsByPath } from "@/api/star_horse_form_utils.js";
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
  const arr: SelectOption[] = [{ value: "data", name: "静态数据" }];
  if (props.model == "full") {
    arr.push(
      { value: "url", name: "动态接口" },
      { value: "dict", name: "数据字典" },
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
  validateButtonText: "校验",
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
      error("请填写解析路径");
      return;
    }
    // 添加public路径处理
    const publicPath = `/${analysisValue}`.replace(/\/+/g, "/");
    temp["values"] = loadSvgIconsByPath(publicPath);
  } else if (temp["analysisType"] === "func") {
    if (!analysisValue) {
      error("请填写函数名");
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
            error(`函数执行失败: ${e.message}`);
          }
        } else {
          error("指定函数不存在");
        }
      } else {
        error("未找到指定的工具函数");
      }
    });
  }
};
const baseDataField: FieldInfo[] | any = [
  [
    {
      label: "解析方式",
      fieldName: "analysisType",
      helpMsg:
        "路径解析：只能解析项目public下的子路径，格式为 test/*.svg，\n函数解析：只能解析src/api/star_horse_utils.ts下的无参函数，格式为: analysisData",
      type: "radio",
      formVisible: true,
      defaultValue: "func",
      preps: {
        values: [
          { name: "路径", value: "path", disabled: true },
          { name: "函数", value: "func" },
        ],
        colspan: 8,
      },
    },
    {
      label: "值",
      fieldName: "analysisValue",
      type: "input",
      formVisible: true,
      preps: {
        colspan: 14,
      },
    },
    {
      label: "解析",
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
            label: "属性名",
            fieldName: "name",

            required: dataRequired,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "属性值",
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
        title: "标准参数",
        tabName: "queryParams",
        objectName: "queryParams",
        batchFieldList: [
          {
            batchName: "queryParams",
            helpMsg: "标准参数：",
            fieldList: [
              {
                label: "参数名",
                fieldName: "name",
                type: "select",
                required: true,
                formVisible: true,
                listVisible: true,
                preps: {
                  values: fieldList,
                  allowCreate: "Y",
                },
              },
              {
                label: "匹配方式",
                fieldName: "matchType",
                type: "select",
                defaultValue: "eq",
                required: urlRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  values: matchTypeList,
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
                label: "参数值",
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
        title: "自定义参数",
        tabName: "customParams",
        objectName: "customParams",
        fieldList: [
          {
            fieldName: "customParams",
            label: "自定义JSON参数",
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
    label: "字典名称",
    fieldName: "urlOrDictName",
    required: true,
    type: "datapicker",
    formVisible: true,
    listVisible: true,
    preps: {
      dataUrl: "/system-config/system/dictinfoType/pageList",
      displayName: "dictTypeName",
      displayValue: "dictTypeCode",
      pageSize: 100,
      colspan: 16,
    },
  },
  {
    label: "验证",
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
        label: "表单属性",
        fieldName: "label",
        type: "tag",
        formVisible: true,
        listVisible: true,
        preps: {
          colspan: 8,
        },
      },
      {
        label: "数据源类型",
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
