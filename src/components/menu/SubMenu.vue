<script setup lang="ts">
const props = defineProps({
  dataList: {type: Array, required: true}
});
</script>
<template>
  <template v-for="item in dataList">
    <el-menu-item popper-class="popper-class" v-if="!item.children.length" :key="item.meta.menuId"
                  :index="item.meta.menuId">
      <el-icon class="star-icon">
        <component :is="item.meta.menuIcon||'document'"/>
      </el-icon>
      <template #title>
        <router-link :to="{ path: item.path }">{{ item.meta.title }}</router-link>
      </template>
    </el-menu-item>
    <el-sub-menu v-else :key="item.meta.menuId" :index="item.meta.menuId">
      <template #title>
        <el-icon class="star-icon">
          <component :is="item.meta.menuIcon||'document'"/>
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </template>
      <SubMenu :dataList="item.children"></SubMenu>
    </el-sub-menu>
  </template>
</template>

<style lang="scss" scoped>
.star-icon {
  font-size: 22px;
}
.popper-class{
  background: var(--star-horse-style);
}
.el-sub-menu {
  background: var(--star-horse-font-color);
  margin-top: 1px;
}

:deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}

.popers {
  overflow: auto;
  height: 100% !important;
  z-index: 999999;
}
</style>
