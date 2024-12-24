<template>
  <div class="flow-row">
    <div class="flow-branch">
      <div class="branch-node" @click="!readable && addBranch(node)">
        <el-button icon="plus">添加条件</el-button>
      </div>
      <div class="meet-node"></div>
      <div class="flow-col" v-for="(conditionNode, index) in node.conditionNodes" :key="conditionNode.id">
        <div class="clear-left-border" v-if="index == 0"></div>
        <div class="clear-right-border" v-if="node.conditionNodes.length - 1 == index"></div>
        <div class="flow-row">
          <div class="flow-box">
            <div class="flow-item flow-node-branch" :class="{ 'flow-item-active': currentNode.id==node.id }"
                 @click="!readable && open(flowBranchSettingRef, conditionNode)">
              <div class="flow-node-box" :class="{ 'has-error': conditionNode.error }">
                <div class="node-name">
                  <EditName v-model:nodeName="conditionNode.name"/>
                  <star-horse-icon icon-class="parallel_node" style="margin-left: 10px"/>
                </div>
                <div class="node-main">
                  <span v-if="conditionNode.content">
                    <el-tooltip placement="top" :content="conditionNode.content">
                      {{ conditionNode.content }}
                    </el-tooltip>
                  </span>
                  <span v-else class="hint-title">配置筛选条件</span>
                </div>
                <!-- 错误提示 -->
                <star-horse-icon v-if="conditionNode.error" icon-class="exclamation-circle" theme="filled"
                                 class="node-error"/>
                <div v-if="!readable && !conditionNode.deletable" class="close-icon">
                  <star-horse-icon iconClass="close" @click.stop="conditionNode.deletable = true"/>
                </div>
                <!-- 删除提示 -->
                <DeleteConfirm :node="conditionNode"/>
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
      <!-- <FlowAddNode :node="node" :nodeType="4" :read="read" /> -->
    </div>
    <FlowBranchSetting ref="flowBranchSettingRef" @close="close"/>
  </div>
</template>
<script setup lang="ts">
import {addBranch, close, flowMixin, open} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowNode from '@/views/workflow/plugin/FlowNode/FlowNode.vue';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import FlowBranchSetting from '@/views/workflow/plugin/FlowDrawer/BranchPrep.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, ref} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const flowBranchSettingRef = ref();
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
</script>
