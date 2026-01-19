<script setup lang="ts">

import {ref, computed, onMounted, watch, onUnmounted} from "vue";
import {WebRTCCore, getWebRTCCoreInstance} from "@/utils/webrtc/webrtc-core";
import {VideoManager, DEFAULT_VIDEO_CONSTRAINTS} from "@/utils/webrtc/video-manager";
import {AudioManager, DEFAULT_AUDIO_CONSTRAINTS} from "@/utils/webrtc/audio-manager";
import {RecordingManager, DEFAULT_RECORDING_OPTIONS} from "@/utils/webrtc/recording-manager";
import {ScreenShareManager, DEFAULT_SCREEN_SHARE_CONSTRAINTS} from "@/utils/webrtc/screen-share-manager";
import {WebSocketService, MessageType} from "@/utils/websocket/WebSocketService";

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
const inputMessage = ref("");

// 聊天消息容器引用
const chatMessagesRef = ref<HTMLElement | null>(null);

// WebSocket服务管理
const webSocketService = ref<WebSocketService | null>(null);
const isConnected = ref(false);
const connectionStatus = ref("未连接");
const messageSubscriptions = ref<string[]>([]);

// 可选择的身份列表
const availableUsers = ref([
  { id: "user1", name: "张三", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" },
  { id: "user2", name: "李四", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" },
  { id: "user3", name: "王五", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" }
]);

// 当前选择的用户
const selectedUser = ref(availableUsers.value[0]);

// 当前用户ID和名称
const currentUserId = ref(selectedUser.value.id);
const currentUserName = ref(selectedUser.value.name);
const currentUserAvatar = ref(selectedUser.value.avatar);

// 切换用户身份
const switchUser = (user) => {
  selectedUser.value = user;
  currentUserId.value = user.id;
  currentUserName.value = user.name;
  currentUserAvatar.value = user.avatar;
  console.log("切换用户身份为:", user.name, "ID:", user.id);
};

// 滚动到最新消息
const scrollToLatestMessage = () => {
  setTimeout(() => {
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
    }
  }, 100);
};

// 初始化WebSocket服务
const initWebSocketService = () => {
  try {
    webSocketService.value = new WebSocketService({
      onChatConnected: () => {
        console.log("Chat WebSocket连接已建立");
        subscribeToMeetingMessages();
      },
      onWebRtcConnected: () => {
        console.log("WebRTC WebSocket连接已建立");
        // 注册用户
        webSocketService.value?.registerUser(currentUserId.value, "session_" + Date.now());
        console.log("用户已注册，ID:", currentUserId.value);
        subscribeToWebRtcSignaling();
      },
      onError: (error) => {
        console.error("WebSocket错误:", error);
        connectionStatus.value = "错误: " + error.message;
      },
      onDisconnected: () => {
        isConnected.value = false;
        connectionStatus.value = "已断开";
        console.log("WebSocket连接已断开");
      }
    });

    // 连接WebSocket服务器
    webSocketService.value.connect().then((connected) => {
      if (connected) {
        isConnected.value = true;
        connectionStatus.value = "已连接";
        console.log("WebSocket服务连接成功");
      } else {
        isConnected.value = false;
        connectionStatus.value = "连接失败";
        console.error("WebSocket服务连接失败");
      }
    });

    console.log("WebSocket服务初始化完成");
  } catch (error) {
    console.error("初始化WebSocket服务失败:", error);
    connectionStatus.value = "初始化失败";
  }
};

// 订阅会议消息
const subscribeToMeetingMessages = () => {
  if (!webSocketService.value) return;

  // 订阅会议消息
  const meetingSubscription = webSocketService.value.subscribeToMeetingMessages(meetingInfo.value.id, (message) => {
    handleIncomingChatMessage(message);
  });
  if (meetingSubscription) {
    messageSubscriptions.value.push(meetingSubscription);
  }
};

// 订阅WebRTC信令
const subscribeToWebRtcSignaling = () => {
  if (!webSocketService.value) return;

  // 订阅WebRTC提议
  const offerSubscription = webSocketService.value.subscribeToWebRtcOffers((message) => {
    handleIncomingWebRtcOffer(message);
  }, currentUserId.value);
  if (offerSubscription) {
    messageSubscriptions.value.push(offerSubscription);
  }

  // 订阅WebRTC应答
  const answerSubscription = webSocketService.value.subscribeToWebRtcAnswers((message) => {
    handleIncomingWebRtcAnswer(message);
  }, currentUserId.value);
  if (answerSubscription) {
    messageSubscriptions.value.push(answerSubscription);
  }

  // 订阅ICE候选者
  const iceSubscription = webSocketService.value.subscribeToIceCandidates((message) => {
    handleIncomingIceCandidate(message);
  }, currentUserId.value);
  if (iceSubscription) {
    messageSubscriptions.value.push(iceSubscription);
  }
};

// 处理接收到的聊天消息
const handleIncomingChatMessage = (message: any) => {
  try {
    // 确保消息格式正确
    if (message.content && message.senderName) {
      // 避免自己发送的消息重复显示
      if (message.senderId === currentUserId.value) {
        return;
      }
      const newMessage = {
        id: chatMessages.value.length + 1,
        senderId: message.senderId || 0,
        senderName: message.senderName,
        content: message.content,
        time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
        isSelf: false
      };
      chatMessages.value.push(newMessage);
      // 滚动到最新消息
      scrollToLatestMessage();
    }
  } catch (error) {
    console.error("处理接收到的消息失败:", error);
  }
};

// 处理接收到的WebRTC提议
const handleIncomingWebRtcOffer = (message: any) => {
  try {
    console.log("接收到WebRTC提议:", message);
    // 这里可以处理WebRTC提议，如创建应答等
    if (webRTCCore) {
      // 处理SDP提议
      webRTCCore.setRemoteDescription(message.offer).then(() => {
        // 创建并发送应答
        return webRTCCore.createAnswer();
      }).then((answer) => {
        webSocketService.value?.sendWebRtcAnswer({
          senderId: currentUserId.value,
          targetUserId: message.senderId,
          answer: answer
        });
        console.log("WebRTC应答已发送，发送者ID:", currentUserId.value, "目标用户ID:", message.senderId);
      }).catch((error) => {
        console.error("Error handling WebRTC offer:", error);
      });
    }
  } catch (error) {
    console.error("处理WebRTC提议失败:", error);
  }
};

// 处理接收到的WebRTC应答
const handleIncomingWebRtcAnswer = (message: any) => {
  try {
    console.log("接收到WebRTC应答:", message);
    // 这里可以处理WebRTC应答
    if (webRTCCore) {
      webRTCCore.setRemoteDescription(message.answer).then(() => {
        console.log("WebRTC answer handled successfully");
      }).catch((error) => {
        console.error("Error handling WebRTC answer:", error);
      });
    }
  } catch (error) {
    console.error("处理WebRTC应答失败:", error);
  }
};

// 处理接收到的ICE候选者
const handleIncomingIceCandidate = (message: any) => {
  try {
    console.log("接收到ICE候选者:", message);
    // 这里可以处理ICE候选者
    if (webRTCCore) {
      webRTCCore.addIceCandidate(message.candidate);
    }
  } catch (error) {
    console.error("处理ICE候选者失败:", error);
  }
};

// 发送聊天消息
const sendChatMessage = () => {
  if (inputMessage.value.trim()) {
    const newMessage = {
      id: chatMessages.value.length + 1,
      senderId: currentUserId.value,
      senderName: currentUserName.value,
      content: inputMessage.value,
      time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
      isSelf: true
    };
    chatMessages.value.push(newMessage);
    inputMessage.value = "";
    // 滚动到最新消息
    scrollToLatestMessage();

    // 通过WebSocket发送消息
    if (webSocketService.value && isConnected.value) {
      try {
        webSocketService.value.sendMeetingMessage({
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          meetingId: meetingInfo.value.id,
          content: newMessage.content,
          sentAt: new Date().toISOString()
        });
        console.log("会议消息已通过WebSocket发送，发送者ID:", currentUserId.value);
      } catch (error) {
        console.error("发送会议消息失败:", error);
      }
    } else {
      // 如果WebSocket未连接，使用模拟回复
      console.log("WebSocket未连接，使用模拟回复");
      setTimeout(() => {
        const replyMessage = {
          id: chatMessages.value.length + 1,
          senderId: "1",
          senderName: "张三",
          content: "收到，谢谢！",
          time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
          isSelf: false
        };
        chatMessages.value.push(replyMessage);
        // 滚动到最新消息
        scrollToLatestMessage();
      }, 1000);
    }
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
  alert("邀请参会者功能");
};



// 结束会议
const endMeeting = () => {
  if (confirm("确定要结束会议吗？")) {
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
const currentScreenSharer = ref<any>(null);
const localStreamRef = ref<HTMLVideoElement | null>(null);

// 远程流管理
const remoteStreams = ref<Map<string, {stream: MediaStream, isScreenShare: boolean}>>(new Map());
const remoteStreamElements = ref<Map<string, HTMLVideoElement>>(new Map());

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
      console.log("Connection state:", state);
    },
    onIceConnectionStateChange: (state) => {
      console.log("ICE connection state:", state);
    },
    onIceCandidate: (candidate) => {
      console.log("ICE candidate:", candidate);
      // 通过WebSocket发送ICE候选者到信令服务器
      if (webSocketService.value && isConnected.value) {
        // 检查WebRTC WebSocket是否连接
        if (webSocketService.value.isWebRtcConnected()) {
          webSocketService.value.sendIceCandidate({
            senderId: currentUserId.value,
            targetUserId: "all", // 发送给所有用户，或者根据实际情况指定目标用户ID
            candidate: candidate
          });
          console.log("ICE候选者已发送，发送者ID:", currentUserId.value);
        } else {
          console.warn("WebRTC WebSocket not connected, skipping ICE candidate send");
          // 可以将ICE候选者缓存起来，待连接后再发送
        }
      } else {
        console.warn("WebSocket not connected, skipping ICE candidate send");
      }
    },
    onTrack: (event) => {
      console.log("Remote track:", event.track);
      // 处理远程轨道
      if (event.streams && event.streams.length > 0) {
        event.streams.forEach(stream => {
          console.log("Received remote stream:", stream.id);
          // 检测是否为屏幕共享流（通过检查轨道类型和标签）
          const isScreenShare = stream.getVideoTracks().some(track => {
            return track.kind === 'video' && track.label.includes('screen');
          });
          
          remoteStreams.value.set(stream.id, { stream, isScreenShare });
          console.log("Added remote stream, is screen share:", isScreenShare);
        });
      }
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
      
      // 重新协商WebRTC连接，确保其他参与者能看到摄像头视频
      console.log("Re-negotiating WebRTC connection for camera stream");
      
      // 创建新的offer并发送给其他参与者
      if (webSocketService.value && isConnected.value) {
        webRTCCore.createOffer().then((offer) => {
          console.log("Created new offer for camera stream:", offer);
          // 发送offer给所有其他参与者
          participants.value.forEach(participant => {
            if (participant.status === 'online' && participant.id !== 0) {
              webSocketService.value?.sendWebRtcOffer({
                senderId: currentUserId.value,
                targetUserId: `user${participant.id}`,
                offer: offer
              });
              console.log("Sent camera stream offer to:", participant.name);
            }
          });
        }).catch((error) => {
          console.error("Error creating camera stream offer:", error);
        });
      }
    },
    onStreamStopped: () => {
      if (localStreamRef.value) {
        localStreamRef.value.srcObject = null;
      }
      isVideoEnabled.value = false;
      webRTCCore.removeLocalStream();
    },
    onError: (error) => {
      console.error("Video manager error:", error);
      alert("获取摄像头失败: " + error.message);
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
      console.error("Audio manager error:", error);
      alert("获取麦克风失败: " + error.message);
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
      const a = document.createElement("a");
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
      console.error("Recording manager error:", error);
      alert("录制失败: " + error.message);
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
      
      // 重新协商WebRTC连接，确保其他参与者能看到屏幕共享
      console.log("Re-negotiating WebRTC connection for screen share");
      
      // 创建新的offer并发送给其他参与者
      if (webSocketService.value && isConnected.value) {
        webRTCCore.createOffer().then((offer) => {
          console.log("Created new offer for screen share:", offer);
          // 发送offer给所有其他参与者
          participants.value.forEach(participant => {
            if (participant.status === 'online' && participant.id !== 0) {
              webSocketService.value?.sendWebRtcOffer({
                senderId: currentUserId.value,
                targetUserId: `user${participant.id}`,
                offer: offer
              });
              console.log("Sent screen share offer to:", participant.name);
            }
          });
        }).catch((error) => {
          console.error("Error creating screen share offer:", error);
        });
      }
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
      
      // 重新协商WebRTC连接，确保其他参与者能看到摄像头视频
      console.log("Re-negotiating WebRTC connection after screen share stopped");
      
      // 创建新的offer并发送给其他参与者
      if (webSocketService.value && isConnected.value) {
        webRTCCore.createOffer().then((offer) => {
          console.log("Created new offer after screen share:", offer);
          // 发送offer给所有其他参与者
          participants.value.forEach(participant => {
            if (participant.status === 'online' && participant.id !== 0) {
              webSocketService.value?.sendWebRtcOffer({
                senderId: currentUserId.value,
                targetUserId: `user${participant.id}`,
                offer: offer
              });
              console.log("Sent post-screen share offer to:", participant.name);
            }
          });
        }).catch((error) => {
          console.error("Error creating post-screen share offer:", error);
        });
      }
    },
    onError: (error) => {
      console.error("Screen share manager error:", error);
      alert("屏幕共享失败: " + error.message);
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
      console.error("Error starting audio:", error);
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
      console.error("Error starting video:", error);
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
      console.error("Error starting screen share:", error);
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
        alert("没有可录制的流");
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("开始录制失败: " + (error as Error).message);
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
  return participants.value.filter(p => p.status === "online").length;
});

// 组件挂载时滚动到最新消息并初始化WebRTC和WebSocket服务
onMounted(() => {
  scrollToLatestMessage();
  initWebRTC();
  initWebSocketService();
});

// 组件卸载时清理WebRTC和WebSocket资源
onUnmounted(() => {
  // 取消所有订阅
  messageSubscriptions.value.forEach(subscriptionId => {
    webSocketService.value?.unsubscribe(subscriptionId);
  });
  
  // 断开WebSocket连接
  if (webSocketService.value) {
    webSocketService.value.disconnect();
    console.log("WebSocket服务已关闭");
  }
  
  // 清理WebRTC资源
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

// 监听远程流变化，更新video元素并处理屏幕共享
watch(
  () => remoteStreams.value,
  () => {
    console.log("Remote streams changed, updating video elements");
    remoteStreams.value.forEach((streamInfo, streamId) => {
      const videoElement = remoteStreamElements.value.get(streamId);
      if (videoElement) {
        videoElement.srcObject = streamInfo.stream;
        console.log("Updated video element for stream:", streamId);
      }
      
      // 检测屏幕共享流
      if (streamInfo.isScreenShare) {
        console.log("Detected screen share stream:", streamId);
        // 这里可以添加逻辑来识别是哪个参与者的屏幕共享
        // 暂时使用streamId作为标识
        currentScreenSharer.value = {
          id: streamId,
          name: `参与者 ${streamId.substring(0, 4)}`,
          stream: streamInfo.stream
        };
        
        // 自动切换到屏幕共享全屏显示
        console.log("Auto-switching to screen share view for:", currentScreenSharer.value.name);
        // 这里可以添加全屏显示的逻辑
      }
    });
    
    // 检查是否所有屏幕共享都已停止
    const hasScreenShare = Array.from(remoteStreams.value.values()).some(streamInfo => streamInfo.isScreenShare);
    if (!hasScreenShare && !isScreenSharing.value) {
      currentScreenSharer.value = null;
      console.log("No screen share active, clearing current screen sharer");
    }
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

            <!-- 远程流显示 -->
            <div v-for="[streamId, streamInfo] in Array.from(remoteStreams.entries())" :key="streamId" class="video-item" :class="{ 'screen-share': streamInfo.isScreenShare }">
              <div class="video-preview">
                <video
                  :ref="el => el && (remoteStreamElements.value.set(streamId, el))"
                  class="remote-video-element"
                  autoplay
                  playsinline
                ></video>
                <div class="participant-status">
                  <div class="status-indicator online"></div>
                  <span class="participant-name">远程参与者</span>
                  <span v-if="streamInfo.isScreenShare" class="screen-share-badge">屏幕共享</span>
                </div>
              </div>
            </div>

            <!-- 远程参与者视频（模拟） -->
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
                <!-- 他人发送的消息：头像在前，消息在后 -->
                <template v-if="!message.isSelf">
                  <div class="message-avatar">
                    <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="{{ message.senderName }}" />
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
                    <img :src="currentUserAvatar" alt="{{ message.senderName }}" />
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
