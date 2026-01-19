package com.starhorse.webrtc.server.repository;

import com.starhorse.webrtc.server.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据userId查找用户
     */
    Optional<User> findByUserId(String userId);

    /**
     * 查找在线用户
     */
    Iterable<User> findByOnlineTrue();

    /**
     * 根据名称模糊搜索用户
     */
    Iterable<User> findByNameContainingIgnoreCase(String name);
}
