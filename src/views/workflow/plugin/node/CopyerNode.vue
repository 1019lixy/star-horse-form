<script setup lang="ts">
import FlowAddNode from '@/views/workflow/plugin/node/AddNode.vue';
import EditName from '@/views/workflow/plugin/common/EditName.vue';
import DeleteConfirm from '@/views/workflow/plugin/common/DeleteConfirm.vue';
import {computed, onMounted} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {FlowNodeEnums} from "@/views/workflow/plugin/enums/FlowNodeEnums.ts";
import {closeLoad} from "@/api/sh_api.ts";

defineOptions({
  name: 'CopyerNode',
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
          <div class="node-name" :class="nameClass(node, 'node-cc')">
            <EditName v-model:nodeName="node.name"/>
            <div class="search-input el-input" style="display: none;">
              <el-input type="text" autocomplete="off"/>
            </div>
            <star-horse-icon icon-class="copy_node" style="margin-left: 10px"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              抄送人:
              <el-tooltip placement="top" :content="node.content">
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">设置此节点</span>
          </div>
          <!-- 错误提示 -->
          <star-horse-icon v-if="node.error" iconClass="exclamation-circle" theme="filled" class="node-error"/>
          <div v-if="!readable && !node.deletable" class="close-icon">
            <star-horse-icon iconClass="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="FlowNodeEnums.COPYER_NODE" :readable="readable"/>
    </div>
  </div>
</template>
