<script setup lang="ts">
import { PageCompInfo } from "@/components/types/PageLayoutComp";

defineOptions({
  name: "PageCopyrightItem",
});
withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});

const year = new Date().getFullYear();
</script>

<template>
  <div class="w-full flex items-center justify-center" :style="styles">
    <div class="text-center hover-underline">
      {{
        preps.copyright ||
        `@${year} ${preps.companyName ?? "公司名称"} 版权所有`
      }}
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
