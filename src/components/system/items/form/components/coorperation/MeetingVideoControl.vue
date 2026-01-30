<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isVideoEnabled, toggleVideo } = useMeetingCore();
</script>

<template>
  <button class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md': isVideoEnabled }" @click="toggleVideo">
    <el-icon :size="22"><VideoCamera /></el-icon>
    <span class="mt-1 text-sm">{{ isVideoEnabled ? '关闭视频' : '开启视频' }}</span>
  </button>
</template>
