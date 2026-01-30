<script setup lang="ts">
import MeetingAudioControl from "./MeetingAudioControl.vue";
import MeetingVideoControl from "./MeetingVideoControl.vue";
import MeetingScreenShareControl from "./MeetingScreenShareControl.vue";
import MeetingInviteButton from "./MeetingInviteButton.vue";
import { useMeetingCore } from "./meeting-core-context";

const { 
  isRecording, 
  toggleRecording, 
  endMeeting,
  leaveMeeting,
  isCurrentUserHost,
  raisedHands,
  isMuteAll,
  isVideoOffAll,
  currentUserId,
  toggleRaiseHand,
  toggleMuteAll,
  toggleVideoOffAll
} = useMeetingCore();

// 检查当前用户是否举手
const isHandRaised = () => {
  if (!raisedHands.value || !currentUserId.value) {
    return false;
  }
  return raisedHands.value.has(currentUserId.value);
};
</script>

<template>
  <div class="flex flex-wrap gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl shadow-md border border-blue-100/30 animate-fade-in-up">
    <MeetingAudioControl />
    <MeetingVideoControl />
    <MeetingScreenShareControl />
    <button class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md animate-pulse': isRecording }" @click="toggleRecording">
      <el-icon :size="22"><VideoCamera /></el-icon>
      <span class="mt-1 text-sm">{{ isRecording ? '停止录制' : '开始录制' }}</span>
    </button>
    <button class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md': isHandRaised() }" @click="toggleRaiseHand(currentUserId)">
      <el-icon :size="22"><Avatar /></el-icon>
      <span class="mt-1 text-sm">{{ isHandRaised() ? '放下手' : '举手' }}</span>
    </button>
    <MeetingInviteButton />
    <el-dropdown trigger="click">
      <div class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30">
        <el-icon :size="22"><More/></el-icon>
        <span class="mt-1 text-sm">更多</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="toggleMuteAll">
            <el-icon :size="22"><Microphone /></el-icon>
            <span>{{ isMuteAll ? '取消静音所有' : '静音所有' }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click="toggleVideoOffAll">
            <el-icon :size="22"><VideoCamera /></el-icon>
            <span>{{ isVideoOffAll ? '开启所有视频' : '关闭所有视频' }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <button v-if="isCurrentUserHost()" class="w-32 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-400 text-white shadow-md" @click="endMeeting">
      <el-icon :size="22" color="#fff"><Close /></el-icon>
      <span class="mt-1 text-sm">结束会议</span>
    </button>
    <button v-else class="w-32 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-400 text-white shadow-md" @click="leaveMeeting">
      <el-icon :size="22" color="#fff"><Close /></el-icon>
      <span class="mt-1 text-sm">离开会议</span>
    </button>
  </div>
</template>