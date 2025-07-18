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
    default: () => ({}),
  },
});
</script>

<template>
  <div class="w-full">
    <el-image
      :src="item.imageUrl"
      :width="item.width ?? '100%'"
      :height="item.height ?? '100%'"
      :alt="item.alt"
      fit="fill"
    />
  </div>
</template>

<style scoped lang="scss"></style>
