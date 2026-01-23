<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isVideoEnabled, toggleVideo } = useMeetingCore();
</script>

<template>
  <button class="control-btn" :class="{ active: isVideoEnabled }" @click="toggleVideo">
    <el-icon><VideoCamera /></el-icon>
    <span>{{ isVideoEnabled ? '关闭视频' : '开启视频' }}</span>
  </button>
</template>
