<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id==node.id }"
           @click="!readable && open(flowWriteSettingRef, node)">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-fill')">
            <EditName v-model:nodeName="node.name"/>
            <star-horse-icon icon-class="edit_node" style="margin-left: 10px"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              表单权限:
              <el-tooltip placement="top">
                <template #content>
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
          <div v-if="!readable && !node.deletable&&node.type==FlowNodeEnums.APPLY_NODE " class="close-icon">
            <star-horse-icon icon-class="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.APPLY_NODE" :readable="readable"/>
    </div>
    <FlowWriteSetting ref="flowWriteSettingRef" @close="close"/>
  </div>
</template>
<script setup lang="ts">
import {close, open} from '@/views/workflow/plugin/mixins/flowMixin.ts';
import FlowAddNode from '@/views/workflow/plugin/FlowNode/AddNode.vue';
import FlowWriteSetting from '@/views/workflow/plugin/FlowDrawer/WritePrep.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, onMounted, ref} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {closeLoad} from "@/api/sh_api.ts";

defineOptions({
  name: 'FlowNodeWrite',
});
const flowDesign = useFlowDesign(piniaInstance);
let currentNode = computed(() => flowDesign.currentNode);
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
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
}
onMounted(() => {
  init();
})
</script>
