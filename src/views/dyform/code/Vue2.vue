<script setup lang="ts">
  const props = defineProps({
    formInfo: { type: Object, required: true },
    compList: { type: Array, required: true }
  });
  let code = `<script setup lang='ts'>
<\/script>`;
</script>
<template>
  <StarHorseEditor :lang="'vue'" v-model:value="code" />
</template>
<style scoped lang="scss"></style>
