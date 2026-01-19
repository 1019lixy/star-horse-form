package com.starhorse.webrtc.server.repository;

import com.starhorse.webrtc.server.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * 查找两个用户之间的聊天消息
     */
    List<Message> findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentAtDesc(
            String senderId1, String receiverId1, String senderId2, String receiverId2);

    /**
     * 查找群聊消息
     */
    List<Message> findByGroupIdOrderBySentAtDesc(String groupId);

    /**
     * 查找会议消息
     */
    List<Message> findByMeetingIdOrderBySentAtDesc(String meetingId);

    /**
     * 查找未读消息
     */
    List<Message> findByReceiverIdAndIsReadFalse(String receiverId);

    /**
     * 统计未读消息数量
     */
    long countByReceiverIdAndIsReadFalse(String receiverId);
}
