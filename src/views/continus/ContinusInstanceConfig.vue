<script setup lang="ts" name="ContinusInstanceConfig">

import InstanceItem from "@/views/continus/InstanceItem.vue";
import {useRouter} from "vue-router";

const router = useRouter();

const addDataFun = () => {
  router.push("/continus/instanceInit");
};

</script>
<style lang="scss" scoped>

.config-nav-bar {

  .nav-bar-right {
    display: flex;
    position: relative;
    right: 15px;
    flex-direction: row;
  }
}
</style>
<template>
  <div class="config-nav-bar">
    <div class="nav-bar-left">
      <span><star-horse-icon icon-class="flow"/>流水线</span>
    </div>
    <div class="nav-bar-right">
      <el-button @click="btnOperation(3)" link title="" type="primary">
        <star-horse-icon icon-class="search"/>
        <el-tooltip content="搜索流水线">搜索流水线</el-tooltip>
      </el-button>
      <el-select placeholder="请选择迭代版本">
        <el-option label="版本1" value="version1"/>
        <el-option label="版本2" value="version3"/>
        <el-option label="版本3" value="version2"/>
      </el-select>
      <el-button @click="btnOperation(3)" link title="" type="primary">
        <star-horse-icon icon-class="fa-filter"/>
        <el-tooltip content="筛选">筛选</el-tooltip>
      </el-button>

      <el-button @click="btnOperation(3)" link title="" type="primary">
        <star-horse-icon icon-class="batch-add"/>
        <el-tooltip content="查看全部">查看全部</el-tooltip>
      </el-button>
      <el-button @click="btnOperation(1)" link title="" type="primary">
        <star-horse-icon icon-class="add"/>
        <el-tooltip content="新建流水线">新建流水线</el-tooltip>
      </el-button>
    </div>
  </div>

  <div style="height: 60px;"></div>

  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>
  <instance-item></instance-item>

</template>