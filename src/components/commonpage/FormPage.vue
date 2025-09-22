<script setup lang="ts">
import { nextTick, onMounted, provide, reactive, ref, watch } from "vue";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  loadData,
  piniaInstance,
  postRequest,
  SearchFields,
  useDesignFormStore,
} from "star-horse-lowcode";
import { getUserInfo } from "@/utils/auth";
import { i18n } from "@/lang";
import CommonSkeleton from './CommonSkeleton.vue';

let designForm = useDesignFormStore(piniaInstance);
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tableFieldList = ref<any>({
  fieldList: [],
});
// 添加骨架屏加载状态
const isLoading = ref(true);
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
  isLoading.value = true; // 开始加载
  try {
    let { data, error } = await loadData(
      `/userdb-manage/userdb/dynamicFormInfo/getDynamicForm/${formId}`,
      {},
    );
    if (error) {
      errorMsg.value = error;
      hasData.value = false;
      return;
    }
    hasData.value = data && Object.keys(data).length > 0;
    dataUrl.value = apiInstance(
      data["dataUrl"]?.appName,
      data["dataUrl"]?.contextUrl,
    );
    searchFormData.value = data["searchFormData"] as SearchFields;
    primaryKey.value = data["primaryKey"];
    tableFieldList.value = data["tableFieldList"];
    rules.value = data["rules"];
    relationTables.value = data["relationTables"];
    await nextTick();
    // closeLoad();
    loadInstanceData();
  } catch (e) {
    errorMsg.value = i18n("commonPage.dataLoadError");
    hasData.value = false;
    console.error(e);
  } finally {
    isLoading.value = false; // 加载完成
  }
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
      // load("数据加载中。。。");
      loadFormData(<string>val);
    } catch (e) {
      // closeLoad();
      console.log(i18n("commonPage.dataTypeMismatch"));
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
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 使用通用骨架屏组件 -->
    <CommonSkeleton 
      v-if="isLoading" 
      :showSearch="false" 
      :showHeader="true" 
      :showForm="true" 
      :formRowCount="6"
    />
    
    <template v-else-if="hasData">
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
    
    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
<style scoped></style>
