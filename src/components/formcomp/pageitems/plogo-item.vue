<script setup lang="ts">
import { PageCompInfo } from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageLogoItem",
});

interface LogoItem {
  imageUrl: string;
  companyName: string;
  link?: string;
  width?: string;
  height?: string;
  alt?: string;
}
withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});
</script>

<template>
  <div class="flex items-center justify-center" :style="styles">
    <a
      v-if="preps.link"
      :href="preps.link"
      target="_blank"
      :title="preps.companyName"
    >
      <el-image
        :src="preps.imageUrl"
        :alt="preps.alt || preps.companyName"
        :fit="preps.fit"
        class="w-full h-full"
      />
    </a>
    <el-image
      v-else
      :src="preps.imageUrl"
      :alt="preps.alt || preps.companyName"
      :fit="preps.fit"
      class="w-full h-full"
    />
  </div>
</template>

<style scoped lang="scss"></style>
