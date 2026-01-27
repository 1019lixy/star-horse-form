<script setup lang="ts">
import { ref } from "vue";
import {useMeetingCore} from "@/components/system/items/form/components/coorperation/meeting-core-context";

const {
  currentScreenSharer,
  isScreenSharing,
  localStreamRef,
  participants,
  currentUserId,
  remoteStreamEntries,
  hasParticipantStream,
  hasParticipantScreenShare,
  setRemoteVideoRef,
  maximizeScreenShareForParticipant,
  isInitialized
} = useMeetingCore();

// 参与者状态显示状态
const participantStatusVisible = ref<Map<string, boolean>>(new Map());

// 切换参与者状态显示
const toggleParticipantStatus = (participantId: string) => {
  const currentVisible = participantStatusVisible.value.get(participantId) || false;
  participantStatusVisible.value.set(participantId, !currentVisible);
};
</script>

<template>
  <div class="flex-1 bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-6 overflow-y-auto shadow-inner">
    <div v-if="isInitialized">
      <!-- 屏幕共享全屏显示 -->
      <div v-if="currentScreenSharer" class="relative w-full h-[600px] md:h-[500px] sm:h-[400px] xs:h-[300px] bg-black rounded-xl overflow-hidden shadow-lg">
        <div class="absolute top-0 left-0 right-0 h-15 bg-gradient-to-b from-black/80 to-black/40 text-white flex items-center justify-between px-6 sm:px-4 z-10 backdrop-blur-md">
          <div class="flex items-center gap-3 sm:gap-2.5">
            <div class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-green-500/40 animate-pulse"></div>
            <span class="font-medium text-white sm:text-sm">{{ currentScreenSharer.name }}</span>
            <span class="bg-green-500 text-white text-xs px-2 py-0.75 rounded-md shadow-md">屏幕共享</span>
          </div>
          <button class="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2 sm:px-3 sm:py-1.5 text-sm text-white transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 flex items-center gap-2">
            <el-icon><Close /></el-icon>
            退出全屏
          </button>
        </div>
        <div class="w-full h-full flex items-center justify-center">
          <video
            autoplay
            playsinline
            class="w-full h-full object-contain"
            :srcObject="currentScreenSharer.stream"
          ></video>
        </div>
      </div>

      <!-- 普通视频网格（当没有屏幕共享时显示） -->
      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] xs:grid-cols-1 gap-5 md:gap-4 sm:gap-3 transition-all duration-300">
        <!-- 本地视频 -->
        <div class="bg-white rounded-xl overflow-hidden shadow-lg border-3 border-blue-500 shadow-blue-500/20">
          <div class="relative w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center overflow-hidden">
            <video
              ref="localStreamRef"
              class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300"
              autoplay
              muted
              playsinline
            ></video>
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/40 text-white p-3 sm:p-2.5 backdrop-blur-md transition-all duration-300 hover:from-black/90 hover:to-black/50">
              <div class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-green-500/40 animate-pulse flex-shrink-0 cursor-pointer" @click="toggleParticipantStatus('local')"></div>
              <template v-if="participantStatusVisible.get('local') || !localStreamRef?.value?.srcObject">
                <span class="flex-1 font-medium text-white truncate">{{ '我' }}</span>
                <span class="bg-blue-500 text-white text-xs px-2 py-0.75 rounded-md shadow-md flex-shrink-0">本地</span>
                <span v-if="isScreenSharing" class="bg-green-500 text-white text-xs px-2 py-0.75 rounded-md shadow-md flex-shrink-0">屏幕共享</span>
              </template>
            </div>
          </div>
        </div>

        <!-- 远程参与者视频 -->
          <template v-for="item in participants">
            <div
              :key="item?.id || 'unknown'"
              class="bg-white rounded-xl overflow-hidden shadow-md border border-blue-100/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200"
              v-if="item.id !== currentUserId"
              :class="{ 'opacity-70 grayscale': item.status !== 'online' }"
              @dblclick="item.status === 'online' && hasParticipantStream(item.id) && maximizeScreenShareForParticipant(item.id)"
            >
              <div class="relative w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center overflow-hidden">
                <template v-if="item.status === 'online'">
                  <template v-for="[streamId, streamInfo] in remoteStreamEntries">
                    <video
                      :key="streamId"
                      v-if="streamInfo?.senderId === item.id || !streamInfo.senderId"
                      :ref="setRemoteVideoRef(streamId)"
                      class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300"
                      autoplay
                      playsinline
                    ></video>
                  </template>
                  <img v-if="!hasParticipantStream(item.id)" :src="item.avatar" :alt="item.name" class="w-22.5 h-22.5 rounded-full object-cover border-3 border-blue-100/30 shadow-sm transition-all duration-300 hover:scale-110 hover:border-blue-200"/>
                </template>
                <img v-else :src="item.avatar" :alt="item.name" class="w-22.5 h-22.5 rounded-full object-cover border-3 border-blue-100/30 shadow-sm transition-all duration-300 hover:scale-110 hover:border-blue-200"/>

                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/40 text-white p-3 sm:p-2.5 backdrop-blur-md transition-all duration-300 hover:from-black/90 hover:to-black/50">
                  <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-120 hover:shadow-green-500/80" :class="item.status === 'online' ? 'bg-green-500 shadow-green-500/40 animate-pulse' : 'bg-gray-400'" @click="toggleParticipantStatus(item.id)"></div>
                  <template v-if="participantStatusVisible.get(item.id) || !hasParticipantStream(item.id)">
                    <span class="flex-1 font-medium text-white truncate sm:text-sm">{{ item.name }}</span>
                    <span v-if="item.role === 'host'" class="bg-blue-500 text-white text-xs px-2 py-0.75 rounded-md shadow-md flex-shrink-0">主持人</span>
                    <span v-if="item.status === 'online' && hasParticipantScreenShare(item.id)" class="bg-green-500 text-white text-xs px-2 py-0.75 rounded-md shadow-md flex-shrink-0">屏幕共享</span>
                    <button
                      v-if="item.status === 'online' && hasParticipantScreenShare(item.id)"
                      class="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-2 py-1 text-xs text-white transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 flex items-center gap-1 flex-shrink-0"
                      @click="maximizeScreenShareForParticipant(item.id)"
                    >
                      <el-icon><FullScreen /></el-icon>
                      最大化
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </template>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center h-full gap-5 bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl p-10">
      <el-icon class="text-4xl text-blue-500 animate-spin"><Loading /></el-icon>
      <span class="text-base text-gray-600 font-medium">视频初始化中...</span>
    </div>
  </div>
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