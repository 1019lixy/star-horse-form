<template>
  <div class="flow-row">
    <div class="flow-branch">
      <div class="branch-node" @click="!readable && addBranch(node)">
        <el-button icon="plus">添加分支</el-button>
      </div>
      <div class="meet-node"></div>
      <div class="flow-col" v-for="(conditionNode, index) in node.conditionNodes" :key="conditionNode.id">
        <div class="clear-left-border" v-if="index == 0"></div>
        <div class="clear-right-border" v-if="node.conditionNodes.length - 1 == index"></div>
        <div class="flow-row">
          <div class="flow-box">
            <div
              class="flow-item flow-node-branch"
              :class="{ 'flow-item-active': currentNode.id == node.id }"
              @click.stop="!readable && selectNode(conditionNode)"
            >
              <div class="flow-branch-suggest" :class="{ 'has-error': conditionNode.error }">
                <div class="node-name">
                  <EditName :node="conditionNode" style="width: 90%" />
                  <star-horse-icon icon-class="parallel_node" style="margin-left: 10px" />
                </div>
                <!-- 错误提示 -->
                <star-horse-icon
                  v-if="conditionNode.error"
                  icon-class="exclamation-circle"
                  theme="filled"
                  class="node-error"
                />
                <div v-if="!readable && !conditionNode.deletable" class="close-icon">
                  <star-horse-icon iconClass="close" @click.stop="conditionNode.deletable = true" />
                </div>
                <!-- 删除提示 -->
                <DeleteConfirm :node="conditionNode" />
              </div>
            </div>
            <FlowAddNode
              :node="node"
              :nodeType="FlowNodeEnums.BRANCH_CONDITION_NODE"
              :id="conditionNode.id"
              :readable="readable"
            />
          </div>
        </div>
        <FlowNode
          v-if="conditionNode.childNode && conditionNode.childNode.hasOwnProperty('name')"
          :node="conditionNode.childNode"
          :readable="readable"
        />
      </div>
    </div>
    <div class="after-branch-btn">
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { addBranch } from "@/views/workflow/plugin/utils/flowCommon.ts";
  import FlowNode from "@/views/workflow/plugin/node/FlowNode.vue";
  import FlowAddNode from "@/views/workflow/plugin/node/AddNode.vue";
  import EditName from "@/views/workflow/plugin/common/EditName.vue";
  import DeleteConfirm from "@/views/workflow/plugin/common/DeleteConfirm.vue";
  import { computed, onMounted } from "vue";
  import { useFlowDesignStore } from "@/store/FlowDesign.ts";
  import {piniaInstance} from "star-horse-lowcode";
  import { FlowNodeEnums } from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
  import { closeLoad } from "star-horse-lowcode";
  import { warning } from "star-horse-lowcode";

  const flowDesign = useFlowDesignStore(piniaInstance);
  let currentNode = computed(() => flowDesign.currentNode);
  const props = defineProps({
    node: {
      type: Object,
      default: function () {
        return {};
      }
    },
    readable: {
      type: Boolean,
      default: false
    }
  });
  const emits = defineEmits(["selectNode"]);
  const selectNode = (node: any) => {
    warning("并行节点无需编辑");
    // emits('selectNode', node, props.node);
  };
  const init = () => {
    closeLoad();
    flowDesign.refreshMap();
  };
  onMounted(() => {
    init();
  });
</script>
