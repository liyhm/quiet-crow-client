# Silent Crow UI 设计规范（系统级 UI 宪法）

> **警告**: 本文档定义了《鸦口无言》的核心视觉语言。任何新页面、新组件的开发都必须严格遵守本规范，防止出现"视觉降级"（如纯白背景、刺眼绿气泡、拥挤布局等）。

---

## 📋 目录

- [设计哲学](#设计哲学)
- [核心色彩令牌](#核心色彩令牌)
- [核心组件规范](#核心组件规范)
- [布局与间距系统](#布局与间距系统)
- [动效与交互](#动效与交互)
- [禁止事项清单](#禁止事项清单)
- [组件代码模板](#组件代码模板)

---

## 🎨 设计哲学

### 核心理念

**赛博朋克 · 暗黑毛玻璃 · 极简主义**

1. **深邃而非漆黑** - 使用多层次的深色，而非纯黑 #000000
2. **透明而非实色** - 优先使用半透明毛玻璃，而非实心色块
3. **发光而非填充** - 使用霓虹光晕表达状态，而非颜色填充
4. **凹陷而非凸起** - 输入框采用内阴影凹槽，而非凸起边框
5. **呼吸而非拥挤** - 大量留白，元素间距至少 16px

### 视觉层次

```
Z-Index 层级：
100+ : 全局通知、模态框
50+  : 下拉菜单、悬浮面板
10+  : 卡片、输入框
0    : 背景、底层容器
-1   : 装饰性光晕
```

---

## 🎨 核心色彩令牌

### 主色系统

| 令牌名称 | 颜色值 | Tailwind 类名 | 用途 |
|---------|--------|--------------|------|
| **深渊底色** | `#050505` ~ `#0A0A0C` | `bg-[#0A0A0C]` | 应用最底层背景 |
| **主控霓虹** | `#00E5FF` | `text-[#00E5FF]` | 交互反馈、图标发光、未读状态 |
| **警示红** | `#FF3366` | `text-[#FF3366]` | 破坏性操作、断网状态 |
| **幽灵白** | `#E0E0E0` | `text-[#E0E0E0]` | 主要文字 |
| **暗灰** | `#555555` ~ `#85858A` | `text-[#555555]` | 次要文字、占位符 |

### 毛玻璃系统

```css
/* 高级毛玻璃 (Cyber Glass) - 用于卡片和面板 */
bg-white/[0.03]           /* 3% 透明度白色 */
backdrop-blur-2xl         /* 极强模糊 */
border border-white/10    /* 10% 透明度边框 */
shadow-[0_0_80px_rgba(0,0,0,0.9)]  /* 深阴影 */
```


### 背景渐变系统

```css
/* 主背景 - 径向渐变 */
bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
from-[#1E1E28]    /* 中心较亮 */
via-[#0A0A0F]     /* 中间过渡 */
to-[#050505]      /* 边缘最暗 */

/* 装饰性光晕 */
bg-[#00E5FF]/5 blur-[120px] rounded-full
```

---

## 🧩 核心组件规范

### 1. 沉浸式内凹输入框 (Recessed Inputs)

**设计原则**: 彻底废除传统的实心或白色输入框。所有输入区域必须采用内阴影凹槽设计。

**完整类名**:
```css
w-full 
bg-black/40                    /* 深色半透明背景 */
border border-white/5          /* 极细边框 */
shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]  /* 顶部内阴影 */
text-[#E0E0E0]                 /* 文字颜色 */
pl-12 pr-5 py-4                /* 内边距 */
rounded-xl                     /* 圆角 */
focus:outline-none 
focus:border-[#00E5FF]/50      /* 聚焦边框 */
focus:bg-black/80              /* 聚焦背景更深 */
focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)]
transition-all duration-300 
placeholder-[#555555] 
text-[15px] 
tracking-widest
```

**代码模板**:
```vue
<div class="relative group">
  <!-- 图标 -->
  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#555555] group-focus-within:text-[#00E5FF] group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <!-- SVG 路径 -->
    </svg>
  </div>
  
  <!-- 输入框 -->
  <input
    type="text"
    placeholder="占位文字"
    class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pl-12 pr-5 py-4 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[15px] tracking-widest"
  />
</div>
```

---

### 2. 3D 全息下拉菜单 (Holographic Dropdowns)

**设计原则**: 所有浮层必须具备极强的 Z 轴空间感，与底层内容视觉隔离。

**完整类名**:
```css
absolute z-50 
left-0 right-0 
top-[calc(100%+8px)]           /* 距离触发元素 8px */
bg-[#0A0A0C]/95                /* 深色半透明 */
backdrop-blur-2xl              /* 强模糊 */
border border-[#00E5FF]/20     /* 青色边框 */
rounded-xl 
shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_15px_rgba(0,229,255,0.1)]  /* 下沉阴影 + 青色光晕 */
overflow-hidden
```

**列表项类名**:
```css
group/item 
px-4 py-3 
hover:bg-[#00E5FF]/10          /* 悬停青色背景 */
cursor-pointer 
flex items-center justify-between 
border-b border-white/5 
last:border-0 
transition-colors
```

**代码模板**:
```vue
<div class="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_15px_rgba(0,229,255,0.1)] overflow-hidden">
  <div
    v-for="item in items"
    :key="item.id"
    class="group/item px-4 py-3 hover:bg-[#00E5FF]/10 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0 transition-colors"
  >
    <span class="text-[14px] text-[#85858A] group-hover/item:text-[#E0E0E0] transition-colors tracking-widest">
      {{ item.label }}
    </span>
  </div>
</div>
```

---

### 3. 霓虹按钮 (Neon Buttons)

**设计原则**: 使用半透明青色 + 发光效果，悬停时上浮。

**完整类名**:
```css
w-full 
mt-8 py-4 
rounded-xl 
bg-[#00E5FF]/10                /* 青色半透明 */
border border-[#00E5FF]/80     /* 青色边框 */
text-[#00E5FF] 
font-bold 
tracking-[0.2em] 
shadow-[0_0_20px_rgba(0,229,255,0.2)]  /* 发光 */
hover:bg-[#00E5FF]/20 
hover:shadow-[0_0_35px_rgba(0,229,255,0.5)]  /* 悬停更亮 */
hover:-translate-y-0.5         /* 上浮 */
transition-all duration-300 
uppercase 
disabled:opacity-50 
disabled:cursor-not-allowed 
disabled:hover:translate-y-0
```

**代码模板**:
```vue
<button
  type="submit"
  class="w-full mt-8 py-4 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/80 text-[#00E5FF] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
  :disabled="loading"
>
  {{ loading ? '处理中...' : '确认操作' }}
</button>
```

---

### 4. 毛玻璃卡片 (Cyber Glass Cards)

**设计原则**: 所有面板和卡片必须使用毛玻璃效果，而非实色背景。

**完整类名**:
```css
w-[360px]                      /* 固定宽度或响应式 */
px-10 py-16                    /* 大量内边距 */
rounded-[2rem]                 /* 大圆角 */
bg-white/[0.03]                /* 3% 透明度白色 */
backdrop-blur-2xl              /* 极强模糊 */
border border-white/10         /* 微弱边框 */
shadow-[0_0_80px_rgba(0,0,0,0.9)]  /* 深阴影 */
flex flex-col items-center 
relative z-10
```

**代码模板**:
```vue
<div class="w-[360px] px-10 py-16 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col items-center relative z-10">
  <!-- 卡片内容 -->
</div>
```


---

### 5. 赛博聊天气泡 (Cyber Bubbles)

**设计原则**: 对方消息深灰实色，我方消息半透明青色渐变。

**对方消息**:
```css
bg-[#1E1E24]                   /* 深灰色底 */
text-[#E0E0E0]                 /* 白色文字 */
px-4 py-3 
rounded-2xl 
rounded-tl-none                /* 左上角直角 */
max-w-[70%] 
break-words
shadow-[0_2px_8px_rgba(0,0,0,0.3)]
```

**我方消息**:
```css
bg-gradient-to-br 
from-[#00E5FF]/20 
to-[#008A99]/5                 /* 青色渐变 */
border border-[#00E5FF]/30     /* 青色边框 */
text-white                     /* 纯白文字 */
px-4 py-3 
rounded-2xl 
rounded-tr-none                /* 右上角直角 */
max-w-[70%] 
break-words
shadow-[0_2px_8px_rgba(0,229,255,0.1)]
```

**代码模板**:
```vue
<!-- 对方消息 -->
<div class="flex justify-start mb-4">
  <div class="bg-[#1E1E24] text-[#E0E0E0] px-4 py-3 rounded-2xl rounded-tl-none max-w-[70%] break-words shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
    {{ message.content }}
  </div>
</div>

<!-- 我方消息 -->
<div class="flex justify-end mb-4">
  <div class="bg-gradient-to-br from-[#00E5FF]/20 to-[#008A99]/5 border border-[#00E5FF]/30 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[70%] break-words shadow-[0_2px_8px_rgba(0,229,255,0.1)]">
    {{ message.content }}
  </div>
</div>
```

---

### 6. 动态标题栏 (Dynamic Titlebar)

**设计原则**: 废弃系统原生标题，采用无边框拖拽区域 + 状态动画。

**完整类名**:
```css
h-12                           /* 固定高度 */
bg-[#0A0A0C]/80                /* 深色半透明 */
backdrop-blur-xl               /* 模糊 */
border-b border-white/5        /* 底部边框 */
flex items-center justify-between 
px-4 
relative z-50
```

**拖拽区域**:
```css
style="-webkit-app-region: drag"
```

**状态指示器**:
```vue
<!-- 在线状态 - 乌鸦巡逻动画 -->
<div class="flex items-center gap-2 text-[#00E5FF] text-xs tracking-widest">
  <span class="animate-pulse">🦅</span>
  <span>SYS.ONLINE</span>
</div>

<!-- 离线状态 - 红色闪烁 -->
<div class="flex items-center gap-2 text-[#FF3366] text-xs tracking-widest animate-pulse">
  <span>⚠</span>
  <span>SYS.OFFLINE</span>
</div>
```

**代码模板**:
```vue
<div class="h-12 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 relative z-50" style="-webkit-app-region: drag">
  <!-- 左侧 Logo -->
  <div class="flex items-center gap-3">
    <svg class="w-6 h-6 text-[#00E5FF]"><!-- Logo SVG --></svg>
    <span class="text-white text-sm font-bold tracking-widest">鸦口无言</span>
  </div>
  
  <!-- 中间状态 -->
  <div class="flex items-center gap-2 text-[#00E5FF] text-xs tracking-widest">
    <span class="animate-pulse">🦅</span>
    <span>SYS.ONLINE</span>
  </div>
  
  <!-- 右侧窗口控制 -->
  <div class="flex items-center gap-2" style="-webkit-app-region: no-drag">
    <button class="w-8 h-8 hover:bg-white/10 rounded transition-colors">−</button>
    <button class="w-8 h-8 hover:bg-white/10 rounded transition-colors">□</button>
    <button class="w-8 h-8 hover:bg-[#FF3366]/20 rounded transition-colors">×</button>
  </div>
</div>
```

---

## 📐 布局与间距系统

### 间距令牌

| 令牌 | 值 | Tailwind | 用途 |
|------|-----|----------|------|
| **xs** | 4px | `gap-1` | 紧密元素 |
| **sm** | 8px | `gap-2` | 相关元素 |
| **md** | 16px | `gap-4` | 默认间距 |
| **lg** | 24px | `gap-6` | 输入框间距 |
| **xl** | 32px | `gap-8` | 区块间距 |
| **2xl** | 40px | `gap-10` | 大区块间距 |

### 布局原则

1. **卡片内边距**: 最小 `px-10 py-16`
2. **输入框间距**: 最小 `gap-6` (24px)
3. **按钮上边距**: 最小 `mt-8` (32px)
4. **区块间距**: 最小 `mb-10` (40px)

### 响应式断点

```css
/* 移动端 */
@media (max-width: 640px) {
  .card { width: 100%; padding: 2rem 1.5rem; }
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
  .card { width: 400px; }
}

/* 桌面 */
@media (min-width: 1025px) {
  .card { width: 360px; }
}
```

---

## ✨ 动效与交互

### 过渡时间

| 类型 | 时长 | Tailwind |
|------|------|----------|
| **快速** | 150ms | `duration-150` |
| **标准** | 300ms | `duration-300` |
| **缓慢** | 500ms | `duration-500` |

### 标准动效

**1. 悬停上浮**
```css
hover:-translate-y-0.5 transition-all duration-300
```

**2. 聚焦发光**
```css
focus:shadow-[0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300
```

**3. 脉冲动画**
```css
animate-pulse
```

**4. 淡入淡出**
```vue
<transition name="fade">
  <div v-if="show">内容</div>
</transition>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

---

## 🚫 禁止事项清单

### 严格禁止

❌ **纯白背景** (`bg-white`)  
✅ 使用 `bg-white/[0.03]` + `backdrop-blur-2xl`

❌ **实色输入框** (`bg-gray-200`)  
✅ 使用 `bg-black/40` + `shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]`

❌ **刺眼绿色** (`bg-green-500`)  
✅ 使用 `bg-[#00E5FF]/10` + `border-[#00E5FF]/80`

❌ **紧密布局** (`gap-2` 或更小)  
✅ 最小使用 `gap-6` (24px)

❌ **凸起按钮** (`shadow-lg`)  
✅ 使用 `shadow-[0_0_20px_rgba(0,229,255,0.2)]` 发光效果

❌ **系统原生标题栏**  
✅ 使用自定义无边框标题栏

❌ **纯黑背景** (`bg-black` 或 `#000000`)  
✅ 使用 `bg-[#0A0A0C]` 或径向渐变

❌ **内联样式** (`style="background-color: white"`)  
✅ 使用 Tailwind 类名

---

## 📝 组件代码模板

### 完整登录卡片模板

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E1E28] via-[#0A0A0F] to-[#050505]">
    <div class="w-[360px] px-10 py-16 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col items-center relative z-10">
      
      <!-- Logo -->
      <div class="mb-10 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]">
        <svg class="w-16 h-16"><!-- Logo SVG --></svg>
      </div>
      
      <!-- 标题 -->
      <h2 class="text-2xl font-bold text-white mb-3 tracking-[0.15em] drop-shadow-md">
        标题文字
      </h2>
      <p class="text-[#666666] text-xs mb-12 tracking-widest uppercase">
        副标题文字
      </p>
      
      <!-- 表单 -->
      <form class="w-full flex flex-col gap-6">
        <!-- 输入框 -->
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#555555] group-focus-within:text-[#00E5FF] group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300">
            <svg class="w-5 h-5"><!-- Icon --></svg>
          </div>
          <input
            type="text"
            placeholder="占位文字"
            class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pl-12 pr-5 py-4 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[15px] tracking-widest"
          />
        </div>
        
        <!-- 按钮 -->
        <button
          type="submit"
          class="w-full mt-8 py-4 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/80 text-[#00E5FF] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase"
        >
          确认操作
        </button>
      </form>
      
    </div>
    
    <!-- 装饰性光晕 -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
  </div>
</template>
```

---

## 🎯 使用指南

### 开发新页面时

1. **复制模板** - 从本文档复制对应的组件模板
2. **检查色彩** - 确保使用核心色彩令牌
3. **验证间距** - 确保符合最小间距要求
4. **测试交互** - 验证悬停、聚焦效果
5. **审查禁止项** - 对照禁止事项清单

### 代码审查清单

- [ ] 背景使用径向渐变或毛玻璃
- [ ] 输入框使用内阴影凹槽
- [ ] 按钮使用霓虹发光效果
- [ ] 间距符合最小要求（gap-6 以上）
- [ ] 无纯白/纯黑/刺眼绿色
- [ ] 所有交互有过渡动画
- [ ] 文字使用 tracking-widest
- [ ] 无内联样式

---

**文档版本**: v1.0  
**最后更新**: 2024-02-28  
**维护者**: Silent Crow Team

> 本文档是《鸦口无言》的视觉基因，任何违反本规范的代码都将被视为"视觉降级"并要求重构。
