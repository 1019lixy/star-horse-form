import { ref, Ref } from "vue";
import { MeetingSocketService } from "../../../../../../utils/websocket/MeetingSocketService";

// 聊天消息管理配置接口
export interface ChatManagerOptions {
  webSocketService: Ref<MeetingSocketService | null>;
  isConnected: Ref<boolean>;
  currentUserId: Ref<string>;
  currentUserName: Ref<string>;
  currentUserAvatar: Ref<string>;
  meetingInfo: Ref<any>;
}

// 聊天消息接口
export interface ChatMessage {
  id: number;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  sentAt: string;
  isSelf: boolean;
}

// 聊天消息管理器
export const useChatManager = (options: ChatManagerOptions) => {
  const {
    webSocketService,
    isConnected,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    meetingInfo
  } = options;

  // 聊天消息列表
  const chatMessages = ref<ChatMessage[]>([]);

  // 输入消息内容
  const inputMessage = ref("");

  // 聊天消息容器引用
  const chatMessagesRef = ref<HTMLElement | null>(null);

  // 消息订阅列表
  const messageSubscriptions = ref<string[]>([]);

  // 发送聊天消息
  const sendChatMessage = () => {
    if (inputMessage.value.trim()) {
      const newMessage: ChatMessage = {
        id: chatMessages.value.length + 1,
        senderId: currentUserId.value,
        senderName: currentUserName.value,
        senderAvatar: currentUserAvatar.value,
        content: inputMessage.value.trim(),
        sentAt: new Date().toLocaleTimeString(),
        isSelf: true
      };

      chatMessages.value.push(newMessage);

      // 通过WebSocket发送消息
      if (webSocketService.value && isConnected.value) {
        webSocketService.value.sendMeetingMessage({
          senderId: currentUserId.value,
          senderName: currentUserName.value,
          targetUserId: "all",
          content: inputMessage.value.trim(),
          meetingId: meetingInfo.value.id,
          sentAt: new Date().toISOString()
        });
      }

      inputMessage.value = "";
      scrollToLatestMessage();
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

  // 处理接收到的聊天消息
  const handleIncomingChatMessage = (message: any) => {
    const isSelf = message.senderId === currentUserId.value;
    const newMessage: ChatMessage = {
      id: chatMessages.value.length + 1,
      senderId: message.senderId,
      senderName: message.senderName,
      senderAvatar: message.senderAvatar || "",
      content: message.content,
      sentAt: new Date(message.sentAt).toLocaleTimeString(),
      isSelf
    };

    chatMessages.value.push(newMessage);
    scrollToLatestMessage();
  };

  // 订阅聊天消息
  const subscribeToMeetingMessages = () => {
    if (!webSocketService.value) return;

    // 订阅会议消息
    const meetingSubscription = webSocketService.value.subscribeToMeetingMessages(
      meetingInfo.value.id,
      (message) => {
        console.log("收到会议消息:", message);
        handleIncomingChatMessage(message);
      }
    );

    if (meetingSubscription) {
      messageSubscriptions.value.push(meetingSubscription);
      console.log("成功订阅会议消息");
    } else {
      console.error("订阅会议消息失败");
    }
  };

  // 取消所有订阅
  const unsubscribeAll = () => {
    if (webSocketService.value) {
      messageSubscriptions.value.forEach(subscriptionId => {
        webSocketService.value?.unsubscribe(subscriptionId);
      });
      messageSubscriptions.value = [];
    }
  };

  // 清理聊天管理器
  const cleanupChatManager = () => {
    unsubscribeAll();
    chatMessages.value = [];
    inputMessage.value = "";
  };

  return {
    // 状态
    chatMessages,
    inputMessage,
    chatMessagesRef,
    messageSubscriptions,

    // 方法
    sendChatMessage,
    scrollToLatestMessage,
    handleIncomingChatMessage,
    subscribeToMeetingMessages,
    unsubscribeAll,
    cleanupChatManager
  };
};
