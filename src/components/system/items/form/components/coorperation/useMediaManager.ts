import {ref} from "vue";
import {DEFAULT_VIDEO_CONSTRAINTS, VideoManager} from "@/utils/webrtc/video-manager";
import {AudioManager, DEFAULT_AUDIO_CONSTRAINTS} from "@/utils/webrtc/audio-manager";
import {DEFAULT_RECORDING_OPTIONS, RecordingManager} from "@/utils/webrtc/recording-manager";
import {ScreenShareManager} from "@/utils/webrtc/screen-share-manager";

// 媒体流管理配置接口
export interface MediaManagerOptions {
    // 可以添加需要的配置项
}

// 媒体流管理器
export const useMediaManager = (options: MediaManagerOptions = {}) => {
    // 媒体管理器实例
    const videoManager = ref<VideoManager | null>(null);
    const audioManager = ref<AudioManager | null>(null);
    const recordingManager = ref<RecordingManager | null>(null);
    const screenShareManager = ref<ScreenShareManager | null>(null);

    // 媒体状态
    const isAudioEnabled = ref(false);
    const isVideoEnabled = ref(false);
    const isRecording = ref(false);
    const isScreenSharing = ref(false);

    // 当前媒体流
    const currentAudioStream = ref<MediaStream | null>(null);
    const currentVideoStream = ref<MediaStream | null>(null);
    const currentScreenShareStream = ref<MediaStream | null>(null);

    // 初始化媒体管理器
    const initializeMediaManagers = () => {
        // 初始化视频管理器
        videoManager.value = new VideoManager({
            defaultConstraints: DEFAULT_VIDEO_CONSTRAINTS,
            onStreamAcquired: (stream) => {
                console.log("视频流获取成功");
                currentVideoStream.value = stream;
                isVideoEnabled.value = true;
            },
            onStreamStopped: () => {
                console.log("视频流已停止");
                currentVideoStream.value = null;
                isVideoEnabled.value = false;
            }
        });

        // 初始化音频管理器
        audioManager.value = new AudioManager({
            defaultConstraints: DEFAULT_AUDIO_CONSTRAINTS,
            onStreamAcquired: (stream) => {
                console.log("音频流获取成功");
                currentAudioStream.value = stream;
                isAudioEnabled.value = true;
            },
            onStreamStopped: () => {
                console.log("音频流已停止");
                currentAudioStream.value = null;
                isAudioEnabled.value = false;
            }
        });

        // 初始化录制管理器
        recordingManager.value = new RecordingManager({
            ...DEFAULT_RECORDING_OPTIONS,
            onStart: () => {
                console.log("录制已开始");
                isRecording.value = true;
            },
            onStop: (blob) => {
                console.log("录制已停止");
                isRecording.value = false;
                // 可以在这里处理录制文件
                if (blob) {
                    console.log("录制文件大小:", blob.size);
                }
            }
        });

        // 初始化屏幕共享管理器
        screenShareManager.value = new ScreenShareManager({
            onStreamAcquired: (stream) => {
                console.log("屏幕共享流获取成功:", stream.id);
                console.log("Stream tracks:", stream.getTracks().map(t => t.kind + ":" + t.label));
                currentScreenShareStream.value = stream;
                isScreenSharing.value = true;
            },
            onStreamStopped: () => {
                console.log("屏幕共享流已停止");
                currentScreenShareStream.value = null;
                isScreenSharing.value = false;
            }
        });

        console.log("所有媒体管理器已初始化");
    };

    // 切换音频
    const toggleAudio = async () => {
        if (!audioManager.value) return;

        if (isAudioEnabled.value) {
            // 关闭音频
            audioManager.value.stopStream();
        } else {
            // 开启音频
            try {
                await audioManager.value.getMicrophoneStream();
            } catch (error) {
                console.error("Error starting audio:", error);
            }
        }
    };

    // 切换视频
    const toggleVideo = async () => {
        if (!videoManager.value) return;

        if (isVideoEnabled.value) {
            // 关闭视频
            videoManager.value.stopStream();
        } else {
            // 开启视频
            try {
                await videoManager.value.getCameraStream();
            } catch (error) {
                console.error("Error starting video:", error);
            }
        }
    };

    // 切换屏幕共享
    const toggleScreenShare = async () => {
        if (!screenShareManager.value) return;

        if (isScreenSharing.value) {
            // 停止屏幕共享
            screenShareManager.value.stopScreenShare();
        } else {
            // 开始屏幕共享
            try {
                await screenShareManager.value.startScreenShare();
            } catch (error) {
                console.error("Error starting screen share:", error);
            }
        }
    };

    // 切换录制
    const toggleRecording = async () => {
        if (!recordingManager.value) return;

        if (isRecording.value) {
            // 停止录制
            recordingManager.value.stopRecording();
        } else {
            // 开始录制
            try {
                // 获取当前所有媒体流进行录制
                // 需要合并多个流到一个流中，或者选择一个主要的流进行录制
                let streamToRecord: MediaStream | null = null;

                // 优先选择屏幕共享流，然后是视频流，最后是音频流
                if (currentScreenShareStream.value) {
                    streamToRecord = currentScreenShareStream.value;
                } else if (currentVideoStream.value) {
                    streamToRecord = currentVideoStream.value;
                } else if (currentAudioStream.value) {
                    streamToRecord = currentAudioStream.value;
                }

                if (streamToRecord) {
                    recordingManager.value.startRecording(streamToRecord);
                } else {
                    console.warn("没有可用的媒体流进行录制");
                }
            } catch (error) {
                console.error("Error starting recording:", error);
            }
        }
    };

    // 获取当前所有媒体流
    const getAllMediaStreams = (): MediaStream[] => {
        const streams: MediaStream[] = [];
        if (currentAudioStream.value) streams.push(currentAudioStream.value);
        if (currentVideoStream.value) streams.push(currentVideoStream.value);
        if (currentScreenShareStream.value) streams.push(currentScreenShareStream.value);
        return streams;
    };

    // 绑定媒体流到视频元素
    const bindStreamToVideoElement = (stream: MediaStream, videoElement: HTMLVideoElement) => {
        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play().catch(error => {
                console.error("Error playing video:", error);
            });
        }
    };

    // 停止所有媒体流
    const stopAllMedia = () => {
        if (audioManager.value) {
            audioManager.value.stopStream();
        }
        if (videoManager.value) {
            videoManager.value.stopStream();
        }
        if (screenShareManager.value) {
            screenShareManager.value.stopScreenShare();
        }
        if (recordingManager.value && isRecording.value) {
            recordingManager.value.stopRecording();
        }

        // 重置状态
        isAudioEnabled.value = false;
        isVideoEnabled.value = false;
        isScreenSharing.value = false;
        isRecording.value = false;

        currentAudioStream.value = null;
        currentVideoStream.value = null;
        currentScreenShareStream.value = null;

        console.log("所有媒体流已停止");
    };

    // 清理媒体管理器
    const cleanupMediaManager = () => {
        stopAllMedia();

        videoManager.value = null;
        audioManager.value = null;
        recordingManager.value = null;
        screenShareManager.value = null;
    };

    return {
        // 管理器实例
        videoManager,
        audioManager,
        recordingManager,
        screenShareManager,

        // 状态
        isAudioEnabled,
        isVideoEnabled,
        isRecording,
        isScreenSharing,

        // 媒体流
        currentAudioStream,
        currentVideoStream,
        currentScreenShareStream,

        // 方法
        initializeMediaManagers,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        toggleRecording,
        getAllMediaStreams,
        bindStreamToVideoElement,
        stopAllMedia,
        cleanupMediaManager
    };
};
