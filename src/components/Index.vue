<template>
  hello
  <el-input v-model="msg"/>
  <el-button @click="playMsg">播报消息</el-button>
</template>
<script setup lang="ts">
import Speech from "speak-tts";
import {ref, unref,onMounted} from "vue";

const speech = new Speech();
const msg = ref("你好");
const init = () => {
  speech.setLanguage("zh-CN");
  speech.init().then(() => {
    console.log("语音播报初始化完成");
  });
};
onMounted(() => {
  init();
});
const playMsg = () => {
  speech.speak({text: unref(msg)}).then(() => {
  });
}
</script>
<style scoped>
</style>
