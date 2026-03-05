# Silent Crow UI 规范自检报告

> 基于《Silent-Crow-UI设计规范.md》对现有组件进行全面审查

**检查日期**: 2024-02-28  
**检查范围**: 除登录页和注册页外的所有组件

---

## 📊 总体评分

| 类别 | 评分 | 状态 |
|------|------|------|
| 色彩系统 | 7/10 | ⚠️ 需要改进 |
| 组件规范 | 6/10 | ⚠️ 需要改进 |
| 布局间距 | 5/10 | ❌ 不合格 |
| 动效交互 | 7/10 | ⚠️ 需要改进 |
| 整体合规 | 6.25/10 | ⚠️ 需要改进 |

---

## 🔍 详细检查结果

### 1. TitleBar.vue (标题栏)

**文件位置**: `src/renderer/src/widgets/titleBar/TitleBar.vue`

#### ❌ 不符合规范

1. **高度不足**
   - 当前: `h-8` (32px)
   - 规范要求: `h-12` (48px)

2. **背景色不符合**
   - 当前: `bg-bg-surface` (使用了 Tailwind 变量)
   - 规范要求: `bg-[#0A0A0C]/80 backdrop-blur-xl`

3. **缺少拖拽区域样式**
   - 当前: 使用 `.draggable` 类
   - 规范要求: `style="-webkit-app-region: drag"`

4. **缺少状态指示器**
   - 规范要求: 显示"乌鸦巡逻"动画或"SYS.OFFLINE"

#### ✅ 符合规范

- 窗口控制按钮使用了半透明背景
- 关闭按钮使用了警示红色

#### 🔧 修复建议

```vue
<div 
  class="h-12 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 relative z-50" 
  style="-webkit-app-region: drag"
>
  <!-- 左侧 Logo -->
  <div class="flex items-center gap-3">
    <svg class="w-6 h-6 text-[#00E5FF]"><!-- Logo --></svg>
    <span class="text-white text-sm font-bold tracking-widest">鸦口无言</span>
  </div>
  
  <!-- 中间状态 -->
  <div class="flex items-center gap-2 text-[#00E5FF] text-xs tracking-widest">
    <span class="animate-pulse">🦅</span>
    <span>{{ connectionStatus }}</span>
  </div>
  
  <!-- 右侧控制按钮 -->
  <div class="flex items-center gap-2" style="-webkit-app-region: no-drag">
    <!-- 按钮 -->
  </div>
</div>
```

---

### 2. MessageBubble.vue (消息气泡)

**文件位置**: `src/renderer/src/widgets/messageBubble/MessageBubble.vue`

#### ✅ 符合规范

1. **对方消息**
   - ✅ 使用 `bg-[#1E1E24]` 深灰色底
   - ✅ 左上角直角 `rounded-tl-sm`
   - ✅ 文字颜色 `text-[#E0E0E0]`

2. **我方消息**
   - ✅ 使用青色渐变 `bg-gradient-to-br from-[#00E5FF]/20 to-[#008A99]/10`
   - ✅ 青色边框 `border-[#00E5FF]/30`
   - ✅ 右上角直角 `rounded-tr-sm`
   - ✅ 纯白文字 `text-white`

#### ⚠️ 可以改进

1. **头像样式**
   - 当前: 使用简单的背景色
   - 建议: 我方头像可以添加青色发光效果

2. **删除按钮**
   - 当前: 使用 `bg-alert-red`
   - 建议: 改为 `bg-[#FF3366]` 并添加发光效果

---

### 3. MessageInput.vue (消息输入框)

**文件位置**: `src/renderer/src/widgets/messageInput/MessageInput.vue`

#### ❌ 不符合规范

1. **输入框样式不符合**
   - 当前: `bg-transparent` (完全透明)
   - 规范要求: 使用内凹输入框样式
   ```css
   bg-black/40 
   border border-white/5 
   shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]
   ```

2. **容器背景不符合**
   - 当前: `bg-[#151518]/80`
   - 建议: 改为 `bg-[#0A0A0C]/80`

3. **按钮样式不完全符合**
   - 当前: 缺少发光效果
   - 规范要求: `shadow-[0_0_20px_rgba(0,229,255,0.2)]`

#### 🔧 修复建议

```vue
<div class="bg-[#0A0A0C]/80 backdrop-blur-md border-t border-white/5 p-4">
  <div class="relative">
    <textarea
      class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-4 py-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[15px] tracking-widest resize-none"
      placeholder="想吐点什么槽？ (Enter 发送)"
    ></textarea>
  </div>
  
  <div class="flex justify-between items-center mt-3">
    <!-- 工具按钮 -->
    <div class="flex gap-2">
      <button class="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#555555] hover:text-[#00E5FF] transition-all">
        <!-- Icon -->
      </button>
    </div>
    
    <!-- 发送按钮 -->
    <button class="px-6 py-2 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/80 text-[#00E5FF] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase">
      发送
    </button>
  </div>
</div>
```

---

### 4. Sidebar.vue (侧边栏)

**文件位置**: `src/renderer/src/widgets/sidebar/Sidebar.vue`

#### ✅ 符合规范

1. **背景色正确**
   - ✅ 使用 `bg-[#0A0A0C]`

2. **Logo 设计优秀**
   - ✅ 使用折纸机甲乌鸦 SVG
   - ✅ 青色描边和发光效果

3. **按钮交互良好**
   - ✅ 激活状态使用青色背景和内阴影
   - ✅ 未读数使用红色徽章和发光效果

#### ⚠️ 可以改进

1. **按钮间距**
   - 当前: `gap-4` (16px)
   - 建议: 改为 `gap-6` (24px) 增加呼吸感

---

### 5. SessionList.vue (会话列表)

**文件位置**: `src/renderer/src/widgets/sessionList/SessionList.vue`

#### ❌ 不符合规范

1. **搜索框样式不符合**
   - 当前: `bg-[#1E1E24]` (实色背景)
   - 规范要求: 使用内凹输入框样式
   ```css
   bg-black/40 
   shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]
   ```

2. **会话项间距不足**
   - 当前: `my-1` (4px)
   - 建议: 改为 `my-2` (8px)

3. **激活状态样式**
   - 当前: `bg-neon-cyan/10 border-l-2`
   - 建议: 改为完整的内阴影效果
   ```css
   bg-[#00E5FF]/10 
   shadow-[inset_0_0_12px_rgba(0,229,255,0.2)] 
   border border-[#00E5FF]/30
   ```

#### 🔧 修复建议

```vue
<!-- 搜索框 -->
<div class="p-4">
  <div class="relative group">
    <input
      type="text"
      placeholder="搜点不可告人的..."
      class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pl-4 pr-5 py-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[14px] tracking-widest"
    />
  </div>
</div>
```

---

### 6. ContactsPage.vue (联系人页面)

**文件位置**: `src/renderer/src/pages/contacts/ContactsPage.vue`

#### ❌ 不符合规范

1. **搜索框样式不符合** (同 SessionList)
   - 需要改为内凹输入框样式

2. **添加好友模态框背景**
   - 当前: `bg-black/70 backdrop-blur-sm`
   - 建议: 改为 `bg-black/80 backdrop-blur-xl`

3. **模态框卡片样式**
   - 当前: 使用 `glass-panel` 类
   - 建议: 使用规范的毛玻璃卡片样式
   ```css
   bg-white/[0.03] 
   backdrop-blur-2xl 
   border border-white/10 
   shadow-[0_0_80px_rgba(0,0,0,0.9)]
   ```

4. **输入框和文本域样式**
   - 当前: `bg-[#1E1E24]` (实色背景)
   - 规范要求: 内凹输入框样式

#### 🔧 修复建议

```vue
<!-- 添加好友模态框 -->
<div class="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50">
  <div class="w-[400px] px-10 py-12 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col relative z-10">
    <h3 class="text-xl font-bold text-white mb-8 tracking-widest">找个倒霉蛋</h3>
    
    <!-- 搜索输入框 -->
    <div class="relative group mb-6">
      <input
        type="text"
        placeholder="输入代号或昵称"
        class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pl-4 pr-5 py-4 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[15px] tracking-widest"
      />
    </div>
    
    <!-- 按钮 -->
    <button class="w-full mt-8 py-4 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/80 text-[#00E5FF] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase">
      发送请求
    </button>
  </div>
</div>
```

---

## 🚨 严重违规项

### 1. 使用了 Tailwind 自定义变量

多个组件使用了自定义的 Tailwind 变量，如：
- `bg-bg-surface`
- `bg-bg-void`
- `text-text-primary`
- `text-text-muted`
- `text-neon-cyan`
- `bg-bubble-other`
- `bg-alert-red`

**问题**: 这些变量未在规范中定义，且可能与规范的色彩令牌不一致。

**修复方案**: 
1. 检查 `tailwind.config.js` 或 `global.css` 中的变量定义
2. 将所有变量替换为规范中的直接颜色值
3. 例如：
   - `bg-bg-surface` → `bg-[#0A0A0C]`
   - `text-text-primary` → `text-[#E0E0E0]`
   - `text-neon-cyan` → `text-[#00E5FF]`
   - `bg-alert-red` → `bg-[#FF3366]`

---

### 2. 输入框样式不统一

所有搜索框和输入框都使用了实色背景 `bg-[#1E1E24]`，而不是规范要求的内凹样式。

**影响范围**:
- SessionList.vue - 搜索框
- ContactsPage.vue - 搜索框、添加好友表单
- MessageInput.vue - 消息输入框

**修复优先级**: 🔴 高

---

### 3. 缺少装饰性光晕

规范要求在页面中添加装饰性光晕：
```vue
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
```

**当前状态**: 所有页面都缺少此装饰

**修复优先级**: 🟡 中

---

## 📋 修复优先级清单

### 🔴 高优先级 (必须立即修复)

1. **替换所有 Tailwind 自定义变量为直接颜色值**
   - 影响: 所有组件
   - 工作量: 大

2. **统一输入框样式为内凹样式**
   - 影响: SessionList, ContactsPage, MessageInput
   - 工作量: 中

3. **修复 TitleBar 高度和样式**
   - 影响: 全局标题栏
   - 工作量: 小

### 🟡 中优先级 (建议修复)

4. **添加装饰性光晕**
   - 影响: 视觉层次
   - 工作量: 小

5. **优化会话列表激活状态**
   - 影响: SessionList
   - 工作量: 小

6. **统一模态框样式**
   - 影响: ContactsPage
   - 工作量: 中

### 🟢 低优先级 (可选优化)

7. **增加侧边栏按钮间距**
   - 影响: Sidebar
   - 工作量: 极小

8. **优化头像发光效果**
   - 影响: MessageBubble
   - 工作量: 小

---

## 📊 组件合规度统计

| 组件 | 合规度 | 主要问题 |
|------|--------|---------|
| TitleBar.vue | 40% | 高度、背景、缺少状态指示器 |
| MessageBubble.vue | 90% | 基本符合，可优化头像 |
| MessageInput.vue | 50% | 输入框样式、按钮发光效果 |
| Sidebar.vue | 85% | 基本符合，可优化间距 |
| SessionList.vue | 60% | 搜索框样式、激活状态 |
| ContactsPage.vue | 55% | 搜索框、模态框、输入框样式 |

---

## 🎯 总结

### 主要问题

1. **色彩系统不统一** - 大量使用自定义 Tailwind 变量而非规范定义的颜色值
2. **输入框样式不符合** - 所有输入框都使用实色背景，而非内凹样式
3. **标题栏不符合规范** - 高度、背景、缺少状态指示器
4. **缺少装饰性元素** - 没有背景光晕等装饰

### 优点

1. **消息气泡完全符合规范** - 对方/我方消息样式正确
2. **侧边栏设计优秀** - Logo 和按钮交互符合赛博朋克风格
3. **整体色调统一** - 深色主题和青色强调色使用正确

### 建议

1. **立即修复高优先级问题** - 特别是 Tailwind 变量和输入框样式
2. **建立组件库** - 将符合规范的输入框、按钮等封装成可复用组件
3. **添加 ESLint 规则** - 禁止使用未定义的 Tailwind 变量
4. **定期审查** - 每次添加新组件后进行规范审查

---

**报告生成时间**: 2024-02-28  
**下次审查时间**: 修复完成后
