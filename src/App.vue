<script lang="ts" setup>
import {onMounted} from "vue";
import Test from "@/sample/test.vue";

// 国际化加载状态

const init = async () => {
};

onMounted(() => {
  init();
});
</script>
<template>
  <!-- 只有在国际化加载完成后才渲染PageTestValid组件 -->
  <test/>
  <!--  <FormTestValid />-->
  <!-- 可以添加一个加载指示器 -->
  <!--  <div v-else style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      加载中...
    </div>-->
</template>
<style lang="scss"></style>
