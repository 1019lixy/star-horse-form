<script setup lang="ts">
import { useMeetingCore } from "./meeting-core-context";

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
  maximizeScreenShareForParticipant
} = useMeetingCore();
</script>

<template>
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
          <el-icon><Close /></el-icon>
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
        <div
          :key="item?.id || 'unknown'"
          class="video-item"
          v-if="item.id !== currentUserId"
          :class="{ offline: item.status !== 'online' }"
        >
          <div class="video-preview">
            <template v-if="item.status === 'online'">
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
              <img v-if="!hasParticipantStream(item.id)" :src="item.avatar" :alt="item.name" class="avatar"/>
            </template>
            <img v-else :src="item.avatar" :alt="item.name" class="avatar"/>

            <div class="participant-status">
              <div class="status-indicator" :class="item.status"></div>
              <span class="participant-name">{{ item.name }}</span>
              <span v-if="item.role === 'host'" class="host-badge">主持人</span>
              <span v-if="item.status === 'online' && hasParticipantScreenShare(item.id)" class="screen-share-badge">屏幕共享</span>
              <button
                v-if="item.status === 'online' && hasParticipantScreenShare(item.id)"
                class="maximize-screen-share-btn"
                @click="maximizeScreenShareForParticipant(item.id)"
              >
                <el-icon><FullScreen /></el-icon>
                最大化
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* 视频区域 */
.video-area {
  flex: 1;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 24px;
  overflow-y: auto;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 视频网格 */
.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  transition: all 0.3s ease;
}

/* 视频项 */
.video-item {
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(64, 158, 255, 0.1);
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.video-item:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
  border-color: rgba(64, 158, 255, 0.3);
}

.video-item.offline {
  opacity: 0.7;
  filter: grayscale(30%);
  animation: fadeInUp 0.4s ease-out 0.1s both;
}

/* 本地视频特殊样式 */
.video-item.local-video {
  border: 3px solid #409eff;
  box-shadow: 0 0 15px rgba(64, 158, 255, 0.4);
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

/* 视频预览区域 */
.video-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
}

.video-preview:hover {
  transform: scale(1.02);
}

/* 视频元素 */
.local-video-element,
.remote-video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

/* 视频占位符 */
.video-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
}

/* 头像 */
.avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(64, 158, 255, 0.3);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
  border-color: rgba(64, 158, 255, 0.6);
}

/* 视频指示器 */
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
  transition: all 0.3s ease;
}

/* 参与者状态 */
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
  transition: all 0.3s ease;
}

.participant-status:hover {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5));
}

/* 状态指示器 */
.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #909399;
  transition: all 0.3s ease;
  flex-shrink: 0;
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

/* 参与者名称 */
.participant-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 主持人徽章 */
.host-badge {
  background-color: #409eff;
  color: #ffffff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 屏幕共享徽章 */
.screen-share-badge {
  background-color: #67c23a;
  color: #ffffff;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  animation: slideInRight 0.3s ease-out 0.1s both;
}

/* 屏幕共享视频项 */
.video-item.screen-share {
  border: 2px solid #67c23a;
  box-shadow: 0 0 15px rgba(103, 194, 58, 0.3);
}

/* 最大化屏幕共享按钮 */
.maximize-screen-share-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.maximize-screen-share-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
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
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 屏幕共享头部 */
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
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 屏幕共享者信息 */
.screen-sharer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 退出屏幕共享按钮 */
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

/* 屏幕共享内容 */
.screen-share-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 屏幕共享视频 */
.screen-share-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .screen-share-fullscreen {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .video-area {
    padding: 16px;
  }

  .video-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .screen-share-fullscreen {
    height: 400px;
  }

  .screen-share-header {
    padding: 0 16px;
    height: 50px;
  }

  .exit-screen-share-btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .participant-status {
    padding: 8px 12px;
    font-size: 12px;
  }

  .maximize-screen-share-btn {
    padding: 4px 8px;
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .video-grid {
    grid-template-columns: 1fr;
  }

  .screen-share-fullscreen {
    height: 300px;
  }

  .screen-sharer-info {
    gap: 8px;
  }

  .participant-name {
    font-size: 12px;
  }

  .host-badge,
  .screen-share-badge {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style>