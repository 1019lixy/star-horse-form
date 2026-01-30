<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { inviteParticipants } = useMeetingCore();
</script>

<template>
  <button class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" @click="inviteParticipants">
   <star-horse-icon iconClass="user-add" size="28px"/>
    <span class="mt-1 text-sm">邀请</span>
  </button>
</template>
