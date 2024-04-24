<script setup lang="ts">
const props = defineProps({
  dataList: {type: Array, required: true}
});
</script>
<template>
  <template v-for="item in dataList">
    <el-menu-item v-if="!item.children.length" :key="item.idInformations" :index="item.idInformations">
      <el-icon class="star-icon">
        <component :is="item.sysLogo||'document'"/>
      </el-icon>
      <template #title>
        <span>{{ item.sysName }}</span>
      </template>
    </el-menu-item>
    <el-sub-menu v-else :key="item.idInformations" :index="item.idInformations">
      <template #title>
        <el-icon class="star-icon">
          <component :is="tem.sysLogo||'document'"/>
        </el-icon>
        <span>{{ item.sysName }}</span>
      </template>
      <SubMenu :dataList="item.children"></SubMenu>
    </el-sub-menu>
  </template>
</template>

<style lang="scss">
.star-icon {
  font-size: 22px;
}

:deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>