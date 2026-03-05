# 纯中文终端风格 UI 改造

## 改造目标

彻底移除界面中的英文元素（SYS.ONLINE、ERROR、SCAN_NETWORK 等），使用方括号语法 `[ ]` 营造纯中文终端感，提升中文环境下的沉浸体验。

## 改造原则

### 1. 方括号语法替代英文
- ❌ `SYS.ONLINE` → ✅ `[ 链路正常 ]`
- ❌ `ERROR: ZERO_CONTACTS` → ✅ `>> 异常：零节点响应`
- ❌ `SCAN_NETWORK` → ✅ `[ 发送广播信号 ]`

### 2. 终端指令风格
- 使用 `>>` 作为错误前缀
- 使用 `[ ]` 包裹状态标识
- 保持等宽字体（font-mono）
- 增加字间距（tracking-widest）

### 3. 去微信化
- 废弃聊天气泡图标
- 改用信号雷达 SVG
- 文案从口语化改为终端指令风格

## 改造内容

### 1. 顶部标题栏跑马灯

**改造前：**
```vue
<!-- 在线状态 -->
SYS.ONLINE 🦅 正在监听鸦群...

<!-- 离线状态 -->
⚠️ 掉网啦！连个破网都搞不定，还想混黑客圈？ ⚠️
```

**改造后：**
```vue
<!-- 在线状态 -->
<div class="flex items-center animate-marquee whitespace-nowrap 
            text-[#00E5FF] text-[12px] font-mono tracking-widest opacity-80">
  <span class="mx-4 flex items-center">
    <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] 
                 animate-pulse mr-2 shadow-[0_0_8px_#00E5FF]"></span>
    [ 链路正常 ] 🦅 正在监听鸦群广播...
  </span>
  <span class="mx-4 flex items-center">
    <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] 
                 animate-pulse mr-2 shadow-[0_0_8px_#00E5FF]"></span>
    [ 链路正常 ] 🦅 正在监听鸦群广播...
  </span>
</div>

<!-- 离线状态 -->
<div class="flex items-center animate-marquee whitespace-nowrap 
            text-[#FF3366] text-[12px] font-mono tracking-widest font-bold">
  <span class="mx-4 flex items-center">
    <span class="w-2 h-2 rounded-sm bg-[#FF3366] 
                 animate-ping mr-2 shadow-[0_0_8px_#FF3366]"></span>
    [ 致命警告 ] 物理链路已断开，无法呼叫鸦群！
  </span>
  <span class="mx-4 flex items-center">
    <span class="w-2 h-2 rounded-sm bg-[#FF3366] 
                 animate-ping mr-2 shadow-[0_0_8px_#FF3366]"></span>
    [ 致命警告 ] 物理链路已断开，无法呼叫鸦群！
  </span>
</div>
```

**改造亮点：**
- 字号从 11px 增加到 12px，更清晰
- `SYS.ONLINE` → `[ 链路正常 ]`
- 离线文案从口语化改为严肃的终端警告
- 保持霓虹发光效果

### 2. 联系人空状态

**改造前：**
```vue
<!-- 终端报错标签 -->
<span class="...">
  >> ERROR: ZERO_CONTACTS
</span>

<!-- 嘲讽文案 -->
<span class="...">
  一个鸦友都没有，真是可悲。
</span>

<!-- 按钮 -->
<button>
  <span>开启主动嗅探</span>
  <span>SCAN_NETWORK</span>
</button>
```

**改造后：**
```vue
<!-- 终端报错标签 + 文案 -->
<div class="flex flex-col items-center gap-2 mb-8 mt-4">
  <span class="text-[#FF3366] text-[11px] font-mono tracking-widest 
               font-bold bg-[#FF3366]/10 px-2 py-0.5 rounded 
               border border-[#FF3366]/20">
    >> 异常：零节点响应
  </span>
  <span class="text-[#85858A] text-[13px] tracking-widest mt-2">
    周围连个活着的鸦友都没有。
  </span>
</div>

<!-- 双层按钮 -->
<button class="relative px-8 py-3 rounded-lg bg-[#00E5FF]/10 
               border border-[#00E5FF]/80 overflow-hidden group 
               hover:bg-[#00E5FF]/20 
               hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] 
               hover:-translate-y-0.5 transition-all duration-300">
  <!-- 流光动画层 -->
  <div class="absolute inset-0 w-full h-full 
              bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent 
              -translate-x-full group-hover:animate-shimmer"></div>

  <!-- 按钮文字 -->
  <div class="relative flex flex-col items-center gap-0.5">
    <span class="text-[13px] font-bold tracking-[0.2em] 
                 group-hover:scale-105 transition-transform z-10 
                 text-[#00E5FF]">
      开启主动嗅探
    </span>
    <span class="text-[9px] font-mono opacity-60 tracking-[0.3em] 
                 z-10 text-[#00E5FF]/70">
      [ 发送广播信号 ]
    </span>
  </div>
</button>
```

**改造亮点：**
- `ERROR: ZERO_CONTACTS` → `>> 异常：零节点响应`
- 文案从"一个鸦友都没有，真是可悲" → "周围连个活着的鸦友都没有"
- `SCAN_NETWORK` → `[ 发送广播信号 ]`
- 使用方括号包裹，更有终端感

### 3. 右侧主聊天区空状态

**改造前：**
```vue
<div class="flex-1 flex flex-col items-center justify-center text-text-muted">
  <!-- 聊天气泡图标 -->
  <svg class="w-24 h-24 mb-4 opacity-20" fill="currentColor" viewBox="0 0 16 16">
    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
  </svg>
  <p class="text-lg">连个说话的人都没有，真是悲哀。</p>
</div>
```

**改造后：**
```vue
<div class="w-full h-full flex flex-col items-center justify-center 
            select-none bg-[#050505]">
  <!-- 信号雷达 SVG 图标 -->
  <svg class="w-24 h-24 mb-6 opacity-20 text-[#555555]" 
       fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
          d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4">
    </path>
  </svg>

  <!-- 终端风格文案 -->
  <span class="text-[#555555] text-[14px] tracking-[0.2em] font-mono">
    [ 信号静默 ] 当前未建立任何通讯链路...
  </span>
</div>
```

**改造亮点：**
- 废弃聊天气泡图标（太像微信）
- 改用信号雷达 SVG（科技感）
- 文案从口语化 → 终端指令风格
- `[ 信号静默 ]` 方括号语法
- 等宽字体 + 增加字间距

## 设计语言对比

### 改造前（英文混杂）
| 位置 | 原文案 | 问题 |
|------|--------|------|
| 标题栏在线 | `SYS.ONLINE 🦅 正在监听鸦群...` | 英文缩写破坏沉浸感 |
| 标题栏离线 | `⚠️ 掉网啦！连个破网都搞不定，还想混黑客圈？ ⚠️` | 过于口语化 |
| 联系人空状态 | `>> ERROR: ZERO_CONTACTS` | 英文错误码 |
| 联系人按钮 | `SCAN_NETWORK` | 英文代码标识 |
| 聊天区空状态 | 聊天气泡图标 + "连个说话的人都没有，真是悲哀。" | 图标太像微信 |

### 改造后（纯中文终端风）
| 位置 | 新文案 | 优势 |
|------|--------|------|
| 标题栏在线 | `[ 链路正常 ] 🦅 正在监听鸦群广播...` | 方括号语法，终端感 |
| 标题栏离线 | `[ 致命警告 ] 物理链路已断开，无法呼叫鸦群！` | 严肃的系统警告 |
| 联系人空状态 | `>> 异常：零节点响应` | 中文错误描述 |
| 联系人按钮 | `[ 发送广播信号 ]` | 方括号包裹，指令感 |
| 聊天区空状态 | 信号雷达图标 + `[ 信号静默 ] 当前未建立任何通讯链路...` | 科技感 + 终端风 |

## 方括号语法规范

### 使用场景
1. **状态标识**：`[ 链路正常 ]`、`[ 信号静默 ]`
2. **操作指令**：`[ 发送广播信号 ]`、`[ 扫描网络 ]`
3. **系统提示**：`[ 致命警告 ]`、`[ 连接中断 ]`

### 样式规范
```css
/* 方括号文本样式 */
font-family: monospace;        /* 等宽字体 */
letter-spacing: 0.2em;         /* 增加字间距 */
font-weight: bold;             /* 加粗（可选） */
```

### 配色规范
- 正常状态：`text-[#00E5FF]`（霓虹青色）
- 警告状态：`text-[#FF3366]`（警告红）
- 静默状态：`text-[#555555]`（暗灰色）

## 修改的文件

1. **src/renderer/src/widgets/titleBar/TitleBar.vue**
   - 标题栏跑马灯文案纯中文化
   - 字号从 11px → 12px

2. **src/renderer/src/pages/contacts/ContactsPage.vue**
   - 联系人空状态文案纯中文化
   - 按钮副标题改为方括号语法

3. **src/renderer/src/widgets/emptyState/EmptyState.vue**
   - 聊天气泡图标 → 信号雷达图标
   - 口语化文案 → 终端指令风格

## 视觉效果总结

这次纯中文化改造的核心是：

1. **废弃英文，启用方括号语法 `[ ]`**
   - 给汉字加上"代码化"的标点符号
   - 营造严谨、冰冷的机甲终端感

2. **重塑按钮文案**
   - 去掉英文 `SCAN_NETWORK`
   - 改为等宽字体的 `[ 发送广播信号 ]`
   - 既有极客味，又是中国人能秒懂的语境

3. **去微信化**
   - 废弃聊天气泡图标
   - 改用信号雷达纹理 SVG
   - 文案从口语化 → 系统指令风格

4. **终端指令风格**
   - 使用 `>>` 前缀表示错误
   - 使用 `[ ]` 包裹状态和指令
   - 等宽字体 + 增加字间距
   - 保持霓虹发光效果

完美契合《鸦口无言》加密软件的赛博朋克暗黑风格！🎯
