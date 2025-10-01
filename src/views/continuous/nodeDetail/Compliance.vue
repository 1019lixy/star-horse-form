<script setup lang="ts" name="Compliance">
import { ref } from "vue";

const tabCurrent = ref("second");
</script>

<template>
  <el-card>
    <el-tabs type="card" v-model="tabCurrent">
      <el-tab-pane label="扫描报告" name="first">
       <el-card  class="box-card" >
            <template #header>
              <div class="card-header">
                <span>Card name</span>
                <el-button class="button" text>Operation button</el-button>
              </div>
            </template>
            <div :key="o" class="text item" v-for="o in 4">
              {{ "List item " + o }}
            </div>
          </el-card>
      </el-tab-pane>
      <el-tab-pane label="实时日志" name="second">
        <data-log />
      </el-tab-pane>
      <el-tab-pane label="作业配置" name="third"></el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-space {
  width: 100%;
}

.el-card__header {
  padding: 5px;
}
</style>
