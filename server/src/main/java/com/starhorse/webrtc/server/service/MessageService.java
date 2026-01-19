package com.starhorse.webrtc.server.service;

import com.starhorse.webrtc.server.model.Message;

import java.util.List;

public interface MessageService {

    /**
     * 创建消息
     */
    Message createMessage(Message message);

    /**
     * 根据messageId查找消息
     */
    Message findByMessageId(String messageId);

    /**
     * 查找两个用户之间的聊天消息
     */
    List<Message> findChatMessages(String userId1, String userId2, int limit, int offset);

    /**
     * 查找群聊消息
     */
    List<Message> findGroupMessages(String groupId, int limit, int offset);

    /**
     * 查找会议消息
     */
    List<Message> findMeetingMessages(String meetingId, int limit, int offset);

    /**
     * 查找用户的未读消息
     */
    List<Message> findUnreadMessages(String userId);

    /**
     * 统计用户的未读消息数量
     */
    long countUnreadMessages(String userId);

    /**
     * 标记消息为已读
     */
    Message markMessageAsRead(String messageId);

    /**
     * 标记所有未读消息为已读
     */
    void markAllMessagesAsRead(String userId);

    /**
     * 删除消息
     */
    void deleteMessage(String messageId);
}
