// WebSocket服务类，封装与后端的WebSocket通信
//https://webrtc.github.io/samples/
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// 消息类型
export enum MessageType {
  PRIVATE = "private",
  GROUP = "group",
  MEETING = "meeting"
}

// WebSocket服务选项
export interface WebSocketServiceOptions {
  chatEndpoint?: string;
  webrtcEndpoint?: string;
  onChatConnected?: () => void;
  onWebRtcConnected?: () => void;
  onError?: (error: any) => void;
  onDisconnected?: () => void;
}

// 消息接口
export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  targetUserId?: string;
  content: string;
  type: MessageType;
  groupId?: string;
  meetingId?: string;
  sentAt: string;
  isSelf?: boolean;
}

// WebRTC信令消息接口
export interface WebRtcSignalingMessage {
  senderId: string;
  targetUserId: string;
  offer?: any;
  answer?: any;
  candidate?: any;
}

export class WebSocketService {
  private chatStompClient: Stomp.Client | null = null;
  private webrtcStompClient: Stomp.Client | null = null;
  private chatSocket: SockJS | null = null;
  private webrtcSocket: SockJS | null = null;
  private options: WebSocketServiceOptions;
  private chatConnected: boolean = false;
  private webrtcConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;

  constructor(options: WebSocketServiceOptions = {}) {
    this.options = {
      chatEndpoint: "/api/ws/chat",
      webrtcEndpoint: "/api/ws/webrtc",
      ...options
    };
  }

  // 连接聊天WebSocket
  public connectChat(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        console.log("Attempting to connect to chat WebSocket at:", this.options.chatEndpoint!);
        this.chatSocket = new SockJS(this.options.chatEndpoint!);
        this.chatStompClient = Stomp.over(this.chatSocket);
        this.chatStompClient.debug = (str) => {
          console.log("Chat WebSocket debug:", str);
        };

        this.chatStompClient.connect({},
          (frame: string) => {
            console.log("Chat WebSocket connected successfully:", frame);
            this.chatConnected = true;
            this.reconnectAttempts = 0;
            if (this.options.onChatConnected) {
              this.options.onChatConnected();
            }
            resolve(true);
          },
          (error: any) => {
            console.error("Chat WebSocket connection error:", error);
            console.error("Error details:", error);
            this.chatConnected = false;
            if (this.options.onError) {
              this.options.onError(error);
            }
            // 不进行重连，因为可能是网络问题或后端服务不可用
            reject(error);
          }
        );

        // 监听连接关闭
        this.chatSocket.onclose = () => {
          console.log("Chat WebSocket disconnected");
          this.chatConnected = false;
          if (this.options.onDisconnected) {
            this.options.onDisconnected();
          }
        };

        // 监听连接错误
        this.chatSocket.onerror = (error) => {
          console.error("Chat WebSocket socket error:", error);
        };
      } catch (error) {
        console.error("Error connecting to chat WebSocket:", error);
        console.error("Error details:", error);
        reject(error);
      }
    });
  }

  // 连接WebRTC信令WebSocket
  public connectWebRtc(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        console.log("Attempting to connect to WebRTC WebSocket at:", this.options.webrtcEndpoint!);
        this.webrtcSocket = new SockJS(this.options.webrtcEndpoint!);
        this.webrtcStompClient = Stomp.over(this.webrtcSocket);
        this.webrtcStompClient.debug = (str) => {
          console.log("WebRTC WebSocket debug:", str);
        };

        this.webrtcStompClient.connect({},
          (frame: string) => {
            console.log("WebRTC WebSocket connected successfully:", frame);
            this.webrtcConnected = true;
            this.reconnectAttempts = 0;
            if (this.options.onWebRtcConnected) {
              this.options.onWebRtcConnected();
            }
            resolve(true);
          },
          (error: any) => {
            console.error("WebRTC WebSocket connection error:", error);
            console.error("Error details:", error);
            this.webrtcConnected = false;
            if (this.options.onError) {
              this.options.onError(error);
            }
            // 不进行重连，因为可能是网络问题或后端服务不可用
            reject(error);
          }
        );

        // 监听连接关闭
        this.webrtcSocket.onclose = () => {
          console.log("WebRTC WebSocket disconnected");
          this.webrtcConnected = false;
          if (this.options.onDisconnected) {
            this.options.onDisconnected();
          }
        };

        // 监听连接错误
        this.webrtcSocket.onerror = (error) => {
          console.error("WebRTC WebSocket socket error:", error);
        };
      } catch (error) {
        console.error("Error connecting to WebRTC WebSocket:", error);
        console.error("Error details:", error);
        reject(error);
      }
    });
  }

  // 连接所有WebSocket
  public async connect(): Promise<boolean> {
    try {
      console.log("Attempting to connect to all WebSocket services");
      // 先连接聊天WebSocket
      const chatConnected = await this.connectChat();
      console.log("Chat WebSocket connection result:", chatConnected);

      // 再连接WebRTC WebSocket
      const webrtcConnected = await this.connectWebRtc();
      console.log("WebRTC WebSocket connection result:", webrtcConnected);

      const allConnected = chatConnected && webrtcConnected;
      console.log("All WebSocket services connection result:", allConnected);
      return allConnected;
    } catch (error) {
      console.error("Error connecting to WebSocket services:", error);
      return false;
    }
  }

  // 发送私人消息
  public sendPrivateMessage(message: Omit<ChatMessage, "type">): void {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const fullMessage: ChatMessage = {
        ...message,
        type: MessageType.PRIVATE
      };

      console.log("Attempting to send private message:", fullMessage);
      this.chatStompClient.send("/app/chat/private-message", {}, JSON.stringify(fullMessage));
      console.log("Private message sent successfully:", fullMessage);
    } catch (error) {
      console.error("Error sending private message:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 发送群聊消息
  public sendGroupMessage(message: Omit<ChatMessage, "type">): void {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const fullMessage: ChatMessage = {
        ...message,
        type: MessageType.GROUP
      };

      this.chatStompClient.send("/app/chat/group-message", {}, JSON.stringify(fullMessage));
      console.log("Group message sent:", fullMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 发送会议消息
  public sendMeetingMessage(message: Omit<ChatMessage, "type">): void {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const fullMessage: ChatMessage = {
        ...message,
        type: MessageType.MEETING
      };

      this.chatStompClient.send("/app/chat/meeting-message", {}, JSON.stringify(fullMessage));
      console.log("Meeting message sent:", fullMessage);
    } catch (error) {
      console.error("Error sending meeting message:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 发送WebRTC提议
  public sendWebRtcOffer(message: WebRtcSignalingMessage): void {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return;
    }

    try {
      this.webrtcStompClient.send("/app/webrtc/offer", {}, JSON.stringify(message));
      console.log("WebRTC offer sent:", message);
    } catch (error) {
      console.error("Error sending WebRTC offer:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 发送WebRTC应答
  public sendWebRtcAnswer(message: WebRtcSignalingMessage): void {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return;
    }

    try {
      this.webrtcStompClient.send("/app/webrtc/answer", {}, JSON.stringify(message));
      console.log("WebRTC answer sent:", message);
    } catch (error) {
      console.error("Error sending WebRTC answer:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 发送ICE候选者
  public sendIceCandidate(message: WebRtcSignalingMessage): void {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return;
    }

    try {
      this.webrtcStompClient.send("/app/webrtc/ice-candidate", {}, JSON.stringify(message));
      console.log("ICE candidate sent:", message);
    } catch (error) {
      console.error("Error sending ICE candidate:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 注册用户
  public registerUser(userId: string, sessionId: string): void {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return;
    }

    try {
      this.webrtcStompClient.send("/app/webrtc/register", {}, JSON.stringify({
        userId,
        sessionId
      }));
      console.log("User registered:", userId);
    } catch (error) {
      console.error("Error registering user:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 订阅私人消息
  public subscribeToPrivateMessages(callback: (message: ChatMessage) => void,userId:string): string | null {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return null;
    }

    try {
      console.log("Attempting to subscribe to private messages");
      const subscription = this.chatStompClient.subscribe(`/queue/user/${userId}/chat/messages`, (message) => {
        console.log("Received private message:", message?.body);
        try {
          const data = JSON.parse(message?.body);
          console.log("Parsed private message:", data);
          callback(data);
        } catch (parseError) {
          console.error("Error parsing private message:", parseError);
        }
      });

      console.log("Successfully subscribed to private messages, subscription ID:", subscription.id);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to private messages:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 订阅群聊消息
  public subscribeToGroupMessages(groupId: string, callback: (message: ChatMessage) => void): string | null {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return null;
    }

    try {
      const subscription = this.chatStompClient.subscribe(`/topic/chat/group/${groupId}`, (message) => {
        const data = JSON.parse(message.body);
        callback(data);
      });

      console.log(`Subscribed to group messages for group ${groupId}`);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to group messages:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 订阅会议消息
  public subscribeToMeetingMessages(meetingId: string, callback: (message: ChatMessage) => void): string | null {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return null;
    }

    try {
      const subscription = this.chatStompClient.subscribe(`/topic/chat/meeting/${meetingId}`, (message) => {
        const data = JSON.parse(message.body);
        callback(data);
      });

      console.log(`Subscribed to meeting messages for meeting ${meetingId}`);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to meeting messages:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 订阅WebRTC提议
  public subscribeToWebRtcOffers(callback: (message: WebRtcSignalingMessage) => void, userId: string): string | null {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return null;
    }

    try {
      console.log("Attempting to subscribe to WebRTC offers for user:", userId);
      const subscription = this.webrtcStompClient.subscribe(`/queue/user/${userId}/webrtc/offer`, (message) => {
        console.log("Received WebRTC offer:", message?.body);
        try {
          const data = JSON.parse(message?.body);
          console.log("Parsed WebRTC offer:", data);
          callback(data);
        } catch (parseError) {
          console.error("Error parsing WebRTC offer:", parseError);
        }
      });

      console.log("Successfully subscribed to WebRTC offers for user:", userId);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to WebRTC offers:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 订阅WebRTC应答
  public subscribeToWebRtcAnswers(callback: (message: WebRtcSignalingMessage) => void, userId: string): string | null {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return null;
    }

    try {
      console.log("Attempting to subscribe to WebRTC answers for user:", userId);
      const subscription = this.webrtcStompClient.subscribe(`/queue/user/${userId}/webrtc/answer`, (message) => {
        console.log("Received WebRTC answer:", message?.body);
        try {
          const data = JSON.parse(message?.body);
          console.log("Parsed WebRTC answer:", data);
          callback(data);
        } catch (parseError) {
          console.error("Error parsing WebRTC answer:", parseError);
        }
      });

      console.log("Successfully subscribed to WebRTC answers for user:", userId);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to WebRTC answers:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 订阅ICE候选者
  public subscribeToIceCandidates(callback: (message: WebRtcSignalingMessage) => void, userId: string): string | null {
    if (!this.webrtcStompClient || !this.webrtcConnected) {
      console.error("WebRTC WebSocket not connected");
      return null;
    }

    try {
      console.log("Attempting to subscribe to ICE candidates for user:", userId);
      const subscription = this.webrtcStompClient.subscribe(`/queue/user/${userId}/webrtc/ice-candidate`, (message) => {
        console.log("Received ICE candidate:", message?.body);
        try {
          const data = JSON.parse(message?.body);
          console.log("Parsed ICE candidate:", data);
          callback(data);
        } catch (parseError) {
          console.error("Error parsing ICE candidate:", parseError);
        }
      });

      console.log("Successfully subscribed to ICE candidates for user:", userId);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to ICE candidates:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 取消订阅
  public unsubscribe(subscriptionId: string): void {
    if (this.chatStompClient) {
      this.chatStompClient.unsubscribe(subscriptionId);
    }
    if (this.webrtcStompClient) {
      this.webrtcStompClient.unsubscribe(subscriptionId);
    }
    console.log(`Unsubscribed from ${subscriptionId}`);
  }

  // 断开连接
  public disconnect(): void {
    if (this.chatStompClient) {
      this.chatStompClient.disconnect(() => {
        console.log("Chat WebSocket disconnected");
      });
      this.chatStompClient = null;
    }

    if (this.webrtcStompClient) {
      this.webrtcStompClient.disconnect(() => {
        console.log("WebRTC WebSocket disconnected");
      });
      this.webrtcStompClient = null;
    }

    if (this.chatSocket) {
      this.chatSocket.close();
      this.chatSocket = null;
    }

    if (this.webrtcSocket) {
      this.webrtcSocket.close();
      this.webrtcSocket = null;
    }

    this.chatConnected = false;
    this.webrtcConnected = false;
  }

  // 检查连接状态
  public isChatConnected(): boolean {
    return this.chatConnected;
  }

  // 检查WebRTC连接状态
  public isWebRtcConnected(): boolean {
    return this.webrtcConnected;
  }

  // 订阅会议参与者状态变化
  public subscribeToParticipantStatus(callback: (message: any) => void, meetingId: string): string | null {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return null;
    }

    try {
      console.log("Attempting to subscribe to participant status for meeting:", meetingId);
      const subscription = this.chatStompClient.subscribe(`/topic/meeting/${meetingId}/participants`, (message) => {
        console.log("Received participant status message:", message?.body);
        try {
          const data = JSON.parse(message?.body);
          console.log("Parsed participant status message:", data);
          callback(data);
        } catch (parseError) {
          console.error("Error parsing participant status message:", parseError);
        }
      });

      console.log("Successfully subscribed to participant status for meeting:", meetingId);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to participant status:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  // 发送用户加入会议消息
  public sendUserJoinedMessage(meetingId: string, userId: string, userName: string): void {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const message = {
        meetingId: meetingId,
        userId: userId,
        userName: userName,
        type: "USER_JOINED",
        timestamp: new Date().toISOString()
      };

      console.log("Attempting to send user joined message:", message);
      this.chatStompClient.send(
        "/app/meeting/user-joined",
        {},
        JSON.stringify(message)
      );
      console.log("User joined message sent successfully:", message);
    } catch (error) {
      console.error("Error sending user joined message:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 发送用户离开会议消息
  public sendUserLeftMessage(meetingId: string, userId: string, userName: string): void {
    if (!this.chatStompClient || !this.chatConnected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const message = {
        meetingId: meetingId,
        userId: userId,
        userName: userName,
        type: "USER_LEFT",
        timestamp: new Date().toISOString()
      };

      console.log("Attempting to send user left message:", message);
      this.chatStompClient.send(
        "/app/meeting/user-left",
        {},
        JSON.stringify(message)
      );
      console.log("User left message sent successfully:", message);
    } catch (error) {
      console.error("Error sending user left message:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  // 处理重连
  private handleReconnect(connectFn: () => Promise<boolean>, resolve: (value: boolean) => void, reject: (reason?: any) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(async () => {
        try {
          const connected = await connectFn();
          if (connected) {
            resolve(connected);
          } else {
            this.handleReconnect(connectFn, resolve, reject);
          }
        } catch (error) {
          this.handleReconnect(connectFn, resolve, reject);
        }
      }, this.reconnectDelay);
    } else {
      console.error("Max reconnect attempts reached");
      reject(new Error("Max reconnect attempts reached"));
    }
  }
}

// 导出默认实例
const defaultWebSocketService = new WebSocketService();
export default defaultWebSocketService;
