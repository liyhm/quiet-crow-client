# WebSocket 消息接收调试指南

## 问题描述
网页版发送消息后，Electron 应用没有实时收到消息。

## 可能的原因

### 1. WebSocket 未连接
**检查方法**：
- 打开应用的开发者工具（F12 或 Ctrl+Shift+I）
- 查看控制台是否有以下日志：
  ```
  🔌 初始化 WebSocket...
  WebSocket connected
  📡 订阅私有消息队列: /user/queue/messages
  ✅ 私有消息队列订阅成功
  ```

**如果没有连接成功**：
- 检查后端 WebSocket 服务是否启动（端口 8080）
- 检查 `.env.development` 中的 `VITE_WS_URL` 配置

### 2. 订阅路径不正确
**检查方法**：
- 确认后端 WebSocket 消息推送路径
- 前端订阅：`/user/queue/messages`
- 后端应该推送到：`/user/{userId}/queue/messages`

**后端需要确认**：
```java
// 后端发送消息时应该使用
messagingTemplate.convertAndSendToUser(
    userId,
    "/queue/messages",  // 注意：不包含 /user 前缀
    message
);
```

### 3. 消息格式不匹配
**检查方法**：
- 当网页版发送消息时，查看应用控制台
- 应该看到：`📬 收到私有消息: {...}`
- 如果看到错误，检查消息格式

**期望的消息格式**：
```json
{
  "id": "message-uuid",
  "sessionId": "session-uuid",
  "sendUser": "sender-user-id",
  "content": "加密的消息内容",
  "sendTime": "2024-02-27T10:00:00",
  "messageType": "1"
}
```

### 4. 会话密钥缺失
**检查方法**：
- 查看控制台是否有：`❌ 接收消息失败: ...`
- 如果是解密失败，可能是会话密钥问题

**解决方法**：
- 确保发送方和接收方使用相同的会话密钥
- 检查 `encryptionApi.getSessionKey()` 是否正常工作

## 调试步骤

### 步骤 1：检查 WebSocket 连接状态
1. 打开应用
2. 登录
3. 打开开发者工具（F12）
4. 查看控制台，确认看到：
   ```
   WebSocket connected
   ✅ 私有消息队列订阅成功
   ```

### 步骤 2：测试消息接收
1. 在网页版发送一条消息
2. 立即查看应用的控制台
3. 应该看到以下日志序列：
   ```
   📬 收到私有消息: {...}
   📨 收到 WebSocket 消息: {...}
   📩 处理接收到的消息: {...}
   🔓 消息解密成功: 你好
   ✅ 消息已添加到 store
   ✅ 消息已处理，会话列表已更新
   ```

### 步骤 3：检查 UI 更新
1. 如果控制台显示消息已接收
2. 但 UI 没有更新
3. 检查：
   - 是否在正确的会话中
   - 会话列表是否显示未读数
   - 点击会话后是否能看到消息

## 常见问题

### Q1: 控制台没有任何 WebSocket 日志
**原因**：WebSocket 未初始化或连接失败

**解决**：
1. 检查后端是否启动
2. 检查环境变量配置
3. 重新登录应用

### Q2: 看到 "WebSocket connected" 但没有订阅成功
**原因**：用户 ID 不存在

**解决**：
1. 检查登录是否成功
2. 检查 `authStore.userId` 是否有值
3. 重新登录

### Q3: 收到消息但解密失败
**原因**：会话密钥不匹配

**解决**：
1. 确保双方使用相同的会话密钥
2. 检查后端 `/api/encryption/session/{sessionId}/key` 接口
3. 尝试重新创建会话

### Q4: 消息解密成功但 UI 不更新
**原因**：Vue 响应式系统问题

**解决**：
1. 检查 `messagesMap.value[sessionId]` 是否正确更新
2. 尝试切换到其他会话再切换回来
3. 刷新应用（Ctrl+R）

## 手动刷新方法

如果需要手动刷新消息：

### 方法 1：切换会话
1. 点击其他会话
2. 再点击回原会话
3. 会重新加载历史消息

### 方法 2：刷新应用
- Windows/Linux: `Ctrl + R`
- Mac: `Cmd + R`

### 方法 3：重新登录
1. 点击左下角头像
2. 点击"退出登录"
3. 重新登录

## 后端需要检查的点

### 1. WebSocket 消息推送代码
```java
@Autowired
private SimpMessagingTemplate messagingTemplate;

// 发送消息给特定用户
public void sendMessageToUser(String userId, ChatMessage message) {
    messagingTemplate.convertAndSendToUser(
        userId,
        "/queue/messages",  // 前端订阅 /user/queue/messages
        message
    );
}
```

### 2. 消息格式
确保返回的消息包含所有必需字段：
- `id` - 消息 ID
- `sessionId` - 会话 ID
- `sendUser` - 发送者 ID
- `content` - 加密的消息内容
- `sendTime` - 发送时间
- `messageType` - 消息类型（"1" 表示文本）

### 3. 会话成员查询
发送消息时，需要查询会话的所有成员，并推送给除发送者外的所有在线用户。

```java
// 伪代码
List<String> members = sessionService.getSessionMembers(sessionId);
for (String memberId : members) {
    if (!memberId.equals(senderId)) {
        sendMessageToUser(memberId, message);
    }
}
```

## 测试清单

- [ ] WebSocket 连接成功
- [ ] 订阅私有消息队列成功
- [ ] 网页版发送消息
- [ ] 应用控制台显示收到消息
- [ ] 消息解密成功
- [ ] 消息添加到 store
- [ ] 会话列表显示未读数
- [ ] 点击会话后能看到新消息
- [ ] 消息显示正确的内容和时间

## 下一步

如果以上步骤都正常，但仍然没有收到消息：

1. 检查后端日志，确认消息是否发送
2. 使用浏览器开发者工具的 Network 标签，查看 WebSocket 帧
3. 确认后端推送的用户 ID 是否正确
4. 检查是否有防火墙或代理阻止 WebSocket 连接

---

**更新时间**: 2024-02-27  
**版本**: 1.0
