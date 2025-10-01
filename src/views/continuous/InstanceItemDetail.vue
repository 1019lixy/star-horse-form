<script setup lang="ts" name="InstanceItemDetail">
import { countHeight, currentNodeProcess } from "@/views/continuous/utils/ToolsParams";
import { PropType, ref } from "vue";
const props = defineProps({
  isEdit: {
    type: Number,
    default: 1, //1 编辑 2 已发布
  },
  nodeInfo: {
    type: Object as PropType<any>,
    default: () => ({}),
  }
});
const emits = defineEmits(["nodeDetail"]);
let dataSourceStatus = ref<number>(1);
let compileStatus = ref<number>(2);
const dataDetail = (type) => {
  emits("nodeDetail", type);
};
const operationAction = (type) => {
  alert(type);
};
const getStatus = (statusCode: number) => {
  switch (statusCode) {
    case 1:
      return "background:rgba(0,195,95,0.8)";
    case 2:
      return "background:rgba(239,83,91,0.9)";
    default:
      return "background:#d8d8d8";
  }
};
const showDetail = (nodeType: string, instanceId: string) => { };
const execLine = () => {
  console.log("执行");
};
const configLine = () => { };
const publishLine = () => { };
</script>
<template>
  <div class="w-full  mt-5">
  <instance-item :nodeInfo="nodeInfo" :showHeaderBar="false" />
  </div>
</template>
<style lang="scss" scoped>

</style>
