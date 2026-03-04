// WebSocket服务类，封装与后端的WebSocket通信
//https://webrtc.github.io/samples/
import SockJS from "sockjs-client";
import Stomp from "stompjs";

// 消息类型
export enum MessageType {
  PRIVATE = "private",
  GROUP = "group",
  MEETING = "meeting",
  LOCK = "lock",
  UNLOCK = "unlock",
  SYNC = "sync",
}

// WebSocket服务选项
export interface ChatSocketServiceOptions {
  endpoint?: string;
  onChatConnected?: () => void;
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
  sentAt: string;
  isSelf?: boolean;
}

/**
 * 聊天WebSocket 服务类
 */
export class FormSocketService {
  private stompClient: Stomp.Client | null = null;
  private socket: SockJS | null = null;
  private options: ChatSocketServiceOptions;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private initConnectInstance: boolean = false;

  constructor(options: ChatSocketServiceOptions = {}) {
    this.options = {
      endpoint: "/api/ws/form",
      ...options,
    };
    if (this.initConnectInstance) {
      this.initConnect();
    }
  }

  /**
   * 连接聊天WebSocket
   */
  public initConnect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        console.log(
          "Attempting to connect to chat WebSocket at:",
          this.options.endpoint!,
        );
        this.socket = new SockJS(this.options.endpoint!);
        this.stompClient = Stomp.over(this.socket);
        this.stompClient.debug = (str) => {
          console.log("Chat WebSocket debug:", str);
        };

        this.stompClient.connect(
          {},
          (frame: string) => {
            console.log("Chat WebSocket connected successfully:", frame);
            this.connected = true;
            this.reconnectAttempts = 0;
            if (this.options.onChatConnected) {
              this.options.onChatConnected();
            }
            resolve(true);
          },
          (error: any) => {
            console.error("Chat WebSocket connection error:", error);
            console.error("Error details:", error);
            this.connected = false;
            if (this.options.onError) {
              this.options.onError(error);
            }
            // 不进行重连，因为可能是网络问题或后端服务不可用
            reject(error);
          },
        );

        // 监听连接关闭
        this.socket.onclose = () => {
          console.log("Chat WebSocket disconnected");
          this.connected = false;
          if (this.options.onDisconnected) {
            this.options.onDisconnected();
          }
        };

        // 监听连接错误
        this.socket.onerror = (error) => {
          console.error("Chat WebSocket socket error:", error);
        };
      } catch (error) {
        console.error("Error connecting to chat WebSocket:", error);
        console.error("Error details:", error);
        reject(error);
      }
    });
  }

  /**
   * 连接所有WebSocket
   */
  public async connect(): Promise<boolean> {
    try {
      console.log("Attempting to connect to all WebSocket services");
      // 先连接聊天WebSocket
      const connected = await this.initConnect();
      console.log("Chat WebSocket connection result:", connected);
      const allConnected = null != connected;
      console.log("All WebSocket services connection result:", allConnected);
      return allConnected;
    } catch (error) {
      console.error("Error connecting to WebSocket services:", error);
      return false;
    }
  }

  /**
   * 发送群聊消息
   * @param message
   */
  public sendGroupMessage(message: Omit<ChatMessage, "type">): void {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const fullMessage: ChatMessage = {
        ...message,
        type: MessageType.GROUP,
      };

      this.stompClient.send(
        "/app/form/group-message",
        {},
        JSON.stringify(fullMessage),
      );
      console.log("Group message sent:", fullMessage);
    } catch (error) {
      console.error("Error sending group message:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * 注册用户
   * @param userId
   * @param sessionId
   */
  public registerUser(userId: string, sessionId: string): void {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const payload: any = {
        userId,
        sessionId,
      };
      this.stompClient.send("/app/form/register", {}, JSON.stringify(payload));
      console.log("User registered:", userId);
    } catch (error) {
      console.error("Error registering user:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * 注册表单信息
   * @param formInfoData
   */
  public registerFormInfo(formInfoData: any): void {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      this.stompClient.send(
        "/app/form/register-form",
        {},
        JSON.stringify(formInfoData),
      );
      console.log("Form info registered:", formInfoData.formId);
    } catch (error) {
      console.error("Error registering form info:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * 订阅新peer加入通知
   * @param callback
   * @param userId
   */
  public subscribeToPeerJoined(
    callback: (message: any) => void,
    userId: string,
  ): string | null {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return null;
    }
    try {
      console.log(
        "Attempting to subscribe to peer joined notifications for user:",
        userId,
      );
      const subscription = this.stompClient.subscribe(
        `/form/${userId}/peer-joined`,
        (message) => {
          console.log("Received peer joined notification:", message?.body);
          try {
            const data = JSON.parse(message?.body);
            console.log("Parsed peer joined notification:", data);
            callback(data);
          } catch (parseError) {
            console.error(
              "Error parsing peer joined notification:",
              parseError,
            );
          }
        },
      );

      console.log(
        "Successfully subscribed to peer joined notifications for user:",
        userId,
      );
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to peer joined notifications:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  /**
   * 订阅已存在peers通知
   * @param callback
   * @param userId
   */
  public subscribeToExistingPeers(
    callback: (message: any) => void,
    userId: string,
  ): string | null {
    if (!this.stompClient || !this.connected) {
      console.error("WebRTC WebSocket not connected");
      return null;
    }

    try {
      console.log(
        "Attempting to subscribe to existing peers notifications for user:",
        userId,
      );
      const subscription = this.stompClient.subscribe(
        `/form/${userId}/existing-peers`,
        (message) => {
          console.log("Received existing peers notification:", message?.body);
          try {
            const data = JSON.parse(message?.body);
            console.log("Parsed existing peers notification:", data);
            callback(data);
          } catch (parseError) {
            console.error(
              "Error parsing existing peers notification:",
              parseError,
            );
          }
        },
      );

      console.log(
        "Successfully subscribed to existing peers notifications for user:",
        userId,
      );
      return subscription.id;
    } catch (error) {
      console.error(
        "Error subscribing to existing peers notifications:",
        error,
      );
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  /**
   * 订阅群聊消息
   * @param formId
   * @param callback
   */
  public subscribeToGroupMessages(
    callback: (message: any) => void,
    formId: string,
  ): string | null {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return null;
    }

    try {
      const subscription = this.stompClient.subscribe(
        `/form/${formId}/message`,
        (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        },
      );

      console.log(`Subscribed to group messages for form ${formId}`);
      return subscription.id;
    } catch (error) {
      console.error("Error subscribing to group messages:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      return null;
    }
  }

  /**
   * 锁定组件
   * @param compId
   * @param formId
   * @param userInfo
   */
  public lockComponent(compId: string, formId: string, userInfo: any): void {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const payload = {
        compId,
        formId,
        userInfo,
        type: MessageType.LOCK,
      };

      this.stompClient.send(
        "/app/form/lock-component",
        {},
        JSON.stringify(payload),
      );
      console.log("Component lock request sent:", payload);
    } catch (error) {
      console.error("Error sending component lock request:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * 解锁组件
   * @param compId
   * @param formId
   */
  public unlockComponent(compId: string, formId: string): void {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const payload = {
        compId,
        formId,
        type: MessageType.UNLOCK,
      };

      this.stompClient.send(
        "/app/form/unlock-component",
        {},
        JSON.stringify(payload),
      );
      console.log("Component unlock request sent:", payload);
    } catch (error) {
      console.error("Error sending component unlock request:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * 同步组件数据
   * @param formId
   * @param data
   */
  public syncComponentData(formId: string, data: any): void {
    if (!this.stompClient || !this.connected) {
      console.error("Chat WebSocket not connected");
      return;
    }

    try {
      const payload = {
        formId,
        data,
        type: MessageType.SYNC,
      };

      this.stompClient.send("/app/form/sync-data", {}, JSON.stringify(payload));
      console.log("Component data sync request sent:", payload);
    } catch (error) {
      console.error("Error sending component data sync request:", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    }
  }

  /**
   * 取消订阅
   * @param subscriptionId
   */
  public unsubscribe(subscriptionId: string): void {
    if (this.stompClient) {
      this.stompClient.unsubscribe(subscriptionId);
    }
    console.log(`Unsubscribed from ${subscriptionId}`);
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log("Chat WebSocket disconnected");
      });
      this.stompClient = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.connected = false;
  }

  /**
   * 检查连接状态
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * 处理重连
   * @param connectFn
   * @param resolve
   * @param reject
   * @private
   */
  private handleReconnect(
    connectFn: () => Promise<boolean>,
    resolve: (value: boolean) => void,
    reject: (reason?: any) => void,
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

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
const defaultFormSocketService = new FormSocketService();
export default defaultFormSocketService;
