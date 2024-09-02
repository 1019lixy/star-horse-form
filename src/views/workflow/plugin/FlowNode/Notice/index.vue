<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': flowMixin.isActive }"
           @click="!readable && open('flowNoticeSetting', node)">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-tz')">
            <EditName v-model="node.name"/>
            <img :src="flowMixin.noticeIcon" alt="" style="margin-left: 10px;"/>
          </div>
          <div class="node-main"><span class="hint-title">设置此节点</span></div>
          <!-- 错误提示 -->
          <a-icon v-if="node.error" type="exclamation-circle" theme="filled" class="node-error"/>
          <div v-if="!readable && !node.deletable" class="close-icon">
            <a-icon type="close-circle" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node.sync="node" :nodeType="5" :readable="readable"/>
    </div>
    <FlowNoticeSetting ref="flowNoticeSetting" @close="flowMixin.isActive = false"/>
  </div>
</template>
<script setup lang="ts">
import {flowMixin, open} from '../../mixins/flowMixin';
import FlowAddNode from '../Add/index.vue';
import FlowNoticeSetting from '../../FlowDrawer/Notice/index.vue';
import EditName from '../../Common/EditName.vue';
import DeleteConfirm from '../../Common/DeleteConfirm.vue';
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
