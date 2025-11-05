<template>
  <!--  {{deviceId}}-->
  <component :is="loginComponent" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import LoginDev from "@/components/LoginDev.vue";
import LoginPrd from "@/components/LoginPrd.vue";
import { generateDeviceId } from "star-horse-lowcode";

const loginComponent = ref<any>(null);
onMounted(async () => {
  // 生成设备ID
  generateDeviceId("");
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
