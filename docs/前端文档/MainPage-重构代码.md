# MainPage.vue 重构代码

由于 MainPage.vue 文件较大，这里提供关键部分的重构代码。请按照以下步骤手动更新：

## 1. 标题栏部分

将原来的：
```vue
<div class="draggable h-8 bg-list-gray flex items-center justify-between px-4 border-b border-gray-300">
  <div class="text-sm text-wechat-text">Quiet Crow - {{ connectionStatusText }}</div>
```

替换为：
```vue
<div class="draggable h-8 bg-bg-surface flex items-center justify-between px-4 border-b border-white/10">
  <div class="text-sm text-text-primary">鸦口无言 - {{ connectionStatusText }}</div>
```

## 2. 窗口控制按钮

将原来的：
```vue
<button @click="minimizeWindow" class="bg-gray-200 hover:bg-gray-300 p-1 rounded">
```

替换为：
```vue
<button @click="minimizeWindow" class="bg-white/5 hover:bg-white/10 p-1 rounded text-text-muted hover:text-text-primary transition-colors">
```

关闭按钮：
```vue
<button @click="closeWindow" class="bg-alert-red/20 hover:bg-alert-red/30 text-alert-red p-1 rounded transition-colors">
```

## 3. 主工作区背景

将：
```vue
<div class="flex-1 flex flex-col bg-workspace-bg">
```

替换为：
```vue
<div class="flex-1 flex flex-col bg-bg-void">
```

## 4. 聊天头部

将：
```vue
<div class="h-14 bg-white border-b border-gray-300 flex items-center justify-between px-4">
  <div class="font-medium">{{ activeSession.name }}</div>
```

替换为：
```vue
<div class="h-14 bg-bg-surface border-b border-white/10 flex items-center justify-between px-4">
  <div class="font-medium text-text-primary">{{ activeSession.name }}</div>
  <button class="bg-white/5 hover:bg-white/10 p-2 rounded text-text-muted hover:text-neon-cyan transition-colors">
```

## 5. 空状态

将：
```vue
<div v-else class="flex-1 flex items-center justify-center text-gray-400">
  <div class="text-center">
    <svg class="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 16 16">
      <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2zm5 4a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
    </svg>
    <p>选择一个会话开始聊天</p>
  </div>
</div>
```

替换为：
```vue
<div v-else class="flex-1 flex items-center justify-center text-text-muted">
  <div class="text-center">
    <svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
    </svg>
    <p class="text-lg">连个说话的人都没有，真是悲哀。</p>
  </div>
</div>
```

## 6. 对方消息气泡

将：
```vue
<div v-if="message.senderId !== currentUserId" class="flex items-start gap-2">
  <div class="w-10 h-10 rounded bg-gray-400 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs">
    {{ getDisplayName(message.senderId) }}
  </div>
  <div class="flex flex-col">
    <div class="bg-white rounded px-3 py-2 max-w-md shadow-sm">
      <div class="text-sm">{{ message.content }}</div>
    </div>
    <div class="text-xs text-gray-400 mt-1 ml-1">
      {{ formatTime(message.timestamp) }}
    </div>
  </div>
</div>
```

替换为：
```vue
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
```

## 7. 我方消息气泡

将：
```vue
<div v-else class="flex items-start gap-2 justify-end">
  <div class="flex flex-col items-end">
    <div 
      class="rounded px-3 py-2 max-w-md shadow-sm cursor-pointer hover:opacity-90 relative group" 
      style="background-color: #95EC69"
      @contextmenu.prevent="showMessageMenu($event, message)"
    >
      <div class="text-sm">{{ message.content }}</div>
      <button
        @click="handleDeleteMessage(message.id)"
        class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
        title="删除消息"
      >
        ×
      </button>
    </div>
    <div class="text-xs text-gray-400 mt-1 mr-1">
      {{ formatTime(message.timestamp) }}
    </div>
  </div>
  <div class="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-white font-bold" style="background-color: #95EC69">
    {{ currentUser?.displayName?.[0] || currentUser?.username?.[0]?.toUpperCase() || 'M' }}
  </div>
</div>
```

替换为：
```vue
<div v-else class="flex items-start gap-2 justify-end">
  <div class="flex flex-col items-end">
    <div 
      class="border border-neon-cyan bg-neon-cyan/10 rounded-bl-2xl rounded-tl-2xl rounded-br-sm rounded-tr-2xl px-3 py-2 max-w-md shadow-sm cursor-pointer hover:bg-neon-cyan/20 transition-colors relative group"
      @contextmenu.prevent="showMessageMenu($event, message)"
    >
      <div class="text-sm text-white">{{ message.content }}</div>
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
    {{ currentUser?.displayName?.[0] || currentUser?.username?.[0]?.toUpperCase() || 'U' }}
  </div>
</div>
```

## 8. 输入区域

将：
```vue
<div class="border-t border-gray-300 bg-white">
  <div class="p-2 flex items-center gap-2 border-b border-gray-200">
    <button class="bg-gray-100 hover:bg-gray-200 p-2 rounded">
```

替换为：
```vue
<div class="border-t border-white/10 bg-bg-surface">
  <div class="p-2 flex items-center gap-2 border-b border-white/10">
    <button class="bg-white/5 hover:bg-white/10 p-2 rounded text-text-muted hover:text-neon-cyan transition-colors">
```

输入框：
```vue
<textarea
  v-model="messageInput"
  class="flex-1 p-3 resize-none focus:outline-none bg-transparent text-text-primary placeholder-text-muted"
  rows="4"
  placeholder="想吐点什么槽？ (Enter 发送)"
  @keydown.enter.exact.prevent="sendMessage"
  @keydown.enter.shift.exact="messageInput += '\n'"
></textarea>
```

发送按钮：
```vue
<button
  @click="sendMessage"
  :disabled="!messageInput.trim()"
  class="px-4 py-2 rounded text-white transition-all bg-neon-cyan/10 border border-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
>
  发送
</button>
```

## 9. 个人信息弹窗

标题：
```vue
<h3 class="text-lg font-medium mb-4 text-text-primary">你的真面目</h3>
```

头像区域：
```vue
<div class="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold ring-2 ring-neon-cyan/50" style="background-color: #00E5FF">
  {{ userInitial }}
</div>
```

更换头像按钮：
```vue
<button class="text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors">
  换张皮
</button>
```

输入框样式：
```vue
<input
  v-model="editForm.displayName"
  type="text"
  class="w-full px-3 py-2 bg-[#1E1E24] border border-white/10 rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
  placeholder="你想叫什么？"
/>
```

手机号：
```vue
<input
  v-model="editForm.phone"
  type="tel"
  class="w-full px-3 py-2 bg-[#1E1E24] border border-white/10 rounded text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
  placeholder="你的呼机号"
/>
```

保存按钮：
```vue
<button
  @click="handleSaveProfile"
  :disabled="savingProfile"
  class="flex-1 px-4 py-2 bg-neon-cyan/10 border border-neon-cyan text-neon-cyan rounded hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
>
  {{ savingProfile ? '保存中...' : '勉强保存' }}
</button>
```

退出按钮：
```vue
<button
  @click="handleLogout"
  class="flex-1 px-4 py-2 bg-alert-red/10 border border-alert-red text-alert-red rounded hover:bg-alert-red/20 transition-all"
>
  这就怂了要跑路？
</button>
```

弹窗背景：
```vue
<div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" @click.self="showProfileModal = false">
  <div class="glass-panel border border-white/10 shadow-2xl shadow-neon-cyan/5 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
```

## 10. 设置弹窗

弹窗背景同上，按钮样式：
```vue
<button class="w-full px-4 py-3 text-left hover:bg-white/5 rounded flex items-center gap-3 text-text-primary hover:text-neon-cyan transition-colors">
```

退出登录按钮：
```vue
<button class="w-full px-4 py-3 text-left hover:bg-alert-red/10 rounded flex items-center gap-3 text-alert-red transition-colors">
```

---

## 快速替换命令

如果你使用 VS Code，可以使用以下正则表达式批量替换：

1. 背景色：
   - 查找：`bg-workspace-bg`
   - 替换：`bg-bg-void`

2. 边框：
   - 查找：`border-gray-300`
   - 替换：`border-white/10`

3. 文字颜色：
   - 查找：`text-wechat-text`
   - 替换：`text-text-primary`

4. 次要文字：
   - 查找：`text-gray-400|text-gray-500`
   - 替换：`text-text-muted`

5. 微信绿：
   - 查找：`#95EC69`
   - 替换：删除，使用新的霓虹青色样式

---

**注意**: 由于 MainPage.vue 文件较大（800+ 行），建议分段替换，每次替换后测试功能是否正常。
