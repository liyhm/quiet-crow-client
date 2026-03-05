# 群聊功能 MainPage 集成完成

## ✅ 已完成的集成工作

### 1. MainPage.vue 集成 ✅

**位置**: `src/renderer/src/pages/main/MainPage.vue`

**完成内容**:

#### 1.1 导入新组件
```typescript
import CreateGroupModal from '@/widgets/createGroupModal/CreateGroupModal.vue'
import GroupMembersModal from '@/widgets/groupMembersModal/GroupMembersModal.vue'
```

#### 1.2 添加状态管理
```typescript
const showCreateGroupModal = ref(false)
const showGroupMembersModal = ref(false)
```

#### 1.3 联系人列表（用于创建群聊）
```typescript
const contactStore = useContactStore()
const contactList = computed(() => contactStore.contacts)
```

#### 1.4 当前群聊信息
```typescript
const currentGroupName = computed(() => {
  if (activeSession.value?.type === 'GROUP') {
    return activeSession.value.name || '未命名群聊'
  }
  return ''
})

const currentGroupMembers = computed(() => {
  // TODO: 从后端获取群成员列表
  return []
})
```

#### 1.5 ChatHeader 传递群聊 Props
```vue
<ChatHeader
  :session-name="activeSession.name"
  :is-group="activeSession.type === 'GROUP'"
  :member-count="activeSession.memberCount"
  @showMembers="handleShowMembers"
/>
```

#### 1.6 MessageList 传递 isGroup Prop
```vue
<MessageList
  ref="messageListRef"
  :messages="currentMessages"
  :current-user-id="currentUserId"
  :sender-names="senderNamesMap"
  :is-group="activeSession.type === 'GROUP'"
  @deleteMessage="handleDeleteMessage"
  @showContextMenu="showMessageMenu"
  @fileDrop="handleFileDrop"
/>
```

#### 1.7 SessionList 传递 createGroup 事件
```vue
<SessionList
  v-if="activeTab === 'messages'"
  @selectSession="selectSession"
  @createGroup="showCreateGroupModal = true"
/>
```

#### 1.8 添加弹窗组件
```vue
<!-- Create Group Modal -->
<CreateGroupModal
  :show="showCreateGroupModal"
  :contacts="contactList"
  @close="showCreateGroupModal = false"
  @create="handleCreateGroup"
/>

<!-- Group Members Modal -->
<GroupMembersModal
  :show="showGroupMembersModal"
  :group-name="currentGroupName"
  :members="currentGroupMembers"
  @close="showGroupMembersModal = false"
/>
```

#### 1.9 事件处理函数
```typescript
// 创建群聊
const handleCreateGroup = async (data: { name: string; memberIds: string[] }): Promise<void> => {
  try {
    console.log('🔨 创建群聊:', data)
    const result = await sessionApi.createGroup(data)
    
    if (result.sessionId) {
      console.log('✅ 群聊创建成功:', result.sessionId)
      showCreateGroupModal.value = false
      
      // 刷新会话列表
      await sessionStore.loadSessions()
      
      // 切换到消息标签并选中新创建的群聊
      activeTab.value = 'messages'
      sessionStore.setActiveSession(result.sessionId)
    }
  } catch (error) {
    console.error('❌ 创建群聊失败:', error)
    alert('创建群聊失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

// 显示群成员列表
const handleShowMembers = (): void => {
  if (activeSession.value?.type === 'GROUP') {
    showGroupMembersModal.value = true
  }
}
```

---

### 2. SessionList.vue 改造 ✅

**位置**: `src/renderer/src/widgets/sessionList/SessionList.vue`

**完成内容**:

#### 2.1 添加头部（带 + 按钮）
```vue
<!-- Header -->
<div class="p-4 border-b border-white/10 flex items-center justify-between">
  <div class="flex items-center gap-2">
    <!-- 霓虹指示灯 -->
    <div class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></div>
    <!-- 极客风微排版 -->
    <div class="flex items-baseline gap-1.5">
      <span class="text-[#555555] text-[11px] font-mono tracking-wider">[ 鸦口无言 ]</span>
      <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase">SESSIONS</span>
    </div>
  </div>
  <button
    @click="$emit('createGroup')"
    class="w-7 h-7 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 hover:bg-[#00E5FF]/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] flex items-center justify-center text-[#00E5FF] transition-all duration-300 group"
    title="建立鸦群分舵"
  >
    <svg class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
    </svg>
  </button>
</div>
```

#### 2.2 添加 createGroup 事件
```typescript
const emit = defineEmits<{
  (e: 'selectSession', sessionId: string): void
  (e: 'createGroup'): void
}>()
```

---

### 3. MessageList.vue 改造 ✅

**位置**: `src/renderer/src/widgets/messageList/MessageList.vue`

**完成内容**:

#### 3.1 添加 isGroup Prop
```typescript
const props = defineProps<{
  messages: Message[]
  currentUserId: string
  senderNames: Record<string, string>
  isGroup?: boolean
}>()
```

#### 3.2 传递 isGroup 到 MessageBubble
```vue
<MessageBubble
  v-for="message in messages"
  :key="message.id"
  :content="message.content"
  :timestamp="message.timestamp"
  :is-mine="message.senderId === currentUserId"
  :sender-name="getSenderName(message.senderId)"
  :is-group="isGroup"
  @delete="$emit('deleteMessage', message.id)"
  @contextmenu="$emit('showContextMenu', $event, message.id)"
/>
```

---

### 4. 类型定义更新 ✅

**位置**: `src/renderer/src/shared/types/index.ts`

**完成内容**:

#### 4.1 ChatSession 添加 memberCount
```typescript
export interface ChatSession {
  id: string
  type: SessionType
  name: string
  avatar: string
  participants: string[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  memberCount?: number // 群聊成员数量（仅群聊）
  createdAt: string
  updatedAt: string
}
```

#### 4.2 User 添加 phone 字段
```typescript
export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  statusMessage: string
  publicKey: string
  createdAt: string
  updatedAt: string
}
```

---

### 5. SessionStore 更新 ✅

**位置**: `src/renderer/src/entities/session/model/useSessionStore.ts`

**完成内容**:

#### 5.1 loadSessions 添加 memberCount
```typescript
return {
  id: su.sessionId,
  type: su.sessionUserType === 'PRIVATE' ? SessionType.PRIVATE : SessionType.GROUP,
  name: displayName,
  avatar: su.avatar || '',
  participants: [su.userId],
  lastMessage: lastMessageDisplay,
  lastMessageTime: su.lastMessageTime || new Date().toISOString(),
  unreadCount: su.unreadCount || 0,
  memberCount: su.sessionUserType === 'GROUP' ? (su.memberCount || 0) : undefined,
  isPinned: false,
  isMuted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

---

## 🎯 功能流程

### 创建群聊流程
1. 用户点击会话列表头部的 + 按钮
2. 触发 `@createGroup` 事件
3. MainPage 设置 `showCreateGroupModal = true`
4. CreateGroupModal 弹出，显示联系人列表
5. 用户选择联系人并输入群名
6. 点击"熔铸链接"按钮
7. 触发 `@create` 事件，传递 `{ name, memberIds }`
8. MainPage 调用 `handleCreateGroup`
9. 调用 `sessionApi.createGroup(data)`
10. 创建成功后刷新会话列表
11. 自动切换到消息标签并选中新群聊

### 查看群成员流程
1. 用户在群聊界面点击"潜伏者"按钮
2. ChatHeader 触发 `@showMembers` 事件
3. MainPage 调用 `handleShowMembers`
4. 设置 `showGroupMembersModal = true`
5. GroupMembersModal 弹出，显示群成员列表

### 群聊消息显示流程
1. MessageList 接收 `isGroup` prop
2. 传递给 MessageBubble
3. MessageBubble 根据 `isGroup` 和 `isMine` 决定是否显示发送者名字
4. 群聊中对方消息显示发送者名字（青色荧光）
5. 群聊中我方消息不显示名字
6. 私聊消息不显示名字

---

## 📦 文件清单

### 修改的文件
- `src/renderer/src/pages/main/MainPage.vue` ✅
- `src/renderer/src/widgets/sessionList/SessionList.vue` ✅
- `src/renderer/src/widgets/messageList/MessageList.vue` ✅
- `src/renderer/src/shared/types/index.ts` ✅
- `src/renderer/src/entities/session/model/useSessionStore.ts` ✅

### 已存在的组件（无需修改）
- `src/renderer/src/widgets/createGroupModal/CreateGroupModal.vue` ✅
- `src/renderer/src/widgets/groupMembersModal/GroupMembersModal.vue` ✅
- `src/renderer/src/widgets/messageBubble/MessageBubble.vue` ✅
- `src/renderer/src/widgets/chatHeader/ChatHeader.vue` ✅

---

## 🔄 待完成功能

### 1. 后端 API 集成
- [ ] 获取群成员列表 API
- [ ] 群聊消息发送和接收
- [ ] 群聊历史消息加载
- [ ] 群成员在线状态

### 2. 群成员管理
- [ ] 实现 `currentGroupMembers` computed
- [ ] 从后端获取群成员详情
- [ ] 显示群主和普通成员
- [ ] 显示在线状态

### 3. 消息发送者名字映射
- [ ] 在 `senderNamesMap` 中添加群成员名字
- [ ] 从群成员列表获取名字
- [ ] 缓存群成员信息

---

## 🎨 UI 效果

### 会话列表头部
- 霓虹青色呼吸灯
- 极客风文案：`[ 鸦口无言 ] SESSIONS`
- 青色发光 + 按钮，Hover 时旋转 90 度

### 创建群聊弹窗
- 毛玻璃面板
- 顶部青色光带
- 赛博风复选框 `[X]`
- 双层按钮："熔铸链接 / ESTABLISH"

### 群聊会话卡片
- 网络节点图标（三个连接的节点）
- 群名 + 人数：`黑客集会 (4)`
- 选中时图标变青色

### 聊天区头部
- 群名 + 人数
- "潜伏者"按钮（群组图标）
- Hover 时青色发光

### 群聊消息气泡
- 对方消息顶部显示发送者名字
- 青色荧光效果
- 我方消息不显示名字

### 群成员列表弹窗
- 群信息卡片（群图标 + 群名 + 人数）
- 群主：青色高亮 + "首领"徽章
- 在线状态：青色发光圆点

---

## 💡 使用示例

### 创建群聊
```typescript
// 用户点击 + 按钮
showCreateGroupModal.value = true

// 用户选择联系人并创建
const data = {
  name: '黑客集会',
  memberIds: ['user1', 'user2', 'user3']
}
await handleCreateGroup(data)
```

### 查看群成员
```typescript
// 用户点击"潜伏者"按钮
handleShowMembers()
```

### 发送群聊消息
```typescript
// 与私聊相同，MessageStore 会根据 session.type 处理
await messageStore.sendMessage(sessionId, content)
```

---

## 🚀 下一步工作

### 优先级 1：群成员列表 API
```typescript
// 需要实现
const loadGroupMembers = async (sessionId: string) => {
  const members = await sessionApi.getGroupMembers(sessionId)
  return members.map(m => ({
    userId: m.userId,
    showName: m.displayName,
    userType: m.isOwner ? 'OWNER' : 'MEMBER',
    isOnline: m.status === 'ONLINE'
  }))
}
```

### 优先级 2：消息发送者名字映射
```typescript
// 在 MainPage.vue 中
const senderNamesMap = computed(() => {
  const map: Record<string, string> = {}
  map[currentUserId.value] = authStore.currentUser?.displayName || 'Me'
  
  // 如果是群聊，添加所有群成员的名字
  if (activeSession.value?.type === 'GROUP') {
    currentGroupMembers.value.forEach(member => {
      map[member.userId] = member.showName || member.userId
    })
  } else {
    // 私聊
    map['other'] = activeSession.value?.name || 'Unknown'
  }
  
  return map
})
```

### 优先级 3：WebSocket 群聊消息处理
- 接收群聊消息
- 更新群聊未读数
- 显示发送者名字

---

**状态**: 🟢 MainPage 集成完成 100%，等待后端 API 对接

**更新时间**: 2024-02-28
