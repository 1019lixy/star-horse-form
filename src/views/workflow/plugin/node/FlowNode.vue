<script setup lang="ts">
import {useFlowDesignStore} from "@/store/FlowDesign.ts";
import {piniaInstance} from "star-horse-lowcode";

const flowDesign = useFlowDesignStore(piniaInstance);
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
/**
 * 选中节点
 * @param node
 * @param parentNode
 */
const selectNode = (node: any, parentNode: any) => {
  flowDesign.activeNode(node);
  flowDesign.setParentNode(parentNode);
};
</script>
<template>
  <div class="flow-row-container">
    <component :is="node.type" :key="node.id" :node="node" :readable="readable" @selectNode="selectNode"/>
    <FlowNode
        v-if="node && node.childNode && node.childNode.hasOwnProperty('name')"
        :node="node.childNode"
        :readable="readable"
    />
  </div>
</template>
