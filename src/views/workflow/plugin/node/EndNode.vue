<template>
  <div class="flow-row">
    <div class="flow-end-box">
      <div class="flow-item" @click.stop="selectNode">
        <div class="flow-end">结束</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'FlowNodeEnd',
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
    default: false,
  }
});

const emits = defineEmits(['selectNode']);
const selectNode = () => {
  emits('selectNode', props.node);
};
</script>
