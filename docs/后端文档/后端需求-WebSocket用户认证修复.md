# 后端需求：WebSocket 用户认证修复

## 问题描述

当前 WebSocket 连接时，用户被识别为 `anonymous`（匿名用户），导致消息无法正确路由到前端。

### 当前日志

```
发送者: anonymous
✅ 消息已转发给用户: 12743e2b142fc6dc8f8642bf928cc636
✅ 消息已转发给用户: f047127481b03ffbb0cee6b177ccb51b
```

### 问题

- 发送者应该是用户 ID（如 `f047127481b03ffbb0cee6b177ccb51b`），而不是 `anonymous`
- 消息转发到 `/user/12743e2b142fc6dc8f8642bf928cc636/queue/messages`
- 但前端订阅的是 `/user/anonymous/queue/messages`（因为连接时是 anonymous）
- 路由不匹配，前端收不到消息

---

## 核心需求

### 需求 1：WebSocket 连接时识别用户身份

**目标**：从 JWT token 中提取用户 ID，并设置为 WebSocket 连接的用户标识。

**输入**：
- WebSocket CONNECT 消息
- HTTP Header 中的 `Authorization: Bearer {jwt-token}`

**输出**：
- WebSocket 连接的 principal 应该是用户 ID（UUID）
- 不是 `anonymous`

**业务规则**：
1. 拦截 WebSocket CONNECT 消息
2. 从 Authorization header 中提取 JWT token
3. 解析 token，获取用户 ID
4. 将用户 ID 设置为 WebSocket 连接的 principal
5. 如果 token 无效或缺失，可以拒绝连接或使用匿名用户

---

### 需求 2：消息发送者使用真实用户 ID

**目标**：在处理聊天消息时，使用正确的用户 ID 作为发送者。

**当前问题**：
- 消息处理器中获取的发送者是 `anonymous`
- 应该是真实的用户 ID

**期望**：
- 从 WebSocket 连接的 principal 中获取用户 ID
- 使用该 ID 作为消息的发送者
- 保存到数据库的 `send_user` 字段

---

### 需求 3：验证和日志

**连接成功时的日志**：
```
✅ WebSocket 用户认证成功: f047127481b03ffbb0cee6b177ccb51b
```

**接收消息时的日志**：
```
📨 收到消息 - 发送者: f047127481b03ffbb0cee6b177ccb51b
```

**转发消息时的日志**：
```
📤 转发消息到: /user/12743e2b142fc6dc8f8642bf928cc636/queue/messages
```

---

## 实现要点

### 1. 认证拦截器

**功能**：
- 拦截 WebSocket 的 CONNECT 消息
- 提取并验证 JWT token
- 设置用户 principal

**关键步骤**：
1. 获取 `Authorization` header
2. 去掉 `Bearer ` 前缀
3. 解析 JWT token，提取用户 ID
4. 创建认证对象，principal 设置为用户 ID
5. 将认证对象设置到 WebSocket 连接中

### 2. 注册拦截器

**配置**：
- 在 WebSocket 配置类中注册拦截器
- 拦截入站消息通道

### 3. 使用正确的发送者

**消息处理器**：
- 从 WebSocket 连接中获取 principal
- principal.getName() 应该返回用户 ID
- 使用该 ID 作为消息的发送者

---

## 测试验证

### 1. 连接测试

**前端行为**：
- 连接时发送 `Authorization: Bearer {token}` header

**后端验证**：
- 日志显示：`✅ WebSocket 用户认证成功: {userId}`
- 不再显示 `anonymous`

### 2. 消息发送测试

**前端行为**：
- 发送消息

**后端验证**：
- 日志显示：`📨 收到消息 - 发送者: {userId}`
- 数据库 `b_session_log` 表的 `send_user` 字段是用户 ID
- 不是 `anonymous`

### 3. 消息接收测试

**前端行为**：
- 另一个用户应该立即收到消息

**前端验证**：
- 控制台显示：`📬 收到私有消息`
- 消息立即显示在界面上
- 不需要刷新或手动点击会话

---

## 错误处理

### Token 无效

**场景**：JWT token 过期或格式错误

**处理**：
- 记录错误日志
- 可以选择拒绝连接或使用匿名用户

### Token 缺失

**场景**：没有提供 Authorization header

**处理**：
- 记录警告日志
- 可以选择拒绝连接或使用匿名用户

---

## 依赖服务

### JWT 解析服务

**需要的功能**：
- 从 JWT token 中提取用户 ID
- 验证 token 是否有效
- 处理 token 过期等异常情况

**输入**：JWT token 字符串

**输出**：用户 ID（UUID 格式）

---

## 预期效果

### 修复前

```
连接: anonymous
发送: anonymous → 消息
转发: /user/{userId}/queue/messages
前端订阅: /user/anonymous/queue/messages
结果: ❌ 路由不匹配，收不到消息
```

### 修复后

```
连接: {userId}
发送: {userId} → 消息
转发: /user/{userId}/queue/messages
前端订阅: /user/queue/messages（自动解析为当前用户）
结果: ✅ 路由匹配，能收到消息
```

---

## 优先级

🔴 **紧急** - 这是消息实时推送功能的阻塞问题

---

## 影响范围

- 消息无法实时推送到前端
- 用户必须刷新页面或手动点击会话才能看到新消息
- 影响用户体验

---

**创建时间**: 2024-02-27  
**状态**: 待实现  
**类型**: Bug 修复
