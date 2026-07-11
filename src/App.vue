<script lang="ts" setup>
import { onMounted, ref } from "vue";
import test from "@/sample/test.vue"
// 国际化加载状态
const activeTab = ref<string>("form");
const init = async () => {
};

onMounted(() => {
  init();
});
</script>
<template>
  <!-- 规则引擎管理页面 -->
  <test />

</template>
<style lang="scss">
#app {
  height: 100vh;
  overflow: hidden;
}
</style>
