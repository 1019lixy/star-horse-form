// 视频处理工具类，处理视频流相关操作

export interface VideoConstraints {
  width?: number | {
    min?: number;
    ideal?: number;
    max?: number;
  };
  height?: number | {
    min?: number;
    ideal?: number;
    max?: number;
  };
  frameRate?: number | {
    min?: number;
    ideal?: number;
    max?: number;
  };
  facingMode?: "user" | "environment" | "left" | "right" | string;
  deviceId?: string | {
    exact?: string;
  };
}

export interface VideoManagerOptions {
  defaultConstraints?: VideoConstraints;
  onStreamAcquired?: (stream: MediaStream) => void;
  onStreamStopped?: () => void;
  onError?: (error: Error) => void;
}

export class VideoManager {
  private localStream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private options: VideoManagerOptions;
  private currentDeviceId: string | null = null;

  constructor(options: VideoManagerOptions = {}) {
    this.options = options;
  }

  // 获取摄像头视频流
  public async getCameraStream(constraints: VideoConstraints = {}): Promise<MediaStream> {
    try {
      // 合并默认约束和用户约束
      const mergedConstraints: VideoConstraints = {
        ...this.options.defaultConstraints,
        ...constraints
      };

      // 构建MediaStreamConstraints
      // eslint-disable-next-line no-undef
      const mediaConstraints: MediaStreamConstraints = {
        video: mergedConstraints,
        audio: false // 音频由AudioManager单独处理
      };

      // 获取流
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      // 保存流和轨道
      this.localStream = stream;
      this.videoTrack = stream.getVideoTracks()[0];

      // 保存当前设备ID
      if (mergedConstraints.deviceId) {
        if (typeof mergedConstraints.deviceId === "string") {
          this.currentDeviceId = mergedConstraints.deviceId;
        } else if (mergedConstraints.deviceId.exact) {
          this.currentDeviceId = mergedConstraints.deviceId.exact;
        }
      } else if (this.videoTrack.getSettings().deviceId) {
        this.currentDeviceId = this.videoTrack.getSettings().deviceId;
      }

      // 触发流获取成功回调
      if (this.options.onStreamAcquired) {
        this.options.onStreamAcquired(stream);
      }

      return stream;
    } catch (error) {
      console.error("Error getting camera stream:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 停止视频流
  public stopStream(): void {
    if (!this.localStream) return;

    // 停止所有轨道
    this.localStream.getTracks().forEach(track => track.stop());

    // 清空引用
    this.localStream = null;
    this.videoTrack = null;
    this.currentDeviceId = null;

    // 触发流停止回调
    if (this.options.onStreamStopped) {
      this.options.onStreamStopped();
    }
  }

  // 切换视频状态（开启/关闭）
  public toggleVideo(): boolean {
    if (!this.videoTrack) return false;

    const enabled = !this.videoTrack.enabled;
    this.videoTrack.enabled = enabled;
    return enabled;
  }

  // 设置视频状态
  public setVideoEnabled(enabled: boolean): void {
    if (this.videoTrack) {
      this.videoTrack.enabled = enabled;
    }
  }

  // 获取视频状态
  public isVideoEnabled(): boolean {
    return this.videoTrack ? this.videoTrack.enabled : false;
  }

  // 切换摄像头
  public async switchCamera(): Promise<MediaStream> {
    try {
      // 获取所有视频输入设备
      const devices = await this.getVideoDevices();
      if (devices.length <= 1) {
        throw new Error("No other camera available");
      }

      // 找到下一个摄像头
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
      return await this.getCameraStream({ deviceId: nextDeviceId });
    } catch (error) {
      console.error("Error switching camera:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 获取视频输入设备列表
  public async getVideoDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === "videoinput");
    } catch (error) {
      console.error("Error getting video devices:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      return [];
    }
  }

  // 调整视频质量
  public async adjustVideoQuality(constraints: Partial<VideoConstraints>): Promise<MediaStream> {
    try {
      // 构建新的约束
      const newConstraints: VideoConstraints = {
        ...this.options.defaultConstraints,
        ...constraints,
        deviceId: this.currentDeviceId ? { exact: this.currentDeviceId } : undefined
      };

      // 停止当前流
      this.stopStream();

      // 获取新的流
      return await this.getCameraStream(newConstraints);
    } catch (error) {
      console.error("Error adjusting video quality:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 获取当前视频流
  public getCurrentStream(): MediaStream | null {
    return this.localStream;
  }

  // 获取当前视频轨道
  public getCurrentTrack(): MediaStreamTrack | null {
    return this.videoTrack;
  }

  // 获取当前设备ID
  public getCurrentDeviceId(): string | null {
    return this.currentDeviceId;
  }

  // 应用视频效果（例如滤镜）
  public applyVideoEffect(videoElement: HTMLVideoElement, effect: string): void {
    // 这里可以实现视频效果，例如通过Canvas处理视频流
    // 示例：应用灰度滤镜
    if (effect === "grayscale") {
      videoElement.style.filter = "grayscale(100%)";
    } else if (effect === "blur") {
      videoElement.style.filter = "blur(5px)";
    } else {
      videoElement.style.filter = "none";
    }
  }
}

// 导出默认配置
const DEFAULT_VIDEO_CONSTRAINTS: VideoConstraints = {
  width: {
    ideal: 1280
  },
  height: {
    ideal: 720
  },
  frameRate: {
    ideal: 30
  },
  facingMode: "user"
};

export { DEFAULT_VIDEO_CONSTRAINTS };
