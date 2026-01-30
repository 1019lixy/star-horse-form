<script setup lang="ts">
import { ref, watch } from "vue";
import { provideMeetingCore } from "./meeting-core-context";
import { useMeetingDialog } from "./useMeetingDialog";
import MeetingVideoPanel from "./MeetingVideoPanel.vue";
import MeetingChatPanel from "./MeetingChatPanel.vue";
import MeetingControls from "./MeetingControls.vue";
import {meetingInfo,availableUsers} from "@/components/system/items/form/components/coorperation/script/dataConfig";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "update:visible", visible: boolean): void;
}>();

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const core = useMeetingDialog(emit);
provideMeetingCore(core);

const {
  closeAction,
  codeDoSave,
  participants,
  selectedUser,
  currentUserId,
  currentUserName,
  sidebarVisible,
  toggleSidebar,
  handleResize,
  participantsVisible,
  toggleParticipants,
  onlineParticipantsCount,
  switchUser,
  isInitialized
} = core;

// 会议信息折叠状态
const meetingMetaCollapsed = ref(false);

// 切换会议信息折叠状态
const toggleMeetingMeta = () => {
  meetingMetaCollapsed.value = !meetingMetaCollapsed.value;
};

// 监听 dialog 显示状态，当 dialog 显示时重新计算 sidebarVisible 的值
watch(
  () => props.visible,
  (newVisible) => {
    if (newVisible) {
      handleResize();
    }
  }
);
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="closeAction"
      :selfFunc="true"
      :source="3"
      :full-screen="false"
      :compSize="'default'"
      @merge="codeDoSave"
      boxHeight="70%"
      boxWidth="80%"
      :title="title??'在线会议'"
  >
    <div v-if="isInitialized" class="flex h-full gap-2.5 bg-gradient-to-br from-gray-50 to-gray-200 p-2.5 rounded-xl">
      <!-- 会议信息和视频区域 -->
      <div class="flex-1 flex flex-col gap-2.5 rounded-xl overflow-hidden shadow-lg bg-white">
        <!-- 会议信息 -->
        <div class="bg-gradient-to-r from-blue-500 to-blue-400 p-2.5 text-white shadow-lg">
          <div class="flex justify-between items-center mb-3.75 flex-wrap gap-3.75">
            <div class="flex-1 text-2xl font-semibold text-shadow-md flex items-center gap-2.5">
              {{ meetingInfo.name }}
              <button class="bg-white hover:bg-white transition-all duration-300 ease-in-out flex rounded-md h-6 w-8 items-center justify-center" @click="toggleMeetingMeta">
                <el-icon :size="20" color="#409efc" v-if="meetingMetaCollapsed"><Minus /></el-icon>
                <el-icon :size="20" color="#409efc"  v-else><Plus /></el-icon>
              </button>
            </div>
            <div class="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2.5 text-sm border border-white/30">
              <span>当前身份:</span>
              <div class="flex gap-2">
                <button
                    v-for="user in availableUsers"
                    :key="user.id"
                    class="px-3.5 py-1.5 border border-white/40 rounded-lg bg-white/10 text-white text-xs transition-all duration-300 hover:bg-white/20 hover:border-white/60 hover:-translate-y-0.5"
                    :class="{ 'bg-white/30 border-white/80 font-medium': selectedUser.id === user.id }"
                    @click="switchUser(user)"
                >
                  {{ user.name }}
                </button>
              </div>
            </div>
            <button size="small" class="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2 text-sm text-white transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 flex items-center gap-2" @click="toggleSidebar">
              <el-icon><Menu /></el-icon>
              {{ sidebarVisible ? '隐藏侧边栏' : '显示侧边栏' }}
            </button>
          </div>
          <div v-if="!meetingMetaCollapsed" class="flex gap-6 flex-wrap text-sm text-white/90">
            <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">会议ID: {{ meetingInfo.id }}</span>
            <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">开始时间: {{ meetingInfo.startTime }}</span>
            <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">主持人: {{ meetingInfo.host }}</span>
            <span class="inline-block px-3 py-1 bg-black/10 backdrop-blur-sm rounded-full">当前用户: {{ currentUserName }} (ID: {{ currentUserId }})</span>
          </div>
        </div>

        <!-- 视频区域 -->
        <MeetingVideoPanel />

        <!-- 会议控制栏 -->
        <div class="bg-gradient-to-br from-gray-50 to-gray-200 p-5 rounded-xl shadow-md border border-blue-100/30">
          <MeetingControls />
        </div>
      </div>

      <!-- 侧边栏 -->
      <div v-if="sidebarVisible" class="w-110 flex flex-col gap-2.5 overflow-hidden h-full bg-white rounded-xl shadow-lg p-2.5">
        <!-- 参会人员列表 -->
        <div v-if="participantsVisible" class="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-md border border-blue-100/30">
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

        <!-- 会议聊天 -->
        <div class="bg-white rounded-xl overflow-hidden flex flex-col flex-1 min-h-0 shadow-md border border-blue-100/30">
          <div class="px-5 py-4.5 border-b border-gray-100 font-medium text-base text-gray-800 flex justify-between items-center bg-gray-50">
            <span>会议聊天</span>
            <el-button v-if="!participantsVisible" size="small" class="bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 text-xs transition-all duration-300 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500 flex items-center justify-center" icon="plus" @click="toggleParticipants">
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
  </star-horse-dialog>
</template>

<style scoped>
/* 自定义滚动条样式 */
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
