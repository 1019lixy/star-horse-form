<script setup lang="ts">
defineOptions({
  name: "PageCopyrightItem"
});
defineProps({
  copyright: { type: String, default: '@2023 版权所有' }
})
const year = new Date().getFullYear();
</script>

<template>
  <div class="w-full h-[30px] bg-black bg-opacity-50">
    <div class="text-white text-center w-full h-full hover-underline">
      {{ copyright ?? `@${year} 版权所有` }}
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
