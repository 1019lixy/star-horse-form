<script setup lang="ts">
import {ref} from "vue";

defineProps({
  dataList: {type: Array, required: true},
  preps: {
    type: Object,
    default: () => {
      return {
        value: 'value',
        label: 'name',
        children: 'children'
      };
    }
  },
});
const emits = defineEmits(["selectData"]);
let currentItem = ref<any>({});
const selectData = (item: any, event: MouseEvent) => {
  currentItem.value = item;
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  emits("selectData", item);
}
</script>
<template>
  <template v-for="item in dataList">
    <el-sub-menu v-if="item.children&&item.children.length>0"
                 :class="{'is-active':item[preps.value]==currentItem[preps.value]}" :index="item[preps.value]">

      <template #title>
        <el-icon class="star-icon">
          <component is="folder"/>
        </el-icon>
        <span class="menu-title" @click="selectData(item,$event)">{{ item[preps.label] }}</span>
      </template>
      <SubSystemMenu :dataList="item.children" :preps="preps" @selectData="selectData"/>
    </el-sub-menu>
    <el-menu-item v-else :index="item[preps.value]" :class="{'is-active':item[preps.value]==currentItem[preps.value]}">
      <el-icon class="star-icon">
        <component is="document"/>
      </el-icon>
      <template #title>
        <span class="menu-title" @click="selectData(item,$event)">{{ item[preps.label] }}</span>
      </template>
    </el-menu-item>

  </template>
</template>
<style scoped lang="scss">
.star-icon {
  font-size: 22px;
}

.el-sub-menu {
  justify-content: space-between;
}

:deep(.el-sub-menu__title) {
  height: 35px !important;
  line-height: 35px !important;
  width: 100%;

  .menu-title {
    width: 100% !important;
    height: 100% !important;
  }
}

:deep(.el-scrollbar__view) {
  height: 100%;
}
</style>
