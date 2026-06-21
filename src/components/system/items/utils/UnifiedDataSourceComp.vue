<script setup lang="ts">
import { loadSvgIconsByPath } from "@/api/star_horse_form_utils.js";
import { i18n } from "@/lang";
import {
  createData,
  getInterfaceUtils,
  getUrlFieldConfig,
  validInterface,
  validOperation,
} from "@/components/system/items/utils/ItemPreps.js";
import { createApiDataSourceConfig } from "@/components/system/items/utils/ApiDataSourceConfig";
import {
  error,
  FieldInfo,
  PageFieldInfo,
  searchMatchList,
  SelectOption,
} from "star-horse-lowcode";
import { computed, nextTick, PropType, reactive, ref, unref, watch } from "vue";

defineOptions({ name: "UnifiedDataSourceComp" });

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  model: {
    type: String,
    default: "simple",
  },
});

// ─── Type selector options ───
const sourceTypeOptions = computed(() => {
  const opts: { value: string; label: string; icon: string; desc: string }[] = [
    { value: "data", label: i18n("dyform.unified.source.static"), icon: "Document", desc: i18n("dyform.unified.source.static.desc") },
  ];
  if (props.model === "full") {
    opts.push(
      { value: "url", label: i18n("dyform.unified.source.internalApi"), icon: "Link", desc: i18n("dyform.unified.source.internalApi.desc") },
      { value: "dict", label: i18n("dyform.unified.source.dict"), icon: "Collection", desc: i18n("dyform.unified.source.dict.desc") },
    );
  }
  opts.push(
    { value: "thirdParty", label: i18n("dyform.unified.source.thirdParty"), icon: "Connection", desc: i18n("dyform.unified.source.thirdParty.desc") },
  );
  return opts;
});

const currentType = ref<string>(props.formProps?.dataSource || "data");
const formRef = ref();
const matchTypeList = searchMatchList();
const dataRequired = ref<boolean>(true);
const urlRequired = ref<boolean>(false);

// ─── Interface utils (for url/dict validate buttons) ───
const interfaceUtils = getInterfaceUtils();
const { fieldList, disableUrl } = interfaceUtils;

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

// ─── Static data: analysis button handler ───
const analysisOptionData = (val: any) => {
  const temp = unref(val);
  const analysisValue = temp["analysisValue"];
  if (temp["analysisType"] === "path") {
    if (!analysisValue) { error(i18n("dyform.utils.590")); return; }
    const publicPath = `/${analysisValue}`.replace(/\/+/g, "/");
    temp["values"] = loadSvgIconsByPath(publicPath);
  } else if (temp["analysisType"] === "func") {
    if (!analysisValue) { error(i18n("dyform.utils.591")); return; }
    import("@/api/star_horse_form_utils.js").then(async (utils: any) => {
      if (utils && utils[analysisValue] && typeof utils[analysisValue] === "function") {
        try {
          const result = await utils[analysisValue]();
          temp.values = Array.isArray(result) ? result : [];
        } catch (e) { error(i18n("dyform.utils.592")); }
      } else { error(i18n("dyform.utils.593")); }
    });
  }
};

// ─── Static data fields ───
const staticFields: FieldInfo[] | any = [
  [
    {
      label: i18n("dyform.utils.595"), fieldName: "analysisType", helpMsg: i18n("dyform.utils.596"),
      type: "radio", formVisible: true, defaultValue: "func",
      preps: { values: [{ name: i18n("dyform.item.297"), value: "path", disabled: true }, { name: i18n("dyform.utils.499"), value: "func" }], colspan: 8 },
    },
    { label: i18n("dyform.dialog.420"), fieldName: "analysisValue", type: "input", formVisible: true, preps: { colspan: 14 } },
    { label: i18n("dyform.utils.597"), fieldName: "btn", type: "button", formVisible: true, actions: { click: (val: any) => analysisOptionData(val) }, preps: { colspan: 2 } },
  ],
  {
    batchFieldList: [{
      batchName: "values",
      importInfo: { importDataUrl: "/api/star_horse/dyform/importData", downloadTemplateUrl: "/api/star_horse/dyform/downloadData" },
      fieldList: [
        { label: i18n("dyform.utils.598"), fieldName: "name", required: dataRequired, formVisible: true, listVisible: true },
        { label: i18n("dyform.utils.599"), fieldName: "value", required: dataRequired, formVisible: true, listVisible: true },
      ],
    }],
  },
];

// ─── Internal API fields ───
const internalApiFields: FieldInfo[] | any = [
  ...urlFields,
  {
    fieldName: "queryParams",
    tabList: [
      {
        title: i18n("dyform.utils.600"), tabName: "queryParams", objectName: "queryParams",
        batchFieldList: [{
          batchName: "queryParams", helpMsg: i18n("dyform.utils.601"),
          fieldList: [
            { label: i18n("dyform.utils.467"), fieldName: "name", type: "select", required: true, formVisible: true, listVisible: true, preps: { values: fieldList, filterable: true, allowCreate: true } },
            { label: i18n("dyform.utils.468"), fieldName: "matchType", type: "select", defaultValue: "eq", required: urlRequired, formVisible: true, listVisible: true,
              preps: { values: matchTypeList, allowCreate: true, filterable: true,
                dataRelation: { actionName: "change", relationDetails: [{ matchType: "eq", controlCondition: "eqUnRequired", relationFields: "value", matchFieldValue: ["isnull", "notnull", "neq"] }] } } },
            { label: i18n("dyform.utils.469"), fieldName: "value", required: true, formVisible: true, listVisible: true },
          ],
        }],
      },
      {
        title: i18n("dyform.utils.602"), tabName: "customParams", objectName: "customParams",
        fieldList: [{ fieldName: "customParams", label: i18n("dyform.utils.603"), type: "json", formVisible: true, listVisible: true, defaultValue: "", preps: { devType: "Y" } }],
      },
    ],
  },
];

// ─── Dict fields ───
const dictFields: FieldInfo[] | any = [
  {
    label: i18n("dyform.utils.604"), fieldName: "urlOrDictName", required: true, type: "datapicker", formVisible: true, listVisible: true,
    preps: { dataUrl: "/system-config/system/dictinfoType/pageList", displayName: "dictTypeName", multiple: false, displayValue: "dictTypeCode", pageSize: 100, colspan: 16 },
  },
  {
    label: i18n("dyform.utils.452"), fieldName: "urlOrDictNameBtn", type: "button",
    actions: { click: async (val: any) => { await validOperation(val, formRef, fieldList, disableUrl, true, undefined); } },
    formVisible: true, listVisible: true, preps: { colspan: 8, icon: "valid" },
  },
];

// ─── Third-party API fields (from ApiDataSourceConfig) ───
const thirdPartyConfig = reactive<PageFieldInfo | any>(createApiDataSourceConfig());

// ─── The unified reactive field config ───
const unifiedField = reactive<PageFieldInfo | any>({ fieldList: [] });

// Switch fieldList based on type
const switchType = (type: string) => {
  unifiedField.fieldList.splice(0);
  if (type === "thirdParty") {
    // Third-party API: wrap the FieldInfo (with tabList) inside fieldList
    unifiedField.fieldList.push(thirdPartyConfig);
  } else {
    if (type === "url") unifiedField.fieldList.push(...internalApiFields);
    else if (type === "dict") unifiedField.fieldList.push(...dictFields);
    else unifiedField.fieldList.push(...staticFields);
  }
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
      nextTick(() => formRef.value?.setFormData(data.apiDataSource));
    } else {
      currentType.value = data?.dataSource || "data";
      nextTick(() => formRef.value?.setFormData(data));
    }
  });
};

const getFormData = () => formRef.value?.getFormData();

const submitValid = async () => {
  if (currentType.value === "thirdParty") {
    // Third-party API: validate + save to formProps.apiDataSource
    let flag = false;
    const starForm = formRef.value?.$refs?.starHorseFormRef;
    if (starForm) {
      await starForm.validate((res: boolean) => { flag = res; });
      if (!flag) return false;
    }
    const formData = formRef.value?.getFormData();
    if (formData && props.formProps) {
      props.formProps["apiDataSource"] = formData.value ?? formData;
    }
    return true;
  }

  // For old types, set dataSource in form data before calling validInterface
  const formData = formRef.value?.getFormData();
  if (formData) {
    const data = formData.value ?? formData;
    data.dataSource = currentType.value;
    // Ensure dataSource is in formProps so validInterface can read it
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

defineExpose({ submitValid, setFormData, getFormData });
</script>

<template>
  <div class="unified-data-source">
    <!-- Source Type Selector -->
    <div class="source-selector">
      <div class="selector-label">{{ i18n("dyform.unified.source.type") }}</div>
      <el-radio-group v-model="currentType" class="source-type-group">
        <el-radio-button v-for="opt in sourceTypeOptions" :key="opt.value" :value="opt.value">
          <el-icon style="margin-right: 4px"><component :is="opt.icon" /></el-icon>
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
      <div class="source-desc">{{ sourceTypeOptions.find(o => o.value === currentType)?.desc }}</div>
    </div>

    <!-- Single star-horse-form that renders the active type's fields -->
    <div class="source-content">
      <star-horse-form :fieldList="unifiedField" ref="formRef" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.unified-data-source { width: 100%; }
.source-selector {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  .selector-label { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 10px; }
  .source-type-group { display: flex; flex-wrap: wrap; }
  .source-desc { margin-top: 8px; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.5; }
}
.source-content { min-height: 200px; }
</style>
