package com.starhorse.webrtc.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class WebRtcSignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    // 存储用户会话映射: userId -> sessionId
    private final Map<String, String> userSessionMap = new ConcurrentHashMap<>();

    // 存储会议中的用户: meetingId -> Set<userId>
    private final Map<String, Set<String>> meetingUsersMap = new ConcurrentHashMap<>();

    public WebRtcSignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 注册用户会话
     */
    @MessageMapping("/webrtc/register")
    public void registerUser(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String sessionId = (String) payload.get("sessionId");
        String meetingId = (String) payload.get("meetingId");

        if (userId != null && sessionId != null) {
            userSessionMap.put(userId, sessionId);
            System.out.println("User registered: " + userId + " with session: " + sessionId);

            // 如果提供了meetingId，将用户添加到会议中
            if (meetingId != null) {
                // 获取当前会议中已存在的用户列表
                Set<String> existingUsers = meetingUsersMap.get(meetingId);

                // 先通知已存在的用户：新用户即将加入
                if (existingUsers != null && !existingUsers.isEmpty()) {
                    notifyExistingUsers(meetingId, userId, existingUsers);
                }

                // 将新用户添加到会议中
                meetingUsersMap.computeIfAbsent(meetingId, k -> ConcurrentHashMap.newKeySet()).add(userId);
                System.out.println("User " + userId + " joined meeting: " + meetingId);

                // 通知新用户：会议中已有哪些用户
                if (existingUsers != null && !existingUsers.isEmpty()) {
                    notifyNewUserAboutExistingPeers(meetingId, userId, existingUsers);
                }
            }
        }
    }

    /**
     * 通知会议中已存在的用户，有新用户加入
     */
    private void notifyExistingUsers(String meetingId, String newUserId, Set<String> existingUsers) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "NEW_PEER_JOINED");
        notification.put("newUserId", newUserId);
        notification.put("meetingId", meetingId);

        // 通知所有已存在的用户
        for (String existingUserId : existingUsers) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/webrtc/peer-joined", existingUserId),
                    notification
            );
            System.out.println("Notified existing user " + existingUserId + " about new peer " + newUserId);
        }
    }

    /**
     * 通知新用户：会议中已存在哪些用户
     */
    private void notifyNewUserAboutExistingPeers(String meetingId, String newUserId, Set<String> existingUsers) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "EXISTING_PEERS");
        notification.put("meetingId", meetingId);
        notification.put("existingUserIds", existingUsers);

        messagingTemplate.convertAndSend(
                String.format("/queue/user/%s/webrtc/existing-peers", newUserId),
                notification
        );
        System.out.println("Notified new user " + newUserId + " about existing peers: " + existingUsers);
    }

    /**
     * 发送SDP提议
     */
    @MessageMapping("/webrtc/offer")
    public void sendOffer(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");

        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/queue/user/%s/webrtc/offer", targetUserId), payload);
            // 发送给目标用户
//            messagingTemplate.convertAndSendToUser(
//                    targetUserId,
//                    "/queue/webrtc/offer",
//                    payload
//            );
            System.out.println("Offer sent to: " + targetUserId);
        }
    }

    /**
     * 发送SDP应答
     */
    @MessageMapping("/webrtc/answer")
    public void sendAnswer(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");

        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/queue/user/%s/webrtc/answer", targetUserId), payload);
            // 发送给目标用户
//            messagingTemplate.convertAndSendToUser(
//                    targetUserId,
//                    "/queue/webrtc/answer",
//                    payload
//            );
            System.out.println("Answer sent to: " + targetUserId);
        }
    }

    /**
     * 发送ICE候选者
     */
    @MessageMapping("/webrtc/ice-candidate")
    public void sendIceCandidate(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");

        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/queue/user/%s/webrtc/ice-candidate", targetUserId), payload);
            // 发送给目标用户
//            messagingTemplate.convertAndSendToUser(
//                    targetUserId,
//                    "/queue/webrtc/ice-candidate",
//                    payload
//            );
            System.out.println("ICE candidate sent to: " + targetUserId);
        }
    }

    /**
     * 处理用户离开
     */
    @MessageMapping("/webrtc/leave")
    public void leaveSession(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String meetingId = (String) payload.get("meetingId");

        if (userId != null) {
            userSessionMap.remove(userId);
            System.out.println("User left: " + userId);
            // 从会议中移除用户
            if (meetingId != null) {
                Set<String> users = meetingUsersMap.get(meetingId);
                if (users != null) {
                    users.remove(userId);
                    System.out.println("User " + userId + " removed from meeting: " + meetingId);

                    // 如果会议中没有用户了，清理会议
                    if (users.isEmpty()) {
                        meetingUsersMap.remove(meetingId);
                        System.out.println("Meeting " + meetingId + " is now empty and removed");
                    }
                }
            }
            // 通知会议中的其他用户
            messagingTemplate.convertAndSend(
                    String.format("/topic/meeting/%s/participants", meetingId),
                    payload
            );
        }
    }

    @MessageMapping("/webrtc/end")
    public void handleMeetingEnd(@Payload Map<String, Object> payload) {
        String meetingId = (String) payload.get("meetingId");
        System.out.println("Meeting end operation start: " + meetingId);
        if (meetingId != null) {
            // 广播给会议所有参与者
            meetingUsersMap.remove(meetingId);
            System.out.println("Meeting end operation finish: " + meetingId);
        }
    }
}
