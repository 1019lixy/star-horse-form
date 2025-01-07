<template>
  <el-drawer
      v-if="node.approveGroups"
      :width="scale.isMobile() ? '100%' : '40%'"
      :headerStyle="headerStyle"
      :bodyStyle="flowMixin.bodyStyle"
      placement="right"
      :closable="true"
      v-model="visible"
      :after-visible-change="afterVisibleChange"
      @close="onClose"
  >
    <template #header>
      <div class="drawer-header">
        <star-horse-icon icon-class="copy_node" color="#fff" style="margin-left: 10px"/>
        <span class="flow-drawer-title">
        <EditName v-model:nodeName="node.name"/>
      </span>
      </div>
    </template>
    <div class="flow-setting-module">
      <el-tabs v-model="copyerTab">
        <el-tab-pane key="1" name="1" label="抄送设置">
          <div class="flow-setting-content">
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">抄送人</p>
              <FlowNodeApproval :groups="node.approveGroups" :node="node" title="抄送人"/>
            </div>
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">提示：</p>
              <div class="hint-info">
                <p>抄送的人数最多支持100人以内</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="2" name="2" label="表单权限">
          <div class="flow-setting-content">
            <div class="flow-setting-item">
              <p class="flow-setting-item-title">表单权限</p>
              <AuthForm v-model="node.privileges"/>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane key="3" name="3" label="高级设置">
          <FlowNodeCopyerConfigure v-model="node.configure"/>
        </el-tab-pane>
      </el-tabs>
    </div>
    <FlowDrawerFooter @close="onClose" @save="onSave"/>
  </el-drawer>
</template>
<script setup lang="ts">
import {ref} from "vue";
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import AuthForm from '@/views/workflow/plugin/common/AuthForm.vue';
import FlowNodeApproval from '@/views/workflow/plugin/FlowDrawer/Approver/Approval.vue';
import FlowNodeCopyerConfigure from '@/views/workflow/plugin/FlowDrawer/Copyer/CopyerConfigure.vue';
import {scale} from "@/views/workflow/plugin/util/deviceUtil.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

defineOptions({
  name: 'CopyerPrep',
})
const emits = defineEmits(["close"]);
let node = ref<any>({});
let visible = ref<boolean>(false);
let copyerTab = ref<string>("1");
let headerStyle = ref<any>({
  background: 'linear-gradient(90.04deg,#268bfb -16.37%,#33e1ae 137.34%)',
  // 'background-color': '#6da4f2',
  'border-radius': '0px 0px 0 0',
});
const flowDesign = useFlowDesign(piniaInstance);
const afterVisibleChange = (val:any) => {
  console.log('visible', val);
}
const showDrawer = (snode:any) => {
  visible.value = true;
  node.value = snode;
}
const onClose = () => {
  visible.value = false;
  emits('close');
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  let content = '';
  node.value.approveGroups.forEach((group:any) => {
    if (group.approverNames.length > 0) {
      content += group.approverNames.join(',');
    }
    if (content) {
      content += ',';
    }
  });
  if (!content && node.value.customCc) {
    //  是否设置发起人填写
    content += '发起人填写';
  }
  if (content) {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: content});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: false});
  } else {
    flowDesign.flowUpdateNode({currNode: node.value, field: 'content', value: null});
    flowDesign.flowUpdateNode({currNode: node.value, field: 'error', value: true});
  }
  onClose();
}
defineExpose({
  showDrawer
})
</script>
