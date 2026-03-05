# SVG 图标替换完成

## 已完成的替换

### 1. 侧边栏 (Sidebar.vue) ✅

已替换：
- Logo：折纸机甲乌鸦（替换了文字 "I"）
- 消息图标：使用 Heroicons 聊天气泡图标
- 联系人图标：使用 Heroicons 用户组图标
- 设置图标：使用 Heroicons 齿轮图标

---

## 待替换的部分

### 2. 主页面 (MainPage.vue)

#### 窗口控制按钮

```vue
<!-- 最小化 -->
<button @click="minimizeWindow" class="bg-transparent hover:bg-white/5 p-1.5 rounded transition-colors group">
  <svg viewBox="0 0 12 12" class="w-3 h-3 text-[#85858A] group-hover:text-white transition-colors" fill="none" stroke="currentColor">
    <line x1="1" y1="6" x2="11" y2="6" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</button>

<!-- 最大化 -->
<button @click="maximizeWindow" class="bg-transparent hover:bg-white/5 p-1.5 rounded transition-colors group">
  <svg viewBox="0 0 12 12" class="w-3 h-3 text-[#85858A] group-hover:text-white transition-colors" fill="none" stroke="currentColor">
    <rect x="1.5" y="1.5" width="9" height="9" stroke-width="1.5" rx="1" />
  </svg>
</button>

<!-- 关闭 -->
<button @click="closeWindow" class="bg-transparent hover:bg-[#FF3366]/20 p-1.5 rounded transition-colors group">
  <svg viewBox="0 0 12 12" class="w-3.5 h-3.5 text-[#85858A] group-hover:text-[#FF3366] transition-colors" fill="none" stroke="currentColor">
    <line x1="1" y1="1" x2="11" y2="11" stroke-width="1.5" stroke-linecap="round" />
    <line x1="11" y1="1" x2="1" y2="11" stroke-width="1.5" stroke-linecap="round" />
  </svg>
</button>
```

#### 空状态图标

```vue
<!-- 嘲讽的死乌鸦 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-24 h-24 mb-4 opacity-40 mx-auto">
  <path d="M50 20 C20 20 15 50 15 60 C15 70 30 80 50 80 C70 80 85 70 85 60 C85 50 80 20 50 20 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
  <path d="M35 45 L45 55 M45 45 L35 55" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <path d="M55 45 L65 55 M65 45 L55 55" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
  <path d="M40 70 L50 85 L60 70" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/>
</svg>
<p class="tracking-wide">选择一个会话开始聊天</p>
```

#### 输入框工具栏

```vue
<div class="p-2 flex items-center gap-5 px-4 text-[#85858A]">
  <!-- 表情按钮 - 保留 Emoji -->
  <button class="hover:text-[#00E5FF] hover:drop-shadow-[0_0_5px_rgba(0,229,255,0.8)] transition-all p-1">
    <span class="text-xl">😊</span>
  </button>
  
  <!-- 附件按钮 -->
  <button class="hover:text-[#00E5FF] hover:drop-shadow-[0_0_5px_rgba(0,229,255,0.8)] transition-all">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
    </svg>
  </button>
</div>
```

#### 发送按钮

```vue
<button
  @click="sendMessage"
  :disabled="!messageInput.trim()"
  class="px-5 py-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] text-sm tracking-widest hover:bg-[#00E5FF]/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
  </svg>
  发送
</button>
```

---

### 3. 登录页面 (LoginPage.vue)

#### Logo 区域

```vue
<div class="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" class="w-16 h-16">
    <path d="M14 56 L24 16 L46 12 L62 28 L40 32 L52 42 L28 56 Z" fill="#0A0A0C" stroke="#00E5FF" stroke-width="1.5" stroke-linejoin="round" class="drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
    <circle cx="38" cy="24" r="2.5" fill="#00E5FF" class="animate-pulse drop-shadow-[0_0_5px_rgba(0,229,255,1)]" />
    <line x1="22" y1="40" x2="32" y2="38" stroke="#00E5FF" stroke-width="1" opacity="0.5" />
    <line x1="20" y1="48" x2="28" y2="46" stroke="#00E5FF" stroke-width="1" opacity="0.3" />
  </svg>
</div>
```

---

## 替换原则

1. **保持 currentColor**：所有 SVG 使用 `stroke="currentColor"` 或 `fill="currentColor"`，自动继承父元素的文字颜色
2. **响应式尺寸**：使用 Tailwind 的 `w-*` 和 `h-*` 类
3. **悬停效果**：配合 `group` 和 `group-hover:` 实现悬停变色
4. **发光效果**：使用 `drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]` 实现霓虹发光

---

## 注意事项

1. **表情符号保留**：输入框的表情按钮保留 Emoji 😊，因为它更直观
2. **窗口控制按钮**：关闭按钮悬停时必须变成警戒红 `#FF3366`
3. **Logo 动画**：乌鸦眼睛使用 `animate-pulse` 实现呼吸灯效果
4. **空状态图标**：死乌鸦的 X 眼睛和吐舌头，增加趣味性

---

**创建时间**: 2024-02-27  
**状态**: 侧边栏已完成 ✅，主页面待手动替换
