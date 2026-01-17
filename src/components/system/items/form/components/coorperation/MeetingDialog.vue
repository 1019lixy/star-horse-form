<script setup lang="ts">

import {ref, computed, onMounted, watch, onUnmounted} from "vue";
import {WebRTCCore, getWebRTCCoreInstance} from "@/utils/webrtc/webrtc-core";
import {VideoManager, DEFAULT_VIDEO_CONSTRAINTS} from "@/utils/webrtc/video-manager";
import {AudioManager, DEFAULT_AUDIO_CONSTRAINTS} from "@/utils/webrtc/audio-manager";
import {RecordingManager, DEFAULT_RECORDING_OPTIONS} from "@/utils/webrtc/recording-manager";
import {ScreenShareManager, DEFAULT_SCREEN_SHARE_CONSTRAINTS} from "@/utils/webrtc/screen-share-manager";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "update:visible", visible: boolean): void;
}>();

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const closeAction = () => {
  emit("update:visible", false);
};

const codeDoSave = () => {
  emit("save");
};

// 模拟会议信息
const meetingInfo = ref({
  id: "MEET123456",
  name: "项目进度讨论会议",
  startTime: new Date().toLocaleString(),
  endTime: new Date(Date.now() + 60 * 60 * 1000).toLocaleString(),
  host: "张三",
  hostAvatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
  password: "123456",
  duration: 60 // 会议时长（分钟）
});

// 模拟参会人员
const participants = ref([
  {id: 1, name: "张三", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png", role: "host", status: "online", audio: true, video: true},
  {id: 2, name: "李四", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png", role: "participant", status: "online", audio: false, video: true},
  {id: 3, name: "王五", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png", role: "participant", status: "online", audio: true, video: false},
  {id: 4, name: "赵六", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png", role: "participant", status: "offline", audio: false, video: false}
]);

// 模拟会议聊天消息
const chatMessages = ref([
  {id: 1, senderId: 1, senderName: "张三", content: "大家好，会议开始了", time: "10:00", isSelf: false},
  {id: 2, senderId: 2, senderName: "李四", content: "好的", time: "10:01", isSelf: false},
  {id: 3, senderId: 3, senderName: "王五", content: "我已准备就绪", time: "10:02", isSelf: false}
]);

// 输入消息内容
const inputMessage = ref('');

// 聊天消息容器引用
const chatMessagesRef = ref<HTMLElement | null>(null);

// 滚动到最新消息
const scrollToLatestMessage = () => {
  setTimeout(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  }, 100);
};

// 发送聊天消息
const sendChatMessage = () => {
  if (inputMessage.value.trim()) {
    const newMessage = {
      id: chatMessages.value.length + 1,
      senderId: 0,
      senderName: "我",
      content: inputMessage.value,
      time: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'}),
      isSelf: true
    };
    chatMessages.value.push(newMessage);
    inputMessage.value = '';
    // 滚动到最新消息
    scrollToLatestMessage();
  }
};

// 切换参会者音频状态
const toggleParticipantAudio = (participantId: number) => {
  const participant = participants.value.find(p => p.id === participantId);
  if (participant) {
    participant.audio = !participant.audio;
  }
};

// 切换参会者视频状态
const toggleParticipantVideo = (participantId: number) => {
  const participant = participants.value.find(p => p.id === participantId);
  if (participant) {
    participant.video = !participant.video;
  }
};

// 邀请参会者
const inviteParticipants = () => {
  // 这里可以实现邀请参会者的逻辑
  alert('邀请参会者功能');
};



// 结束会议
const endMeeting = () => {
  if (confirm('确定要结束会议吗？')) {
    // 停止所有WebRTC相关功能
    stopAllWebRTC();
    closeAction();
  }
};

// 侧边栏显示状态
const sidebarVisible = ref(true);

// 切换侧边栏显示/隐藏
const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

// 参会人员列表显示状态
const participantsVisible = ref(true);

// 切换参会人员列表显示/隐藏
const toggleParticipants = () => {
  participantsVisible.value = !participantsVisible.value;
};

// WebRTC相关状态
const isAudioEnabled = ref(false);
const isVideoEnabled = ref(false);
const isRecording = ref(false);
const isScreenSharing = ref(false);
const localStreamRef = ref<HTMLVideoElement | null>(null);

// WebRTC实例
let webRTCCore: WebRTCCore;
let videoManager: VideoManager;
let audioManager: AudioManager;
let recordingManager: RecordingManager;
let screenShareManager: ScreenShareManager;

// 初始化WebRTC实例
const initWebRTC = () => {
  // 初始化核心实例
  webRTCCore = getWebRTCCoreInstance({
    onConnectionStateChange: (state) => {
      console.log('Connection state:', state);
    },
    onIceConnectionStateChange: (state) => {
      console.log('ICE connection state:', state);
    },
    onIceCandidate: (candidate) => {
      console.log('ICE candidate:', candidate);
      // 这里可以发送ICE候选者到信令服务器
    },
    onTrack: (event) => {
      console.log('Remote track:', event.track);
      // 这里可以处理远程轨道
    }
  });

  // 初始化视频管理器
  videoManager = new VideoManager({
    defaultConstraints: DEFAULT_VIDEO_CONSTRAINTS,
    onStreamAcquired: (stream) => {
      if (localStreamRef.value) {
        localStreamRef.value.srcObject = stream;
      }
      isVideoEnabled.value = true;
      webRTCCore.addLocalStream(stream);
    },
    onStreamStopped: () => {
      if (localStreamRef.value) {
        localStreamRef.value.srcObject = null;
      }
      isVideoEnabled.value = false;
      webRTCCore.removeLocalStream();
    },
    onError: (error) => {
      console.error('Video manager error:', error);
      alert('获取摄像头失败: ' + error.message);
    }
  });

  // 初始化音频管理器
  audioManager = new AudioManager({
    defaultConstraints: DEFAULT_AUDIO_CONSTRAINTS,
    onStreamAcquired: (stream) => {
      webRTCCore.addLocalStream(stream);
    },
    onStreamStopped: () => {
      webRTCCore.removeLocalStream();
    },
    onError: (error) => {
      console.error('Audio manager error:', error);
      alert('获取麦克风失败: ' + error.message);
    }
  });

  // 初始化录制管理器
  recordingManager = new RecordingManager({
    mimeType: DEFAULT_RECORDING_OPTIONS.mimeType,
    videoBitsPerSecond: DEFAULT_RECORDING_OPTIONS.videoBitsPerSecond,
    audioBitsPerSecond: DEFAULT_RECORDING_OPTIONS.audioBitsPerSecond,
    frameRate: DEFAULT_RECORDING_OPTIONS.frameRate,
    onStart: () => {
      isRecording.value = true;
    },
    onStop: (blob) => {
      isRecording.value = false;
      // 保存录制文件
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    onError: (error) => {
      console.error('Recording manager error:', error);
      alert('录制失败: ' + error.message);
    }
  });

  // 初始化屏幕共享管理器
  screenShareManager = new ScreenShareManager({
    onStreamAcquired: (stream) => {
      if (localStreamRef.value) {
        localStreamRef.value.srcObject = stream;
      }
      isScreenSharing.value = true;
      // 替换本地视频流
      webRTCCore.removeLocalStream();
      webRTCCore.addLocalStream(stream);
    },
    onStreamStopped: () => {
      // 恢复摄像头视频
      if (isVideoEnabled.value) {
        videoManager.getCameraStream();
      } else {
        if (localStreamRef.value) {
          localStreamRef.value.srcObject = null;
        }
      }
      isScreenSharing.value = false;
    },
    onError: (error) => {
      console.error('Screen share manager error:', error);
      alert('屏幕共享失败: ' + error.message);
    }
  });
};

// 切换音频
const toggleAudio = async () => {
  if (!audioManager) return;

  if (isAudioEnabled.value) {
    // 关闭音频
    audioManager.stopStream();
    isAudioEnabled.value = false;
  } else {
    // 开启音频
    try {
      await audioManager.getMicrophoneStream();
      isAudioEnabled.value = true;
    } catch (error) {
      console.error('Error starting audio:', error);
    }
  }
};

// 切换视频
const toggleVideo = async () => {
  if (!videoManager) return;

  if (isVideoEnabled.value) {
    // 关闭视频
    videoManager.stopStream();
    isVideoEnabled.value = false;
  } else {
    // 开启视频
    try {
      await videoManager.getCameraStream();
      isVideoEnabled.value = true;
    } catch (error) {
      console.error('Error starting video:', error);
    }
  }
};

// 切换屏幕共享
const toggleScreenShare = async () => {
  if (!screenShareManager) return;

  if (isScreenSharing.value) {
    // 停止屏幕共享
    screenShareManager.stopScreenShare();
    isScreenSharing.value = false;
  } else {
    // 开始屏幕共享
    try {
      await screenShareManager.startScreenShare();
      isScreenSharing.value = true;
    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }
};

// 切换录制
const toggleRecording = () => {
  if (!recordingManager) return;

  if (isRecording.value) {
    // 停止录制
    recordingManager.stopRecording();
    isRecording.value = false;
  } else {
    // 开始录制
    try {
      // 获取所有流进行录制
      const streams: MediaStream[] = [];
      if (videoManager.getCurrentStream()) {
        streams.push(videoManager.getCurrentStream()!);
      }
      if (audioManager.getCurrentStream()) {
        streams.push(audioManager.getCurrentStream()!);
      }
      if (screenShareManager.getCurrentStream()) {
        streams.push(screenShareManager.getCurrentStream()!);
      }

      if (streams.length > 0) {
        const mergedStream = RecordingManager.mergeStreams(streams);
        recordingManager.startRecording(mergedStream);
        isRecording.value = true;
      } else {
        alert('没有可录制的流');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('开始录制失败: ' + (error as Error).message);
    }
  }
};

// 停止所有WebRTC相关功能
const stopAllWebRTC = () => {
  // 停止录制
  if (recordingManager && isRecording.value) {
    recordingManager.stopRecording();
  }

  // 停止屏幕共享
  if (screenShareManager && isScreenSharing.value) {
    screenShareManager.stopScreenShare();
  }

  // 停止视频
  if (videoManager && isVideoEnabled.value) {
    videoManager.stopStream();
  }

  // 停止音频
  if (audioManager && isAudioEnabled.value) {
    audioManager.stopStream();
  }

  // 关闭WebRTC连接
  if (webRTCCore) {
    webRTCCore.close();
  }
};

// 清理资源
const cleanupWebRTC = () => {
  stopAllWebRTC();
};

// 计算在线参会人数
const onlineParticipantsCount = computed(() => {
  return participants.value.filter(p => p.status === 'online').length;
});

// 组件挂载时滚动到最新消息并初始化WebRTC
onMounted(() => {
  scrollToLatestMessage();
  initWebRTC();
});

// 组件卸载时清理WebRTC资源
onUnmounted(() => {
  cleanupWebRTC();
});

// 监听消息变化，自动滚动到最新消息
watch(
  () => chatMessages.value,
  () => {
    scrollToLatestMessage();
  },
  { deep: true }
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
    <div class="meeting-container">
      <!-- 会议信息和视频区域 -->
      <div class="meeting-main">
        <!-- 会议信息 -->
        <div class="meeting-info">
          <div class="meeting-header">
            <div class="meeting-name">{{ meetingInfo.name }}</div>
            <button class="sidebar-toggle-btn" @click="toggleSidebar">
              <i class="el-icon-menu"></i>
              {{ sidebarVisible ? '隐藏侧边栏' : '显示侧边栏' }}
            </button>
          </div>
          <div class="meeting-meta">
            <span class="meta-item">会议ID: {{ meetingInfo.id }}</span>
            <span class="meta-item">开始时间: {{ meetingInfo.startTime }}</span>
            <span class="meta-item">主持人: {{ meetingInfo.host }}</span>
          </div>
        </div>

        <!-- 视频区域 -->
        <div class="video-area">
          <div class="video-grid">
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
                </div>
              </div>
            </div>

            <!-- 远程参与者视频 -->
            <div v-for="participant in participants" :key="participant.id" class="video-item" :class="{ 'offline': participant.status !== 'online' }">
              <div class="video-preview">
                <img v-if="!participant.video" :src="participant.avatar" :alt="participant.name" class="avatar" />
                <div v-else class="video-placeholder">
                  <img :src="participant.avatar" :alt="participant.name" class="avatar" />
                  <div class="video-indicator">视频开启</div>
                </div>
                <div class="participant-status">
                  <div class="status-indicator" :class="participant.status"></div>
                  <span class="participant-name">{{ participant.name }}</span>
                  <span v-if="participant.role === 'host'" class="host-badge">主持人</span>
                </div>
                <div class="participant-controls">
                  <button
                    class="control-btn"
                    :class="{ 'active': participant.audio }"
                    @click="toggleParticipantAudio(participant.id)"
                  >
                    <i class="el-icon-microphone"></i>
                  </button>
                  <button
                    class="control-btn"
                    :class="{ 'active': participant.video }"
                    @click="toggleParticipantVideo(participant.id)"
                  >
                    <i class="el-icon-video-camera"></i>
                  </button>
                </div>
              </div>
            </div>
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
            <div v-for="participant in participants" :key="participant.id" class="participant-item" :class="{ 'offline': participant.status !== 'online' }">
              <div class="participant-avatar">
                <img :src="participant.avatar" :alt="participant.name" />
                <div class="status-indicator" :class="participant.status"></div>
              </div>
              <div class="participant-info">
                <div class="participant-name">{{ participant.name }}</div>
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
              <div v-for="message in chatMessages" :key="message.id" class="chat-message" :class="{ 'self': message.isSelf }">
                <div class="message-header">
                  <span class="message-sender">{{ message.senderName }}</span>
                  <span class="message-time">{{ message.time }}</span>
                </div>
                <div class="message-content">{{ message.content }}</div>
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
}

.meeting-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
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
  flex-direction: column;
  gap: 5px;
}

.chat-message.self {
  align-items: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.chat-message.self .message-header {
  flex-direction: row-reverse;
}

.message-sender {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.message-time {
  font-size: 11px;
  color: #909399;
}

.message-content {
  max-width: 80%;
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
