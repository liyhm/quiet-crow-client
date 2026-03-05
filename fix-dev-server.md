# 快速修复开发服务器错误

## 问题
- GroupMembersModal.vue 加载失败 (500 错误)
- Vue Router 动态导入失败

## 原因
文件在保存时被截断或损坏，导致文件为空。

## 已修复
✅ 重新创建了 `GroupMembersModal.vue` 文件
✅ 修复了 computed 中的 props 重复定义错误

## 下一步操作

### 1. 重启开发服务器

**停止当前服务器**:
- 在运行 `npm run dev` 的终端按 `Ctrl + C`

**重新启动**:
```bash
npm run dev
```

### 2. 如果还有错误，清理缓存

```bash
# Windows PowerShell
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

### 3. 硬刷新浏览器

在 Electron 应用的 DevTools 中:
- 按 `Ctrl + Shift + R` (Windows)
- 或 `Cmd + Shift + R` (Mac)

## 验证修复成功

重启后，检查控制台应该看到：

```
✅ Token 已添加
✅ Crypto initialized
✅ 收到响应: Object
✅ Token 验证成功
✅ MainPage 初始化完成
```

## 测试群聊功能

### 测试 1: 创建群聊弹窗
1. 点击会话列表顶部的 + 按钮
2. 应该弹出"建立鸦群分舵"弹窗
3. 可以看到联系人列表
4. 可以选择联系人（赛博风复选框 [X]）

### 测试 2: 群成员列表弹窗
1. 进入一个群聊（如果有）
2. 点击顶部的"潜伏者"按钮
3. 应该弹出"潜伏者名单"弹窗
4. 显示群信息和成员列表

## 如果问题持续

尝试完全重新安装：

```bash
# 删除所有缓存和依赖
Remove-Item -Recurse -Force node_modules, out, .vite

# 重新安装
npm install

# 启动
npm run dev
```

---

**注意**: 文件已修复，只需重启开发服务器即可。
