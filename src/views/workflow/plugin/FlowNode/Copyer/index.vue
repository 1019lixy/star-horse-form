<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': flowMixin.isActive }"
           @click="!readable && open(flowCopyerSettingRef, node)">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-cc')">
            <EditName v-model="node.name"/>
            <div class="search-input el-input" style="display: none;">
              <input type="text" autocomplete="off" id="1460664942574174208" class="el-input__inner"/>
            </div>
            <img :src="flowMixin.ccIcon" alt="" style="margin-left: 10px;"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              抄送人:
              <el-tooltip placement="top">
                <template slot="title">
                  <span>{{ node.content }}</span>
                </template>
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">设置此节点</span>
          </div>
          <!-- 错误提示 -->
          <star-horse-icon v-if="node.error" iconClass="exclamation-circle" theme="filled" class="node-error"/>
          <div v-if="!readable && !node.deletable" class="close-icon">
            <star-horse-icon  iconClass="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node.sync="node" :nodeType="2" :readable="readable"/>
    </div>
    <FlowCopyerSetting ref="flowCopyerSettingRef" @close="flowMixin.isActive = false"/>
  </div>
</template>
<script setup lang="ts">
import {flowMixin, open,} from '@/views/workflow/plugin/mixins/flowMixin';
import FlowAddNode from '../Add/index.vue';
import FlowCopyerSetting from '../../FlowDrawer/Copyer/index.vue';
import EditName from '@/views/workflow/plugin/Common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/Common/DeleteConfirm.vue';
import {computed,ref} from "vue";
const flowCopyerSettingRef=ref();
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
