<script setup lang="ts">
defineOptions({
  name: "PageHMenuItem",
});
interface MenuPreps {
  id: string;
  label: string;
  icon: string;
  children: string;
}
defineProps({
  ellipsis: { type: Boolean, default: true },
  mode: { type: String, default: "horizontal" },
  dataList: {
    type: Array as () => any[],
    default: () => [],
  },
  preps: {
    type: Object as () => MenuPreps,
    default: () => ({}),
  },
});
const selectItem = (item: any) => {};
</script>

<template>
  <star-horse-menu
    :ellipsis="ellipsis"
    :mode="mode"
    @selectItem="selectItem"
    :dataList="dataList"
    :preps="preps"
  />
</template>

<style scoped lang="scss"></style>
