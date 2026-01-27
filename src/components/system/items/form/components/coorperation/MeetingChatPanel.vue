<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { chatMessages, chatMessagesRef, inputMessage, sendChatMessage, currentUserAvatar, currentUserName } = useMeetingCore();
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 bg-white rounded-xl overflow-hidden shadow-md">
    <div class="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-h-0 bg-gradient-to-br from-gray-50 to-gray-200 transition-all duration-300" ref="chatMessagesRef">
      <div v-for="message in chatMessages" :key="message.id" class="flex items-start gap-3 transition-all duration-300" :class="{ 'justify-end': message.isSelf }">
        <template v-if="!message.isSelf">
          <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5 border-2 border-blue-100/30 shadow-sm transition-all duration-300 hover:border-blue-200 hover:scale-105">
            <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" :alt="message.senderName" class="w-full h-full object-cover transition-all duration-300 hover:scale-110"/>
          </div>
          <div class="flex-1 max-w-[70%] min-w-0">
            <div class="flex items-center gap-2.5 transition-all duration-300">
              <span class="text-xs font-medium text-gray-600 transition-all duration-300">{{ message.senderName }}</span>
              <span class="text-xs text-gray-400 transition-all duration-300">{{ message.time }}</span>
            </div>
            <div class="mt-1.5 p-3 rounded-2xl rounded-bl-lg bg-white text-gray-800 border border-blue-100/30 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-blue-200 hover:shadow-md">
              {{ message.content }}
            </div>
          </div>
        </template>

        <template v-else>
          <div class="flex-1 max-w-[70%] min-w-0 flex flex-col items-end">
            <div class="flex items-center gap-2.5 transition-all duration-300">
              <span class="text-xs font-medium text-blue-500 transition-all duration-300">{{ message.senderName || currentUserName }}</span>
              <span class="text-xs text-gray-400 transition-all duration-300">{{ message.time }}</span>
            </div>
            <div class="mt-1.5 p-3 rounded-2xl rounded-br-lg bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-blue-500 hover:shadow-lg hover:scale-102">
              {{ message.content }}
            </div>
          </div>
          <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 mt-0.5 border-2 border-blue-100/30 shadow-sm transition-all duration-300 hover:border-blue-200 hover:scale-105">
            <img :src="currentUserAvatar" :alt="message.senderName" class="w-full h-full object-cover transition-all duration-300 hover:scale-110"/>
          </div>
        </template>
      </div>
      <div v-if="chatMessages.length === 0" class="flex items-center justify-center h-full p-10 bg-white rounded-xl shadow-sm">
        <span class="text-gray-400 text-sm">暂无消息，开始聊天吧！</span>
      </div>
    </div>
    <div class="p-4 border-t border-gray-100 flex gap-3 items-center bg-white transition-all duration-300 shadow-[0_-2px_8px_rgba(0,0,0,0.05)] focus-within:shadow-[0_-2px_12px_rgba(64,158,255,0.1)]">
      <el-input v-model="inputMessage" placeholder="输入消息..." @keyup.enter.exact="sendChatMessage" class="flex-1" />
      <button class="bg-gradient-to-br from-blue-500 to-blue-400 text-white border-none rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-300 flex items-center justify-center shadow-md flex-shrink-0 hover:from-blue-600 hover:to-blue-500 hover:shadow-lg" @click="sendChatMessage">
        <star-horse-icon iconClass="direction-up" color="#fff" />
      </button>
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