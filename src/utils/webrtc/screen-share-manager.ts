// 桌面共享工具类，处理屏幕共享功能

export interface ScreenShareConstraints {
  audio?: boolean;
  video?: boolean | {
    cursor?: "always" | "motion" | "never";
    displaySurface?: "monitor" | "window" | "browser";
    logicalSurface?: boolean;
  };
}

export interface ScreenShareManagerOptions {
  defaultConstraints?: ScreenShareConstraints;
  onStreamAcquired?: (stream: MediaStream) => void;
  onStreamStopped?: () => void;
  onError?: (error: Error) => void;
  onDisplayMediaRequest?: () => void;
}

export class ScreenShareManager {
  private screenStream: MediaStream | null = null;
  private options: ScreenShareManagerOptions;
  private isSharing: boolean = false;

  constructor(options: ScreenShareManagerOptions = {}) {
    this.options = options;
  }

  // 开始屏幕共享
  public async startScreenShare(constraints: ScreenShareConstraints = {}): Promise<MediaStream> {
    try {
      // 检查浏览器支持
      if (!navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen sharing is not supported in this browser");
      }

      // 触发屏幕共享请求回调
      if (this.options.onDisplayMediaRequest) {
        this.options.onDisplayMediaRequest();
      }

      // 合并默认约束和用户约束
      const mergedConstraints: ScreenShareConstraints = {
        ...this.options.defaultConstraints,
        ...constraints
      };

      // 构建屏幕共享约束
      const displayConstraints = {
        audio: mergedConstraints.audio,
        video: mergedConstraints.video || true
      };

      // 获取屏幕流
      const stream = await navigator.mediaDevices.getDisplayMedia(displayConstraints);

      // 保存流
      this.screenStream = stream;
      this.isSharing = true;

      // 监听所有轨道的结束事件
      stream.getTracks().forEach(track => {
        track.onended = () => {
          console.log("Screen share track ended:", track.kind, track.id);
          this.stopScreenShare();
        };
      });

      // 触发流获取成功回调
      if (this.options.onStreamAcquired) {
        this.options.onStreamAcquired(stream);
      }

      return stream;
    } catch (error) {
      console.error("Error starting screen share:", error);
      this.isSharing = false;
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 停止屏幕共享
  public stopScreenShare(): void {
    if (!this.screenStream) return;

    // 停止所有轨道
    this.screenStream.getTracks().forEach(track => track.stop());

    // 清空引用
    this.screenStream = null;
    this.isSharing = false;

    // 触发流停止回调
    if (this.options.onStreamStopped) {
      this.options.onStreamStopped();
    }
  }

  // 切换屏幕共享源
  public async switchScreenShareSource(constraints: ScreenShareConstraints = {}): Promise<MediaStream> {
    try {
      // 停止当前屏幕共享
      this.stopScreenShare();

      // 开始新的屏幕共享
      return await this.startScreenShare(constraints);
    } catch (error) {
      console.error("Error switching screen share source:", error);
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 检查是否正在共享屏幕
  public getIsSharing(): boolean {
    return this.isSharing;
  }

  // 获取当前屏幕流
  public getCurrentStream(): MediaStream | null {
    return this.screenStream;
  }

  // 检查浏览器是否支持屏幕共享
  public static isScreenShareSupported(): boolean {
    return !!navigator.mediaDevices.getDisplayMedia;
  }

  // 检查屏幕共享权限
  public static async checkScreenSharePermission(): Promise<boolean> {
    try {
      // 尝试获取屏幕流权限
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Screen share permission denied:", error);
      return false;
    }
  }

  // 清理资源
  public dispose(): void {
    if (this.screenStream) {
      this.stopScreenShare();
    }
  }
}

// 导出默认配置
const DEFAULT_SCREEN_SHARE_CONSTRAINTS: ScreenShareConstraints = {
  video: {
    cursor: "always",
    displaySurface: "monitor",
    logicalSurface: true
  },
  audio: false
};

export { DEFAULT_SCREEN_SHARE_CONSTRAINTS };
