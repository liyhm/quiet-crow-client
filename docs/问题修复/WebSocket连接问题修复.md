# WebSocket 连接问题修复

## 问题描述

在 UI 重构后，WebSocket 无法连接，控制台显示连接警告。

## 问题原因

在 MainPage 的 `onMounted` 生命周期中，缺少 WebSocket 连接状态检查和重连逻辑。

**原因分析**：
1. WebSocket 在登录页面初始化（`LoginPage.vue`）
2. 如果用户刷新页面或直接访问主页面，WebSocket 不会自动重连
3. 导致消息无法接收和发送

## 修复方案

在 `MainPage.vue` 的 `onMounted` 中添加 WebSocket 连接检查：

```typescript
onMounted(async () => {
  console.log('🚀 MainPage mounted')
  
  // 检查 WebSocket 连接状态
  if (networkStore.connectionStatus !== 'CONNECTED') {
    console.log('⚠️ WebSocket 未连接，尝试重新连接...')
    websocketService.initialize()
    websocketService.connect()
  } else {
    console.log('✅ WebSocket 已连接')
  }
  
  await sessionStore.loadSessions()
  
  // 加载好友请求
  const contactStore = useContactStore()
  await contactStore.loadPendingRequests()
  
  console.log('✅ MainPage 初始化完成')
})
```

## 验证步骤

1. **清除缓存并刷新**
   - 按 `Ctrl+Shift+R` 强制刷新页面
   - 或在 DevTools 中右键刷新按钮选择"清空缓存并硬性重新加载"

2. **检查控制台日志**
   应该看到以下日志：
   ```
   🚀 MainPage mounted
   ⚠️ WebSocket 未连接，尝试重新连接...
   🔌 初始化 WebSocket 客户端
   📋 Token: 已设置
   📋 WS URL: http://localhost:8080/ws
   🏭 创建 WebSocket 连接...
   ✅ WebSocket 连接成功！
   📡 订阅私有消息队列: /user/queue/messages
   ✅ 私有消息队列订阅成功
   ```

3. **测试消息收发**
   - 发送消息，检查是否成功
   - 用另一个账号发送消息，检查是否能实时接收

## 常见问题排查

### 1. 后端未启动

**症状**：控制台显示连接失败，无法连接到 `http://localhost:8080/ws`

**解决**：
```bash
# 启动后端服务
cd backend
./mvnw spring-boot:run
```

### 2. 端口被占用

**症状**：后端启动失败，提示端口 8080 已被占用

**解决**：
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# 或修改后端端口
# application.yml 中修改 server.port
```

### 3. Token 过期

**症状**：WebSocket 连接失败，返回 401 未授权

**解决**：
- 重新登录获取新 Token
- 检查 Token 是否正确存储在 localStorage

### 4. CORS 问题

**症状**：浏览器控制台显示 CORS 错误

**解决**：
检查后端 CORS 配置（`WebSocketConfig.java`）：
```java
@Override
public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")  // 允许所有来源
            .withSockJS();
}
```

## 技术细节

### WebSocket 连接流程

1. **初始化**（`websocketService.initialize()`）
   - 创建 STOMP 客户端
   - 配置 SockJS 工厂
   - 设置连接头（Authorization Token）
   - 注册事件回调

2. **连接**（`websocketService.connect()`）
   - 激活 STOMP 客户端
   - 建立 WebSocket 连接
   - 触发 `onConnect` 回调

3. **订阅**（自动）
   - 订阅私有消息队列：`/user/queue/messages`
   - 订阅好友请求通知：`/user/queue/friend-requests`

4. **消息处理**
   - 接收消息 → 解密 → 更新 Store → 触发 UI 更新

### 连接状态管理

使用 `NetworkStore` 管理连接状态：

```typescript
enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING'
}
```

状态变化：
- 登录成功 → `DISCONNECTED`
- WebSocket 连接成功 → `CONNECTED`
- 连接断开 → `DISCONNECTED`
- 重连中 → `RECONNECTING`

## 修复文件

- ✅ `src/renderer/src/pages/main/MainPage.vue` - 添加 WebSocket 重连逻辑

## 测试结果

- ✅ 刷新页面后 WebSocket 自动重连
- ✅ 消息可以正常收发
- ✅ 好友请求实时推送正常
- ✅ 连接状态正确显示在标题栏

## 后续优化建议

1. **添加重连指数退避**
   - 当前重连延迟固定
   - 建议使用指数退避策略（1s, 2s, 4s, 8s...）

2. **添加连接超时检测**
   - 如果长时间无法连接，提示用户检查网络

3. **添加心跳检测**
   - 定期发送心跳包，检测连接是否真正可用

4. **优化用户体验**
   - 连接中显示加载动画
   - 连接失败显示友好提示
   - 提供手动重连按钮
