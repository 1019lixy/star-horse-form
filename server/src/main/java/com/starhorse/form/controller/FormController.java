package com.starhorse.form.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Controller
public class FormController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 组件锁定状态，使用读写锁保证线程安全
    private final Map<String, LockInfo> componentLocks = new ConcurrentHashMap<>();
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    /**
     * 锁定组件
     */
    @MessageMapping("/form/lock-component")
    public void lockComponent(Map<String, Object> payload) {
        String compId = (String) payload.get("compId");
        String formId = (String) payload.get("formId");
        Map<String, Object> userInfo = (Map<String, Object>) payload.get("userInfo");

        System.out.println("Lock component request: compId=" + compId + ", formId=" + formId + ", user=" + userInfo);

        boolean locked = false;
        String message = "";

        lock.writeLock().lock();
        try {
            LockInfo existingLock = componentLocks.get(compId);
            if (existingLock == null) {
                // 组件未被锁定，允许锁定
                componentLocks.put(compId, new LockInfo(userInfo, System.currentTimeMillis()));
                locked = true;
                System.out.println("Component " + compId + " locked by user " + userInfo.get("name"));
            } else {
                // 组件已被锁定
                locked = false;
                message = "Component is already locked by another user";
                System.out.println("Component " + compId + " is already locked by user " + existingLock.getUserInfo().get("name"));
            }
        } finally {
            lock.writeLock().unlock();
        }

        // 发送锁定结果
        Map<String, Object> response = new HashMap<>();
        response.put("type", "lock");
        response.put("compId", compId);
        response.put("success", locked);
        response.put("message", message);
        response.put("userInfo", userInfo);

        // 广播锁定状态给所有用户
        messagingTemplate.convertAndSend("/form/" + formId + "/message", response);

        // 发送锁定状态给所有用户（包括锁定成功的用户）
        if (locked) {
            Map<String, Object> lockStatusMessage = new HashMap<>();
            lockStatusMessage.put("type", "lock-status");
            lockStatusMessage.put("compId", compId);
            lockStatusMessage.put("userInfo", userInfo);
            messagingTemplate.convertAndSend("/form/" + formId + "/message", lockStatusMessage);
        }
    }

    /**
     * 解锁组件
     */
    @MessageMapping("/form/unlock-component")
    public void unlockComponent(Map<String, Object> payload) {
        String compId = (String) payload.get("compId");
        String formId = (String) payload.get("formId");

        System.out.println("Unlock component request: compId=" + compId + ", formId=" + formId);

        lock.writeLock().lock();
        try {
            LockInfo removedLock = componentLocks.remove(compId);
            if (removedLock != null) {
                System.out.println("Component " + compId + " unlocked");
            }
        } finally {
            lock.writeLock().unlock();
        }

        // 广播解锁状态给所有用户
        Map<String, Object> response = new HashMap<>();
        response.put("type", "unlock");
        response.put("compId", compId);
        response.put("success", true);

        messagingTemplate.convertAndSend("/form/" + formId + "/message", response);

        // 发送解锁状态（清除锁定信息）
        Map<String, Object> lockStatusMessage = new HashMap<>();
        lockStatusMessage.put("type", "lock-status");
        lockStatusMessage.put("compId", compId);
        lockStatusMessage.put("userInfo", null); // null 表示解锁
        messagingTemplate.convertAndSend("/form/" + formId + "/message", lockStatusMessage);
    }

    /**
     * 同步表单数据
     */
    @MessageMapping("/form/sync-data")
    public void syncData(Map<String, Object> payload) {
        String formId = (String) payload.get("formId");
        Map<String, Object> data = (Map<String, Object>) payload.get("data");

        System.out.println("Sync data request: formId=" + formId + ", data size=" + (data != null ? data.size() : 0));

        // 广播同步数据给所有用户
        Map<String, Object> response = new HashMap<>();
        response.put("type", "sync");
        response.put("data", data);

        messagingTemplate.convertAndSend("/form/" + formId + "/message", response);
        System.out.println("Data synced to all users in form " + formId);
    }

    /**
     * 锁定信息类
     */
    private static class LockInfo {
        private final Map<String, Object> userInfo;
        private final long timestamp;

        public LockInfo(Map<String, Object> userInfo, long timestamp) {
            this.userInfo = userInfo;
            this.timestamp = timestamp;
        }

        public Map<String, Object> getUserInfo() {
            return userInfo;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}
