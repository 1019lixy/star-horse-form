<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id==node.id }"
           @click="!readable && open(flowApproverSettingRef, node)">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, node.type == 1 ? 'node-sp' : 'node-transact')">
            <EditName v-model:nodeName="node.name"/>
            <star-horse-icon icon-class="audit_node" style="margin-left: 10px"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              {{ node.type == 1 ? '审批人' : '办理人' }}:
              <el-tooltip placement="top">
                <template v-slot:title>
                  <span>{{ node.content }}</span>
                </template>
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">设置此节点</span>
          </div>
          <!-- 错误提示 -->
          <star-horse-icon v-if="node.error" iconClass="exclamation-circle" theme="filled" class="node-error"/>
          <div v-if="!readable && !node.deletable" class="close-icon">
            <star-horse-icon iconClass="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- <div class="flow-node-toolbar">
            <star-horse-icon iconClass="copy" @click.stop="node.deletable = true" />
          </div> -->
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <!-- 如果子节点是意见分支,则只能添加一个意见分支 -->
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
    <FlowApproverSetting ref="flowApproverSettingRef" @close="flowMixin.isActive = false"/>
  </div>
</template>
<script setup lang="ts">
import {flowMixin, open} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import FlowApproverSetting from '@/views/workflow/plugin/FlowDrawer/ApproverPrep.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
defineOptions({
  name: 'FlowNodeApprover',
});
const flowApproverSettingRef = ref();
const flowDesign = useFlowDesign(piniaInstance);
let currentNode = computed(() => flowDesign.currentNode);
const props = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  readable: {
    type: Boolean,
    default: false,
  },
});
let nameClass = computed(() => {
  return (node, defaultStyle) => {
    if (node.status == -1) {
      return defaultStyle;
    }
    return {
      'node-status-not': node.status == 0,
      'node-status-current': node.status == 1,
      'node-status-complete': node.status == 2
    };
  };
});
let deleteable = ref<boolean>(false);
</script>
