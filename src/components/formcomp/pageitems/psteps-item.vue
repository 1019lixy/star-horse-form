<script setup lang="ts">
import {PageCompInfo} from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageStepsItem",
});


withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});
</script>

<template>
  <el-steps
      v-bind="preps"
      :style="styles"
  >
    <el-step
        v-for="(step, index) in preps.steps"
        :key="index"
        :title="step.title"
        :description="step.description"
        :icon="step.icon"
    />
  </el-steps>
</template>

<style scoped lang="scss"></style>
