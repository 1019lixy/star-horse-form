<template>
  <div class="flow-row-container">
    <FlowApproverNode v-if="node && (node.type == 1 || node.type == 6)" :node="node" :readable="readable"/>
    <FlowCopyerNode v-if="node && node.type == 2" :node="node" :readable="readable"/>
    <BranchNode v-if="node && node.type == 4" :node="node" :readable="readable"/>
    <EventNode v-if="node && node.type == 5" :node="node" :readable="readable"/>
    <WriteNode v-if="node && node.type == 0" :node="node" :readable="readable"/>
    <SuggestNode v-if="node && node.type == 7" :node="node" :readable="readable"/>
    <ParallelNode v-if="node && node.type == 9" :node="node" :readable="readable"/>
    <PolymerizeNode v-if="node && node.type == 11" :node="node" :readable="readable"/>
    <NoticeNode v-if="node && node.type == 20" :node="node" :readable="readable"/>
    <FlowNode v-if="node && node.childNode && node.childNode.hasOwnProperty('name')" :node="node.childNode"
              :readable="readable"/>
  </div>
</template>
<script setup lang="ts">
import FlowApproverNode from '@/views/workflow/plugin/FlowNode/ApproverNode.vue';
import FlowCopyerNode from '@/views/workflow/plugin/FlowNode/CopyerNode.vue';
import NoticeNode from '@/views/workflow/plugin/FlowNode/NoticeNode.vue';
import WriteNode from '@/views/workflow/plugin/FlowNode/WriteNode.vue';
import EventNode from '@/views/workflow/plugin/FlowNode/EventNode.vue';
import BranchNode from '@/views/workflow/plugin/FlowNode/BranchNode.vue';
import SuggestNode from '@/views/workflow/plugin/FlowNode/Branch/Suggest.vue';
import PolymerizeNode from '@/views/workflow/plugin/FlowNode/Branch/Polymerize.vue';
import ParallelNode from '@/views/workflow/plugin/FlowNode/Branch/Parallel.vue';
import FlowNode from "@/views/workflow/plugin/FlowNode/FlowNode.vue";

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
</script>
