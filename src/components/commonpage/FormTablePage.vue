<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from "vue";
import {
  analysisCompDatas,
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  useDesignFormStore,
} from "star-horse-lowcode";
import { i18n } from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";

let designForm = useDesignFormStore(piniaInstance);
const compList = computed(() => designForm.compList);
const starHorseTableCompRef = ref();
const dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tableFieldList = ref<PageFieldInfo>({
  fieldList: [],
  stopAutoLoad: true,
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  let { fieldList } = analysisCompDatas(compList);
  primaryKey.value = "id";
  tableFieldList.value.fieldList = fieldList;
  await nextTick();
  hasData.value = true;
  isLoading.value = false; // 加载完成
};

watch(
  () => compList.value,
  (val) => {
    loadFormData();
  },
  { deep: true },
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {
  await loadFormData();
};
onMounted(async () => {
  await init();
});
</script>
<style scoped></style>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 使用通用骨架屏组件 -->
    <CommonSkeleton
      v-if="isLoading"
      :showSearch="true"
      :showHeader="true"
      :showTable="true"
      :tableRowCount="5"
    />

    <template v-else-if="hasData">
      <star-horse-dialog
        :isShowBtnContinue="true"
        :dialogVisible="dialogProps.editVisible"
        :dialogProps="dialogProps"
      >
        <star-horse-form
          @refresh="starHorseTableCompRef?.loadByPage()"
          :compUrl="dataUrl"
          :fieldList="tableFieldList"
          :rules="rules"
        />
      </star-horse-dialog>
      <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :source="3"
      >
        <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :compUrl="dataUrl"
        />
      </star-horse-dialog>
      <div class="search_content" v-if="searchFormData.fieldList?.length > 0">
        <div class="search_btn">
          <star-horse-search-comp
            @searchData="
              (data: any) => starHorseTableCompRef?.createSearchParams(data)
            "
            :formData="searchFormData"
            :compUrl="dataUrl"
          />
        </div>
      </div>
      <el-card class="inner_content">
        <star-horse-table-comp
          ref="starHorseTableCompRef"
          :fieldList="tableFieldList"
          :primaryKey="primaryKey"
          :compUrl="dataUrl"
          :btnPermissions="{
            add: 'add',
            edit: 'eidt',
            view: 'view',
          }"
          :showBatchField="true"
          :dataFormat="dataFormat"
        />
      </el-card>
    </template>
    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
