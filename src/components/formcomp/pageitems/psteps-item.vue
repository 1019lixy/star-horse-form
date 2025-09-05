<script setup lang="ts">
defineOptions({
  name: "PageStepsItem",
});

interface Step {
  title: string;
  description?: string;
  icon?: string;
}

defineProps({
  steps: {
    type: Array as () => Step[],
    default: () => [
      { title: "步骤1", description: "步骤1描述" },
      { title: "步骤2", description: "步骤2描述" },
      { title: "步骤3", description: "步骤3描述" },
    ],
  },
  active: {
    type: Number,
    default: 0,
  },
  alignCenter: {
    type: Boolean,
    default: true,
  },
  simple: {
    type: Boolean,
    default: false,
  },
  direction: {
    type: String,
    default: "horizontal", // horizontal, vertical
  },
});
</script>

<template>
  <el-steps
    :active="active"
    :align-center="alignCenter"
    :simple="simple"
    :direction="direction"
    style="width: 100%"
  >
    <el-step
      v-for="(step, index) in steps"
      :key="index"
      :title="step.title"
      :description="step.description"
      :icon="step.icon"
    />
  </el-steps>
</template>

<style scoped lang="scss"></style>
