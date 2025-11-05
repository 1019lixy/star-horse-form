<script setup lang="ts">
import { nextTick, onMounted, provide, reactive, ref, watch } from "vue";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  dialogPreps,
  load,
  loadGetData,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { useRoute, useRouter } from "vue-router";
import { useNavBarListStore } from "@/store/NavBarList";
import piniaCompInstance from "@/store";
import { i18n } from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";

const starHorseTableCompRef = ref();
const dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tableFieldList = ref<PageFieldInfo>({
  fieldList: [],
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
const props = defineProps({
  param: { type: String, required: true },
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  isLoading.value = true; // 开始加载
  try {
    let { data, error } = await loadGetData(
      `/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`,
    );
    if (error) {
      errorMsg.value = error;
      hasData.value = false;
      closeLoad();
      return;
    }
    hasData.value = data && Object.keys(data).length > 0;
    dataUrl.value = data["dataUrl"];
    searchFormData.value = data["searchFormData"] as SearchFields;
    primaryKey.value = data["primaryKey"];
    tableFieldList.value = data["tableFieldList"] as PageFieldInfo;
    rules.value = data["rules"];
    await nextTick();
    closeLoad();
    starHorseTableCompRef.value.init();
  } catch (e) {
    errorMsg.value = i18n("commonPage.dataLoadError");
    hasData.value = false;
    closeLoad();
    console.error(e);
  } finally {
    isLoading.value = false; // 加载完成
  }
};
watch(
  () => props.param,
  (val) => {
    clear();
    try {
      load(i18n("commonPage.dataLoading") + "。。。");
      loadFormData(val as string);
    } catch (e) {
      closeLoad();
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

const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {
  await loadFormData(props.param);
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
          :showBatchField="true"
          :dataFormat="dataFormat"
        />
      </el-card>
    </template>

    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
