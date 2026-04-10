<script setup lang="ts">
import {
  analysisAppComps,
  analysisCompDatas,
  apiInstance,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import {nextTick, onMounted, provide, ref, watch} from "vue";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  compList: {
    type: Array,
    required: true,
  },
});

const dataUrl = apiInstance("userdb-manage", "consumer/api");

let searchFormData = ref<SearchFields | any>({fieldList: []});
const tableFieldList = ref<PageFieldInfo | any>({
  fieldList: [],
});
// 添加骨架屏加载状态
const isLoading = ref(true);
/**
 * 表单数据直接取定义的数据preps,
 * 列表数据重新定义，方便排序和位置拖拽
 */
const primaryKey = ref<string>("");

const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  primaryKey.value = "id";
  if (props.currentPageClass == "main-design-phone") {
    let {fieldList} = analysisAppComps(props.compList);
    tableFieldList.value.fieldList = fieldList;
  } else {
    let {fieldList, searchItemList} = analysisCompDatas(props.compList);
    searchFormData.value.fieldList = searchItemList;
    tableFieldList.value.fieldList = fieldList;
  }
  await nextTick();
  isLoading.value = false; // 加载完成
};



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
watch(
    () => props.compList,
    (val) => {
      loadFormData();
    },
    { deep: true },
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
    <el-card class="inner_content">
      <star-horse-data-view
          :field-list="tableFieldList"
          :dataFormat="dataFormat"
          :compUrl="dataUrl"
      />
    </el-card>
  </div>
</template>
<style scoped></style>
