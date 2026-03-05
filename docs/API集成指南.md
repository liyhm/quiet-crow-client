# API 集成指南

## ✅ 已完成的工作

### 1. API 配置

- ✅ 创建 `src/renderer/src/shared/config/api.ts` - API 配置和端点定义
- ✅ 后端地址已配置为 `http://localhost:8080`
- ✅ WebSocket 地址已配置为 `ws://localhost:8080/ws`

### 2. HTTP 请求封装

- ✅ 创建 `src/renderer/src/shared/api/request.ts` - Axios 实例
- ✅ 自动添加 Authorization Token
- ✅ 统一响应格式处理
- ✅ Token 过期自动跳转登录

### 3. API 服务层

已创建以下 API 服务：

#### 认证 API (`auth.ts`)

- `authApi.register()` - 用户注册
- `authApi.login()` - 用户登录
- `authApi.refresh()` - 刷新 Token

#### 用户 API (`user.ts`)

- `userApi.getInfo()` - 获取当前用户信息
- `userApi.search()` - 搜索用户
- `userApi.update()` - 更新用户信息

#### 会话 API (`session.ts`)

- `sessionApi.getMySessions()` - 获取会话列表
- `sessionApi.createPrivate()` - 创建私聊
- `sessionApi.createGroup()` - 创建群聊
- `sessionApi.getMessages()` - 获取历史消息
- `sessionApi.markAsRead()` - 标记已读

#### 加密 API (`encryption.ts`)

- `encryptionApi.getMyPublicKey()` - 获取自己的公钥
- `encryptionApi.getUserPublicKey()` - 获取用户公钥
- `encryptionApi.getBatchPublicKeys()` - 批量获取公钥
- `encryptionApi.generateSessionKey()` - 生成会话密钥
- `encryptionApi.getSessionKey()` - 获取会话密钥

#### 联系人 API (`contacts.ts`)

- `contactsApi.getList()` - 获取好友列表
- `contactsApi.sendRequest()` - 发送好友请求
- `contactsApi.getPendingRequests()` - 获取待处理请求
- `contactsApi.acceptRequest()` - 接受好友请求
- `contactsApi.rejectRequest()` - 拒绝好友请求
- `contactsApi.deleteFriend()` - 删除好友

### 4. 加密实现

- ✅ 创建 `src/renderer/src/shared/lib/cryptoBackend.ts`
- ✅ 使用 AES-ECB 模式（与后端一致）
- ✅ 基于 crypto-js 库实现
- ✅ 会话密钥管理

### 5. Store 更新

已更新以下 Store 以对接真实 API：

#### AuthStore

- ✅ 真实登录/注册 API 调用
- ✅ Token 管理
- ✅ 用户信息获取

#### SessionStore

- ✅ 从后端加载会话列表
- ✅ 创建私聊会话

#### MessageStore

- ✅ 加载历史消息并解密
- ✅ 发送加密消息
- ✅ 接收并解密消息
- ✅ 自动获取/生成会话密钥

### 6. WebSocket 更新

- ✅ 连接地址改为 localhost:8080
- ✅ 消息加密/解密集成

## 📝 使用示例

### 登录

```typescript
import { useAuthStore } from '@/entities/user/model/useAuthStore'

const authStore = useAuthStore()
const result = await authStore.login({
  username: 'alice',
  password: '123456'
})

if (result.success) {
  console.log('登录成功')
}
```

### 注册

```typescript
const result = await authStore.register({
  username: 'bob',
  password: '123456',
  nickname: 'Bob'
})
```

### 加载会话列表

```typescript
import { useSessionStore } from '@/entities/session/model/useSessionStore'

const sessionStore = useSessionStore()
await sessionStore.loadSessions()
```

### 创建私聊

```typescript
const result = await sessionStore.createPrivateSession('user-id-123')
if (result.success) {
  console.log('会话ID:', result.sessionId)
}
```

### 发送消息

```typescript
import { useMessageStore } from '@/entities/message/model/useMessageStore'

const messageStore = useMessageStore()
await messageStore.sendMessage('session-id', 'Hello World')
```

### 加载历史消息

```typescript
await messageStore.loadMessages('session-id')
const messages = messageStore.getMessages('session-id')
```

## 🔧 后续需要完成的工作

### 1. 登录页面集成

需要在 `LoginPage.vue` 中调用真实的登录 API

### 2. 会话列表加载

在应用启动时加载用户的会话列表

### 3. 消息历史加载

切换会话时自动加载历史消息

### 4. WebSocket 连接

登录成功后自动连接 WebSocket

### 5. 文件上传

实现图片和文件的上传功能

### 6. 好友管理

实现好友列表、添加好友、好友请求等功能

## 🚀 快速测试

### 1. 启动后端

确保后端已在 `http://localhost:8080` 运行

### 2. 启动前端

```bash
npm run dev
```

### 3. 测试登录

1. 打开应用
2. 使用后端已有的账号登录
3. 查看控制台日志确认 API 调用

### 4. 测试消息发送

1. 选择一个会话
2. 发送消息
3. 查看 Network 面板确认 WebSocket 消息

## 📚 相关文件

### 配置

- `src/renderer/src/shared/config/api.ts` - API 配置

### API 服务

- `src/renderer/src/shared/api/request.ts` - HTTP 客户端
- `src/renderer/src/shared/api/auth.ts` - 认证 API
- `src/renderer/src/shared/api/user.ts` - 用户 API
- `src/renderer/src/shared/api/session.ts` - 会话 API
- `src/renderer/src/shared/api/encryption.ts` - 加密 API
- `src/renderer/src/shared/api/contacts.ts` - 联系人 API
- `src/renderer/src/shared/api/websocket.ts` - WebSocket 服务

### 加密

- `src/renderer/src/shared/lib/cryptoBackend.ts` - 后端兼容加密

### Store

- `src/renderer/src/entities/user/model/useAuthStore.ts` - 认证状态
- `src/renderer/src/entities/session/model/useSessionStore.ts` - 会话状态
- `src/renderer/src/entities/message/model/useMessageStore.ts` - 消息状态

## ⚠️ 注意事项

1. **Token 存储**: Token 存储在 localStorage 的 `chat_token` 键中
2. **加密模式**: 使用 AES-ECB 模式与后端保持一致
3. **会话密钥**: 首次发送消息时自动获取/生成会话密钥
4. **错误处理**: 所有 API 调用都有错误处理，失败时返回 `{ success: false, error: string }`
5. **WebSocket 重连**: 目前禁用了自动重连（Demo 模式），生产环境需要启用

## 🐛 调试技巧

### 查看 API 请求

打开浏览器开发者工具 -> Network 标签

### 查看 WebSocket 消息

开发者工具 -> Network -> WS 标签

### 查看加密/解密日志

所有加密操作都有 console.log，可以在控制台查看

### 测试加密

```typescript
import { backendCrypto } from '@/shared/lib/cryptoBackend'

// 设置测试密钥
const testKey = 'xK9mP2vN8qR5tY7wZ3bC6dF1gH4jL0sA=='
backendCrypto.setSessionKey('test-session', testKey)

// 加密
const encrypted = backendCrypto.encryptWithSession('test-session', 'Hello')
console.log('加密:', encrypted)

// 解密
const decrypted = backendCrypto.decryptWithSession('test-session', encrypted)
console.log('解密:', decrypted)
```

## 📞 需要帮助？

如果遇到问题：

1. 检查后端是否正常运行
2. 检查浏览器控制台的错误信息
3. 检查 Network 面板的 API 响应
4. 确认 Token 是否正确保存
