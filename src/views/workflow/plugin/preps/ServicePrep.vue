<template>
  <execution-listeners :node="node"/>
  <FlowDrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import {useFlowDesign} from '@/store/FlowDesignStore.ts';
import piniaInstance from '@/store';
import {ModelRef} from 'vue-demi';
import {onMounted} from 'vue';
import ExecutionListeners from '@/views/workflow/plugin/preps/utils/ExecutionListeners.vue';


defineOptions({
  name: 'ServicePrep',
});
let node: ModelRef<any> = defineModel('activeData');

const flowDesign = useFlowDesign(piniaInstance);
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
  node.value.content = node.value.implementationType || '';
  onClose();
};
</script>
