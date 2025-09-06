<script setup lang="ts">
import { PageCompInfo } from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PagePageheaderItem",
});
withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});
</script>

<template>
  <el-page-header :title="preps.title">
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in preps.breadcrumbs"
          :key="index"
          :to="item.path ? { path: item.path } : undefined"
        >
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </template>
    <template #content>
      <div class="flex items-center">
        <el-icon v-if="preps.icon">
          <component :is="preps.icon" />
        </el-icon>
        <span class="text-large font-600 mr-3">{{ preps.title }}</span>
        <span v-if="preps.content">{{ preps.content }}</span>
      </div>
    </template>
  </el-page-header>
</template>

<style scoped lang="scss"></style>
