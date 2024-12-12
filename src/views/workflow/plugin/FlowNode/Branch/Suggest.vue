<template>
  <div class="flow-row">
    <div class="flow-branch">
      <div class="meet-node"></div>
      <div class="flow-col" v-for="(conditionNode, index) in node.conditionNodes" :key="index">
        <div class="clear-left-border" v-if="index == 0"></div>
        <div class="clear-right-border" v-if="node.conditionNodes.length - 1 == index"></div>
        <div class="flow-row">
          <div class="flow-box">
            <div class="flow-item flow-node-branch">
              <div class="flow-branch-suggest">
                <div class="node-name">
                  <span>{{ conditionNode.name }}</span>
                  <span style="margin-left: 10px;">
                    <star-horse-icon v-if="index == 0" icon-class="check-circle" theme="filled" style="color: green;"/>
                    <star-horse-icon v-if="node.conditionNodes.length - 1 == index" icon-class="close" theme="filled"
                                     style="color: red;"/>
                  </span>
                </div>
                <div v-if="!readable && !conditionNode.deletable" class="close-icon">
                  <star-horse-icon iconClass="close" @click.stop="conditionNode.deletable = true"/>
                </div>
                <!-- 删除提示 -->
                <DeleteConfirm :node="conditionNode" @callback="delCallback"/>
              </div>
            </div>
            <FlowAddNode :node="node" :nodeType="3" :id="conditionNode.id" :readable="readable"/>
          </div>
        </div>
        <FlowNode v-if="conditionNode.childNode && conditionNode.childNode.hasOwnProperty('name')"
                  :node="conditionNode.childNode" :readable="readable"/>
      </div>
    </div>
    <div class="after-branch-btn">
      <FlowAddNode :node="node" :nodeType="4" :readable="readable"/>
    </div>
    <FlowBranchSetting ref="flowBranchSetting" @close="close"/>
  </div>
</template>
<script setup lang="ts">
import {close} from '@/views/workflow/plugin/mixins/flowMixin';
import FlowNode from '@/views/workflow/plugin/FlowNode/FlowNode.vue';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import FlowBranchSetting from '@/views/workflow/plugin/FlowDrawer/BranchPrep.vue';
import DeleteConfirm from '@/views/workflow/plugin/Common/DeleteConfirm.vue';
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

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
const flowDesign = useFlowDesign(piniaInstance);
const delCallback = (_conditionNode: any) => {
  let currNode = {
    id: props.node.pid,
  };
  // 将对应的审批节点的添加按钮开启
  flowDesign.flowUpdateNode({currNode, field: 'addable', value: true});
};
</script>
