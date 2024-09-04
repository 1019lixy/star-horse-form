<template>
  <star-horse-form
      :fieldList="tableFieldList" :globalCondition="relationTables" :dynamicForm="true"/>
</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import {closeLoad, loadGetData} from "@/api/sh_api.ts";
import {SearchProps} from "@/components/types/SearchProps";

const props = defineProps({
  dataNo: {type: String, required: true},
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
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"];
  formInfo.value = data["formInfo"];
  relationTables.value = data["relationTables"];
};
const init = () => {
  loadFormData(props.dataNo)
}
onMounted(() => {
  init();
});

</script>
