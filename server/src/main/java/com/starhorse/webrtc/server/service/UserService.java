package com.starhorse.webrtc.server.service;

import com.starhorse.webrtc.server.model.User;

import java.util.List;

public interface UserService {

    /**
     * 创建用户
     */
    User createUser(User user);

    /**
     * 根据userId查找用户
     */
    User findByUserId(String userId);

    /**
     * 查找所有用户
     */
    List<User> findAllUsers();

    /**
     * 查找在线用户
     */
    List<User> findOnlineUsers();

    /**
     * 根据名称搜索用户
     */
    List<User> searchUsersByName(String name);

    /**
     * 更新用户在线状态
     */
    User updateUserOnlineStatus(String userId, boolean online);

    /**
     * 更新用户未读消息数量
     */
    User updateUserUnreadCount(String userId, int unreadCount);

    /**
     * 删除用户
     */
    void deleteUser(String userId);
}
