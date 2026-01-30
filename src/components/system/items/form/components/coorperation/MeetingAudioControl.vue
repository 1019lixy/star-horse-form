<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isAudioEnabled, toggleAudio } = useMeetingCore();
</script>

<template>
  <button class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'text-red-500': isAudioEnabled }" @click="toggleAudio">
    <el-icon :size="22"><Microphone /></el-icon>
    <span class="mt-1 text-sm">{{ isAudioEnabled ? '静音' : '取消静音' }}</span>
  </button>
</template>
