# 后端接口（Java Spring Boot）

StarHorseForm 提供一个可选的 Java Spring Boot 后端示例，位于 `server/` 目录，主要演示表单设计器实时协作（WebSocket）能力。

> **注意**：此前端为示例性质。生产环境中，表单 CRUD、规则引擎执行等接口由你的业务后端提供，前端通过 `FormConfig.api` / `configureRuleEngine` 等注入配置，不写死地址。

## 目录结构

```
server/src/main/java/com/starhorse/form/
├── config/
│   └── WebSocketConfig.java      # WebSocket 配置
└── controller/
    └── FormController.java        # 表单协作控制器
```

## WebSocketConfig.java

WebSocket 消息代理配置，基于 Spring STOMP + SockJS。

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer
```

### 配置内容

| 配置项 | 值 | 说明 |
| --- | --- | --- |
| 消息代理 | `/form` | 简单消息代理，用于广播 |
| 应用前缀 | `/app` | 客户端发送消息的前缀 |
| STOMP 端点 | `/api/ws/form` | WebSocket 连接端点 |
| 跨域 | `*` | 允许所有来源 |
| 传输 | SockJS | 启用 SockJS 兼容 |

### 客户端连接

前端通过 `stompjs` + `sockjs-client` 连接：

```ts
const socket = new SockJS("/api/ws/form");
const stompClient = Stomp.over(socket);
stompClient.connect({}, () => {
  // 订阅表单消息
  stompClient.subscribe(`/form/${formId}/message`, (msg) => {
    const data = JSON.parse(msg.body);
    // 处理消息
  });
});
```

## FormController.java

表单实时协作控制器，基于 STOMP 消息映射。使用 `ConcurrentHashMap` + `ReentrantReadWriteLock` 保证多用户并发安全。

### 消息端点

| 端点 | 方法 | 说明 |
| --- | --- | --- |
| `/app/form/lock-component` | `lockComponent` | 锁定组件 |
| `/app/form/unlock-component` | `unlockComponent` | 解锁组件 |
| `/app/form/sync-data` | `syncData` | 同步表单数据 |
| `/app/form/register-form` | `registerForm` | 注册表单信息 |

### 广播通道

所有消息广播到 `/form/{formId}/message`。

### 1. lock-component（锁定组件）

**请求 payload**：

```json
{
  "compId": "组件ID",
  "formId": "表单ID",
  "userInfo": { "name": "用户名", ... }
}
```

**处理逻辑**：
1. 获取写锁
2. 检查组件是否已被锁定（`componentLocks` 中是否存在 `compId`）
3. 未锁定 → 锁定成功，记录 `LockInfo(userInfo, timestamp)`
4. 已锁定 → 返回失败消息

**广播响应**：

```json
{
  "type": "lock",
  "compId": "组件ID",
  "success": true/false,
  "message": "...",
  "userInfo": { ... }
}
```

锁定成功时额外广播 `lock-status` 消息：

```json
{
  "type": "lock-status",
  "compId": "组件ID",
  "userInfo": { ... }
}
```

### 2. unlock-component（解锁组件）

**请求 payload**：

```json
{
  "compId": "组件ID",
  "formId": "表单ID"
}
```

**处理逻辑**：获取写锁，从 `componentLocks` 移除 `compId`，广播 `unlock` + `lock-status`（userInfo 为 null）。

### 3. sync-data（同步表单数据）

**请求 payload**：

```json
{
  "formId": "表单ID",
  "data": { ... }
}
```

**处理逻辑**：广播 `sync` 消息到所有用户：

```json
{
  "type": "sync",
  "data": { ... }
}
```

### 4. register-form（注册表单信息）

**请求 payload**：

```json
{
  "formId": "表单ID",
  "formInfo": { ... },
  "formData": { ... },
  "list": [ ... ]
}
```

**处理逻辑**：保存表单信息（示例中仅打印日志），广播注册成功响应。

### 并发安全

- `componentLocks`：`ConcurrentHashMap<String, LockInfo>`，存储组件锁定状态
- `lock`：`ReentrantReadWriteLock`，读写锁保证锁定/解锁操作的原子性
- `LockInfo`：内部静态类，含 `userInfo` 与 `timestamp`

## 与前端的对接

前端实时协作服务位于 `src/components/system/items/FormSocketService.ts`，基于 `stompjs` + `sockjs-client` 实现：

- 连接 WebSocket 端点
- 发送锁定/解锁/同步消息
- 订阅 `/form/{formId}/message` 接收广播
- 组件锁定状态同步到设计器画布

> 在线协作功能目前标记为不成熟（`FormConfig.cooperationMode`），此前端为示例实现。

## 规则引擎后端对接

规则引擎的后端接口**不在此 server 目录**，需由业务后端提供。前端通过 `src/api/rule_engine_api.ts` 调用，基础路径为 `userdb-manage` 服务的 `/userdb/ruleEngine` 等端点。

需实现的关键接口：

| 接口 | 说明 |
| --- | --- |
| `POST /ruleEngine/executeByForm/{formId}?triggerEvent=xxx` | 按表单执行规则集，返回 `mergedContext` |
| `POST /ruleEngine/execute/{ruleId}` | 执行单个规则 |
| `POST /ruleEngine/executeSet/{setId}` | 执行规则集 |
| `POST /ruleDefinition/*` | 规则定义 CRUD |
| `POST /ruleSet/*` | 规则集 CRUD |
| `POST /ruleVersion/*` | 规则版本管理与发布 |

> 完整接口清单详见 [前端 API 层](./api-layer.md#规则引擎接口-rule_engine_apits)。

### executeByForm 返回结构

```json
{
  "data": {
    "data": [
      {
        "success": true,
        "message": "...",
        "mergedContext": {
          "__visible_amount": true,
          "__required_remark": true,
          "type": "special",
          "__block_submit": false
        }
      }
    ]
  }
}
```

`mergedContext` 中的前缀字段由前端 `parseFieldActions()` 解析为 `FieldAction[]`，详见 [规则引擎设计器 - 字段控制指令](./rule-engine-designer.md#字段控制指令-fieldaction)。

## 下一步

- [前端 API 层](./api-layer.md)
- [规则引擎设计器](./rule-engine-designer.md)
- [架构总览](./architecture.md)