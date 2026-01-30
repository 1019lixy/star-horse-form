package com.starhorse.webrtc.server.controller;

import com.starhorse.devops.utils.utils.StarHorseUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@Slf4j
public class MeetingController {

    private final SimpMessagingTemplate messagingTemplate;

    // 存储用户会话映射: userId -> sessionId
    private final Map<String, String> userSessionMap = new ConcurrentHashMap<>();

    // 存储会议中的用户: meetingId -> Set<userId>
    private final Map<String, Set<String>> meetingUsersMap = new ConcurrentHashMap<>();

    public MeetingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 注册用户会话
     */
    @MessageMapping("/meeting/register")
    public void registerUser(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String sessionId = (String) payload.get("sessionId");
        String meetingId = (String) payload.get("meetingId");

        if (userId != null && sessionId != null) {
            userSessionMap.put(userId, sessionId);
            log.info("User registered: {} with session:{} " , userId, sessionId);

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
                log.info("User {} joined meeting: {} " , userId, meetingId);

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
        notification.put("type" , "NEW_PEER_JOINED");
        notification.put("newUserId" , newUserId);
        notification.put("meetingId" , meetingId);

        if (StarHorseUtils.notEmpty(existingUsers)) {
            for (String existingUser : existingUsers) {
                messagingTemplate.convertAndSend(
                        String.format("/meeting/%s/peer-joined" , existingUser),
                        notification
                );
            }
        }

    }

    /**
     * 通知新用户：会议中已存在哪些用户
     */
    private void notifyNewUserAboutExistingPeers(String meetingId, String newUserId, Set<String> existingUsers) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type" , "EXISTING_PEERS");
        notification.put("meetingId" , meetingId);
        notification.put("existingUserIds" , existingUsers);
        if (StarHorseUtils.notEmpty(existingUsers)) {
            for (String existingUser : existingUsers) {
                messagingTemplate.convertAndSend(
                        String.format("/meeting/%s/existing-peers" , existingUser),
                        notification
                );
            }

        }
        log.info("Notified new user {} about existing peers:{} " , newUserId, existingUsers);
    }

    /**
     * 发送SDP提议
     */
    @MessageMapping("/meeting/offer")
    public void sendOffer(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");

        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/meeting/%s/offer" , targetUserId), payload);
            log.info("Offer sent to: {}" , targetUserId);
        }
    }

    /**
     * 发送SDP应答
     */
    @MessageMapping("/meeting/answer")
    public void sendAnswer(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");

        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/meeting/%s/answer" , targetUserId), payload);
            log.info("Answer sent to:{} " , targetUserId);
        }
    }

    /**
     * 发送ICE候选者
     */
    @MessageMapping("/meeting/ice-candidate")
    public void sendIceCandidate(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");

        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/meeting/%s/ice-candidate" , targetUserId), payload);

            log.info("ICE candidate sent to: {}" , targetUserId);
        }
    }

    /**
     * 处理用户离开
     */
    @MessageMapping("/meeting/leave")
    public void leaveSession(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String meetingId = (String) payload.get("meetingId");

        if (userId != null) {
            userSessionMap.remove(userId);
            log.info("User left: {}" , userId);
            // 从会议中移除用户
            if (meetingId != null) {
                Set<String> users = meetingUsersMap.get(meetingId);
                if (users != null) {
                    users.remove(userId);
                    log.info("User {} removed from meeting: {} " , userId, meetingId);

                    // 如果会议中没有用户了，清理会议
                    if (users.isEmpty()) {
                        meetingUsersMap.remove(meetingId);
                        log.info("Meeting {} is now empty and removed" , meetingId);
                    }
                }
            }
            // 通知会议中的其他用户
            messagingTemplate.convertAndSend(
                    String.format("/meeting/%s/participants" , meetingId),
                    payload
            );
        }
    }

    @MessageMapping("/meeting/end")
    public void handleMeetingEnd(@Payload Map<String, Object> payload) {
        String meetingId = (String) payload.get("meetingId");
        log.info("Meeting end operation start: {}" , meetingId);
        if (meetingId != null) {
            // 广播给会议所有参与者
            meetingUsersMap.remove(meetingId);
            log.info("Meeting end operation finish: {}" , meetingId);
        }
    }

    /**
     * 发送会议消息
     */
    @MessageMapping("/meeting/message")
    public void sendMeetingMessage(@Payload Map<String, Object> payload) {
        String meetingId = (String) payload.get("meetingId");
        if (meetingId != null) {
            // 发送给会议所有参与者
            messagingTemplate.convertAndSend(
                    String.format("/meeting/%s/message" , meetingId),
                    payload
            );
            System.out.println("Meeting message sent to: " + meetingId);
        }
    }

    /**
     * 处理用户加入会议
     */
    @MessageMapping("/meeting/user-joined")
    public void handleUserJoined(@Payload Map<String, Object> payload) {
        String meetingId = (String) payload.get("meetingId");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");

        System.out.println("User joined meeting: " + userName + " (" + userId + ") in meeting " + meetingId);

        if (meetingId != null) {
            // 广播给会议所有参与者
            messagingTemplate.convertAndSend(
                    "/meeting/" + meetingId + "/participants" ,
                    payload
            );
            System.out.println("User joined message broadcasted to meeting: " + meetingId);
        }
    }

    /**
     * 处理用户离开会议
     */
    @MessageMapping("/meeting/user-left")
    public void handleUserLeft(@Payload Map<String, Object> payload) {
        String meetingId = (String) payload.get("meetingId");
        String userId = (String) payload.get("userId");
        String userName = (String) payload.get("userName");

        System.out.println("User left meeting: " + userName + " (" + userId + ") in meeting " + meetingId);

        if (meetingId != null) {
            // 广播给会议所有参与者
            messagingTemplate.convertAndSend(
                    "/meeting/" + meetingId + "/participants" ,
                    payload
            );
            System.out.println("User left message broadcasted to meeting: " + meetingId);
        }
    }
}
