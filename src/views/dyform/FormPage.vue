<script setup lang="ts">
import {nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {apiInstance, closeLoad, createCondition, dialogPreps, load, loadGetData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {postRequest} from "@/api/star_horse.ts";
import {getUserInfo} from "@/utils/auth.ts";

let designForm = DesignForm(piniaInstance);
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
  param: {type: String, required: true},
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  let {data, error} = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`);
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
  loadInstanceData();
};
const loadInstanceData = () => {
  let field = formInfo.value?.dataLoadField;
  if (field) {
    let userInfo = getUserInfo();
    let value = userInfo[field];
    postRequest(dataUrl.value.oneConditionUrl, {
      fieldList: [createCondition(field, value)]
    }).then((res) => {
      let data = res.data;
      if (data.code) {
        return;
      }
      outerFormData.value = data.data || data.dataList;
    })
  }
}
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
    {deep: true}
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
  designForm.setIsEdit(false);
  await loadFormData(props.param);
}
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <template v-if="hasData">
    <el-card class="inner_content">
      <star-horse-form :compUrl="dataUrl" :formInfo="formInfo" :dynamicForm="true"
                       :globalCondition="relationTables"
                       :outerFormData="outerFormData"
                       @refresh="loadInstanceData"
                       :fieldList="tableFieldList" :rules="rules" :typeModel="'form'"/>
    </el-card>
  </template>
</template>
<style scoped></style>
