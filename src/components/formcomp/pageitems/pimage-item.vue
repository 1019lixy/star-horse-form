<script setup lang="ts">
import {PageCompInfo} from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageImageItem",
});

interface ImageInfo {
  imageUrl: string;
  width: string;
  height: string;
  alt: string;
}
withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});

</script>

<template>
  <div class="w-full">
    <el-image
      v-bind="preps"
      :style="styles"
    />
  </div>
</template>

<style scoped lang="scss"></style>
