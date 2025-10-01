<script setup lang="ts" name="ContinusInstanceExecRecord">
import { ref } from "vue";
import { apiInstance, ApiUrls } from "star-horse-lowcode";

const apiUrl: ApiUrls = apiInstance(
  "continuous-manage",
  "continuous/continuousInstance",
);
defineProps({
  param: {
    type: String,
    default: "",
  },
});
const primaryKey: string = "idContinusInst";
let activeName: string = ref<string>("first");
const execLine = () => {
  console.log("执行");
};
const handleClick = (tab: string, event: Event) => { };
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <div class="config-nav-bar">
      <div class="nav-bar-left">
        <span><star-horse-icon icon-class="flow" />流水线</span>
      </div>
      <div class="nav-bar-right">
        <el-button @click="execLine" link title="" style="
            background: var(--star-horse-style);
            color: var(--star-horse-white);
          ">
          <star-horse-icon icon-class="fa-circle-play" />
          <el-tooltip content="执行">执行</el-tooltip>
        </el-button>
      </div>
    </div>
    <div style="height: 60px"></div>
    <el-tabs @tabClick="handleClick(tab, event)" type="card" v-model="activeName">
      <el-tab-pane label="执行记录" name="first">
        <instance-item-detail />
      </el-tab-pane>
      <el-tab-pane label="修改历史" name="second">修改历史</el-tab-pane>
      <el-tab-pane label="回滚记录" name="third">回滚记录</el-tab-pane>
    </el-tabs>
  </div>
</template>
<style lang="scss" scoped></style>
