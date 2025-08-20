<template>
  <el-tabs
      type="border-card"
      v-model="approvalTab"
  >
    <el-tab-pane key="basic" name="basic" label="节点信息">
      <BasePrep :nodeInfo="node"/>
    </el-tab-pane>
    <el-tab-pane label="服务配置" name="service">
      <execution-listeners :node="node"/>
    </el-tab-pane>
  </el-tabs>

  <DrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import {useFlowDesignStore} from "@/store/FlowDesign";
import {piniaInstance} from "star-horse-lowcode";
import {ModelRef, onMounted, ref} from "vue";
import BasePrep from "@/views/workflow/plugin/preps/BasePrep.vue";

defineOptions({
  name: "ServicePrep",
});
let node: ModelRef<any> = defineModel("activeData");

const flowDesign = useFlowDesignStore(piniaInstance);
const approvalTab = ref("basic");
const init = () => {
};
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
