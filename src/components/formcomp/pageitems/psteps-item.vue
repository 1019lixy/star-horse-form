<script setup lang="ts">
defineOptions({
  name: 'PageStepsItem',
});
</script>

<template>
  <el-steps style="width: 100%" :active="2" align-center>
    <el-step title="Step 1" description="Some description" />
    <el-step title="Step 2" description="Some description" />
    <el-step title="Step 3" description="Some description" />
  </el-steps>
</template>

<style scoped lang="scss"></style>
