import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import {createWebRTCCoreInstance, WebRTCCore} from "@/utils/webrtc/webrtc-core";
import {DEFAULT_VIDEO_CONSTRAINTS, VideoManager} from "@/utils/webrtc/video-manager";
import {AudioManager, DEFAULT_AUDIO_CONSTRAINTS} from "@/utils/webrtc/audio-manager";
import {DEFAULT_RECORDING_OPTIONS, RecordingManager} from "@/utils/webrtc/recording-manager";
import {ScreenShareManager} from "@/utils/webrtc/screen-share-manager";
import {WebSocketService} from "@/utils/websocket/WebSocketService";

export const useMeetingDialog = (emit?: any) => {
  const safeEmit = emit ?? (() => undefined);

  const closeAction = () => {
    safeEmit("update:visible", false);
  };

  const codeDoSave = () => {
    safeEmit("save");
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
  const participants = ref<Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    status: string;
    audio: boolean;
    video: boolean;
  }>>([]);

  // 模拟会议聊天消息
  const chatMessages = ref<Array<{
    id: number;
    senderId: string;
    senderName: string;
    content: string;
    time: string;
    isSelf: boolean;
  }>>([]);

  // 输入消息内容
  const inputMessage = ref("");

  // 聊天消息容器引用
  const chatMessagesRef = ref<HTMLElement | null>(null);

  // WebSocket服务管理
  const webSocketService = ref<WebSocketService | null>(null);
  const isConnected = ref(false);
  const connectionStatus = ref("未连接");
  const messageSubscriptions = ref<string[]>([]);

  // 会议控制增强功能
  const raisedHands = ref<Set<string>>(new Set()); // 举手的参会者
  const networkQuality = ref<Map<string, { bandwidth: number; packetLoss: number; latency: number }>>(new Map()); // 网络质量
  const meetingStartTime = ref<Date>(new Date()); // 会议开始时间
  const isMuteAll = ref(false); // 是否静音所有参会者
  const isVideoOffAll = ref(false); // 是否关闭所有参会者视频
  const meetingSettings = ref({
    name: meetingInfo.value.name,
    password: meetingInfo.value.password,
    duration: meetingInfo.value.duration,
    allowScreenShare: true,
    allowChat: true,
    allowRaiseHand: true
  }); // 会议设置
  const meetingStats = ref({
    totalParticipants: 0,
    onlineParticipants: 0,
    totalMessages: 0,
    speakingTime: 0
  }); // 会议统计信息

  // 可选择的身份列表
  const availableUsers = ref([
    {id: "zhangsan", name: "张三", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"},
    {id: "lisi", name: "李四", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"},
    {id: "wangwu", name: "王五", avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"}
  ]);

  // 当前选择的用户
  const selectedUser = ref(availableUsers.value[0]);

  // 当前用户ID和名称
  const currentUserId = ref(selectedUser.value.id);
  const currentUserName = ref(selectedUser.value.name);
  const currentUserAvatar = ref(selectedUser.value.avatar);

  // 监听选择的用户变化，更新当前用户信息
  watch(selectedUser, (newUser) => {
    currentUserId.value = newUser.id;
    currentUserName.value = newUser.name;
    currentUserAvatar.value = newUser.avatar;
  }, {deep: true});

  // WebRTC相关状态
  const isAudioEnabled = ref(false);
  const isVideoEnabled = ref(false);
  const isRecording = ref(false);
  const isScreenSharing = ref(false);
  const currentScreenSharer = ref<any>(null);
  const localStreamRef = ref<HTMLVideoElement | null>(null);

  // 远程流管理
  const remoteStreams = ref<Map<string, { stream: MediaStream, isScreenShare: boolean, senderId?: string }>>(new Map());
  const remoteStreamElements = ref<Map<string, HTMLVideoElement>>(new Map());
  // 参与者与远程流的映射
  const participantStreams = ref<Map<string, string>>(new Map()); // 参与者ID -> 远程流ID

  // 清理指定发送者的所有流（视频或屏幕共享）
  const clearStreamsBySender = (senderId: string, isScreenShare: boolean) => {
    let cleared = false;
    remoteStreams.value.forEach((streamInfo, streamId) => {
      // 清理对应发送者的所有匹配类型的流
      if (streamInfo.senderId === senderId && streamInfo.isScreenShare === isScreenShare) {
        console.log("Clearing stream for sender:", senderId, "stream:", streamId, "isScreenShare:", isScreenShare);
        remoteStreams.value.delete(streamId);
        remoteStreamElements.value.delete(streamId);
        participantStreams.value.forEach((mappedStreamId, participantId) => {
          if (mappedStreamId === streamId) {
            participantStreams.value.delete(participantId);
          }
        });
        if (currentScreenSharer.value && (currentScreenSharer.value.id === streamId || currentScreenSharer.value.stream === streamInfo.stream)) {
          currentScreenSharer.value = null;
        }
        cleared = true;
      }
    });
    if (cleared) {
      console.log("Streams cleared for sender:", senderId, "type:", isScreenShare ? "screen share" : "video");
    }
  };

  // 清理指定发送者的屏幕共享流（保持向后兼容）
  const clearScreenShareBySender = (senderId: string) => {
    clearStreamsBySender(senderId, true);
  };

  // WebRTC实例
  const peerConnections = ref<Map<string, WebRTCCore>>(new Map());
  let videoManager: VideoManager;
  let audioManager: AudioManager;
  let recordingManager: RecordingManager;
  let screenShareManager: ScreenShareManager;

  const negotiatingPeers = ref<Set<string>>(new Set());
  const lastOfferBySender = ref<Map<string, { isScreenShare: boolean; timestamp: number }>>(new Map());

  let currentAudioStream: MediaStream | null = null;
  let currentVideoStream: MediaStream | null = null;

  const updatePeerTracks = (peerId: string) => {
    const pc = getPeerConnection(peerId);
    if (!pc) return;

    const audioTrack = currentAudioStream?.getAudioTracks()[0] || null;
    const videoTrack = currentVideoStream?.getVideoTracks()[0] || null;

    pc.replaceTrack("audio", audioTrack, currentAudioStream || undefined);
    pc.replaceTrack("video", videoTrack, currentVideoStream || undefined);
  };

  const updateAllPeerTracks = () => {
    participants.value.forEach(participant => {
      if (participant.status === "online" && participant.id !== currentUserId.value) {
        updatePeerTracks(participant.id);
      }
    });
  };

  const createOfferWhenStable = (peerId: string, callback: (offer: any) => void, isRetry = false) => {
    const pc = getPeerConnection(peerId);
    if (!pc) return;

    const ns = getNegotiationState(peerId);
    
    // 检查是否已经在创建offer
    if (!isRetry && ns.makingOffer) {
      console.warn("Already making offer, retrying:", peerId);
      setTimeout(() => createOfferWhenStable(peerId, callback, true), 100);
      return;
    }
    
    const state = pc.getSignalingState?.();
    if (state && state !== "stable") {
      console.warn("Signaling not stable:", state, "retrying...");
      setTimeout(() => createOfferWhenStable(peerId, callback, true), 200);
      return;
    }
    
    ns.makingOffer = true;
    
    pc.createOffer().then((offer) => {
      callback(offer);
    }).catch((error) => {
      console.error("Error creating offer:", error);
    }).finally(() => {
      ns.makingOffer = false;
    });
  };

  const sendOfferToParticipant = async (peerId: string, isScreenShare: boolean) => {
    console.log("=== 开始发送offer给参与者 ===");
    console.log("目标参与者:", peerId, "屏幕共享:", isScreenShare);
    console.log("WebSocket服务状态:", webSocketService.value ? "存在" : "不存在");
    console.log("连接状态:", isConnected.value ? "已连接" : "未连接");
    
    if (!webSocketService.value) {
      console.error("WebSocket服务不存在，无法发送offer");
      return;
    }
    
    // 确保WebSocket连接稳定
    const ensureWebSocketConnected = async (): Promise<boolean> => {
      if (isConnected.value) {
        return true;
      }
      
      console.warn("WebSocket连接已断开，尝试重新连接");
      
      try {
        const connected = await webSocketService.value.connect();
        if (connected) {
          isConnected.value = true;
          console.log("WebSocket重新连接成功");
          
          // 重新注册用户
          webSocketService.value?.registerUser(currentUserId.value, "session_" + Date.now(), meetingInfo.value.id);
          
          // 等待连接稳定
          await new Promise(resolve => setTimeout(resolve, 300));
          return true;
        }
      } catch (error) {
        console.error("WebSocket重新连接失败:", error);
      }
      
      return false;
    };
    
    // 确保WebSocket连接稳定
    const isStable = await ensureWebSocketConnected();
    if (!isStable) {
      console.error("WebSocket连接不稳定，无法发送offer");
      return;
    }
    
    // 创建并发送offer
    const createAndSendOffer = async () => {
      return new Promise<void>((resolve, reject) => {
        createOfferWhenStable(peerId, async (offer) => {
          try {
            console.log("=== 准备发送WebRTC offer ===");
            console.log("目标参与者:", peerId, "屏幕共享:", isScreenShare);
            console.log("offer类型:", offer.type);
            
            // 再次检查WebSocket连接状态
            const isStillStable = await ensureWebSocketConnected();
            if (!isStillStable) {
              console.error("WebSocket连接不稳定，无法发送offer");
              reject(new Error("WebSocket connection unstable"));
              return;
            }
            
            console.log("WebRTC连接状态:", webSocketService.value?.isWebRtcConnected() ? "已连接" : "未连接");
            
            // 发送offer
            await webSocketService.value?.sendWebRtcOffer({
              senderId: currentUserId.value,
              targetUserId: peerId,
              offer: offer,
              isScreenShare: isScreenShare
            });
            
            console.log("=== WebRTC offer发送完成 ===");
            resolve();
          } catch (error) {
            console.error("发送WebRTC offer失败:", error);
            reject(error);
          }
        });
      });
    };
    
    try {
      await createAndSendOffer();
      
      // 发送后立即检查连接状态，如果断开则尝试重连
      setTimeout(() => {
        if (!isConnected.value) {
          console.warn("WebSocket在发送offer后断开，尝试保持连接");
          ensureWebSocketConnected();
        }
      }, 100);
    } catch (error) {
      console.error("发送offer失败:", error);
    }
  };

  const sendOfferToAllParticipants = async (isScreenShare: boolean) => {
    console.log("=== 开始发送offer给所有参与者 ===");
    console.log("屏幕共享:", isScreenShare);
    console.log("当前在线参与者:", participants.value.filter(p => p.status === "online" && p.id !== currentUserId.value));
    
    const onlineParticipants = participants.value.filter(p => p.status === "online" && p.id !== currentUserId.value);
    console.log("在线参与者数量:", onlineParticipants.length);
    
    if (onlineParticipants.length === 0) {
      console.warn("没有在线参与者，跳过发送offer");
      return;
    }
    
    // 错开发送时间，避免同时处理多个offer导致的性能问题
    for (let i = 0; i < onlineParticipants.length; i++) {
      const participant = onlineParticipants[i];
      console.log(`向第${i + 1}个参与者发送offer:`, participant.id, participant.name);
      
      try {
        // 等待前一个offer处理完成后再发送下一个
        await sendOfferToParticipant(participant.id, isScreenShare);
        // 错开发送时间
        if (i < onlineParticipants.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } catch (error) {
        console.error(`向参与者 ${participant.id} 发送offer失败:`, error);
        // 继续处理下一个参与者，不中断整个流程
      }
    }
    
    console.log("=== 所有offer发送完成 ===");
  };

  const handleRemoteStream = (peerId: string, stream: MediaStream) => {
    console.log("Received remote stream:", stream.id, "from:", peerId);
    console.log("Stream tracks:", stream.getTracks().map(t => t.kind + ":" + t.label));

    let isScreenShare = false;
    const offerInfo = lastOfferBySender.value.get(peerId);
    const signalingIsScreenShare = offerInfo ? offerInfo.isScreenShare : null;

    // 修复：无论收到什么类型的流，都清理对应发送者的旧流
    // 避免状态累积导致第三次操作失败
    if (signalingIsScreenShare !== null) {
      // 清理对应发送者的所有流（视频或屏幕共享）
      clearStreamsBySender(peerId, signalingIsScreenShare);
    }

    if (signalingIsScreenShare === null) {
      isScreenShare = stream.getVideoTracks().some(track => {
        const trackLabel = track.label.toLowerCase();
        return track.kind === "video" && (
          trackLabel.includes("screen") ||
          trackLabel.includes("display") ||
          trackLabel.includes("desktop") ||
          trackLabel.includes("共享") ||
          trackLabel.includes("presentation")
        );
      });

      if (!isScreenShare && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack.getSettings) {
          const settings = videoTrack.getSettings();
          if (settings.width && settings.height) {
            const aspectRatio = settings.width / settings.height;
            if (aspectRatio > 1.7 || aspectRatio < 1.4) {
              isScreenShare = true;
            }
          }
        }
      }

      if (!isScreenShare && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack.getSettings) {
          const settings = videoTrack.getSettings();
          if (settings.frameRate && settings.frameRate < 15) {
            isScreenShare = true;
          }
        }
      }

      if (!isScreenShare && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack.getSettings) {
          const settings = videoTrack.getSettings();
          if (settings.width && settings.height) {
            const resolution = settings.width * settings.height;
            if (resolution > 1920 * 1080) {
              isScreenShare = true;
            }
          }
        }
      }
    }

    if (signalingIsScreenShare !== null) {
      isScreenShare = signalingIsScreenShare;
    }

    if (remoteStreams.value.has(stream.id)) {
      remoteStreams.value.set(stream.id, {stream, isScreenShare, senderId: peerId});
      const videoElement = remoteStreamElements.value.get(stream.id);
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } else {
      remoteStreams.value.set(stream.id, {stream, isScreenShare, senderId: peerId});
    }

    stream.getTracks().forEach(track => {
      track.onended = () => {
        const hasActiveTracks = stream.getTracks().some(t => t.readyState === "live");
        if (!hasActiveTracks) {
          const streamInfo = remoteStreams.value.get(stream.id);
          remoteStreams.value.delete(stream.id);
          remoteStreamElements.value.delete(stream.id);
          participantStreams.value.forEach((streamId, participantId) => {
            if (streamId === stream.id) {
              participantStreams.value.delete(participantId);
            }
          });
          if (streamInfo && streamInfo.isScreenShare) {
            if (currentScreenSharer.value &&
                (currentScreenSharer.value.stream === stream ||
                 currentScreenSharer.value.id === stream.id)) {
              currentScreenSharer.value = null;
            }
          }
        }
      };
    });
  };

  const getPeerConnection = (peerId: string, forceRecreate = false) => {
    let pc = peerConnections.value.get(peerId);
    
    // 如果强制重建或连接状态异常，则重建连接
    if (pc && !forceRecreate) {
      const connectionState = pc.getConnectionState();
      const iceState = pc.getIceConnectionState();
      
      // 检查连接状态，如果处于失败状态则重建
      if (connectionState === "failed" || connectionState === "disconnected" || 
          iceState === "failed" || iceState === "disconnected") {
        console.warn("Peer connection in bad state, recreating:", peerId, "connection:", connectionState, "ice:", iceState);
        pc.close();
        peerConnections.value.delete(peerId);
        pc = null;
      } else {
        return pc;
      }
    }

    pc = createWebRTCCoreInstance({
      peerConnectionConfig: {
        iceServers: [
          {
            urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
          }
        ]
      },
      onConnectionStateChange: (state) => {
        console.log("Connection state (", peerId, "):", state);
        
        // 如果连接失败，立即重建连接
        if (state === "failed" || state === "disconnected") {
          console.warn("Peer connection failed/disconnected, will recreate on next use:", peerId);
          // 不立即重建，等待下次使用时自动重建
        }
      },
      onIceConnectionStateChange: (state) => {
        console.log("ICE connection state (", peerId, "):", state);
        
        // 如果ICE连接失败，标记为需要重建
        if (state === "failed" || state === "disconnected") {
          console.warn("ICE connection failed/disconnected:", peerId);
        }
      },
      onIceCandidate: (candidate) => {
        if (webSocketService.value && isConnected.value && webSocketService.value.isWebRtcConnected()) {
          webSocketService.value.sendIceCandidate({
            senderId: currentUserId.value,
            targetUserId: peerId,
            candidate: candidate
          });
        }
      },
      onTrack: (event) => {
        if (event.streams && event.streams.length > 0) {
          console.log("Received track event for peer:", peerId, "streams:", event.streams.length);
          event.streams.forEach(stream => {
            console.log("Processing stream:", stream.id, "tracks:", stream.getTracks().length);
            handleRemoteStream(peerId, stream);
          });
        }
      }
    });

    peerConnections.value.set(peerId, pc);
    updatePeerTracks(peerId);
    return pc;
  };

  // 计算属性：获取远程流条目
  const remoteStreamEntries = computed(() => {
    return Array.from(remoteStreams.value.entries());
  });

  // 计算属性：获取参与者的远程流信息
  const getParticipantStreamInfo = computed(() => {
    return (participantId: string) => {
      return remoteStreamEntries.value.find(([streamId, streamInfo]) =>
          streamInfo.senderId === participantId || !streamInfo.senderId
      );
    };
  });

  // 计算属性：检查参与者是否有远程流
  const hasParticipantStream = computed(() => {
    return (participantId: string) => {
      return remoteStreamEntries.value.some(([streamId, streamInfo]) =>
          streamInfo.senderId === participantId || !streamInfo.senderId
      );
    };
  });

  // 计算属性：检查参与者是否有屏幕共享流
  const hasParticipantScreenShare = computed(() => {
    return (participantId: string) => {
      return remoteStreamEntries.value.some(([streamId, streamInfo]) =>
          (streamInfo.senderId === participantId || !streamInfo.senderId) && streamInfo.isScreenShare
      );
    };
  });

  // 切换用户身份
  const switchUser = (user: any) => {
    selectedUser.value = user;
    currentUserId.value = user.id;
    currentUserName.value = user.name;
    currentUserAvatar.value = user.avatar;
    console.log("切换用户身份为:", user.name, "ID:", user.id);

    // 确保当前用户在participants数组中是在线状态
    const participant = participants.value.find(p => p.id === user.id);
    if (participant) {
      participant.status = "online";
      console.log("更新用户状态为在线:", user.name);
    } else {
      // 如果用户不在participants数组中，添加一个新的在线用户
      const newParticipant = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: "participant",
        status: "online",
        audio: false,
        video: false
      };
      participants.value.push(newParticipant);
      console.log("添加新的在线用户:", user.name);
    }

    // 重新注册用户并订阅WebSocket消息，使用新的用户ID
    if (webSocketService.value && isConnected.value) {
      console.log("重新注册用户并订阅WebSocket消息");
      // 先取消之前的所有订阅
      messageSubscriptions.value.forEach(subscriptionId => {
        webSocketService.value?.unsubscribe(subscriptionId);
      });
      messageSubscriptions.value = [];

      // 重新注册用户，传入meetingId
      webSocketService.value.registerUser(currentUserId.value, "session_" + Date.now(), meetingInfo.value.id);
      console.log("用户已重新注册，ID:", currentUserId.value, "会议ID:", meetingInfo.value.id);
      // 重新订阅消息
      subscribeToMeetingMessages();
      subscribeToWebRtcSignaling();
    }
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
          // 订阅会议消息
          subscribeToMeetingMessages();
        },
        onWebRtcConnected: () => {
          console.log("WebRTC WebSocket连接已建立");
          // 立即订阅WebRTC信令
          subscribeToWebRtcSignaling();
          // 注册用户，传入meetingId
          webSocketService.value?.registerUser(currentUserId.value, "session_" + Date.now(), meetingInfo.value.id);
          console.log("用户已注册，ID:", currentUserId.value, "会议ID:", meetingInfo.value.id);
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

    // 订阅参与者状态变化
    const participantSubscription = webSocketService.value.subscribeToParticipantStatus((message) => {
      handleIncomingParticipantStatus(message);
    }, meetingInfo.value.id);
    if (participantSubscription) {
      messageSubscriptions.value.push(participantSubscription);
    }
  };

  // 订阅WebRTC信令
  const subscribeToWebRtcSignaling = () => {
    if (!webSocketService.value) return;
    console.log("订阅WebRTC信令...");
    
    // 订阅新peer加入通知
    const peerJoinedSubscription = webSocketService.value.subscribeToPeerJoined((message) => {
      console.log("收到新peer加入通知:", message);
      handleNewPeerJoined(message);
    }, currentUserId.value);
    if (peerJoinedSubscription) {
      messageSubscriptions.value.push(peerJoinedSubscription);
      console.log("成功订阅新peer加入通知");
    }
    
    // 订阅已存在peers通知
    const existingPeersSubscription = webSocketService.value.subscribeToExistingPeers((message) => {
      console.log("收到已存在peers通知:", message);
      handleExistingPeers(message);
    }, currentUserId.value);
    if (existingPeersSubscription) {
      messageSubscriptions.value.push(existingPeersSubscription);
      console.log("成功订阅已存在peers通知");
    }
    
    // 订阅WebRTC提议
    const offerSubscription = webSocketService.value.subscribeToWebRtcOffers((message) => {
      console.log("收到WebRTC提议消息:", message);
      handleIncomingWebRtcOffer(message);
    }, currentUserId.value);
    if (offerSubscription) {
      messageSubscriptions.value.push(offerSubscription);
      console.log("成功订阅WebRTC提议消息");
    } else {
      console.error("订阅WebRTC提议消息失败");
    }
    // 订阅WebRTC应答
    const answerSubscription = webSocketService.value.subscribeToWebRtcAnswers((message) => {
      console.log("收到WebRTC应答消息:", message);
      handleIncomingWebRtcAnswer(message);
    }, currentUserId.value);
    if (answerSubscription) {
      messageSubscriptions.value.push(answerSubscription);
      console.log("成功订阅WebRTC应答消息");
    } else {
      console.error("订阅WebRTC应答消息失败");
    }
    // 订阅ICE候选者
    const iceSubscription = webSocketService.value.subscribeToIceCandidates((message) => {
      console.log("收到ICE候选者消息:", message);
      handleIncomingIceCandidate(message);
    }, currentUserId.value);
    if (iceSubscription) {
      messageSubscriptions.value.push(iceSubscription);
      console.log("成功订阅ICE候选者消息");
    } else {
      console.error("订阅ICE候选者消息失败");
    }
  };

  // 处理已存在的peers列表
  const handleExistingPeers = (message: any) => {
    try {
      console.log("处理已存在的peers列表:", message);
      const existingUserIds = message.existingUserIds;
      
      if (!existingUserIds || existingUserIds.length === 0) {
        console.log("没有已存在的用户");
        return;
      }
      
      console.log("会议中已存在的用户:", existingUserIds);
      
      // 仅用于补齐参与者列表，避免Offer碰撞
      existingUserIds.forEach((existingUserId: string) => {
        if (existingUserId !== currentUserId.value) {
          const existingParticipant = participants.value.find(p => p.id === existingUserId);
          if (!existingParticipant) {
            participants.value.push({
              id: existingUserId,
              name: `参与者 ${existingUserId.substring(0, 4)}`,
              avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
              role: "participant",
              status: "online",
              audio: true,
              video: true
            });
            console.log("补齐参与者列表:", existingUserId);
          }
        }
      });
    } catch (error) {
      console.error("处理已存在peers列表失败:", error);
    }
  };

  // 处理新peer加入通知
  const handleNewPeerJoined = (message: any) => {
    try {
      console.log("处理新peer加入通知:", message);
      const newUserId = message.newUserId;
      
      if (!newUserId || newUserId === currentUserId.value) {
        console.log("跳过自己或无效的用户ID");
        return;
      }
      
      console.log("新用户加入，需要发送offer:", newUserId);
      
      // 延迟发送offer，确保对方已经准备好接收
      setTimeout(() => {
        console.log("向新用户发送offer:", newUserId);
        sendOfferToParticipant(newUserId, isScreenSharing.value);
      }, 500); // 延迟500ms，确保对方已订阅
    } catch (error) {
      console.error("处理新peer加入通知失败:", error);
    }
  };

  // 处理接收到的聊天消息
  const handleIncomingChatMessage = (message: any) => {
    try {
      // 处理举手状态消息
      if (message.participantId !== undefined && message.isRaised !== undefined) {
        // 避免自己发送的消息重复处理
        if (message.senderId === currentUserId.value) {
          return;
        }
        
        if (message.isRaised) {
          raisedHands.value.add(message.participantId);
          console.log("Remote participant raised hand:", message.participantId);
        } else {
          raisedHands.value.delete(message.participantId);
          console.log("Remote participant lowered hand:", message.participantId);
        }
        
        // 添加系统消息到聊天列表
        if (message.content) {
          const newMessage = {
            id: chatMessages.value.length + 1,
            senderId: "system",
            senderName: "系统",
            content: message.content,
            time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
            isSelf: false
          };
          chatMessages.value.push(newMessage);
          // 滚动到最新消息
          scrollToLatestMessage();
        }
        return;
      }
      
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

  // 处理接收到的参与者状态变化消息
  const handleIncomingParticipantStatus = (message: any) => {
    try {
      console.log("接收到参与者状态变化消息:", message);
      handleUserStatusChange(message);
    } catch (error) {
      console.error("处理参与者状态变化消息失败:", error);
    }
  };

  // 处理用户状态变化
  const handleUserStatusChange = (message: any) => {
    try {
      console.log("处理用户状态变化:", message);

      if (message.type === "USER_JOINED") {
        // 检查是否是自己发送的消息
        const isSelfMessage = message.userId === currentUserId.value;
        if (isSelfMessage) {
          console.log("收到自己的加入消息，跳过处理");
          return; // 不处理自己的加入消息
        }

        // 检查用户是否已经在参与者列表中
        const existingParticipant = participants.value.find(p => p.id === message.userId);
        if (!existingParticipant) {
          // 添加新用户到参与者列表
          participants.value.push({
            id: message.userId,
            name: message.userName,
            avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
            role: "participant",
            status: "online",
            audio: true,
            video: true
          });
          console.log("新用户已添加到参与者列表:", message.userName);
        } else {
          // 更新现有用户的状态
          existingParticipant.status = "online";
          console.log("用户状态已更新为在线:", message.userName);
        }

        // 添加系统消息到聊天列表（只有非自己的消息）
        chatMessages.value.push({
          id: chatMessages.value.length + 1,
          senderId: "system",
          senderName: "系统",
          content: `${message.userName} 加入了会议`,
          time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
          isSelf: false
        });
        scrollToLatestMessage();
      } else if (message.type === "USER_LEFT") {
        // 检查是否是自己发送的消息
        const isSelfMessage = message.userId === currentUserId.value;
        if (isSelfMessage) {
          console.log("收到自己的离开消息，跳过处理");
          return; // 不处理自己的离开消息
        }

        // 查找并更新用户状态
        const participant = participants.value.find(p => p.id === message.userId);
        if (participant) {
          participant.status = "offline";
          console.log("用户状态已更新为离线:", message.userName);
        }

        // 添加系统消息到聊天列表（只有非自己的消息）
        chatMessages.value.push({
          id: chatMessages.value.length + 1,
          senderId: "system",
          senderName: "系统",
          content: `${message.userName} 离开了会议`,
          time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
          isSelf: false
        });
        scrollToLatestMessage();
      }
    } catch (error) {
      console.error("处理用户状态变化失败:", error);
    }
  };


  // 处理接收到的WebRTC提议
  const handleIncomingWebRtcOffer = (message: any) => {
    try {
      console.log("接收到WebRTC提议:", message);
       // 验证消息格式
      if (!message.offer || !message.senderId) {
        console.error("无效的WebRTC提议消息:", message);
        return;
      }
      
      // 检查参与者列表中是否已有该发送者
      const existingParticipant = participants.value.find(p => p.id === message.senderId);
      if (!existingParticipant) {
        console.log("创建新的参与者卡片:", message.senderId);
        // 尝试从可用用户列表中查找用户名
        let senderName = `参与者 ${message.senderId.substring(0, 4)}`;
        const userFromList = availableUsers.value.find(u => u.id === message.senderId);
        if (userFromList) {
          senderName = userFromList.name;
        }
        console.log("找到发送者姓名:", senderName);
        // 创建新的参与者卡片
        participants.value.push({
          id: message.senderId,
          name: senderName,
          status: "online",
          audio: true,
          video: true
        });
        console.log("新参与者卡片创建成功:", message.senderId, senderName);
      } else {
        // 确保现有参与者的状态为在线
        if (existingParticipant.status !== "online") {
          existingParticipant.status = "online";
          console.log("更新参与者状态为在线:", message.senderId);
        }
        console.log("参与者卡片已存在:", message.senderId, existingParticipant.name);
      }
      
      // 如果是屏幕共享停止，先清理现有的屏幕共享显示
      if (message.isScreenShare === false) {
        console.log("收到屏幕共享停止信令，清理远程屏幕共享:", message.senderId);
        clearScreenShareBySender(message.senderId);
      }

      // 记录最近一次Offer，用于后续流类型匹配
      console.log("记录最新Offer信息:", message.senderId, "屏幕共享:", message.isScreenShare);
      lastOfferBySender.value.set(message.senderId, {
        isScreenShare: !!message.isScreenShare,
        timestamp: Date.now()
      });
      
      const peerId = message.senderId;
      getPeerConnection(peerId);
      processWebRtcOffer(message, peerId);
    } catch (error) {
      console.error("处理WebRTC提议失败:", error);
    }
  };

  // 协商状态管理
  const negotiationState = ref<Map<string, {
    makingOffer: boolean;
    ignoreOffer: boolean;
    srdAnswerPending: boolean;
  }>>(new Map());

  // 获取协商状态
  const getNegotiationState = (peerId: string) => {
    if (!negotiationState.value.has(peerId)) {
      negotiationState.value.set(peerId, {
        makingOffer: false,
        ignoreOffer: false,
        srdAnswerPending: false
      });
    }
    return negotiationState.value.get(peerId)!;
  };

  // 处理offer的具体逻辑
  const processWebRtcOffer = async (message: any, peerId: string) => {
    const pc = getPeerConnection(peerId);
    if (!pc || !webSocketService.value) return;
    
    try {
      console.log("开始处理WebRTC提议，目标用户ID:", peerId, "屏幕共享:", message.isScreenShare);
      const state = pc.getSignalingState?.();
      const ns = getNegotiationState(peerId);
      
      // 检查是否应该忽略offer（处理竞态条件）
      const isStable = state === "stable" || (state === "have-local-offer" && ns.srdAnswerPending);
      ns.ignoreOffer = message.offer.type === "offer" && !isStable;
      
      if (ns.ignoreOffer) {
        console.warn("Glare detected, ignoring offer:", peerId);
        return;
      }
      
      ns.srdAnswerPending = message.offer.type === "answer";
      await pc.setRemoteDescription(message.offer);
      
      if (message.offer.type === "offer") {
        console.log("SDP提议处理成功，正在创建应答...");
        const answer = await pc.createAnswer();
        console.log("应答创建成功，正在发送...");
        // 发送answer，保留屏幕共享标记
        webSocketService.value.sendWebRtcAnswer({
          senderId: currentUserId.value,
          targetUserId: peerId,
          answer: answer,
          isScreenShare: message.isScreenShare || false  // 传递屏幕共享标记
        });
        console.log("WebRTC应答已发送，目标用户ID:", peerId, "屏幕共享:", message.isScreenShare);
      }
      
      // 远程描述设置成功后，处理该peer的ICE候选者队列
      console.log("远程描述设置完成，处理ICE候选者队列");
      processIceCandidateQueue(peerId);
      
      ns.srdAnswerPending = false;
    } catch (error) {
      console.error("处理WebRTC提议失败:", error);
    }
  };

  // 处理接收到的WebRTC应答
  const handleIncomingWebRtcAnswer = (message: any) => {
    try {
      console.log("接收到WebRTC应答:", message);
      const peerId = message.senderId;
      if (!peerId) {
        console.warn("WebRTC answer missing senderId");
        return;
      }
      const pc = getPeerConnection(peerId);
      const ns = getNegotiationState(peerId);
      
      ns.srdAnswerPending = true;
      pc.setRemoteDescription(message.answer).then(() => {
        console.log("WebRTC answer handled successfully for:", peerId);
        
        // 远程描述设置成功后，处理该peer的ICE候选者队列
        console.log("远程描述设置完成，处理ICE候选者队列");
        processIceCandidateQueue(peerId);
        
        ns.srdAnswerPending = false;
      }).catch((error) => {
        console.error("Error handling WebRTC answer:", error);
        ns.srdAnswerPending = false;
      });
    } catch (error) {
      console.error("处理WebRTC应答失败:", error);
    }
  };

  // ICE候选者队列，按peerId分组
  const iceCandidateQueues = ref<Map<string, any[]>>(new Map());

  // 处理接收到的ICE候选者
  const handleIncomingIceCandidate = (message: any) => {
    try {
      console.log("接收到ICE候选者:", message);
      const peerId = message.senderId;
      if (!peerId) {
        console.warn("ICE candidate missing senderId");
        return;
      }
      
      const pc = getPeerConnection(peerId);
      
      // 检查远程描述是否已设置
      if (pc.getRemoteDescription()) {
        // 远程描述已设置，直接添加ICE候选者
        console.log("远程描述已设置，直接添加ICE候选者");
        pc.addIceCandidate(message.candidate);
      } else {
        // 远程描述未设置，将ICE候选者加入队列
        console.log("远程描述未设置，将ICE候选者加入队列");
        if (!iceCandidateQueues.value.has(peerId)) {
          iceCandidateQueues.value.set(peerId, []);
        }
        iceCandidateQueues.value.get(peerId)!.push(message.candidate);
      }
    } catch (error) {
      console.error("处理ICE候选者失败:", error);
    }
  };

  // 处理ICE候选者队列（在远程描述设置后调用）
  const processIceCandidateQueue = (peerId: string) => {
    const queue = iceCandidateQueues.value.get(peerId);
    if (!queue || queue.length === 0) return;
    
    console.log("处理ICE候选者队列，peerId:", peerId, "队列长度:", queue.length);
    
    const pc = getPeerConnection(peerId);
    queue.forEach(async (candidate) => {
      try {
        await pc.addIceCandidate(candidate);
        console.log("队列中的ICE候选者添加成功");
      } catch (error) {
        console.error("处理队列中的ICE候选者失败:", error);
      }
    });
    
    // 清空队列
    iceCandidateQueues.value.set(peerId, []);
  };

  // 发送聊天消息
  const sendChatMessage = () => {
    if (inputMessage.value.trim()) {
      const newMessage: any = {
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
          const replyMessage: any = {
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
  const toggleParticipantAudio = (participantId: string) => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.audio = !participant.audio;
    }
  };

  // 切换参会者视频状态
  const toggleParticipantVideo = (participantId: string) => {
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

  // 举手功能
  const toggleRaiseHand = (participantId: string) => {
    const isRaised = raisedHands.value.has(participantId);
    
    if (isRaised) {
      raisedHands.value.delete(participantId);
      console.log("Participant lowered hand:", participantId);
    } else {
      raisedHands.value.add(participantId);
      console.log("Participant raised hand:", participantId);
      
      // 添加系统消息到聊天列表
      const participant = participants.value.find(p => p.id === participantId);
      if (participant) {
        chatMessages.value.push({
          id: chatMessages.value.length + 1,
          senderId: "system",
          senderName: "系统",
          content: `${participant.name} 举手了`,
          time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
          isSelf: false
        });
        scrollToLatestMessage();
      }
    }
    
    // 通过WebSocket发送举手状态
    if (webSocketService.value && isConnected.value) {
      try {
        webSocketService.value.sendMeetingMessage({
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          meetingId: meetingInfo.value.id,
          content: isRaised ? `${participants.value.find(p => p.id === participantId)?.name || participantId} 放下了手` : `${participants.value.find(p => p.id === participantId)?.name || participantId} 举手了`,
          sentAt: new Date().toISOString(),
          type: "HAND_RAISE",
          participantId: participantId,
          isRaised: !isRaised
        });
        console.log("举手状态已通过WebSocket发送，发送者ID:", currentUserId.value);
      } catch (error) {
        console.error("发送举手状态失败:", error);
      }
    }
  };

  // 静音所有参会者
  const toggleMuteAll = () => {
    isMuteAll.value = !isMuteAll.value;
    console.log("Mute all:", isMuteAll.value);
    
    // 更新所有参会者的音频状态
    participants.value.forEach(participant => {
      if (participant.id !== currentUserId.value) {
        participant.audio = !isMuteAll.value;
      }
    });
    
    // 添加系统消息到聊天列表
    chatMessages.value.push({
      id: chatMessages.value.length + 1,
      senderId: "system",
      senderName: "系统",
      content: isMuteAll.value ? "主持人已静音所有参会者" : "主持人已取消静音所有参会者",
      time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
      isSelf: false
    });
    scrollToLatestMessage();
  };

  // 关闭所有参会者视频
  const toggleVideoOffAll = () => {
    isVideoOffAll.value = !isVideoOffAll.value;
    console.log("Video off all:", isVideoOffAll.value);
    
    // 更新所有参会者的视频状态
    participants.value.forEach(participant => {
      if (participant.id !== currentUserId.value) {
        participant.video = !isVideoOffAll.value;
      }
    });
    
    // 添加系统消息到聊天列表
    chatMessages.value.push({
      id: chatMessages.value.length + 1,
      senderId: "system",
      senderName: "系统",
      content: isVideoOffAll.value ? "主持人已关闭所有参会者视频" : "主持人已开启所有参会者视频",
      time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
      isSelf: false
    });
    scrollToLatestMessage();
  };

  // 监控网络质量
  const monitorNetworkQuality = () => {
    // 模拟网络质量监控
    setInterval(() => {
      participants.value.forEach(participant => {
        if (participant.status === "online") {
          networkQuality.value.set(participant.id, {
            bandwidth: Math.random() * 5000 + 500, // 500-5500 kbps
            packetLoss: Math.random() * 5, // 0-5%
            latency: Math.random() * 200 + 50 // 50-250 ms
          });
        }
      });
    }, 5000); // 每5秒更新一次
  };

  // 获取网络质量等级
  const getNetworkQualityLevel = (participantId: string) => {
    const quality = networkQuality.value.get(participantId);
    if (!quality) return "unknown";
    
    if (quality.latency < 100 && quality.packetLoss < 1) {
      return "excellent";
    } else if (quality.latency < 200 && quality.packetLoss < 3) {
      return "good";
    } else if (quality.latency < 300 && quality.packetLoss < 5) {
      return "fair";
    } else {
      return "poor";
    }
  };

  // 更新会议统计信息
  const updateMeetingStats = () => {
    meetingStats.value = {
      totalParticipants: participants.value.length,
      onlineParticipants: participants.value.filter(p => p.status === "online").length,
      totalMessages: chatMessages.value.length,
      speakingTime: Math.floor((Date.now() - meetingStartTime.value.getTime()) / 1000) // 秒
    };
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

  // 最大化屏幕共享
  const maximizeScreenShare = (streamId: string, stream: MediaStream) => {
    console.log("Maximizing screen share for stream:", streamId);

    // 查找对应的参与者
    let sharerName = `参与者 ${streamId.substring(0, 4)}`;
    const streamInfo = remoteStreams.value.get(streamId);
    if (streamInfo && streamInfo.senderId) {
      const participant = participants.value.find(p => p.id === streamInfo.senderId);
      if (participant) {
        sharerName = participant.name;
      }
    }

    currentScreenSharer.value = {
      id: streamId,
      name: sharerName,
      stream: stream
    };
    console.log("Switched to fullscreen screen share view for:", sharerName);
  };

  // 为参与者最大化屏幕共享
  const maximizeScreenShareForParticipant = (participantId: string) => {
    console.log("Maximizing screen share for participant:", participantId);

    // 查找该参与者的屏幕共享流
    let screenShareStream = null;
    let screenShareStreamId = null;

    remoteStreams.value.forEach((streamInfo, streamId) => {
      if (streamInfo.isScreenShare && (streamInfo.senderId === participantId || !streamInfo.senderId)) {
        screenShareStream = streamInfo.stream;
        screenShareStreamId = streamId;
      }
    });

    if (screenShareStream && screenShareStreamId) {
      maximizeScreenShare(screenShareStreamId, screenShareStream);
    }
  };

  // 参会人员列表显示状态
  const participantsVisible = ref(false);

  // 切换参会人员列表显示/隐藏
  const toggleParticipants = () => {
    participantsVisible.value = !participantsVisible.value;
  };

  // 初始化WebRTC实例
  const initWebRTC = () => {
    // 初始化视频管理器
    videoManager = new VideoManager({
      defaultConstraints: DEFAULT_VIDEO_CONSTRAINTS,
      onStreamAcquired: (stream) => {
        if (localStreamRef.value) {
          localStreamRef.value.srcObject = stream;
        }
        isVideoEnabled.value = true;
        currentVideoStream = stream;
        updateAllPeerTracks();
        // 向所有在线参与者发送offer，确保他们能看到视频
        console.log("发送offer给所有在线参与者，确保他们能看到视频");
        sendOfferToAllParticipants(false);
      },
      onStreamStopped: () => {
        if (localStreamRef.value) {
          localStreamRef.value.srcObject = null;
        }
        isVideoEnabled.value = false;
        currentVideoStream = null;
        updateAllPeerTracks();
        // 向所有在线参与者发送offer，确保他们知道视频已关闭
        console.log("发送offer给所有在线参与者，确保他们知道视频已关闭");
        sendOfferToAllParticipants(false);
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
        currentAudioStream = stream;
        updateAllPeerTracks();
        sendOfferToAllParticipants(false);
      },
      onStreamStopped: () => {
        currentAudioStream = null;
        updateAllPeerTracks();
        sendOfferToAllParticipants(false);
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
      defaultConstraints: {
        audio: false,
        video: {
          cursor: "motion",
          displaySurface: "monitor",
          logicalSurface: true
        }
      },
      onStreamAcquired: (stream) => {
        console.log("Screen share stream acquired:", stream.id);
        console.log("Stream tracks:", stream.getTracks().map(t => t.kind + ":" + t.label));

        if (localStreamRef.value) {
          localStreamRef.value.srcObject = stream;
          console.log("Bound screen share stream to local video element");
        }

        isScreenSharing.value = true;
        currentVideoStream = stream;
        updateAllPeerTracks();
        sendOfferToAllParticipants(true);
      },
      onStreamStopped: () => {
        console.log("Screen share stopped locally");
        
        if (localStreamRef.value) {
          localStreamRef.value.srcObject = null;
        }
        isScreenSharing.value = false;

        if (isVideoEnabled.value) {
          console.log("Restoring camera video after screen share");
          videoManager.getCameraStream().then((stream) => {
            console.log("Camera video restored after screen share");
            currentVideoStream = stream;
            updateAllPeerTracks();
            sendOfferToAllParticipants(false);
          }).catch((error) => {
            console.error("Error restoring camera video after screen share:", error);
            // 即使恢复失败，也要确保发送offer通知其他参与者
            currentVideoStream = null;
            updateAllPeerTracks();
            sendOfferToAllParticipants(false);
          });
        } else {
          currentVideoStream = null;
          updateAllPeerTracks();
          sendOfferToAllParticipants(false);
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
      try {
        audioManager.stopStream();
        isAudioEnabled.value = false;
        currentAudioStream = null;
        // 更新所有peer的track并重新发送offer
        updateAllPeerTracks();
        await sendOfferToAllParticipants(false);
        console.log("音频已关闭");
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    } else {
      // 开启音频
      try {
        const stream = await audioManager.getMicrophoneStream();
        isAudioEnabled.value = true;
        currentAudioStream = stream;
        // 更新所有peer的track并重新发送offer
        updateAllPeerTracks();
        await sendOfferToAllParticipants(false);
        console.log("音频已开启");
      } catch (error) {
        console.error("Error starting audio:", error);
        alert("开启音频失败: " + (error as Error).message);
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
      currentVideoStream = null;
      
      // 更新所有peer的track并重新发送offer
      updateAllPeerTracks();
      await sendOfferToAllParticipants(false);
      
    } else {
      // 开启视频
      try {
        // 强制重建所有peer connection，确保连接状态的一致性
        // 避免多次切换视频和屏幕共享后状态混乱
        recreateAllPeerConnections();
        
        const stream = await videoManager.getCameraStream();
        isVideoEnabled.value = true;
        currentVideoStream = stream;
        
        // 更新所有peer的track并重新发送offer
        updateAllPeerTracks();
        await sendOfferToAllParticipants(false);
        
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
      
      // 屏幕共享管理器会在onStreamStopped回调中处理重新协商
      console.log("Screen share stopped, waiting for callback to handle renegotiation");
      
    } else {
      // 开始屏幕共享
      try {
        // 强制重建所有peer connection，确保连接状态的一致性
        // 避免多次切换视频和屏幕共享后状态混乱
        recreateAllPeerConnections();
        
        await screenShareManager.startScreenShare();
        isScreenSharing.value = true;
        
        // 屏幕共享管理器会在onStreamAcquired回调中处理重新协商
        console.log("Screen share started, waiting for callback to handle renegotiation");
        
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

  // 重建所有peer connection
  const recreateAllPeerConnections = () => {
    console.log("强制重建所有peer connection");
    
    // 关闭所有现有连接
    peerConnections.value.forEach(pc => pc.close());
    peerConnections.value.clear();
    
    // 清空远程流
    remoteStreams.value.clear();
    remoteStreamElements.value.clear();
    participantStreams.value.clear();
    
    // 重置协商状态
    negotiatingPeers.value.clear();
    lastOfferBySender.value.clear();
    negotiationState.value.clear();
    
    console.log("所有peer connection已重建");
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
    peerConnections.value.forEach(pc => pc.close());
    peerConnections.value.clear();
  };

  // 清理资源
  const cleanupWebRTC = () => {
    stopAllWebRTC();
  };

  // 计算在线参会人数
  const onlineParticipantsCount = computed(() => {
    return participants.value.filter(p => p.status === "online").length;
  });

  // 设置远程视频元素引用
  const setRemoteVideoRef = (streamId: string) => {
    return (el: HTMLVideoElement | null) => {
      if (el) {
        remoteStreamElements.value.set(streamId, el);
        // 直接绑定流，确保元素创建时就能显示流
        const streamInfo = remoteStreams.value.get(streamId);
        if (streamInfo) {
          el.srcObject = streamInfo.stream;
          console.log("Bound remote stream to video element:", streamId);
        }
      }
    };
  };

  // 组件挂载时滚动到最新消息并初始化WebRTC和WebSocket服务
  onMounted(() => {
    scrollToLatestMessage();

    // 确保初始用户状态是在线的
    const initialUser = selectedUser.value;
    // 使用currentUserName和currentUserId作为初始用户的信息，保持一致性
    const participant = participants.value.find(p => p.id === currentUserId.value);
    if (participant) {
      participant.status = "online";
      console.log("初始化用户状态为在线:", currentUserName.value);
    } else {
      // 如果初始用户不在participants数组中，添加一个新的在线用户
      const newParticipant = {
        id: currentUserId.value,
        name: currentUserName.value,
        avatar: initialUser.avatar,
        role: "participant",
        status: "online",
        audio: false,
        video: false
      };
      participants.value.push(newParticipant);
      console.log("添加初始在线用户:", currentUserName.value);
    }

    initWebRTC();
    initWebSocketService();
    
    // 启动网络质量监控
    monitorNetworkQuality();
    
    // 定期更新会议统计信息
    setInterval(updateMeetingStats, 1000); // 每秒更新一次
    updateMeetingStats(); // 初始更新

    // 发送用户加入会议消息
    setTimeout(() => {
      if (webSocketService.value) {
        // 确保WebSocket连接已建立
        if (webSocketService.value.isChatConnected()) {
          webSocketService.value.sendUserJoinedMessage(
              meetingInfo.value.id,
              currentUserId.value,
              currentUserName.value
          );
          console.log("用户加入会议消息已发送:", currentUserName.value);
        } else {
          console.error("Chat WebSocket not connected, cannot send user joined message");
          // 等待WebSocket连接建立后再发送
          setTimeout(() => {
            if (webSocketService.value && webSocketService.value.isChatConnected()) {
              webSocketService.value.sendUserJoinedMessage(
                  meetingInfo.value.id,
                  currentUserId.value,
                  currentUserName.value
              );
              console.log("用户加入会议消息已发送 (延迟):", currentUserName.value);
            } else {
              console.error("Still cannot send user joined message: Chat WebSocket not connected");
            }
          }, 2000);
        }
      }
    }, 1000);
  });

  // 组件卸载时清理WebRTC和WebSocket资源
  onUnmounted(() => {
    // 发送用户离开会议消息
    if (webSocketService.value) {
      webSocketService.value.sendUserLeftMessage(
          meetingInfo.value.id,
          currentUserId.value,
          currentUserName.value
      );
      console.log("用户离开会议消息已发送:", currentUserName.value);
    }

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
      {deep: true}
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
            // 识别是哪个参与者的屏幕共享
            let sharerName = `参与者 ${streamId.substring(0, 4)}`;
            if (streamInfo.senderId) {
              const participant = participants.value.find(p => p.id === streamInfo.senderId);
              if (participant) {
                sharerName = participant.name;
              }
            }
            currentScreenSharer.value = {
              id: streamId,
              name: sharerName,
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
      {deep: true}
  );

  return {
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
    getParticipantStreamInfo,
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
    onlineParticipantsCount,
    
    // 新增的会议控制功能
    raisedHands,
    networkQuality,
    meetingStartTime,
    isMuteAll,
    isVideoOffAll,
    meetingSettings,
    meetingStats,
    toggleRaiseHand,
    toggleMuteAll,
    toggleVideoOffAll,
    getNetworkQualityLevel,
    updateMeetingStats
  };
};
