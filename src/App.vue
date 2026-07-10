<script lang="ts" setup>
import {onMounted} from "vue";
import RuleList from "@/components/rule/RuleList.vue";

// 国际化加载状态

const init = async () => {
};

onMounted(() => {
  init();
});
</script>
<template>
  <!-- 规则引擎管理页面 -->
  <RuleList/>
</template>
<style lang="scss">
#app {
  height: 100vh;
  overflow: hidden;
}
</style>
