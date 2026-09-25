<template>
  <div class="flow-row">
    <div class="flow-box">
      <div class="flow-item"  @click.stop="selectNode">
        <div class="node-name node-start">开始</div>
      </div>
      <AddNode
        :node="node"
        :nodeType="FlowNodeEnums.START_NODE"
        :readable="readable"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { FlowNodeEnums } from "@/components/workflow/enums/FlowNodeEnums";
import AddNode from "@/components/workflow/designer/nodes/AddNode.vue";
defineOptions({
  name: "StartNode",
});
const props = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
  readable: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(["selectNode"]);
const selectNode = () => {
  emits("selectNode", props.node);
};
</script>
