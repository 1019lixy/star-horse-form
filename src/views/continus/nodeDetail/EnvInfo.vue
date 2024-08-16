<script setup lang="ts" name="EnvInfo">
import DataLog from "@/views/continus/nodeDetail/DataLog.vue";
import {ref} from "vue";

const tabCurrent = ref("second");
</script>
<style scoped>
</style>
<template>
  <el-card>
    <el-tabs type="card" v-model="tabCurrent">
      <el-tab-pane label="实时日志" name="first">
        <data-log/>
      </el-tab-pane>
      <el-tab-pane label="作业配置" name="second">
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
