# ContactsPage.vue 重构代码

## 关键样式替换

### 1. 容器背景
```vue
<!-- 原来 -->
<div class="w-64 bg-list-gray border-r border-gray-300 flex flex-col">

<!-- 替换为 -->
<div class="w-72 bg-bg-surface border-r border-white/10 flex flex-col">
```

### 2. 头部
```vue
<!-- 原来 -->
<div class="p-3 border-b border-gray-300 flex items-center justify-between">
  <h2 class="font-medium">联系人</h2>
  <button class="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center">

<!-- 替换为 -->
<div class="p-3 border-b border-white/10 flex items-center justify-between">
  <h2 class="font-medium text-text-primary">联系人</h2>
  <button class="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-neon-cyan transition-colors">
```

### 3. 好友请求横幅
```vue
<!-- 原来 -->
<div
  v-if="pendingRequests.length > 0"
  class="bg-yellow-50 border-b border-yellow-200 p-3 cursor-pointer hover:bg-yellow-100"
  @click="showRequests = !showRequests"
>
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium">新的好友请求 ({{ pendingRequests.length }})</span>

<!-- 替换为 -->
<div
  v-if="pendingRequests.length > 0"
  class="bg-alert-red/10 border-b border-alert-red/20 p-3 cursor-pointer hover:bg-alert-red/20 transition-colors"
  @click="showRequests = !showRequests"
>
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-alert-red">有人不知死活想加你 ({{ pendingRequests.length }})</span>
    <svg class="w-4 h-4 text-alert-red transition-transform" :class="{ 'rotate-180': showRequests }" fill="currentColor" viewBox="0 0 16 16">
```

### 4. 好友请求列表项
```vue
<!-- 原来 -->
<div class="p-3 border-b border-gray-200 bg-white">
  <div class="flex items-center gap-2 mb-2">
    <div class="w-8 h-8 rounded bg-gray-400 flex-shrink-0 flex items-center justify-center text-white text-sm">

<!-- 替换为 -->
<div class="p-3 border-b border-white/5 bg-bg-surface">
  <div class="flex items-center gap-2 mb-2">
    <div class="w-8 h-8 rounded bg-bubble-other flex-shrink-0 flex items-center justify-center text-text-primary text-sm">
      {{ request.fromShowName?.[0] || request.fromUsername?.[0] || 'U' }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate text-text-primary">{{ request.fromShowName || request.fromUsername }}</div>
      <div class="text-xs text-text-muted truncate">@{{ request.fromUsername }}</div>
    </div>
  </div>
  <div v-if="request.requestMessage" class="text-sm text-text-muted mb-2">
    {{ request.requestMessage }}
  </div>
  <div class="flex gap-2">
    <button
      @click="handleAcceptRequest(request.requestId)"
      class="flex-1 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-sm rounded hover:bg-neon-cyan/20 transition-all"
    >
      接受
    </button>
    <button
      @click="handleRejectRequest(request.requestId)"
      class="flex-1 px-3 py-1 bg-white/5 text-text-muted text-sm rounded hover:bg-white/10 transition-colors"
    >
      拒绝
    </button>
  </div>
</div>
```

### 5. 搜索框
```vue
<!-- 原来 -->
<input
  v-model="searchQuery"
  type="text"
  placeholder="搜索联系人"
  class="w-full px-3 py-2 rounded bg-white border border-gray-300 text-sm focus:outline-none focus:border-wechat-green"
/>

<!-- 替换为 -->
<input
  v-model="searchQuery"
  type="text"
  placeholder="搜点不可告人的..."
  class="w-full px-3 py-2 rounded bg-[#1E1E24] border border-white/10 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
/>
```

### 6. 联系人列表项
```vue
<!-- 原来 -->
<div
  v-for="contact in filteredContacts"
  :key="contact.userId"
  @click="selectContact(contact)"
  class="px-3 py-3 hover:bg-gray-200 cursor-pointer border-b border-gray-200 flex items-center gap-3"
>
  <div class="w-10 h-10 rounded bg-gray-400 flex-shrink-0 flex items-center justify-center text-white font-bold">
    {{ contact.displayName[0] }}
  </div>
  <div class="flex-1 min-w-0">
    <div class="font-medium text-sm truncate">{{ contact.displayName }}</div>
    <div class="text-xs text-gray-500 truncate">{{ contact.statusMessage || '在线' }}</div>
  </div>
</div>

<!-- 替换为 -->
<div
  v-for="contact in filteredContacts"
  :key="contact.userId"
  @click="selectContact(contact)"
  class="px-3 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors"
>
  <div class="w-10 h-10 rounded bg-bubble-other flex-shrink-0 flex items-center justify-center text-text-primary font-bold">
    {{ contact.displayName[0] }}
  </div>
  <div class="flex-1 min-w-0">
    <div class="font-medium text-sm truncate text-text-primary">{{ contact.displayName }}</div>
    <div class="text-xs text-text-muted truncate">{{ contact.statusMessage || '在线' }}</div>
  </div>
</div>
```

### 7. 空状态
```vue
<!-- 原来 -->
<div class="flex flex-col items-center justify-center h-full text-gray-400 p-4">
  <svg class="w-16 h-16 mb-2" fill="currentColor" viewBox="0 0 16 16">
    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </svg>
  <p class="text-sm">暂无联系人</p>
  <button
    @click="showAddFriend = true"
    class="mt-2 px-4 py-2 text-white text-sm rounded"
    style="background-color: #95EC69"
  >
    添加好友
  </button>
</div>

<!-- 替换为 -->
<div class="flex flex-col items-center justify-center h-full text-text-muted p-4">
  <svg class="w-16 h-16 mb-2 opacity-30" fill="currentColor" viewBox="0 0 16 16">
    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
  </svg>
  <p class="text-sm">一个朋友都没有，真是可悲</p>
  <button
    @click="showAddFriend = true"
    class="mt-2 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan text-sm rounded hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all"
  >
    找个人聊聊
  </button>
</div>
```

### 8. 添加好友弹窗
```vue
<!-- 原来 -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showAddFriend = false">
  <div class="bg-white rounded-lg p-6 w-96">
    <h3 class="text-lg font-medium mb-4">添加好友</h3>

<!-- 替换为 -->
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showAddFriend = false">
  <div class="glass-panel border border-white/10 shadow-2xl shadow-neon-cyan/5 rounded-lg p-6 w-96">
    <h3 class="text-lg font-medium mb-4 text-text-primary">找个倒霉蛋</h3>
```

### 9. 搜索用户输入框
```vue
<!-- 原来 -->
<label class="block text-sm font-medium text-gray-700 mb-1">搜索用户</label>
<input
  v-model="searchUsername"
  type="text"
  class="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-wechat-green"
  placeholder="输入用户名或昵称"
  @keyup.enter="handleSearchUser"
/>

<!-- 替换为 -->
<label class="block text-sm font-medium text-text-muted mb-1">搜索用户</label>
<input
  v-model="searchUsername"
  type="text"
  class="flex-1 px-3 py-2 bg-[#1E1E24] border border-white/10 rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all"
  placeholder="输入代号或昵称"
  @keyup.enter="handleSearchUser"
/>
```

### 10. 搜索按钮
```vue
<!-- 原来 -->
<button
  @click="handleSearchUser"
  :disabled="searchLoading"
  class="px-4 py-2 text-white rounded disabled:opacity-50"
  style="background-color: #95EC69"
>
  {{ searchLoading ? '搜索中...' : '搜索' }}
</button>

<!-- 替换为 -->
<button
  @click="handleSearchUser"
  :disabled="searchLoading"
  class="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
>
  {{ searchLoading ? '搜索中...' : '搜索' }}
</button>
```

### 11. 搜索结果列表
```vue
<!-- 原来 -->
<div class="max-h-48 overflow-y-auto border rounded">
  <div
    v-for="user in searchResults"
    :key="user.id"
    @click="selectUser(user)"
    :class="[
      'p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3',
      { 'bg-blue-50': selectedUser?.id === user.id }
    ]"
  >

<!-- 替换为 -->
<div class="max-h-48 overflow-y-auto border border-white/10 rounded bg-[#1E1E24]">
  <div
    v-for="user in searchResults"
    :key="user.id"
    @click="selectUser(user)"
    :class="[
      'p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors',
      { 'bg-neon-cyan/10': selectedUser?.id === user.id }
    ]"
  >
    <div class="w-10 h-10 rounded bg-bubble-other flex-shrink-0 flex items-center justify-center text-text-primary font-bold">
      {{ user.showName[0] }}
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-medium text-sm text-text-primary">{{ user.showName }}</div>
      <div class="text-xs text-text-muted">@{{ user.username }}</div>
    </div>
  </div>
</div>
```

### 12. 验证消息输入框
```vue
<!-- 原来 -->
<label class="block text-sm font-medium text-gray-700 mb-1">验证消息</label>
<textarea
  v-model="addFriendForm.message"
  class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-wechat-green resize-none"
  rows="3"
  placeholder="你好，我想加你为好友"
></textarea>

<!-- 替换为 -->
<label class="block text-sm font-medium text-text-muted mb-1">验证消息</label>
<textarea
  v-model="addFriendForm.message"
  class="w-full px-3 py-2 bg-[#1E1E24] border border-white/10 rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan resize-none transition-all"
  rows="3"
  placeholder="说点什么吧..."
></textarea>
```

### 13. 发送请求按钮
```vue
<!-- 原来 -->
<button
  v-if="selectedUser"
  @click="handleAddFriend"
  :disabled="addFriendLoading"
  class="flex-1 px-4 py-2 text-white rounded disabled:opacity-50"
  style="background-color: #95EC69"
>
  {{ addFriendLoading ? '发送中...' : '发送请求' }}
</button>

<!-- 替换为 -->
<button
  v-if="selectedUser"
  @click="handleAddFriend"
  :disabled="addFriendLoading"
  class="flex-1 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
>
  {{ addFriendLoading ? '发送中...' : '发送请求' }}
</button>
```

### 14. 取消按钮
```vue
<!-- 原来 -->
<button
  @click="closeAddFriendModal"
  class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
>
  取消
</button>

<!-- 替换为 -->
<button
  @click="closeAddFriendModal"
  class="flex-1 px-4 py-2 bg-white/5 text-text-muted rounded hover:bg-white/10 transition-colors"
>
  算了
</button>
```

### 15. 错误提示
```vue
<!-- 原来 -->
<div v-if="addFriendError" class="text-red-500 text-sm">{{ addFriendError }}</div>

<!-- 替换为 -->
<div v-if="addFriendError" class="text-alert-red text-sm bg-alert-red/10 py-2 px-3 rounded">{{ addFriendError }}</div>
```

### 16. 无搜索结果
```vue
<!-- 原来 -->
<div v-if="searchAttempted && searchResults.length === 0" class="text-center text-gray-500 text-sm py-4">
  未找到用户
</div>

<!-- 替换为 -->
<div v-if="searchAttempted && searchResults.length === 0" class="text-center text-text-muted text-sm py-4">
  这人不存在，或者躲起来了
</div>
```

---

## 快速替换清单

1. 容器背景：`bg-list-gray` → `bg-bg-surface`
2. 边框：`border-gray-300` → `border-white/10`
3. 文字：`text-gray-700` → `text-text-primary`
4. 次要文字：`text-gray-500` → `text-text-muted`
5. 按钮背景：`bg-gray-200` → `bg-white/5`
6. Hover：`hover:bg-gray-200` → `hover:bg-white/5`
7. 微信绿按钮：删除 `style="background-color: #95EC69"`，使用霓虹青色样式
8. 好友请求：`bg-yellow-50` → `bg-alert-red/10`

---

**注意**: 建议使用 VS Code 的查找替换功能，逐个替换并测试。
