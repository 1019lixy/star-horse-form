<script setup lang="ts" name="Compliance">
import {ref} from 'vue';

const tabCurrent = ref('second');
</script>
<style scoped>
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
<template>
  <el-card>
    <el-tabs type="card" v-model="tabCurrent">
      <el-tab-pane label="扫描报告" name="first">
        <el-space :fill="true" style="height: 300px; overflow-y: auto">
          <el-card :key="i" class="box-card" v-for="i in 3">
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
        </el-space>
      </el-tab-pane>
      <el-tab-pane label="实时日志" name="second">
        <data-log />
      </el-tab-pane>
      <el-tab-pane label="作业配置" name="third"></el-tab-pane>
    </el-tabs>
  </el-card>
</template>
