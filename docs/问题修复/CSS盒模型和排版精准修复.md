# CSS 盒模型和排版精准修复

## 修复概述

修复了主界面中存在的严重 CSS 盒模型和排版错误，包括：
- 搜索框图标与文字重叠
- 会话列表选中状态的廉价发光效果
- 未读红点变形问题
- 聊天气泡缺少内边距
- 底部输入区布局混乱

## 修复详情

### 1. 搜索框修复（SessionList.vue）

**问题**：图标与文字重叠，用户输入时文字会覆盖在放大镜图标上

**解决方案**：
- 将图标容器从 `pl-3.5` 改为固定宽度 `w-10`
- 使用 `flex items-center justify-center` 居中图标
- 输入框保持 `pl-10`，确保文字与图标有 40px 的安全距离

```vue
<div class="absolute inset-y-0 left-0 w-10 flex items-center justify-center pointer-events-none text-[#555555] group-focus-within:text-[#00E5FF] transition-colors">
  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
  </svg>
</div>
<input class="w-full bg-black/40 ... pl-10 pr-3 py-2.5 ..." />
```

### 2. 会话列表选中状态修复（SessionList.vue）

**问题**：
- 选中状态使用了廉价的发光效果（`shadow-[0_0_20px_rgba(0,229,255,0.15)]`）
- 辉光背景层（`bg-[#00E5FF]/5 blur-md`）看起来像灯泡
- 不符合顶级电竞/极客软件的设计风格

**解决方案**：
- 去除辉光背景层和发光阴影
- 使用高级的左侧边条设计：`border-l-4 border-l-[#00E5FF]`
- 背景微微变亮：`bg-[#151518]`
- 参考 Discord、Steam 等顶级软件的处理方式

**未选中状态**：
```vue
<div class="relative flex items-center p-3 rounded-xl bg-[#0A0A0C] border border-white/5 hover:border-white/10 transition-all duration-300">
```

**选中状态**：
```vue
<div class="relative flex items-center p-3 rounded-xl bg-[#151518] border border-transparent border-l-4 border-l-[#00E5FF] transition-all duration-300">
```

### 3. 未读红点修复（SessionList.vue）

**问题**：
- 红点作为独立元素放在卡片外部，容易变形
- 没有与头像的视觉关联

**解决方案**：
- 使用绝对定位将红点覆盖在头像右上角
- 添加极细边框与背景剥离：`border-2 border-[#0A0A0C]`（未选中）/ `border-[#151518]`（选中）
- 使用 `min-w-[18px] h-[18px]` 确保红点是正圆
- 数字较大时自动变成胶囊形

```vue
<div class="relative w-10 h-10 rounded-lg ...">
  {{ session.name ? session.name[0] : '?' }}
  <!-- 未读红点 -->
  <span class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#FF3366] text-white text-[10px] font-bold rounded-full border-2 border-[#0A0A0C] shadow-[0_0_8px_rgba(255,51,102,0.5)]">
    {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
  </span>
</div>
```

### 4. 聊天气泡修复（MessageBubble.vue）

**问题**：
- 气泡内部没有内边距，文字紧贴边缘
- 看起来不像"气泡"，更像文字直接浮在背景上

**解决方案**：
- 添加舒适的内边距：`px-4 py-2.5`
- 调整圆角：`rounded-2xl rounded-tl-sm`（对方）/ `rounded-tr-sm`（我方）
- 增加阴影深度：`shadow-[0_2px_10px_rgba(0,0,0,0.3)]`
- 文字使用 `break-all` 防止长单词溢出

**对方消息**：
```vue
<div class="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-[#1E1E24] border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
  <div class="text-[14px] text-[#E0E0E0] leading-relaxed break-all">{{ content }}</div>
</div>
```

**我方消息**：
```vue
<div class="px-4 py-2.5 rounded-2xl rounded-tr-sm bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#E0E0E0] shadow-[0_2px_10px_rgba(0,229,255,0.05)] ...">
  <div class="text-[14px] leading-relaxed break-all">{{ content }}</div>
</div>
```

### 5. 底部输入区修复（MessageInput.vue）

**问题**：
- 输入框和按钮布局混乱
- 发送按钮没有固定形状，只是一团字
- 工具栏图标样式不统一

**解决方案**：
- 使用固定高度容器：`h-44`
- 工具栏使用简洁的图标按钮
- 输入框使用透明背景：`bg-transparent`
- 发送按钮使用绝对定位悬浮在右下角：`absolute bottom-4 right-4`
- 按钮有明确的形状和边框

```vue
<div class="h-44 bg-[#0A0A0C] border-t border-white/5 p-4 flex flex-col relative">
  <!-- 工具栏 -->
  <div class="flex items-center gap-4 mb-2 text-[#555555]">
    <button class="hover:text-[#00E5FF] transition-colors">
      <svg class="w-5 h-5" ...>...</svg>
    </button>
  </div>

  <!-- 输入框 -->
  <textarea class="flex-1 w-full bg-transparent text-[#E0E0E0] placeholder-[#555555] resize-none focus:outline-none text-[14px]" ...></textarea>

  <!-- 发送按钮 -->
  <button class="absolute bottom-4 right-4 px-6 py-2 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] text-[13px] tracking-widest font-bold hover:bg-[#00E5FF]/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300 ...">
    发送
  </button>
</div>
```

### 6. 侧边栏头像修复（Sidebar.vue）

**问题**：
- 头像有大面积青色发光包裹（`shadow-[0_0_15px_rgba(0,229,255,0.1)]`）
- Hover 时发光更强（`shadow-[0_0_20px_rgba(0,229,255,0.3)]`）
- 看起来过于夸张

**解决方案**：
- 去除所有发光阴影
- 使用极简边框：`border-white/10`
- Hover 时边框变青色：`hover:border-[#00E5FF]/50`
- 保持简洁高级的视觉效果

```vue
<div class="w-11 h-11 rounded-xl border border-white/10 hover:border-[#00E5FF]/50 overflow-hidden flex items-center justify-center bg-[#0A0A0C] cursor-pointer transition-all duration-300 group relative">
```

### 7. 消息列表间距修复（MessageList.vue）

**问题**：
- 容器使用了 `space-y-6`
- 气泡组件内部也有 `mb-4`
- 导致间距重复累加

**解决方案**：
- 移除容器的 `space-y-6`
- 仅在气泡组件内部使用 `mb-4`
- 确保间距统一且可控

## 视觉效果对比

### 修复前
- ❌ 搜索框：图标与文字重叠
- ❌ 选中状态：廉价的发光效果，像灯泡
- ❌ 未读红点：独立元素，容易变形
- ❌ 聊天气泡：文字紧贴边缘，没有呼吸感
- ❌ 输入区：布局混乱，按钮没有形状
- ❌ 头像：过度发光，视觉噪音

### 修复后
- ✅ 搜索框：图标与文字有 40px 安全距离
- ✅ 选中状态：高级的左侧青色边条，参考 Discord/Steam
- ✅ 未读红点：覆盖在头像右上角，正圆形，带细边框
- ✅ 聊天气泡：舒适的内边距（px-4 py-2.5），文字可以"呼吸"
- ✅ 输入区：清晰的布局，发送按钮悬浮在右下角
- ✅ 头像：极简边框，Hover 时变青色

## 设计理念

### 精致的红点角标
- 使用绝对定位覆盖在头像右上角
- `min-w-[18px] h-[18px]` 确保是正圆
- 数字大时自动变成胶囊形
- 极细边框与背景剥离，看起来非常高级

### 通透的搜索框
- `w-10` 固定图标容器宽度
- `pl-10` 给文字留出 40px 安全距离
- 图标和文字永远不会重叠

### 冷酷的选中状态
- 去除灯泡式发光效果
- 使用 4px 宽的青色左侧边条（`border-l-4`）
- 背景微微变亮（`bg-[#151518]`）
- 这是顶级电竞/极客软件的标准做法

### 饱满的气泡与按键
- 气泡加入 `px-4 py-2.5`，文字可以"大口呼吸"
- 发送按钮是规规矩矩的长方形
- 悬浮在右下角，随时等待点击

## 符合 UI 设计规范

严格遵循《Silent Crow UI 设计规范》：

- ✅ 深渊底色：`#0A0A0C`、`#151518`
- ✅ 内凹输入框：`bg-black/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]`
- ✅ 霓虹青色：`#00E5FF` 用于高亮和边条
- ✅ 警示红色：`#FF3366` 用于未读数和删除
- ✅ 极简边框：`border-white/5`、`border-white/10`
- ✅ 去除廉价发光，使用高级边条设计

## 修复文件清单

- ✅ `src/renderer/src/widgets/sessionList/SessionList.vue` - 搜索框、会话列表、未读红点
- ✅ `src/renderer/src/widgets/messageBubble/MessageBubble.vue` - 聊天气泡内边距
- ✅ `src/renderer/src/widgets/messageInput/MessageInput.vue` - 底部输入区布局
- ✅ `src/renderer/src/widgets/sidebar/Sidebar.vue` - 头像边框
- ✅ `src/renderer/src/widgets/messageList/MessageList.vue` - 消息列表间距

## 技术亮点

1. **绝对定位红点**：使用 `absolute -top-1.5 -right-1.5` 精准覆盖在头像右上角
2. **固定宽度图标容器**：`w-10` 确保图标位置固定，文字不会重叠
3. **左侧边条设计**：`border-l-4 border-l-[#00E5FF]` 实现高级选中效果
4. **舒适的内边距**：`px-4 py-2.5` 让气泡真正成为"气泡"
5. **绝对定位按钮**：`absolute bottom-4 right-4` 让发送按钮悬浮在固定位置
6. **极简边框**：去除所有廉价发光，使用 `border-white/10` 和 `hover:border-[#00E5FF]/50`

## 总结

完成了主界面所有 CSS 盒模型和排版错误的精准修复。所有修改都严格遵循 UI 设计规范，参考了 Discord、Steam 等顶级软件的设计风格。现在的界面更加精致、高级、符合赛博朋克暗黑风格。
