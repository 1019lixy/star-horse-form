<script setup lang="ts">
import { ref, watch, provide } from "vue";
import { provideMeetingCore } from "./meeting-core-context";
import { useMeetingDialog } from "./useMeetingDialog";
import MeetingVideoPanel from "./MeetingVideoPanel.vue";
import MeetingChatPanel from "./MeetingChatPanel.vue";
import MeetingAudioControl from "./MeetingAudioControl.vue";
import MeetingVideoControl from "./MeetingVideoControl.vue";
import MeetingScreenShareControl from "./MeetingScreenShareControl.vue";
import MeetingInviteButton from "./MeetingInviteButton.vue";
import {meetingInfo,availableUsers} from "@/components/system/items/form/components/coorperation/script/dataConfig";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const props = withDefaults(defineProps<{
  showMeetingInfo?: boolean;
  showUserSwitch?: boolean;
  showSidebarToggle?: boolean;
  showVideoPanel?: boolean;
  showControls?: boolean;
  showSidebar?: boolean;
  showParticipants?: boolean;
  showChat?: boolean;
  showAudioControl?: boolean;
  showVideoControl?: boolean;
  showScreenShareControl?: boolean;
  showRecordingControl?: boolean;
  showRaiseHandControl?: boolean;
  showInviteButton?: boolean;
  showMoreButton?: boolean;
  showEndMeetingButton?: boolean;
  showLeaveMeetingButton?: boolean;
}>(), {
  showMeetingInfo: true,
  showUserSwitch: true,
  showSidebarToggle: true,
  showVideoPanel: true,
  showControls: true,
  showSidebar: true,
  showParticipants: true,
  showChat: true,
  showAudioControl: true,
  showVideoControl: true,
  showScreenShareControl: true,
  showRecordingControl: true,
  showRaiseHandControl: true,
  showInviteButton: true,
  showMoreButton: true,
  showEndMeetingButton: true,
  showLeaveMeetingButton: true,
});

const core = ref<any>(null);
const isInitialized = ref(false);

const initializeCore = () => {
  if (!core.value) {
    console.log("初始化会议核心逻辑");
    core.value = useMeetingDialog(emit);
    provideMeetingCore(core.value);
    updateCoreProperties();
    isInitialized.value = true;
    console.log("会议核心逻辑初始化完成");
  }
};

const cleanupCore = () => {
  if (core.value) {
    console.log("清理会议核心逻辑");
    core.value = null;
    isInitialized.value = false;
    console.log("会议核心逻辑清理完成");
  }
};

const closeAction = ref(() => {});
const codeDoSave = ref(() => {});
const participants = ref([]);
const selectedUser = ref(null);
const currentUserId = ref(null);
const currentUserName = ref(null);
const sidebarVisible = ref(false);
const toggleSidebar = ref(() => {});
const handleResize = ref(() => {});
const participantsVisible = ref(false);
const toggleParticipants = ref(() => {});
const onlineParticipantsCount = ref(0);
const switchUser = ref(() => {});

const isRecording = ref(false);
const isCurrentUserHost = ref<() => boolean>(() => false);
const raisedHands = ref(new Set<any>());
const isMuteAll = ref(false);
const isVideoOffAll = ref(false);

const toggleRecording = ref(() => {});
const endMeeting = ref(() => {});
const leaveMeeting = ref(() => {});
const toggleRaiseHand = ref((userId: any) => {});
const toggleMuteAll = ref(() => {});
const toggleVideoOffAll = ref(() => {});

const updateCoreProperties = () => {
  if (core.value) {
    closeAction.value = core.value.closeAction;
    codeDoSave.value = core.value.codeDoSave;
    participants.value = core.value.participants;
    selectedUser.value = core.value.selectedUser;
    currentUserId.value = core.value.currentUserId;
    currentUserName.value = core.value.currentUserName;
    sidebarVisible.value = core.value.sidebarVisible;
    toggleSidebar.value = core.value.toggleSidebar;
    handleResize.value = core.value.handleResize;
    participantsVisible.value = core.value.participantsVisible;
    toggleParticipants.value = core.value.toggleParticipants;
    onlineParticipantsCount.value = core.value.onlineParticipantsCount;
    switchUser.value = core.value.switchUser;
    isRecording.value = core.value.isRecording || false;
    isCurrentUserHost.value = core.value.isCurrentUserHost || (() => false);
    raisedHands.value = core.value.raisedHands || new Set();
    isMuteAll.value = core.value.isMuteAll || false;
    isVideoOffAll.value = core.value.isVideoOffAll || false;
    toggleRecording.value = core.value.toggleRecording || (() => {});
    endMeeting.value = core.value.endMeeting || (() => {});
    leaveMeeting.value = core.value.leaveMeeting || (() => {});
    toggleRaiseHand.value = core.value.toggleRaiseHand || (() => {});
    toggleMuteAll.value = core.value.toggleMuteAll || (() => {});
    toggleVideoOffAll.value = core.value.toggleVideoOffAll || (() => {});
  }
};

const meetingMetaCollapsed = ref(false);

const toggleMeetingMeta = () => {
  meetingMetaCollapsed.value = !meetingMetaCollapsed.value;
};

const isHandRaised = () => {
  if (!raisedHands.value || !currentUserId.value) {
    return false;
  }
  return raisedHands.value.has(currentUserId.value);
};

watch(
  () => props,
  () => {
    if (!core.value) {
      initializeCore();
      updateCoreProperties();
    }
  },
  { immediate: true }
);

defineExpose({
  initializeCore,
  cleanupCore,
  core,
  isInitialized
});
</script>

<template>
  <div v-if="isInitialized" class="flex h-full gap-2.5 bg-gradient-to-br from-gray-50 to-gray-200 p-2.5 rounded-xl">
    <div class="flex-1 flex flex-col gap-2.5 rounded-xl overflow-hidden shadow-lg bg-white">
      <div v-if="showMeetingInfo" class="bg-gradient-to-r from-blue-500 to-blue-400 p-2.5 text-white shadow-lg">
        <div class="flex justify-between items-center mb-3.75 flex-wrap gap-3.75">
          <div v-if="showMeetingInfo" class="flex-1 text-2xl font-semibold text-shadow-md flex items-center gap-2.5">
            {{ meetingInfo.name }}
            <button v-if="showMeetingInfo" class="bg-white hover:bg-white transition-all duration-300 ease-in-out flex rounded-md h-6 w-8 items-center justify-center" @click="toggleMeetingMeta">
              <el-icon :size="20" color="#409efc" v-if="meetingMetaCollapsed"><Minus /></el-icon>
              <el-icon :size="20" color="#409efc" v-else><Plus /></el-icon>
            </button>
          </div>
          <div v-if="showUserSwitch" class="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2.5 text-sm border border-white/30">
            <span>当前身份:</span>
            <div class="flex gap-2">
              <button
                  v-for="user in availableUsers"
                  :key="user.id"
                  class="px-3.5 py-1.5 border border-white/40 rounded-lg bg-white/10 text-white text-xs transition-all duration-300 hover:bg-white/20 hover:border-white/60 hover:-translate-y-0.5"
                  :class="{ 'bg-white/30 border-white/80 font-medium': selectedUser && selectedUser.id === user.id }"
                  @click="switchUser(user)"
              >
                {{ user.name }}
              </button>
            </div>
          </div>
          <button v-if="showSidebarToggle" size="small" class="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2 text-sm text-white transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 flex items-center gap-2" @click="toggleSidebar">
            <el-icon><Menu /></el-icon>
            {{ sidebarVisible ? '隐藏侧边栏' : '显示侧边栏' }}
          </button>
        </div>
        <div v-if="!meetingMetaCollapsed && showMeetingInfo" class="flex gap-6 flex-wrap text-sm text-white/90">
          <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">会议ID: {{ meetingInfo.id }}</span>
          <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">开始时间: {{ meetingInfo.startTime }}</span>
          <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">主持人: {{ meetingInfo.host }}</span>
          <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">当前用户: {{ currentUserName }} (ID: {{ currentUserId }})</span>
        </div>
      </div>

      <MeetingVideoPanel v-if="showVideoPanel" />

      <div v-if="showControls" class="bg-gradient-to-br from-gray-50 to-gray-200 p-5 rounded-xl shadow-md border border-blue-100/30">
        <div class="flex flex-wrap gap-2 p-4 bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl shadow-md border border-blue-100/30 animate-fade-in-up">
          <MeetingAudioControl v-if="showAudioControl" />
          <MeetingVideoControl v-if="showVideoControl" />
          <MeetingScreenShareControl v-if="showScreenShareControl" />
          <button v-if="showRecordingControl" class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md animate-pulse': isRecording }" @click="toggleRecording">
            <el-icon :size="22"><VideoCamera /></el-icon>
            <span class="mt-1 text-sm">{{ isRecording ? '停止录制' : '开始录制' }}</span>
          </button>
          <button v-if="showRaiseHandControl" class="flex-1 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 border border-blue-100/30" :class="{ 'bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md': isHandRaised() }" @click="toggleRaiseHand(currentUserId)">
            <el-icon :size="22"><Avatar /></el-icon>
            <span class="mt-1 text-sm">{{ isHandRaised() ? '放下手' : '举手' }}</span>
          </button>
          <MeetingInviteButton v-if="showInviteButton" />
          <el-dropdown v-if="showMoreButton" trigger="click">
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
          <button v-if="showEndMeetingButton && isCurrentUserHost" class="w-32 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-400 text-white shadow-md" @click="endMeeting">
            <el-icon :size="22" color="#fff"><Close /></el-icon>
            <span class="mt-1 text-sm">结束会议</span>
          </button>
          <button v-if="showLeaveMeetingButton && !isCurrentUserHost" class="w-32 flex flex-col items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-400 text-white shadow-md" @click="leaveMeeting">
            <el-icon :size="22" color="#fff"><Close /></el-icon>
            <span class="mt-1 text-sm">离开会议</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showSidebar && sidebarVisible" class="w-110 flex flex-col gap-2.5 overflow-hidden h-full bg-white rounded-xl shadow-lg p-2.5">
      <div v-if="showParticipants && participantsVisible" class="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-md border border-blue-100/30">
        <div class="px-5 py-4.5 border-b border-gray-100 font-medium text-base text-gray-800 flex justify-between items-center bg-gray-50">
          <span>参会人员 ({{ onlineParticipantsCount }}/{{ participants.length }})</span>
          <el-button size="small" class="bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 text-xs transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 flex items-center justify-center" icon="minus" @click="toggleParticipants">
            隐藏参会人员
          </el-button>
        </div>
        <div class="flex-1 overflow-y-auto min-h-0">
          <template v-for="participant in participants">
            <div :key="participant?.id || 'unknown'" class="flex items-center p-4 border-b border-gray-100 transition-all duration-300 hover:bg-gray-50 hover:translate-x-1 cursor-pointer"
                 v-if="participant && participant.id"
                 :class="{ 'opacity-70 grayscale': participant.status !== 'online' }">
              <div class="relative mr-4">
                <img v-if="participant.avatar" :src="participant.avatar" :alt="participant.name" class="w-12 h-12 rounded-full object-cover border-2 border-blue-100/30 shadow-sm transition-all duration-300 hover:border-blue-200 hover:scale-105"/>
                <div class="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm" :class="participant.status === 'online' ? 'bg-green-500 shadow-green-500/40' : 'bg-gray-400'"></div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-gray-800">{{ participant.name || '未知用户' }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ participant.role === 'host' ? '主持人' : '参会者' }}</div>
              </div>
              <div class="flex gap-3">
                <span class="text-lg text-gray-300 transition-all duration-300" :class="{ 'text-blue-500 scale-110': participant.audio }">
                  <el-icon><Microphone /></el-icon>
                </span>
                <span class="text-lg text-gray-300 transition-all duration-300" :class="{ 'text-blue-500 scale-110': participant.video }">
                  <el-icon><VideoCamera /></el-icon>
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-if="showChat" class="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-md border border-blue-100/30">
        <div class="px-5 py-4.5 border-b border-gray-100 font-medium text-base text-gray-800 flex justify-between items-center bg-gray-50">
          <span>会议聊天</span>
          <el-button v-if="!participantsVisible && showParticipants" size="small" class="bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 text-xs transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 flex items-center justify-center" icon="plus" @click="toggleParticipants">
            显示参会人员
          </el-button>
        </div>
        <MeetingChatPanel />
      </div>
    </div>
  </div>
  <div v-else class="flex flex-col items-center justify-center h-full gap-5 bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-10">
    <el-icon class="text-4xl text-blue-500 animate-spin"><Loading /></el-icon>
    <span class="text-base text-gray-600 font-medium">会议初始化中...</span>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
