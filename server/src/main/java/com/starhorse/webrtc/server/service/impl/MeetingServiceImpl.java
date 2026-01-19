package com.starhorse.webrtc.server.service.impl;

import com.starhorse.webrtc.server.model.Meeting;
import com.starhorse.webrtc.server.repository.MeetingRepository;
import com.starhorse.webrtc.server.service.MeetingService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;

    public MeetingServiceImpl(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    @Override
    public Meeting createMeeting(Meeting meeting) {
        meeting.setStatus("pending");
        return meetingRepository.save(meeting);
    }

    @Override
    public Meeting findByMeetingId(String meetingId) {
        return meetingRepository.findByMeetingId(meetingId);
    }

    @Override
    public List<Meeting> findAllMeetings() {
        return meetingRepository.findAll();
    }

    @Override
    public List<Meeting> findMeetingsByHostId(String hostId) {
        return meetingRepository.findByHostIdOrderByScheduledAtDesc(hostId);
    }

    @Override
    public List<Meeting> findOngoingMeetings() {
        return meetingRepository.findByStatusOrderByStartedAtDesc("ongoing");
    }

    @Override
    public List<Meeting> findUpcomingMeetings() {
        return meetingRepository.findByStatusOrderByScheduledAtDesc("pending");
    }

    @Override
    public Meeting updateMeetingStatus(String meetingId, String status) {
        Meeting meeting = findByMeetingId(meetingId);
        if (meeting != null) {
            meeting.setStatus(status);
            return meetingRepository.save(meeting);
        }
        return null;
    }

    @Override
    public Meeting updateParticipantCount(String meetingId, int participantCount) {
        Meeting meeting = findByMeetingId(meetingId);
        if (meeting != null) {
            meeting.setParticipantCount(participantCount);
            return meetingRepository.save(meeting);
        }
        return null;
    }

    @Override
    public Meeting startMeeting(String meetingId) {
        Meeting meeting = findByMeetingId(meetingId);
        if (meeting != null) {
            meeting.setStatus("ongoing");
            meeting.setStartedAt(LocalDateTime.now());
            return meetingRepository.save(meeting);
        }
        return null;
    }

    @Override
    public Meeting endMeeting(String meetingId) {
        Meeting meeting = findByMeetingId(meetingId);
        if (meeting != null) {
            meeting.setStatus("ended");
            meeting.setEndedAt(LocalDateTime.now());
            return meetingRepository.save(meeting);
        }
        return null;
    }

    @Override
    public void deleteMeeting(String meetingId) {
        Meeting meeting = findByMeetingId(meetingId);
        if (meeting != null) {
            meetingRepository.delete(meeting);
        }
    }
}
