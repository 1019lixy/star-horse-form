<template>
  <div v-if="node.deletable" class="node-delete-layer">
    <el-button :size="flowMixin.size" class="ant-btn-ghost node-delete-cancel" @click.stop="delNode(node, callback)">删除
    </el-button>
    <el-button :size="flowMixin.size" @click.stop="node.deletable = false">取消</el-button>
  </div>
</template>
<script setup lang="ts">

import {delNode, flowMixin} from "@/views/workflow/plugin/mixins/flowMixin";

const pops = defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emits = defineEmits(["callback"]);
const callback = () => {
  emits("callback");
}

</script>
