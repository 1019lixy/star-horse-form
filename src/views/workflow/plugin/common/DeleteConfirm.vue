<template>
  <div v-if="node.deletable" class="node-delete-layer">
    <el-button :size="flowCommon.size" type="danger" @click.stop="delNode(node, callback)">
      <star-horse-icon icon-class="delete"/>
      删除
    </el-button>
    <el-button :size="flowCommon.size" @click.stop="node.deletable = false" type="info">
      <star-horse-icon icon-class="cancel"/>
      取消
    </el-button>
  </div>
</template>
<script setup lang="ts">
import {delNode, flowCommon} from '@/views/workflow/plugin/utils/flowCommon.ts';
import StarHorseIcon from '@/components/comp/StarHorseIcon.vue';

defineOptions({
  name: 'DeleteConfirm',
});
defineProps({
  node: {
    type: Object,
    default: function () {
      return {};
    },
  },
});
const emits = defineEmits(['callback']);
const callback = () => {
  emits('callback');
};

</script>
