<template>
  <!--  <vue-particles
        id="tsparticles"
        :particlesInit="particlesInit"
        :particlesLoaded="particlesLoaded"
        :options="particles"/>-->
  <!--  <el-watermark content="Star Horse Devops"></el-watermark>-->
  <RouterView/>
  <LoginDialog v-model:loginDialogVisible="userInfoStore.loginDialogVisible"/>
</template>
<script lang="ts" setup>
import {onMounted} from "vue";
import {piniaInstance, useUserInfoStore} from "star-horse-lowcode";

const userInfoStore = useUserInfoStore(piniaInstance);
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
