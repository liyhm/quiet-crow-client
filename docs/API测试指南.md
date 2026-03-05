# API 测试指南

## 前提条件

1. 后端服务已启动在 `http://localhost:8080`
2. 前端应用已安装依赖 `npm install`

## 测试步骤

### 1. 启动前端应用

```bash
npm run dev
```

### 2. 测试用户注册

打开浏览器控制台，执行：

```javascript
// 导入 authApi
const { authApi } = await import('./src/renderer/src/shared/api/auth')

// 注册新用户
const result = await authApi.register({
  username: 'testuser',
  password: '123456',
  nickname: 'Test User'
})

console.log('注册结果:', result)
```

### 3. 测试用户登录

```javascript
const { authApi } = await import('./src/renderer/src/shared/api/auth')

const result = await authApi.login({
  username: 'testuser',
  password: '123456'
})

console.log('登录结果:', result)
// 应该返回: { token: "eyJhbGciOiJIUzI1NiJ9..." }
```

### 4. 测试获取用户信息

```javascript
const { userApi } = await import('./src/renderer/src/shared/api/user')

const userInfo = await userApi.getInfo()
console.log('用户信息:', userInfo)
```

### 5. 测试会话密钥

```javascript
const { encryptionApi } = await import('./src/renderer/src/shared/api/encryption')

// 生成会话密钥
const keyResult = await encryptionApi.generateSessionKey('test-session-001')
console.log('会话密钥:', keyResult)
```

### 6. 测试加密/解密

```javascript
const { backendCrypto } = await import('./src/renderer/src/shared/lib/cryptoBackend')

// 使用上面获取的密钥
backendCrypto.setSessionKey('test-session-001', keyResult.aesKey)

// 加密
const encrypted = backendCrypto.encryptWithSession('test-session-001', 'Hello World')
console.log('加密后:', encrypted)

// 解密
const decrypted = backendCrypto.decryptWithSession('test-session-001', encrypted)
console.log('解密后:', decrypted)
// 应该输出: "Hello World"
```

### 7. 使用 Store 测试完整流程

```javascript
// 在 Vue 组件中或浏览器控制台

// 1. 登录
const authStore = useAuthStore()
await authStore.login({ username: 'testuser', password: '123456' })

// 2. 加载会话列表
const sessionStore = useSessionStore()
await sessionStore.loadSessions()
console.log('会话列表:', sessionStore.sessions)

// 3. 创建私聊（需要另一个用户ID）
const result = await sessionStore.createPrivateSession('other-user-id')
console.log('创建会话:', result)

// 4. 发送消息
const messageStore = useMessageStore()
await messageStore.sendMessage(result.sessionId, 'Hello from frontend!')

// 5. 加载历史消息
await messageStore.loadMessages(result.sessionId)
const messages = messageStore.getMessages(result.sessionId)
console.log('消息列表:', messages)
```

## 使用 Swagger UI 测试

访问 `http://localhost:8080/swagger-ui.html` 可以直接测试后端 API。

### 测试流程：

1. 先调用 `/api/auth/register` 注册用户
2. 调用 `/api/auth/login` 获取 token
3. 点击右上角 "Authorize" 按钮，输入 `Bearer {token}`
4. 现在可以测试其他需要认证的接口

## 常见问题

### Q: 请求返回 401 Unauthorized

A: Token 可能过期或无效，重新登录获取新 token

### Q: 请求返回 CORS 错误

A: 确保后端已配置 CORS，允许 `http://localhost:5173` 访问

### Q: WebSocket 连接失败

A: 检查后端 WebSocket 端点是否正确，确认是 `ws://localhost:8080/ws`

### Q: 消息解密失败

A: 确保会话密钥已正确获取和设置

## 调试技巧

### 查看网络请求

1. 打开浏览器开发者工具
2. 切换到 Network 标签
3. 筛选 XHR 请求查看 API 调用
4. 筛选 WS 查看 WebSocket 消息

### 查看 Store 状态

在 Vue DevTools 中可以查看 Pinia Store 的状态：

1. 安装 Vue DevTools 浏览器扩展
2. 打开 DevTools
3. 切换到 Vue 标签
4. 查看 Pinia 状态

### 查看加密日志

所有加密操作都会在控制台输出日志，可以通过以下方式查看：

```javascript
// 启用详细日志
localStorage.setItem('debug', 'crypto:*')
```

## 性能测试

### 测试消息发送速度

```javascript
const messageStore = useMessageStore()
const sessionId = 'your-session-id'

console.time('send-100-messages')
for (let i = 0; i < 100; i++) {
  await messageStore.sendMessage(sessionId, `Test message ${i}`)
}
console.timeEnd('send-100-messages')
```

### 测试消息解密速度

```javascript
const messageStore = useMessageStore()
const sessionId = 'your-session-id'

console.time('load-messages')
await messageStore.loadMessages(sessionId)
console.timeEnd('load-messages')
```

## 下一步

完成 API 测试后，可以：

1. 在 LoginPage.vue 中集成真实登录
2. 在 MainPage.vue 中加载会话和消息
3. 实现 WebSocket 实时消息接收
4. 添加文件上传功能
5. 实现好友管理功能
