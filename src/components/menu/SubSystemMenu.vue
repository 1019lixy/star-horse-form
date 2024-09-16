<script setup lang="ts">

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
const selectData = (item: any) => {
  emits("selectData", item);
}
</script>
<template>
  <template v-for="item in dataList">
    <el-sub-menu v-if="item.children&&item.children.length>0" :index="item[preps.value]" @click="selectData(item)">
      <template #title>
        <span>{{ item[preps.label] }}</span>
      </template>
      <SystemSubMenu :dataList="item.children" :preps="preps"/>
    </el-sub-menu>
    <el-menu-item v-else :index="item[preps.value]" @click="selectData(item)">
      <template #title>
        <span>{{ item[preps.label] }}</span>
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
