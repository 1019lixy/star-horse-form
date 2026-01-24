<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { inviteParticipants } = useMeetingCore();
</script>

<template>
  <button class="control-btn" @click="inviteParticipants">
   <star-horse-icon iconClass="user-add"/>
    <span>邀请</span>
  </button>
</template>
