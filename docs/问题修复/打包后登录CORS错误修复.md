# 打包后登录 CORS 错误修复

## 问题时间
2026-03-01

## 问题描述

打包后的应用登录时报错：

```
Status: (blocked:csp)
Request URL: http://159.75.182.85:8081/api/auth/login
Referrer Policy: strict-origin-when-cross-origin
```

**错误原因**: CSP (Content Security Policy) 策略阻止了对后端 API 的请求。

## 错误截图分析

从 Network 标签可以看到：
- 请求状态：`(blocked:csp)`
- 请求 URL：`http://159.75.182.85:8081/api/auth/login`
- 传输大小：`0 B`
- 时间：`0 ms`

这表明请求在发送前就被 CSP 策略拦截了。

## 问题原因

生产环境的 CSP 配置使用的是默认的占位符地址：

```typescript
// 错误的配置
"default-src 'self'; connect-src 'self' https://api.your-domain.com wss://api.your-domain.com; ..."
```

而实际的后端地址是：
```
http://159.75.182.85:8081
```

## 解决方案

修改 `src/main/index.ts` 中的 CSP 配置，将生产环境的后端地址改为实际地址。

### 修改前

```typescript
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

### 修改后

```typescript
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        is.dev
          ? "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:8080 ws://localhost:8080; img-src 'self' data: blob:; media-src 'self' blob:;"
          : "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://159.75.182.85:8081 ws://159.75.182.85:8081; img-src 'self' data: blob: http://159.75.182.85:8081; media-src 'self' blob:;"
      ]
    }
  })
})
```

### 关键修改点

1. **添加 'unsafe-inline' 和 'unsafe-eval'**
   - 允许内联脚本和样式
   - 允许 eval() 等动态代码执行
   - Vue 应用需要这些权限

2. **修改 connect-src**
   - 从 `https://api.your-domain.com` 改为 `http://159.75.182.85:8081`
   - 从 `wss://api.your-domain.com` 改为 `ws://159.75.182.85:8081`
   - 允许连接到实际的后端地址

3. **修改 img-src**
   - 添加 `http://159.75.182.85:8081`
   - 允许加载后端的图片（如头像）

## CSP 策略说明

### default-src
- `'self'`: 允许加载同源资源
- `'unsafe-inline'`: 允许内联脚本和样式
- `'unsafe-eval'`: 允许 eval() 等动态代码执行

### connect-src
- `'self'`: 允许连接到同源
- `http://159.75.182.85:8081`: 允许连接到后端 API
- `ws://159.75.182.85:8081`: 允许 WebSocket 连接

### img-src
- `'self'`: 允许加载同源图片
- `data:`: 允许 data URL
- `blob:`: 允许 blob URL
- `http://159.75.182.85:8081`: 允许加载后端图片

### media-src
- `'self'`: 允许加载同源媒体
- `blob:`: 允许 blob URL

## 重新打包

修改后需要重新打包：

```powershell
# 清理旧的构建
Remove-Item -Recurse -Force dist, out

# 重新打包
npm run build:win
```

## 验证修复

### 1. 安装新的安装包

安装 `dist/quiet-1.0.0-setup.exe`

### 2. 打开开发者工具

按 3 次 Ctrl 键打开开发者工具

### 3. 尝试登录

输入用户名和密码，点击登录

### 4. 查看 Network 标签

应该看到：
- 请求状态：`200 OK`（而不是 `blocked:csp`）
- 请求 URL：`http://159.75.182.85:8081/api/auth/login`
- 响应数据：包含 token 等信息

### 5. 查看 Console 标签

应该看到：
```
✅ 登录成功
✅ Token 已保存
🔌 WebSocket 连接成功
```

## 常见 CSP 错误

### 错误 1: blocked:csp

**原因**: CSP 策略阻止了请求

**解决**: 在 CSP 配置中添加允许的域名

### 错误 2: Refused to connect

**原因**: connect-src 没有包含目标域名

**解决**: 在 connect-src 中添加域名

### 错误 3: Refused to load image

**原因**: img-src 没有包含图片来源

**解决**: 在 img-src 中添加域名

### 错误 4: Refused to execute inline script

**原因**: 缺少 'unsafe-inline'

**解决**: 在 default-src 中添加 'unsafe-inline'

## 开发环境 vs 生产环境

### 开发环境
```typescript
"default-src 'self' 'unsafe-inline' 'unsafe-eval'; 
 connect-src 'self' http://localhost:8080 ws://localhost:8080; 
 img-src 'self' data: blob:; 
 media-src 'self' blob:;"
```

### 生产环境
```typescript
"default-src 'self' 'unsafe-inline' 'unsafe-eval'; 
 connect-src 'self' http://159.75.182.85:8081 ws://159.75.182.85:8081; 
 img-src 'self' data: blob: http://159.75.182.85:8081; 
 media-src 'self' blob:;"
```

## 安全性考虑

### 为什么使用 'unsafe-inline' 和 'unsafe-eval'？

1. **Vue 应用需求**
   - Vue 的响应式系统需要动态代码执行
   - 内联样式和脚本是常见的

2. **开发便利性**
   - 简化开发流程
   - 避免复杂的 nonce 配置

3. **Electron 应用特性**
   - 本地应用，不是 Web 应用
   - 安全风险相对较低

### 如何提高安全性？

1. **使用 HTTPS**
   ```typescript
   connect-src 'self' https://api.your-domain.com wss://api.your-domain.com
   ```

2. **使用域名代替 IP**
   ```typescript
   connect-src 'self' https://api.quiet-crow.com wss://api.quiet-crow.com
   ```

3. **移除 'unsafe-eval'**（如果不需要）
   ```typescript
   default-src 'self' 'unsafe-inline'
   ```

## 调试 CSP 问题

### 1. 查看 Console 错误

打开开发者工具，查看 Console 标签，会显示详细的 CSP 错误信息：

```
Refused to connect to 'http://159.75.182.85:8081/api/auth/login' 
because it violates the following Content Security Policy directive: 
"connect-src 'self' https://api.your-domain.com"
```

### 2. 查看 Network 状态

在 Network 标签中，被 CSP 阻止的请求会显示：
- Status: `(blocked:csp)`
- Size: `0 B`
- Time: `0 ms`

### 3. 临时禁用 CSP（仅用于调试）

在主进程中注释掉 CSP 配置：

```typescript
// mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
//   callback({
//     responseHeaders: {
//       ...details.responseHeaders,
//       'Content-Security-Policy': [...]
//     }
//   })
// })
```

## 总结

CSP 错误的根本原因是生产环境配置使用了占位符地址，而不是实际的后端地址。

修复步骤：
1. ✅ 修改 `src/main/index.ts` 中的 CSP 配置
2. ✅ 将后端地址改为 `http://159.75.182.85:8081`
3. ✅ 添加 WebSocket 地址 `ws://159.75.182.85:8081`
4. ✅ 添加图片加载权限
5. ✅ 重新打包应用

修复后，登录功能应该可以正常工作了！
