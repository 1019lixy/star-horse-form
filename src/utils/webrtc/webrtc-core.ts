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
      const offer = await this.peerConnection!.createOffer();
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

  // 添加ICE候选者
  // eslint-disable-next-line no-undef
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error("Error adding ice candidate:", error);
      // 忽略某些ICE候选者错误
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
}

// 导出单例实例
let webRTCCoreInstance: WebRTCCore | null = null;

export const getWebRTCCoreInstance = (options?: WebRTCOptions): WebRTCCore => {
  if (!webRTCCoreInstance) {
    webRTCCoreInstance = new WebRTCCore(options);
  }
  return webRTCCoreInstance;
};
