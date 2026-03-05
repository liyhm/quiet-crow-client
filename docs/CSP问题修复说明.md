# CSP 问题修复说明

## ✅ 已修复的问题

### 问题描述

```
Connecting to 'http://localhost:8080/api/session/my' violates the following
Content Security Policy directive: "default-src 'self'".
Note that 'connect-src' was not explicitly set, so 'default-src' is used as a fallback.
```

### 根本原因

Electron 应用的 Content Security Policy (CSP) 默认只允许连接到 `'self'`（同源），阻止了对 `http://localhost:8080` 的请求。

## 🔧 修复内容

### 1. 修改 HTML CSP Meta 标签

**文件**: `src/renderer/index.html`

**修改前**:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
/>
```

**修改后**:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
           script-src 'self' 'unsafe-eval'; 
           style-src 'self' 'unsafe-inline'; 
           img-src 'self' data: blob:; 
           connect-src 'self' http://localhost:8080 ws://localhost:8080 https://api.your-domain.com wss://api.your-domain.com; 
           media-src 'self' blob:;"
/>
```

**关键变化**:

- ✅ 添加 `connect-src` 指令
- ✅ 允许连接到 `http://localhost:8080`（开发环境）
- ✅ 允许连接到 `ws://localhost:8080`（WebSocket）
- ✅ 允许连接到生产环境域名
- ✅ 添加 `'unsafe-eval'` 支持 Vue 开发模式
- ✅ 添加 `blob:` 支持文件上传

### 2. 添加主进程 CSP 配置

**文件**: `src/main/index.ts`

**新增代码**:

```typescript
// 设置 CSP 允许连接到后端 API
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        is.dev
          ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:8080 ws://localhost:8080; img-src 'self' data: blob:; media-src 'self' blob:;"
          : "default-src 'self'; connect-src 'self' https://api.your-domain.com wss://api.your-domain.com; img-src 'self' data: blob:; media-src 'self' blob:;"
      ]
    }
  })
})
```

**作用**:

- 根据环境（开发/生产）动态设置 CSP
- 开发环境允许 localhost
- 生产环境只允许配置的域名

## 📋 CSP 指令说明

### `default-src 'self'`

默认策略，只允许同源资源

### `script-src 'self' 'unsafe-eval'`

- `'self'`: 允许同源脚本
- `'unsafe-eval'`: 允许 eval()，Vue 开发模式需要

### `style-src 'self' 'unsafe-inline'`

- `'self'`: 允许同源样式
- `'unsafe-inline'`: 允许内联样式

### `img-src 'self' data: blob:`

- `'self'`: 允许同源图片
- `data:`: 允许 data URL
- `blob:`: 允许 blob URL

### `connect-src` ⭐ 关键

- `'self'`: 允许同源连接
- `http://localhost:8080`: 允许开发环境后端
- `ws://localhost:8080`: 允许开发环境 WebSocket
- `https://api.your-domain.com`: 允许生产环境后端
- `wss://api.your-domain.com`: 允许生产环境 WebSocket

### `media-src 'self' blob:`

- `'self'`: 允许同源媒体
- `blob:`: 允许 blob URL（文件上传）

## 🚀 重启应用

修改完成后，需要重启前端应用：

```bash
# 停止当前应用（Ctrl+C）
npm run dev
```

## ✅ 验证修复

### 1. 检查控制台

打开开发者工具（F12），应该不再有 CSP 错误。

### 2. 检查网络请求

Network 标签中，API 请求应该正常返回 200。

### 3. 测试功能

- ✅ 登录功能
- ✅ 加载会话列表
- ✅ 发送消息
- ✅ WebSocket 连接

## 🔒 安全说明

### 开发环境

```
connect-src 'self' http://localhost:8080 ws://localhost:8080
```

- 允许连接到本地后端
- 允许 WebSocket 连接

### 生产环境

```
connect-src 'self' https://api.your-domain.com wss://api.your-domain.com
```

- 只允许 HTTPS 连接
- 只允许 WSS（加密 WebSocket）
- 需要替换为实际域名

## ⚠️ 部署注意事项

### 修改生产环境域名

部署前，需要修改两个地方：

#### 1. HTML 文件

编辑 `src/renderer/index.html`：

```html
connect-src 'self' ... https://your-actual-domain.com wss://your-actual-domain.com
```

#### 2. 主进程文件

编辑 `src/main/index.ts`：

```typescript
: "default-src 'self'; connect-src 'self' https://your-actual-domain.com wss://your-actual-domain.com; ..."
```

### 或者使用环境变量

更好的方式是从环境变量读取：

```typescript
const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080'
const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:8080'

const csp = `default-src 'self'; connect-src 'self' ${apiUrl} ${wsUrl}; ...`
```

## 🐛 常见问题

### Q1: 修改后还是有 CSP 错误？

**解决**:

1. 确保完全重启了应用（不是热重载）
2. 清除浏览器缓存
3. 检查 CSP 配置是否正确

### Q2: 生产环境如何配置？

**解决**:

1. 修改 `.env.production`
2. 修改 HTML 和主进程的 CSP 配置
3. 确保使用 HTTPS/WSS

### Q3: WebSocket 连接失败？

**解决**:

1. 检查 CSP 是否包含 `ws://` 或 `wss://`
2. 检查后端 WebSocket 配置
3. 检查防火墙设置

## 📚 相关资源

- [MDN - Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## ✅ 检查清单

部署前检查：

- [ ] HTML CSP 配置正确
- [ ] 主进程 CSP 配置正确
- [ ] 生产环境域名已替换
- [ ] 使用 HTTPS/WSS
- [ ] 测试所有功能正常
- [ ] 无 CSP 错误
- [ ] 无网络错误

---

**修复完成！** 现在应用应该能正常连接后端了。🎉
