<script setup lang="ts">
defineOptions({
  name: "PageImageItem",
});
interface ImageInfo {
  imageUrl: string;
  width: string;
  height: string;
  alt: string;
}
defineProps({
  item: {
    type: Object as () => ImageInfo,
    default: () => ({
      imageUrl: "",
      width: "100%",
      height: "200px",
      alt: "图片",
    }),
  },
});
</script>

<template>
  <div class="w-full">
    <el-image
      :src="
        item.imageUrl || 'https://via.placeholder.com/300x200?text=图片占位符'
      "
      :width="item.width ?? '100%'"
      :height="item.height ?? '200px'"
      :alt="item.alt"
      fit="fill"
    />
  </div>
</template>

<style scoped lang="scss"></style>
