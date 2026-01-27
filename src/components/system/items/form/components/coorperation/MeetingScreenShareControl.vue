<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isScreenSharing, toggleScreenShare } = useMeetingCore();
</script>

<template>
  <button class="flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md': isScreenSharing }" @click="toggleScreenShare">
    <el-icon><Monitor /></el-icon>
    <span class="mt-1 text-xs">{{ isScreenSharing ? '停止共享' : '共享屏幕' }}</span>
  </button>
</template>
