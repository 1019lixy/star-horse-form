// 录制工具类，处理会议录制功能

export interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  frameRate?: number;
  onStart?: () => void;
  onStop?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  onDataAvailable?: (blob: Blob) => void;
}

export class RecordingManager {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedBlobs: Blob[] = [];
  private options: RecordingOptions;
  private isRecording: boolean = false;

  constructor(options: RecordingOptions = {}) {
    this.options = options;
  }

  // 开始录制
  public startRecording(stream: MediaStream): void {
    try {
      // 检查浏览器支持
      if (!MediaRecorder.isTypeSupported(this.options.mimeType || "video/webm;codecs=vp8")) {
        console.warn(`MIME type ${this.options.mimeType} not supported, using default`);
      }

      // 创建MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.options.mimeType || "video/webm;codecs=vp8",
        videoBitsPerSecond: this.options.videoBitsPerSecond,
        audioBitsPerSecond: this.options.audioBitsPerSecond
      });

      // 设置事件监听器
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedBlobs.push(event.data);
          if (this.options.onDataAvailable) {
            this.options.onDataAvailable(event.data);
          }
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedBlobs, { type: this.mediaRecorder!.mimeType });
        if (this.options.onStop) {
          this.options.onStop(blob);
        }
      };

      this.mediaRecorder.onerror = (error) => {
        console.error("Recording error:", error);
        this.isRecording = false;
        if (this.options.onError) {
          this.options.onError(error.error as Error);
        }
      };

      // 开始录制
      this.mediaRecorder.start(1000); // 每1秒获取一次数据
      this.isRecording = true;
      this.recordedBlobs = [];

      if (this.options.onStart) {
        this.options.onStart();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      this.isRecording = false;
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  // 停止录制
  public stopRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.mediaRecorder.stop();
  }

  // 暂停录制
  public pauseRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.mediaRecorder.pause();
  }

  // 恢复录制
  public resumeRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.mediaRecorder.resume();
  }

  // 检查是否正在录制
  public getIsRecording(): boolean {
    return this.isRecording;
  }

  // 获取录制状态
  public getRecordingState(): "inactive" | "recording" | "paused" | null {
    return this.mediaRecorder ? this.mediaRecorder.state : null;
  }

  // 保存录制文件
  public saveRecording(filename: string = `recording-${Date.now()}`): void {
    if (this.recordedBlobs.length === 0) return;

    const blob = new Blob(this.recordedBlobs, { type: this.mediaRecorder!.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `${filename}.${this.getFileExtension(blob.type)}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // 获取文件扩展名
  private getFileExtension(mimeType: string): string {
    const extensionMap: Record<string, string> = {
      "video/webm": "webm",
      "video/mp4": "mp4",
      "video/ogg": "ogg",
      "audio/webm": "webm",
      "audio/mp4": "mp4",
      "audio/ogg": "ogg",
      "audio/wav": "wav"
    };

    return extensionMap[mimeType] || "webm";
  }

  // 合并多个流进行录制
  public static mergeStreams(streams: MediaStream[]): MediaStream {
    const mergedStream = new MediaStream();

    // 将所有流的轨道添加到合并流
    streams.forEach(stream => {
      stream.getTracks().forEach(track => {
        mergedStream.addTrack(track);
      });
    });

    return mergedStream;
  }

  // 清理资源
  public dispose(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    this.mediaRecorder = null;
    this.recordedBlobs = [];
    this.isRecording = false;
  }
}

// 导出默认配置
const DEFAULT_RECORDING_OPTIONS: RecordingOptions = {
  mimeType: "video/webm;codecs=vp8",
  videoBitsPerSecond: 2500000, // 2.5 Mbps
  audioBitsPerSecond: 128000,   // 128 Kbps
  frameRate: 30
};

export { DEFAULT_RECORDING_OPTIONS };
