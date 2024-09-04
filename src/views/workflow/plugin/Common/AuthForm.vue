<template>
  <star-horse-form
      :fieldList="tableFieldList"
      :rules="rules" :globalCondition="relationTables" :dynamicForm="true"/>
</template>
<script setup lang="ts">
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {computed, onMounted, nextTick, ref, unref, watch} from "vue";
import {closeLoad, loadGetData} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchProps} from "@/components/types/SearchProps";

const flowDesign = useFlowDesign(piniaInstance);
const flowFormInfo = computed(() => {
  let data = flowDesign.flowFormInfo;

  return data;
});
const props = defineProps({
  readable: {
    type: Boolean,
    default: false,
  },
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  value: {
    type: Array,
    default: function () {
      return [];
    },
  },
});
let relationTables = ref<any>({});
const dataUrl = ref<ApiUrls>({
  uploadUrl: "",
  batchMergeDraftUrl: "",
  batchMergeUrl: "",
  deleteUrl: "",
  downloadTemplateUrl: "",
  exportAllUrl: "",
  loadByIdUrl: "",
  loadByPageUrl: "",
  mergeDraftUrl: "",
  mergeUrl: "",
  importUrl: "",
  userConditionUrl: ""
});
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>([]);
const tableFieldList = ref<any>({
      fieldList: [],
    })
;
/**
 * 表单数据直接取定义的数据preps,
 * 列表数据重新定义，方便排序和位置拖拽
 */
const primaryKey = ref<string>("");
const rules = ref<any>({});
const hasData = ref<boolean>(true);
const formInfo = ref<any>({});
const loadFormData = async (formId: string) => {
  let {data, error} = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`
  );
  if (error) {
    errorMsg.value = error;
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  dataUrl.value = data["dataUrl"] as ApiUrls;
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"];
  rules.value = data["rules"];
  formInfo.value = data["formInfo"];
  relationTables.value = data["relationTables"];
  await nextTick();
  closeLoad();
};
const init = () => {
  let form = unref(flowFormInfo);
  console.log(form);
  loadFormData(form.value["bindForm"][0])
}
onMounted(() => {
  init();
});
watch(() => flowFormInfo,
    () => {
      init();
    }, {
      immediate: false,
      deep: true
    })

</script>
