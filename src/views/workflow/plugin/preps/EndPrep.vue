<template>
  <el-form label-position="top" label-width="90px">
    <el-form-item prop="executionListeners" label="执行监听器">
      <ExecutionListeners :node="node"/>
    </el-form-item>
  </el-form>
  <FlowDrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";
import ExecutionListeners from "@/views/workflow/plugin/preps/utils/ExecutionListeners.vue";

defineOptions({
  name: 'EndPrep',
})
let node: ModelRef<any> = defineModel("activeData");

const flowDesign = useFlowDesign(piniaInstance);

const showDrawer = (snode: any) => {
  console.log(snode);

  node.value = snode;
}
const onClose = () => {
  flowDesign.setActive(false);
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  if (node.value.privileges && node.value.privileges.length > 0) {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: '已设置'});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
    onClose();
  } else {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: null});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
  }
  onClose();
}
defineExpose({
  showDrawer
})
</script>
