<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { isScreenSharing, toggleScreenShare } = useMeetingCore();
</script>

<template>
  <button class="control-btn" :class="{ active: isScreenSharing }" @click="toggleScreenShare">
    <el-icon><Monitor /></el-icon>
    <span>{{ isScreenSharing ? '停止共享' : '共享屏幕' }}</span>
  </button>
</template>
