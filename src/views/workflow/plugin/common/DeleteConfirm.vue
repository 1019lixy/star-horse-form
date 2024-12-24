<template>
  <div v-if="node.deletable" class="node-delete-layer">
    <el-button :size="flowMixin.size" class="node-delete-cancel" text @click.stop="delNode(node, callback)">
      <star-horse-icon icon-class="delete"/>
      删除
    </el-button>
    <el-button :size="flowMixin.size" @click.stop="node.deletable = false" text>
      <star-horse-icon icon-class="cancel"/>
      取消
    </el-button>
  </div>
</template>
<script setup lang="ts">
import {delNode, flowMixin} from "@/views/workflow/plugin/mixins/flowMixin";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

defineOptions({
  name: "DeleteConfirm",
})
defineProps({
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
