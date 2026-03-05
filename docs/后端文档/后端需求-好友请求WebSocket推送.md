# 后端需求：好友请求 WebSocket 推送

## 问题描述

当前存在两个问题：
1. 当别人同意好友请求后，联系人图标上的红色数字没有自动刷新
2. 当别人同意好友请求后，联系人列表没有自动刷新，需要手动刷新才能看到新好友

## 解决方案

后端需要通过 WebSocket 推送好友请求相关的通知，前端已经实现了监听逻辑。

## 前端已实现

前端已经订阅了好友请求通知队列：

```typescript
// WebSocket 订阅
this.client.subscribe(`/user/queue/friend-requests`, (message) => {
  this.handleFriendRequestNotification(JSON.parse(message.body))
})
```

前端会处理两种通知类型：

1. `NEW_REQUEST` - 收到新的好友请求
2. `REQUEST_ACCEPTED` - 对方接受了你的好友请求

## 后端需要实现

### 1. 发送好友请求时的推送

当用户 A 向用户 B 发送好友请求时：

```java
// 发送好友请求后，推送通知给用户 B
@PostMapping("/api/contacts/requests")
public ResponseEntity<?> sendFriendRequest(@RequestBody FriendRequestDTO request) {
    // ... 创建好友请求的逻辑 ...
    
    // 推送通知给目标用户
    FriendRequestNotification notification = new FriendRequestNotification();
    notification.setType("NEW_REQUEST");
    notification.setRequestId(friendRequest.getId());
    notification.setFromUserId(currentUser.getId());
    notification.setFromUsername(currentUser.getUsername());
    notification.setFromShowName(currentUser.getShowName());
    notification.setRequestMessage(request.getMessage());
    
    messagingTemplate.convertAndSendToUser(
        targetUserId,
        "/queue/friend-requests",
        notification
    );
    
    return ResponseEntity.ok(friendRequest);
}
```

### 2. 接受好友请求时的推送

当用户 B 接受用户 A 的好友请求时：

```java
// 接受好友请求后，推送通知给请求发送方
@PostMapping("/api/contacts/requests/{requestId}/accept")
public ResponseEntity<?> acceptFriendRequest(@PathVariable String requestId) {
    // ... 接受好友请求的逻辑 ...
    
    // 推送通知给请求发送方（用户 A）
    FriendRequestNotification notification = new FriendRequestNotification();
    notification.setType("REQUEST_ACCEPTED");
    notification.setRequestId(requestId);
    notification.setFromUserId(currentUser.getId());
    notification.setFromUsername(currentUser.getUsername());
    notification.setFromShowName(currentUser.getShowName());
    
    messagingTemplate.convertAndSendToUser(
        friendRequest.getFromUserId(),
        "/queue/friend-requests",
        notification
    );
    
    return ResponseEntity.ok().build();
}
```

### 3. 通知数据结构

```java
public class FriendRequestNotification {
    /**
     * 通知类型
     * - NEW_REQUEST: 收到新的好友请求
     * - REQUEST_ACCEPTED: 好友请求被接受
     */
    private String type;
    
    /**
     * 好友请求ID
     */
    private String requestId;
    
    /**
     * 发送方用户ID
     */
    private String fromUserId;
    
    /**
     * 发送方用户名
     */
    private String fromUsername;
    
    /**
     * 发送方显示名称
     */
    private String fromShowName;
    
    /**
     * 请求消息（仅 NEW_REQUEST 时需要）
     */
    private String requestMessage;
    
    /**
     * 时间戳
     */
    private String timestamp;
    
    // getters and setters...
}
```

## 前端处理逻辑

前端收到通知后的处理：

```typescript
private async handleFriendRequestNotification(notification: any) {
  const contactStore = useContactStore()

  if (notification.type === 'NEW_REQUEST') {
    // 收到新的好友请求
    // 1. 重新加载好友请求列表
    await contactStore.loadPendingRequests()
    // 2. 侧边栏的红色数字会自动更新（通过 computed 属性）
  } else if (notification.type === 'REQUEST_ACCEPTED') {
    // 对方接受了你的好友请求
    // 1. 重新加载好友请求列表（移除已接受的请求）
    await contactStore.loadPendingRequests()
    // 2. 重新加载联系人列表（显示新好友）
    await contactStore.loadContacts()
  }
}
```

## 测试步骤

### 测试场景 1：收到新的好友请求

1. 用户 A 登录应用
2. 用户 B 向用户 A 发送好友请求
3. 验证：
   - 用户 A 的侧边栏联系人图标上应立即显示红色数字（无需刷新）
   - 点击联系人图标，应看到新的好友请求

### 测试场景 2：好友请求被接受

1. 用户 A 向用户 B 发送好友请求
2. 用户 B 接受好友请求
3. 验证：
   - 用户 A 的侧边栏联系人图标上的红色数字应立即消失（如果没有其他待处理请求）
   - 用户 A 点击联系人图标，应立即看到用户 B 出现在联系人列表中（无需刷新）

## 相关 API 端点

需要修改的后端接口：

1. `POST /api/contacts/requests` - 发送好友请求
2. `POST /api/contacts/requests/{requestId}/accept` - 接受好友请求
3. `POST /api/contacts/requests/{requestId}/reject` - 拒绝好友请求（可选，也可以推送通知）

## 注意事项

1. WebSocket 推送的目标用户必须在线，如果用户离线，下次登录时会通过 API 加载最新数据
2. 推送的数据结构必须与前端期望的格式一致
3. 推送时使用 `messagingTemplate.convertAndSendToUser(userId, "/queue/friend-requests", notification)`
4. 确保 WebSocket 配置中已经启用了用户队列（`/user/queue/*`）

## 前端代码位置

- WebSocket 订阅逻辑：`src/renderer/src/shared/api/websocket.ts`
- 联系人 Store：`src/renderer/src/entities/contact/model/useContactStore.ts`
- 侧边栏组件：`src/renderer/src/widgets/sidebar/Sidebar.vue`
- 联系人页面：`src/renderer/src/pages/contacts/ContactsPage.vue`
