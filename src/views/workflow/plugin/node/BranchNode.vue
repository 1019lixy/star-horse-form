<script setup lang="ts">
import {addBranch} from '@/views/workflow/plugin/utils/flowCommon.ts';
import FlowNode from '@/views/workflow/plugin/node/FlowNode.vue';
import FlowAddNode from '@/views/workflow/plugin/node/AddNode.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, onMounted} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {closeLoad} from "@/api/sh_api.ts";

defineOptions({
  name: 'FlowNodeBranch',
});
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

const emits = defineEmits(['selectNode']);
const selectNode = (node: any) => {
  emits('selectNode', node, props.node);
}
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
}
onMounted(() => {
  init();
})
</script>
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
            <!-- 其他情况不支持配置 -->
            <div class="flow-item flow-node-branch"
                 :class="{ 'flow-item-active': currentNode.id==conditionNode.id }"
                 @click.stop="!readable && node.conditionNodes.length - 1 != index && selectNode(conditionNode)">
              <div class="flow-node-box" :class="{ 'has-error': conditionNode.error }">
                <div class="node-name">
                  <EditName v-model:nodeName="conditionNode.name"
                            @edit="(showPriorityLevel) => (conditionNode.attr.showPriorityLevel = showPriorityLevel)"/>
                  <div class="node-name-level" v-if="conditionNode.attr.showPriorityLevel">
                    优先{{ conditionNode.attr.priorityLevel }}
                  </div>
                  <star-horse-icon icon-class="branch_node" style="margin-left: 5px"/>
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
                <!-- 删除按钮,其他情况不支持删除 -->
                <div v-if="!readable && !conditionNode.deletable && node.conditionNodes.length - 1 != index"
                     class="close-icon">
                  <star-horse-icon iconClass="close" @click.stop="conditionNode.deletable = true"/>
                </div>
                <!-- 删除提示 -->
                <DeleteConfirm :node="conditionNode"/>
              </div>
            </div>
            <FlowAddNode :node="node" :nodeType="FlowNodeEnums.BRANCH_CONDITION_NODE" :id="conditionNode.id"
                         :readable="readable"/>
          </div>
        </div>
        <FlowNode v-if="conditionNode.childNode && conditionNode.childNode.hasOwnProperty('name')"
                  :node="conditionNode.childNode" :readable="readable"/>
      </div>
    </div>
    <div class="after-branch-btn">
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.BRANCH_NODE" :readable="readable"/>
    </div>
  </div>
</template>
