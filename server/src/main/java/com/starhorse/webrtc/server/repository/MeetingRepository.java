package com.starhorse.webrtc.server.repository;

import com.starhorse.webrtc.server.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    /**
     * 根据meetingId查找会议
     */
    Meeting findByMeetingId(String meetingId);

    /**
     * 查找用户作为主持人的会议
     */
    List<Meeting> findByHostIdOrderByScheduledAtDesc(String hostId);

    /**
     * 查找正在进行的会议
     */
    List<Meeting> findByStatusOrderByStartedAtDesc(String status);

    /**
     * 查找即将开始的会议
     */
    List<Meeting> findByStatusOrderByScheduledAtDesc(String status);
}
