# Quiet Crow - 后端 API 需求文档

## 📋 目录

1. [技术栈要求](#技术栈要求)
2. [认证与授权](#认证与授权)
3. [REST API 接口](#rest-api-接口)
4. [WebSocket 接口](#websocket-接口)
5. [数据库设计](#数据库设计)
6. [加密密钥管理](#加密密钥管理)
7. [文件存储](#文件存储)
8. [部署要求](#部署要求)

---

## 技术栈要求

### 推荐技术栈

- **后端框架**: Spring Boot 3.x / Node.js (NestJS)
- **数据库**: PostgreSQL / MySQL
- **缓存**: Redis
- **消息队列**: RabbitMQ / Kafka（可选）
- **WebSocket**: STOMP over SockJS
- **对象存储**: MinIO / AWS S3 / 阿里云 OSS
- **认证**: JWT (JSON Web Token)

### 必需功能

- ✅ RESTful API
- ✅ WebSocket (STOMP 协议)
- ✅ JWT 认证
- ✅ 数据库持久化
- ✅ 文件上传/下载
- ✅ 公钥存储和分发

---

## 认证与授权

### JWT Token 格式

```json
{
  "sub": "user-id",
  "username": "username",
  "role": "ROLE_USER",
  "exp": 1234567890,
  "iat": 1234567890
}
```

### 认证流程

1. 用户登录 → 返回 JWT Token
2. 客户端存储 Token 到 localStorage
3. 后续请求在 Header 中携带：`Authorization: Bearer <token>`
4. WebSocket 连接时在 `connectHeaders` 中携带 Token

---

## REST API 接口

### 1. 用户认证

#### 1.1 用户注册

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string",
  "displayName": "string"
}
```

**响应：**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "string",
    "username": "string"
  }
}
```

#### 1.2 用户登录

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "token": "jwt-token-string",
    "userId": "string",
    "username": "string",
    "displayName": "string",
    "email": "string",
    "publicKey": "base64-encoded-public-key"
  }
}
```

#### 1.3 刷新 Token

```http
POST /api/auth/refresh
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token"
  }
}
```

#### 1.4 登出

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

### 2. 用户管理

#### 2.1 获取当前用户信息

```http
GET /api/users/me
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "username": "string",
    "displayName": "string",
    "avatar": "string",
    "email": "string",
    "status": "ONLINE",
    "statusMessage": "string",
    "publicKey": "base64-string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 2.2 更新用户信息

```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "string",
  "avatar": "string",
  "statusMessage": "string"
}
```

#### 2.3 搜索用户

```http
GET /api/users/search?q=username
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "username": "string",
      "displayName": "string",
      "avatar": "string",
      "status": "ONLINE"
    }
  ]
}
```

#### 2.4 获取用户公钥

```http
GET /api/users/{userId}/public-key
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": {
    "userId": "string",
    "publicKey": "base64-encoded-rsa-public-key"
  }
}
```

---

### 3. 密钥管理

#### 3.1 上传公钥

```http
POST /api/keys/public
Authorization: Bearer <token>
Content-Type: application/json

{
  "publicKey": "base64-encoded-rsa-public-key"
}
```

**说明：**

- 用户首次登录时生成 RSA 密钥对
- 私钥存储在客户端 OS 安全区域
- 公钥上传到服务器供其他用户加密会话密钥

#### 3.2 获取多个用户的公钥

```http
POST /api/keys/public/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user-id-1", "user-id-2"]
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "user-id-1": "base64-public-key-1",
    "user-id-2": "base64-public-key-2"
  }
}
```

---

### 4. 会话管理

#### 4.1 获取会话列表

```http
GET /api/sessions
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "id": "session-id",
      "type": "PRIVATE",
      "name": "张三",
      "avatar": "url",
      "participants": ["user-id-1", "user-id-2"],
      "lastMessage": "最新消息内容",
      "lastMessageTime": "2024-01-01T00:00:00Z",
      "unreadCount": 3,
      "isPinned": false,
      "isMuted": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 4.2 创建私聊会话

```http
POST /api/sessions/private
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": "user-id"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "sessionId": "session-id",
    "type": "PRIVATE",
    "participants": ["current-user-id", "target-user-id"]
  }
}
```

#### 4.3 创建群聊会话

```http
POST /api/sessions/group
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "群聊名称",
  "memberIds": ["user-id-1", "user-id-2", "user-id-3"]
}
```

#### 4.4 获取会话详情

```http
GET /api/sessions/{sessionId}
Authorization: Bearer <token>
```

#### 4.5 更新会话设置

```http
PUT /api/sessions/{sessionId}/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "isPinned": true,
  "isMuted": false
}
```

---

### 5. 消息管理

#### 5.1 获取历史消息

```http
GET /api/sessions/{sessionId}/messages?cursor=message-id&limit=50
Authorization: Bearer <token>
```

**参数说明：**

- `cursor`: 最后一条消息 ID（用于分页）
- `limit`: 每页消息数量（默认 50）

**响应：**

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-id",
        "sessionId": "session-id",
        "senderId": "user-id",
        "content": "base64-encrypted-content",
        "iv": "base64-iv",
        "authTag": "base64-auth-tag",
        "timestamp": "2024-01-01T00:00:00Z",
        "type": "TEXT",
        "isRead": false
      }
    ],
    "hasMore": true,
    "nextCursor": "next-message-id"
  }
}
```

#### 5.2 标记消息已读

```http
POST /api/sessions/{sessionId}/messages/read
Authorization: Bearer <token>
Content-Type: application/json

{
  "messageIds": ["msg-id-1", "msg-id-2"]
}
```

#### 5.3 删除消息

```http
DELETE /api/messages/{messageId}
Authorization: Bearer <token>
```

---

### 6. 文件管理

#### 6.1 上传文件

```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary-data>
sessionId: <session-id>
```

**响应：**

```json
{
  "success": true,
  "data": {
    "fileId": "file-id",
    "fileName": "original-name.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "url": "https://storage.example.com/files/xxx",
    "thumbnail": "https://storage.example.com/thumbnails/xxx"
  }
}
```

**说明：**

- 客户端先用 AES-GCM 加密文件
- 上传加密后的文件到服务器
- 服务器存储到对象存储（MinIO/S3）
- 返回文件 URL

#### 6.2 下载文件

```http
GET /api/files/{fileId}
Authorization: Bearer <token>
```

**响应：**

- 返回加密的文件二进制数据
- 客户端下载后用 AES-GCM 解密

---

### 7. 联系人管理

#### 7.1 获取联系人列表

```http
GET /api/contacts
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": [
    {
      "userId": "user-id",
      "username": "username",
      "displayName": "显示名称",
      "avatar": "url",
      "status": "ONLINE",
      "statusMessage": "状态消息",
      "tags": ["朋友", "同事"],
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 7.2 添加好友

```http
POST /api/contacts/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": "user-id",
  "message": "你好，我想加你为好友"
}
```

#### 7.3 处理好友请求

```http
POST /api/contacts/requests/{requestId}/accept
Authorization: Bearer <token>
```

```http
POST /api/contacts/requests/{requestId}/reject
Authorization: Bearer <token>
```

#### 7.4 删除联系人

```http
DELETE /api/contacts/{userId}
Authorization: Bearer <token>
```

---

## WebSocket 接口

### 连接配置

```javascript
// 客户端连接示例
const client = new Client({
  webSocketFactory: () => new SockJS('http://your-server.com/ws'),
  connectHeaders: {
    Authorization: 'Bearer <jwt-token>'
  },
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000
})
```

### 订阅频道

#### 1. 私人消息队列

```
订阅: /user/queue/messages
```

**消息格式：**

```json
{
  "id": "message-id",
  "sessionId": "session-id",
  "senderId": "user-id",
  "content": "base64-encrypted-content",
  "iv": "base64-iv",
  "authTag": "base64-auth-tag",
  "timestamp": "2024-01-01T00:00:00Z",
  "type": "TEXT"
}
```

#### 2. 会话消息频道

```
订阅: /topic/sessions/{sessionId}
```

**用途：**

- 群聊消息广播
- 会话状态更新
- 成员变更通知

### 发送消息

#### 1. 发送聊天消息

```
目标: /app/chat/{sessionId}
```

**消息体：**

```json
{
  "sessionId": "session-id",
  "content": "base64-encrypted-content",
  "iv": "base64-iv",
  "authTag": "base64-auth-tag",
  "type": "TEXT"
}
```

**服务器处理：**

1. 验证 JWT Token
2. 检查用户是否在该会话中
3. 保存消息到数据库
4. 推送给会话中的其他在线用户
5. 离线用户存入离线消息队列

#### 2. 同步离线消息

```
目标: /app/sync
```

**消息体：**

```json
{
  "sessionId": "session-id",
  "cursor": "last-message-id"
}
```

**服务器响应：**

- 返回 cursor 之后的所有消息
- 通过 `/user/queue/messages` 推送

#### 3. 输入状态通知

```
目标: /app/typing/{sessionId}
```

**消息体：**

```json
{
  "sessionId": "session-id",
  "isTyping": true
}
```

#### 4. 已读回执

```
目标: /app/read/{sessionId}
```

**消息体：**

```json
{
  "sessionId": "session-id",
  "messageIds": ["msg-id-1", "msg-id-2"]
}
```

---

## 数据库设计

### 1. 用户表 (users)

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar VARCHAR(500),
    status VARCHAR(20) DEFAULT 'OFFLINE',
    status_message VARCHAR(200),
    public_key TEXT,
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);
```

### 2. 会话表 (sessions)

```sql
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- PRIVATE, GROUP
    name VARCHAR(100),
    avatar VARCHAR(500),
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 3. 会话成员表 (session_members)

```sql
CREATE TABLE session_members (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER
    is_pinned BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_message_id VARCHAR(36),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session_user (session_id, user_id),
    INDEX idx_user_sessions (user_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_session_user (session_id, user_id)
);
```

### 4. 消息表 (messages)

```sql
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL, -- 加密内容
    iv VARCHAR(100) NOT NULL, -- 初始化向量
    auth_tag VARCHAR(100) NOT NULL, -- 认证标签
    type VARCHAR(20) DEFAULT 'TEXT', -- TEXT, IMAGE, FILE, SYSTEM
    file_id VARCHAR(36),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    INDEX idx_session_time (session_id, timestamp),
    INDEX idx_sender (sender_id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);
```

### 5. 消息已读状态表 (message_reads)

```sql
CREATE TABLE message_reads (
    id VARCHAR(36) PRIMARY KEY,
    message_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_message_user (message_id, user_id),
    INDEX idx_user_reads (user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_message_user (message_id, user_id)
);
```

### 6. 联系人表 (contacts)

```sql
CREATE TABLE contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    contact_user_id VARCHAR(36) NOT NULL,
    tags VARCHAR(500), -- JSON 数组
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_contacts (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_contact (user_id, contact_user_id)
);
```

### 7. 好友请求表 (friend_requests)

```sql
CREATE TABLE friend_requests (
    id VARCHAR(36) PRIMARY KEY,
    from_user_id VARCHAR(36) NOT NULL,
    to_user_id VARCHAR(36) NOT NULL,
    message VARCHAR(500),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_to_user (to_user_id, status),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 8. 文件表 (files)

```sql
CREATE TABLE files (
    id VARCHAR(36) PRIMARY KEY,
    uploader_id VARCHAR(36) NOT NULL,
    session_id VARCHAR(36),
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    storage_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    is_encrypted BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_session (session_id),
    INDEX idx_uploader (uploader_id),
    FOREIGN KEY (uploader_id) REFERENCES users(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);
```

---

## 加密密钥管理

### 密钥协商流程

#### 1. 用户 A 想给用户 B 发送消息

```
1. A 生成 AES-256 会话密钥
2. A 从服务器获取 B 的 RSA 公钥
3. A 用 B 的公钥加密 AES 密钥
4. A 将加密后的 AES 密钥发送给服务器
5. 服务器转发给 B
6. B 用自己的 RSA 私钥解密得到 AES 密钥
7. 双方使用相同的 AES 密钥加密/解密消息
```

### API 接口

#### 发送加密的会话密钥

```http
POST /api/sessions/{sessionId}/keys
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "user-id",
  "encryptedKey": "base64-rsa-encrypted-aes-key"
}
```

#### 获取会话密钥

```http
GET /api/sessions/{sessionId}/keys
Authorization: Bearer <token>
```

**响应：**

```json
{
  "success": true,
  "data": {
    "senderId": "user-id",
    "encryptedKey": "base64-rsa-encrypted-aes-key",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

---

## 文件存储

### 对象存储配置

推荐使用 MinIO（开源）或云服务商的对象存储：

```yaml
# MinIO 配置示例
minio:
  endpoint: http://localhost:9000
  accessKey: minioadmin
  secretKey: minioadmin
  bucket: quiet-crow-files
  region: us-east-1
```

### 文件上传流程

```
1. 客户端用 AES-GCM 加密文件
2. 上传加密文件到服务器
3. 服务器存储到对象存储
4. 返回文件 ID 和 URL
5. 客户端发送包含文件引用的消息
```

### 文件下载流程

```
1. 客户端请求文件 URL
2. 服务器验证权限
3. 返回对象存储的临时访问 URL
4. 客户端下载加密文件
5. 客户端用 AES-GCM 解密文件
```

---

## 部署要求

### 服务器配置

```yaml
最低配置:
  CPU: 2 核
  内存: 4GB
  硬盘: 50GB SSD
  带宽: 10Mbps

推荐配置:
  CPU: 4 核
  内存: 8GB
  硬盘: 100GB SSD
  带宽: 100Mbps
```

### 端口配置

```
HTTP API: 8080
WebSocket: 8080/ws
数据库: 5432 (PostgreSQL) / 3306 (MySQL)
Redis: 6379
MinIO: 9000
```

### 环境变量

```bash
# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quiet_crow
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400

# 对象存储
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=quiet-crow-files

# 服务器
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
```

---

## 安全建议

### 1. 密码安全

- ✅ 使用 bcrypt 或 Argon2 加密密码
- ✅ 密码强度验证（至少 8 位，包含大小写字母和数字）
- ✅ 防止暴力破解（登录失败次数限制）

### 2. Token 安全

- ✅ JWT Token 设置合理的过期时间（1-7 天）
- ✅ 支持 Token 刷新机制
- ✅ 支持 Token 撤销（黑名单）

### 3. API 安全

- ✅ 所有 API 使用 HTTPS
- ✅ 实施速率限制（Rate Limiting）
- ✅ 输入验证和 SQL 注入防护
- ✅ CORS 配置

### 4. WebSocket 安全

- ✅ 使用 WSS（WebSocket over TLS）
- ✅ 连接时验证 JWT Token
- ✅ 心跳检测防止僵尸连接

### 5. 数据安全

- ✅ 数据库连接加密
- ✅ 敏感数据加密存储
- ✅ 定期备份
- ✅ 访问日志记录

---

## 测试要求

### 1. 单元测试

- ✅ 所有 Service 层方法
- ✅ 加密/解密逻辑
- ✅ 工具类函数

### 2. 集成测试

- ✅ API 接口测试
- ✅ WebSocket 连接测试
- ✅ 数据库操作测试

### 3. 性能测试

- ✅ 并发连接测试（1000+ 用户）
- ✅ 消息吞吐量测试
- ✅ 数据库查询性能

---

## 监控与日志

### 日志记录

```
必需日志:
- 用户登录/登出
- API 请求（包含 IP、时间、响应时间）
- WebSocket 连接/断开
- 错误和异常
- 数据库操作
```

### 监控指标

```
系统指标:
- CPU 使用率
- 内存使用率
- 磁盘使用率
- 网络流量

应用指标:
- 在线用户数
- WebSocket 连接数
- API 请求 QPS
- 消息发送速率
- 数据库连接池状态
```

---

## 开发优先级

### Phase 1 - 核心功能（必需）

1. ✅ 用户注册/登录
2. ✅ JWT 认证
3. ✅ 公钥上传/获取
4. ✅ 创建私聊会话
5. ✅ WebSocket 消息收发
6. ✅ 历史消息查询

### Phase 2 - 基础功能

1. ✅ 联系人管理
2. ✅ 好友请求
3. ✅ 会话列表
4. ✅ 未读消息计数
5. ✅ 离线消息同步

### Phase 3 - 高级功能

1. ⏳ 群聊功能
2. ⏳ 文件上传/下载
3. ⏳ 已读回执
4. ⏳ 输入状态提示
5. ⏳ 消息撤回

### Phase 4 - 扩展功能

1. ⏳ 语音/视频通话
2. ⏳ 表情包
3. ⏳ 消息引用
4. ⏳ @提及功能

---

## 联系方式

如有疑问，请联系前端开发团队。

**文档版本**: v1.0  
**最后更新**: 2024-02-26
