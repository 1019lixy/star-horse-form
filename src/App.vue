<template>
  <RouterView />
  <LoginDialog v-model:loginDialogVisible="visible" />
</template>
<script lang="ts" setup>
import { computed, ComputedRef, onMounted, unref } from 'vue';
import { piniaInstance, useUserInfoStore } from 'star-horse-lowcode';

import LoginDialog from '@/components/LoginDialog.vue';
import { getToken } from '@/utils/auth.ts';

const userInfoStore = useUserInfoStore(piniaInstance);
const visible: ComputedRef<boolean> = computed(() => {
  return getToken() && unref(userInfoStore.loginDialogVisible);
});
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
