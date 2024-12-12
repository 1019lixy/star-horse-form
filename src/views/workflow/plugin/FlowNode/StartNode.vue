<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item">
        <div class="node-name node-start">开始</div>
      </div>
      <FlowAddNode :node="node" :nodeType="0" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
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

</script>
