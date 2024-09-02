<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': flowMixin.isActive }" @click="!readable && open(flowEventSettingRef, node)">
        <div class="node-name" :class="nameClass(node, 'node-temmi')">
          事件
          <div v-if="!readable" class="close-icon"><star-horse-icon  iconClass="close" @click.stop="delNode(node)" /></div>
        </div>
      </div>
      <FlowAddNode :node.sync="node" :nodeType="5" :readable="readable" />
    </div>
    <FlowEventSetting ref="flowEventSettingRef" @close="flowMixin.isActive = false" />
  </div>
</template>
<script setup lang="ts">
  import { flowMixin,delNode,open } from '../../mixins/flowMixin';
  import FlowAddNode from '../Add/index.vue';
  import FlowEventSetting from '../../FlowDrawer/Event/index.vue';
  import {computed,ref} from "vue";
  const flowEventSettingRef=ref();
  const props=defineProps({
    node: {
      type: Object,
      default: function() {
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
