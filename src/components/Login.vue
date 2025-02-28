<template>
<!--  {{deviceId}}-->
  <component :is="loginComponent"/>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue";
import LoginDev from "@/components/LoginDev.vue";
import LoginPrd from "@/components/LoginPrd.vue";
import {generateDeviceId} from "@/api/finger_utils.ts";

const loginComponent = ref<any>(null);
let deviceId = '';
onMounted(async () => {
  deviceId =await generateDeviceId('');
  console.log(deviceId);
  let env: string = import.meta.env.MODE;
  const port = window.location.port;
  env = port == "5588" ? "development" : env;
  switch (env) {
    case "development":
      loginComponent.value = LoginDev;
      break;
    case "production":
      loginComponent.value = LoginPrd;
      break;
    default:
      loginComponent.value = LoginDev;
  }
});
</script>

<style scoped>
/* 公共登录页面样式 */
</style>
