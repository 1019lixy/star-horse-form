<template>
  <execution-listeners :node="node" />
  <FlowDrawerFooter @close="onClose" @save="onSave" />
</template>
<script setup lang="ts">
  import FlowDrawerFooter from "@/views/workflow/plugin/common/DrawerFooter.vue";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import {piniaInstance} from "star-horse-lowcode";
  import { ModelRef } from "vue";
  import { onMounted } from "vue";
  import ExecutionListeners from "@/views/workflow/plugin/preps/utils/ExecutionListeners.vue";

  defineOptions({
    name: "ServicePrep"
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
