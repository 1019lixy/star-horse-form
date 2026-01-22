// WebRTC核心工具类，处理WebRTC连接和信令

export interface RTCPeerConnectionConfig {
  iceServers?: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
}

export interface RTCDataChannelConfig {
  ordered?: boolean;
  maxRetransmitTime?: number;
  maxRetransmits?: number;
  protocol?: string;
  negotiated?: boolean;
  id?: number;
}

export interface WebRTCOptions {
  peerConnectionConfig?: RTCPeerConnectionConfig;
  dataChannelConfig?: RTCDataChannelConfig;
  // eslint-disable-next-line no-undef
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  // eslint-disable-next-line no-undef
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onTrack?: (event: RTCTrackEvent) => void;
  onDataChannel?: (channel: RTCDataChannel) => void;
}

export class WebRTCCore {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private options: WebRTCOptions;
  private senderId: string | null = null;

  constructor(options: WebRTCOptions = {}) {
    this.options = options;
  }

  // 初始化PeerConnection
  public initPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    const config = this.options.peerConnectionConfig || {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]
        }
      ]
    };

    this.peerConnection = new RTCPeerConnection(config);

    // 设置事件监听器
    this.setupEventListeners();

    return this.peerConnection;
  }

  // 设置事件监听器
  private setupEventListeners(): void {
    if (!this.peerConnection) return;

    // 连接状态变化
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection && this.options.onConnectionStateChange) {
        this.options.onConnectionStateChange(this.peerConnection.connectionState);
      }
    };

    // ICE连接状态变化
    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection && this.options.onIceConnectionStateChange) {
        this.options.onIceConnectionStateChange(this.peerConnection.iceConnectionState);
      }
    };

    // ICE候选者
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.options.onIceCandidate) {
        this.options.onIceCandidate(event.candidate);
      }
    };

    // 远程轨道添加
    this.peerConnection.ontrack = (event) => {
      if (this.options.onTrack) {
        this.options.onTrack(event);
      }

      // 处理远程流
      if (event.streams && event.streams.length > 0) {
        event.streams.forEach(stream => {
          this.remoteStreams.set(stream.id, stream);
        });
      }
    };

    // 数据通道
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      if (this.options.onDataChannel) {
        this.options.onDataChannel(this.dataChannel);
      }
    };
  }

  // 创建Offer
  // eslint-disable-next-line no-undef
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    try {
      // 添加约束以支持屏幕共享
      const offerOptions: RTCOfferOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      };
      
      const offer = await this.peerConnection!.createOffer(offerOptions);
      await this.peerConnection!.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
      throw error;
    }
  }

  // 创建Answer
  // eslint-disable-next-line no-undef
  public async createAnswer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    try {
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
      throw error;
    }
  }

  // 设置远程描述
  // eslint-disable-next-line no-undef
  public async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    try {
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(description));
    } catch (error) {
      console.error("Error setting remote description:", error);
      throw error;
    }
  }

  // 回滚本地描述（用于处理offer碰撞）
  // eslint-disable-next-line no-undef
  public async rollbackLocalDescription(): Promise<void> {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    try {
      if (this.peerConnection!.signalingState === "have-local-offer") {
        await this.peerConnection!.setLocalDescription({ type: "rollback" } as RTCSessionDescriptionInit);
      }
    } catch (error) {
      console.error("Error rolling back local description:", error);
      throw error;
    }
  }

  // 添加ICE候选者
  // eslint-disable-next-line no-undef
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      // 检查远程描述是否已设置，避免在null状态下添加ICE候选者
      if (!this.peerConnection.remoteDescription) {
        console.warn("Remote description is null, queuing ICE candidate for later processing");
        // 可以在这里实现ICE候选者队列，等远程描述设置后再添加
        return;
      }
      
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("ICE candidate added successfully");
    } catch (error) {
      console.error("Error adding ice candidate:", error);
      // 如果是由于远程描述为空导致的错误，忽略它
      if (error.toString().includes("remote description was null")) {
        console.warn("Ignoring ICE candidate error due to null remote description");
        return;
      }
      // 重新抛出其他错误
      throw error;
    }
  }

  // 创建数据通道
  public createDataChannel(label: string = "chat", config?: RTCDataChannelConfig): RTCDataChannel {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    if (this.dataChannel) {
      return this.dataChannel;
    }

    this.dataChannel = this.peerConnection!.createDataChannel(label, config || this.options.dataChannelConfig);
    return this.dataChannel;
  }

  // 添加本地流
  public addLocalStream(stream: MediaStream): void {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    this.localStream = stream;

    // 将流中的所有轨道添加到PeerConnection
    stream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, stream);
    });

    // 当流发生变化时，需要重新协商WebRTC连接
    // 注意：在实际应用中，这里应该创建新的offer并通过信令服务器发送给其他参与者
    console.log("Local stream added/updated, WebRTC should re-negotiate");
    console.log("Stream tracks:", stream.getTracks().map(t => t.kind + ":" + t.label));
  }

  // 替换指定类型的轨道
  public replaceTrack(kind: "audio" | "video", track: MediaStreamTrack | null, stream?: MediaStream): void {
    if (!this.peerConnection) {
      this.initPeerConnection();
    }

    const sender = this.peerConnection!.getSenders().find(s => s.track && s.track.kind === kind);

    if (track) {
      if (sender) {
        sender.replaceTrack(track);
      } else {
        const attachStream = stream || new MediaStream([track]);
        this.peerConnection!.addTrack(track, attachStream);
      }
    } else if (sender) {
      this.peerConnection!.removeTrack(sender);
    }

    if (!this.localStream) {
      this.localStream = new MediaStream();
    }

    const existingTrack = this.localStream.getTracks().find(t => t.kind === kind);
    if (existingTrack) {
      this.localStream.removeTrack(existingTrack);
    }
    if (track) {
      this.localStream.addTrack(track);
    }
  }

  // 移除本地流
  public removeLocalStream(): void {
    if (!this.peerConnection || !this.localStream) return;

    this.localStream.getTracks().forEach(track => {
      const sender = this.peerConnection!.getSenders().find(s => s.track === track);
      if (sender) {
        this.peerConnection!.removeTrack(sender);
      }
    });

    this.localStream = null;
  }

  // 获取本地流
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  // 获取远程流
  public getRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }

  // 关闭连接
  public close(): void {
    // 关闭数据通道
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }

    // 关闭PeerConnection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // 停止本地流
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // 清空远程流
    this.remoteStreams.clear();
  }

  // 获取连接状态
  // eslint-disable-next-line no-undef
  public getConnectionState(): RTCPeerConnectionState | null {
    return this.peerConnection ? this.peerConnection.connectionState : null;
  }

  // 获取ICE连接状态
  // eslint-disable-next-line no-undef
  public getIceConnectionState(): RTCIceConnectionState | null {
    return this.peerConnection ? this.peerConnection.iceConnectionState : null;
  }

  // 获取信令状态
  // eslint-disable-next-line no-undef
  public getSignalingState(): RTCSignalingState | null {
    return this.peerConnection ? this.peerConnection.signalingState : null;
  }
}

// 导出单例实例
let webRTCCoreInstance: WebRTCCore | null = null;

export const getWebRTCCoreInstance = (options?: WebRTCOptions): WebRTCCore => {
  if (!webRTCCoreInstance) {
    webRTCCoreInstance = new WebRTCCore(options);
  }
  return webRTCCoreInstance;
};

export const createWebRTCCoreInstance = (options?: WebRTCOptions): WebRTCCore => {
  return new WebRTCCore(options);
};
