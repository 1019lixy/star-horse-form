<script setup lang="ts">
import {nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {apiInstance, closeLoad, dialogPreps, load, loadGetData} from "@/api/star_horse_utils.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";

let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>();
const tableFieldList = ref<any>({
  fieldList: []
});
const primaryKey = ref("");
const nodeFormRef = ref();
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
let outerFormData = ref<any>({});
const props = defineProps({
  formNo: {type: String, required: true}
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formNo: string) => {
  if (!formNo) return;
  let {data, error} = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formNo}`);
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  dataUrl.value = apiInstance(data["dataUrl"].appName, data["dataUrl"].contextUrl);
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"] as PageFieldInfo;
  relationTables.value = data["relationTables"];
  rules.value = data["rules"];
  formInfo.value = data["formInfo"];
  await nextTick();
  closeLoad();
};
watch(
    () => props.formNo,
    (val) => {
      clear();
      try {
        load("数据加载中。。。");
        loadFormData(<string>val);
      } catch (e) {
        closeLoad();
        console.log("数据类型不匹配");
      }
    },
    {deep: true}
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
}
const setFormData = (data: any) => {
  nextTick(() => {
    nodeFormRef.value?.setFormData(data);
  })
}
const init = async () => {
  await loadFormData(props.formNo);
};
onMounted(async () => {
  await init();
});
defineExpose({
  getFormData,
  setFormData
})
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
      :typeModel="'form'"
  />
</template>
<style scoped></style>
