<script setup lang="ts">

import {StarHorseDialog} from "star-horse-lowcode";
import {computed, nextTick, onMounted, ref, watch} from "vue";

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
    id: 1,
    name: "张三",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: true,
    unread: 2
  },
  {
    id: 2,
    name: "李四",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: false,
    unread: 0
  },
  {
    id: 3,
    name: "王五",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: true,
    unread: 5
  },
  {
    id: 4,
    name: "赵六",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: false,
    unread: 0
  },
  {
    id: 5,
    name: "钱七",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    online: true,
    unread: 1
  },
]);

// 模拟聊天消息
const messages = ref<any>([]);

// 当前选中的用户
const selectedUser = ref(users.value[0]);

// 输入消息内容
const inputMessage = ref("");

// 发送消息
const sendMessage = () => {
  if (inputMessage.value.trim()) {
    const newMessage = {
      id: messages.value.length + 1,
      senderId: 0,
      senderName: "我",
      content: inputMessage.value,
      time: new Date().toLocaleTimeString("zh-CN", {hour: "2-digit", minute: "2-digit"}),
      isSelf: true
    };
    messages.value.push(newMessage);
    inputMessage.value = "";
    // 滚动到最新消息
    scrollToBottom();
    // 模拟对方回复
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
const init = () => {
  messages.value = [
    {id: 1, senderId: 1, senderName: "张三", content: "你好，在吗？", time: "09:30", isSelf: false},
    {id: 2, senderId: 0, senderName: "我", content: "在的，有什么事？", time: "09:31", isSelf: true},
    {id: 3, senderId: 1, senderName: "张三", content: "关于项目进度，我们需要讨论一下", time: "09:32", isSelf: false},
    {id: 4, senderId: 1, senderName: "张三", content: "明天下午3点可以吗？", time: "09:33", isSelf: false},
    {id: 5, senderId: 0, senderName: "我", content: "好的，没问题", time: "09:34", isSelf: true},
  ];
};
// 组件挂载后滚动到底部
onMounted(() => {
  init();
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
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
                v-model="searchQuery"
                placeholder="搜索用户"
                prefix-icon="el-icon-search"
                size="small"
            />
          </div>
          <!-- 用户列表 -->
          <div class="user-list">
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
              <div v-if="user.unread > 0" class="unread-badge">{{ user.unread }}</div>
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
                <div class="chat-title">{{ selectedUser.name }}</div>
                <div class="chat-actions">
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
                  <div v-if="!message.isSelf" class="message-avatar">
                    <img :src="selectedUser.avatar" alt="avatar"/>
                  </div>
                  <div class="message-content">
                    <div class="message-bubble" :class="{ 'self-bubble': message.isSelf }">
                      {{ message.content }}
                    </div>
                    <div class="message-time">{{ message.time }}</div>
                  </div>
                  <div v-if="message.isSelf" class="message-avatar self-avatar">
                    <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" alt="avatar"/>
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
