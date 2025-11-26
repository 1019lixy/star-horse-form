<script setup lang="ts">
import {
  analysisCompDatas,
  apiInstance,
  closeLoad,
  dialogPreps,
  download,
  error,
  load,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  useDesignFormStore,
} from "star-horse-lowcode";
import {
  computed,
  nextTick,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
} from "vue";
import { i18n } from "@/lang";

let designForm = useDesignFormStore(piniaInstance);
const compList = computed(() => designForm.compList);

const dataUrl = apiInstance("userdb-manage", "consumer/api");

const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields | any>({ fieldList: [] });
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
const viewSearchRef = ref();
const rules = ref<any>({});
const hasData = ref<boolean>(false);
const formInfo = ref<any>({});
const previewDatas = ref<any>({});
const starHorseTableCompRef = ref();
const clear = () => {
  hasData.value = false;
};
const exportData = () => {
  load(i18n("commonPage.dataProcessing"));
  let params = {
    fieldList: viewSearchRef.value.createSearchParams(searchFormData.value),
    pageSize: 100,
    currentPage: 1,
  };
  download(dataUrl.exportAllUrl!, params)
    .catch((err) => {
      error(i18n("commonPage.interfaceNotFound") + ":" + err);
    })
    .finally(() => {
      closeLoad();
    });
};
const columnList = ref([]);
const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  let { fieldList, searchItemList } = analysisCompDatas(compList);
  searchFormData.value.fieldList = searchItemList;
  primaryKey.value = "id";
  tableFieldList.value.fieldList = fieldList;
  await nextTick();
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
  designForm.setIsEdit(false);
  await loadFormData();
};
onMounted(async () => {
  await init();
});
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
