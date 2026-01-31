<script setup lang="ts">
import { ref, watch } from "vue";
import OnlineMeeting from "./OnlineMeeting.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "update:visible", visible: boolean): void;
}>();

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const onlineMeetingRef = ref<InstanceType<typeof OnlineMeeting> | null>(null);

watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      console.log("对话框打开");
    } else {
      console.log("对话框关闭");
      if (onlineMeetingRef.value) {
        onlineMeetingRef.value.cleanupCore();
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="emit('close')"
      :selfFunc="true"
      :source="3"
      :full-screen="false"
      :compSize="'default'"
      @merge="emit('save')"
      boxHeight="70%"
      boxWidth="80%"
      :title="title??'在线会议'"
  >
    <OnlineMeeting ref="onlineMeetingRef" />
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
