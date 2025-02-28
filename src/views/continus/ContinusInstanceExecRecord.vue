<script setup lang="ts" name="ContinusInstanceExecRecord">
  import { ref } from "vue";
  import InstanceItemDetail from "@/views/continus/InstanceItemDetail.vue";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { apiInstance } from "@/api/sh_api.ts";

  const apiUrl: ApiUrls = apiInstance("devops-continus", "continus/continusInstance");
  const primaryKey: string = "idContinusInst";
  let activeName: string = ref<string>("first");
  const execLine = () => {
    console.log("执行");
  };
  const handleClick = (tab: string, event: Event) => {};
</script>

<template>
  <div class="config-nav-bar">
    <div class="nav-bar-left">
      <span><star-horse-icon icon-class="flow" />流水线</span>
    </div>
    <div class="nav-bar-right">
      <el-button
        @click="execLine"
        link
        title=""
        style="background: var(--star-horse-style); color: var(--star-horse-white)"
      >
        <star-horse-icon icon-class="fa-circle-play" />
        <el-tooltip content="执行">执行</el-tooltip>
      </el-button>
    </div>
  </div>
  <div style="height: 60px"></div>
  <el-tabs @tabClick="handleClick(tab, event)" type="card" v-model="activeName">
    <el-tab-pane label="执行记录" name="first">
      <instance-item-detail></instance-item-detail>
    </el-tab-pane>
    <el-tab-pane label="修改历史" name="second">修改历史</el-tab-pane>
    <el-tab-pane label="回滚记录" name="third">回滚记录</el-tab-pane>
  </el-tabs>
</template>
<style lang="scss" scoped>
  .config-nav-bar {
    position: fixed;
    width: 100%;
    height: 60px;
    display: flex;
    z-index: 9999;
    flex-direction: row;
    background: #f1f2f3;
    margin-left: -20px;
    margin-top: -12px;
    align-items: center;

    .nav-bar-left {
      width: 55%;

      span {
        margin-left: 15px;
      }
    }

    .nav-bar-right {
      display: flex;
      position: relative;
      right: 15px;
      flex-direction: row;
    }
  }
</style>
