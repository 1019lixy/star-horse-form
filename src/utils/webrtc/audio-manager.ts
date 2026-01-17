// 音频处理工具类，处理音频流相关操作

export interface AudioConstraints {
  deviceId?: string | {
    exact?: string;
  };
  autoGainControl?: boolean;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  sampleRate?: number;
  sampleSize?: number;
  channelCount?: number;
  latency?: number;
  volume?: number;
}

export interface AudioManagerOptions {
  defaultConstraints?: AudioConstraints;
  onStreamAcquired?: (stream: MediaStream) => void;
  onStreamStopped?: () => void;
  onError?: (error: Error) => void;
}

export class AudioManager {
  private localStream: MediaStream | null = null;
  private audioTrack: MediaStreamTrack | null = null;
  private options: AudioManagerOptions;
  private currentDeviceId: string | null = null;

  constructor(options: AudioManagerOptions = {}) {
    this.options = options;
  }

  // 获取麦克风音频流
  public async getMicrophoneStream(constraints: AudioConstraints = {}): Promise<MediaStream> {
    try {
      // 合并默认约束和用户约束
      const mergedConstraints: AudioConstraints = {
        ...this.options.defaultConstraints,
        ...constraints
      };

      // 构建MediaStreamConstraints
      // eslint-disable-next-line no-undef
      const mediaConstraints: MediaStreamConstraints = {
        audio: mergedConstraints,
        video: false // 视频由VideoManager单独处理
      };

      // 获取流
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      // 保存流和轨道
      this.localStream = stream;
      this.audioTrack = stream.getAudioTracks()[0];

      // 保存当前设备ID
      if (mergedConstraints.deviceId) {
        if (typeof mergedConstraints.deviceId === "string") {
          this.currentDeviceId = mergedConstraints.deviceId;
        } else if (mergedConstraints.deviceId.exact) {
          this.currentDeviceId = mergedConstraints.deviceId.exact;
        }
      } else if (this.audioTrack.getSettings().deviceId) {
        this.currentDeviceId = this.audioTrack.getSettings().deviceId;
      }

      // 触发流获取成功回调
      if (this.options.onStreamAcquired) {
        this.options.onStreamAcquired(stream);
      }

      return stream;
    } catch (error) {
      console.error("Error getting microphone stream:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 停止音频流
  public stopStream(): void {
    if (!this.localStream) return;

    // 停止所有轨道
    this.localStream.getTracks().forEach(track => track.stop());

    // 清空引用
    this.localStream = null;
    this.audioTrack = null;
    this.currentDeviceId = null;

    // 触发流停止回调
    if (this.options.onStreamStopped) {
      this.options.onStreamStopped();
    }
  }

  // 切换音频状态（静音/取消静音）
  public toggleAudio(): boolean {
    if (!this.audioTrack) return false;

    const enabled = !this.audioTrack.enabled;
    this.audioTrack.enabled = enabled;
    return enabled;
  }

  // 设置音频状态
  public setAudioEnabled(enabled: boolean): void {
    if (this.audioTrack) {
      this.audioTrack.enabled = enabled;
    }
  }

  // 获取音频状态
  public isAudioEnabled(): boolean {
    return this.audioTrack ? this.audioTrack.enabled : false;
  }

  // 切换麦克风
  public async switchMicrophone(): Promise<MediaStream> {
    try {
      // 获取所有音频输入设备
      const devices = await this.getAudioDevices();
      if (devices.length <= 1) {
        throw new Error("No other microphone available");
      }

      // 找到下一个麦克风
      let nextDeviceId: string | null = null;
      const currentIndex = devices.findIndex(device => device.deviceId === this.currentDeviceId);

      if (currentIndex >= 0) {
        // 如果找到当前设备，切换到下一个
        nextDeviceId = devices[(currentIndex + 1) % devices.length].deviceId;
      } else {
        // 否则使用第一个设备
        nextDeviceId = devices[0].deviceId;
      }

      // 停止当前流
      this.stopStream();

      // 获取新设备的流
      return await this.getMicrophoneStream({ deviceId: nextDeviceId });
    } catch (error) {
      console.error("Error switching microphone:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 获取音频输入设备列表
  public async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === "audioinput");
    } catch (error) {
      console.error("Error getting audio devices:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      return [];
    }
  }

  // 调整音频设置
  public async adjustAudioSettings(constraints: Partial<AudioConstraints>): Promise<MediaStream> {
    try {
      // 构建新的约束
      const newConstraints: AudioConstraints = {
        ...this.options.defaultConstraints,
        ...constraints,
        deviceId: this.currentDeviceId ? { exact: this.currentDeviceId } : undefined
      };

      // 停止当前流
      this.stopStream();

      // 获取新的流
      return await this.getMicrophoneStream(newConstraints);
    } catch (error) {
      console.error("Error adjusting audio settings:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 获取当前音频流
  public getCurrentStream(): MediaStream | null {
    return this.localStream;
  }

  // 获取当前音频轨道
  public getCurrentTrack(): MediaStreamTrack | null {
    return this.audioTrack;
  }

  // 获取当前设备ID
  public getCurrentDeviceId(): string | null {
    return this.currentDeviceId;
  }

  // 获取音频轨道设置
  // eslint-disable-next-line no-undef
  public getAudioSettings(): MediaTrackSettings | null {
    return this.audioTrack ? this.audioTrack.getSettings() : null;
  }

  // 获取音频轨道能力
  // eslint-disable-next-line no-undef
  public getAudioCapabilities(): MediaTrackCapabilities | null {
    return this.audioTrack ? this.audioTrack.getCapabilities() : null;
  }
}

// 导出默认配置
const DEFAULT_AUDIO_CONSTRAINTS: AudioConstraints = {
  autoGainControl: true,
  echoCancellation: true,
  noiseSuppression: true
};

export { DEFAULT_AUDIO_CONSTRAINTS };
