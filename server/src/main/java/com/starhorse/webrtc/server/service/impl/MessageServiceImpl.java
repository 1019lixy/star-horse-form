package com.starhorse.webrtc.server.service.impl;

import com.starhorse.webrtc.server.model.Message;
import com.starhorse.webrtc.server.repository.MessageRepository;
import com.starhorse.webrtc.server.service.MessageService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    public Message createMessage(Message message) {
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);
        return messageRepository.save(message);
    }

    @Override
    public Message findByMessageId(String messageId) {
        // 由于Message实体的主键是Long类型的id，而不是messageId，
        // 这里需要遍历所有消息来查找，实际应用中应该考虑添加索引或修改主键策略
        return messageRepository.findAll().stream()
                .filter(message -> message.getMessageId().equals(messageId))
                .findFirst()
                .orElse(null);
    }

    @Override
    public List<Message> findChatMessages(String userId1, String userId2, int limit, int offset) {
        List<Message> messages = messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtDesc(
                userId1, userId2, userId2, userId1);
        // 应用分页
        int end = Math.min(offset + limit, messages.size());
        return messages.subList(offset, end);
    }

    @Override
    public List<Message> findGroupMessages(String groupId, int limit, int offset) {
        List<Message> messages = messageRepository.findByGroupIdOrderBySentAtDesc(groupId);
        // 应用分页
        int end = Math.min(offset + limit, messages.size());
        return messages.subList(offset, end);
    }

    @Override
    public List<Message> findMeetingMessages(String meetingId, int limit, int offset) {
        List<Message> messages = messageRepository.findByMeetingIdOrderBySentAtDesc(meetingId);
        // 应用分页
        int end = Math.min(offset + limit, messages.size());
        return messages.subList(offset, end);
    }

    @Override
    public List<Message> findUnreadMessages(String userId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(userId);
    }

    @Override
    public long countUnreadMessages(String userId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    @Override
    public Message markMessageAsRead(String messageId) {
        Message message = findByMessageId(messageId);
        if (message != null) {
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
            return messageRepository.save(message);
        }
        return null;
    }

    @Override
    public void markAllMessagesAsRead(String userId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndIsReadFalse(userId);
        for (Message message : unreadMessages) {
            message.setRead(true);
            message.setReadAt(LocalDateTime.now());
            messageRepository.save(message);
        }
    }

    @Override
    public void deleteMessage(String messageId) {
        Message message = findByMessageId(messageId);
        if (message != null) {
            messageRepository.delete(message);
        }
    }
}
