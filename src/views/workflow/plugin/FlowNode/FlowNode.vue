<script setup lang="ts">
defineProps(
    {
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
    }
);
</script>
<template>
  <div class="flow-row-container">

    <component :is="node.type" :node="node" :readable="readable"/>
    <FlowNode v-if="node && node.childNode && node.childNode.hasOwnProperty('name')"
              :node="node.childNode"
              :readable="readable"/>
  </div>
</template>
