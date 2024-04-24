<script setup lang="ts" name="SqlAudit">
import DataLog from "@/views/continus/nodeDetail/DataLog.vue";
import {ref} from "vue";

const tabCurrent = ref("second");
</script>

<style scoped>

</style>
<template>
  <el-card>
    <el-tabs type="card" v-model="tabCurrent">
      <el-tab-pane label="审核结果" name="first">
      </el-tab-pane>
      <el-tab-pane label="实时日志" name="second">
        <data-log/>
      </el-tab-pane>
      <el-tab-pane label="作业配置" name="third">
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>