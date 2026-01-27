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
    endpoint?: string;
    onConnected?: () => void;
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
    type?: string;
    groupId?: string;
    meetingId?: string;
    sentAt: string;
    isSelf?: boolean;
}

// WebRTC信令消息接口
export interface WebRtcSignalingMessage {
    senderId: string;
    meetingId: string;
    targetUserId?: string;
    offer?: any;
    answer?: any;
    candidate?: any;
    isScreenShare?: boolean;
}

export class MeetingSocketService {
    private stompClient: Stomp.Client | null = null;
    private socket: SockJS | null = null;
    private options: WebSocketServiceOptions;
    private connected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 2000;
    private initConnectInstance: boolean = false;
    //会议Id
    private meetingId: string = "";

    constructor(options: WebSocketServiceOptions = {}) {
        this.options = {
            endpoint: "/api/ws/meeting",
            ...options
        };
        if (this.initConnectInstance) {
            this.initConnect();
        }
    }


    // 连接WebRTC信令WebSocket
    public initConnect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                console.log("Attempting to connect to WebRTC WebSocket at:", this.options.endpoint!);
                this.socket = new SockJS(this.options.endpoint!);
                this.stompClient = Stomp.over(this.socket);
                this.stompClient.debug = (str) => {
                    console.log("WebRTC WebSocket debug:", str);
                };

                this.stompClient.connect({},
                    (frame: string) => {
                        console.log("WebRTC WebSocket connected successfully:", frame);
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        if (this.options.onConnected) {
                            this.options.onConnected();
                        }
                        resolve(true);
                    },
                    (error: any) => {
                        console.error("WebRTC WebSocket connection error:", error);
                        console.error("Error details:", error);
                        this.connected = false;
                        if (this.options.onError) {
                            this.options.onError(error);
                        }
                        // 不进行重连，因为可能是网络问题或后端服务不可用
                        reject(error);
                    }
                );

                // 监听连接关闭
                this.socket.onclose = () => {
                    console.log("WebRTC WebSocket disconnected");
                    this.connected = false;
                    if (this.options.onDisconnected) {
                        this.options.onDisconnected();
                    }
                };

                // 监听连接错误
                this.socket.onerror = (error) => {
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
            const connected = await this.initConnect();
            console.log("Chat WebSocket connection result:", connected);
            const allConnected = !!connected;
            console.log("All WebSocket services connection result:", allConnected);
            return allConnected;
        } catch (error) {
            console.error("Error connecting to WebSocket services:", error);
            return false;
        }
    }


    // 发送会议消息
    public sendMeetingMessage(message: Omit<ChatMessage, "type">): void {
        if (!this.stompClient || !this.connected) {
            console.error("Chat WebSocket not connected");
            return;
        }

        try {
            const fullMessage: ChatMessage = {
                ...message,
                type: MessageType.MEETING
            };

            this.stompClient.send("/app/meeting/message", {}, JSON.stringify(fullMessage));
            console.log("Meeting message sent:", fullMessage);
        } catch (error) {
            console.error("Error sending meeting message:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 发送WebRTC提议
     * @param message
     */
    public sendWebRtcOffer(message: WebRtcSignalingMessage): void {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return;
        }

        try {
            this.stompClient.send("/app/meeting/offer", {}, JSON.stringify(message));
            console.log("WebRTC offer sent:", message);
        } catch (error) {
            console.error("Error sending WebRTC offer:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 发送WebRTC应答
     * @param message
     */
    public sendWebRtcAnswer(message: WebRtcSignalingMessage): void {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return;
        }
        try {
            this.stompClient.send("/app/meeting/answer", {}, JSON.stringify(message));
            console.log("WebRTC answer sent:", message);
        } catch (error) {
            console.error("Error sending WebRTC answer:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 发送ICE候选者
     * @param message
     */
    public sendIceCandidate(message: WebRtcSignalingMessage): void {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return;
        }
        try {
            this.stompClient.send("/app/meeting/ice-candidate", {}, JSON.stringify(message));
            console.log("ICE candidate sent:", message);
        } catch (error) {
            console.error("Error sending ICE candidate:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 注册会议用户
     * @param userId 用户Id
     * @param sessionId Session Id
     * @param meetingId 会议Id
     */
    public registerUser(userId: string, sessionId: string, meetingId?: string): void {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return;
        }
        try {
            const payload: any = {
                userId,
                sessionId
            };
            if (meetingId) {
                payload.meetingId = meetingId;
            }

            this.stompClient.send("/app/meeting/register", {}, JSON.stringify(payload));
            console.log("User registered:", userId, "meeting:", meetingId);
        } catch (error) {
            console.error("Error registering meeting:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 订阅新peer加入通知
     * @param callback
     * @param meetingId
     */
    public subscribeToPeerJoined(callback: (message: any) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return null;
        }
        try {
            console.log("Attempting to subscribe to peer joined notifications for meeting:", meetingId);
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/peer-joined`, (message) => {
                console.log("Received peer joined notification:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed peer joined notification:", data);
                    callback && callback(data);
                } catch (parseError) {
                    console.error("Error parsing peer joined notification:", parseError);
                }
            });
            console.log("Successfully subscribed to peer joined notifications for meeting:", meetingId);
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
     * @param callback 回调函数
     * @param meetingId 会议Id
     */
    public subscribeToExistingPeers(callback: (message: any) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return null;
        }
        try {
            console.log("Attempting to subscribe to existing peers notifications for meeting:", meetingId);
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/existing-peers`, (message) => {
                console.log("Received existing peers notification:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed existing peers notification:", data);
                    callback && callback(data);
                } catch (parseError) {
                    console.error("Error parsing existing peers notification:", parseError);
                }
            });

            console.log("Successfully subscribed to existing peers notifications for meeting:", meetingId);
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
     * 订阅会议消息
     * @param callback
     * @param meetingId
     */
    public subscribeToMeetingMessages(callback: (message: ChatMessage) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("Chat WebSocket not connected");
            return null;
        }
        try {
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/message`, (message) => {
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

    /**
     * 订阅WebRTC提议
     * @param callback
     * @param meetingId
     */
    public subscribeToWebRtcOffers(callback: (message: WebRtcSignalingMessage) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return null;
        }
        try {
            console.log("Attempting to subscribe to WebRTC offers for meeting:", meetingId);
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/offer`, (message) => {
                console.log("Received WebRTC offer:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed WebRTC offer:", data);
                    callback && callback(data);
                } catch (parseError) {
                    console.error("Error parsing WebRTC offer:", parseError);
                }
            });
            console.log("Successfully subscribed to WebRTC offers for meeting:", meetingId);
            return subscription.id;
        } catch (error) {
            console.error("Error subscribing to WebRTC offers:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
            return null;
        }
    }

    /**
     * 订阅WebRTC应答
     * @param callback
     * @param meetingId
     */
    public subscribeToWebRtcAnswers(callback: (message: WebRtcSignalingMessage) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return null;
        }
        try {
            console.log("Attempting to subscribe to WebRTC answers for meeting:", meetingId);
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/answer`, (message) => {
                console.log("Received WebRTC answer:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed WebRTC answer:", data);
                    callback && callback(data);
                } catch (parseError) {
                    console.error("Error parsing WebRTC answer:", parseError);
                }
            });

            console.log("Successfully subscribed to WebRTC answers for meeting:", meetingId);
            return subscription.id;
        } catch (error) {
            console.error("Error subscribing to WebRTC answers:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
            return null;
        }
    }

    /**
     * 订阅ICE候选者
     * @param callback
     * @param meetingId
     */
    public subscribeToIceCandidates(callback: (message: WebRtcSignalingMessage) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("WebRTC WebSocket not connected");
            return null;
        }
        try {
            console.log("Attempting to subscribe to ICE candidates for meeting:", meetingId);
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/ice-candidate`, (message) => {
                console.log("Received ICE candidate:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed ICE candidate:", data);
                    callback && callback(data);
                } catch (parseError) {
                    console.error("Error parsing ICE candidate:", parseError);
                }
            });

            console.log("Successfully subscribed to ICE candidates for meeting:", meetingId);
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

        if (this.stompClient) {
            this.stompClient.unsubscribe(subscriptionId);
        }
        console.log(`Unsubscribed from ${subscriptionId}`);
    }

    // 断开连接
    public disconnect(): void {

        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log("WebRTC WebSocket disconnected");
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
     * 检查WebRTC连接状态
     */
    public isConnected(): boolean {
        return this.connected;
    }

    /**
     * 订阅会议参与者状态变化
     * @param callback
     * @param meetingId
     */
    public subscribeToParticipantStatus(callback: (message: any) => void, meetingId: string): string | null {
        if (!this.stompClient || !this.connected) {
            console.error("Chat WebSocket not connected");
            return null;
        }

        try {
            console.log("Attempting to subscribe to participant status for meeting:", meetingId);
            const subscription = this.stompClient.subscribe(`/meeting/${meetingId}/participants`, (message) => {
                console.log("Received participant status message:", message?.body);
                try {
                    const data = JSON.parse(message?.body);
                    console.log("Parsed participant status message:", data);
                    callback && callback(data);
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

    /**
     * 发送用户加入会议消息
     * @param meetingId
     * @param userId
     * @param userName
     */
    public sendUserJoinedMessage(meetingId: string, userId: string, userName: string): void {
        if (!this.stompClient || !this.connected) {
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

            console.log("Attempting to send meeting joined message:", message);
            this.stompClient.send(
                "/app/meeting/user-joined",
                {},
                JSON.stringify(message)
            );
            console.log("User joined message sent successfully:", message);
        } catch (error) {
            console.error("Error sending meeting joined message:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 发送用户离开会议消息
     * @param meetingId
     * @param userId
     * @param userName
     */
    public sendUserLeftMessage(meetingId: string, userId: string, userName: string): void {
        if (!this.stompClient || !this.connected) {
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

            console.log("Attempting to send meeting left message:", message);
            this.stompClient.send(
                "/app/meeting/leave",
                {},
                JSON.stringify(message)
            );
            console.log("User left message sent successfully:", message);
        } catch (error) {
            console.error("Error sending meeting left message:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * 发送会议结束消息
     * @param meetingId
     * @param userId
     * @param userName
     */
    public sendMeetingEndedMessage(meetingId: string, userId: string, userName: string): void {
        if (!this.stompClient || !this.connected) {
            console.error("Chat WebSocket not connected");
            return;
        }

        try {
            const message = {
                meetingId: meetingId,
                userId: userId,
                userName: userName,
                type: "MEETING_ENDED",
                timestamp: new Date().toISOString()
            };

            console.log("Attempting to send meeting ended message:", message);
            this.stompClient.send(
                "/app/meeting/end",
                {},
                JSON.stringify(message)
            );
            console.log("Meeting ended message sent successfully:", message);
        } catch (error) {
            console.error("Error sending meeting ended message:", error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
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
const defaultWebSocketService = new MeetingSocketService();
export default defaultWebSocketService;
