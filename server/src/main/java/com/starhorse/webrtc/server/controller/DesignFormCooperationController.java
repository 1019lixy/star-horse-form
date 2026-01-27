package com.starhorse.webrtc.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * 动态表单在线协作
 */
@Controller
public class DesignFormCooperationController {

    private final SimpMessagingTemplate messagingTemplate;

    // 存储用户会话映射: userId -> sessionId
    private final Map<String, String> userSessionMap = new ConcurrentHashMap<>();

    // 存储会议中的用户: meetingId -> Set<userId>
    private final Map<String, Set<String>> formUsersMap = new ConcurrentHashMap<>();
    //选中组件的用户
    private final Map<String, Map<String, Object>> selectedItem = new ConcurrentHashMap<>();

    public DesignFormCooperationController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 注册用户会话
     */
    @MessageMapping("/form/register")
    public void registerUser(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String sessionId = (String) payload.get("sessionId");
        String formId = (String) payload.get("formId");

        if (userId != null && sessionId != null) {
            userSessionMap.put(userId, sessionId);
            System.out.println("User registered: " + userId + " with session: " + sessionId);

            // formId，将用户添加到表单设计
            if (formId != null) {
                // 获取当前表单中已存在的用户列表
                Set<String> existingUsers = formUsersMap.get(formId);

                // 先通知已存在的用户：新用户即将加入
                if (existingUsers != null && !existingUsers.isEmpty()) {
                    notifyExistingUsers(formId, userId, existingUsers);
                }

                // 将新用户添加到会议中
                formUsersMap.computeIfAbsent(formId, k -> ConcurrentHashMap.newKeySet()).add(userId);
                System.out.println("User " + userId + " joined form: " + formId);

                // 通知新用户：会议中已有哪些用户
                if (existingUsers != null && !existingUsers.isEmpty()) {
                    notifyNewUserAboutExistingPeers(formId, userId, existingUsers);
                }
            }
        }
    }

    /**
     * 通知会议中已存在的用户，有新用户加入
     */
    private void notifyExistingUsers(String formId, String newUserId, Set<String> existingUsers) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "NEW_PEER_JOINED");
        notification.put("newUserId", newUserId);
        notification.put("formId", formId);

        // 通知所有已存在的用户
        for (String existingUserId : existingUsers) {
            messagingTemplate.convertAndSend(
                    String.format("/queue/user/%s/form/peer-joined", existingUserId),
                    notification
            );
            System.out.println("Notified existing user " + existingUserId + " about new peer " + newUserId);
        }
    }

    /**
     * 通知新用户：会议中已存在哪些用户
     */
    private void notifyNewUserAboutExistingPeers(String formId, String newUserId, Set<String> existingUsers) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "EXISTING_PEERS");
        notification.put("formId", formId);
        notification.put("existingUserIds", existingUsers);

        messagingTemplate.convertAndSend(
                String.format("/queue/user/%s/form/existing-peers", newUserId),
                notification
        );
        System.out.println("Notified new user " + newUserId + " about existing peers: " + existingUsers);
    }


    /**
     * 处理用户离开
     */
    @MessageMapping("/form/leave")
    public void leaveSession(@Payload Map<String, Object> payload) {
        String userId = (String) payload.get("userId");
        String formId = (String) payload.get("formId");

        if (userId != null) {
            userSessionMap.remove(formId);
            System.out.println("User left: " + userId);
            // 从会议中移除用户
            if (formId != null) {
                Set<String> users = formUsersMap.get(formId);
                if (users != null) {
                    users.remove(userId);
                    System.out.println("User " + userId + " removed from formId: " + formId);

                    // 如果会议中没有用户了，清理会议
                    if (users.isEmpty()) {
                        formUsersMap.remove(formId);
                        System.out.println("Form " + formId + " is now empty and removed");
                    }
                }
            }
            // 通知表单中的其他用户
            messagingTemplate.convertAndSend(
                    String.format("/topic/form/%s/leave", formId),
                    payload
            );
        }
    }

    @MessageMapping("/form/end")
    public void handleFormEnd(@Payload Map<String, Object> payload) {
        String formId = (String) payload.get("formId");
        System.out.println("Form end operation start: " + formId);
        if (formId != null) {
            // 广播给会议所有参与者
            formUsersMap.remove(formId);
            System.out.println("Form end operation finish: " + formId);
        }
    }

    ReentrantReadWriteLock.WriteLock writeLock = new ReentrantReadWriteLock().writeLock();

    @MessageMapping("/form/selectItem")
    public void handleSelectItem(@Payload Map<String, Object> payload) {
        writeLock.lock();
        try {
            String formId = (String) payload.get("formId");
            String userId = (String) payload.get("userId");
            String itemId = (String) payload.get("itemId");
            if (selectedItem.isEmpty()) {
                selectedItem.put(itemId, payload);
            } else {
//                selectedItem = selectedItem.entrySet().stream()
//                        // 核心：用 Optional 一行完成 内层Map判空 + userId判空 + 类型转换 + 比较
//                        .filter(entry -> Optional.ofNullable(entry.getValue())
//                                .map(innerMap -> innerMap.get("userId"))
//                                .map(Object::toString)
//                                .filter(tuserId -> !tuserId.equals(userId))
//                                .isPresent())
//                        // 收集为 ConcurrentHashMap（Java 17 中 Collectors.toMap 更简洁）
//                        .collect(Collectors.toMap(
//                                Map.Entry::getKey,
//                                Map.Entry::getValue,
//                                (a, b) -> a, // 键冲突兜底（ConcurrentHashMap 不会触发）
//                                ConcurrentHashMap::new
//                        ));
                // 删除当前用户在这之前已选中的数据
                selectedItem.entrySet().removeIf(entry ->
                        Optional.ofNullable(entry.getValue())
                                .map(inner -> inner.get("userId"))
                                .map(Object::toString)
                                .filter(userId::equals)
                                .isPresent()
                );
                for (Map.Entry<String, Map<String, Object>> entry : selectedItem.entrySet()) {
                    String existUserId = (String) entry.getValue().get("userId");
                    //组件已被其他用户选中
                    if (!existUserId.equals(userId) && itemId.equals(entry.getKey())) {
                        System.out.println("Form fail operation start: " + formId);
                        messagingTemplate.convertAndSend(
                                String.format("/topic/form/%s/failSelectItem", formId),
                                payload
                        );
                        return;
                    }
                }
                selectedItem.put(itemId, payload);
            }
            //如果该组件已被其他人选中，则不能进行选中
            System.out.println("Form selectItem operation start: " + formId);
            messagingTemplate.convertAndSend(
                    String.format("/topic/form/%s/selectItem", formId),
                    payload
            );
        } finally {
            writeLock.unlock();
        }
    }

    @MessageMapping("/form/editFormItems")
    public void handleEditFormItems(@Payload Map<String, Object> payload) {
        writeLock.lock();
        try {
            String formId = (String) payload.get("formId");
            if (null != formId) {
                //如果该组件已被其他人选中，则不能进行选中
                System.out.println("Form editFormItem operation start: " + formId);
                messagingTemplate.convertAndSend(
                        String.format("/topic/form/%s/editFormItems", formId),
                        payload
                );
            }
        } finally {
            writeLock.unlock();
        }
    }
}
