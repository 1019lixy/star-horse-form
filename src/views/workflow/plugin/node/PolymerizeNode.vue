<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item flow-node-branch" @click.stop="selectNode">
        <div class="flow-branch-suggest">
          <div class="node-name">
            <EditName :node="node" style="width: 90%"/>
            <star-horse-icon icon-class="parallel_node" style="margin-left: 10px"/>
          </div>
        </div>
      </div>
      <!-- 如果子节点是意见分支,则只能添加一个意见分支 -->
      <FlowAddNode :node="node" :nodeType="node.type" :readable="readable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted} from "vue";
import {closeLoad, piniaInstance, warning} from "star-horse-lowcode";
import {useFlowDesignStore} from "@/store/FlowDesign";

const flowDesign = useFlowDesignStore(piniaInstance);
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
const selectNode = () => {
  warning("聚合节点无需编辑");
  // emits('selectNode',props.node);
};
const init = () => {
  closeLoad();
  flowDesign.refreshMap();
};
onMounted(() => {
  init();
});
</script>
