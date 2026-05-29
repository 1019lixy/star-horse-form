<script setup lang="ts">
import {nextTick, onMounted, provide, ref, watch} from "vue";
import {
  analysisAppComps,
  analysisCompDatas,
  apiInstance,
  ApiUrls,
  convertCompToAppComps,
  dialogPreps,
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview:{type:Boolean, default:false},
  compList: {
    type: Array,
    required: true,
  },
});
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
const formPageRef = ref();
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
  primaryKey.value = "id";
  tableFieldList.value = analysisCompDatas(props.compList);
  if (props.currentPageClass == "main-design-phone") {
    tableFieldList.value = convertCompToAppComps(tableFieldList.value);
  }

  await nextTick();
  hasData.value = true;
  isLoading.value = false; // 加载完成
};



const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
  await loadFormData();
};
onMounted(async () => {
  await init();
});
watch(
    () => props.compList,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
watch(
    () => props.currentPageClass,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
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
            :preview="preview"
            :label-position="currentPageClass=='main-design-phone'?'top':'left'"
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
