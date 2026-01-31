<script setup lang="ts">

import {StarHorseDialog} from "star-horse-lowcode";
import {ref, watch} from "vue";
import OnlineChat from "./OnlineChat.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "update:visible", visible: boolean): void;
}>();

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const closeAction = () => {
  emit("update:visible", false);
};

const codeDoSave = () => {
  emit("save");
};

const onlineChatRef = ref<InstanceType<typeof OnlineChat> | null>(null);

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      console.log("对话框打开");
    } else {
      console.log("对话框关闭");
      if (onlineChatRef.value) {
        onlineChatRef.value.cleanup();
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="closeAction"
      :selfFunc="true"
      :source="3"
      :full-screen="false"
      :compSize="'default'"
      @merge="codeDoSave"
      boxHeight="70%"
      boxWidth="60%"
      :title="title??'聊天框'"
  >
    <OnlineChat ref="onlineChatRef" />
  </star-horse-dialog>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>