<template>
  <execution-listeners :node="node" />
  <DrawerFooter @close="onClose" @save="onSave" />
</template>
<script setup lang="ts">
import { useFlowDesignStore } from "@/store/FlowDesign";
import { piniaInstance } from "star-horse-lowcode";
import { ModelRef, onMounted } from "vue";

defineOptions({
  name: "ServicePrep",
});
let node: ModelRef<any> = defineModel("activeData");

const flowDesign = useFlowDesignStore(piniaInstance);
const init = () => {};
onMounted(() => {
  init();
});
const onClose = () => {
  flowDesign.setActive(false);
};
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  node.value.content = node.value.implementationType || "";
  onClose();
};
</script>
