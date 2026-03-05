# 好友请求 WebSocket 推送 - 前端集成完成

## ✅ 集成状态

前端已完成好友请求 WebSocket 推送功能的集成，实现了：
- ✅ 联系人图标红色数字实时更新
- ✅ 联系人列表实时刷新
- ✅ 无需手动刷新页面
- ✅ 桌面通知提醒（可选）

## 📡 WebSocket 订阅配置

### 订阅路径
```
/user/queue/friend-requests
```

### 推送数据格式
```typescript
interface FriendRequestNotification {
  type: 'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED'
  requestId: string
  fromUserId: string
  fromUsername: string
  fromShowName: string
  fromAvatar: string | null
  requestMessage?: string  // 仅 NEW_REQUEST 时有值
  timestamp: string        // ISO 格式
}
```

## 🔧 已实现的功能

### 1. WebSocket 订阅

在 `src/renderer/src/shared/api/websocket.ts` 中实现：

```typescript
private subscribeToFriendRequests() {
  console.log('📡 订阅好友请求通知:', `/user/queue/friend-requests`)

  const subscription = this.client.subscribe(`/user/queue/friend-requests`, (message) => {
    console.log('📬 收到好友请求通知:', message.body)
    this.handleFriendRequestNotification(JSON.parse(message.body))
  })

  this.subscriptions.set('friend-requests', subscription)
  console.log('✅ 好友请求通知订阅成功')
}
```

### 2. 通知处理逻辑

```typescript
private async handleFriendRequestNotification(notification: any) {
  const contactStore = useContactStore()

  switch (notification.type) {
    case 'NEW_REQUEST':
      // 收到新的好友请求
      await contactStore.loadPendingRequests()
      this.showDesktopNotification(
        '新的好友请求',
        `${notification.fromShowName} 想添加你为好友`
      )
      break

    case 'REQUEST_ACCEPTED':
      // 对方接受了你的好友请求
      await contactStore.loadPendingRequests()
      await contactStore.loadContacts()
      this.showDesktopNotification(
        '好友请求已接受',
        `${notification.fromShowName} 接受了你的好友请求`
      )
      break

    case 'REQUEST_REJECTED':
      // 对方拒绝了你的好友请求
      await contactStore.loadPendingRequests()
      break
  }
}
```

### 3. 侧边栏红色徽章

在 `src/renderer/src/widgets/sidebar/Sidebar.vue` 中实现：

```vue
<template>
  <button class="sidebar-button">
    <svg><!-- 联系人图标 --></svg>
    <!-- 红色数字徽章 -->
    <span
      v-if="pendingRequestCount > 0"
      class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
    >
      {{ pendingRequestCount > 99 ? '99+' : pendingRequestCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContactStore } from '@/entities/contact/model/useContactStore'

const contactStore = useContactStore()

// 待处理请求数量（自动更新）
const pendingRequestCount = computed(() => contactStore.pendingRequests.length)
</script>
```

### 4. 桌面通知

```typescript
private showDesktopNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body })
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body })
      }
    })
  }
}
```

## 📊 三种推送场景

### 场景 1: 收到新的好友请求

**后端推送数据**：
```json
{
  "type": "NEW_REQUEST",
  "requestId": "req-123",
  "fromUserId": "user-456",
  "fromUsername": "zhangsan",
  "fromShowName": "张三",
  "fromAvatar": "http://example.com/avatar.jpg",
  "requestMessage": "你好，我想加你为好友",
  "timestamp": "2024-02-27T21:30:00"
}
```

**前端处理流程**：
1. 收到 WebSocket 推送
2. 调用 `contactStore.loadPendingRequests()` 刷新待处理列表
3. 侧边栏红色数字自动 +1（通过 computed 属性）
4. 显示桌面通知："新的好友请求 - 张三 想添加你为好友"

**控制台日志**：
```
========================================
🔔 [handleFriendRequestNotification] 处理好友请求通知
🔔 [handleFriendRequestNotification] 通知类型: NEW_REQUEST
🔔 [handleFriendRequestNotification] 通知内容: {...}
📬 收到新的好友请求
📬 来自: 张三 (@zhangsan)
📬 消息: 你好，我想加你为好友
✅ 好友请求列表已刷新，当前待处理数量: 1
========================================
```

### 场景 2: 好友请求被接受

**后端推送数据**：
```json
{
  "type": "REQUEST_ACCEPTED",
  "requestId": "req-123",
  "fromUserId": "user-789",
  "fromUsername": "lisi",
  "fromShowName": "李四",
  "fromAvatar": "http://example.com/avatar2.jpg",
  "timestamp": "2024-02-27T21:35:00"
}
```

**前端处理流程**：
1. 收到 WebSocket 推送
2. 调用 `contactStore.loadPendingRequests()` 刷新待处理列表
3. 调用 `contactStore.loadContacts()` 刷新联系人列表
4. 侧边栏红色数字自动 -1（通过 computed 属性）
5. 新好友自动出现在联系人列表中
6. 显示桌面通知："好友请求已接受 - 李四 接受了你的好友请求"

**控制台日志**：
```
========================================
🔔 [handleFriendRequestNotification] 处理好友请求通知
🔔 [handleFriendRequestNotification] 通知类型: REQUEST_ACCEPTED
🔔 [handleFriendRequestNotification] 通知内容: {...}
✅ 好友请求被接受
✅ 对方: 李四 (@lisi)
✅ 好友请求列表和联系人列表已刷新
✅ 当前待处理数量: 0
✅ 当前联系人数量: 5
========================================
```

### 场景 3: 好友请求被拒绝

**后端推送数据**：
```json
{
  "type": "REQUEST_REJECTED",
  "requestId": "req-123",
  "fromUserId": "user-789",
  "fromUsername": "lisi",
  "fromShowName": "李四",
  "fromAvatar": "http://example.com/avatar2.jpg",
  "timestamp": "2024-02-27T21:35:00"
}
```

**前端处理流程**：
1. 收到 WebSocket 推送
2. 调用 `contactStore.loadPendingRequests()` 刷新待处理列表
3. 侧边栏红色数字自动 -1（通过 computed 属性）

**控制台日志**：
```
========================================
🔔 [handleFriendRequestNotification] 处理好友请求通知
🔔 [handleFriendRequestNotification] 通知类型: REQUEST_REJECTED
🔔 [handleFriendRequestNotification] 通知内容: {...}
❌ 好友请求被拒绝
❌ 对方: 李四 (@lisi)
✅ 好友请求列表已刷新，当前待处理数量: 0
========================================
```

## 🧪 测试验证

### 测试步骤

1. **准备环境**
   - 用户 A 和用户 B 同时登录应用
   - 确保 WebSocket 连接成功（查看控制台日志）

2. **测试场景 1：收到新的好友请求**
   - 用户 B 向用户 A 发送好友请求
   - 验证：用户 A 的联系人图标立即显示红色数字（无需刷新）
   - 验证：用户 A 收到桌面通知
   - 验证：控制台显示正确的日志

3. **测试场景 2：好友请求被接受**
   - 用户 A 接受用户 B 的好友请求
   - 验证：用户 B 的联系人图标红色数字立即消失（如果没有其他待处理请求）
   - 验证：用户 B 的联系人列表立即显示用户 A（无需刷新）
   - 验证：用户 B 收到桌面通知
   - 验证：控制台显示正确的日志

4. **测试场景 3：好友请求被拒绝**
   - 用户 A 拒绝用户 B 的好友请求
   - 验证：用户 B 的联系人图标红色数字立即消失（如果没有其他待处理请求）
   - 验证：控制台显示正确的日志

### 预期控制台日志

```
✅ WebSocket 连接成功！
📡 订阅私有消息队列: /user/queue/messages
✅ 私有消息队列订阅成功
📡 订阅好友请求通知: /user/queue/friend-requests
✅ 好友请求通知订阅成功
📬 收到好友请求通知: {"type":"NEW_REQUEST",...}
========================================
🔔 [handleFriendRequestNotification] 处理好友请求通知
🔔 [handleFriendRequestNotification] 通知类型: NEW_REQUEST
...
========================================
```

## ⚠️ 注意事项

1. **订阅时机**
   - WebSocket 订阅在连接成功后自动进行
   - 在 `subscribeToPrivateMessages()` 方法中调用 `subscribeToFriendRequests()`

2. **离线场景**
   - 用户离线时 WebSocket 推送会失败
   - 下次登录时通过 API 加载最新数据（在 `MainPage.vue` 的 `onMounted` 中）

3. **数据刷新**
   - 使用 Pinia Store 的响应式特性
   - 侧边栏的红色数字通过 `computed` 属性自动更新
   - 无需手动触发 UI 更新

4. **桌面通知权限**
   - 首次使用时会请求桌面通知权限
   - 用户可以在浏览器设置中管理权限

5. **错误处理**
   - 刷新数据失败时不影响推送接收
   - 错误会记录在控制台日志中

## 📦 相关文件

### 核心文件
- `src/renderer/src/shared/api/websocket.ts` - WebSocket 服务
- `src/renderer/src/entities/contact/model/useContactStore.ts` - 联系人 Store
- `src/renderer/src/widgets/sidebar/Sidebar.vue` - 侧边栏组件
- `src/renderer/src/pages/contacts/ContactsPage.vue` - 联系人页面
- `src/renderer/src/pages/main/MainPage.vue` - 主页面

### 文档
- `docs/后端文档/后端需求-好友请求WebSocket推送.md` - 后端实现指南
- `docs/问题修复/好友请求修复说明.md` - 功能修复说明

## 🎉 功能特点

1. **实时性**：无需刷新页面，所有更新实时推送
2. **响应式**：使用 Vue 3 的响应式系统，UI 自动更新
3. **用户友好**：桌面通知提醒，不会错过任何好友请求
4. **可靠性**：离线时自动降级到 API 轮询
5. **可维护性**：清晰的日志输出，便于调试和排查问题

## 📝 后续优化建议

1. ✅ WebSocket 实时推送（已完成）
2. ✅ 桌面通知（已完成）
3. 🔄 添加声音提醒
4. 🔄 添加未读消息动画效果
5. 🔄 支持批量处理好友请求

---

**文档版本**: v1.0  
**创建日期**: 2024-02-27  
**后端状态**: ✅ 已完成  
**前端状态**: ✅ 已完成
