package com.starhorse.webrtc.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 配置消息代理，用于广播消息和用户消息
        config.enableSimpleBroker("/topic", "/queue");
        // 配置用户消息前缀
        config.setUserDestinationPrefix("/user");
        // 配置应用前缀，用于处理客户端发送的消息
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册WebSocket端点，支持SockJS备用
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // 注册WebRTC信令端点
        registry.addEndpoint("/ws/webrtc")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}