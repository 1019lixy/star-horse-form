import {ref, Ref} from "vue";
import {WebRTCCore} from "@/utils/webrtc/webrtc-core";
import {MeetingSocketService} from "@/utils/websocket/MeetingSocketService";

// WebRTC连接配置接口
export interface WebRTCManagerOptions {
    webSocketService: Ref<MeetingSocketService | null>;
    isConnected: Ref<boolean>;
    currentUserId: Ref<string>;
    meetingInfo: Ref<any>;
    mediaManager: any; // 媒体管理器实例
}

// 远程流信息接口
export interface RemoteStreamInfo {
    stream: MediaStream;
    isScreenShare: boolean;
    senderId: string;
}

// WebRTC连接管理器
export const useWebRTCManager = (options: WebRTCManagerOptions) => {
    const {
        webSocketService,
        isConnected,
        currentUserId,
        meetingInfo,
        mediaManager
    } = options;

    // WebRTC实例
    const peerConnections = ref<Map<string, WebRTCCore>>(new Map());

    // 远程流管理
    const remoteStreams = ref<Map<string, RemoteStreamInfo>>(new Map());
    const remoteStreamElements = ref<Map<string, HTMLVideoElement>>(new Map());
    const participantStreams = ref<Map<string, string>>(new Map());

    // 当前本地流
    const currentAudioStream = ref<MediaStream | null>(null);
    const currentVideoStream = ref<MediaStream | null>(null);

    // 协商状态跟踪
    const negotiatingPeers = ref<Set<string>>(new Set());
    const lastOfferBySender = ref<Map<string, { isScreenShare: boolean; timestamp: number }>>(new Map());

    // ICE候选者队列
    const iceCandidateQueues = ref<Map<string, any[]>>(new Map());

    // 连接状态监控
    const connectionHealth = ref<Map<string, { lastAlive: number; retries: number }>>(new Map());

    // 网络质量监控
    const networkQuality = ref<Map<string, { bandwidth: number; packetLoss: number; latency: number }>>(new Map());

    // 自动重连配置
    const reconnectionConfig = {
        maxRetries: 5,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2
    };

    // 获取peer connection（使用唯一标识符）
    const getPeerConnection = (peerId: string, forceRecreate = false): WebRTCCore | null => {
        // 创建唯一的p2p标识符
        const p2pId = [currentUserId.value, peerId].sort().join("-");

        let pc = peerConnections.value.get(p2pId);

        // 如果强制重建或连接状态异常，则重建连接
        if (pc && !forceRecreate) {
            // 检查连接状态，如果处于失败状态则重建
            const connectionState = pc.getConnectionState();
            const iceState = pc.getIceConnectionState();

            // 检查连接状态，如果处于失败状态则重建
            if (connectionState === "failed" || connectionState === "disconnected" ||
                iceState === "failed" || iceState === "disconnected") {
                console.warn("Peer connection in bad state, recreating:", p2pId, "connection:", connectionState, "ice:", iceState);
                pc.close();
                peerConnections.value.delete(p2pId);
                connectionHealth.value.delete(p2pId);
                networkQuality.value.delete(p2pId);
                pc = null;
            } else {
                // 更新连接健康状态
                connectionHealth.value.set(p2pId, {
                    lastAlive: Date.now(),
                    retries: connectionHealth.value.get(p2pId)?.retries || 0
                });
                return pc as WebRTCCore;
            }
        }

        // 优化ICE服务器配置
        const iceServers = [
            {
                urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]
            },
            {
                urls: ["stun:stun.cloudflare.com:3478"]
            },
            {
                urls: ["stun:stun.ekiga.net"]
            }
        ];

        /**
         *  bundlePolicy?: RTCBundlePolicy;
         *     certificates?: RTCCertificate[];
         *     iceCandidatePoolSize?: number;
         *     iceServers?: RTCIceServer[];
         *     iceTransportPolicy?: RTCIceTransportPolicy;
         *     rtcpMuxPolicy?: RTCRtcpMuxPolicy;
         */
        pc = new WebRTCCore({
            peerConnectionConfig: {
                iceServers: iceServers,
                iceTransportPolicy: "all",
                bundlePolicy: "max-bundle",
                rtcpMuxPolicy: "require",
                iceCandidatePoolSize: 10
            },
            onConnectionStateChange: (state) => {
                console.log("Connection state (", p2pId, "):", state);

                // 更新连接健康状态
                if (state === "connected" || state === "connecting") {
                    connectionHealth.value.set(p2pId, {
                        lastAlive: Date.now(),
                        retries: 0
                    });
                } else if (state === "failed" || state === "disconnected") {
                    console.warn("Peer connection failed/disconnected:", p2pId);
                    handleConnectionFailure(peerId, p2pId);
                }
            },
            onIceConnectionStateChange: (state) => {
                console.log("ICE connection state (", p2pId, "):", state);

                if (state === "failed" || state === "disconnected") {
                    console.warn("ICE connection failed/disconnected:", p2pId);
                    handleConnectionFailure(peerId, p2pId);
                }
            },
            onIceGatheringStateChange: (state) => {
                console.log("ICE gathering state (", p2pId, "):", state);
            },
            onSignalingStateChange: (state) => {
                console.log("Signaling state (", p2pId, "):", state);
            },
            onIceCandidate: (candidate) => {
                if (webSocketService.value && isConnected.value && webSocketService.value.isWebRtcConnected()) {
                    try {
                        webSocketService.value.sendIceCandidate({
                            senderId: currentUserId.value,
                            targetUserId: peerId,
                            candidate: candidate
                        });
                    } catch (error) {
                        console.error("Error sending ICE candidate:", error);
                    }
                }
            },
            onTrack: (event) => {
                if (event.streams && event.streams.length > 0) {
                    console.log("Received track event for peer:", peerId, "streams:", event.streams.length);
                    event.streams.forEach(stream => {
                        console.log("Processing stream:", stream.id, "tracks:", stream.getTracks().length);
                        handleRemoteStream(peerId, stream);
                    });
                }
            },
            onDataChannel: (channel) => {
                console.log("Data channel opened:", channel.label);
                // 可以用于传输文本消息、文件等
                channel.onmessage = (event) => {
                    console.log("Data channel message:", event.data);
                };
                channel.onopen = () => {
                    console.log("Data channel opened:", channel.label);
                };
                channel.onclose = () => {
                    console.log("Data channel closed:", channel.label);
                };
                channel.onerror = (error) => {
                    console.error("Data channel error:", error);
                };
            }
        });

        peerConnections.value.set(p2pId, pc);
        connectionHealth.value.set(p2pId, {
            lastAlive: Date.now(),
            retries: 0
        });

        updatePeerTracks(peerId);

        // 定期检查连接健康状态
        startConnectionHealthCheck(p2pId, peerId);

        return pc as WebRTCCore;
    };

    // 更新peer的tracks
    const updatePeerTracks = (peerId: string) => {
        const p2pId = [currentUserId.value, peerId].sort().join("-");
        const pc = peerConnections.value.get(p2pId);
        if (!pc) return;

        const audioTrack = mediaManager.currentAudioStream.value?.getAudioTracks()[0] || null;
        const videoTrack = mediaManager.currentVideoStream.value?.getVideoTracks()[0] || null;
        const screenShareTrack = mediaManager.currentScreenShareStream.value?.getVideoTracks()[0] || null;

        // 优先使用屏幕共享轨道，如果没有屏幕共享则使用视频轨道
        const activeVideoTrack = screenShareTrack || videoTrack;
        const activeStream = mediaManager.currentScreenShareStream.value || mediaManager.currentVideoStream.value || undefined;

        pc.replaceTrack("audio", audioTrack, mediaManager.currentAudioStream.value || undefined);
        pc.replaceTrack("video", activeVideoTrack, activeStream);

        console.log("更新peer tracks完成，peerId:", peerId, "屏幕共享:", !!screenShareTrack, "视频:", !!videoTrack, "音频:", !!audioTrack);
    };

    // 更新所有peer的tracks
    const updateAllPeerTracks = () => {
        peerConnections.value.forEach((pc, p2pId) => {
            if (pc) {
                // 从p2pId中提取目标参与者的ID
                const ids = p2pId.split("-");
                const targetPeerId = ids[0] === currentUserId.value ? ids[1] : ids[0];
                updatePeerTracks(targetPeerId);
            }
        });
    };

    // 处理远程流
    const handleRemoteStream = (peerId: string, stream: MediaStream) => {
        console.log("Received remote stream:", stream.id, "from:", peerId);
        console.log("Stream tracks:", stream.getTracks().map(t => t.kind + ":" + t.label));

        let isScreenShare = false;
        const offerInfo = lastOfferBySender.value.get(peerId);
        const signalingIsScreenShare = offerInfo ? offerInfo.isScreenShare : null;

        // 修复：无论收到什么类型的流，都清理对应发送者的旧流
        // 避免状态累积导致第三次操作失败
        if (signalingIsScreenShare !== null) {
            // 清理对应发送者的所有流（视频或屏幕共享）
            clearStreamsBySender(peerId, signalingIsScreenShare);
        }

        if (signalingIsScreenShare === null) {
            isScreenShare = stream.getVideoTracks().some(track => {
                const trackLabel = track.label.toLowerCase();
                return track.kind === "video" && (
                    trackLabel.includes("screen") ||
                    trackLabel.includes("display") ||
                    trackLabel.includes("desktop") ||
                    trackLabel.includes("共享") ||
                    trackLabel.includes("presentation")
                );
            });

            if (!isScreenShare && stream.getVideoTracks().length > 0) {
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack.getSettings) {
                    const settings = videoTrack.getSettings();
                    if (settings.width && settings.height) {
                        const aspectRatio = settings.width / settings.height;
                        if (aspectRatio > 1.7 || aspectRatio < 1.4) {
                            isScreenShare = true;
                        }
                    }
                }
            }

            if (!isScreenShare && stream.getVideoTracks().length > 0) {
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack.getSettings) {
                    const settings = videoTrack.getSettings();
                    if (settings.frameRate && settings.frameRate < 15) {
                        isScreenShare = true;
                    }
                }
            }

            if (!isScreenShare && stream.getVideoTracks().length > 0) {
                const videoTrack = stream.getVideoTracks()[0];
                if (videoTrack.getSettings) {
                    const settings = videoTrack.getSettings();
                    if (settings.width && settings.height) {
                        const resolution = settings.width * settings.height;
                        if (resolution > 1920 * 1080) {
                            isScreenShare = true;
                        }
                    }
                }
            }
        }

        if (signalingIsScreenShare !== null) {
            isScreenShare = signalingIsScreenShare;
        }

        if (remoteStreams.value.has(stream.id)) {
            remoteStreams.value.set(stream.id, {stream, isScreenShare, senderId: peerId});
            const videoElement = remoteStreamElements.value.get(stream.id);
            if (videoElement) {
                videoElement.srcObject = stream;
            }
        } else {
            remoteStreams.value.set(stream.id, {stream, isScreenShare, senderId: peerId});
        }

        stream.getTracks().forEach(track => {
            track.onended = () => {
                const hasActiveTracks = stream.getTracks().some(t => t.readyState === "live");
                if (!hasActiveTracks) {
                    const streamInfo = remoteStreams.value.get(stream.id);
                    remoteStreams.value.delete(stream.id);
                    remoteStreamElements.value.delete(stream.id);
                    participantStreams.value.forEach((streamId, participantId) => {
                        if (streamId === stream.id) {
                            participantStreams.value.delete(participantId);
                        }
                    });
                }
            };
        });
    };

    // 清理指定发送者的所有流（视频或屏幕共享）
    const clearStreamsBySender = (senderId: string, isScreenShare: boolean) => {
        let cleared = false;
        remoteStreams.value.forEach((streamInfo, streamId) => {
            // 清理对应发送者的所有匹配类型的流
            if (streamInfo.senderId === senderId && streamInfo.isScreenShare === isScreenShare) {
                console.log("Clearing stream for sender:", senderId, "stream:", streamId, "isScreenShare:", isScreenShare);
                remoteStreams.value.delete(streamId);
                remoteStreamElements.value.delete(streamId);
                participantStreams.value.forEach((mappedStreamId, participantId) => {
                    if (mappedStreamId === streamId) {
                        participantStreams.value.delete(participantId);
                    }
                });
                cleared = true;
            }
        });
        if (cleared) {
            console.log("Streams cleared for sender:", senderId, "type:", isScreenShare ? "screen share" : "video");
        }
    };

    // 清理指定发送者的屏幕共享流（保持向后兼容）
    const clearScreenShareBySender = (senderId: string) => {
        clearStreamsBySender(senderId, true);
    };

    // 创建offer并等待稳定状态
    const createOfferWhenStable = (peerId: string, callback: (offer: any) => void, isRetry = false) => {
        const pc = getPeerConnection(peerId);
        if (!pc) return;

        // 修复：只有在非重试模式下才检查negotiatingPeers
        // 避免竞态条件导致第三次操作失败
        if (!isRetry && negotiatingPeers.value.has(peerId)) {
            console.warn("Negotiation in progress, but forcing retry for:", peerId);
            // 不直接返回，而是延迟重试
            setTimeout(() => createOfferWhenStable(peerId, callback, true), 100);
            return;
        }

        const state = pc.getSignalingState?.();
        if (state && state !== "stable") {
            console.warn("Signaling not stable:", state, "retrying...");
            setTimeout(() => createOfferWhenStable(peerId, callback, true), 200);
            return;
        }

        // 只有在非重试模式下才添加negotiatingPeers
        if (!isRetry) {
            negotiatingPeers.value.add(peerId);
        }

        pc.createOffer().then((offer) => {
            callback(offer);
        }).catch((error) => {
            console.error("Error creating offer:", error);
        }).finally(() => {
            negotiatingPeers.value.delete(peerId);
        });
    };

    // 发送offer给单个参与者
    const sendOfferToParticipant = (peerId: string, isScreenShare: boolean) => {
        console.log("=== 开始发送offer给参与者 ===");
        console.log("目标参与者:", peerId, "屏幕共享:", isScreenShare);
        console.log("WebSocket服务状态:", webSocketService.value ? "存在" : "不存在");
        console.log("连接状态:", isConnected.value ? "已连接" : "未连接");

        if (!webSocketService.value) {
            console.error("WebSocket服务不存在，无法发送offer");
            return;
        }

        // 修复：检查WebSocket连接状态并确保连接稳定
        const ensureWebSocketConnected = async (): Promise<boolean> => {
            if (isConnected.value) {
                return true;
            }

            console.warn("WebSocket连接已断开，尝试重新连接");

            try {
                const connected = await webSocketService.value.connect();
                if (connected) {
                    isConnected.value = true;
                    console.log("WebSocket重新连接成功");

                    // 重新注册用户
                    webSocketService.value?.registerUser(currentUserId.value, "session_" + Date.now(), meetingInfo.value.id);

                    // 等待连接稳定
                    await new Promise(resolve => setTimeout(resolve, 300));
                    return true;
                }
            } catch (error) {
                console.error("WebSocket重新连接失败:", error);
            }

            return false;
        };

        createOfferWhenStable(peerId, async (offer) => {
            console.log("=== 准备发送WebRTC offer ===");
            console.log("目标参与者:", peerId, "屏幕共享:", isScreenShare);
            console.log("offer类型:", offer.type);

            // 确保WebSocket连接稳定
            const isStable = await ensureWebSocketConnected();
            if (!isStable) {
                console.error("WebSocket连接不稳定，无法发送offer");
                return;
            }

            console.log("WebRTC连接状态:", webSocketService.value?.isConnected() ? "已连接" : "未连接");

            try {
                webSocketService.value?.sendWebRtcOffer({
                    senderId: currentUserId.value,
                    targetUserId: peerId, // 提议应该发送给对应的peer
                    offer: offer,
                    isScreenShare: isScreenShare
                });

                console.log("=== WebRTC offer发送完成 ===");

                // 发送后立即检查连接状态，如果断开则尝试重连
                setTimeout(() => {
                    if (!isConnected.value) {
                        console.warn("WebSocket在发送offer后断开，尝试保持连接");
                        ensureWebSocketConnected();
                    }
                }, 100);

            } catch (error) {
                console.error("发送WebRTC offer失败:", error);
            }
        });
    };

    // 发送offer给所有在线参与者
    const sendOfferToAllParticipants = (isScreenShare: boolean) => {
        console.log("=== 开始发送offer给所有参与者 ===");
        console.log("屏幕共享:", isScreenShare);

        // 注意：参与者列表需要从外部传入
        console.warn("参与者列表需要从外部传入，当前无法发送offer");
    };

    // 处理接收到的ICE候选者
    const handleIncomingIceCandidate = (message: any) => {
        try {
            console.log("接收到ICE候选者:", message);
            const peerId = message.senderId;
            if (!peerId) {
                console.warn("ICE candidate missing senderId");
                return;
            }

            // 创建唯一的p2p标识符
            const p2pId = [currentUserId.value, peerId].sort().join("-");
            const pc = peerConnections.value.get(p2pId);

            // 检查远程描述是否已设置
            // 检查远程描述是否已设置，通过检查信令状态来判断
            const signalingState = pc.getSignalingState();
            if (signalingState && signalingState !== "stable") {
                // 远程描述已设置，直接添加ICE候选者
                console.log("远程描述已设置，直接添加ICE候选者");
                pc.addIceCandidate(message.candidate);
            } else {
                // 远程描述未设置，将ICE候选者加入队列
                console.log("远程描述未设置，将ICE候选者加入队列");
                if (!iceCandidateQueues.value.has(p2pId)) {
                    iceCandidateQueues.value.set(p2pId, []);
                }
                iceCandidateQueues.value.get(p2pId)!.push(message.candidate);
            }
        } catch (error) {
            console.error("处理ICE候选者失败:", error);
        }
    };

    // 处理ICE候选者队列（在远程描述设置后调用）
    const processIceCandidateQueue = (peerId: string) => {
        // 创建唯一的p2p标识符
        const p2pId = [currentUserId.value, peerId].sort().join("-");
        const queue = iceCandidateQueues.value.get(p2pId);
        if (!queue || queue.length === 0) return;

        console.log("处理ICE候选者队列，p2pId:", p2pId, "队列长度:", queue.length);

        const pc = peerConnections.value.get(p2pId);
        queue.forEach(async (candidate) => {
            try {
                await pc.addIceCandidate(candidate);
                console.log("队列中的ICE候选者添加成功");
            } catch (error) {
                console.error("处理队列中的ICE候选者失败:", error);
            }
        });

        // 清空队列
        iceCandidateQueues.value.set(p2pId, []);
    };

    // 处理WebRTC提议
    const handleIncomingWebRtcOffer = async (message: any) => {
        try {
            console.log("接收到WebRTC提议:", message);
            const peerId = message.senderId;
            if (!peerId) {
                console.warn("WebRTC offer missing senderId");
                return;
            }

            // 创建唯一的p2p标识符
            const p2pId = [currentUserId.value, peerId].sort().join("-");
            const pc = peerConnections.value.get(p2pId) || getPeerConnection(peerId);
            if (!pc || !webSocketService.value) return;

            try {
                console.log("开始处理WebRTC提议，目标用户ID:", peerId, "屏幕共享:", message.isScreenShare);
                const state = pc.getSignalingState?.();
                if (state && state !== "stable") {
                    console.warn("Signaling not stable when receiving offer, rolling back:", state);
                    await pc.rollbackLocalDescription?.();
                }

                await pc.setRemoteDescription(message.offer);
                console.log("SDP提议处理成功，正在创建应答...");
                const answer = await pc.createAnswer();
                console.log("应答创建成功，正在发送...");

                // 记录最近一次Offer，用于后续流类型匹配
                console.log("记录最新Offer信息:", message.senderId, "屏幕共享:", message.isScreenShare);
                lastOfferBySender.value.set(message.senderId, {
                    isScreenShare: !!message.isScreenShare,
                    timestamp: Date.now()
                });

                // 发送answer，保留屏幕共享标记
                webSocketService.value.sendWebRtcAnswer({
                    senderId: currentUserId.value,
                    targetUserId: message.senderId, // 应答应该发送给提议的发送者
                    answer: answer,
                    isScreenShare: message.isScreenShare || false
                });
                console.log("WebRTC应答已发送，目标用户ID:", message.senderId, "屏幕共享:", message.isScreenShare);
            } catch (error) {
                console.error("处理WebRTC提议失败:", error);
            }
        } catch (error) {
            console.error("处理WebRTC提议失败:", error);
        }
    };

    // 处理WebRTC应答
    const handleIncomingWebRtcAnswer = (message: any) => {
        try {
            console.log("接收到WebRTC应答:", message);
            const peerId = message.senderId;
            if (!peerId) {
                console.warn("WebRTC answer missing senderId");
                return;
            }
            const pc = getPeerConnection(peerId);
            pc.setRemoteDescription(message.answer).then(() => {
                console.log("WebRTC answer handled successfully for:", peerId);

                // 远程描述设置成功后，处理该peer的ICE候选者队列
                console.log("远程描述设置完成，处理ICE候选者队列");
                processIceCandidateQueue(peerId);

            }).catch((error) => {
                console.error("Error handling WebRTC answer:", error);
            });
        } catch (error) {
            console.error("处理WebRTC应答失败:", error);
        }
    };

    // 重建所有peer connection
    const recreateAllPeerConnections = () => {
        console.log("强制重建所有peer connection");

        // 关闭所有现有连接
        peerConnections.value.forEach(pc => pc.close());
        peerConnections.value.clear();

        // 清空远程流
        remoteStreams.value.clear();
        remoteStreamElements.value.clear();
        participantStreams.value.clear();

        // 重置协商状态
        negotiatingPeers.value.clear();
        lastOfferBySender.value.clear();

        console.log("所有peer connection已重建");
    };

    // 停止所有WebRTC相关功能
    const stopAllWebRTC = () => {
        // 关闭WebRTC连接
        peerConnections.value.forEach(pc => pc.close());
        peerConnections.value.clear();
    };

    // 处理连接失败
    const handleConnectionFailure = (peerId: string, p2pId: string) => {
        console.warn("Handling connection failure for:", p2pId);

        const health = connectionHealth.value.get(p2pId);
        const retries = health?.retries || 0;

        if (retries < reconnectionConfig.maxRetries) {
            // 计算重试延迟（指数退避）
            const delay = Math.min(
                reconnectionConfig.initialDelay * Math.pow(reconnectionConfig.backoffFactor, retries),
                reconnectionConfig.maxDelay
            );

            console.log(`Scheduling reconnection attempt ${retries + 1}/${reconnectionConfig.maxRetries} in ${delay}ms`);

            setTimeout(() => {
                console.log(`Attempting to reconnect to ${peerId}`);

                // 重建连接
                const pc = getPeerConnection(peerId, true);
                if (pc) {
                    // 更新重试计数
                    connectionHealth.value.set(p2pId, {
                        lastAlive: Date.now(),
                        retries: retries + 1
                    });

                    // 发送offer以重新建立连接
                    sendOfferToParticipant(peerId, false);
                }
            }, delay);
        } else {
            console.error(`Max reconnection attempts (${reconnectionConfig.maxRetries}) reached for ${p2pId}`);
            connectionHealth.value.delete(p2pId);
        }
    };

    // 定期检查连接健康状态
    const startConnectionHealthCheck = (p2pId: string, peerId: string) => {
        const checkInterval = setInterval(() => {
            const health = connectionHealth.value.get(p2pId);
            if (!health) {
                clearInterval(checkInterval);
                return;
            }

            const now = Date.now();
            const timeSinceLastAlive = now - health.lastAlive;

            // 如果超过30秒没有活动，认为连接可能已断开
            if (timeSinceLastAlive > 30000) {
                console.warn(`Connection ${p2pId} appears to be inactive for ${timeSinceLastAlive}ms, checking state`);

                const pc = peerConnections.value.get(p2pId);
                if (pc) {
                    const connectionState = pc.getConnectionState();
                    const iceState = pc.getIceConnectionState();

                    console.log(`Connection state check: ${connectionState}, ICE state: ${iceState}`);

                    if (connectionState === "failed" || connectionState === "disconnected" ||
                        iceState === "failed" || iceState === "disconnected") {
                        console.warn(`Connection ${p2pId} is indeed disconnected, initiating reconnect`);
                        handleConnectionFailure(peerId, p2pId);
                    } else {
                        // 更新连接健康状态
                        connectionHealth.value.set(p2pId, {
                            lastAlive: now,
                            retries: health.retries
                        });
                    }
                }
            }
        }, 15000); // 每15秒检查一次
    };

    // 优化媒体流处理
    const optimizeMediaStreams = () => {
        // 根据网络状况调整视频质量
        const adjustVideoQuality = (bandwidth: number) => {
            if (bandwidth < 500) {
                // 低带宽：降低视频质量
                console.log("Low bandwidth detected, reducing video quality");
                // 这里可以通过mediaManager调整视频分辨率和帧率
            } else if (bandwidth > 2000) {
                // 高带宽：提高视频质量
                console.log("High bandwidth detected, increasing video quality");
                // 这里可以通过mediaManager提高视频分辨率和帧率
            }
        };

        // 监控网络质量
        const monitorNetworkQuality = () => {
            // 这里可以实现网络质量监控逻辑
            // 例如，通过定期发送小数据包并测量往返时间
        };

        monitorNetworkQuality();
    };

    // 增强的发送offer函数
    const enhancedSendOfferToParticipant = async (peerId: string, isScreenShare: boolean) => {
        try {
            // 确保媒体流已准备就绪
            if (mediaManager && (!mediaManager.currentAudioStream.value || !mediaManager.currentVideoStream.value)) {
                console.log("Media streams not ready, waiting...");
                await new Promise(resolve => {
                    const checkInterval = setInterval(() => {
                        if (mediaManager.currentAudioStream.value && mediaManager.currentVideoStream.value) {
                            clearInterval(checkInterval);
                            resolve(null);
                        }
                    }, 500);
                });
            }

            // 发送offer
            sendOfferToParticipant(peerId, isScreenShare);
        } catch (error) {
            console.error("Error in enhanced send offer:", error);
        }
    };

    // 批量发送offer给多个参与者
    const batchSendOfferToParticipants = (peerIds: string[], isScreenShare: boolean) => {
        peerIds.forEach((peerId, index) => {
            // 错开发送时间，避免同时处理多个offer
            setTimeout(() => {
                enhancedSendOfferToParticipant(peerId, isScreenShare);
            }, index * 200);
        });
    };

    // 清理资源
    const cleanupWebRTC = () => {
        stopAllWebRTC();
        connectionHealth.value.clear();
        networkQuality.value.clear();
    };

    // 初始化
    const initializeWebRTC = () => {
        console.log("Initializing WebRTC manager");
        optimizeMediaStreams();
    };

    return {
        // 状态
        peerConnections,
        remoteStreams,
        remoteStreamElements,
        participantStreams,
        currentAudioStream,
        currentVideoStream,
        connectionHealth,
        networkQuality,

        // 方法
        getPeerConnection,
        updatePeerTracks,
        updateAllPeerTracks,
        handleRemoteStream,
        clearStreamsBySender,
        clearScreenShareBySender,
        sendOfferToParticipant,
        enhancedSendOfferToParticipant,
        batchSendOfferToParticipants,
        sendOfferToAllParticipants,
        handleIncomingIceCandidate,
        handleIncomingWebRtcOffer,
        handleIncomingWebRtcAnswer,
        recreateAllPeerConnections,
        stopAllWebRTC,
        cleanupWebRTC,
        initializeWebRTC
    };
};
