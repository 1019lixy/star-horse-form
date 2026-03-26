<script setup lang="ts">
import { nextTick, onMounted, provide, ref, watch } from "vue";
import {
  analysisCompDatas,
  apiInstance,
  ApiUrls,
  dialogPreps,
} from "star-horse-lowcode";
import { i18n } from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";

const props = defineProps({
  compList: {
    type: Array,
    required: true,
  },
});
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
const formPageRef=ref();
const tableFieldList = ref<any>({
  fieldList: [],
  stopAutoLoad: true,
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
let outerFormData = ref<any>({});

const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  let { fieldList } = analysisCompDatas(props.compList);
  primaryKey.value = "id";
  tableFieldList.value.fieldList = fieldList;
  console.log(fieldList);
  await nextTick();
  hasData.value = true;
  isLoading.value = false; // 加载完成
};

watch(
  () => props.compList,
  (val) => {
    loadFormData();
  },
  { deep: true },
);

const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
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
          ref="formPageRef"
          :globalCondition="relationTables"
          :outerFormData="outerFormData"
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
