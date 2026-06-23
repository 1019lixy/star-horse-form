<script setup lang="ts">
import {i18n} from "@/lang";
import {
  createData,
  getInterfaceUtils,
  getUrlFieldConfig,
  validInterface,
  validOperation,
} from "@/components/system/items/utils/ItemPreps.js";
import {error, FieldInfo, PageFieldInfo, searchMatchList, SelectOption,} from "star-horse-lowcode";
import type {DataSourceType, DataSourceTypeOption} from "@/components/types/DataSourceTypes";
import ApiConfigForm from "@/components/system/items/utils/ApiConfigForm.vue";
import {computed, nextTick, PropType, reactive, ref, unref, watch} from "vue";

defineOptions({name: "UnifiedDataSourceComp"});

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  model: {
    type: String,
    default: "simple",
  },
  formFields: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
});

// ─── Type selector options ───
const sourceTypeOptions = computed<DataSourceTypeOption[]>(() => {
  const opts: DataSourceTypeOption[] = [
    {
      value: "data",
      label: i18n("dyform.unified.source.static"),
      icon: "Document",
      desc: i18n("dyform.unified.source.static.desc")
    },
  ];
  if (props.model === "full") {
    opts.push(
        /* {
           value: "url",
           label: i18n("dyform.unified.source.internalApi"),
           icon: "Link",
           desc: i18n("dyform.unified.source.internalApi.desc")
         },*/
        {
          value: "dict",
          label: i18n("dyform.unified.source.dict"),
          icon: "Collection",
          desc: i18n("dyform.unified.source.dict.desc")
        },
    );
    opts.push(
        {
          value: "thirdParty",
          label: i18n("dyform.unified.source.thirdParty"),
          icon: "Connection",
          desc: i18n("dyform.unified.source.thirdParty.desc")
        },
    );
  }
  return opts;
});

const currentType = ref<DataSourceType>(props.formProps?.dataSource || "data");
const formRef = ref();
const matchTypeList = searchMatchList();
const dataRequired = ref<boolean>(true);
const urlRequired = ref<boolean>(false);

// ─── Interface utils (for url/dict validate buttons) ───
const interfaceUtils = getInterfaceUtils();
const {fieldList, disableUrl} = interfaceUtils;

// ─── URL field config with validate button ───
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
      await validOperation(val, formRef, fieldList, disableUrl, true, undefined);
    },
  },
});

// ─── Static data fields ───
const staticFields: FieldInfo[] | any = [
  [
    {
      label: i18n("dyform.utils.595"), fieldName: "analysisType", helpMsg: i18n("dyform.utils.596"),
      type: "radio", formVisible: true, defaultValue: "func",
      preps: {
        values: [{name: i18n("dyform.item.297"), value: "path", disabled: true}, {
          name: i18n("dyform.utils.499"),
          value: "func"
        }], colspan: 8
      },
    },
    {
      label: i18n("dyform.dialog.420"),
      fieldName: "analysisValue",
      type: "input",
      formVisible: true,
      preps: {colspan: 14}
    },
    {
      label: i18n("dyform.utils.597"),
      fieldName: "btn",
      type: "button",
      formVisible: true,
      actions: {click: (val: any) => analysisOptionData(val)},
      preps: {colspan: 2}
    },
  ],
  {
    batchFieldList: [{
      batchName: "values",
      importInfo: {
        importDataUrl: "/api/star_horse/dyform/importData",
        downloadTemplateUrl: "/api/star_horse/dyform/downloadData"
      },
      fieldList: [
        {
          label: i18n("dyform.utils.598"),
          fieldName: "name",
          required: dataRequired,
          formVisible: true,
          listVisible: true
        },
        {
          label: i18n("dyform.utils.599"),
          fieldName: "value",
          required: dataRequired,
          formVisible: true,
          listVisible: true
        },
      ],
    }],
  },
];

// ─── Internal API fields ───
const internalApiFields: FieldInfo[] | any = [
  {
    fieldName: "apiInfo",
    tabList: [
      {
        title: "接口信息",
        tabName: "apiInfo",
        objectName: "apiInfo",
        fieldList: urlFields
      },
      {
        title: i18n("dyform.utils.600"), tabName: "queryParams", objectName: "queryParams",
        batchFieldList: [{
          batchName: "queryParams", helpMsg: i18n("dyform.utils.601"),
          fieldList: [
            {
              label: i18n("dyform.utils.467"),
              fieldName: "name",
              type: "select",
              required: true,
              formVisible: true,
              listVisible: true,
              preps: {values: fieldList, filterable: true, allowCreate: true}
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
                values: matchTypeList, allowCreate: true, filterable: true,
                dataRelation: {
                  actionName: "change",
                  relationDetails: [{
                    matchType: "eq",
                    controlCondition: "eqUnRequired",
                    relationFields: "value",
                    matchFieldValue: ["isnull", "notnull", "neq"]
                  }]
                }
              }
            },
            {label: i18n("dyform.utils.469"), fieldName: "value", required: true, formVisible: true, listVisible: true},
          ],
        }],
      },
      {
        title: i18n("dyform.utils.602"), tabName: "customParams", objectName: "customParams",
        fieldList: [{
          fieldName: "customParams",
          label: i18n("dyform.utils.603"),
          type: "json",
          formVisible: true,
          listVisible: true,
          defaultValue: "",
          preps: {devType: "Y"}
        }],
      },
    ],
  },
];

// ─── Dict fields ───
const dictFields: FieldInfo[] | any = [
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
      multiple: false,
      displayValue: "dictTypeCode",
      pageSize: 100,
      colspan: 16
    },
  },
  {
    label: i18n("dyform.utils.452"), fieldName: "urlOrDictNameBtn", type: "button",
    actions: {
      click: async (val: any) => {
        await validOperation(val, formRef, fieldList, disableUrl, true, undefined);
      }
    },
    formVisible: true, listVisible: true, preps: {colspan: 8, icon: "valid"},
  },
];

// ─── Third-party API form ref ───
const apiConfigRef = ref();

// ─── The unified reactive field config ───
const unifiedField = reactive<PageFieldInfo | any>({fieldList: []});

// Static data analysis handler
const analysisOptionData = (val: any) => {
  const temp = unref(val);
  const analysisValue = temp["analysisValue"];
  if (temp["analysisType"] === "path") {
    if (!analysisValue) {
      error(i18n("dyform.utils.590"));
      return;
    }
    const publicPath = `/${analysisValue}`.replace(/\/+/g, "/");
    temp["values"] = require("@/api/star_horse_form_utils.js").loadSvgIconsByPath(publicPath);
  } else if (temp["analysisType"] === "func") {
    if (!analysisValue) {
      error(i18n("dyform.utils.591"));
      return;
    }
    import("@/api/star_horse_form_utils.js").then(async (utils: any) => {
      if (utils && utils[analysisValue] && typeof utils[analysisValue] === "function") {
        try {
          const result = await utils[analysisValue]();
          temp.values = Array.isArray(result) ? result : [];
        } catch (e) {
          error(i18n("dyform.utils.592"));
        }
      } else {
        error(i18n("dyform.utils.593"));
      }
    });
  }
};

// Switch fieldList based on type
const switchType = (type: DataSourceType) => {
  unifiedField.fieldList.splice(0);
  // thirdParty uses ApiConfigForm component, not unifiedField
  // if (type === "url") unifiedField.fieldList.push(...internalApiFields);
  // else
  if (type === "dict") unifiedField.fieldList.push(...dictFields);
  else if (type === "data") unifiedField.fieldList.push(...staticFields);
};

// Watch type changes
watch(currentType, (val) => {
  if (val !== "thirdParty") {
    props.formProps.dataSource = val;
  }
  switchType(val);
});

// Initial type switch
switchType(currentType.value);

// ─── Public API ───
const setFormData = (data: any) => {
  nextTick(() => {
    if (data?.apiDataSource && Object.keys(data.apiDataSource).length > 0) {
      currentType.value = "thirdParty";
      nextTick(() => apiConfigRef.value?.setFormData(data.apiDataSource));
    } else {
      currentType.value = data?.dataSource || "data";
      nextTick(() => formRef.value?.setFormData(data));
    }
  });
};

const getFormData = () => {
  if (currentType.value === "thirdParty") {
    return apiConfigRef.value?.getFormData();
  }
  return formRef.value?.getFormData();
};

const submitValid = async () => {
  if (currentType.value === "thirdParty") {
    const valid = await apiConfigRef.value?.submitValid();
    if (!valid) return false;
    const formData = apiConfigRef.value?.getFormData();
    if (formData && props.formProps) {
      props.formProps["apiDataSource"] = formData.value ?? formData;
    }
    return true;
  }

  const formData = formRef.value?.getFormData();
  if (formData) {
    const data = formData.value ?? formData;
    data.dataSource = currentType.value;
    props.formProps.dataSource = currentType.value;
  }

  let flag = false;
  await validInterface(
      props.formProps,
      formRef,
      (dataList: any, _successMsg: string, errorMsg: string) => {
        if (!errorMsg) {
          if (props.formProps) {
            props.formProps["values"] = createData(formRef, dataList)?.reDataList;
          }
          flag = true;
        } else {
          error(errorMsg);
          flag = false;
        }
      },
      true,
  );
  return flag;
};

defineExpose({submitValid, setFormData, getFormData, currentType});
</script>

<template>
  <div class="unified-data-source">
    <!-- Source Type Selector - Card Style -->
    <div class="source-selector">
      <div class="selector-header">
        <span class="selector-title">{{ i18n("dyform.unified.source.type") }}</span>
        <span class="selector-desc">{{ sourceTypeOptions.find(o => o.value === currentType)?.desc }}</span>
      </div>
      <div class="type-cards">
        <div
            v-for="opt in sourceTypeOptions"
            :key="opt.value"
            :class="['type-card', { active: currentType === opt.value }]"
            @click="currentType = opt.value"
        >
          <el-icon class="type-icon" :size="18">
            <component :is="opt.icon"/>
          </el-icon>
          <span class="type-label">{{ opt.label }}</span>
        </div>

      </div>
    </div>

    <!-- Form Content -->
    <div class="source-content">
      <!-- Third-party API uses shared ApiConfigForm -->
      <ApiConfigForm
          v-if="currentType === 'thirdParty'"
          ref="apiConfigRef"
          mode="dataSource"
          :currentField="formProps.name"
      />
      <!-- Other types use star-horse-form -->
      <star-horse-form v-else :fieldList="unifiedField" ref="formRef"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.unified-data-source {
  width: 100%;
}

.source-selector {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);

  .selector-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;

    .selector-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }

    .selector-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      line-height: 1.4;
    }
  }

  .type-cards {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .type-card {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background: var(--el-bg-color);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    .type-icon {
      color: var(--el-text-color-secondary);
      transition: color 0.2s;
    }

    .type-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);

      .type-icon {
        color: var(--el-color-primary);
      }
    }

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      box-shadow: 0 0 0 1px var(--el-color-primary-light-7);

      .type-icon {
        color: var(--el-color-primary);
      }

      .type-label {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

.source-content {
  min-height: 200px;
  padding: 0 4px;
}
</style>
