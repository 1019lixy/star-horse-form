<script setup lang="ts">
import { useMeetingDialog } from "./useMeetingDialog";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "update:visible", visible: boolean): void;
}>();

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const {
  closeAction,
  codeDoSave,
  meetingInfo,
  participants,
  chatMessages,
  inputMessage,
  chatMessagesRef,
  availableUsers,
  selectedUser,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  remoteStreamEntries,
  hasParticipantStream,
  hasParticipantScreenShare,
  switchUser,
  sendChatMessage,
  toggleParticipantAudio,
  toggleParticipantVideo,
  inviteParticipants,
  endMeeting,
  sidebarVisible,
  toggleSidebar,
  maximizeScreenShareForParticipant,
  participantsVisible,
  toggleParticipants,
  isAudioEnabled,
  isVideoEnabled,
  isRecording,
  isScreenSharing,
  currentScreenSharer,
  localStreamRef,
  setRemoteVideoRef,
  toggleAudio,
  toggleVideo,
  toggleScreenShare,
  toggleRecording,
  onlineParticipantsCount
} = useMeetingDialog(emit);
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
              <i class="el-icon-menu"></i>
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
        <div class="video-area">
          <!-- 屏幕共享全屏显示 -->
          <div v-if="currentScreenSharer" class="screen-share-fullscreen">
            <div class="screen-share-header">
              <div class="screen-sharer-info">
                <div class="status-indicator online"></div>
                <span class="participant-name">{{ currentScreenSharer.name }}</span>
                <span class="screen-share-badge">屏幕共享</span>
              </div>
              <button class="exit-screen-share-btn" @click="currentScreenSharer = null">
                <i class="el-icon-close"></i>
                退出全屏
              </button>
            </div>
            <div class="screen-share-content">
              <video
                  autoplay
                  playsinline
                  class="screen-share-video"
                  :srcObject="currentScreenSharer.stream"
              ></video>
            </div>
          </div>

          <!-- 普通视频网格（当没有屏幕共享时显示） -->
          <div v-else class="video-grid">
            <!-- 本地视频 -->
            <div class="video-item local-video">
              <div class="video-preview">
                <video
                    ref="localStreamRef"
                    class="local-video-element"
                    autoplay
                    muted
                    playsinline
                ></video>
                <div class="participant-status">
                  <div class="status-indicator online"></div>
                  <span class="participant-name">我</span>
                  <span class="host-badge">本地</span>
                  <span v-if="isScreenSharing" class="screen-share-badge">屏幕共享</span>
                </div>
              </div>
            </div>

            <!-- 远程参与者视频 -->
            <template v-for="item in participants">
              <div :key="item?.id || 'unknown'" class="video-item"
                   v-if="item.id !== currentUserId"
                   :class="{ 'offline': item.status !== 'online' }">
                <div class="video-preview">
                  <!-- 检查是否有对应的远程流 -->
                  <template v-if="item.status === 'online'">
                    <!-- 查找该参与者的远程流 -->
                    <template v-for="[streamId, streamInfo] in remoteStreamEntries">
                      <video
                          :key="streamId"
                          v-if="streamInfo?.senderId === item.id || !streamInfo.senderId"
                          :ref="setRemoteVideoRef(streamId)"
                          class="remote-video-element"
                          autoplay
                          playsinline
                      ></video>
                    </template>
                    <!-- 如果没有远程流，显示头像 -->
                    <img v-if="!hasParticipantStream(item.id)"
                         :src="item.avatar" :alt="item.name" class="avatar"/>
                  </template>
                  <img v-else :src="item.avatar" :alt="item.name" class="avatar"/>

                  <div class="participant-status">
                    <div class="status-indicator" :class="item.status"></div>
                    <span class="participant-name">{{ item.name }}</span>
                    <span v-if="item.role === 'host'" class="host-badge">主持人</span>
                    <!-- 显示屏幕共享状态 -->
                    <span v-if="item.status === 'online' && hasParticipantScreenShare(item.id)"
                          class="screen-share-badge">屏幕共享</span>
                    <!-- 屏幕共享最大化按钮 -->
                    <button v-if="item.status === 'online' && hasParticipantScreenShare(item.id)"
                            class="maximize-screen-share-btn"
                            @click="maximizeScreenShareForParticipant(item.id)">
                      <i class="el-icon-full-screen"></i>
                      最大化
                    </button>
                  </div>
                  <div class="participant-controls">
                    <button
                        class="control-btn"
                        :class="{ 'active': item.audio }"
                        @click="toggleParticipantAudio(item.id)"
                    >
                      <i class="el-icon-microphone"></i>
                    </button>
                    <button
                        class="control-btn"
                        :class="{ 'active': item.video }"
                        @click="toggleParticipantVideo(item.id)"
                    >
                      <i class="el-icon-video-camera"></i>
                    </button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 会议控制栏 -->
        <div class="meeting-controls">
          <button
              class="control-btn"
              :class="{ 'active': isAudioEnabled }"
              @click="toggleAudio"
          >
            <i class="el-icon-microphone"></i>
            <span>{{ isAudioEnabled ? '静音' : '取消静音' }}</span>
          </button>
          <button
              class="control-btn"
              :class="{ 'active': isVideoEnabled }"
              @click="toggleVideo"
          >
            <i class="el-icon-video-camera"></i>
            <span>{{ isVideoEnabled ? '关闭视频' : '开启视频' }}</span>
          </button>
          <button
              class="control-btn"
              :class="{ 'active': isScreenSharing }"
              @click="toggleScreenShare"
          >
            <i class="el-icon-monitor"></i>
            <span>{{ isScreenSharing ? '停止共享' : '共享屏幕' }}</span>
          </button>
          <button
              class="control-btn"
              :class="{ 'active': isRecording }"
              @click="toggleRecording"
          >
            <i class="el-icon-video-camera"></i>
            <span>{{ isRecording ? '停止录制' : '开始录制' }}</span>
          </button>
          <button class="control-btn" @click="inviteParticipants">
            <i class="el-icon-user-plus"></i>
            <span>邀请</span>
          </button>
          <button class="control-btn danger" @click="endMeeting">
            <i class="el-icon-close"></i>
            <span>结束会议</span>
          </button>
        </div>
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
                  <i class="el-icon-microphone"></i>
                </span>
                  <span class="stat-item" :class="{ 'active': participant.video }">
                  <i class="el-icon-video-camera"></i>
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
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessagesRef">
              <div v-for="message in chatMessages" :key="message.id" class="chat-message"
                   :class="{ 'self': message.isSelf }">
                <!-- 他人发送的消息：头像在前，消息在后 -->
                <template v-if="!message.isSelf">
                  <div class="message-avatar">
                    <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                         alt="{{ message.senderName }}"/>
                  </div>
                  <div class="message-body">
                    <div class="message-header">
                      <span class="message-sender">{{ message.senderName }}</span>
                      <span class="message-time">{{ message.time }}</span>
                    </div>
                    <div class="message-content">{{ message.content }}</div>
                  </div>
                </template>

                <!-- 自己发送的消息：消息在前，头像在后 -->
                <template v-else>
                  <div class="message-body">
                    <div class="message-header">
                      <span class="message-sender">{{ message.senderName }}</span>
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
              <el-input
                  v-model="inputMessage"
                  placeholder="输入消息..."
                  @keyup.enter.exact="sendChatMessage"
              />
              <button class="send-btn" @click="sendChatMessage">
                <i class="el-icon-send"></i>
              </button>
            </div>
          </div>
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
  gap: 20px;
}

/* 会议主区域 */
.meeting-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 会议信息 */
.meeting-info {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.meeting-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.user-selection {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  font-size: 14px;
}

.user-options {
  display: flex;
  gap: 6px;
}

.user-option-btn {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.user-option-btn:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.user-option-btn.active {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

.sidebar-toggle-btn {
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.sidebar-toggle-btn:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.meeting-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-block;
}

/* 视频区域 */
.video-area {
  flex: 1;
  background-color: #f0f2f5;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.video-item {
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.video-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.video-item.offline {
  opacity: 0.6;
}

.video-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.local-video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.local-video {
  border: 2px solid #409eff;
}

.video-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f7ff;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.video-indicator {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
}

.participant-status {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #909399;
}

.status-indicator.online {
  background-color: #67c23a;
}

.participant-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.host-badge {
  background-color: #409eff;
  color: #ffffff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.screen-share-badge {
  background-color: #67c23a;
  color: #ffffff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.video-item.screen-share {
  border: 2px solid #67c23a;
}

/* 屏幕共享全屏显示样式 */
.screen-share-fullscreen {
  position: relative;
  width: 100%;
  height: 600px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.screen-share-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 10;
}

.screen-sharer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.exit-screen-share-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.exit-screen-share-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
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
}

.participant-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.control-btn {
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.control-btn.active {
  background-color: #409eff;
  color: #ffffff;
}

/* 会议控制栏 */
.meeting-controls {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 10px;
  align-items: center;
}

.meeting-controls .control-btn {
  flex: 1;
  border-radius: 6px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  background-color: #f5f7fa;
  color: #303133;
}

.meeting-controls .control-btn:hover {
  background-color: #ecf5ff;
}

.meeting-controls .control-btn.active {
  background-color: #409eff;
  color: #ffffff;
}

.meeting-controls .control-btn.danger {
  background-color: #f56c6c;
  color: #ffffff;
}

.meeting-controls .control-btn.danger:hover {
  background-color: #f78989;
}

/* 侧边栏 */
.meeting-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
  height: 100%;
}

.sidebar-section {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.section-title {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-toggle-btn {
  background-color: transparent;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-toggle-btn:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
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
  padding: 12px 15px;
  border-bottom: 1px solid #f0f2f5;
  transition: background-color 0.3s ease;
}

.participant-item:hover {
  background-color: #f5f7fa;
}

.participant-item.offline {
  opacity: 0.6;
}

.participant-avatar {
  position: relative;
  margin-right: 12px;
}

.participant-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.participant-avatar .status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  border: 2px solid #ffffff;
}

.participant-info {
  flex: 1;
  min-width: 0;
}

.participant-role {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.participant-stats {
  display: flex;
  gap: 10px;
}

.stat-item {
  font-size: 16px;
  color: #c0c4cc;
  transition: color 0.3s ease;
}

.stat-item.active {
  color: #409eff;
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
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
}

.chat-message {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.chat-message.self {
  justify-content: flex-end;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-top: 2px;
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
  gap: 5px;
  max-width: 70%;
}

.chat-message.self .message-body {
  align-items: flex-end;
}

.message-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
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
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.chat-message:not(.self) .message-content {
  background-color: #f5f7fa;
  color: #303133;
  border-bottom-left-radius: 4px;
}

.chat-message.self .message-content {
  background-color: #409eff;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chat-input {
  padding: 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-input .el-input {
  flex: 1;
}

.send-btn {
  background-color: #409eff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  height: 36px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover {
  background-color: #66b1ff;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
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
    max-height: 300px;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

@media (max-width: 768px) {
  .meeting-meta {
    flex-direction: column;
    gap: 5px;
  }

  .meeting-controls {
    flex-wrap: wrap;
  }

  .meeting-controls .control-btn {
    flex: 1 1 calc(50% - 5px);
  }
}
</style>
