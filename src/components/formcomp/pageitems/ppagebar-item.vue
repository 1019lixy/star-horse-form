<script setup lang="ts">
import {PageCompInfo} from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PagePagebarItem",
});
 withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});

const emits = defineEmits(["update:pageSize", "update:currentPage"]);
const handleCurrentChange = (val: number) => {
  emits("update:currentPage", val);
};
const handleSizeChange = (val: number) => {
  emits("update:pageSize", val);
};
</script>

<template>
  <el-pagination
    v-bind="preps"
    :style="styles"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
  />
</template>

<style scoped lang="scss"></style>
