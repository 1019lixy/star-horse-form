<script setup lang="ts">
defineOptions({
  name: "PageCopyrightItem",
});

defineProps({
  copyright: {
    type: String,
    default: "",
  },
  companyName: {
    type: String,
    default: "公司名称",
  },
  backgroundColor: {
    type: String,
    default: "#000000",
  },
  textColor: {
    type: String,
    default: "#ffffff",
  },
  height: {
    type: String,
    default: "30px",
  },
});

const year = new Date().getFullYear();
</script>

<template>
  <div
    class="w-full flex items-center justify-center"
    :style="{
      height,
      backgroundColor,
      color: textColor,
    }"
  >
    <div class="text-center hover-underline">
      {{ copyright || `@${year} ${companyName} 版权所有` }}
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
