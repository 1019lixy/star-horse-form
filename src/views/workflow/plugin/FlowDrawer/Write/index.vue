<template>
  <a-drawer
      :width="scale.isMobile() ? '100%' : '40%'"
      :headerStyle="headerStyle"
      :bodyStyle="flowMixin.bodyStyle"
      placement="right"
      :closable="true"
      :visible="visible"
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
  </a-drawer>
</template>
<script setup lang="ts">
import {flowMixin} from '../../mixins/flowMixin';
import FlowDrawerFooter from '../../Common/DrawerFooter.vue';
import EditName from '../../Common/EditName.vue';
import AuthForm from '../../Common/AuthForm.vue';
import {scale} from "../../util/deviceUtil";
import {ref} from "vue";

const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let headerStyle = ref<any>({
  background: 'linear-gradient(90.04deg,#268bfb -16.37%,#33e1ae 137.34%)',
  // 'background-color': '#6da4f2',
  'border-radius': '0px 0px 0 0',
});
const afterVisibleChange=(val)=>
{
  console.log('visible', val);
}
const showDrawer=(snode)=>
{
  visible.value = true;
  node.value = snode;
}
const
onClose=()=>
{
  visible.value = false;
  emits('close');
}
const
/**
 * 保存配置
 */
onSave=()=>
{
  // 更新节点显示信息
  if (node.value.privileges && node.value.privileges.length > 0) {
    store.dispatch('flow/updateNode', {currNode: node.value, field: 'content', value: '已设置'});
    store.dispatch('flow/updateNode', {currNode: node.value, field: 'error', value: false});
    onClose();
  } else {
    store.dispatch('flow/updateNode', {currNode: node.value, field: 'content', value: null});
    store.dispatch('flow/updateNode', {currNode: node.value, field: 'error', value: false});
  }
}
</script>
