<script setup lang="ts" name="ContinusInstanceDetail">

import {useRouter} from "vue-router";

const router = useRouter();
const execLine = () => {
  console.log("执行");
};
const nodeDetail = (id: number) => {
};
const goBack = () => {
  router.push({
    path: "/continuous/ContinusInstanceConfig"
  });
}
</script>

<template>
  <div class="config-nav-bar">
    <div class="nav-bar-left">
      <el-button @click="goBack" link class="flex items-center">
        <star-horse-icon icon-class="return"/>
        返回
      </el-button>
      <span>starhorse-continuous-01</span>
      <el-divider direction="vertical"/>
      <span>操作人:</span>
      <el-divider direction="vertical"/>
      <span>执行于: 2022-11-25 11:00:00</span>
      <el-divider direction="vertical"/>
      <span>#71992</span>
    </div>
    <div class="nav-bar-right">
      <el-button @click="execLine" title="" style="background: var(--star-horse-style); color: var(--star-horse-white)">
        <star-horse-icon icon-class="run" color="var(--star-horse-white)"/>
        <el-tooltip content="执行">执行</el-tooltip>
      </el-button>
    </div>
  </div>
  <instance-item-detail @nodeDetail="nodeDetail"/>
  <compliance/>
</template>
<style lang="scss" scoped>

</style>
