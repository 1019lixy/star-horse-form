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
export interface ChatSocketServiceOptions {
    chatEndpoint?: string;
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
export class ChatSocketService {
    private chatStompClient: Stomp.Client | null = null;
    private chatSocket: SockJS | null = null;
    private options: ChatSocketServiceOptions;
    private chatConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 2000;
    private initConnect: boolean = false;

    constructor(options: ChatSocketServiceOptions = {}) {
        this.options = {
            chatEndpoint: "/api/ws/chat",
            ...options
        };
        if (this.initConnect) {
            this.connectChat();
        }
    }

    /**
     * 连接聊天WebSocket
     */
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


    /**
     * 连接所有WebSocket
     */
    public async connect(): Promise<boolean> {
        try {
            console.log("Attempting to connect to all WebSocket services");
            // 先连接聊天WebSocket
            const chatConnected = await this.connectChat();
            console.log("Chat WebSocket connection result:", chatConnected);
            const allConnected = null != chatConnected;
            console.log("All WebSocket services connection result:", allConnected);
            return allConnected;
        } catch (error) {
            console.error("Error connecting to WebSocket services:", error);
            return false;
        }
    }

    /**
     * 发送私人消息
     * @param message
     */
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

    /**
     * 发送群聊消息
     * @param message
     */
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


    /**
     * 注册用户
     * @param userId
     * @param sessionId
     */
    public registerUser(userId: string, sessionId: string): void {
        if (!this.chatStompClient || !this.chatConnected) {
            console.error("Chat WebSocket not connected");
            return;
        }

        try {
            const payload: any = {
                userId,
                sessionId
            };
            this.chatStompClient.send("/app/chat/register", {}, JSON.stringify(payload));
            console.log("User registered:", userId);
        } catch (error) {
            console.error("Error registering user:", error);
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
    public subscribeToPeerJoined(callback: (message: any) => void, userId: string): string | null {
        if (!this.chatStompClient || !this.chatConnected) {
            console.error("Chat WebSocket not connected");
            return null;
        }
        try {
            console.log("Attempting to subscribe to peer joined notifications for user:", userId);
            const subscription = this.chatStompClient.subscribe(`/queue/user/${userId}/chat/peer-joined`, (message) => {
                console.log("Received peer joined notification:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed peer joined notification:", data);
                    callback(data);
                } catch (parseError) {
                    console.error("Error parsing peer joined notification:", parseError);
                }
            });

            console.log("Successfully subscribed to peer joined notifications for user:", userId);
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
    public subscribeToExistingPeers(callback: (message: any) => void, userId: string): string | null {
        if (!this.chatStompClient || !this.chatConnected) {
            console.error("WebRTC WebSocket not connected");
            return null;
        }

        try {
            console.log("Attempting to subscribe to existing peers notifications for user:", userId);
            const subscription = this.chatStompClient.subscribe(`/queue/user/${userId}/chat/existing-peers`, (message) => {
                console.log("Received existing peers notification:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed existing peers notification:", data);
                    callback(data);
                } catch (parseError) {
                    console.error("Error parsing existing peers notification:", parseError);
                }
            });

            console.log("Successfully subscribed to existing peers notifications for user:", userId);
            return subscription.id;
        } catch (error) {
            console.error("Error subscribing to existing peers notifications:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
            return null;
        }
    }

    /**
     * 订阅私人消息
     * @param callback
     * @param userId
     */
    public subscribeToPrivateMessages(callback: (message: ChatMessage) => void, userId: string): string | null {
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

    /**
     * 订阅群聊消息
     * @param groupId
     * @param callback
     */
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


    /**
     * 取消订阅
     * @param subscriptionId
     */
    public unsubscribe(subscriptionId: string): void {
        if (this.chatStompClient) {
            this.chatStompClient.unsubscribe(subscriptionId);
        }
        console.log(`Unsubscribed from ${subscriptionId}`);
    }

    /**
     * 断开连接
     */
    public disconnect(): void {
        if (this.chatStompClient) {
            this.chatStompClient.disconnect(() => {
                console.log("Chat WebSocket disconnected");
            });
            this.chatStompClient = null;
        }


        if (this.chatSocket) {
            this.chatSocket.close();
            this.chatSocket = null;
        }
        this.chatConnected = false;

    }

    /**
     * 检查连接状态
     */
    public isChatConnected(): boolean {
        return this.chatConnected;
    }


    /**
     * 处理重连
     * @param connectFn
     * @param resolve
     * @param reject
     * @private
     */
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
const defaultChatSocketService = new ChatSocketService();
export default defaultChatSocketService;
