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
import FlowApproverNode from './Approver/index.vue';
import FlowCopyerNode from './Copyer/index.vue';
import NoticeNode from './Notice/index.vue';
import WriteNode from './Write/index.vue';
import EventNode from './Event/index.vue';
import BranchNode from './Branch/index.vue';
import SuggestNode from './Branch/Suggest.vue';
import PolymerizeNode from './Branch/Polymerize.vue';
import ParallelNode from './Branch/Parallel.vue';
import FlowNode from "./index.vue";

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
