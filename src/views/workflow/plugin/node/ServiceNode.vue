<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item" :class="{ 'flow-item-active': currentNode.id == node.id }" @click.stop="selectNode">
        <div class="flow-node-box" :class="{ 'has-error': node.error }">
          <div class="node-name" :class="nameClass(node, 'node-task')">
            <EditName :node="node"/>
            <star-horse-icon icon-class="task" style="margin-left: 10px"/>
          </div>
          <div class="node-main">
            <span v-if="node.content">
              执行类型:
              <el-tooltip placement="top" :content="node.content">
                {{ node.content }}
              </el-tooltip>
            </span>
            <span v-else class="hint-title">配置此节点</span>
          </div>
          <!-- 错误提示 -->
          <el-tooltip :content="node.errorMsg" placement="top" v-if="node.error">
            <star-horse-icon icon-class="exclamation-circle" theme="filled" class="node-error"/>
          </el-tooltip>
          <!-- 只有是填写节点才能删除，发起节点不能删除 -->
          <div v-if="!readable && !node.deletable" class="close-icon">
            <star-horse-icon icon-class="close" @click.stop="node.deletable = true"/>
          </div>
          <!-- 删除提示 -->
          <DeleteConfirm :node="node"/>
        </div>
      </div>
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import {closeLoad, piniaInstance} from "star-horse-lowcode";

defineOptions({
  name: "ServiceNode"
});
const flowDesign = useFlowDesignStore(piniaInstance);
let currentNode = computed(() => flowDesign.currentNode);
const props = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    }
  },
  readable: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(["selectNode"]);
props.node.error = computed(() => {
  let flag = false;
  let msg = "";

  if (!props.node.executionListeners) {
    flag = true;
    msg += "未配置执行器\n";
  }
  props.node.executionListeners?.forEach((item: any) => {
    if (!item.implementationType) {
      flag = true;
      msg += "未配置执行器类型\n";
    }
    if (!item.implementation) {
      flag = true;
      msg += "执行器未配置参数\n";
    }
  });
  props.node.errorMsg = msg;
  return flag;
});
const selectNode = () => {
  emits("selectNode", props.node);
};
let nameClass = computed(() => {
  return (node: any, defaultStyle: string) => {
    if (node.statusCode == -1) {
      return defaultStyle;
    }
    return {
      "node-status-not": node.statusCode == 0,
      "node-status-current": node.statusCode == 1,
      "node-status-complete": node.statusCode == 2
    };
  };
});
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
};
onMounted(() => {
  init();
});
</script>
