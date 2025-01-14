<template>
  <div class="flow-module">
    <el-tabs v-model="copyerTab">
      <el-tab-pane key="1" name="1" label="抄送设置">
        <div class="flow-content">
          <div class="flow-item">
            <p class="flow-item-title">抄送人</p>
            <FlowNodeApproval :groups="node.approveGroups" :node="node" title="抄送人"/>
          </div>
          <div class="flow-item">
            <p class="flow-item-title">提示：</p>
            <div class="hint-info">
              <p>抄送的人数最多支持100人以内</p>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane key="2" name="2" label="表单权限">
        <div class="flow-content">
          <div class="flow-item">
            <p class="flow-item-title">表单权限</p>
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
</template>
<script setup lang="ts">
import {ref} from "vue";
import FlowDrawerFooter from '@/views/workflow/plugin/common/DrawerFooter.vue';
import AuthForm from '@/views/workflow/plugin/common/AuthForm.vue';
import FlowNodeApproval from '@/views/workflow/plugin/preps/utils/Approval.vue';
import FlowNodeCopyerConfigure from '@/views/workflow/plugin/preps/utils/CopyerConfigure.vue';
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {ModelRef} from "vue-demi";

defineOptions({
  name: 'CopyerPrep',
})
let node: ModelRef<any> = defineModel("activeData");
let copyerTab = ref<string>("1");

const flowDesign = useFlowDesign(piniaInstance);
const onClose = () => {
  flowDesign.setActive(false);
}
/**
 * 保存配置
 */
const onSave = () => {
  // 更新节点显示信息
  let content = '';
  node.value.approveGroups.forEach((group: any) => {
    if (Array.isArray(group.approverNames) && group.approverNames.length > 0) {
      content += group.approverNames.join(',');
    } else {
      content += group.approverNames;
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

</script>
