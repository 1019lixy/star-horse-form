<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id==node.id }"
           @click="!readable && open(flowEventSettingRef, node)">
        <div class="node-name" :class="nameClass(node, 'node-temmi')">
          {{ node.name }}
          <div v-if="!readable" class="close-icon">
            <star-horse-icon iconClass="close" @click.stop="delNode(node)"/>
          </div>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
    <FlowEventSetting ref="flowEventSettingRef" @close="close"/>
  </div>
</template>
<script setup lang="ts">
import {close, delNode, open} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import FlowEventSetting from '@/views/workflow/plugin/FlowDrawer/EventPrep.vue';
import {computed, ref,onMounted} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {closeLoad} from "@/api/sh_api.ts";
defineOptions({
  name: 'FlowNodeEvent',
});
const flowEventSettingRef = ref();
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
onMounted(()=>{
  closeLoad();
})
</script>
