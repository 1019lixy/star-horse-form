<script setup lang="ts">
defineOptions({
  name: "PageTableItem"
});
</script>

<template>
  <el-table>
    <el-table-column prop="date" label="日期" width="180" />
    <el-table-column prop="name" label="姓名" width="180" />
    <el-table-column prop="address" label="地址" />
  </el-table>
</template>

<style scoped lang="scss"></style>
