package com.starhorse.webrtc.server.service;

import com.starhorse.webrtc.server.model.Meeting;

import java.util.List;

public interface MeetingService {

    /**
     * 创建会议
     */
    Meeting createMeeting(Meeting meeting);

    /**
     * 根据meetingId查找会议
     */
    Meeting findByMeetingId(String meetingId);

    /**
     * 查找所有会议
     */
    List<Meeting> findAllMeetings();

    /**
     * 查找用户作为主持人的会议
     */
    List<Meeting> findMeetingsByHostId(String hostId);

    /**
     * 查找正在进行的会议
     */
    List<Meeting> findOngoingMeetings();

    /**
     * 查找即将开始的会议
     */
    List<Meeting> findUpcomingMeetings();

    /**
     * 更新会议状态
     */
    Meeting updateMeetingStatus(String meetingId, String status);

    /**
     * 更新会议参与者数量
     */
    Meeting updateParticipantCount(String meetingId, int participantCount);

    /**
     * 开始会议
     */
    Meeting startMeeting(String meetingId);

    /**
     * 结束会议
     */
    Meeting endMeeting(String meetingId);

    /**
     * 删除会议
     */
    void deleteMeeting(String meetingId);
}
