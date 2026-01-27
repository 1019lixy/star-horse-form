import { ref, Ref, computed } from "vue";
import { MeetingSocketService } from "../../../../../../utils/websocket/MeetingSocketService";

// 参与者管理配置接口
export interface ParticipantManagerOptions {
  webSocketService: Ref<MeetingSocketService | null>;
  isConnected: Ref<boolean>;
  currentUserId: Ref<string>;
  currentUserName: Ref<string>;
  currentUserAvatar: Ref<string>;
  meetingInfo: Ref<any>;
}

// 参与者接口
export interface Participant {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline" | "busy";
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
}

// 参与者管理器
export const useParticipantManager = (options: ParticipantManagerOptions) => {
  const {
    webSocketService,
    isConnected,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    meetingInfo
  } = options;

  // 参与者列表
  const participants = ref<Participant[]>([]);

  // 当前选择的用户（默认设置为张三）
  const selectedUser = ref<Participant | null>({
    id: "zhangsan",
    name: "张三",
    avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    status: "online"
  });

  // 可选择的身份列表（所有用户都可以选择）
  const availableUsers = ref<Participant[]>([
    {id: "zhangsan", name: "张三", avatar: "https://cube.elemecdn.com/3/7c/3ea6ec64369c2642b92c6726f1epng.png", status: "online"},
    {id: "lisi", name: "李四", avatar: "https://cube.elemecdn.com/3/7c/3ea6ec64369c2642b92c6726f1epng.png", status: "online"},
    {id: "wangwu", name: "王五", avatar: "https://cube.elemecdn.com/3/7c/3ea6ec64369c2642b92c6726f1epng.png", status: "online"},
    {id: "zhaoliu", name: "赵六", avatar: "https://cube.elemecdn.com/3/7c/3ea6ec64369c2642b92c6726f1epng.png", status: "online"}
  ]);

  // 当前屏幕共享者
  const currentScreenSharer = ref<{id: string; stream: MediaStream} | null>(null);

  // 侧边栏可见性
  const sidebarVisible = ref(false);

  // 参与者列表可见性
  const participantsVisible = ref(false);

  // 在线参与者列表（排除当前用户自己）
  const onlineParticipants = computed(() => {
    return participants.value.filter(p => p.status === "online" && p.id !== currentUserId.value);
  });

  // 初始化参与者列表
  const initializeParticipants = () => {
    // 添加当前用户
    const currentUser: Participant = {
      id: currentUserId.value,
      name: currentUserName.value,
      avatar: currentUserAvatar.value,
      status: "online",
      isAudioEnabled: true,
      isVideoEnabled: false,
      isScreenSharing: false
    };
    participants.value = [currentUser];
  };

  // 切换用户身份
  const switchUser = (user: Participant) => {
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
      const newParticipant: Participant = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        status: "online",
        isAudioEnabled: true,
        isVideoEnabled: false,
        isScreenSharing: false
      };
      participants.value.push(newParticipant);
      console.log("添加新的在线用户:", user.name);
    }

    // 重新注册用户并订阅WebSocket消息，使用新的用户ID
    if (webSocketService.value && isConnected.value) {
      console.log("重新注册用户并订阅WebSocket消息");
      // 先取消之前的所有订阅
      // 重新注册用户，传入meetingId
      webSocketService.value.registerUser(currentUserId.value, "session_" + Date.now(), meetingInfo.value.id);
      console.log("用户已重新注册，ID:", currentUserId.value, "会议ID:", meetingInfo.value.id);
    }
  };

  // 邀请参与者
  const inviteParticipants = (userIds: string[]) => {
    console.log("邀请参与者:", userIds);

    userIds.forEach(userId => {
      const user = availableUsers.value.find(u => u.id === userId);
      if (user) {
        const existingParticipant = participants.value.find(p => p.id === userId);
        if (!existingParticipant) {
          const newParticipant: Participant = {
            ...user,
            status: "online",
            isAudioEnabled: true,
            isVideoEnabled: false,
            isScreenSharing: false
          };
          participants.value.push(newParticipant);
          console.log("已邀请用户:", user.name);
        }
      }
    });
  };

  // 切换参与者音频状态
  const toggleParticipantAudio = (participantId: string) => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.isAudioEnabled = !participant.isAudioEnabled;
      console.log("切换参与者音频状态:", participant.name, participant.isAudioEnabled ? "开启" : "关闭");
    }
  };

  // 切换参与者视频状态
  const toggleParticipantVideo = (participantId: string) => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.isVideoEnabled = !participant.isVideoEnabled;
      console.log("切换参与者视频状态:", participant.name, participant.isVideoEnabled ? "开启" : "关闭");
    }
  };

  // 最大化屏幕共享
  const maximizeScreenShareForParticipant = (participantId: string) => {
    console.log("最大化屏幕共享:", participantId);
    // 这里可以添加屏幕共享最大化的逻辑
  };

  // 切换侧边栏可见性
  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value;
  };

  // 切换参与者列表可见性
  const toggleParticipants = () => {
    participantsVisible.value = !participantsVisible.value;
  };

  // 结束会议
  const endMeeting = () => {
    console.log("结束会议");
    // 这里可以添加结束会议的清理逻辑
  };

  // 更新参与者状态
  const updateParticipantStatus = (participantId: string, status: "online" | "offline" | "busy") => {
    const participant = participants.value.find(p => p.id === participantId);
    if (participant) {
      participant.status = status;
      console.log("更新参与者状态:", participant.name, status);
    }
  };

  // 设置当前屏幕共享者
  const setCurrentScreenSharer = (sharer: {id: string; stream: MediaStream} | null) => {
    currentScreenSharer.value = sharer;
  };

  // 清理参与者管理器
  const cleanupParticipantManager = () => {
    participants.value = [];
    selectedUser.value = null;
    currentScreenSharer.value = null;
  };

  return {
    // 状态
    participants,
    selectedUser,
    availableUsers,
    currentScreenSharer,
    sidebarVisible,
    participantsVisible,
    onlineParticipants,

    // 方法
    initializeParticipants,
    switchUser,
    inviteParticipants,
    toggleParticipantAudio,
    toggleParticipantVideo,
    maximizeScreenShareForParticipant,
    toggleSidebar,
    toggleParticipants,
    endMeeting,
    updateParticipantStatus,
    setCurrentScreenSharer,
    cleanupParticipantManager
  };
};
