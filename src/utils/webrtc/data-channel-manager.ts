// WebRTC数据通道管理工具类，处理实时消息传递

export interface DataChannelOptions {
  onMessage?: (message: any) => void;
  onConnectionEstablished?: () => void;
  onConnectionClosed?: () => void;
  onError?: (error: Error) => void;
  iceServers?: RTCIceServer[];
}

export class DataChannelManager {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private options: DataChannelOptions;
  private isConnected: boolean = false;

  constructor(options: DataChannelOptions = {}) {
    this.options = options;
    this.initPeerConnection();
  }

  // 初始化PeerConnection
  private initPeerConnection(): void {
    const config: RTCConfiguration = {
      iceServers: this.options.iceServers || [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
        }
      ]
    };

    this.peerConnection = new RTCPeerConnection(config);

    // 监听ICE候选者
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // 发送ICE候选者到远程端
        this.onIceCandidate(event.candidate);
      }
    };

    // 监听连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        console.log("Connection state:", this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === "connected") {
          this.isConnected = true;
          if (this.options.onConnectionEstablished) {
            this.options.onConnectionEstablished();
          }
        } else if (this.peerConnection.connectionState === "closed" ||
                   this.peerConnection.connectionState === "failed") {
          this.isConnected = false;
          if (this.options.onConnectionClosed) {
            this.options.onConnectionClosed();
          }
        }
      }
    };

    // 监听数据通道
    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };
  }

  // 创建数据通道
  public createDataChannel(): RTCDataChannel {
    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }

    this.dataChannel = this.peerConnection.createDataChannel("chat", {
      ordered: true,
      maxRetransmits: 10
    });

    this.setupDataChannel(this.dataChannel);
    return this.dataChannel;
  }

  // 设置数据通道
  private setupDataChannel(channel: RTCDataChannel): void {
    this.dataChannel = channel;

    this.dataChannel.onopen = () => {
      console.log("Data channel opened");
    };

    this.dataChannel.onclose = () => {
      console.log("Data channel closed");
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (this.options.onMessage) {
          this.options.onMessage(message);
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error("Data channel error:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
    };
  }

  // 创建Offer
  // eslint-disable-next-line no-undef
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // 设置远程描述
  // eslint-disable-next-line no-undef
  public async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }

    await this.peerConnection.setRemoteDescription(description);
  }

  // 添加ICE候选者
  // eslint-disable-next-line no-undef
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("PeerConnection not initialized");
    }

    await this.peerConnection.addIceCandidate(candidate);
  }

  // 发送消息
  public sendMessage(message: any): void {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      throw new Error("Data channel not open");
    }

    try {
      const messageString = JSON.stringify(message);
      this.dataChannel.send(messageString);
    } catch (error) {
      console.error("Error sending message:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
    }
  }

  // 检查连接状态
  public isConnectedToPeer(): boolean {
    return this.isConnected && this.dataChannel && this.dataChannel.readyState === "open";
  }

  // 关闭连接
  public close(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.isConnected = false;
  }

  // 处理ICE候选者（需要通过信令服务器发送给远程端）
  private onIceCandidate(candidate: RTCIceCandidate): void {
    // 这里需要通过信令服务器发送ICE候选者到远程端
    // 实际实现中，应该调用外部提供的回调函数
    console.log("ICE candidate:", candidate);
  }
}

// 导出默认配置
const DEFAULT_DATA_CHANNEL_OPTIONS: DataChannelOptions = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
    }
  ]
};

export { DEFAULT_DATA_CHANNEL_OPTIONS };
