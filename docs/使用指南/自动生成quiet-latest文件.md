# 自动生成 quiet-latest 文件

## ✅ 已修复

现在打包时会自动生成并重命名为 `quiet-latest.yml` 和 `quiet-latest-mac.yml`。

---

## 🔧 修改内容

### 1. 添加了重命名脚本

**scripts/rename-update-files.js**
- 自动查找 `latest.yml` 或 `quiet.yml`
- 复制为 `quiet-latest.yml`
- 自动查找 `latest-mac.yml` 或 `quiet-mac.yml`
- 复制为 `quiet-latest-mac.yml`

### 2. 修改了打包命令

**package.json**
```json
{
  "scripts": {
    "build:win": "npm run build && electron-builder --win && node scripts/rename-update-files.js",
    "build:mac": "npm run build && electron-builder --mac && node scripts/rename-update-files.js"
  }
}
```

打包后自动运行重命名脚本。

### 3. 修改了 GitHub Actions

**.github/workflows/build-mac.yml**
- 添加了重命名步骤
- 自动生成 `quiet-latest-mac.yml`

### 4. 修改了配置

**electron-builder.yml**
```yaml
publish:
  - provider: generic
    url: http://159.75.182.85/updates/
    channel: latest
```

**src/main/index.ts**
```typescript
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'http://159.75.182.85/updates/',
  channel: 'latest'
})
```

---

## 📦 打包后的文件

### Windows 打包
```bash
npm run build:win
```

生成文件：
```
dist/
├── quiet-1.0.0-setup.exe
├── latest.yml              ← electron-builder 生成
└── quiet-latest.yml        ← 脚本自动生成 ✅
```

### Mac 打包（GitHub Actions）
```bash
git push github master
```

生成文件：
```
dist/
├── quiet-1.0.0.dmg
├── quiet-1.0.0-mac.zip
├── latest-mac.yml          ← electron-builder 生成
└── quiet-latest-mac.yml    ← Actions 自动生成 ✅
```

---

## 🚀 使用流程

### 1. Windows 打包
```bash
# 打包（自动生成 quiet-latest.yml）
npm run build:win

# 上传
scp dist/quiet-latest.yml root@159.75.182.85:/var/www/updates/
scp dist/quiet-1.0.0-setup.exe root@159.75.182.85:/var/www/updates/
```

### 2. Mac 打包
```bash
# 推送到 GitHub
git push github master

# 等待构建完成，下载 Artifacts

# 解压后会有 quiet-latest-mac.yml
scp quiet-latest-mac.yml root@159.75.182.85:/var/www/updates/
scp quiet-1.0.0-mac.zip root@159.75.182.85:/var/www/updates/
```

---

## 📁 服务器文件结构

```
/var/www/updates/
├── quiet-latest.yml            ← Windows 版本信息
├── quiet-latest-mac.yml        ← Mac 版本信息
├── quiet-1.0.0-setup.exe
└── quiet-1.0.0-mac.zip
```

---

## 🔍 electron-updater 查找规则

### 配置了 `channel: 'latest'` 后

**Windows 查找：**
```
http://159.75.182.85/updates/quiet-latest.yml
```

**Mac 查找：**
```
http://159.75.182.85/updates/quiet-latest-mac.yml
```

**文件名格式：**
```
{productName}-{channel}.yml        # Windows
{productName}-{channel}-mac.yml    # Mac
```

你的配置：
- `productName: quiet`
- `channel: latest`

所以文件名是：
- `quiet-latest.yml`（Windows）
- `quiet-latest-mac.yml`（Mac）

---

## ✅ 验证

### 1. 本地打包测试

```bash
# Windows
npm run build:win
ls dist/quiet-latest.yml

# 应该看到文件
```

### 2. 查看脚本输出

打包时会看到：
```
🔄 开始重命名更新文件...

📦 处理 Windows 文件:
✅ 已复制: latest.yml -> quiet-latest.yml

📦 处理 Mac 文件:
⚠️  未找到 Mac 更新文件

✨ 完成！
```

### 3. GitHub Actions 日志

在 Actions 日志中会看到：
```
✅ 已创建 quiet-latest-mac.yml
=== 最终文件列表 ===
-rw-r--r--  1 runner  staff  458 Mar  5 14:33 quiet-latest-mac.yml
```

---

## 🎯 总结

**现在完全自动化：**
- ✅ Windows 打包自动生成 `quiet-latest.yml`
- ✅ Mac 打包自动生成 `quiet-latest-mac.yml`
- ✅ 不需要手动重命名
- ✅ 文件名固定，不会出错

**你只需要：**
1. 运行 `npm run build:win` 或推送到 GitHub
2. 上传生成的文件到服务器
3. 完成！

---

**创建时间：** 2026-03-05
**状态：** 已完全自动化
