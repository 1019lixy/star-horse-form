<template>
  <el-divider/>
  <form-preview :commonFieldList="commonFieldList" :compSize="compSize" :list="dataList"
                v-if="dataList&&dataList.length>0"/>
  <el-empty description="请选择表单" v-else/>
</template>
<script setup lang="ts">
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {computed, onMounted, ref, watch} from "vue";
import FlowFormItem from "@/views/workflow/plugin/common/FlowFormItem.vue";
import videojs from "video.js";
import any = videojs.any;
import FormPreview from "@/views/dyform/FormPreview.vue";
import {loadData} from "@/api/sh_api.ts";
import {warning} from "@/utils/message.ts";

const flowDesign = useFlowDesign(piniaInstance);
const flowFormInfo = computed(() => flowDesign.flowFormInfo);
let commonFieldList = ref<any>([]);
let dataList = ref<any>([]);
let currentData = ref<any>({});
const props = defineProps({
  compSize: {
    type: String,
    default: "small",
  },
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
    type: any,
    default: function () {
      return {};
    },
  },
});
const dataChange = async (param: any) => {
  console.log(param);
  let {data, error} = await loadData("/userdb-manage/userdb/dynamicForm/getById/" + param['idDynamicForm'], {});
  if (error) {
    warning(error);
    return;
  }
  currentData.value = data;
  dataList.value = JSON.parse(data["details"].content);
  commonFieldList.value = data.commonFieldControllers;
}
const init = () => {
  dataChange(props.value);
}
onMounted(() => {
  init();
});
watch(() => props.value, (_val: any) => {
  init();
}, {
  immediate: false,
  deep: true
});

</script>
