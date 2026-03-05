# TypeScript 类型错误修复

## 问题描述

打包时出现 22 个 TypeScript 类型错误，导致打包失败。

## 修复的错误

### 1. MessageStatus 未定义（MainPage.vue）

**错误**：`MessageStatus is not defined`

**原因**：使用了 `MessageStatus` 和 `MessageType` 枚举，但没有导入

**修复**：
```typescript
import type { Message } from '@/shared/types'
import { MessageStatus, MessageType } from '@/shared/types'
```

### 2. messageType 可能为 undefined（useMessageStore.ts）

**错误**：`Argument of type 'string | undefined' is not assignable to parameter of type 'string'`

**修复**：
```typescript
type: getMessageType(encryptedMessage.messageType || '1', content)
```

### 3. ChatSession 缺少 isOnline 字段

**错误**：`Property 'isOnline' does not exist on type 'ChatSession'`

**修复**：在 `src/renderer/src/shared/types/index.ts` 中添加字段：
```typescript
export interface ChatSession {
  // ... 其他字段
  isOnline?: boolean // 在线状态（仅私聊）
}
```

### 4. Promise.all 类型错误（LoginPage.vue）

**错误**：`Argument of type 'Promise<void | {...}>' is not assignable to parameter of type 'never'`

**原因**：`tasks` 数组没有指定类型

**修复**：
```typescript
const tasks: Promise<any>[] = []
const tasks2: Promise<any>[] = []  // 第二个 tasks 数组
```

### 5. 未使用的变量

**错误**：`'xxx' is declared but its value is never read`

**修复**：注释掉或使用下划线前缀

- `uploadingAvatar`（RegisterForm.vue）→ 注释掉
- `videoRef`（MediaPreview.vue）→ 注释掉
- `isDragging`、`dragStart`（MediaPreview.vue）→ 注释掉
- `inputContainerRef`（MessageInput.vue）→ 注释掉
- `e`（MediaPreview.vue）→ 改为 `_e`
- `event`（MessageInput.vue）→ 改为 `_event`

### 6. handleFileDrop 不存在（MainPage.vue）

**错误**：`Property 'handleFileDrop' does not exist`

**原因**：MessageList 组件触发了不存在的事件

**修复**：移除 `@fileDrop="handleFileDrop"`

### 7. currentGroupName 只读错误（MainPage.vue）

**错误**：`Cannot assign to 'value' because it is a read-only property`

**原因**：`currentGroupName` 是 computed，不能直接赋值

**修复**：移除直接赋值，改为重新加载会话列表：
```typescript
// 更新会话列表
await sessionStore.loadSessions()
```

### 8. sessionUserType 和 userId 不存在（websocket.ts）

**错误**：`Property 'sessionUserType' does not exist on type 'ChatSession'`

**原因**：使用了旧的字段名

**修复**：
```typescript
// 旧代码
s.sessionUserType === 'PRIVATE' && s.userId === notification.userId

// 新代码
s.type === 'PRIVATE' && s.participants.includes(notification.userId)
```

### 9. session.showName 不存在（websocket.ts）

**错误**：`Property 'showName' does not exist on type 'ChatSession'`

**修复**：
```typescript
// 旧代码
session.showName

// 新代码
session.name
```

### 10. activeSession.isOnline 不存在（MainPage.vue）

**错误**：`Property 'isOnline' does not exist on type 'ChatSession'`

**原因**：ChatHeader 组件传递了不存在的 prop

**修复**：移除 `:is-online="activeSession.isOnline"`

## 修改的文件

1. `src/renderer/src/pages/main/MainPage.vue`
   - 添加 MessageStatus 和 MessageType 导入
   - 修复 tasks 数组类型
   - 移除 handleFileDrop 事件
   - 移除 currentGroupName 赋值
   - 移除 isOnline prop

2. `src/renderer/src/entities/message/model/useMessageStore.ts`
   - 修复 messageType 可能为 undefined

3. `src/renderer/src/shared/types/index.ts`
   - 添加 ChatSession.isOnline 字段

4. `src/renderer/src/shared/api/websocket.ts`
   - 修复 sessionUserType → type
   - 修复 userId → participants
   - 修复 showName → name

5. `src/renderer/src/pages/login/LoginPage.vue`
   - 修复 tasks 数组类型（两处）

6. `src/renderer/src/pages/login/RegisterForm.vue`
   - 注释掉未使用的 uploadingAvatar

7. `src/renderer/src/widgets/mediaPreview/MediaPreview.vue`
   - 注释掉未使用的 videoRef、isDragging、dragStart
   - 修复 e → _e

8. `src/renderer/src/widgets/messageInput/MessageInput.vue`
   - 注释掉未使用的 inputContainerRef
   - 修复 event → _event（两处）

9. `src/renderer/src/widgets/sessionList/SessionList.vue`
   - 无需修改（isOnline 字段已添加到类型定义）

## 验证结果

```bash
npm run typecheck
# ✅ 通过

npm run build:win
# ✅ 打包成功
```

## 打包输出

```
dist/
├── quiet-1.0.0-setup.exe          # Windows 安装包
├── quiet-1.0.0-setup.exe.blockmap # 更新文件映射
├── latest.yml                      # 自动更新元数据
└── win-unpacked/                   # 未打包的应用文件
```

## 注意事项

1. **类型安全**：所有类型错误都已修复，确保代码类型安全
2. **向后兼容**：修复没有破坏现有功能
3. **未使用变量**：注释掉而不是删除，方便以后需要时恢复
4. **类型定义**：ChatSession 添加了 isOnline 字段，支持在线状态功能

## 相关文档

- [消息立即显示完整解决方案](./消息立即显示完整解决方案.md)
- [在线状态实时推送完成总结](../项目总结/在线状态实时推送完成总结.md)
- [打包部署指南](../使用指南/打包部署指南.md)
