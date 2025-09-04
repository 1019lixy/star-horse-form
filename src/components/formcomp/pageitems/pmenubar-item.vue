<script setup lang="ts">
defineOptions({
  name: "PageMenubarItem",
});

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
}

defineProps({
  menuItems: {
    type: Array as () => MenuItem[],
    default: () => []
  },
  mode: {
    type: String,
    default: "horizontal" // horizontal, vertical
  },
  backgroundColor: {
    type: String,
    default: "#ffffff"
  },
  textColor: {
    type: String,
    default: "#303133"
  },
  activeTextColor: {
    type: String,
    default: "#409eff"
  }
});
</script>

<template>
  <el-menu
    :mode="mode"
    :background-color="backgroundColor"
    :text-color="textColor"
    :active-text-color="activeTextColor"
    class="w-full"
  >
    <template v-for="item in menuItems" :key="item.id">
      <el-menu-item 
        v-if="!item.children || item.children.length === 0" 
        :index="item.id"
      >
        <el-icon v-if="item.icon">
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
      
      <el-sub-menu 
        v-else 
        :index="item.id"
      >
        <template #title>
          <el-icon v-if="item.icon">
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item 
          v-for="child in item.children" 
          :key="child.id" 
          :index="child.id"
        >
          <el-icon v-if="child.icon">
            <component :is="child.icon" />
          </el-icon>
          <span>{{ child.label }}</span>
        </el-menu-item>
      </el-sub-menu>
    </template>
  </el-menu>
</template>

<style scoped lang="scss"></style>