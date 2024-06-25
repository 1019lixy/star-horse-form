<template>
  <!--  <vue-particles
        id="tsparticles"
        :particlesInit="particlesInit"
        :particlesLoaded="particlesLoaded"
        :options="particles"/>-->
  <RouterView/>
</template>
<script lang="ts" setup>
import {onMounted} from "vue";
import {loadSlim} from "tsparticles-slim";
//const userInfoStore = UserInfo(piniaInstance);
const closeAction = () => {
  //关闭浏览器情况数据
  window.onbeforeunload = async (evt) => {
    evt.preventDefault();
    // userInfoStore.logout();
    // await userLogout(userInfo || {});
  };
};
onMounted(() => {
  closeAction();
});
const particlesInit = async engine => {
  //await loadFull(engine);
  await loadSlim(engine);
};
const particlesLoaded = async container => {
  console.log("Particles container loaded", container);
};
</script>
<style lang="scss">
#app {
  height: 100%;
}
</style>
