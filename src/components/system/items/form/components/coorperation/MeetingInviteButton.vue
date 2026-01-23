<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { inviteParticipants } = useMeetingCore();
</script>

<template>
  <button class="control-btn" @click="inviteParticipants">
    <el-icon><UserPlus /></el-icon>
    <span>邀请</span>
  </button>
</template>
