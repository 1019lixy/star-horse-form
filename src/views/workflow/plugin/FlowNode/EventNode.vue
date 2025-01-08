<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id==node.id }" @click.stop="selectNode">
        <div class="node-name" :class="nameClass(node, 'node-temmi')">
          {{ node.name }}
          <div v-if="!readable" class="close-icon">
            <star-horse-icon iconClass="close" @click.stop="delNode(node)"/>
          </div>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import {delNode} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import {computed, onMounted, ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {closeLoad} from "@/api/sh_api.ts";

defineOptions({
  name: 'FlowNodeEvent',
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
  }
});
const emits=defineEmits(['selectNode']);
const selectNode = () => {
  emits('selectNode',props.node);
}
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
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
}
onMounted(() => {
  init();
})
</script>
