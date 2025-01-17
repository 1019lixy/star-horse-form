<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/node/AddNode.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, onMounted} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {closeLoad} from "@/api/sh_api.ts";

defineOptions({
  name: 'ApplyNode',
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
props.node.error = computed(() => {
  let flag = !props.node.formId;
  props.node.errorMsg = flag ? "未配置表单" : "";
  return flag;
});
const emits = defineEmits(['selectNode']);
const selectNode = () => {
  emits('selectNode', props.node);
}
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
<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id==node.id }" @click.stop="selectNode">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-fill')">
            <EditName v-model:nodeName="node.name"/>
            <star-horse-icon icon-class="edit_node" style="margin-left: 10px"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              表单权限:
              <el-tooltip placement="top" :content="node.content">
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">默认表单全可编辑</span>
          </div>
          <!-- 错误提示 -->
          <el-tooltip :content="node.errorMsg" placement="top" v-if="node.error">
            <star-horse-icon icon-class="exclamation-circle" theme="filled" class="node-error"/>
          </el-tooltip>
          <!-- 只有是填写节点才能删除，发起节点不能删除 -->
          <div v-if="!readable && !node.deletable&&node.type==FlowNodeEnums.START_NODE " class="close-icon">
            <star-horse-icon icon-class="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.APPLY_NODE" :readable="readable"/>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.node-name {
  &:before {
    content: "";
    top: 0 !important;
    left: 0 !important;
    width: 0 !important;
    border-style: unset !important;
    transform: unset !important;
    background-color: unset !important;
    border-color: unset !important;
    border-width: unset !important;
  }
}
</style>
