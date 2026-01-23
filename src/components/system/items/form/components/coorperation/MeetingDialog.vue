<script setup lang="ts">
import { provideMeetingCore } from "./meeting-core-context";
import { useMeetingDialog } from "./useMeetingDialog";
import MeetingVideoPanel from "./MeetingVideoPanel.vue";
import MeetingChatPanel from "./MeetingChatPanel.vue";
import MeetingControls from "./MeetingControls.vue";

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
  meetingInfo,
  participants,
  availableUsers,
  selectedUser,
  currentUserId,
  currentUserName,
  sidebarVisible,
  toggleSidebar,
  participantsVisible,
  toggleParticipants,
  onlineParticipantsCount,
  switchUser
} = core;
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
    <div class="meeting-container">
      <!-- 会议信息和视频区域 -->
      <div class="meeting-main">
        <!-- 会议信息 -->
        <div class="meeting-info">
          <div class="meeting-header">
            <div class="meeting-name">{{ meetingInfo.name }}</div>
            <div class="user-selection">
              <span>当前身份:</span>
              <div class="user-options">
                <button
                    v-for="user in availableUsers"
                    :key="user.id"
                    class="user-option-btn"
                    :class="{ 'active': selectedUser.id === user.id }"
                    @click="switchUser(user)"
                >
                  {{ user.name }}
                </button>
              </div>
            </div>
            <button class="sidebar-toggle-btn" @click="toggleSidebar">
              <el-icon><Menu /></el-icon>
              {{ sidebarVisible ? '隐藏侧边栏' : '显示侧边栏' }}
            </button>
          </div>
          <div class="meeting-meta">
            <span class="meta-item">会议ID: {{ meetingInfo.id }}</span>
            <span class="meta-item">开始时间: {{ meetingInfo.startTime }}</span>
            <span class="meta-item">主持人: {{ meetingInfo.host }}</span>
            <span class="meta-item">当前用户: {{ currentUserName }} (ID: {{ currentUserId }})</span>
          </div>
        </div>

        <!-- 视频区域 -->
        <MeetingVideoPanel />

        <!-- 会议控制栏 -->
        <MeetingControls />
      </div>

      <!-- 侧边栏 -->
      <div v-if="sidebarVisible" class="meeting-sidebar">
        <!-- 参会人员列表 -->
        <div v-if="participantsVisible" class="sidebar-section">
          <div class="section-title">
            <span>参会人员 ({{ onlineParticipantsCount }}/{{ participants.length }})</span>
            <el-button class="section-toggle-btn" icon="minus" @click="toggleParticipants">
              隐藏参会人员
            </el-button>
          </div>
          <div class="participants-list">
            <template v-for="participant in participants">
              <div :key="participant?.id || 'unknown'" class="participant-item"
                   v-if="participant && participant.id"
                   :class="{ 'offline': participant.status !== 'online' }">
                <div class="participant-avatar">
                  <img v-if="participant.avatar" :src="participant.avatar" :alt="participant.name"/>
                  <div class="status-indicator" :class="participant.status || 'offline'"></div>
                </div>
                <div class="participant-info">
                  <div class="participant-name">{{ participant.name || '未知用户' }}</div>
                  <div class="participant-role">{{ participant.role === 'host' ? '主持人' : '参会者' }}</div>
                </div>
                <div class="participant-stats">
                <span class="stat-item" :class="{ 'active': participant.audio }">
                  <el-icon><Microphone /></el-icon>
                </span>
                  <span class="stat-item" :class="{ 'active': participant.video }">
                  <el-icon><VideoCamera /></el-icon>
                </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 会议聊天 -->
        <div class="sidebar-section chat-section">
          <div class="section-title">
            <span>会议聊天</span>
            <el-button v-if="!participantsVisible" class="section-toggle-btn" icon="plus" @click="toggleParticipants">
              显示参会人员
            </el-button>
          </div>
          <MeetingChatPanel />
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<style scoped>
/* 会议容器样式 */
.meeting-container {
  display: flex;
  height: 100%;
  gap: 10px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  padding: 10px;
  border-radius: 12px;
}

/* 会议主区域 */
.meeting-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

/* 会议信息 */
.meeting-info {
  background: linear-gradient(90deg, #409eff 0%, #66b1ff 100%);
  padding: 10px;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.meeting-name {
  font-size: 20px;
  font-weight: 600;
  flex: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.user-selection {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.user-options {
  display: flex;
  gap: 8px;
}

.user-option-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.user-option-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.user-option-btn.active {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.sidebar-toggle-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.sidebar-toggle-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.meeting-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  flex-wrap: wrap;
}

.meta-item {
  display: inline-block;
  padding: 4px 12px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(5px);
}

/* 视频区域 */
.video-area {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.video-item {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.video-item:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: rgba(64, 158, 255, 0.3);
}

.video-item.offline {
  opacity: 0.7;
  filter: grayscale(30%);
}

.video-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.local-video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.local-video {
  border: 3px solid #409eff;
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.4);
}

.video-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.video-indicator {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  backdrop-filter: blur(5px);
}

.participant-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
  color: #ffffff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  backdrop-filter: blur(5px);
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #909399;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background-color: #67c23a;
  box-shadow: 0 0 10px rgba(103, 194, 58, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.participant-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.host-badge {
  background-color: #409eff;
  color: #ffffff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.screen-share-badge {
  background-color: #67c23a;
  color: #ffffff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.video-item.screen-share {
  border: 2px solid #67c23a;
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
}

/* 屏幕共享全屏显示样式 */
.screen-share-fullscreen {
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.screen-share-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4));
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.screen-sharer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.exit-screen-share-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.exit-screen-share-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.screen-share-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-share-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.remote-video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.participant-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.control-btn {
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.control-btn:hover {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.control-btn.active {
  background-color: #409eff;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

/* 会议控制栏 */
.meeting-controls {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  align-items: center;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.meeting-controls .control-btn {
  flex: 1;
  border-radius: 8px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #303133;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.meeting-controls .control-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
}

.meeting-controls .control-btn.active {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  border-color: #409eff;
}

.meeting-controls .control-btn.danger {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: #ffffff;
  border-color: #f56c6c;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
}

.meeting-controls .control-btn.danger:hover {
  background: linear-gradient(135deg, #f78989 0%, #f9a9a9 100%);
  transform: translateY(-1px);
}

/* 侧边栏 */
.meeting-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  height: 100%;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.sidebar-section {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.section-title {
  padding: 18px 20px;
  border-bottom: 1px solid #f0f2f5;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.section-toggle-btn {
  background-color: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
}

.section-toggle-btn:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
  transform: translateY(-1px);
}

/* 参会人员列表 */
.participants-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.participant-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s ease;
  cursor: pointer;
}

.participant-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.participant-item.offline {
  opacity: 0.7;
  filter: grayscale(30%);
}

.participant-avatar {
  position: relative;
  margin-right: 16px;
}

.participant-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.participant-avatar:hover img {
  border-color: rgba(64, 158, 255, 0.6);
  transform: scale(1.05);
}

.participant-avatar .status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.participant-info {
  flex: 1;
  min-width: 0;
}

.participant-role {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.participant-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  font-size: 18px;
  color: #c0c4cc;
  transition: all 0.3s ease;
}

.stat-item.active {
  color: #409eff;
  transform: scale(1.1);
}

/* 会议聊天 */
.chat-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.chat-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  background-color: #f8f9fa;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: all 0.3s ease;
}

.chat-message:hover {
  transform: translateX(4px);
}

.chat-message.self {
  justify-content: flex-end;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 2px;
  border: 2px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.message-avatar:hover {
  border-color: rgba(64, 158, 255, 0.6);
  transform: scale(1.05);
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
}

.chat-message.self .message-body {
  align-items: flex-end;
}

.message-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

.chat-message.self .message-header {
  justify-content: flex-end;
  flex-direction: row-reverse;
}

.message-sender {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.chat-message.self .message-sender {
  color: #409eff;
}

.message-time {
  font-size: 11px;
  color: #909399;
}

.message-content {
  padding: 12px 16px;
  border-radius: 20px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.chat-message:not(.self) .message-content {
  background-color: #ffffff;
  color: #303133;
  border-bottom-left-radius: 6px;
  border: 1px solid rgba(64, 158, 255, 0.1);
}

.chat-message.self .message-content {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #ffffff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 1px 3px rgba(64, 158, 255, 0.3);
}

.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 12px;
  align-items: center;
  background-color: #ffffff;
}

.chat-input .el-input {
  flex: 1;
}

.chat-input .el-input__inner {
  border-radius: 8px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.chat-input .el-input__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.send-btn {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.send-btn:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #91cfff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 滚动条样式 */
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .meeting-container {
    flex-direction: column;
  }

  .meeting-sidebar {
    width: 100%;
    max-height: 320px;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .meeting-container {
    padding: 12px;
  }

  .meeting-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .meeting-meta {
    flex-direction: column;
    gap: 8px;
  }

  .meeting-controls {
    flex-wrap: wrap;
  }

  .meeting-controls .control-btn {
    flex: 1 1 calc(50% - 6px);
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>