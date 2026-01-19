package com.starhorse.webrtc.server.service.impl;

import com.starhorse.webrtc.server.model.User;
import com.starhorse.webrtc.server.repository.UserRepository;
import com.starhorse.webrtc.server.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User createUser(User user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setLastSeen(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Override
    public User findByUserId(String userId) {
        Optional<User> userOptional = userRepository.findByUserId(userId);
        return userOptional.orElse(null);
    }

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<User> findOnlineUsers() {
        return (List<User>) userRepository.findByOnlineTrue();
    }

    @Override
    public List<User> searchUsersByName(String name) {
        return (List<User>) userRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public User updateUserOnlineStatus(String userId, boolean online) {
        User user = findByUserId(userId);
        if (user != null) {
            user.setOnline(online);
            user.setLastSeen(LocalDateTime.now());
            return userRepository.save(user);
        }
        return null;
    }

    @Override
    public User updateUserUnreadCount(String userId, int unreadCount) {
        User user = findByUserId(userId);
        if (user != null) {
            user.setUnreadCount(unreadCount);
            return userRepository.save(user);
        }
        return null;
    }

    @Override
    public void deleteUser(String userId) {
        User user = findByUserId(userId);
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
