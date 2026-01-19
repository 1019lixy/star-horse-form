# WebRTC Server

## 项目简介

这是一个基于Spring Boot的WebRTC信令服务器，用于支持实时通信功能，包括：

- WebRTC信令交换（SDP和ICE候选者）
- 实时聊天消息传递
- 会议管理和消息同步
- 用户状态管理

## 技术栈

- Java 17
- Spring Boot 3.2.0
- Spring WebSocket (STOMP)
- Spring Data JPA
- H2 Database (开发环境)

## 项目结构

```
server/
├── src/
│   ├── main/
│   │   ├── java/com/starhorse/webrtc/server/
│   │   │   ├── config/          # 配置类
│   │   │   ├── controller/       # 控制器
│   │   │   ├── model/            # 数据模型
│   │   │   ├── repository/       # 数据访问层
│   │   │   ├── service/          # 服务接口
│   │   │   ├── service/impl/     # 服务实现
│   │   │   └── WebRtcServerApplication.java  # 应用主类
│   │   └── resources/
│   │       └── application.properties  # 配置文件
│   └── test/                     # 测试代码
├── pom.xml                       # Maven配置文件
└── README.md                     # 项目说明
```

## 快速开始

### 前提条件

- JDK 17 或更高版本
- Maven 3.8 或更高版本

### 构建项目

```bash
# 进入server目录
cd server

# 构建项目
mvn clean package
```

### 运行项目

```bash
# 运行项目
mvn spring-boot:run

# 或使用构建的jar包运行
java -jar target/webrtc-server-1.0.0.jar
```

服务将在 `http://localhost:8080/api` 启动。

### 访问H2数据库控制台

- 地址：`http://localhost:8080/api/h2-console`
- 用户名：`sa`
- 密码：空
- JDBC URL：`jdbc:h2:mem:webrtcdb`

## WebSocket端点

### 聊天消息端点

- **WebSocket连接**：`/api/ws/chat`
- **发送私人消息**：`/app/chat/private-message`
- **发送群聊消息**：`/app/chat/group-message`
- **发送会议消息**：`/app/chat/meeting-message`
- **订阅私人消息**：`/queue/chat/messages`
- **订阅群聊消息**：`/topic/chat/group/{groupId}`
- **订阅会议消息**：`/topic/chat/meeting/{meetingId}`

### WebRTC信令端点

- **WebSocket连接**：`/api/ws/webrtc`
- **注册用户**：`/app/webrtc/register`
- **发送SDP提议**：`/app/webrtc/offer`
- **发送SDP应答**：`/app/webrtc/answer`
- **发送ICE候选者**：`/app/webrtc/ice-candidate`
- **接收SDP提议**：`/queue/webrtc/offer`
- **接收SDP应答**：`/queue/webrtc/answer`
- **接收ICE候选者**：`/queue/webrtc/ice-candidate`

## 消息格式

### 私人消息格式

```json
{
  "targetUserId": "user123",
  "senderId": "user456",
  "senderName": "张三",
  "content": "你好，在吗？",
  "sentAt": "2024-01-01T12:00:00"
}
```

### 群聊消息格式

```json
{
  "groupId": "group123",
  "senderId": "user456",
  "senderName": "张三",
  "content": "大家好！",
  "sentAt": "2024-01-01T12:00:00"
}
```

### 会议消息格式

```json
{
  "meetingId": "meeting123",
  "senderId": "user456",
  "senderName": "张三",
  "content": "会议开始了",
  "sentAt": "2024-01-01T12:00:00"
}
```

### WebRTC信令格式

#### SDP提议

```json
{
  "targetUserId": "user123",
  "senderId": "user456",
  "offer": {
    "type": "offer",
    "sdp": "..."
  }
}
```

#### SDP应答

```json
{
  "targetUserId": "user456",
  "senderId": "user123",
  "answer": {
    "type": "answer",
    "sdp": "..."
  }
}
```

#### ICE候选者

```json
{
  "targetUserId": "user123",
  "senderId": "user456",
  "candidate": {
    "candidate": "...",
    "sdpMid": "...",
    "sdpMLineIndex": 0
  }
}
```

## 与前端集成

### 前端WebSocket连接

```javascript
// 连接到聊天WebSocket
const chatSocket = new SockJS('/api/ws/chat');
const chatStompClient = Stomp.over(chatSocket);

// 连接到WebRTC信令WebSocket
const webrtcSocket = new SockJS('/api/ws/webrtc');
const webrtcStompClient = Stomp.over(webrtcSocket);

// 连接WebSocket
chatStompClient.connect({}, function(frame) {
  console.log('Chat WebSocket connected:', frame);
  // 订阅私人消息
  chatStompClient.subscribe('/queue/chat/messages', function(message) {
    const data = JSON.parse(message.body);
    console.log('Received private message:', data);
    // 处理接收到的消息
  });
});

webrtcStompClient.connect({}, function(frame) {
  console.log('WebRTC WebSocket connected:', frame);
  // 注册用户
  webrtcStompClient.send('/app/webrtc/register', {}, JSON.stringify({
    userId: 'user456',
    sessionId: 'session123'
  }));
  
  // 订阅SDP提议
  webrtcStompClient.subscribe('/queue/webrtc/offer', function(message) {
    const data = JSON.parse(message.body);
    console.log('Received SDP offer:', data);
    // 处理接收到的SDP提议
  });
});
```

### 发送消息示例

```javascript
// 发送私人消息
chatStompClient.send('/app/chat/private-message', {}, JSON.stringify({
  targetUserId: 'user123',
  senderId: 'user456',
  senderName: '张三',
  content: '你好，在吗？',
  sentAt: new Date().toISOString()
}));

// 发送SDP提议
webrtcStompClient.send('/app/webrtc/offer', {}, JSON.stringify({
  targetUserId: 'user123',
  senderId: 'user456',
  offer: {
    type: 'offer',
    sdp: '...'
  }
}));
```

## 部署说明

### 生产环境配置

1. **数据库配置**：
   - 修改 `application.properties` 中的数据库配置，使用生产环境数据库

2. **服务器配置**：
   - 配置服务器端口、上下文路径等

3. **安全配置**：
   - 启用HTTPS
   - 配置CORS策略
   - 添加认证和授权

### 容器化部署

可以使用Docker容器化部署：

```dockerfile
FROM openjdk:17-jdk-alpine
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 故障排查

### 常见问题

1. **WebSocket连接失败**：
   - 检查服务器是否运行
   - 检查WebSocket端点URL是否正确
   - 检查网络连接和防火墙设置

2. **消息发送失败**：
   - 检查WebSocket连接状态
   - 检查消息格式是否正确
   - 检查目标用户ID是否存在

3. **WebRTC连接失败**：
   - 检查SDP格式是否正确
   - 检查ICE候选者是否正确交换
   - 检查网络环境是否支持WebRTC

### 日志查看

服务器日志位于 `logs/` 目录，可以通过以下命令查看：

```bash
# 查看最新日志
tail -f logs/application.log

# 查看错误日志
grep -i error logs/application.log
```

## 许可证

本项目采用MIT许可证。
