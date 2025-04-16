<template>
  <dynamic-form/>
</template>
<script lang="ts" setup>
import {onMounted} from "vue";
import {piniaInstance, useUserInfoStore} from "star-horse-lowcode";
import DynamicForm from "@/views/dyform/DynamicForm.vue";

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
