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
        System.out.println("Message type: " + payload.get("type"));
        
        if (targetUserId != null) {
            payload.put("messageType", "private");
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
            payload.put("messageType", "group");
            // 发送给群组
            messagingTemplate.convertAndSend(
                    "/topic/chat/group/" + groupId, 
                    payload
            );
            System.out.println("Group message sent to: " + groupId);
        }
    }

    /**
     * 发送通话邀请
     */
    @MessageMapping("/chat/call-offer")
    public void sendCallOffer(@Payload Map<String, Object> payload) {
        String targetId = (String) payload.get("targetId");
        String callerId = (String) payload.get("callerId");
        
        System.out.println("Received call offer from: " + callerId + " to: " + targetId);
        
        if (targetId != null) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/chat/call-offer", targetId), 
                    payload
            );
            System.out.println("Call offer sent to: " + targetId);
        }
    }

    /**
     * 发送通话应答
     */
    @MessageMapping("/chat/call-answer")
    public void sendCallAnswer(@Payload Map<String, Object> payload) {
        String callerId = (String) payload.get("callerId");
        
        System.out.println("Received call answer from: " + callerId);
        
        if (callerId != null) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/chat/call-answer", callerId), 
                    payload
            );
            System.out.println("Call answer sent to: " + callerId);
        }
    }

    /**
     * 拒绝通话
     */
    @MessageMapping("/chat/call-reject")
    public void sendCallReject(@Payload Map<String, Object> payload) {
        String callerId = (String) payload.get("callerId");
        
        System.out.println("Received call reject from: " + callerId);
        
        if (callerId != null) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/chat/call-reject", callerId), 
                    payload
            );
            System.out.println("Call reject sent to: " + callerId);
        }
    }

    /**
     * 结束通话
     */
    @MessageMapping("/chat/call-end")
    public void sendCallEnd(@Payload Map<String, Object> payload) {
        String targetId = (String) payload.get("targetId");
        String callerId = (String) payload.get("callerId");
        
        System.out.println("Received call end from: " + callerId + " to: " + targetId);
        
        if (targetId != null) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/chat/call-end", targetId), 
                    payload
            );
            System.out.println("Call end sent to: " + targetId);
        }
    }

    /**
     * 发送 ICE 候选
     */
    @MessageMapping("/chat/ice-candidate")
    public void sendIceCandidate(@Payload Map<String, Object> payload) {
        String targetId = (String) payload.get("targetId");
        String callerId = (String) payload.get("callerId");
        
        System.out.println("Received ICE candidate from: " + callerId + " to: " + targetId);
        
        if (targetId != null) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/chat/ice-candidate", targetId), 
                    payload
            );
            System.out.println("ICE candidate sent to: " + targetId);
        }
    }

}
