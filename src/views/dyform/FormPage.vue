<script setup lang="ts">
import { nextTick, onMounted, provide, reactive, ref, watch } from "vue";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  createCondition,
  dialogPreps,
  load,
  loadData,
  piniaInstance,
  postRequest,
  SearchProps,
  useDesignFormStore,
} from "star-horse-lowcode";
import { getUserInfo } from "@/utils/auth";

let designForm = useDesignFormStore(piniaInstance);
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>();
const tableFieldList = ref<any>({
  fieldList: [],
});
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
let outerFormData = ref<any>({});
const props = defineProps({
  param: { type: String, required: true },
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  let { data, error } = await loadData(
    `/userdb-manage/userdb/dynamicFormInfo/getDynamicForm/${formId}`,
    {},
  );
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  dataUrl.value = apiInstance(
    data["dataUrl"]?.appName,
    data["dataUrl"]?.contextUrl,
  );
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"];
  rules.value = data["rules"];
  relationTables.value = data["relationTables"];
  await nextTick();
  closeLoad();
  loadInstanceData();
};
const loadInstanceData = () => {
  let field = formInfo.value?.dataLoadField;
  if (field) {
    let userInfo = getUserInfo();
    let value = userInfo[field];
    postRequest(dataUrl.value.oneConditionUrl!, {
      fieldList: [createCondition(field, value)],
    }).then((res) => {
      let data = res.data;
      if (data.code) {
        return;
      }
      outerFormData.value = data.data || data.dataList;
    });
  }
};
watch(
  () => props.param,
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
  { deep: true },
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
  designForm.setIsEdit(false);
  await loadFormData(props.param);
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <template v-if="hasData">
    <el-card class="inner_content">
      <star-horse-form
        :compUrl="dataUrl"
        :formInfo="formInfo"
        :dynamicForm="true"
        :globalCondition="relationTables"
        :outerFormData="outerFormData"
        @refresh="loadInstanceData"
        :fieldList="tableFieldList"
        :rules="rules"
        :typeModel="'form'"
      />
    </el-card>
  </template>
</template>
<style scoped></style>
