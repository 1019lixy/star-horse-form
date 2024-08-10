<script setup lang="ts">
import {computed} from "vue";

const props=defineProps({
  dataList: {type: Array<any>, required: true},
  level: {type: Number, default: 1}
});
let menuColor=computed(()=>props.level>1?"var(--star-horse-shadow)":"var(--star-horse-font-color)");
</script>
<template>
  <div v-if="level>1" style="height: 2px ;background: var(--star-horse-white)"></div>
  <template v-for="item in dataList">
    <el-menu-item popper-class="popper-class" v-if="!item.children.length"
                  :index="item.meta.menuId">
      <el-icon class="star-icon">
        <component :is="item.meta.menuIcon||'document'"/>
      </el-icon>
      <template #title>
        <router-link :to="{ path: item.path }">{{ item.meta.title }}</router-link>
      </template>
    </el-menu-item>

    <el-sub-menu v-else :index="item.meta.menuId">
      <template #title>
        <el-icon class="star-icon">
          <component :is="item.meta.menuIcon||'document'"/>
        </el-icon>
        <span>{{ item.meta.title }} </span>
      </template>
      <SubMenu :dataList="item.children" :level="level+1"></SubMenu>
    </el-sub-menu>
  </template>
</template>
<style lang="scss" scoped>
.star-icon {
  font-size: 22px;
}

.popper-class {
  background: var(--star-horse-style);
}

.el-sub-menu {
  background: v-bind(menuColor);
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
