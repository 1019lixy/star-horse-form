<template>
  <el-config-provider :locale="zh">
    <RouterView/>
    <LoginDialog v-model:loginDialogVisible="userInfoStore.loginDialogVisible"/>
  </el-config-provider>
</template>
<script lang="ts" setup>
import {computed, onMounted} from "vue";
import {piniaInstance, useUserInfoStore} from "star-horse-lowcode";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";
import LoginDialog from "@/components/LoginDialog.vue";

const userInfoStore = useUserInfoStore(piniaInstance);
const zh = computed(() => navigator.language === "en" ? en : zhCn);
const closeAction = () => {
  //关闭浏览器清空数据
  window.onbeforeunload = async (evt) => {
    evt.preventDefault();
    // userInfoStore.logout();
    // await userLogout(userInfo || {});
  };
};
onMounted(() => {
  closeAction();
});
// const particlesInit = async engine => {
//   //await loadFull(engine);
//   await loadSlim(engine);
// };
// const particlesLoaded = async container => {
//   console.log("Particles container loaded", container);
// };
</script>
<style lang="scss">
#app {
  height: 100%;
}
</style>
