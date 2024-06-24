<script setup lang="ts" name="ContinusInstanceDetail">
import InstanceItemDetail from "@/views/continus/InstanceItemDetail.vue";
import Compliance from "@/views/continus/nodeDetail/Compliance.vue";
</script>
<style lang="scss" scoped>
.config-nav-bar {
  .nav-bar-left {
    width: 81%;
  }
  .nav-bar-right {
    justify-items: right;
    align-items: center;
    text-align: center;
  }
}
</style>
<template>
  <div class="config-nav-bar">
    <div class="nav-bar-left">
      <span><star-horse-icon icon-class="flow"/>流水线</span>
    </div>
    <div class="nav-bar-right">
      <el-button @click="execLine" title="" style="background: var(--star-horse-style);color: var(--star-horse-white)">
        <star-horse-icon icon-class="fa-circle-play"/>
        <el-tooltip content="执行">执行</el-tooltip>
      </el-button>
    </div>
  </div>
  <div style="height: 60px;"></div>
  <instance-item-detail @nodeDetail="nodeDetail"></instance-item-detail>
  <compliance/>
</template>
