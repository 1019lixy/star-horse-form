<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isAudioEnabled, toggleAudio } = useMeetingCore();
</script>

<template>
  <button class="control-btn" :class="{ active: isAudioEnabled }" @click="toggleAudio">
    <el-icon><Microphone /></el-icon>
    <span>{{ isAudioEnabled ? '静音' : '取消静音' }}</span>
  </button>
</template>
