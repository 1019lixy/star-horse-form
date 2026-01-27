package com.starhorse.webrtc.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 发送一对一消息
     */
    @MessageMapping("/chat/private-message")
    public void sendPrivateMessage(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");
        String senderId = (String) payload.get("senderId");
        
        System.out.println("Received private message from: " + senderId + " to: " + targetUserId);
        System.out.println("Message content: " + payload.get("content"));
        
        if (targetUserId != null) {
            messagingTemplate.convertAndSend(String.format("/queue/user/%s/chat/messages",targetUserId), payload);

            System.out.println("Private message sent to: " + targetUserId);
        } else {
            System.out.println("Target user ID is null, message not sent");
        }
    }

    /**
     * 发送群聊消息
     */
    @MessageMapping("/chat/group-message")
    public void sendGroupMessage(@Payload Map<String, Object> payload) {
        String groupId = (String) payload.get("groupId");
        
        if (groupId != null) {
            // 发送给群组
            messagingTemplate.convertAndSend(
                    "/topic/chat/group/" + groupId, 
                    payload
            );
            System.out.println("Group message sent to: " + groupId);
        }
    }

    /**
     * 发送会议消息
     */
    @MessageMapping("/chat/meeting-message")
    public void sendMeetingMessage(@Payload Map<String, Object> payload) {
        String meetingId = (String) payload.get("meetingId");
        
        if (meetingId != null) {
            // 发送给会议所有参与者
            messagingTemplate.convertAndSend(
                    "/topic/chat/meeting/" + meetingId, 
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
                    "/topic/meeting/" + meetingId + "/participants", 
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
                    "/topic/meeting/" + meetingId + "/participants", 
                    payload
            );
            System.out.println("User left message broadcasted to meeting: " + meetingId);
        }
    }

}
