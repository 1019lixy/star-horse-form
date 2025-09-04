<script setup lang="ts">
import { Warning } from "@element-plus/icons-vue";

defineOptions({
  name: "PageStatisticItem",
});

defineProps({
  value: {
    type: Number,
    default: 0
  },
  title: {
    type: String,
    default: "统计标题"
  },
  description: {
    type: String,
    default: ""
  },
  prefix: {
    type: String,
    default: ""
  },
  suffix: {
    type: String,
    default: ""
  },
  precision: {
    type: Number,
    default: 0
  },
  groupSeparator: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <el-statistic 
    :value="value" 
    :precision="precision"
    :group-separator="groupSeparator"
  >
    <template #title>
      <div style="display: inline-flex; align-items: center">
        {{ title }}
        <el-tooltip
          v-if="description"
          effect="dark"
          :content="description"
          placement="top"
        >
          <el-icon style="margin-left: 4px" :size="12">
            <Warning />
          </el-icon>
        </el-tooltip>
      </div>
    </template>
    <template #prefix>
      <span v-if="prefix">{{ prefix }}</span>
    </template>
    <template #suffix>
      <span v-if="suffix">{{ suffix }}</span>
    </template>
  </el-statistic>
</template>

<style scoped lang="scss"></style>