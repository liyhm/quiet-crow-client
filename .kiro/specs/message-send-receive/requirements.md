# Requirements Document

## Introduction

本文档定义了即时通讯应用中消息发送与接收功能的需求。该功能允许用户在选定的会话中实时发送和接收端到端加密的文本消息，通过 WebSocket 进行实时通信，并支持历史消息的加载。

## Glossary

- **Message_System**: 消息发送与接收系统，负责处理消息的创建、加密、传输、接收、解密和显示
- **WebSocket_Client**: WebSocket 客户端，负责与后端建立持久连接并进行实时消息传输
- **Crypto_Module**: 加密模块，负责消息内容的 AES 加密和解密
- **Message_Store**: 消息状态管理器，使用 Pinia 管理消息数据
- **Session**: 会话，表示用户之间的聊天对话
- **Encrypted_Content**: 加密内容，使用 AES 算法加密后的消息文本
- **Message_History**: 历史消息，存储在后端的过往消息记录
- **Chat_Interface**: 聊天界面，用户输入和查看消息的 UI 组件

## Requirements

### Requirement 1: 发送文本消息

**User Story:** 作为用户，我希望能够在聊天界面输入并发送文本消息，以便与其他用户进行交流。

#### Acceptance Criteria

1. WHEN 用户在输入框中输入非空文本并按下 Enter 键或点击发送按钮，THEN THE Message_System SHALL 创建一条新消息
2. WHEN 用户尝试发送空消息或仅包含空白字符的消息，THEN THE Message_System SHALL 阻止发送并保持当前状态
3. WHEN 消息创建成功，THEN THE Message_System SHALL 清空输入框并保持输入框焦点
4. WHEN 消息发送中，THEN THE Chat_Interface SHALL 显示发送状态指示器

### Requirement 2: 消息加密

**User Story:** 作为用户，我希望我的消息内容被加密后再发送，以保护我的隐私和通信安全。

#### Acceptance Criteria

1. WHEN 消息准备发送，THEN THE Crypto_Module SHALL 使用 AES 算法加密消息内容
2. WHEN 加密失败，THEN THE Message_System SHALL 阻止消息发送并向用户显示错误提示
3. THE Crypto_Module SHALL 确保每条消息使用会话密钥进行加密
4. WHEN 消息加密完成，THEN THE Message_System SHALL 将加密后的内容传递给 WebSocket_Client

### Requirement 3: WebSocket 实时传输

**User Story:** 作为用户，我希望消息能够实时传输到接收方，以实现即时通讯体验。

#### Acceptance Criteria

1. WHEN 消息加密完成，THEN THE WebSocket_Client SHALL 通过 WebSocket 连接发送消息到后端
2. THE WebSocket_Client SHALL 使用格式 `{ type: "CHAT_MESSAGE", sessionId: string, content: string, messageType: "TEXT" }` 发送消息
3. WHEN WebSocket 连接断开，THEN THE Message_System SHALL 缓存待发送消息并在重连后自动发送
4. WHEN 消息发送失败，THEN THE Message_System SHALL 向用户显示错误提示并提供重试选项
5. WHEN 消息发送成功，THEN THE Message_System SHALL 更新消息状态为已发送

### Requirement 4: 接收实时消息

**User Story:** 作为用户，我希望能够实时接收其他用户发送的消息，以便及时了解对话内容。

#### Acceptance Criteria

1. WHEN WebSocket_Client 接收到类型为 "CHAT_MESSAGE" 的消息，THEN THE Message_System SHALL 处理该消息
2. THE Message_System SHALL 验证接收到的消息包含必需字段：messageId, sessionId, sendUser, content, messageType, sendTime
3. WHEN 接收到的消息属于当前打开的会话，THEN THE Message_System SHALL 立即显示该消息
4. WHEN 接收到的消息属于其他会话，THEN THE Message_System SHALL 更新该会话的未读消息计数

### Requirement 5: 消息解密

**User Story:** 作为用户，我希望接收到的加密消息能够自动解密并显示，以便我能够阅读消息内容。

#### Acceptance Criteria

1. WHEN 接收到加密消息，THEN THE Crypto_Module SHALL 使用会话密钥解密消息内容
2. WHEN 解密失败，THEN THE Message_System SHALL 显示消息解密失败的提示而不是原始加密内容
3. WHEN 解密成功，THEN THE Message_System SHALL 将解密后的内容存储到 Message_Store
4. THE Crypto_Module SHALL 确保解密操作不阻塞 UI 线程

### Requirement 6: 消息列表显示

**User Story:** 作为用户，我希望看到清晰的消息列表，包含发送者、时间和内容，以便我能够理解对话的上下文。

#### Acceptance Criteria

1. WHEN 消息列表渲染，THEN THE Chat_Interface SHALL 显示每条消息的发送者信息
2. WHEN 消息列表渲染，THEN THE Chat_Interface SHALL 显示每条消息的发送时间（格式化为易读格式）
3. WHEN 消息列表渲染，THEN THE Chat_Interface SHALL 显示每条消息的解密后内容
4. THE Chat_Interface SHALL 区分显示当前用户发送的消息和其他用户发送的消息
5. WHEN 新消息添加到列表，THEN THE Chat_Interface SHALL 自动滚动到最新消息

### Requirement 7: 加载历史消息

**User Story:** 作为用户，我希望能够查看历史消息记录，以便回顾之前的对话内容。

#### Acceptance Criteria

1. WHEN 用户打开一个会话，THEN THE Message_System SHALL 从后端加载该会话的最新消息
2. THE Message_System SHALL 使用 API 端点 `GET /api/session/{sessionId}/messages` 获取历史消息
3. WHEN 用户滚动到消息列表顶部，THEN THE Message_System SHALL 自动加载更早的历史消息（分页加载）
4. WHEN 加载历史消息时，THEN THE Chat_Interface SHALL 显示加载指示器
5. WHEN 没有更多历史消息可加载，THEN THE Message_System SHALL 停止尝试加载并显示提示
6. WHEN 历史消息加载完成，THEN THE Crypto_Module SHALL 批量解密所有加密消息

### Requirement 8: 错误处理

**User Story:** 作为用户，当消息发送或接收过程中出现错误时，我希望收到清晰的错误提示，以便我了解问题并采取相应措施。

#### Acceptance Criteria

1. WHEN 消息发送失败，THEN THE Message_System SHALL 在消息旁显示失败图标和错误提示
2. WHEN 网络连接断开，THEN THE Message_System SHALL 显示连接状态提示
3. WHEN 加密或解密失败，THEN THE Message_System SHALL 记录错误日志并向用户显示友好的错误消息
4. WHEN API 请求失败，THEN THE Message_System SHALL 显示具体的错误原因（如网络错误、服务器错误等）
5. THE Message_System SHALL 为所有错误情况提供重试机制

### Requirement 9: 消息状态管理

**User Story:** 作为开发者，我希望消息状态能够正确管理，以确保应用的数据一致性和可靠性。

#### Acceptance Criteria

1. THE Message_Store SHALL 维护每个会话的消息列表
2. WHEN 消息发送，THE Message_Store SHALL 立即添加消息到本地状态（乐观更新）
3. WHEN 收到服务器确认，THE Message_Store SHALL 更新消息的服务器 ID 和状态
4. THE Message_Store SHALL 按发送时间排序消息列表
5. WHEN 用户切换会话，THE Message_Store SHALL 保留之前会话的消息状态

### Requirement 10: 性能优化

**User Story:** 作为用户，我希望消息功能响应迅速且流畅，即使在处理大量消息时也不会卡顿。

#### Acceptance Criteria

1. WHEN 消息列表包含超过 100 条消息，THEN THE Chat_Interface SHALL 使用虚拟滚动优化渲染性能
2. THE Crypto_Module SHALL 在 Web Worker 中执行加密和解密操作，避免阻塞主线程
3. WHEN 批量加载历史消息，THE Message_System SHALL 限制单次加载数量不超过 50 条
4. THE Message_System SHALL 缓存已解密的消息内容，避免重复解密
5. WHEN 用户快速输入，THE Chat_Interface SHALL 防抖处理输入事件以优化性能

## Technical Constraints

1. **前端框架**: 必须使用 Vue 3 + TypeScript + Pinia 实现
2. **架构模式**: 必须遵循 Feature-Sliced Design 架构
3. **WebSocket 实现**: 必须使用现有的 `src/renderer/src/shared/api/websocket.ts` 实现
4. **加密库**: 必须使用现有的 `src/renderer/src/shared/lib/crypto.ts` 和 `cryptoBackend.ts` 实现
5. **状态管理**: 必须使用 `src/renderer/src/entities/message/model/useMessageStore.ts` 管理消息状态
6. **API 配置**: 必须使用 `src/renderer/src/shared/config/api.ts` 中配置的端点
7. **消息格式**: 必须遵循指定的 WebSocket 消息格式
8. **加密算法**: 必须使用 AES 算法进行端到端加密
9. **浏览器兼容性**: 必须支持现代浏览器（Chrome, Firefox, Edge 最新版本）
10. **响应式设计**: UI 组件必须适配不同屏幕尺寸

## Non-Functional Requirements

1. **安全性**: 所有消息内容必须在客户端加密后再传输
2. **可靠性**: 消息发送失败时必须提供重试机制
3. **性能**: 消息发送延迟应小于 500ms（在正常网络条件下）
4. **可用性**: UI 必须提供清晰的状态反馈和错误提示
5. **可维护性**: 代码必须遵循 TypeScript 最佳实践和项目代码规范
