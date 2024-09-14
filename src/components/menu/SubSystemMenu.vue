<script setup lang="ts">
import {inject} from "vue";

defineProps({
  dataList: {type: Array, required: true}
});
const loadMenuFun = inject("loadMenu") as Function;
</script>
<template>
  <template v-for="item in dataList">
    <el-sub-menu v-if="item.children&&item.children.length>0" :index="item.idInformations" @click="loadMenuFun(item.idInformations)">
      <template #title>
        <el-icon class="star-icon">
          <component :is="item.sysLogo||'document'"/>
        </el-icon>
        <span>{{ item.sysName }}</span>
      </template>
      <SystemSubMenu :dataList="item.children"/>
    </el-sub-menu>
    <el-menu-item v-else :index="item.idInformations" @click="loadMenuFun(item.idInformations)">
      <el-icon class="star-icon">
        <component :is="item.sysLogo||'document'"/>
      </el-icon>
      <template #title>
        <span>{{ item.sysName }}</span>
      </template>
    </el-menu-item>

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
