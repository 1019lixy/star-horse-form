<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" @click.stop="selectNode">
        <div class="node-name" :class="nameClass(node, 'node-temmi')">
          分隔
          <div v-if="!readable" class="close-icon">
            <star-horse-icon iconClass="close"/>
          </div>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.SUGGEST_NODE" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import {computed,onMounted} from "vue";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {closeLoad} from "@/api/sh_api.ts";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
defineOptions({
  name: 'FlowNodeDivide',
});
const flowDesign = useFlowDesign(piniaInstance);
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
const init=()=>{
  closeLoad();
  flowDesign.refreshMap();
}
onMounted(()=>{
  init();
})
</script>
