<script setup lang="ts">

import {StarHorseDialog} from "star-horse-lowcode";
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from "vue";
import {DataChannelManager, DEFAULT_DATA_CHANNEL_OPTIONS} from "@/utils/webrtc/data-channel-manager";
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

// 模拟用户数据
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

// 为每个用户单独存储消息，使用对象来管理不同用户的聊天记录
const userMessages = ref<Record<string, any[]>>({});

// 当前显示的消息列表
const messages = computed(() => {
  if (activeTab.value === "users") {
    // 确保当前选中用户的消息数组存在
    if (!userMessages.value[selectedUser.value.id]) {
      userMessages.value[selectedUser.value.id] = [];
    }
    return userMessages.value[selectedUser.value.id];
  } else {
    // 确保当前选中群组的消息数组存在
    if (!groupMessages.value[selectedGroup.value.id]) {
      groupMessages.value[selectedGroup.value.id] = [];
    }
    return groupMessages.value[selectedGroup.value.id];
  }
});

// 选择群组
const selectGroup = (group: any) => {
  selectedGroup.value = group;
  console.log("已选择群组:", group.name, "ID:", group.id);
  // 清空该群组的未读消息数量
  groupUnreadCounts.value[group.id] = 0;
};

// 获取群组的未读消息数量，大于99显示为99+
const getGroupUnreadCount = (groupId: string) => {
  const count = groupUnreadCounts.value[groupId] || 0;
  return count > 99 ? "99+" : count;
};
// 为每个用户单独存储未读消息数量
const unreadCounts = ref<Record<string, number>>({});

// 计算属性：获取用户的未读消息数量，大于99显示为99+
const getUserUnreadCount = (userId: string) => {
  const count = unreadCounts.value[userId] || 0;
  return count > 99 ? "99+" : count;
};

// 当前选中的TAB
const activeTab = ref("users"); // 默认选中"用户"TAB

// 当前选中的用户
const selectedUser = ref(users.value[1]); // 默认选中李四，这样张三可以给李四发消息

// 群组列表
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

// 当前选中的群组
const selectedGroup = ref(groups.value[0]); // 默认选中第一个群组

// 为每个群组单独存储消息，使用对象来管理不同群组的聊天记录
const groupMessages = ref<Record<string, any[]>>({});

// 为每个群组单独存储未读消息数量
const groupUnreadCounts = ref<Record<string, number>>({});

// 输入消息内容
const inputMessage = ref("");

// WebSocket服务管理
const webSocketService = ref<WebSocketService | null>(null);
const isConnected = ref(false);
const connectionStatus = ref("未连接");
const messageSubscriptions = ref<string[]>([]);

// 预设用户身份选项
const userIdentities = [
  { id: "zhangsan", name: "张三" },
  { id: "lisi", name: "李四" }
];

// 当前用户身份
const currentIdentity = ref(userIdentities[0]);
const currentUserId = ref(currentIdentity.value.id);
const currentUserName = ref(currentIdentity.value.name);

// 更新当前用户身份
const updateCurrentIdentity = (identity: any) => {
  currentIdentity.value = identity;
  currentUserId.value = identity.id;
  currentUserName.value = identity.name;
  console.log("当前用户身份已更新:", identity.name, "ID:", identity.id);

  // 重新注册用户
  if (webSocketService.value && webSocketService.value.isWebRtcConnected()) {
    webSocketService.value.registerUser(currentUserId.value, "session_" + Date.now());
    console.log("用户已重新注册，ID:", currentUserId.value);
  }

  // 重新订阅消息
  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    // 取消之前的订阅
    messageSubscriptions.value.forEach(subscriptionId => {
      webSocketService.value?.unsubscribe(subscriptionId);
    });
    messageSubscriptions.value = [];
    // 重新订阅
    subscribeToMessages();
    console.log("消息订阅已重新建立");
  }
};

// 初始化WebSocket服务
const initWebSocketService = () => {
  try {
    console.log("Initializing WebSocket service");
    webSocketService.value = new WebSocketService({
      chatEndpoint: "/api/ws/chat",
      webrtcEndpoint: "/api/ws/webrtc",
      onChatConnected: () => {
        console.log("Chat WebSocket连接已建立");
        isConnected.value = true;
        connectionStatus.value = "已连接";
        subscribeToMessages();
      },
      onWebRtcConnected: () => {
        console.log("WebRTC WebSocket连接已建立");
        // 注册用户
        webSocketService.value?.registerUser(currentUserId.value, "session_" + Date.now());
        console.log("用户已注册，ID:", currentUserId.value);
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

    // 连接WebSocket服务器
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

// 订阅消息
const subscribeToMessages = () => {
  if (!webSocketService.value) return;

  // 清除之前的订阅
  messageSubscriptions.value.forEach(subscription => {
    webSocketService.value?.unsubscribe(subscription);
  });
  messageSubscriptions.value = [];

  // 订阅私人消息
  const privateSubscription = webSocketService.value.subscribeToPrivateMessages((message) => {
    handleIncomingMessage(message);
  },currentUserId.value);
  if (privateSubscription) {
    messageSubscriptions.value.push(privateSubscription);
  }

  // 订阅当前选中群组的消息
  if (activeTab.value === "groups") {
    const groupSubscription = webSocketService.value.subscribeToGroupMessages(selectedGroup.value.id, (message) => {
      handleIncomingMessage(message);
    });
    if (groupSubscription) {
      messageSubscriptions.value.push(groupSubscription);
    }
  }

  // 订阅会议消息
  const meetingSubscription = webSocketService.value.subscribeToMeetingMessages("meeting1", (message) => {
    handleIncomingMessage(message);
  });
  if (meetingSubscription) {
    messageSubscriptions.value.push(meetingSubscription);
  }
};

// 监听群组切换，重新订阅消息
watch(selectedGroup, () => {
  if (activeTab.value === "groups" && webSocketService.value && webSocketService.value.isChatConnected()) {
    subscribeToMessages();
  }
});

// 监听TAB切换，重新订阅消息
watch(activeTab, () => {
  if (webSocketService.value && webSocketService.value.isChatConnected()) {
    subscribeToMessages();
  }
});

// 修改handleIncomingMessage函数，添加未读消息数量管理，支持群组消息
const handleIncomingMessage = (message: any) => {
  try {
    console.log("接收到消息:", message);
    // 确保消息格式正确
    if (message.content && message.senderName) {
      // 检查消息类型
      if (message.type === "private") {
        // 私人消息
        // 检查消息是否与当前用户相关
        // 1. 消息是当前用户发送的
        // 2. 消息是发送给当前用户的
        const isRelevantMessage =
          message.senderId === currentUserId.value ||
          message.targetUserId === currentUserId.value;

        if (isRelevantMessage) {
          // 确定消息所属的聊天对象
          // 1. 如果是当前用户发送的，聊天对象是targetUserId
          // 2. 如果是其他用户发送的，聊天对象是senderId
          const chatUserId = message.senderId === currentUserId.value
            ? message.targetUserId
            : message.senderId;

          // 确保聊天对象的消息数组存在
          if (!userMessages.value[chatUserId]) {
            userMessages.value[chatUserId] = [];
          }

          const newMessage = {
            id: userMessages.value[chatUserId].length + 1,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
            isSelf: message.senderId === currentUserId.value
          };

          console.log(`添加消息到用户 ${chatUserId} 的聊天记录:`, newMessage);
          userMessages.value[chatUserId].push(newMessage);

          // 如果消息是其他用户发送的，并且当前没有与该用户聊天，增加未读消息数量
          if (message.senderId !== currentUserId.value && chatUserId !== selectedUser.value.id) {
            if (!unreadCounts.value[chatUserId]) {
              unreadCounts.value[chatUserId] = 0;
            }
            unreadCounts.value[chatUserId]++;
            console.log(`用户 ${chatUserId} 的未读消息数量更新为:`, unreadCounts.value[chatUserId]);
          }

          // 如果当前正在与该用户聊天，滚动到最新消息
          if (activeTab.value === "users" && chatUserId === selectedUser.value.id) {
            scrollToBottom();
            // 清空未读消息数量
            unreadCounts.value[chatUserId] = 0;
          }
        } else {
          console.log("消息与当前用户无关，跳过处理:", message);
        }
      } else if (message.type === "group") {
        // 群组消息
        // 检查消息是否与当前用户相关
        // 1. 消息是发送到群组的
        const isRelevantMessage = message.groupId;

        if (isRelevantMessage) {
          // 确定消息所属的群组
          const groupId = message.groupId;

          // 只有当消息不是当前用户发送的时，才将消息添加到本地的消息数组中
          // 因为当前用户发送的消息已经在sendMessage函数中添加过了
          if (message.senderId !== currentUserId.value) {
            // 确保群组的消息数组存在
            if (!groupMessages.value[groupId]) {
              groupMessages.value[groupId] = [];
            }

            const newMessage = {
              id: groupMessages.value[groupId].length + 1,
              senderId: message.senderId,
              senderName: message.senderName,
              content: message.content,
              time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
              isSelf: message.senderId === currentUserId.value
            };

            console.log(`添加消息到群组 ${groupId} 的聊天记录:`, newMessage);
            groupMessages.value[groupId].push(newMessage);

            // 如果消息是其他用户发送的，并且当前没有与该群组聊天，增加未读消息数量
            if (groupId !== selectedGroup.value.id) {
              if (!groupUnreadCounts.value[groupId]) {
                groupUnreadCounts.value[groupId] = 0;
              }
              groupUnreadCounts.value[groupId]++;
              console.log(`群组 ${groupId} 的未读消息数量更新为:`, groupUnreadCounts.value[groupId]);
            }

            // 如果当前正在与该群组聊天，滚动到最新消息
            if (activeTab.value === "groups" && groupId === selectedGroup.value.id) {
              scrollToBottom();
              // 清空未读消息数量
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


// 修改sendMessage函数，确保消息添加到正确的用户聊天记录中，支持群组消息
const sendMessage = () => {
  if (inputMessage.value.trim()) {
    const newMessage = {
      id: messages.value.length + 1,
      senderId: currentUserId.value,
      senderName: "我",
      content: inputMessage.value,
      time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
      isSelf: true
    };

    // 添加消息到当前选中用户或群组的聊天记录中
    messages.value.push(newMessage);
    inputMessage.value = "";
    // 滚动到最新消息
    scrollToBottom();

    // 通过WebSocket发送消息
    if (webSocketService.value && webSocketService.value.isChatConnected()) {
      try {
        if (activeTab.value === "users") {
          // 发送私人消息
          webSocketService.value.sendPrivateMessage({
            senderId: currentUserId.value,
            senderName: currentUserName.value,
            targetUserId: selectedUser.value.id,
            content: newMessage.content,
            sentAt: new Date().toISOString()
          });
          console.log("消息已通过WebSocket发送，发送者ID:", currentUserId.value, "接收者ID:", selectedUser.value.id);
        } else {
          // 发送群组消息
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
        // 如果发送失败，使用模拟回复
        console.log("消息发送失败，使用模拟回复");
        setTimeout(() => {
          let replyMessage;
          if (activeTab.value === "users") {
            // 模拟私人消息回复
            replyMessage = {
              id: messages.value.length + 1,
              senderId: selectedUser.value.id,
              senderName: selectedUser.value.name,
              content: "收到，谢谢！",
              time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
              isSelf: false
            };
          } else {
            // 模拟群组消息回复
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
          // 滚动到最新消息
          scrollToBottom();
        }, 1000);
      }
    } else {
      // 如果WebSocket未连接，使用模拟回复
      console.log("WebSocket未连接，使用模拟回复");
      setTimeout(() => {
        const replyMessage = {
          id: messages.value.length + 1,
          senderId: selectedUser.value.id,
          senderName: selectedUser.value.name,
          content: "收到，谢谢！",
          time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
          isSelf: false
        };
        messages.value.push(replyMessage);
        // 滚动到最新消息
        scrollToBottom();
      }, 1000);
    }
  }
};

// 选择用户
const selectUser = (user: any) => {
  selectedUser.value = user;
  // 重置未读消息
  user.unread = 0;
  // 滚动到最新消息
  scrollToBottom();
};

// 搜索用户
const searchQuery = ref("");
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  return users.value.filter(user =>
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 消息列表引用
const messageListRef = ref<HTMLElement | null>(null);

// 滚动到消息底部
const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (messageListRef.value) {
        console.log("Before scroll - scrollTop:", messageListRef.value.scrollTop, "scrollHeight:", messageListRef.value.scrollHeight, "clientHeight:", messageListRef.value.clientHeight);
        // 确保元素有足够的高度
        messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
        console.log("After scroll - scrollTop:", messageListRef.value.scrollTop);
      } else {
        console.log("messageListRef is null");
      }
    }, 100);
  });
};

// 监听消息变化，自动滚动到底部
watch(
    () => messages.value,
    () => {
      scrollToBottom();
    },
    {immediate:true,deep: true}
);
// 修改selectedUser的watch，当切换聊天对象时清空未读消息数量
watch(selectedUser, (newUser) => {
  // 清空新选中用户的未读消息数量
  if (newUser && newUser.id) {
    unreadCounts.value[newUser.id] = 0;
    console.log(`已清空用户 ${newUser.id} 的未读消息数量`);
  }
});
const init = () => {

};
// 组件挂载后初始化
onMounted(() => {
  init();
  console.log("Component mounted, initializing WebSocket service");
  initWebSocketService();
});

// 组件卸载时清理资源
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
});
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
      boxWidth="60%"
      :title="title??'聊天框'"
  >
    <el-splitter>
      <!-- 用户列表区域 -->
      <el-splitter-panel size="25%" collapsible>
        <div class="user-list-container">
          <!-- 身份选择 -->
          <div class="identity-selector">
            <div class="identity-label">当前身份:</div>
            <div class="identity-options">
              <div
                v-for="identity in userIdentities"
                :key="identity.id"
                class="identity-option"
                :class="{ active: currentIdentity.id === identity.id }"
                @click="updateCurrentIdentity(identity)"
              >
                {{ identity.name }}
              </div>
            </div>
          </div>
          <!-- TAB切换 -->
          <div class="tab-container">
            <div
                class="tab-item"
                :class="{ active: activeTab === 'users' }"
                @click="activeTab = 'users'"
            >
              用户
            </div>
            <div
                class="tab-item"
                :class="{ active: activeTab === 'groups' }"
                @click="activeTab = 'groups'"
            >
              群组
            </div>
          </div>
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
                v-model="searchQuery"
                :placeholder="activeTab === 'users' ? '搜索用户' : '搜索群组'"
                prefix-icon="el-icon-search"
                size="small"
            />
          </div>
          <!-- 用户列表 -->
          <div v-if="activeTab === 'users'" class="user-list">
            <div
                v-for="user in filteredUsers"
                :key="user.id"
                class="user-item"
                :class="{ active: selectedUser.id === user.id }"
                @click="selectUser(user)"
            >
              <div class="user-avatar">
                <img :src="user.avatar" alt="avatar"/>
                <div class="online-status" :class="{ online: user.online }"></div>
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-message">最近消息...</div>
              </div>
              <div v-if="getUserUnreadCount(user.id) > 0" class="unread-badge">
  {{ getUserUnreadCount(user.id) }}
</div>
            </div>
          </div>
          <!-- 群组列表 -->
          <div v-if="activeTab === 'groups'" class="group-list">
            <div
                v-for="group in groups"
                :key="group.id"
                class="group-item"
                :class="{ active: selectedGroup.id === group.id }"
                @click="selectGroup(group)"
            >
              <div class="group-avatar">
                <img :src="group.avatar" alt="avatar"/>
                <div class="member-count">{{ group.memberCount }}人</div>
              </div>
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="group-message">最近消息...</div>
              </div>
              <div v-if="getGroupUnreadCount(group.id) > 0" class="unread-badge">
  {{ getGroupUnreadCount(group.id) }}
</div>
            </div>
          </div>
        </div>
      </el-splitter-panel>

      <!-- 聊天区域 -->
      <el-splitter-panel>
        <el-splitter layout="vertical">
          <!-- 聊天消息区域 -->
          <el-splitter-panel size="85%">
            <div class="message-container">
              <div class="message-header">
                <div class="chat-title">{{ activeTab === 'users' ? selectedUser.name : selectedGroup.name }}</div>
                <div class="chat-actions">
                  <el-button size="small" type="text" :title="connectionStatus">
                    <i :class="isConnected ? 'el-icon-video-camera' : 'el-icon-video-camera-off'"></i>
                    <span style="margin-left: 5px; font-size: 12px;">{{ connectionStatus }}</span>
                  </el-button>
                  <el-button size="small" type="text">
                    <i class="el-icon-more"></i>
                  </el-button>
                </div>
              </div>
              <div class="message-list" ref="messageListRef">
                <div
                    v-for="message in messages"
                    :key="message.id"
                    class="message-item"
                    :class="{ 'self-message': message.isSelf }"
                >
                  <div class="message-avatar">
                    <img
                      :src="message.isSelf ? 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png' : (activeTab === 'users' ? selectedUser.avatar : selectedGroup.avatar)"
                      alt="avatar"
                    />
                  </div>
                  <div class="message-content">
                    <!-- 群组消息显示发送者名称 -->
                    <div v-if="activeTab === 'groups' && !message.isSelf" class="message-sender">
                      {{ message.senderName }}
                    </div>
                    <div class="message-bubble" :class="{ 'self-bubble': message.isSelf }">
                      {{ message.content }}
                    </div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-splitter-panel>

          <!-- 消息输入区域 -->
          <el-splitter-panel class="input-container" size="180" min="180">
            <div class="input-toolbar">
              <star-horse-icon iconClass="icon" size="16px"/>
              <star-horse-icon iconClass="image" size="16px"/>
              <star-horse-icon iconClass="document" size="16px"/>
              <star-horse-icon iconClass="phone" size="16px"/>
            </div>
            <div class="input-box">
              <el-input
                  v-model="inputMessage"
                  type="textarea"
                  placeholder="输入消息..."
                  resize="none"
                  rows="3"
                  @keyup.enter.exact="sendMessage"
              />
            </div>
            <div class="input-actions">
              <el-button type="primary" @click="sendMessage">发送</el-button>
            </div>
          </el-splitter-panel>
        </el-splitter>
      </el-splitter-panel>
    </el-splitter>
  </star-horse-dialog>
</template>

<style scoped>
/* 用户列表样式 */
.user-list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.identity-selector {
  padding: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 10px;
}

.identity-label {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
}

.identity-options {
  display: flex;
  gap: 8px;
}

.identity-option {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  background-color: #f0f2f5;
  color: #303133;
  transition: all 0.3s;
}

.identity-option:hover {
  background-color: #e6f7ff;
}

.identity-option.active {
  background-color: #409eff;
  color: #ffffff;
}

/* TAB容器样式 */
.tab-container {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
}

.tab-item {
  flex: 1;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
}

.search-box {
  padding: 10px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.user-item:hover {
  background-color: #f0f2f5;
}

.user-item.active {
  background-color: #e6f7ff;
}

.user-avatar {
  position: relative;
  margin-right: 12px;
}

.user-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #909399;
  border: 2px solid #ffffff;
}

.online-status.online {
  background-color: #67c23a;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  background-color: #f56c6c;
  color: #ffffff;
  font-size: 12px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 9px;
  padding: 0 6px;
}

/* 群组列表样式 */
.group-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.group-item:hover {
  background-color: #f0f2f5;
}

.group-item.active {
  background-color: #e6f7ff;
}

.group-avatar {
  position: relative;
  margin-right: 12px;
}

.group-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.member-count {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: #f56c6c;
  color: #ffffff;
  font-size: 10px;
  min-width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 8px;
  padding: 0 4px;
}

.group-info {
  flex: 1;
  min-width: 0;
}

.group-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.group-message {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 消息容器样式 */
.message-container {
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  height: 100%;
  overflow: hidden;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.chat-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100% - 50px);
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.self-message {
  flex-direction: row-reverse;
}

.message-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-sender {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
  align-self: flex-start;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-bubble {
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
}

.self-bubble {
  background-color: #91d5ff;
  color: #303133;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 18px;
  align-self: flex-end;
}

.message-bubble {
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
  align-self: flex-start;
}

.message-time {
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.self-message .message-time {
  text-align: right;
}

/* 输入容器样式 */
.input-container {
  background-color: #ffffff;
  border-top: 1px solid #e4e7ed;
  padding: 10px;
  overflow: hidden;
}

.input-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 5px;
  justify-content: start;

}

.input-box {
  margin-bottom: 10px;
}

.input-box textarea {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  resize: none;
  min-height: 80px;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
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
</style>
