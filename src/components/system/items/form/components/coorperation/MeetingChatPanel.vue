<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

const { chatMessages, chatMessagesRef, inputMessage, sendChatMessage, currentUserAvatar, currentUserName } = useMeetingCore();
</script>

<template>
  <div class="chat-container">
    <div class="chat-messages" ref="chatMessagesRef">
      <div v-for="message in chatMessages" :key="message.id" class="chat-message" :class="{ self: message.isSelf }">
        <template v-if="!message.isSelf">
          <div class="message-avatar">
            <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="{{ message.senderName }}"/>
          </div>
          <div class="message-body">
            <div class="message-header">
              <span class="message-sender">{{ message.senderName }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </template>

        <template v-else>
          <div class="message-body">
            <div class="message-header">
              <span class="message-sender">{{ message.senderName || currentUserName }}</span>
              <span class="message-time">{{ message.time }}</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
          <div class="message-avatar">
            <img :src="currentUserAvatar" alt="{{ message.senderName }}"/>
          </div>
        </template>
      </div>
    </div>
    <div class="chat-input">
      <el-input v-model="inputMessage" placeholder="输入消息..." @keyup.enter.exact="sendChatMessage" />
      <button class="send-btn" @click="sendChatMessage">
        <star-horse-icon iconClass="direction-up" color="#fff" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 聊天容器 */
.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;
}

/* 聊天消息 */
.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s ease;
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message:hover {
  transform: translateX(4px);
}

/* 自己的消息 */
.chat-message.self {
  justify-content: flex-end;
}

/* 消息头像 */
.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 2px;
  border: 2px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.message-avatar:hover {
  border-color: rgba(64, 158, 255, 0.6);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.message-avatar:hover img {
  transform: scale(1.1);
}

/* 消息主体 */
.message-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
  min-width: 0;
}

.chat-message.self .message-body {
  align-items: flex-end;
}

/* 消息头部 */
.message-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.chat-message.self .message-header {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

/* 消息发送者 */
.message-sender {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
}

.chat-message.self .message-sender {
  color: #409eff;
}

/* 消息时间 */
.message-time {
  font-size: 11px;
  color: #909399;
  transition: all 0.3s ease;
}

/* 消息内容 */
.message-content {
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.message-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

/* 他人消息内容 */
.chat-message:not(.self) .message-content {
  background-color: #ffffff;
  color: #303133;
  border-bottom-left-radius: 6px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.chat-message:not(.self) .message-content:hover {
  background-color: #f8f9fa;
  border-color: rgba(64, 158, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

/* 自己消息内容 */
.chat-message.self .message-content {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #ffffff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
}

.chat-message.self .message-content:hover {
  background: linear-gradient(135deg, #3a8ee6 0%, #5ba8ff 100%);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.4);
  transform: scale(1.02);
}

/* 聊天输入区域 */
.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.chat-input:focus-within {
  box-shadow: 0 -2px 12px rgba(64, 158, 255, 0.1);
}

/* 聊天输入框 */
.chat-input .el-input {
  flex: 1;
}

.chat-input .el-input__inner {
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  padding: 10px 16px;
  font-size: 14px;
  background-color: #f8f9fa;
}

.chat-input .el-input__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  background-color: #ffffff;
  transform: scale(1.01);
}

/* 发送按钮 */
.send-btn {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0 10px;
  height: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  flex-shrink: 0;
}

.send-btn:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #91cfff 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.send-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.send-btn i {
  font-size: 18px;
  transition: all 0.3s ease;
}

.send-btn:hover i {
  transform: scale(1.1) rotate(15deg);
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: rgba(64, 158, 255, 0.05);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(64, 158, 255, 0.3);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(64, 158, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chat-messages {
    padding: 16px;
    gap: 12px;
  }

  .chat-input {
    padding: 12px 16px;
  }

  .message-avatar {
    width: 36px;
    height: 36px;
  }

  .message-content {
    padding: 10px 14px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .chat-messages {
    padding: 12px;
    gap: 10px;
  }

  .chat-input {
    padding: 10px 12px;
    gap: 8px;
  }

  .message-avatar {
    width: 32px;
    height: 32px;
  }

  .message-content {
    padding: 8px 12px;
    font-size: 12px;
    max-width: 80%;
  }

  .send-btn {
    padding: 0 16px;
    height: 36px;
  }

  .chat-input .el-input__inner {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 空消息状态 */
.chat-messages:empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.chat-messages:empty::before {
  content: '暂无消息，开始聊天吧！';
  text-align: center;
  padding: 40px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>