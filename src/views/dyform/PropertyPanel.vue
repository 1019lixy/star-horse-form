<script setup lang="ts" name="PropertyPanel">
import { ref, watch } from "vue";

const props = defineProps({
  activeTab: { type: String, default: "first" },
});

let activeName = ref(props.activeTab);
let formItemRef = ref(null);
watch(
  () => props.activeTab,
  (val) => (activeName.value = val),
  { immediate: true, deep: true },
);
</script>
<style lang="scss" scoped></style>
<template></template>
