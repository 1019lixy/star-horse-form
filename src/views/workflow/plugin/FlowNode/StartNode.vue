<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" @click.stop="selectNode">
        <div class="node-name node-start">开始</div>
      </div>
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.WRITE_NODE" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
defineOptions({
  name: 'FlowNodeStart',
});
const props = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  readable: {
    type: Boolean,
    default: true,
  }
});
const emits=defineEmits(['selectNode']);
const selectNode = () => {
  emits('selectNode',props.node);
}
</script>
