# Windows 和 Mac 自动更新完整指南

## 📋 概述

本指南介绍如何配置 Windows 和 Mac 双平台的自动更新功能，使用同一个更新服务器：`http://159.75.182.85/updates/`

---

## 🎯 已完成的配置

### ✅ 1. electron-builder.yml
- Windows 输出：`.exe` 安装包 + `latest.yml`
- Mac 输出：`.dmg` 安装包 + `.zip` 更新包 + `latest-mac.yml`
- 更新服务器：`http://159.75.182.85/updates/`

### ✅ 2. src/main/index.ts
- 已配置 `autoUpdater.setFeedURL`
- 自动检测平台（Windows/Mac）并使用对应的更新文件

### ✅ 3. GitHub Actions
- 同时构建 Windows 和 Mac 版本
- 自动上传构建产物

---

## 📦 服务器文件结构

更新服务器需要以下文件结构：

```
http://159.75.182.85/updates/
├── latest.yml              # Windows 版本信息（必需）
├── latest-mac.yml          # Mac 版本信息（必需）
├── quiet-1.0.0-setup.exe   # Windows 安装包
├── quiet-1.0.0.dmg         # Mac 安装包（首次安装用）
├── quiet-1.0.0-mac.zip     # Mac 更新包（自动更新用，必需）
├── quiet-1.0.1-setup.exe   # Windows 新版本
├── quiet-1.0.1.dmg         # Mac 新版本
└── quiet-1.0.1-mac.zip     # Mac 新版本更新包
```

### 关键文件说明

#### Windows 更新文件
- `latest.yml` - 版本信息文件（必需）
- `quiet-{version}-setup.exe` - 安装包（用于首次安装和自动更新）

#### Mac 更新文件
- `latest-mac.yml` - 版本信息文件（必需）
- `quiet-{version}-mac.zip` - 更新包（必需，用于自动更新）
- `quiet-{version}.dmg` - 安装包（可选，用于首次安装）

---

## 🔧 配置详解

### 1. electron-builder.yml

```yaml
# Windows 配置
win:
  executableName: quiet
  icon: build/icon.ico

nsis:
  artifactName: ${name}-${version}-setup.${ext}
  shortcutName: ${productName}
  uninstallDisplayName: ${productName}
  createDesktopShortcut: always

# Mac 配置
mac:
  target:
    - dmg    # 安装包
    - zip    # 更新包（必需）
  entitlementsInherit: build/entitlements.mac.plist
  notarize: false

dmg:
  artifactName: ${name}-${version}.${ext}

# 更新服务器配置（Windows 和 Mac 共用）
publish:
  provider: generic
  url: http://159.75.182.85/updates/
```

### 2. src/main/index.ts

```typescript
function setupAutoUpdater(): void {
  // 设置更新服务器地址（自动检测平台）
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://159.75.182.85/updates/'
  })

  // electron-updater 会自动根据平台选择：
  // - Windows: 读取 latest.yml
  // - Mac: 读取 latest-mac.yml

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  
  // 事件监听...
}
```

---

## 🚀 使用 GitHub Actions 构建

### 触发构建

#### 方式 1：推送代码
```bash
git push github master
```

#### 方式 2：手动触发
1. 访问 https://github.com/liyhm/quiet-crow-client/actions
2. 点击 "Build Multi-Platform App"
3. 点击 "Run workflow"
4. 选择 "master" 分支
5. 点击 "Run workflow"

### 构建时间
- Windows 构建：约 5-8 分钟
- Mac 构建：约 5-8 分钟
- 总计：约 10-15 分钟（并行构建）

### 下载构建产物

构建完成后：

1. 访问 Actions 页面
2. 点击最新的 workflow 运行记录
3. 在 "Artifacts" 部分下载：
   - `quiet-windows` - Windows 安装包和更新文件
   - `quiet-macos` - Mac 安装包和更新文件

---

## 📤 上传到更新服务器

### 1. 解压下载的文件

```
quiet-windows/
├── quiet-1.0.0-setup.exe
└── latest.yml

quiet-macos/
├── quiet-1.0.0.dmg
├── quiet-1.0.0-mac.zip
└── latest-mac.yml
```

### 2. 上传到服务器

```bash
# 上传 Windows 文件
scp quiet-windows/quiet-1.0.0-setup.exe root@159.75.182.85:/var/www/updates/
scp quiet-windows/latest.yml root@159.75.182.85:/var/www/updates/

# 上传 Mac 文件
scp quiet-macos/quiet-1.0.0-mac.zip root@159.75.182.85:/var/www/updates/
scp quiet-macos/quiet-1.0.0.dmg root@159.75.182.85:/var/www/updates/
scp quiet-macos/latest-mac.yml root@159.75.182.85:/var/www/updates/
```

### 3. 验证文件可访问

```bash
# 验证 Windows 文件
curl -I http://159.75.182.85/updates/latest.yml
curl -I http://159.75.182.85/updates/quiet-1.0.0-setup.exe

# 验证 Mac 文件
curl -I http://159.75.182.85/updates/latest-mac.yml
curl -I http://159.75.182.85/updates/quiet-1.0.0-mac.zip
```

---

## 📄 版本信息文件示例

### latest.yml (Windows)

```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-setup.exe
    sha512: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    size: 123456789
path: quiet-1.0.0-setup.exe
sha512: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
releaseDate: '2026-03-05T10:00:00.000Z'
```

### latest-mac.yml (Mac)

```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-mac.zip
    sha512: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    size: 123456789
path: quiet-1.0.0-mac.zip
sha512: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
releaseDate: '2026-03-05T10:00:00.000Z'
```

---

## 🔄 更新流程

### Windows 更新流程

1. 应用启动 5 秒后自动检查更新
2. 读取 `http://159.75.182.85/updates/latest.yml`
3. 比较版本号
4. 如果有新版本 → 下载 `.exe` 文件
5. 下载完成 → 提示用户安装
6. 用户点击安装 → 退出应用并运行安装程序

### Mac 更新流程

1. 应用启动 5 秒后自动检查更新
2. 读取 `http://159.75.182.85/updates/latest-mac.yml`
3. 比较版本号
4. 如果有新版本 → 下载 `.zip` 文件
5. 下载完成 → 提示用户安装
6. 用户点击安装 → 退出应用并解压安装

---

## 🧪 测试更新功能

### 准备测试环境

#### 1. 安装旧版本（1.0.0）

```bash
# 修改 package.json
{
  "version": "1.0.0"
}

# 推送到 GitHub
git add package.json
git commit -m "chore: version 1.0.0"
git push github master

# 等待构建完成，下载并安装
```

#### 2. 上传旧版本到服务器

```bash
# 上传 Windows 和 Mac 的 1.0.0 版本文件
```

#### 3. 准备新版本（1.0.1）

```bash
# 修改 package.json
{
  "version": "1.0.1"
}

# 推送到 GitHub
git add package.json
git commit -m "chore: version 1.0.1"
git push github master

# 等待构建完成
```

#### 4. 上传新版本到服务器

```bash
# 上传 Windows 和 Mac 的 1.0.1 版本文件
# 注意：latest.yml 和 latest-mac.yml 会被覆盖
```

### 测试步骤

#### Windows 测试

1. 打开已安装的 1.0.0 版本应用
2. 等待 5 秒，应该弹出更新提示
3. 点击"下载更新"
4. 下载完成后点击"立即安装"
5. 应用关闭并运行安装程序
6. 安装完成后打开应用，验证版本号为 1.0.1

#### Mac 测试

1. 打开已安装的 1.0.0 版本应用
2. 等待 5 秒，应该弹出更新提示
3. 点击"下载更新"
4. 下载完成后点击"立即安装"
5. 应用重启，验证版本号为 1.0.1

---

## ⚠️ 常见问题

### 问题 1：Windows 更新失败

**可能原因：**
- `latest.yml` 文件不存在或格式错误
- `.exe` 文件下载失败
- 防火墙或杀毒软件阻止

**解决方案：**
```bash
# 验证文件存在
curl http://159.75.182.85/updates/latest.yml
curl -I http://159.75.182.85/updates/quiet-1.0.1-setup.exe

# 检查文件权限
ls -la /var/www/updates/
```

### 问题 2：Mac 更新失败

**可能原因：**
- `latest-mac.yml` 文件不存在
- 缺少 `.zip` 文件（只有 `.dmg` 不行）
- Mac 安全设置阻止

**解决方案：**
```bash
# 验证 ZIP 文件存在
curl -I http://159.75.182.85/updates/quiet-1.0.1-mac.zip

# 确保 electron-builder.yml 中配置了 zip
mac:
  target:
    - dmg
    - zip  # 必需
```

### 问题 3：版本号不更新

**可能原因：**
- `latest.yml` 或 `latest-mac.yml` 没有更新
- 版本号格式错误

**解决方案：**
```bash
# 检查版本信息文件内容
curl http://159.75.182.85/updates/latest.yml
curl http://159.75.182.85/updates/latest-mac.yml

# 确保版本号格式正确（semver）
{
  "version": "1.0.1"  ✅
  "version": "v1.0.1" ❌
}
```

### 问题 4：CORS 跨域错误

**解决方案：**

在 Nginx 配置中添加 CORS 头：

```nginx
location /updates/ {
    # 允许所有来源
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, OPTIONS';
    add_header Access-Control-Allow-Headers 'Range';
    
    # 处理 OPTIONS 请求
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

### 问题 5：下载速度慢

**解决方案：**

1. 使用 CDN 加速
2. 启用 Nginx gzip 压缩
3. 使用断点续传

```nginx
location /updates/ {
    # 启用 gzip
    gzip on;
    gzip_types application/octet-stream;
    
    # 支持断点续传
    add_header Accept-Ranges bytes;
}
```

---

## 🔐 安全建议

### 1. 使用 HTTPS（强烈推荐）

```yaml
publish:
  provider: generic
  url: https://159.75.182.85/updates/  # 使用 HTTPS
```

配置 SSL 证书：
```bash
# 使用 Let's Encrypt 免费证书
certbot --nginx -d your-domain.com
```

### 2. 代码签名

#### Windows 代码签名

```yaml
win:
  certificateFile: path/to/certificate.pfx
  certificatePassword: ${env.CERTIFICATE_PASSWORD}
```

#### Mac 代码签名

```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  notarize: true
```

需要在 GitHub Secrets 中添加：
- `APPLE_ID`
- `APPLE_ID_PASSWORD`
- `APPLE_TEAM_ID`

### 3. 文件完整性验证

electron-updater 会自动验证 SHA512，确保文件未被篡改。

---

## 📊 发布新版本的完整流程

### 1. 更新版本号

```bash
# 修改 package.json
{
  "version": "1.0.1"
}
```

### 2. 提交并推送

```bash
git add package.json
git commit -m "chore: bump version to 1.0.1"

# 推送到 Gitee（主仓库）
git push origin master

# 推送到 GitHub（触发构建）
git push github master
```

### 3. 等待构建完成

访问 https://github.com/liyhm/quiet-crow-client/actions

等待约 10-15 分钟，直到两个构建任务都完成。

### 4. 下载构建产物

从 Actions 页面下载：
- `quiet-windows` - 包含 Windows 文件
- `quiet-macos` - 包含 Mac 文件

### 5. 上传到服务器

```bash
# 解压下载的 zip 文件
unzip quiet-windows.zip -d quiet-windows
unzip quiet-macos.zip -d quiet-macos

# 上传 Windows 文件
scp quiet-windows/* root@159.75.182.85:/var/www/updates/

# 上传 Mac 文件
scp quiet-macos/* root@159.75.182.85:/var/www/updates/
```

### 6. 验证更新

```bash
# 验证文件可访问
curl http://159.75.182.85/updates/latest.yml
curl http://159.75.182.85/updates/latest-mac.yml

# 检查版本号
curl http://159.75.182.85/updates/latest.yml | grep version
curl http://159.75.182.85/updates/latest-mac.yml | grep version
```

### 7. 通知用户

用户打开应用后会自动检查更新，或者你可以：
- 发送更新通知
- 在官网发布更新公告
- 在社交媒体宣布新版本

---

## 📈 监控和日志

### 查看更新日志

应用会在控制台输出更新日志：

```
🔍 正在检查更新...
✅ 发现新版本: 1.0.1
📥 下载进度: 50.00%
✅ 更新下载完成: 1.0.1
🚀 安装更新并重启...
```

### 服务器访问日志

查看 Nginx 访问日志：

```bash
tail -f /var/log/nginx/access.log | grep updates
```

可以看到：
- 哪些用户在检查更新
- 下载了哪些文件
- 下载速度和成功率

---

## 🎯 最佳实践

### 1. 版本号管理

使用语义化版本（Semver）：
- `1.0.0` → `1.0.1` - 补丁版本（bug 修复）
- `1.0.0` → `1.1.0` - 次版本（新功能）
- `1.0.0` → `2.0.0` - 主版本（破坏性更新）

### 2. 发布频率

- 紧急 bug 修复：立即发布
- 小功能更新：每周或每两周
- 大版本更新：每月或每季度

### 3. 测试流程

发布前必须测试：
- ✅ Windows 7/10/11 更新测试
- ✅ macOS 10.15+ 更新测试
- ✅ 从旧版本更新到新版本
- ✅ 全新安装测试

### 4. 回滚策略

如果新版本有严重 bug：

```bash
# 1. 恢复旧版本的 latest.yml
cp latest.yml.backup latest.yml

# 2. 或者修改 latest.yml 指向旧版本
version: 1.0.0
path: quiet-1.0.0-setup.exe
```

### 5. 备份策略

```bash
# 每次发布前备份
cp /var/www/updates/latest.yml /var/www/updates/latest.yml.backup
cp /var/www/updates/latest-mac.yml /var/www/updates/latest-mac.yml.backup
```

---

## 📚 相关文档

- [electron-updater 官方文档](https://www.electron.build/auto-update)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 配置](https://www.electron.build/configuration/configuration)
- [语义化版本规范](https://semver.org/lang/zh-CN/)

---

## 📞 故障排查清单

遇到问题时，按顺序检查：

- [ ] 服务器文件是否存在（`latest.yml`, `latest-mac.yml`）
- [ ] 文件是否可访问（curl 测试）
- [ ] 版本号格式是否正确（semver）
- [ ] Windows 是否有 `.exe` 文件
- [ ] Mac 是否有 `.zip` 文件（不是只有 `.dmg`）
- [ ] 文件 SHA512 是否匹配
- [ ] 网络连接是否正常
- [ ] 防火墙/杀毒软件是否阻止
- [ ] 应用是否有网络权限
- [ ] 控制台是否有错误日志

---

**创建时间：** 2026-03-05  
**更新服务器：** http://159.75.182.85/updates/  
**支持平台：** Windows 7+ / macOS 10.15+
