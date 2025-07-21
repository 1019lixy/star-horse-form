<script setup lang="ts">
defineOptions({
  name: 'PageCalendarItem',
});
defineProps({
  width: {
    type: String,
    default: '200px',
  },
  height: {
    type: String,
    default: '200px',
  },
});
</script>

<template>
  <div
    class="relative flex flex-col flex-wrap mx-[5px] my-[5px]"
    :style="{ width, height }"
  >
    <el-calendar />
  </div>
</template>

<style scoped lang="scss"></style>
