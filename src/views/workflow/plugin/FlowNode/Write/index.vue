<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': flowMixin.isActive }"
           @click="!readable && open(flowWriteSettingRef, node)">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-fill')">
            <EditName v-model:nodeName="node.name"/>
            <img :src="flowMixin.writeIcon" style="margin-left: 10px;"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              表单权限:
              <el-tooltip placement="top">
                <template slot="title">
                  <span>{{ node.content }}</span>
                </template>
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">默认表单全可编辑</span>
          </div>
          <!-- 错误提示 -->
          <star-horse-icon v-if="node.error" icon-class="exclamation-circle" theme="filled" class="node-error"/>
          <!-- 只有是填写节点才能删除，发起节点不能删除 -->
          <div v-if="!readable && !node.deletable && node.type == 6" class="close-icon">
            <star-horse-icon icon-class="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="6" :readable="readable"/>
    </div>
    <FlowWriteSetting ref="flowWriteSettingRef" @close="flowMixin.isActive = false"/>
  </div>
</template>
<script setup lang="ts">
import {flowMixin, open} from '@/views/workflow/plugin/mixins/flowMixin';
import FlowAddNode from '../Add/index.vue';
import FlowWriteSetting from '../../FlowDrawer/Write/index.vue';
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/Common/DeleteConfirm.vue';
import {computed, ref} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

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
const flowWriteSettingRef = ref();
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
