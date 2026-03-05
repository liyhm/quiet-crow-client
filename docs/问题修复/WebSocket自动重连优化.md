# WebSocket 自动重连优化

## 📋 问题描述

用户反馈：
- "后端关了重新启动了，没有自动连接上，需要刷新"
- "后端关了重新开了后，没有自动连上"

## ✅ 已实现的优化

### 1. 改进重连策略

**优化前**：
```typescript
reconnectDelay: 5000, // 固定 5 秒延迟
maxAttempts: 10      // 最多 10 次
```

**优化后**：
```typescript
reconnectDelay: 3000,      // 初始延迟 3 秒
connectionTimeout: 5000,   // 连接超时 5 秒
maxAttempts: 15           // 最多 15 次
```

### 2. 改进重连逻辑

**优化前**：
- 只是简单地重新激活客户端
- 可能导致旧连接残留

**优化后**：
```typescript
// 1. 先完全停用现有连接
if (this.client?.active) {
  console.log('🔌 先停用现有连接')
  this.client.deactivate()
}

// 2. 重新初始化客户端
console.log('🔄 重新初始化 WebSocket 客户端')
this.initialize()

// 3. 延迟激活，确保初始化完成
setTimeout(() => {
  console.log('📡 激活 WebSocket 客户端')
  this.connect()
}, 100)
```

### 3. 指数退避策略

重连延迟会逐渐增加，避免频繁请求：

| 尝试次数 | 延迟时间 |
|---------|---------|
| 1       | 2 秒    |
| 2       | 4 秒    |
| 3       | 8 秒    |
| 4       | 16 秒   |
| 5+      | 30 秒（最大）|

## 🔄 完整工作流程

### 正常重连流程

```
1. 后端关闭
   ↓
2. WebSocket 断开
   ↓ onDisconnect / onWebSocketClose
3. 触发 handleReconnect()
   ↓
4. 等待 2 秒（第 1 次尝试）
   ↓
5. 停用旧连接
   ↓
6. 重新初始化客户端
   ↓
7. 激活新连接
   ↓
8. 连接成功 ✅
   ↓
9. 重新订阅消息队列
   ↓
10. 恢复正常通信
```

### 后端重启场景

```
1. 后端关闭
   ↓
2. 前端检测到断开，开始重连
   ↓
3. 第 1 次尝试（2 秒后）
   ❌ 后端还在启动中
   ↓
4. 第 2 次尝试（4 秒后）
   ❌ 后端还在启动中
   ↓
5. 第 3 次尝试（8 秒后）
   ✅ 后端已启动，连接成功
   ↓
6. 自动恢复通信
```

## 🧪 测试步骤

### 测试 1: 后端重启

1. 前端正常运行，WebSocket 已连接
2. 关闭后端服务
3. 观察前端控制台：
   ```
   ❌ WebSocket 断开连接
   🔄 准备重连 WebSocket (尝试 1/15)，2 秒后重试...
   ```
4. 重新启动后端服务
5. 观察前端控制台：
   ```
   🔄 开始第 1 次重连...
   🔌 先停用现有连接
   🔄 重新初始化 WebSocket 客户端
   📡 激活 WebSocket 客户端
   ✅ WebSocket 连接成功！
   📡 订阅私有消息队列: /user/queue/messages
   ✅ 私有消息队列订阅成功
   ```
6. 验证功能：
   - 发送消息 ✅
   - 接收消息 ✅
   - 好友请求通知 ✅

### 测试 2: 网络波动

1. 前端正常运行
2. 断开网络连接（关闭 WiFi）
3. 观察重连尝试
4. 恢复网络连接
5. 验证自动重连成功

### 测试 3: 退出登录

1. 前端正常运行
2. 点击退出登录
3. 观察控制台：
   ```
   🚪 开始登出...
   🔌 断开 WebSocket 连接...
   📡 取消订阅: private
   📡 取消订阅: friend-requests
   ✅ WebSocket 已断开
   ✅ 已清除所有会话密钥
   ✅ 登出完成
   ```
4. 验证：
   - WebSocket 已断开 ✅
   - 不会触发重连 ✅
   - 用户状态变为离线 ✅

## 📊 重连状态监控

### 控制台日志

**断开时**：
```
❌ WebSocket 断开连接
🔄 准备重连 WebSocket (尝试 1/15)，2 秒后重试...
```

**重连中**：
```
🔄 开始第 1 次重连...
🔌 先停用现有连接
🔄 重新初始化 WebSocket 客户端
📡 激活 WebSocket 客户端
```

**连接成功**：
```
✅ WebSocket 连接成功！
📡 订阅私有消息队列: /user/queue/messages
✅ 私有消息队列订阅成功
📡 订阅好友请求通知: /user/queue/friend-requests
✅ 好友请求通知订阅成功
```

**重连失败**：
```
❌ 重连失败: [错误信息]
🔄 准备重连 WebSocket (尝试 2/15)，4 秒后重试...
```

**达到最大次数**：
```
❌ 达到最大重连次数，停止重连
```

### UI 状态指示

网络状态会显示在界面上（如果有网络状态组件）：
- 🟢 已连接 (CONNECTED)
- 🟡 重连中 (RECONNECTING)
- 🔴 已断开 (DISCONNECTED)

## ⚠️ 注意事项

### 1. 退出登录必须断开 WebSocket

**错误示例**：
```typescript
const logout = async () => {
  await authApi.logout()
  // ❌ 忘记断开 WebSocket
  router.push('/login')
}
```

**正确示例**：
```typescript
const logout = async () => {
  try {
    await authApi.logout()
  } finally {
    // ✅ 无论成功失败，都要断开 WebSocket
    websocketService.disconnect()
    localStorage.removeItem('token')
    router.push('/login')
  }
}
```

### 2. 重连期间的消息处理

重连期间发送的消息会自动加入队列：
```typescript
sendMessage(sessionId: string, encryptedPayload: any) {
  if (!this.client || !this.client.connected) {
    console.warn('⚠️ WebSocket 未连接，消息加入队列')
    const messageStore = useMessageStore()
    messageStore.queueMessage(encryptedPayload)
    return
  }
  // 正常发送...
}
```

连接成功后会自动发送队列中的消息：
```typescript
onConnect: () => {
  console.log('✅ WebSocket 连接成功！')
  // 处理待发送的消息
  const messageStore = useMessageStore()
  messageStore.processPendingQueue()
}
```

### 3. 在线状态的实时性

WebSocket 断开时，用户会立即被标记为离线：
```
1. WebSocket 断开
   ↓
2. 后端监听到断开事件
   ↓
3. 立即标记用户离线
   Redis: DEL online:user:{userId}
```

WebSocket 重连成功时，用户会立即被标记为在线：
```
1. WebSocket 重连成功
   ↓
2. 后端监听到连接事件
   ↓
3. 立即标记用户在线
   Redis: SET online:user:{userId}
```

## 🎯 验收标准

### 功能验收

- ✅ 后端重启后，前端能在 30 秒内自动重连
- ✅ 重连成功后，消息收发正常
- ✅ 重连成功后，好友请求通知正常
- ✅ 退出登录时，WebSocket 正确断开
- ✅ 退出登录后，不会触发重连
- ✅ 重连期间的消息会加入队列，连接后自动发送

### 性能验收

- ✅ 重连不会导致内存泄漏
- ✅ 重连不会创建多个连接
- ✅ 指数退避避免频繁请求
- ✅ 最多尝试 15 次后停止

### 用户体验验收

- ✅ 重连过程对用户透明
- ✅ 控制台日志清晰易懂
- ✅ 网络状态有明确指示
- ✅ 重连成功后无需手动刷新

## 📚 相关文档

1. **[在线状态实时管理方案](../后端文档/在线状态实时管理方案.md)**
   - WebSocket 连接/断开时的在线状态管理

2. **[退出登录WebSocket处理说明](../后端文档/退出登录WebSocket处理说明.md)**
   - 退出登录时必须断开 WebSocket

3. **[WebSocket 连接问题修复](WebSocket连接问题修复.md)**
   - WebSocket 连接相关问题的排查指南

## 🔧 代码位置

- **WebSocket 服务**: `src/renderer/src/shared/api/websocket.ts`
- **网络状态管理**: `src/renderer/src/entities/network/model/useNetworkStore.ts`
- **退出登录**: `src/renderer/src/pages/main/MainPage.vue` (handleLogout)
- **Auth Store**: `src/renderer/src/entities/user/model/useAuthStore.ts`

## ✅ 总结

### 核心改进

1. ✅ 重连前先完全停用旧连接
2. ✅ 重新初始化客户端，避免状态残留
3. ✅ 增加最大重连次数到 15 次
4. ✅ 添加连接超时配置
5. ✅ 指数退避策略，避免频繁请求

### 使用建议

- 后端重启后，前端会自动重连，无需手动刷新
- 如果 30 秒内后端还未启动，可能需要手动刷新
- 退出登录时，WebSocket 会自动断开，不会影响在线状态
- 重连期间发送的消息会自动排队，连接后发送

**自动重连，无缝体验！** 🎯
