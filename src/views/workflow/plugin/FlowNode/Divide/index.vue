<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item">
        <div class="node-name" :class="nameClass(node, 'node-temmi')">
          分隔
          <div v-if="!readable" class="close-icon">
            <star-horse-icon  iconClass="close"/>
          </div>
        </div>
      </div>
      <FlowAddNode :node.sync="node" :nodeType="7" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '@/views/workflow/plugin/mixins/flowMixin';
import FlowAddNode from '../Add/index.vue';
import {computed} from "vue";

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
</script>
