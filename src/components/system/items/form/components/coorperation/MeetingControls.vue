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
  return raisedHands.value.has(currentUserId.value);
};
</script>

<template>
  <div class="meeting-controls">
    <MeetingAudioControl />
    <MeetingVideoControl />
    <MeetingScreenShareControl />
    <button class="control-btn" :class="{ active: isRecording }" @click="toggleRecording">
      <el-icon><VideoCamera /></el-icon>
      <span>{{ isRecording ? '停止录制' : '开始录制' }}</span>
    </button>
    <button class="control-btn" :class="{ active: isHandRaised() }" @click="toggleRaiseHand(currentUserId)">
      <el-icon><Hand /></el-icon>
      <span>{{ isHandRaised() ? '放下手' : '举手' }}</span>
    </button>
    <MeetingInviteButton />
    <el-dropdown trigger="click">
      <button class="control-btn">
        <el-icon><More /></el-icon>
        <span>更多</span>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="toggleMuteAll">
            <el-icon><Microphone /></el-icon>
            <span>{{ isMuteAll ? '取消静音所有' : '静音所有' }}</span>
          </el-dropdown-item>
          <el-dropdown-item @click="toggleVideoOffAll">
            <el-icon><VideoCamera /></el-icon>
            <span>{{ isVideoOffAll ? '开启所有视频' : '关闭所有视频' }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <button class="control-btn danger" @click="endMeeting">
      <el-icon><Close /></el-icon>
      <span>结束会议</span>
    </button>
  </div>
</template>

<style scoped>
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

/* 控制按钮 */
.control-btn {
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
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.control-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.control-btn:hover::before {
  left: 100%;
}

.control-btn:hover {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.control-btn.active {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  border-color: #409eff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  }
}

.control-btn.danger {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  color: #ffffff;
  border-color: #f56c6c;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
}

.control-btn.danger:hover {
  background: linear-gradient(135deg, #f78989 0%, #f9a9a9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.6);
}

.control-btn.danger::before {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
}

/* 控制按钮图标 */
.control-btn i {
  font-size: 16px;
  transition: all 0.3s ease;
}

.control-btn:hover i {
  transform: scale(1.1);
}

.control-btn.active i {
  transform: scale(1.1);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .meeting-controls {
    padding: 16px;
    gap: 10px;
  }

  .control-btn {
    height: 40px;
    font-size: 13px;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .meeting-controls {
    flex-wrap: wrap;
    padding: 12px;
    gap: 8px;
  }

  .control-btn {
    flex: 1 1 calc(50% - 4px);
    height: 40px;
    font-size: 12px;
    gap: 6px;
  }

  .control-btn i {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .meeting-controls {
    flex-direction: column;
  }

  .control-btn {
    flex: 1 1 100%;
  }
}
</style>