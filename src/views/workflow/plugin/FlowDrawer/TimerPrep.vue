<template>
  <div class="flow-setting-module">
    <div class="flow-setting-content">
      <div class="flow-setting-item">
        <p class="flow-setting-item-title">表单权限</p>
        <AuthForm v-model="node.privileges" readable/>
      </div>
    </div>
  </div>
  <FlowDrawerFooter @close="onClose" @save="onSave"/>
</template>
<script setup lang="ts">
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import AuthForm from '@/views/workflow/plugin/common/AuthForm.vue';
import {ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";

defineOptions({
  name: 'WritePrep',
})
let node: ModelRef<any> = defineModel("activeData");
let visible = ref<boolean>(false);

const flowDesign = useFlowDesign(piniaInstance);

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

}
</script>
