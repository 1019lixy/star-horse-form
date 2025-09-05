<script setup lang="ts">
defineOptions({
  name: "PagePageheaderItem",
});

interface BreadcrumbItem {
  path?: string;
  label: string;
}

defineProps({
  title: {
    type: String,
    default: "页面标题",
  },
  breadcrumbs: {
    type: Array as () => BreadcrumbItem[],
    default: () => [{ path: "/", label: "首页" }, { label: "当前页面" }],
  },
  icon: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <el-page-header :title="title">
    <template #breadcrumb>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumbs"
          :key="index"
          :to="item.path ? { path: item.path } : undefined"
        >
          {{ item.label }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </template>
    <template #content>
      <div class="flex items-center">
        <el-icon v-if="icon">
          <component :is="icon" />
        </el-icon>
        <span class="text-large font-600 mr-3">{{ title }}</span>
      </div>
    </template>
  </el-page-header>
</template>

<style scoped lang="scss"></style>
