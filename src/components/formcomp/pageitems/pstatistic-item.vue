<script setup lang="ts">
defineOptions({
  name: 'PageStatisticItem',
});
</script>

<template>
  <el-statistic :value="98500">
    <template #title>
      <div style="display: inline-flex; align-items: center">
        Daily active users
        <el-tooltip
          effect="dark"
          content="Number of users who logged into the product in one day"
          placement="top"
        >
          <el-icon style="margin-left: 4px" :size="12">
            <Warning />
          </el-icon>
        </el-tooltip>
      </div>
    </template>
  </el-statistic>
</template>

<style scoped lang="scss"></style>
