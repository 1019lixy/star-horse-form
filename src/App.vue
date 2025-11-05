<template>
  <RouterView />
  <LoginDialog v-model:loginDialogVisible="visible" />
</template>
<script lang="ts" setup>
import { computed, ComputedRef, onMounted, unref } from "vue";
import { piniaInstance, useUserInfoStore } from "star-horse-lowcode";
import { i18n } from "@/lang";

import LoginDialog from "@/components/LoginDialog.vue";
import { getToken } from "@/utils/auth.ts";

const userInfoStore = useUserInfoStore(piniaInstance);
const visible: ComputedRef<boolean> = computed(() => {
  return getToken() && unref(userInfoStore.loginDialogVisible);
});
const closeAction = () => {
  // i18n("app.closeBrowserClearData")
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
