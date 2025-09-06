<script setup lang="ts">
import { PageCompInfo } from "@/components/types/PageLayoutComp";

defineOptions({
  name: "PageContentItem",
});
withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});
</script>

<template>
  <div
    class="relative flex flex-col flex-wrap w-full mx-[5px] my-[5px]"
    :style="styles"
    v-html="preps.content ?? '请输入内容'"
  ></div>
</template>

<style scoped lang="scss"></style>
