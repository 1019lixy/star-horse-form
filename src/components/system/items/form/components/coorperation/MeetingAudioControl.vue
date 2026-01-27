<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isAudioEnabled, toggleAudio } = useMeetingCore();
</script>

<template>
  <button class="flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300" :class="{ 'text-red-500': isAudioEnabled }" @click="toggleAudio">
    <el-icon><Microphone /></el-icon>
    <span class="mt-1 text-xs">{{ isAudioEnabled ? '静音' : '取消静音' }}</span>
  </button>
</template>
