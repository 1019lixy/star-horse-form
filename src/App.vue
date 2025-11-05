<script lang="ts" setup>
import {ref, onMounted} from "vue";
import FormTestValid from "@/sample/FormTestValid.vue";
import PageTestValid from "@/sample/PageTestValid.vue";
import {loadLanguage, currentLang} from "@/lang";

// 国际化加载状态
const isLangLoaded = ref(false);

const init = async () => {
  /*try {
    // 等待国际化加载完成
    await loadLanguage(currentLang);
    // 标记国际化加载完成
    isLangLoaded.value = true;
  } catch (error) {
    console.error("国际化加载失败:", error);
    // 即使失败也继续加载应用，只是国际化可能无法正常工作
    isLangLoaded.value = true;
  }*/
};

onMounted(() => {
  init();
});
</script>
<template>
  <!-- 只有在国际化加载完成后才渲染PageTestValid组件 -->
  <PageTestValid/>
<!--  <FormTestValid />-->
  <!-- 可以添加一个加载指示器 -->
<!--  <div v-else style="display: flex; justify-content: center; align-items: center; height: 100vh;">
    加载中...
  </div>-->
</template>
<style lang="scss">

</style>
