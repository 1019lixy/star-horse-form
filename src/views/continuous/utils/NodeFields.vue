<script setup lang="ts">
import {
  nextTick,
  onMounted,
  PropType,
  provide,
  reactive,
  ref,
  watch,
} from "vue";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  dialogPreps,
  loadGetData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  useContinusConfigStore,
  warning,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const continuousStore = useContinusConfigStore(piniaInstance);
const errorMsg = ref(i18n("continuous.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tableFieldList = ref<any>({
  fieldList: [],
});
const primaryKey = ref("");
const nodeFormRef = ref();
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
let outerFormData = ref<any>({});
const props = defineProps({
  formNo: { type: String },
  staticFieldData: { type: Object as PropType<PageFieldInfo> },
});
const clear = () => {
  hasData.value = false;
};
const assignField = (data: any) => {
  dataUrl.value = apiInstance(
    data["dataUrl"].appName,
    data["dataUrl"].contextUrl,
  );
  searchFormData.value = data["searchFormData"] as SearchFields;
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = { ...data["tableFieldList"] } as PageFieldInfo;
  relationTables.value = data["relationTables"];
  rules.value = data["rules"];
  formInfo.value = data["formInfo"];
};
const resetField = () => {
  dataUrl.value = apiInstance("", "");
  searchFormData.value = {
    fieldList: [],
  };
  primaryKey.value = "";
  tableFieldList.value = {
    fieldList: [],
  };
  relationTables.value = {};
  rules.value = {};
  formInfo.value = {};
};
const loadFormData = async (formNo: string) => {
  if (!formNo) {
    resetField();
    return;
  }
  let cacheData = continuousStore.getNodeFields(formNo);
  if (cacheData) {
    assignField(cacheData);
    return;
  }
  let { data, error } = await loadGetData(
    `/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formNo}`,
  );
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    resetField();
    closeLoad();
    return;
  }
  assignField(data);
  continuousStore.addNodeFields(formNo, data);
  await nextTick();
  closeLoad();
};
watch(
  () => props,
  () => {
    init();
  },
  { deep: true },
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const getFormData = async () => {
  // 校验表单
  let result = await nodeFormRef.value?.starHorseFormRef.validate();
  if (!result) {
    return false;
  }
  return nodeFormRef.value?.getFormData()?.value;
};
const setFormData = (data: any) => {
  nextTick(() => {
    nodeFormRef.value?.setFormData(data);
  });
};
const resetForm = () => {
  tableFieldList.value.fieldList = []; // 这样做会导致所有缓存的表单数据都丢失
  nodeFormRef.value?.resetForm();
};
const init = async () => {
  if (!props.formNo && !props.staticFieldData) {
    warning("NodeFields组件缺少参数");
    return;
  }
  if (props.staticFieldData?.fieldList?.length > 0) {
    tableFieldList.value = { ...props.staticFieldData };
  } else {
    await loadFormData(props.formNo!);
  }
};
onMounted(async () => {
  await init();
});
defineExpose({
  getFormData,
  setFormData,
  resetForm,
});
</script>
<template>
  <star-horse-form
    :compUrl="dataUrl"
    :formInfo="formInfo"
    :dynamicForm="true"
    ref="nodeFormRef"
    :globalCondition="relationTables"
    :outerFormData="outerFormData"
    :fieldList="tableFieldList"
    :rules="rules"
  />
</template>
<style scoped></style>
