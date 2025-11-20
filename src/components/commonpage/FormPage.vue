<script setup lang="ts">
import {computed, nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {
  analysisCompDatas,
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  piniaInstance,
  postRequest,
  useDesignFormStore,
} from "star-horse-lowcode";
import {getUserInfo} from "@/utils/auth";
import {i18n} from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";

let designForm = useDesignFormStore(piniaInstance);
const compList = computed(() => designForm.compList);
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
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
const clear = () => {
  hasData.value = false;
};
const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  isLoading.value = true; // 开始加载
  let {fieldList} = analysisCompDatas(compList);
  primaryKey.value = "id";
  tableFieldList.value.fieldList = fieldList;
  await nextTick();
  isLoading.value = false; // 加载完成
  isLoading.value = false; // 加载完成

};

watch(
    () => compList.value,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
  designForm.setIsEdit(false);
  await loadFormData();
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
