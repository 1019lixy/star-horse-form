<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {ChatSocketService} from "@/utils/websocket/ChatSocketService";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const props = withDefaults(defineProps<{
  showIdentitySelector?: boolean;
  showTabSwitch?: boolean;
  showSearch?: boolean;
  showUserList?: boolean;
  showGroupList?: boolean;
  showChatHeader?: boolean;
  showChatMessages?: boolean;
  showChatInput?: boolean;
  showConnectionStatus?: boolean;
  showMoreButton?: boolean;
  showInputIcons?: boolean;
}>(), {
  showIdentitySelector: true,
  showTabSwitch: true,
  showSearch: true,
  showUserList: true,
  showGroupList: true,
  showChatHeader: true,
  showChatMessages: true,
  showChatInput: true,
  showConnectionStatus: true,
  showMoreButton: true,
  showInputIcons: true,
});

const users = ref([
  {
    id: "zhangsan",
    name: "张三",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: true,
    unread: 2
  },
  {
    id: "lisi",
    name: "李四",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: false,
    unread: 0
  },
  {
    id: "wangwu",
    name: "王五",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: true,
    unread: 5
  },
  {
    id: "zhaoliu",
    name: "赵六",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: false,
    unread: 0
  },
  {
    id: "qianqi",
    name: "钱七",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: true,
    unread: 1
  },
]);

const userMessages = ref<Record<string, any[]>>({});

const messages = computed(() => {
  if (activeTab.value === "users") {
    if (!userMessages.value[selectedUser.value.id]) {
      userMessages.value[selectedUser.value.id] = [];
    }
    return userMessages.value[selectedUser.value.id];
  } else {
    if (!groupMessages.value[selectedGroup.value.id]) {
      groupMessages.value[selectedGroup.value.id] = [];
    }
    return groupMessages.value[selectedGroup.value.id];
  }
});

const selectGroup = (group: any) => {
  selectedGroup.value = group;
  console.log("已选择群组:", group.name, "ID:", group.id);
  groupUnreadCounts.value[group.id] = 0;
};

const getGroupUnreadCount = (groupId: string) => {
  const count = groupUnreadCounts.value[groupId] || 0;
  return count > 99 ? "99+" : count;
};

const unreadCounts = ref<Record<string, number>>({});

const getUserUnreadCount = (userId: string) => {
  const count = unreadCounts.value[userId] || 0;
  return count > 99 ? "99+" : count;
};

const activeTab = ref("users");

const selectedUser = ref(users.value[1]);

const groups = ref([
  {
    id: "group1",
    name: "研发团队",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    memberCount: 10
  },
  {
    id: "group2",
    name: "产品团队",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    memberCount: 5
  },
  {
    id: "group3",
    name: "测试团队",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    memberCount: 8
  }
]);

const selectedGroup = ref(groups.value[0]);

const groupMessages = ref<Record<string, any[]>>({});

const groupUnreadCounts = ref<Record<string, number>>({});

const inputMessage = ref("");

const webSocketService = ref<ChatSocketService | null>(null);
const isConnected = ref(false);
const connectionStatus = ref("未连接");
const messageSubscriptions = ref<string[]>([]);

const userIdentities = [
  {id: "zhangsan", name: "张三"},
  {id: "lisi", name: "李四"}
];

const currentIdentity = ref(userIdentities[0]);
const currentUserId = ref(currentIdentity.value.id);
const currentUserName = ref(currentIdentity.value.name);

const imageInputRef = ref<HTMLInputElement | null>(null);
const localStream = ref<MediaStream | null>(null);
const remoteStream = ref<MediaStream | null>(null);
const peerConnection = ref<RTCPeerConnection | null>(null);
const isInCall = ref(false);
const callType = ref<'audio' | 'video' | null>(null);
const isCallInitiator = ref(false);
const pendingImages = ref<string[]>([]);

const showEmojiPicker = ref(false);
const customEmojis = ref<string[]>([]);
const defaultEmojis = ref([
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
  '😋', '😎', '😍', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩',
  '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
  '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
  '😒', '😓', '😔', '😕', '🙃', '🙂', '😇', '🆗', '🆘', '🙏',
  '👋', '🤚', '🙌', '👏', '🙆', '🤝', '💪', '👍', '👎', '👊',
  '✊', '🤛', '🤜', '🤞', '✌️', '🤞', '🤟', '🤝', '🙏', '💪',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💎',
  '🌟', '⭐', '🌙', '🌞', '🌈', '🔥', '💧', '🌊', '🌸', '🌺',
  '🎉', '🎊', '🎁', '🎈', '🎆', '🎇', '✨', '🎃', '🎄', '🎋'
]);

const emojiInputRef = ref<HTMLInputElement | null>(null);

const updateCurrentIdentity = (identity: any) => {
  currentIdentity.value = identity;
  currentUserId.value = identity.id;
  currentUserName.value = identity.name;
  console.log("当前用户身份已更新:", identity.name, "ID:", identity.id);

  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    webSocketService.value.registerUser(currentUserId.value, "session_" + Date.now());
    console.log("用户已重新注册，ID:", currentUserId.value);
  }

  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    messageSubscriptions.value.forEach(subscriptionId => {
      webSocketService.value?.unsubscribe(subscriptionId);
    });
    messageSubscriptions.value = [];
    subscribeToMessages();
    console.log("消息订阅已重新建立");
  }
};

const initWebSocketService = () => {
  try {
    console.log("Initializing WebSocket service");
    webSocketService.value = new ChatSocketService({
      chatEndpoint: "/api/ws/chat",
      onChatConnected: () => {
        console.log("Chat WebSocket连接已建立");
        isConnected.value = true;
        connectionStatus.value = "已连接";
        subscribeToMessages();
      },

      onError: (error) => {
        console.error("WebSocket错误:", error);
        connectionStatus.value = "错误: " + error;
      },
      onDisconnected: () => {
        isConnected.value = false;
        connectionStatus.value = "已断开";
        console.log("WebSocket连接已断开");
      }
    });

    console.log("Attempting to connect to WebSocket server");
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
    }).catch((error) => {
      console.error("WebSocket连接过程中出错:", error);
      isConnected.value = false;
      connectionStatus.value = "连接出错";
    });

    console.log("WebSocket服务初始化完成");
  } catch (error) {
    console.error("初始化WebSocket服务失败:", error);
    isConnected.value = false;
    connectionStatus.value = "初始化失败";
  }
};

const subscribeToMessages = () => {
  if (!webSocketService.value) return;

  messageSubscriptions.value.forEach(subscription => {
    webSocketService.value?.unsubscribe(subscription);
  });
  messageSubscriptions.value = [];

  const privateSubscription = webSocketService.value.subscribeToPrivateMessages((message) => {
    handleIncomingMessage(message);
  }, currentUserId.value);
  if (privateSubscription) {
    messageSubscriptions.value.push(privateSubscription);
  }

  if (activeTab.value === "groups") {
    const groupSubscription = webSocketService.value.subscribeToGroupMessages(selectedGroup.value.id, (message) => {
      handleIncomingMessage(message);
    });
    if (groupSubscription) {
      messageSubscriptions.value.push(groupSubscription);
    }
  }

  const callOfferSubscription = webSocketService.value.subscribeToCallOffer((message) => {
    handleIncomingCall(message);
  }, currentUserId.value);
  if (callOfferSubscription) {
    messageSubscriptions.value.push(callOfferSubscription);
  }

  const callAnswerSubscription = webSocketService.value.subscribeToCallAnswer((message) => {
    handleCallAnswer(message);
  }, currentUserId.value);
  if (callAnswerSubscription) {
    messageSubscriptions.value.push(callAnswerSubscription);
  }

  const callRejectSubscription = webSocketService.value.subscribeToCallReject((message) => {
    handleCallReject(message);
  }, currentUserId.value);
  if (callRejectSubscription) {
    messageSubscriptions.value.push(callRejectSubscription);
  }

  const callEndSubscription = webSocketService.value.subscribeToCallEnd((message) => {
    endCall();
  }, currentUserId.value);
  if (callEndSubscription) {
    messageSubscriptions.value.push(callEndSubscription);
  }

  const iceCandidateSubscription = webSocketService.value.subscribeToIceCandidate((message) => {
    handleIceCandidate(message);
  }, currentUserId.value);
  if (iceCandidateSubscription) {
    messageSubscriptions.value.push(iceCandidateSubscription);
  }
};

watch(selectedGroup, () => {
  if (activeTab.value === "groups" && webSocketService.value && webSocketService.value.isChatConnected()) {
    subscribeToMessages();
  }
});

watch(activeTab, () => {
  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    subscribeToMessages();
  }
});

const handleIncomingMessage = (message: any) => {
  try {
    console.log("接收到消息:", message);
    if (message.content && message.senderName) {
      if (message.messageType === "private") {
        const isRelevantMessage =
            message.senderId === currentUserId.value ||
            message.targetUserId === currentUserId.value;

        if (isRelevantMessage) {
          const chatUserId = message.senderId === currentUserId.value
              ? message.targetUserId
              : message.senderId;

          if (!userMessages.value[chatUserId]) {
            userMessages.value[chatUserId] = [];
          }

          const newMessage = {
            id: userMessages.value[chatUserId].length + 1,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            type: message.type || 'text',
            time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
            isSelf: message.senderId === currentUserId.value
          };

          console.log(`添加消息到用户 ${chatUserId} 的聊天记录:`, newMessage);
          userMessages.value[chatUserId].push(newMessage);

          if (message.senderId !== currentUserId.value && chatUserId !== selectedUser.value.id) {
            if (!unreadCounts.value[chatUserId]) {
              unreadCounts.value[chatUserId] = 0;
            }
            unreadCounts.value[chatUserId]++;
            console.log(`用户 ${chatUserId} 的未读消息数量更新为:`, unreadCounts.value[chatUserId]);
          }

          if (activeTab.value === "users" && chatUserId === selectedUser.value.id) {
            scrollToBottom();
            unreadCounts.value[chatUserId] = 0;
          }
        } else {
          console.log("消息与当前用户无关，跳过处理:", message);
        }
      } else if (message.messageType === "group") {
        const isRelevantMessage = message.groupId;

        if (isRelevantMessage) {
          const groupId = message.groupId;

          if (message.senderId !== currentUserId.value) {
            if (!groupMessages.value[groupId]) {
              groupMessages.value[groupId] = [];
            }

            const newMessage = {
              id: groupMessages.value[groupId].length + 1,
              senderId: message.senderId,
              senderName: message.senderName,
              content: message.content,
              type: message.type || 'text',
              time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
              isSelf: message.senderId === currentUserId.value
            };

            console.log(`添加消息到群组 ${groupId} 的聊天记录:`, newMessage);
            groupMessages.value[groupId].push(newMessage);

            if (groupId !== selectedGroup.value.id) {
              if (!groupUnreadCounts.value[groupId]) {
                groupUnreadCounts.value[groupId] = 0;
              }
              groupUnreadCounts.value[groupId]++;
              console.log(`群组 ${groupId} 的未读消息数量更新为:`, groupUnreadCounts.value[groupId]);
            }

            if (activeTab.value === "groups" && groupId === selectedGroup.value.id) {
              scrollToBottom();
              groupUnreadCounts.value[groupId] = 0;
            }
          }
        } else {
          console.log("消息与当前用户无关，跳过处理:", message);
        }
      }
    } else {
      console.log("消息格式不正确，跳过处理:", message);
    }
  } catch (error) {
    console.error("处理接收到的消息失败:", error);
  }
};


const sendMessage = () => {
  const hasText = inputMessage.value.trim();
  const hasImages = pendingImages.value.length > 0;

  if (!hasText && !hasImages) {
    return;
  }

  if (hasImages) {
    pendingImages.value.forEach((imageUrl) => {
      const newMessage = {
        id: messages.value.length + 1,
        senderId: currentUserId.value,
        senderName: "我",
        content: imageUrl,
        type: 'image',
        time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
        isSelf: true
      };

      messages.value.push(newMessage);

      if (webSocketService.value && webSocketService.value.isChatConnected()) {
        try {
          if (activeTab.value === "users") {
            webSocketService.value.sendPrivateMessage({
              senderId: currentUserId.value,
              senderName: currentUserName.value,
              targetUserId: selectedUser.value.id,
              content: imageUrl,
              type: 'image',
              sentAt: new Date().toISOString()
            });
          } else {
            webSocketService.value.sendGroupMessage({
              senderId: currentUserId.value,
              senderName: currentUserName.value,
              groupId: selectedGroup.value.id,
              content: imageUrl,
              type: 'image',
              sentAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("发送图片失败:", error);
        }
      }
    });
    pendingImages.value = [];
  }

  if (hasText) {
    const newMessage = {
      id: messages.value.length + 1,
      senderId: currentUserId.value,
      senderName: "我",
      content: inputMessage.value,
      time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
      isSelf: true
    };

    messages.value.push(newMessage);
    inputMessage.value = "";

    if (webSocketService.value && webSocketService.value.isChatConnected()) {
      try {
        if (activeTab.value === "users") {
          webSocketService.value.sendPrivateMessage({
            senderId: currentUserId.value,
            senderName: currentUserName.value,
            targetUserId: selectedUser.value.id,
            content: newMessage.content,
            sentAt: new Date().toISOString()
          });
          console.log("消息已通过WebSocket发送，发送者ID:", currentUserId.value, "接收者ID:", selectedUser.value.id);
        } else {
          webSocketService.value.sendGroupMessage({
            senderId: currentUserId.value,
            senderName: currentUserName.value,
            groupId: selectedGroup.value.id,
            content: newMessage.content,
            sentAt: new Date().toISOString()
          });
          console.log("消息已通过WebSocket发送，发送者ID:", currentUserId.value, "群组ID:", selectedGroup.value.id);
        }
      } catch (error) {
        console.error("发送消息失败:", error);
        console.log("消息发送失败，使用模拟回复");
        setTimeout(() => {
          let replyMessage;
          if (activeTab.value === "users") {
            replyMessage = {
              id: messages.value.length + 1,
              senderId: selectedUser.value.id,
              senderName: selectedUser.value.name,
              content: "收到，谢谢！",
              time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
              isSelf: false
            };
          } else {
            replyMessage = {
              id: messages.value.length + 1,
              senderId: "system",
              senderName: "系统",
              content: "消息已发送到群组",
              time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
              isSelf: false
            };
          }
          messages.value.push(replyMessage);
          scrollToBottom();
        }, 1000);
      }
    }
  }

  scrollToBottom();
};

const triggerImageUpload = () => {
  imageInputRef.value?.click();
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    compressImage(file, 0.7).then((compressedDataUrl) => {
      pendingImages.value.push(compressedDataUrl);
    });
  }
  target.value = '';
};

const compressImage = (file: File, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxWidth = 1920;
        const maxHeight = 1080;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const sendImageMessage = (imageUrl: string) => {
  const newMessage = {
    id: messages.value.length + 1,
    senderId: currentUserId.value,
    senderName: "我",
    content: imageUrl,
    type: 'image',
    time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
    isSelf: true
  };

  messages.value.push(newMessage);
  scrollToBottom();

  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    try {
      if (activeTab.value === "users") {
        webSocketService.value.sendPrivateMessage({
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          targetUserId: selectedUser.value.id,
          content: imageUrl,
          type: 'image',
          sentAt: new Date().toISOString()
        });
      } else {
        webSocketService.value.sendGroupMessage({
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          groupId: selectedGroup.value.id,
          content: imageUrl,
          type: 'image',
          sentAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("发送图片失败:", error);
    }
  }
};

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {
        compressImage(blob, 0.7).then((compressedDataUrl) => {
          pendingImages.value.push(compressedDataUrl);
        });
      }
      event.preventDefault();
      break;
    }
  }
};

const removePendingImage = (index: number) => {
  pendingImages.value.splice(index, 1);
};

const handleBackspace = (event: KeyboardEvent) => {
  if (pendingImages.value.length > 0 && !inputMessage.value) {
    pendingImages.value.pop();
  }
};

const handleCut = async (event: ClipboardEvent) => {
  if (pendingImages.value.length > 0 || inputMessage.value) {
    try {
      if (pendingImages.value.length > 0) {
        const imagePromises = pendingImages.value.map(async (imageUrl) => {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          return new ClipboardItem({ [blob.type]: blob });
        });
        const clipboardItems = await Promise.all(imagePromises);
        await navigator.clipboard.write(clipboardItems);
      }
      
      if (inputMessage.value) {
        await navigator.clipboard.writeText(inputMessage.value);
      }
    } catch (error) {
      console.error("复制到剪切板失败:", error);
    }
    
    setTimeout(() => {
      pendingImages.value = [];
      inputMessage.value = '';
    }, 0);
  }
};

const startAudioCall = async () => {
  if (isInCall.value) {
    alert("您已经在通话中");
    return;
  }

  console.log("开始发起语音通话...");
  console.log("WebSocket 连接状态:", isConnected.value);
  console.log("WebSocket 服务:", webSocketService.value);
  console.log("WebSocket 是否已连接:", webSocketService.value?.isChatConnected());

  if (!webSocketService.value || !webSocketService.value.isChatConnected()) {
    alert("WebSocket 未连接，请等待连接建立后再试");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStream.value = stream;
    callType.value = 'audio';
    isCallInitiator.value = true;
    
    await setupPeerConnection(stream);
    
    const offer = await peerConnection.value!.createOffer();
    await peerConnection.value!.setLocalDescription(offer);
    
    const targetId = activeTab.value === "users" ? selectedUser.value.id : selectedGroup.value.id;
    console.log("发送语音通话邀请到:", targetId);
    webSocketService.value.sendCallOffer({
      callerId: currentUserId.value,
      callerName: currentUserName.value,
      targetId: targetId,
      callType: 'audio',
      offer: offer
    });
    
    isInCall.value = true;
  } catch (error) {
    console.error("发起语音通话失败:", error);
    alert("无法访问麦克风，请检查权限设置");
  }
};

const startVideoCall = async () => {
  if (isInCall.value) {
    alert("您已经在通话中");
    return;
  }

  console.log("开始发起视频通话...");
  console.log("WebSocket 连接状态:", isConnected.value);
  console.log("WebSocket 服务:", webSocketService.value);
  console.log("WebSocket 是否已连接:", webSocketService.value?.isChatConnected());

  if (!webSocketService.value || !webSocketService.value.isChatConnected()) {
    alert("WebSocket 未连接，请等待连接建立后再试");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.value = stream;
    callType.value = 'video';
    isCallInitiator.value = true;
    
    await setupPeerConnection(stream);
    
    const offer = await peerConnection.value!.createOffer();
    await peerConnection.value!.setLocalDescription(offer);
    
    const targetId = activeTab.value === "users" ? selectedUser.value.id : selectedGroup.value.id;
    console.log("发送视频通话邀请到:", targetId);
    webSocketService.value.sendCallOffer({
      callerId: currentUserId.value,
      callerName: currentUserName.value,
      targetId: targetId,
      callType: 'video',
      offer: offer
    });
    
    isInCall.value = true;
  } catch (error) {
    console.error("发起视频通话失败:", error);
    alert("无法访问摄像头和麦克风，请检查权限设置");
  }
};

const setupPeerConnection = async (stream: MediaStream) => {
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };
  
  peerConnection.value = new RTCPeerConnection(configuration);
  
  stream.getTracks().forEach(track => {
    peerConnection.value!.addTrack(track, stream);
  });
  
  peerConnection.value.ontrack = (event) => {
    remoteStream.value = event.streams[0];
  };
  
  peerConnection.value.onicecandidate = (event) => {
    if (event.candidate && webSocketService.value && webSocketService.value.isChatConnected()) {
      const targetId = activeTab.value === "users" ? selectedUser.value.id : selectedGroup.value.id;
      webSocketService.value.sendIceCandidate({
        callerId: currentUserId.value,
        targetId: targetId,
        candidate: event.candidate
      });
    }
  };
  
  peerConnection.value.onconnectionstatechange = () => {
    if (peerConnection.value?.connectionState === 'disconnected') {
      endCall();
    }
  };
};

const handleIncomingCall = async (callData: any) => {
  if (isInCall.value) {
    if (webSocketService.value && webSocketService.value.isChatConnected()) {
      webSocketService.value.sendCallReject({
        callerId: callData.callerId,
        targetId: currentUserId.value,
        reason: 'busy'
      });
    }
    return;
  }
  
  const shouldAccept = confirm(`${callData.callerName} 请求${callData.callType === 'audio' ? '语音' : '视频'}通话，是否接受？`);
  
  if (shouldAccept) {
    try {
      const constraints = callData.callType === 'audio' 
        ? { audio: true } 
        : { video: true, audio: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.value = stream;
      callType.value = callData.callType;
      isCallInitiator.value = false;
      
      await setupPeerConnection(stream);
      
      await peerConnection.value!.setRemoteDescription(new RTCSessionDescription(callData.offer));
      
      const answer = await peerConnection.value!.createAnswer();
      await peerConnection.value!.setLocalDescription(answer);
      
      if (webSocketService.value && webSocketService.value.isChatConnected()) {
        webSocketService.value.sendCallAnswer({
          callerId: callData.callerId,
          targetId: currentUserId.value,
          answer: answer
        });
      }
      
      isInCall.value = true;
    } catch (error) {
      console.error("接受通话失败:", error);
      alert("无法访问媒体设备，请检查权限设置");
    }
  } else {
    if (webSocketService.value && webSocketService.value.isChatConnected()) {
      webSocketService.value.sendCallReject({
        callerId: callData.callerId,
        targetId: currentUserId.value,
        reason: 'rejected'
      });
    }
  }
};

const handleCallAnswer = async (answerData: any) => {
  if (peerConnection.value) {
    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(answerData.answer));
  }
};

const handleIceCandidate = async (candidateData: any) => {
  if (peerConnection.value && candidateData.candidate) {
    await peerConnection.value.addIceCandidate(new RTCIceCandidate(candidateData.candidate));
  }
};

const handleCallReject = (rejectData: any) => {
  alert(`对方拒绝了通话请求: ${rejectData.reason === 'busy' ? '对方忙' : '对方拒绝'}`);
  endCall();
};

const endCall = () => {
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => track.stop());
    localStream.value = null;
  }
  
  if (peerConnection.value) {
    peerConnection.value.close();
    peerConnection.value = null;
  }
  
  remoteStream.value = null;
  isInCall.value = false;
  callType.value = null;
  isCallInitiator.value = false;
  
  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    const targetId = activeTab.value === "users" ? selectedUser.value.id : selectedGroup.value.id;
    webSocketService.value.sendCallEnd({
      callerId: currentUserId.value,
      targetId: targetId
    });
  }
};

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

const selectEmoji = (emoji: string) => {
  inputMessage.value += emoji;
  showEmojiPicker.value = false;
};

const addCustomEmoji = () => {
  emojiInputRef.value?.click();
};

const handleCustomEmojiUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const emojiDataUrl = e.target?.result as string;
      customEmojis.value.push(emojiDataUrl);
      localStorage.setItem('customEmojis', JSON.stringify(customEmojis.value));
    };
    reader.readAsDataURL(file);
  }
  target.value = '';
};

const removeCustomEmoji = (index: number) => {
  customEmojis.value.splice(index, 1);
  localStorage.setItem('customEmojis', JSON.stringify(customEmojis.value));
};

onMounted(() => {
  const savedCustomEmojis = localStorage.getItem('customEmojis');
  if (savedCustomEmojis) {
    try {
      customEmojis.value = JSON.parse(savedCustomEmojis);
    } catch (error) {
      console.error("加载自定义表情失败:", error);
    }
  }
});

const previewImage = (imageUrl: string) => {
  const image = new Image();
  image.src = imageUrl;
  image.onload = () => {
    const width = Math.min(window.innerWidth * 0.8, image.naturalWidth);
    const height = Math.min(window.innerHeight * 0.8, image.naturalHeight);
    
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>图片预览</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: rgba(0, 0, 0, 0.9);
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="预览图片" onclick="window.close()" style="cursor: pointer;">
        </body>
        </html>
      `);
    }
  };
};

const selectUser = (user: any) => {
  selectedUser.value = user;
  user.unread = 0;
  scrollToBottom();
};

const searchQuery = ref("");
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const messageListRef = ref<HTMLElement | null>(null);

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (messageListRef.value) {
        console.log("Before scroll - scrollTop:", messageListRef.value.scrollTop, "scrollHeight:", messageListRef.value.scrollHeight, "clientHeight:", messageListRef.value.clientHeight);
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        console.log("After scroll - scrollTop:", messageListRef.value.scrollTop);
      } else {
        console.log("messageListRef is null");
      }
    }, 100);
  });
};

watch(
    () => messages.value,
    () => {
      scrollToBottom();
    },
    {immediate: true, deep: true}
);

watch(selectedUser, (newUser) => {
  if (newUser && newUser.id) {
    unreadCounts.value[newUser.id] = 0;
    console.log(`已清空用户 ${newUser.id} 的未读消息数量`);
  }
});

const init = () => {

};

onMounted(() => {
  init();
  console.log("Component mounted, initializing WebSocket service");
  initWebSocketService();
});

onUnmounted(() => {
  messageSubscriptions.value.forEach(subscriptionId => {
    webSocketService.value?.unsubscribe(subscriptionId);
  });

  if (webSocketService.value) {
    webSocketService.value.disconnect();
    console.log("WebSocket服务已关闭");
  }

  if (audioRecorderRef.value && isRecordingAudio.value) {
    audioRecorderRef.value.stop();
  }

  if (videoRecorderRef.value && isRecordingVideo.value) {
    videoRecorderRef.value.stop();
  }
});

defineExpose({
  initWebSocketService,
  cleanup: () => {
    messageSubscriptions.value.forEach(subscriptionId => {
      webSocketService.value?.unsubscribe(subscriptionId);
    });
    if (webSocketService.value) {
      webSocketService.value.disconnect();
    }
  }
});
</script>

<template>
  <el-splitter>
    <el-splitter-panel size="25%" collapsible>
      <div class="flex flex-col h-full bg-gray-50">
        <div v-if="showIdentitySelector" class="p-2.5 bg-white border-b border-gray-200 flex items-center gap-2.5">
          <div class="text-xs text-gray-500 whitespace-nowrap">当前身份:</div>
          <div class="flex gap-2">
            <div
                v-for="identity in userIdentities"
                :key="identity.id"
                class="px-3 py-1 rounded-full text-xs cursor-pointer bg-gray-100 text-gray-800 transition-all duration-300 hover:bg-blue-50"
                :class="{ 'bg-blue-500 text-white': currentIdentity.id === identity.id }"
                @click="updateCurrentIdentity(identity)"
            >
              {{ identity.name }}
            </div>
          </div>
        </div>
        <div v-if="showTabSwitch" class="flex border-b border-gray-200 bg-white">
          <div
              class="flex-1 py-2.5 text-center text-base cursor-pointer transition-all duration-300 text-gray-600 border-b-2 border-transparent hover:text-blue-500"
              :class="{ 'text-blue-500 border-blue-500': activeTab === 'users' }"
              @click="activeTab = 'users'"
          >
            用户
          </div>
          <div
              class="flex-1 py-2.5 text-center text-base cursor-pointer transition-all duration-300 text-gray-600 border-b-2 border-transparent hover:text-blue-500"
              :class="{ 'text-blue-500 border-blue-500': activeTab === 'groups' }"
              @click="activeTab = 'groups'"
          >
            群组
          </div>
        </div>
        <div v-if="showSearch" class="p-2.5 bg-white border-b border-gray-200">
          <el-input
              v-model="searchQuery"
              :placeholder="activeTab === 'users' ? '搜索用户' : '搜索群组'"
              size="default"
          >
            <template #prefix>
              <el-icon>
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </div>
        <div v-if="showUserList && activeTab === 'users'" class="flex-1 overflow-y-auto p-0">
          <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="flex items-center p-3 cursor-pointer transition-all duration-300 hover:bg-gray-100"
              :class="{ 'bg-blue-50': selectedUser.id === user.id }"
              @click="selectUser(user)"
          >
            <div class="relative mr-3">
              <img :src="user.avatar" alt="avatar" class="w-12 h-12 rounded-full object-cover"/>
              <div class="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white" :class="user.online ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-base font-medium text-gray-800 mb-1">{{ user.name }}</div>
              <div class="text-sm text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">最近消息...</div>
            </div>
            <div class="bg-red-500 text-white text-sm min-w-5 h-5 leading-5 text-center rounded-full px-2">
              {{ getUserUnreadCount(user.id) }}
            </div>
          </div>
        </div>
        <div v-if="showGroupList && activeTab === 'groups'" class="flex-1 overflow-y-auto p-0">
          <div
              v-for="group in groups"
              :key="group.id"
              class="flex items-center p-3 cursor-pointer transition-all duration-300 hover:bg-gray-100"
              :class="{ 'bg-blue-50': selectedGroup.id === group.id }"
              @click="selectGroup(group)"
          >
            <div class="relative mr-3">
              <img :src="group.avatar" alt="avatar" class="w-12 h-12 rounded-full object-cover"/>
              <div class="absolute bottom-[-4px] right-[-4px] bg-red-500 text-white text-sm min-w-5 h-5 leading-5 text-center rounded-full px-1.5">
                {{ group.memberCount }}人
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-base font-medium text-gray-800 mb-1">{{ group.name }}</div>
              <div class="text-sm text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">最近消息...</div>
            </div>
            <div class="bg-red-500 text-white text-sm min-w-5 h-5 leading-5 text-center rounded-full px-2">
              {{ getGroupUnreadCount(group.id) }}
            </div>
          </div>
        </div>
      </div>
    </el-splitter-panel>

    <el-splitter-panel>
      <el-splitter layout="vertical">
        <el-splitter-panel size="85%">
          <div class="flex flex-col bg-gray-100 h-full overflow-hidden">
            <div v-if="showChatHeader" class="flex justify-between items-center p-4 bg-white border-b border-gray-200 flex-shrink-0 sticky top-0 z-10">
              <div class="text-lg font-medium text-gray-800">{{ activeTab === 'users' ? selectedUser.name : selectedGroup.name }}</div>
              <div class="flex items-center gap-2">
                <el-button v-if="showConnectionStatus" size="default" type="text" :title="connectionStatus">
                  <el-icon v-if="isConnected">
                    <VideoCamera/>
                  </el-icon>
                  <el-icon v-else>
                    <VideoCamera/>
                  </el-icon>
                  <span class="ml-1.5 text-sm">{{ connectionStatus }}</span>
                </el-button>
                <el-button v-if="showMoreButton" size="default" type="text">
                  <el-icon>
                    <More/>
                  </el-icon>
                </el-button>
              </div>
            </div>
            <div v-if="isInCall" class="absolute inset-0 bg-black z-50 flex flex-col">
              <div class="flex-1 relative">
                <video
                    v-if="callType === 'video'"
                    :srcObject="remoteStream"
                    autoplay
                    playsinline
                    class="w-full h-full object-cover"
                ></video>
                <div v-else class="w-full h-full flex items-center justify-center">
                  <div class="text-white text-6xl">
                    {{ activeTab === 'users' ? selectedUser.name : selectedGroup.name }}
                  </div>
                </div>
                <video
                    v-if="callType === 'video' && localStream"
                    :srcObject="localStream"
                    autoplay
                    playsinline
                    muted
                    class="absolute bottom-4 right-4 w-32 h-24 object-cover rounded-lg border-2 border-white shadow-lg"
                ></video>
              </div>
              <div class="bg-gray-900 p-4 flex justify-center gap-4">
                <el-button type="danger" size="large" @click="endCall" circle>
                  <el-icon><PhoneFilled /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-if="showChatMessages" class="flex-1 overflow-y-auto p-5 flex flex-col gap-4" ref="messageListRef">
              <div
                  v-for="message in messages"
                  :key="message.id"
                  class="flex items-start gap-3"
                  :class="{ 'justify-end': message.isSelf }"
              >
                <div v-if="!message.isSelf" class="flex-shrink-0">
                  <img
                      :src="activeTab === 'users' ? selectedUser.avatar : selectedGroup.avatar"
                      alt="avatar"
                      class="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <div class="max-w-[70%] min-w-0">
                  <div v-if="activeTab === 'groups' && !message.isSelf" class="text-sm text-gray-600 ml-2 mb-1">
                    {{ message.senderName }}
                  </div>
                  <div v-if="!message.isSelf" class="mt-1.5 p-3 rounded-2xl rounded-bl-sm bg-white text-gray-800 text-base self-start">
                    <div v-if="message.type === 'image'">
                      <img :src="message.content" alt="image" class="max-w-full rounded-lg cursor-pointer" @click="previewImage(message.content)"/>
                    </div>
                    <div v-else-if="message.type === 'audio'">
                      <audio :src="message.content" controls class="max-w-full"></audio>
                    </div>
                    <div v-else-if="message.type === 'video'">
                      <video :src="message.content" controls class="max-w-full rounded-lg"></video>
                    </div>
                    <div v-else>
                      {{ message.content }}
                    </div>
                  </div>
                  <div v-else class="mt-1.5 p-3 rounded-2xl rounded-br-sm bg-blue-100 text-gray-800 text-base self-end">
                    <div v-if="message.type === 'image'">
                      <img :src="message.content" alt="image" class="max-w-full rounded-lg cursor-pointer" @click="previewImage(message.content)"/>
                    </div>
                    <div v-else-if="message.type === 'audio'">
                      <audio :src="message.content" controls class="max-w-full"></audio>
                    </div>
                    <div v-else-if="message.type === 'video'">
                      <video :src="message.content" controls class="max-w-full rounded-lg"></video>
                    </div>
                    <div v-else>
                      {{ message.content }}
                    </div>
                  </div>
                  <div class="text-sm text-gray-400" :class="message.isSelf ? 'text-right' : 'text-left'">
                    {{ message.time }}
                  </div>
                </div>
                <div v-if="message.isSelf" class="flex-shrink-0">
                  <img
                      src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
                      alt="avatar"
                      class="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </el-splitter-panel>

        <el-splitter-panel v-if="showChatInput" size="180" min="180">
          <div class="bg-white border-t border-gray-200 p-2.5 overflow-hidden">
            <input
                ref="imageInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
            />
            <input
                ref="emojiInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleCustomEmojiUpload"
            />
            <div v-if="showInputIcons" class="flex gap-3 items-center mb-3">
              <el-button size="default" type="text" @click="triggerImageUpload" title="发送图片">
                <el-icon><Picture /></el-icon>
              </el-button>
              <el-button size="default" type="text" @click="toggleEmojiPicker" title="表情包">
                <span class="text-xl">😊</span>
              </el-button>
              <el-button v-if="!isInCall" size="default" type="text" @click="startAudioCall" title="语音通话">
                <el-icon><Microphone /></el-icon>
              </el-button>
              <el-button v-if="!isInCall" size="default" type="text" @click="startVideoCall" title="视频通话">
                <el-icon><VideoCamera /></el-icon>
              </el-button>
              <el-button v-if="isInCall" size="default" type="danger" @click="endCall" title="挂断">
                <el-icon><PhoneFilled /></el-icon>
              </el-button>
            </div>
            
            <div v-if="showEmojiPicker" class="absolute bottom-32 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 max-h-80 overflow-y-auto">
              <div class="flex justify-between items-center mb-3">
                <span class="text-sm font-medium text-gray-700">表情包</span>
                <el-button size="small" type="primary" @click="addCustomEmoji">
                  <el-icon><Plus /></el-icon>
                  添加自定义表情
                </el-button>
              </div>
              
              <div class="mb-4">
                <div class="text-xs text-gray-500 mb-2">默认表情</div>
                <div class="grid grid-cols-8 gap-2">
                  <div 
                      v-for="emoji in defaultEmojis" 
                      :key="emoji"
                      @click="selectEmoji(emoji)"
                      class="text-2xl cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors text-center"
                  >
                    {{ emoji }}
                  </div>
                </div>
              </div>
              
              <div v-if="customEmojis.length > 0">
                <div class="text-xs text-gray-500 mb-2">自定义表情</div>
                <div class="grid grid-cols-6 gap-2">
                  <div 
                      v-for="(emoji, index) in customEmojis" 
                      :key="index"
                      class="relative cursor-pointer hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    <img :src="emoji" alt="custom emoji" class="w-10 h-10 object-cover rounded" @click="selectEmoji(emoji)"/>
                    <button 
                        @click.stop="removeCustomEmoji(index)" 
                        class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mb-2.5 relative">
              <div 
                  class="input-container rounded-lg border border-gray-300 p-2 min-h-[80px] flex items-start gap-2"
                  :class="{ 'focus-within': inputMessage || pendingImages.length > 0 }"
              >
                <div v-if="pendingImages.length > 0" class="flex gap-2 flex-shrink-0">
                  <div v-for="(imageUrl, index) in pendingImages" :key="index" class="relative inline-block">
                    <img :src="imageUrl" alt="preview" class="w-16 h-16 object-cover rounded-lg border border-gray-200"/>
                    <button 
                        @click="removePendingImage(index)" 
                        class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <textarea
                    v-model="inputMessage"
                    placeholder="输入消息... (支持粘贴图片)"
                    class="w-full resize-none border-none outline-none text-base"
                    rows="3"
                    @keyup.enter.exact="sendMessage"
                    @keyup.backspace="handleBackspace"
                    @paste="handlePaste"
                    @cut="handleCut"
                ></textarea>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span v-if="isRecordingAudio" class="text-xs text-red-500">正在录音...</span>
              <span v-else-if="isRecordingVideo" class="text-xs text-red-500">正在录像...</span>
              <div class="flex-1"></div>
              <el-button type="primary" @click="sendMessage">发送</el-button>
            </div>
          </div>
        </el-splitter-panel>
      </el-splitter>
    </el-splitter-panel>
  </el-splitter>
</template>

<style scoped>
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

.input-container {
  transition: border-color 0.3s ease;
}

.input-container:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.input-container textarea {
  font-family: inherit;
  line-height: 1.5;
}

.input-container textarea::placeholder {
  color: #a8abb2;
}
</style>
