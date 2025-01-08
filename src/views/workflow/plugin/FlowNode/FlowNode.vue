<script setup lang="ts">
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";

const flowDesign = useFlowDesign(piniaInstance);
const props = defineProps(
    {
      node: {
        type: Object,
        default: function () {
          return {};
        },
      },
      readable: {
        type: Boolean,
        default: false,
      }
    }
);
const selectNode = (node: any, parentNode: any) => {
  flowDesign.activeNode(node);
};
</script>
<template>
  <div class="flow-row-container">
    <component :is="node.type" :node="node" :readable="readable" @selectNode="selectNode"/>
    <FlowNode v-if="node && node.childNode && node.childNode.hasOwnProperty('name')"
              :node="node.childNode"
              :readable="readable"/>
  </div>
</template>
