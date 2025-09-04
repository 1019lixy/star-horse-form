<script setup lang="ts">
defineOptions({
  name: "PageNavbarItem",
});

interface NavItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

defineProps({
  title: {
    type: String,
    default: "导航标题"
  },
  navItems: {
    type: Array as () => NavItem[],
    default: () => []
  },
  logoUrl: {
    type: String,
    default: ""
  }
});
</script>

<template>
  <el-page-header :title="title">
    <template #content>
      <div class="flex items-center">
        <el-image
          v-if="logoUrl"
          :src="logoUrl"
          fit="cover"
          class="w-8 h-8 mr-2"
        />
        <span class="text-lg font-bold">{{ title }}</span>
      </div>
    </template>
    <template #extra>
      <div class="flex items-center">
        <el-menu mode="horizontal" class="border-0">
          <el-menu-item 
            v-for="item in navItems" 
            :key="item.id" 
            :index="item.id"
          >
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>
    </template>
  </el-page-header>
</template>

<style scoped lang="scss"></style>