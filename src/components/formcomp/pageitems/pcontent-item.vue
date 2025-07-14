<script setup lang="ts">
defineOptions({
  name: "PageContentItem"
});
defineProps({
  content: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="relative flex flex-col flex-wrap w-full mx-[5px] my-[5px]"  v-html="content">
  </div>
</template>

<style scoped lang="scss"></style>
