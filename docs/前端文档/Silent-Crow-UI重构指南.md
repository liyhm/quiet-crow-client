# Silent Crow (鸦口无言) UI 重构指南

## ✅ 已完成的工作

### 1. 全局样式配置
- ✅ 更新 `tailwind.config.js` - 添加赛博朋克配色
- ✅ 更新 `src/renderer/src/app/styles/global.css` - 暗黑主题和毛玻璃效果
- ✅ 重写 `src/renderer/src/pages/login/LoginPage.vue` - 登录页面暗黑风格

### 2. 配色方案
```javascript
{
  'bg-void': '#0A0A0C',        // 深渊底色
  'bg-surface': '#151518',      // 毛玻璃面板
  'text-primary': '#E0E0E0',    // 主文字
  'text-muted': '#85858A',      // 副文字
  'neon-cyan': '#00E5FF',       // 霓虹青色
  'alert-red': '#FF3366',       // 警告红
  'bubble-other': '#1E1E24',    // 对方气泡
}
```

---

## 🚧 待完成的重构任务

### 任务 1：重写侧边栏 (Sidebar.vue)

**文件**: `src/renderer/src/widgets/sidebar/Sidebar.vue`

**要求**:
1. 背景使用 `glass-panel` 类
2. 用户头像添加霓虹青色光晕（在线状态）
3. 图标未选中：`text-text-muted`
4. 图标选中：`text-neon-cyan` + `drop-shadow-neon`
5. 未读数红点使用 `bg-alert-red`

**关键代码**:
```vue
<template>
  <div class="w-16 glass-panel flex flex-col items-center py-4 gap-4">
    <!-- 用户头像 - 带霓虹光晕 -->
    <div
      @click="showProfile"
      class="w-10 h-10 rounded flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80 ring-2 ring-neon-cyan/50"
      style="background-color: #00E5FF"
      :title="currentUser?.displayName"
    >
      {{ userInitial }}
    </div>

    <div class="flex-1 flex flex-col gap-4 mt-4">
      <!-- 消息图标 -->
      <button
        @click="switchTab('messages')"
        :class="[
          'w-10 h-10 rounded flex items-center justify-center relative transition-all',
          activeTab === 'messages'
            ? 'text-neon-cyan drop-shadow-neon'
            : 'text-text-muted hover:text-text-primary'
        ]"
        title="消息"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
          <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2z"/>
        </svg>
        <!-- 未读数 -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-alert-red text-white text-xs flex items-center justify-center animate-pulse-neon"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- 联系人图标 -->
      <button
        @click="switchTab('contacts')"
        :class="[
          'w-10 h-10 rounded flex items-center justify-center relative transition-all',
          activeTab === 'contacts'
            ? 'text-neon-cyan drop-shadow-neon'
            : 'text-text-muted hover:text-text-primary'
        ]"
        title="联系人"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
          <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
        </svg>
        <!-- 好友请求数 -->
        <span
          v-if="pendingRequestCount > 0"
          class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-alert-red text-white text-xs flex items-center justify-center animate-pulse-neon"
        >
          {{ pendingRequestCount > 99 ? '99+' : pendingRequestCount }}
        </span>
      </button>
    </div>

    <!-- 设置图标 -->
    <button
      @click="showSettings"
      class="w-10 h-10 rounded flex items-center justify-center text-text-muted hover:text-neon-cyan transition-colors"
      title="设置"
    >
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 16 16">
        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      </svg>
    </button>
  </div>
</template>
```

---

### 任务 2：重写会话列表 (SessionList.vue)

**文件**: `src/renderer/src/widgets/sessionList/SessionList.vue`

**要求**:
1. 背景使用 `bg-bg-surface`
2. 搜索框 Placeholder: "搜点不可告人的..."
3. 列表项 hover: `hover:bg-white/5`
4. 未读数使用 `bg-alert-red`
5. 时间戳颜色: `text-text-muted`

**关键样式**:
```vue
<div class="w-72 bg-bg-surface border-r border-white/10 flex flex-col">
  <!-- 搜索框 -->
  <div class="p-3">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜点不可告人的..."
      class="w-full px-3 py-2 rounded bg-[#1E1E24] border border-white/10 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-neon-cyan"
    />
  </div>

  <!-- 会话列表 -->
  <div class="flex-1 overflow-y-auto scrollbar-thin">
    <div
      v-for="session in filteredSessions"
      :key="session.id"
      @click="selectSession(session.id)"
      :class="[
        'px-3 py-3 cursor-pointer border-b border-white/5 flex items-center gap-3 transition-colors',
        activeSessionId === session.id
          ? 'bg-neon-cyan/10 border-l-2 border-l-neon-cyan'
          : 'hover:bg-white/5'
      ]"
    >
      <!-- 头像 -->
      <div class="w-12 h-12 rounded bg-bubble-other flex-shrink-0 flex items-center justify-center text-text-primary font-bold">
        {{ session.name[0] }}
      </div>
      
      <!-- 信息 -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="font-medium text-text-primary truncate">{{ session.name }}</span>
          <span class="text-xs text-text-muted">{{ formatTime(session.lastMessageTime) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-text-muted truncate">{{ session.lastMessage }}</span>
          <span
            v-if="session.unreadCount > 0"
            class="ml-2 px-2 py-0.5 rounded-full bg-alert-red text-white text-xs flex-shrink-0"
          >
            {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### 任务 3：重写主页面 (MainPage.vue)

**文件**: `src/renderer/src/pages/main/MainPage.vue`

**要求**:
1. 标题栏背景: `bg-bg-surface border-b border-white/10`
2. 聊天区背景: `bg-bg-void`
3. 空状态文案: "连个说话的人都没有，真是悲哀。"
4. 输入框 Placeholder: "想吐点什么槽？ (Enter 发送)"

**空状态代码**:
```vue
<!-- 空状态 -->
<div v-else class="flex-1 flex items-center justify-center text-text-muted">
  <div class="text-center">
    <!-- 乌鸦图标 -->
    <svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
    </svg>
    <p class="text-lg">连个说话的人都没有，真是悲哀。</p>
  </div>
</div>
```

**聊天气泡样式**:
```vue
<!-- 对方消息 -->
<div v-if="message.senderId !== currentUserId" class="flex items-start gap-2">
  <div class="w-10 h-10 rounded bg-bubble-other flex-shrink-0 flex items-center justify-center text-text-primary font-bold text-xs">
    {{ getDisplayName(message.senderId) }}
  </div>
  <div class="flex flex-col">
    <div class="bg-bubble-other rounded-br-2xl rounded-tr-2xl rounded-bl-sm rounded-tl-2xl px-3 py-2 max-w-md shadow-sm">
      <div class="text-sm text-text-primary">{{ message.content }}</div>
    </div>
    <div class="text-xs text-text-muted mt-1 ml-1">
      {{ formatTime(message.timestamp) }}
    </div>
  </div>
</div>

<!-- 我方消息 -->
<div v-else class="flex items-start gap-2 justify-end">
  <div class="flex flex-col items-end">
    <div class="border border-neon-cyan bg-neon-cyan/10 rounded-bl-2xl rounded-tl-2xl rounded-br-sm rounded-tr-2xl px-3 py-2 max-w-md shadow-sm cursor-pointer hover:bg-neon-cyan/20 transition-colors relative group">
      <div class="text-sm text-white">{{ message.content }}</div>
      <!-- 删除按钮 -->
      <button
        @click="handleDeleteMessage(message.id)"
        class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-alert-red hover:bg-alert-red/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
        title="删除消息"
      >
        ×
      </button>
    </div>
    <div class="text-xs text-text-muted mt-1 mr-1">
      {{ formatTime(message.timestamp) }}
    </div>
  </div>
  <div class="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-white font-bold ring-2 ring-neon-cyan/50" style="background-color: #00E5FF">
    {{ currentUser?.displayName?.[0] || 'U' }}
  </div>
</div>
```

**输入区域**:
```vue
<div class="border-t border-white/10 bg-bg-surface">
  <div class="p-2 flex items-center gap-2 border-b border-white/10">
    <button class="bg-white/5 hover:bg-white/10 p-2 rounded text-text-muted hover:text-neon-cyan transition-colors">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
      </svg>
    </button>
    <button class="bg-white/5 hover:bg-white/10 p-2 rounded text-text-muted hover:text-neon-cyan transition-colors">
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
      </svg>
    </button>
  </div>
  <div class="flex">
    <textarea
      v-model="messageInput"
      class="flex-1 p-3 resize-none focus:outline-none bg-transparent text-text-primary placeholder-text-muted"
      rows="4"
      placeholder="想吐点什么槽？ (Enter 发送)"
      @keydown.enter.exact.prevent="sendMessage"
      @keydown.enter.shift.exact="messageInput += '\n'"
    ></textarea>
    <div class="flex items-end p-2">
      <button
        @click="sendMessage"
        :disabled="!messageInput.trim()"
        class="px-4 py-2 rounded text-white transition-all bg-neon-cyan/10 border border-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        发送
      </button>
    </div>
  </div>
</div>
```

---

### 任务 4：重写个人设置弹窗

**要求**:
1. 弹窗背景: `glass-panel border border-white/10 shadow-2xl`
2. 标题: "你的真面目"
3. 更换头像按钮: "换张皮"
4. 昵称 Placeholder: "你想叫什么？"
5. 手机号 Placeholder: "你的呼机号"
6. 保存按钮: "勉强保存"
7. 退出按钮: "这就怂了要跑路？"

**弹窗代码**:
```vue
<!-- Profile Modal -->
<div
  v-if="showProfileModal"
  class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
  @click.self="showProfileModal = false"
>
  <div class="glass-panel border border-white/10 shadow-2xl shadow-neon-cyan/5 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
    <h3 class="text-lg font-medium mb-4 text-text-primary">你的真面目</h3>
    <div class="space-y-4">
      <!-- 头像上传 -->
      <div class="flex flex-col items-center gap-3">
        <div class="relative">
          <img
            v-if="currentUser?.avatar"
            :src="currentUser.avatar"
            alt="头像"
            class="w-24 h-24 rounded-full object-cover border-2 border-neon-cyan/50"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-2 ring-neon-cyan/50"
            style="background-color: #00E5FF"
          >
            {{ userInitial }}
          </div>
          <!-- 上传按钮覆盖层 -->
          <label
            class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 cursor-pointer transition-opacity"
          >
            <svg class="w-8 h-8 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleAvatarUpload"
              :disabled="uploadingAvatar"
            />
          </label>
        </div>
        <div v-if="uploadingAvatar" class="text-sm text-neon-cyan">上传中...</div>
        <button
          v-else
          @click="triggerAvatarUpload"
          class="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
        >
          换张皮
        </button>
      </div>

      <!-- 用户名（不可修改） -->
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">用户名</label>
        <div class="px-3 py-2 bg-[#1E1E24] rounded text-sm text-text-muted">
          {{ currentUser?.username }}
        </div>
      </div>

      <!-- 昵称（可编辑） -->
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">昵称</label>
        <input
          v-model="editForm.displayName"
          type="text"
          class="w-full px-3 py-2 bg-[#1E1E24] border border-white/10 rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
          placeholder="你想叫什么？"
        />
      </div>

      <!-- 手机号（可编辑） -->
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">手机号</label>
        <input
          v-model="editForm.phone"
          type="tel"
          class="w-full px-3 py-2 bg-[#1E1E24] border border-white/10 rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
          placeholder="你的呼机号"
        />
      </div>

      <!-- 用户 ID -->
      <div>
        <label class="block text-sm font-medium text-text-muted mb-1">用户 ID</label>
        <div class="px-3 py-2 bg-[#1E1E24] rounded text-sm text-text-muted break-all">
          {{ currentUser?.id }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-2 pt-2">
        <button
          @click="handleSaveProfile"
          :disabled="savingProfile"
          class="flex-1 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {{ savingProfile ? '保存中...' : '勉强保存' }}
        </button>
        <button
          @click="handleLogout"
          class="flex-1 px-4 py-2 bg-alert-red/10 border border-alert-red text-alert-red rounded hover:bg-alert-red/20 transition-all"
        >
          这就怂了要跑路？
        </button>
      </div>
      <button
        @click="showProfileModal = false"
        class="w-full px-4 py-2 bg-white/5 text-text-muted rounded hover:bg-white/10 transition-colors"
      >
        关闭
      </button>
    </div>
  </div>
</div>
```

---

### 任务 5：重写联系人页面 (ContactsPage.vue)

**文件**: `src/renderer/src/pages/contacts/ContactsPage.vue`

**要求**:
1. 背景: `bg-bg-surface`
2. 搜索框 Placeholder: "搜点不可告人的..."
3. 好友请求提示: "有人不知死活想加你"
4. 空状态文案: "一个朋友都没有，真是可悲"

**好友请求横幅**:
```vue
<div
  v-if="pendingRequests.length > 0"
  class="bg-alert-red/10 border-b border-alert-red/20 p-3 cursor-pointer hover:bg-alert-red/20 transition-colors"
  @click="showRequests = !showRequests"
>
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-alert-red">有人不知死活想加你 ({{ pendingRequests.length }})</span>
    <svg
      class="w-4 h-4 text-alert-red transition-transform"
      :class="{ 'rotate-180': showRequests }"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
    </svg>
  </div>
</div>
```

---

## 📝 重构检查清单

- [x] 全局样式配置
- [x] 登录页面
- [ ] 侧边栏组件
- [ ] 会话列表组件
- [ ] 主页面布局
- [ ] 聊天气泡样式
- [ ] 个人设置弹窗
- [ ] 联系人页面

---

## 🎨 设计原则

1. **配色一致性**: 所有页面使用统一的赛博朋克配色
2. **毛玻璃效果**: 面板使用 `glass-panel` 类
3. **霓虹发光**: 重要元素使用 `neon-cyan` 颜色和发光效果
4. **黑色幽默**: 所有文案保持嘲讽、诙谐的调性
5. **过渡动画**: 所有交互添加 `transition-all` 或 `transition-colors`

---

**文档版本**: v1.0  
**创建日期**: 2024-02-27  
**状态**: 进行中
