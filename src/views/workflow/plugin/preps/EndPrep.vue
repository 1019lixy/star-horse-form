<template>
  <ExecutionListeners :node="node" />
  <FlowDrawerFooter @close="onClose" @save="onSave" />
</template>
<script setup lang="ts">
import { useFlowDesignStore } from "@/store/FlowDesign";
import { piniaInstance } from "star-horse-lowcode";
import { ModelRef } from "vue";

defineOptions({
  name: "EndPrep",
});
let node: ModelRef<any> = defineModel("activeData");

const flowDesign = useFlowDesignStore(piniaInstance);

const showDrawer = (snode: any) => {
  console.log(snode);

  node.value = snode;
};
const onClose = () => {
  flowDesign.setActive(false);
};
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  onClose();
};
defineExpose({
  showDrawer,
});
</script>
