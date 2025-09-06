<script setup lang="ts">
import {PageCompInfo} from "@/components/types/PageLayoutComp";

defineOptions({
  name: "PageCalendarItem",
});

// Package all props into preps object for easier management
const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});

// Extract props from preps or use defaults
const width = props.preps?.width || "200px";
const height = props.preps?.height || "200px";
const modelValue = props.preps?.modelValue || new Date();
const range = props.preps?.range || [];
</script>

<template>
  <div
    class="relative flex flex-col flex-wrap mx-[5px] my-[5px]"
    :style="{ width, height }"
  >
    <el-calendar v-model="modelValue" :range="range" />
  </div>
</template>

<style scoped lang="scss"></style>
