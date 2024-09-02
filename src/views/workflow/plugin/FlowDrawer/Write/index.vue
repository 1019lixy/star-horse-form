<template>
  <el-drawer
      :width="scale.isMobile() ? '100%' : '40%'"
      :headerStyle="headerStyle"
      :bodyStyle="flowMixin.bodyStyle"
      placement="right"
      :closable="true"
      v-model="visible"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
  >
    <template slot="title">
      <img :src="flowMixin.ccIcon" class="anticon"/>
      <span class="flow-ant-drawer-title">
        <EditName v-model="node.name"/>
      </span>
    </template>
    <div class="flow-setting-module">
      <div class="flow-setting-content">
        <div class="flow-setting-item">
          <p class="flow-setting-item-title">表单权限</p>
          <AuthForm v-model="node.privileges" readable/>
        </div>
      </div>
    </div>
    <FlowDrawerFooter @close="onClose" @save="onSave"/>
  </el-drawer>
</template>
<script setup lang="ts">
import {flowMixin} from '../../mixins/flowMixin';
import FlowDrawerFooter from '../../Common/DrawerFooter.vue';
import EditName from '../../Common/EditName.vue';
import AuthForm from '../../Common/AuthForm.vue';
import {scale} from "../../util/deviceUtil";
import {ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let headerStyle = ref<any>({
  background: 'linear-gradient(90.04deg,#268bfb -16.37%,#33e1ae 137.34%)',
  // 'background-color': '#6da4f2',
  'border-radius': '0px 0px 0 0',
});
const flowDesign = useFlowDesign(piniaInstance);
const afterVisibleChange = (val) => {
  console.log('visible', val);
}
const showDrawer = (snode: any) => {
  console.log(snode);
  visible.value = true;
  node.value = snode;
}
const
    onClose = () => {
      visible.value = false;
      emits('close');
    }
const
    /**
     * 保存配置
     */
    onSave = () => {
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
defineExpose({
  showDrawer
})
</script>
