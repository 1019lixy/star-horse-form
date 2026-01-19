package com.starhorse.webrtc.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;

@Controller
public class WebRtcSignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    // 存储用户会话映射
    private final Map<String, String> userSessionMap = new HashMap<>();

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
        
        if (userId != null && sessionId != null) {
            userSessionMap.put(userId, sessionId);
            System.out.println("User registered: " + userId + " with session: " + sessionId);
        }
    }

    /**
     * 发送SDP提议
     */
    @MessageMapping("/webrtc/offer")
    public void sendOffer(@Payload Map<String, Object> payload) {
        String targetUserId = (String) payload.get("targetUserId");
        
        if (targetUserId != null) {
            // 发送给目标用户
            messagingTemplate.convertAndSendToUser(
                    targetUserId, 
                    "/queue/webrtc/offer", 
                    payload
            );
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
            // 发送给目标用户
            messagingTemplate.convertAndSendToUser(
                    targetUserId, 
                    "/queue/webrtc/answer", 
                    payload
            );
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
            // 发送给目标用户
            messagingTemplate.convertAndSendToUser(
                    targetUserId, 
                    "/queue/webrtc/ice-candidate", 
                    payload
            );
            System.out.println("ICE candidate sent to: " + targetUserId);
        }
    }

    /**
     * 处理用户离开
     */
    @MessageMapping("/webrtc/leave")
    public void leaveSession(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        
        if (userId != null) {
            userSessionMap.remove(userId);
            System.out.println("User left: " + userId);
        }
    }
}
