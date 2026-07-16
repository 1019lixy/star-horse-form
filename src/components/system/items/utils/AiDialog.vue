<script lang="ts" setup>
import {computed, nextTick, onBeforeUnmount, reactive, ref, watch} from "vue";
import {i18n} from "@/lang";
import {clearAiChatSession, sendAiChatMessage} from "@/api/ai_chat_api";
import {activateAiConfig, AiConfigData, deleteAiConfig, getAiConfigList, saveAiConfig} from "@/api/ai_config_api";
import {error, operationConfirm, success, warning} from "star-horse-lowcode";

interface Props {
  dialogVisible: boolean;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  hasJson?: boolean;
  jsonData?: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:dialogVisible", val: boolean): void;
  (e: "applyForm", dataList: any[]): void;
}>();

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref("");
const isGenerating = ref(false);
const chatContainerRef = ref<HTMLDivElement>();

// AI 思考状态判断
const isThinking = computed(() => {
  if (!isGenerating.value) return false;
  const lastMsg = messages.value[messages.value.length - 1];
  return lastMsg?.role === 'assistant' && lastMsg.isStreaming && !lastMsg.content;
});
let abortController: AbortController | null = null;

// AI 设置相关
const showSettings = ref(false);
const profileList = ref<AiConfigData[]>([]);
const activeProfileId = ref("");
const editingProfile = ref<AiConfigData | null>(null);
const showProfileForm = ref(false);

const activeProfileName = computed(() => {
  const active = profileList.value.find((p: AiConfigData) => p.idAiConfig === activeProfileId.value);
  return active?.profileName || "";
});

// 抽屉打开时自动加载配置列表
watch(() => props.dialogVisible, (val) => {
  if (val) loadProfileList();
});

const openSettings = async () => {
  await loadProfileList();
  showSettings.value = true;
};

const loadProfileList = async () => {
  try {
    const res = await getAiConfigList();
    const data = res.data?.data || res.data || [];
    profileList.value = Array.isArray(data) ? data : [];
    const active = profileList.value.find((p: AiConfigData) => p.isActive);
    activeProfileId.value = active?.idAiConfig || (profileList.value[0]?.idAiConfig || "");
  } catch {
    profileList.value = [];
  }
};

const closeSettings = () => {
  showSettings.value = false;
  showProfileForm.value = false;
};

const addProfile = () => {
  editingProfile.value = {
    profileName: "",
    apiKey: "",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
    maxTokens: 8192,
    temperature: 0.7,
    timeout: 120,
  };
  showProfileForm.value = true;
};

const editProfile = (profile: AiConfigData) => {
  editingProfile.value = {...profile};
  showProfileForm.value = true;
};

const saveProfile = async () => {
  if (!editingProfile.value?.profileName?.trim()) {
    warning("请输入配置名称");
    return;
  }
  try {
    await saveAiConfig(editingProfile.value);
    success(i18n("dyform.aiChat.saveSuccess"));
    showProfileForm.value = false;
    await loadProfileList();
  } catch {
    error(i18n("dyform.aiChat.saveFailed"));
  }
};

const closeProfileForm = () => {
  showProfileForm.value = false;
};

const activateProfile = async (id: string) => {
  try {
    await activateAiConfig(id);
    activeProfileId.value = id;
    await loadProfileList();
    success("切换成功");
  } catch {
    error("切换失败");
  }
};

const deleteProfile = async (id: string) => {
  if (profileList.value.length <= 1) {
    warning("至少保留一个配置");
    return;
  }
  try {
    await operationConfirm("确定删除此配置？");
    await deleteAiConfig(id);
    await loadProfileList();
    if (activeProfileId.value === id) {
      activeProfileId.value = profileList.value[0]?.idAiConfig || "";
    }
  } catch {
    // 取消
  }
};

// 会话ID：使用 sessionStorage 持久化，关闭抽屉不清空
const getSessionId = (): string => {
  let id = sessionStorage.getItem("ai_chat_session_id");
  if (!id) {
    id = "ai_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("ai_chat_session_id", id);
  }
  return id;
};

const sessionId = ref(getSessionId());

const visible = computed({
  get: () => props.dialogVisible,
  set: (val: boolean) => emit("update:dialogVisible", val),
});

const examplePrompts = computed(() => {
  const prompts: string[] = [];
  for (let i = 0; i < 3; i++) {
    const val = i18n(`dyform.aiChat.examplePrompts.${i}`);
    if (val && !val.startsWith("dyform.")) {
      prompts.push(val);
    }
  }
  return prompts;
});

const scrollToBottom = () => {
  nextTick(() => {
    setTimeout(() => {
      if (chatContainerRef.value) {
        chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
      }
    }, 50);
  });
};

// 监听消息数量变化自动滚动
watch(() => messages.value.length, () => {
  scrollToBottom();
});

// 监听最后一条消息的内容变化（流式更新）
watch(() => {
  if (messages.value.length > 0) {
    const last = messages.value[messages.value.length - 1];
    return last.content;
  }
  return '';
}, () => {
  scrollToBottom();
});

const extractJsonFromContent = (content: string): { jsonData?: any; hasJson: boolean } => {
  // 1. 尝试从 markdown 代码块中提取 JSON
  const codeBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed?.dataList) {
        return {jsonData: parsed.dataList, hasJson: true};
      }
      if (Array.isArray(parsed)) {
        return {jsonData: parsed, hasJson: true};
      }
    } catch {
      // 尝试修复并解析
    }
  }

  // 2. 尝试直接匹配包含 dataList 的 JSON 对象
  const dataListMatch = content.match(/\{[\s\S]*"dataList"[\s\S]*\}/);
  if (dataListMatch) {
    try {
      const parsed = JSON.parse(dataListMatch[0]);
      if (parsed?.dataList) {
        return {jsonData: parsed.dataList, hasJson: true};
      }
    } catch {
      // 忽略解析错误
    }
  }

  // 3. 尝试匹配 JSON 数组
  const arrayMatch = content.match(/\[[\s\S]*\{[\s\S]*"compType"[\s\S]*\}[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {jsonData: parsed, hasJson: true};
      }
    } catch {
      // 忽略解析错误
    }
  }

  return {hasJson: false};
};

const sendMessage = async () => {
  const msg = inputMessage.value.trim();
  if (!msg || isGenerating.value) return;

  messages.value.push({
    role: "user",
    content: msg,
  });
  inputMessage.value = "";
  scrollToBottom();

  // 添加 AI 占位消息
  const aiMessage: ChatMessage = {
    role: "assistant",
    content: "",
    isStreaming: true,
  };
  messages.value.push(aiMessage);
  isGenerating.value = true;

  abortController = sendAiChatMessage(
      sessionId.value,
      msg,
      (chunk: string) => {
        aiMessage.content += chunk;
        scrollToBottom();
      },
      () => {
        aiMessage.isStreaming = false;
        // 提取 JSON
        const {jsonData, hasJson} = extractJsonFromContent(aiMessage.content);
        if (hasJson && jsonData) {
          aiMessage.hasJson = true;
          aiMessage.jsonData = jsonData;
        }
        isGenerating.value = false;
        abortController = null;
        scrollToBottom();
      },
      (err: string) => {
        aiMessage.isStreaming = false;
        if (!aiMessage.content) {
          aiMessage.content = err;
        }
        isGenerating.value = false;
        abortController = null;
      }
  );
};

const stopGeneration = () => {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  const lastMsg = messages.value[messages.value.length - 1];
  if (lastMsg && lastMsg.role === "assistant" && lastMsg.isStreaming) {
    lastMsg.isStreaming = false;
    // 提取 JSON
    const {jsonData, hasJson} = extractJsonFromContent(lastMsg.content);
    if (hasJson && jsonData) {
      lastMsg.hasJson = true;
      lastMsg.jsonData = jsonData;
    }
  }
  isGenerating.value = false;
};

const applyForm = (dataList: any[]) => {
  if (!Array.isArray(dataList) || dataList.length === 0) {
    warning(i18n("dyform.aiChat.applyFailed"));
    return;
  }
  emit("applyForm", dataList);
  success(i18n("dyform.aiChat.applySuccess"));
};

const newSession = async () => {
  if (isGenerating.value) {
    stopGeneration();
  }
  try {
    await operationConfirm(i18n("dyform.aiChat.clearConfirm"));
    await clearAiChatSession(sessionId.value);
    messages.value = [];
    sessionId.value = "ai_" + Date.now() + "_" + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem("ai_chat_session_id", sessionId.value);
  } catch {
    // 用户取消
    console.log("clearAiChatSession", sessionId.value);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

const renderContent = (content: string, hasJson: boolean | undefined): string => {
  if (!hasJson) return content;
  // 将 JSON 代码块替换为占位标记，便于模板中特殊渲染
  return content;
};

const getDisplayContent = (msg: ChatMessage): { textParts: string[]; jsonPart?: string } => {
  if (!msg.hasJson) {
    return {textParts: [msg.content]};
  }

  // 提取纯文本部分和 JSON 部分
  const content = msg.content;

  // 尝试分离 markdown 代码块
  const codeBlockMatch = content.match(/([\s\S]*?)```json\s*[\s\S]*?```([\s\S]*)/);
  if (codeBlockMatch) {
    const before = codeBlockMatch[1].trim();
    const after = codeBlockMatch[2].trim();
    const textParts: string[] = [];
    if (before) textParts.push(before);
    if (after) textParts.push(after);
    return {
      textParts,
      jsonPart: JSON.stringify(msg.jsonData, null, 2),
    };
  }

  // 尝试分离纯 JSON
  const jsonMatch = content.match(/([\s\S]*?)(\{[\s\S]*"dataList"[\s\S]*\})([\s\S]*)/);
  if (jsonMatch) {
    const before = jsonMatch[1].trim();
    const after = jsonMatch[3].trim();
    const textParts: string[] = [];
    if (before) textParts.push(before);
    if (after) textParts.push(after);
    return {
      textParts,
      jsonPart: JSON.stringify(msg.jsonData, null, 2),
    };
  }

  // 数组 JSON
  const arrayMatch = content.match(/([\s\S]*?)(\[[\s\S]*\{[\s\S]*"compType"[\s\S]*\}[\s\S]*\])([\s\S]*)/);
  if (arrayMatch) {
    const before = arrayMatch[1].trim();
    const after = arrayMatch[3].trim();
    const textParts: string[] = [];
    if (before) textParts.push(before);
    if (after) textParts.push(after);
    return {
      textParts,
      jsonPart: JSON.stringify(msg.jsonData, null, 2),
    };
  }

  return {textParts: [content], jsonPart: JSON.stringify(msg.jsonData, null, 2)};
};

// --- UI 辅助（新增，不修改原有逻辑） ---
const jsonExpandedMap = reactive<Record<number, boolean>>({});
const toggleJsonExpand = (idx: number) => {
  jsonExpandedMap[idx] = !jsonExpandedMap[idx];
};
const isJsonExpanded = (idx: number) => !!jsonExpandedMap[idx];

const highlightJson = (jsonStr: string): string => {
  return jsonStr.replace(
      /("(?:\\.|[^"\\])*")\s*:/g,
      '<span class="json-key">$1</span>:'
  ).replace(
      /:\s*("(?:\\.|[^"\\])*")/g,
      ': <span class="json-string">$1</span>'
  ).replace(
      /:\s*(\d+\.?\d*)/g,
      ': <span class="json-number">$1</span>'
  ).replace(
      /:\s*(true|false|null)/g,
      ': <span class="json-bool">$1</span>'
  );
};

const getJsonVisibleLines = (jsonStr: string, idx: number): string => {
  const lines = jsonStr.split('\n');
  if (isJsonExpanded(idx) || lines.length <= 5) return highlightJson(jsonStr);
  return highlightJson(lines.slice(0, 5).join('\n'));
};

const getJsonTotalLines = (jsonStr: string): number => {
  return jsonStr.split('\n').length;
};

onBeforeUnmount(() => {
  if (abortController) {
    abortController.abort();
  }
});
</script>

<template>
  <el-drawer
      v-model="visible"
      direction="rtl"
      size="500px"
      :resizable="true"
      :close-on-click-modal="false"
      class="ai-chat-drawer"
  >
    <template #header>
      <div class="ai-chat-header">
        <div class="ai-chat-header-left">
          <svg class="ai-header-icon" viewBox="0 0 24 24" fill="none" width="26" height="26">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad-h)"/>
            <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
            <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <defs>
              <linearGradient id="ai-grad-h" x1="2" y1="2" x2="22" y2="22">
                <stop stop-color="#667eea"/>
                <stop offset="1" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="ai-chat-title">{{ i18n("dyform.aiChat.title") }}</span>
        </div>
        <div class="ai-chat-header-right">
          <el-tooltip :content="i18n('dyform.aiChat.settings')" effect="dark" placement="bottom">
            <div class="settings-btn" @click="openSettings">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" stroke-width="1.5"/>
                <path
                    d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
                    stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </div>
          </el-tooltip>
          <el-tooltip :content="i18n('dyform.aiChat.newSession')" effect="dark" placement="bottom">
            <div class="new-session-btn" @click="newSession">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="ai-chat-body">
      <!-- 欢迎提示 -->
      <div v-if="messages.length === 0" class="ai-chat-welcome">
        <div class="welcome-logo">
          <svg viewBox="0 0 24 24" fill="none" width="64" height="64">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad-w)"/>
            <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
            <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <defs>
              <linearGradient id="ai-grad-w" x1="2" y1="2" x2="22" y2="22">
                <stop stop-color="#667eea"/>
                <stop offset="1" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p class="welcome-text">{{ i18n("dyform.aiChat.placeholder") }}</p>
        <div class="example-prompts" v-if="examplePrompts.length > 0">
          <div
              v-for="(prompt, idx) in examplePrompts"
              :key="idx"
              class="example-prompt-item"
              @click="inputMessage = prompt"
          >
            <span class="example-prompt-num">{{ idx + 1 }}</span>
            <span class="example-prompt-text">{{ prompt }}</span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else ref="chatContainerRef" class="ai-chat-messages">
        <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="['ai-chat-message', msg.role === 'user' ? 'message-user' : 'message-assistant']"
        >
          <!-- AI 头像 -->
          <div v-if="msg.role === 'assistant'" class="message-avatar">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#ai-grad-a)"/>
              <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="white"/>
              <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
              <defs>
                <linearGradient id="ai-grad-a" x1="2" y1="2" x2="22" y2="22">
                  <stop stop-color="#667eea"/>
                  <stop offset="1" stop-color="#764ba2"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="message-content-wrapper">
            <div class="message-content">
              <!-- 纯文本消息 -->
              <template v-if="!msg.hasJson">
                <span class="msg-text">{{ msg.content }}</span>
                <template v-if="msg.isStreaming && !msg.content">
                  <span class="thinking-dots">
                    <span class="thinking-dot"></span>
                    <span class="thinking-dot"></span>
                    <span class="thinking-dot"></span>
                  </span>
                </template>
                <template v-else-if="msg.isStreaming">
                  <span class="typing-cursor"></span>
                </template>
              </template>
              <!-- 包含 JSON 的消息 -->
              <template v-else>
                <template v-for="(part, pIdx) in getDisplayContent(msg).textParts" :key="'tp_' + pIdx">
                  <span class="msg-text">{{ part }}</span>
                </template>
                <div v-if="getDisplayContent(msg).jsonPart" class="json-card">
                  <div class="json-card-header">
                    <span class="json-card-label">
                      <svg viewBox="0 0 24 24" fill="none" width="14" height="14"
                           style="vertical-align: middle; margin-right: 4px;">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                              fill="url(#ai-grad-j)"/>
                        <path d="M8.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                              fill="white"/>
                        <path d="M8 14.5c0 0 1.5 2.5 4 2.5s4-2.5 4-2.5" stroke="white" stroke-width="1.5"
                              stroke-linecap="round"/>
                        <defs><linearGradient id="ai-grad-j" x1="2" y1="2" x2="22" y2="22"><stop stop-color="#667eea"/><stop
                            offset="1" stop-color="#764ba2"/></linearGradient></defs>
                      </svg>
                      {{ i18n("dyform.aiChat.jsonLabel") || "表单配置" }}
                    </span>
                    <el-button
                        class="json-apply-btn"
                        size="small"
                        @click="applyForm(msg.jsonData)"
                    >
                      {{ i18n("dyform.aiChat.applyForm") }}
                      <svg viewBox="0 0 16 16" fill="none" width="12" height="12"
                           style="margin-left: 4px; vertical-align: middle;">
                        <path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                              stroke-linejoin="round"/>
                      </svg>
                    </el-button>
                  </div>
                  <div class="json-code-area">
                    <pre class="json-pre" v-html="getJsonVisibleLines(getDisplayContent(msg).jsonPart!, idx)"></pre>
                    <div
                        v-if="getJsonTotalLines(getDisplayContent(msg).jsonPart!) > 5"
                        class="json-expand-bar"
                        @click="toggleJsonExpand(idx)"
                    >
                      {{
                        isJsonExpanded(idx) ? '收起' : `展开全部 ${getJsonTotalLines(getDisplayContent(msg).jsonPart!)} 行`
                      }}
                      <svg viewBox="0 0 16 16" fill="none" width="12" height="12"
                           :style="{ transform: isJsonExpanded(idx) ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                              stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部输入区 -->
    <template #footer>
      <div class="ai-chat-footer">
        <div class="profile-switcher" v-if="profileList.length > 0">
          <el-dropdown trigger="click" @command="activateProfile" teleported placement="top-start">
            <div class="profile-switcher-trigger">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" style="flex-shrink:0;">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
                <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span class="profile-switcher-name">{{ activeProfileName }}</span>
              <svg viewBox="0 0 16 16" fill="none" width="12" height="12" style="flex-shrink:0;">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"/>
              </svg>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                    v-for="p in profileList"
                    :key="p.idAiConfig"
                    :command="p.idAiConfig"
                >
                  <div class="profile-dropdown-item">
                    <svg v-if="p.isActive" viewBox="0 0 16 16" fill="none" width="12" height="12"
                         style="flex-shrink:0;">
                      <circle cx="8" cy="8" r="6" fill="#667eea"/>
                      <path d="M5.5 8l2 2 3.5-3.5" stroke="white" stroke-width="1.5" stroke-linecap="round"
                            stroke-linejoin="round"/>
                    </svg>
                    <span>{{ p.profileName }}</span>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="input-area">
          <el-input
              v-model="inputMessage"
              :placeholder="i18n('dyform.aiChat.placeholder')"
              :disabled="isGenerating"
              @keydown="handleKeydown"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 4 }"
              resize="none"
              class="ai-input"
          />
          <button
              v-if="!isGenerating"
              class="send-btn"
              :disabled="!inputMessage.trim()"
              @click="sendMessage"
          >
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round"/>
            </svg>
          </button>
          <button
              v-else
              class="stop-btn"
              @click="stopGeneration"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <rect x="6" y="6" width="12" height="12" rx="2"/>
            </svg>
          </button>
        </div>
      </div>
    </template>
    <!-- AI 设置弹窗 - 配置列表 -->
    <star-horse-dialog
        v-model="showSettings"
        :title="i18n('dyform.aiChat.settingsTitle')"
        :selfFunc="true"
        style="z-index: 3000"
        @closeAction="closeSettings"
        @merge="closeSettings"
        boxWidth="480px"
    >
      <div class="profile-list">
        <div
            v-for="profile in profileList"
            :key="profile.idAiConfig"
            :class="['profile-item', { active: profile.idAiConfig === activeProfileId }]"
        >
          <div class="profile-info" @click="activateProfile(profile.idAiConfig!)">
            <div class="profile-name">
              <svg v-if="profile.isActive" viewBox="0 0 16 16" fill="none" width="14" height="14"
                   style="vertical-align: middle; margin-right: 4px;">
                <circle cx="8" cy="8" r="6" fill="#667eea"/>
                <path d="M5.5 8l2 2 3.5-3.5" stroke="white" stroke-width="1.5" stroke-linecap="round"
                      stroke-linejoin="round"/>
              </svg>
              {{ profile.profileName }}
            </div>
            <div class="profile-meta">{{ profile.model }} · {{
                profile.apiUrl?.split('//')[1]?.split('/')[0] || ''
              }}
            </div>
          </div>
          <div class="profile-actions">
            <el-button link size="small" @click="editProfile(profile)">编辑</el-button>
            <el-button link size="small" type="danger" @click="deleteProfile(profile.idAiConfig!)">删除</el-button>
          </div>
        </div>
      </div>
      <div style="margin-top: 12px; text-align: center;">
        <el-button type="primary" plain size="small" @click="addProfile">
          + 添加配置
        </el-button>
      </div>
    </star-horse-dialog>

    <!-- AI 设置弹窗 - 编辑配置 -->
    <star-horse-dialog
        v-model="showProfileForm"
        :title="editingProfile?.idAiConfig ? '编辑配置' : '添加配置'"
        :selfFunc="true"
        @closeAction="closeProfileForm"
        @merge="saveProfile"
        style="z-index: 3000"
        boxWidth="480px"
    >
      <el-form :model="editingProfile" label-width="100px" label-position="right" v-if="editingProfile">
        <el-form-item label="配置名称" required>
          <el-input v-model="editingProfile.profileName" placeholder="如：Groq 免费版"/>
        </el-form-item>
        <el-form-item label="API Key">
          <el-input v-model="editingProfile.apiKey" placeholder="sk-..." show-password/>
        </el-form-item>
        <el-form-item label="API 地址">
          <el-input v-model="editingProfile.apiUrl" placeholder="https://api.groq.com/openai/v1/chat/completions"/>
        </el-form-item>
        <el-form-item label="模型">
          <el-input v-model="editingProfile.model" placeholder="llama-3.1-8b-instant"/>
        </el-form-item>
        <el-form-item label="最大Token">
          <el-input-number v-model="editingProfile.maxTokens" :min="256" :max="32768" :step="256"/>
        </el-form-item>
        <el-form-item label="温度">
          <el-slider v-model="editingProfile.temperature" :min="0" :max="2" :step="0.1" show-input input-size="small"/>
        </el-form-item>
        <el-form-item label="超时(秒)">
          <el-input-number v-model="editingProfile.timeout" :min="10" :max="300" :step="10"/>
        </el-form-item>
      </el-form>
    </star-horse-dialog>
  </el-drawer>
</template>

<style lang="scss" scoped>
:root {
  --ai-primary: #667eea;
  --ai-primary-dark: #764ba2;
}

.ai-chat-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 14px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  :deep(.el-drawer__footer) {
    padding: 0;
    border-top: 1px solid #ebeef5;
  }
}

.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.ai-chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-chat-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 28px;
}

.settings-btn,
.new-session-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: rgba(102, 126, 234, 0.06);
  }
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.2s;

  &.active {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.04);
  }

  &:hover {
    border-color: #c0c4cc;
  }
}

.profile-info {
  flex: 1;
  cursor: pointer;
}

.profile-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.profile-meta {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.profile-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ai-header-icon {
  flex-shrink: 0;
}

.ai-chat-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.ai-chat-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ====== 欢迎区 ====== */
.ai-chat-welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.welcome-logo {
  margin-bottom: 20px;
  animation: welcome-fade-in 0.6s ease;
}

.welcome-text {
  font-size: 15px;
  color: #909399;
  margin-bottom: 28px;
  text-align: center;
}

.example-prompts {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.example-prompt-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: prompt-slide-in 0.4s ease backwards;

  &:nth-child(1) {
    animation-delay: 0.1s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }

  &:hover {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.04), rgba(118, 75, 162, 0.04));
    color: #667eea;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.12);
  }
}

.example-prompt-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.example-prompt-text {
  flex: 1;
  line-height: 1.5;
}

/* ====== 消息列表 ====== */
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;

    &:hover {
      background: #c0c4cc;
    }
  }
}

.ai-chat-message {
  display: flex;
  gap: 10px;
  max-width: 100%;
  animation: msg-fade-in 0.3s ease;
}

.message-user {
  flex-direction: row-reverse;

  .message-content-wrapper {
    align-items: flex-end;
  }

  .message-content {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #ffffff;
    border-radius: 16px 16px 4px 16px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
  }
}

.message-assistant {
  .message-avatar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
  }

  .message-content-wrapper {
    align-items: flex-start;
  }

  .message-content {
    background: #ffffff;
    color: #303133;
    border-radius: 16px 16px 16px 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 48px);
}

.message-content {
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
  white-space: pre-wrap;
}

.msg-text {
  white-space: pre-wrap;
}

/* 打字机光标 */
.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: linear-gradient(135deg, #667eea, #764ba2);
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: cursor-blink 0.8s infinite;
}

/* 思考中动画 */
.thinking-dots {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}

.thinking-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  animation: thinking-bounce 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }

  &:nth-child(3) {
    animation-delay: 0s;
  }
}

/* ====== JSON 卡片 ====== */
.json-card {
  margin-top: 12px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  animation: json-slide-down 0.35s ease;
}

.json-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06), rgba(118, 75, 162, 0.06));
  border-bottom: 1px solid #ebeef5;
}

.json-card-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.json-apply-btn {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border: none !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  font-size: 12px !important;
  padding: 6px 14px !important;
  height: auto !important;
  transition: opacity 0.2s, box-shadow 0.2s !important;

  &:hover {
    opacity: 0.9;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.35) !important;
  }
}

.json-code-area {
  position: relative;
}

.json-pre {
  padding: 14px 16px;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace;
  margin: 0;
  background: #1e1e2e;
  color: #cdd6f4;

  :deep(.json-key) {
    color: #cba6f7;
  }

  :deep(.json-string) {
    color: #a6e3a1;
  }

  :deep(.json-number) {
    color: #fab387;
  }

  :deep(.json-bool) {
    color: #89b4fa;
  }
}

.json-expand-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  background: #181825;
  color: #7f849c;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;

  &:hover {
    color: #cdd6f4;
    background: #1e1e2e;
  }
}

/* ====== 底部输入区 ====== */
.ai-chat-footer {
  padding: 10px 18px 14px;
}

.profile-switcher {
  margin-bottom: 8px;

  :deep(.el-dropdown) {
    width: 100%;
  }
}

.profile-switcher-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 8px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    color: #667eea;
    background: rgba(102, 126, 234, 0.04);
  }
}

.profile-switcher-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.profile-dropdown-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.input-area {
  display: flex;
  gap: 10px;
  align-items: flex-end;

  :deep(.el-textarea__inner) {
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 14px;
    background: #f5f7fa;
    border-color: #e4e7ed;
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
    }
  }
}

.send-btn {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.9;
    box-shadow: 0 2px 10px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.stop-btn {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #ef4444;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, box-shadow 0.2s;

  &:hover {
    opacity: 0.9;
    box-shadow: 0 2px 10px rgba(239, 68, 68, 0.4);
  }
}

/* ====== 动画 ====== */
@keyframes welcome-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes prompt-slide-in {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes msg-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cursor-blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

@keyframes thinking-bounce {
  0%, 80%, 100% {
    transform: scale(0.4);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes json-slide-down {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 600px;
  }
}

</style>
