<template>
  <div v-if="node.deletable" class="node-delete-layer">
    <a-button :size="flowMixin.size" class="ant-btn-ghost node-delete-cancel" @click.stop="delNode(node, callback)">删除
    </a-button>
    <a-button :size="flowMixin.size" @click.stop="node.deletable = false">取消</a-button>
  </div>
</template>
<script setup lang="ts">

import {delNode, flowMixin} from "../mixins/flowMixin";

const pops = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emits=defineEmits(["callback"]);
const callback=()=>{
  emits("callback");
}

</script>
