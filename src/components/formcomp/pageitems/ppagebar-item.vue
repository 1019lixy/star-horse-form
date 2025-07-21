<script setup lang="ts">
defineOptions({
  name: 'PagePagebarItem',
});
defineProps({
  total: { type: Number, default: 10 },
  pageSize: { type: Number, default: 10 },
});
const emits = defineEmits(['update:pageSize']);
const handleCurrentChange = () => {};
const handleSizeChange = (val: number) => {
  emits('update:pageSize', val);
};
</script>

<template>
  <el-pagination
    layout="total, sizes, prev, pager, next, jumper"
    :total="total"
    :page-sizes="[10, 20, 30, 40]"
    :page-size="pageSize"
    @current-change="handleCurrentChange"
    @size-change="handleSizeChange"
  />
</template>

<style scoped lang="scss"></style>
