# Mac 自动更新配置指南

## 📋 当前状态

你的项目已经集成了 `electron-updater`，并且有完整的更新逻辑。现在需要配置更新服务器地址：`http://159.75.182.85/updates/`

---

## ⚠️ Mac 更新的重要注意事项

### 1. Mac 更新文件格式要求

Mac 应用的自动更新需要以下文件：

```
http://159.75.182.85/updates/
├── latest-mac.yml          # 必需：版本信息文件
├── quiet-1.0.0-mac.zip     # 必需：ZIP 格式（用于自动更新）
├── quiet-1.0.0.dmg         # 可选：DMG 安装包（用于首次安装）
└── quiet-1.0.0.dmg.blockmap # 可选：增量更新支持
```

**关键点：**
- ✅ `latest-mac.yml` 是必需的，包含版本号、文件名、SHA512 等信息
- ✅ Mac 更新必须使用 `.zip` 格式，不能只有 `.dmg`
- ✅ `.dmg` 主要用于首次安装，`.zip` 用于自动更新
- ✅ 文件名格式：`${name}-${version}-mac.zip`

---

## 🔧 配置步骤

### 第 1 步：修改 electron-builder.yml

```yaml
publish:
  provider: generic
  url: http://159.75.182.85/updates/
```

### 第 2 步：修改 src/main/index.ts

取消注释并配置更新服务器：

```typescript
function setupAutoUpdater(): void {
  // 设置更新服务器地址
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://159.75.182.85/updates/'
  })

  // 禁用自动下载，改为手动控制
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // ... 其他配置保持不变
}
```

### 第 3 步：配置 Mac 打包输出 ZIP 格式

在 `electron-builder.yml` 中添加：

```yaml
mac:
  target:
    - dmg
    - zip  # 添加 zip 格式输出
  entitlementsInherit: build/entitlements.mac.plist
  extendInfo:
    - NSCameraUsageDescription: Application requests access to the device's camera.
    - NSMicrophoneUsageDescription: Application requests access to the device's microphone.
    - NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.
    - NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.
  notarize: false
```

---

## 📦 打包和上传流程

### 1. 本地打包（如果有 Mac）

```bash
npm run build:mac
```

生成的文件在 `dist/` 目录：
- `quiet-1.0.0.dmg` - 安装包
- `quiet-1.0.0-mac.zip` - 更新包
- `latest-mac.yml` - 版本信息

### 2. 使用 GitHub Actions 打包

推送代码到 GitHub 后，Actions 会自动构建。但需要修改 workflow 配置以生成 ZIP 文件。

### 3. 上传到更新服务器

将以下文件上传到 `http://159.75.182.85/updates/`：
- `latest-mac.yml` ✅ 必需
- `quiet-1.0.0-mac.zip` ✅ 必需
- `quiet-1.0.0.dmg` （可选，用于首次安装）

---

## 📄 latest-mac.yml 文件示例

electron-builder 会自动生成这个文件，内容类似：

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

## 🔍 更新检测逻辑

### 版本比较规则

electron-updater 使用 semver 规则比较版本：

```
当前版本: 1.0.0
服务器版本: 1.0.1  ✅ 会提示更新
服务器版本: 1.1.0  ✅ 会提示更新
服务器版本: 2.0.0  ✅ 会提示更新
服务器版本: 1.0.0  ❌ 不会提示（版本相同）
服务器版本: 0.9.0  ❌ 不会提示（版本更低）
```

### 更新流程

1. 应用启动 5 秒后自动检查更新
2. 发现新版本 → 通知用户
3. 用户点击"下载更新" → 下载 ZIP 文件
4. 下载完成 → 提示"立即安装"
5. 用户点击"立即安装" → 退出应用并安装新版本

---

## ⚠️ 常见问题和注意事项

### 问题 1：只有 DMG 没有 ZIP

**错误：** 服务器上只有 `.dmg` 文件，没有 `.zip` 文件

**解决：** 
- 修改 `electron-builder.yml`，添加 `zip` 到 `mac.target`
- 重新打包，确保生成 `.zip` 文件

### 问题 2：latest-mac.yml 文件路径错误

**错误：** `latest-mac.yml` 中的文件路径不正确

**解决：**
- 确保 `latest-mac.yml` 和 `.zip` 文件在同一目录
- 检查 `latest-mac.yml` 中的 `path` 字段是否正确

### 问题 3：CORS 跨域问题

**错误：** 浏览器阻止下载更新文件

**解决：**
在更新服务器（Nginx）配置 CORS：

```nginx
location /updates/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, OPTIONS';
    add_header Access-Control-Allow-Headers 'Range';
}
```

### 问题 4：Mac 应用未签名导致更新失败

**错误：** Mac 系统阻止安装未签名的应用

**解决方案 A（推荐）：** 使用苹果开发者账号签名
```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  notarize: true
```

**解决方案 B（临时）：** 用户手动允许
1. 系统偏好设置 → 安全性与隐私
2. 点击"仍要打开"

### 问题 5：版本号格式错误

**错误：** `package.json` 中的版本号格式不符合 semver

**正确格式：**
```json
{
  "version": "1.0.0"  ✅
  "version": "v1.0.0" ❌ 不要加 v 前缀
  "version": "1.0"    ❌ 必须是三位数字
}
```

### 问题 6：HTTP vs HTTPS

**注意：** 你使用的是 HTTP 地址（`http://159.75.182.85/updates/`）

**影响：**
- ✅ 开发环境可以正常工作
- ⚠️ 生产环境建议使用 HTTPS
- ⚠️ Mac 可能会警告不安全的连接

**建议：** 为更新服务器配置 SSL 证书

---

## 🧪 测试更新功能

### 1. 准备测试环境

```bash
# 1. 修改 package.json 版本号为 1.0.0
{
  "version": "1.0.0"
}

# 2. 打包应用
npm run build:mac

# 3. 安装应用（双击 DMG）
```

### 2. 准备新版本

```bash
# 1. 修改 package.json 版本号为 1.0.1
{
  "version": "1.0.1"
}

# 2. 重新打包
npm run build:mac

# 3. 上传到服务器
# - latest-mac.yml
# - quiet-1.0.1-mac.zip
```

### 3. 测试更新

1. 打开已安装的应用（1.0.0 版本）
2. 等待 5 秒，应该自动检查更新
3. 应该弹出"发现新版本 1.0.1"提示
4. 点击"下载更新"
5. 下载完成后点击"立即安装"
6. 应用重启后应该是 1.0.1 版本

### 4. 查看日志

打开开发者工具（如果启用），查看控制台日志：

```
🔍 正在检查更新...
✅ 发现新版本: 1.0.1
📥 下载进度: 50.00%
✅ 更新下载完成: 1.0.1
🚀 安装更新并重启...
```

---

## 📊 服务器目录结构示例

```
/var/www/updates/
├── latest-mac.yml              # Mac 版本信息
├── latest.yml                  # Windows 版本信息（如果有）
├── quiet-1.0.0-mac.zip         # Mac 1.0.0 更新包
├── quiet-1.0.0.dmg             # Mac 1.0.0 安装包
├── quiet-1.0.1-mac.zip         # Mac 1.0.1 更新包
├── quiet-1.0.1.dmg             # Mac 1.0.1 安装包
├── quiet-1.0.0-setup.exe       # Windows 1.0.0 安装包（如果有）
└── quiet-1.0.1-setup.exe       # Windows 1.0.1 安装包（如果有）
```

**注意：** `latest-mac.yml` 始终指向最新版本，每次发布新版本时会被覆盖。

---

## 🔐 安全建议

### 1. 使用 HTTPS

```yaml
publish:
  provider: generic
  url: https://159.75.182.85/updates/  # 使用 HTTPS
```

### 2. 验证文件完整性

electron-updater 会自动验证 SHA512，确保文件未被篡改。

### 3. 代码签名（推荐）

```yaml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  notarize: true
```

需要：
- Apple Developer 账号（$99/年）
- 开发者证书
- App-specific password

---

## 📝 完整配置示例

### electron-builder.yml

```yaml
appId: com.electron.app
productName: quiet
directories:
  buildResources: build

mac:
  target:
    - dmg
    - zip  # 必需：用于自动更新
  entitlementsInherit: build/entitlements.mac.plist
  extendInfo:
    - NSCameraUsageDescription: Application requests access to the device's camera.
    - NSMicrophoneUsageDescription: Application requests access to the device's microphone.
    - NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.
    - NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.
  notarize: false

dmg:
  artifactName: ${name}-${version}.${ext}

publish:
  provider: generic
  url: http://159.75.182.85/updates/

electronDownload:
  mirror: https://npmmirror.com/mirrors/electron/
```

### src/main/index.ts

```typescript
function setupAutoUpdater(): void {
  // 设置更新服务器地址
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://159.75.182.85/updates/'
  })

  // 禁用自动下载，改为手动控制
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  // 其他事件监听保持不变...
}
```

---

## 🚀 发布新版本的完整流程

### 1. 更新版本号

```bash
# 修改 package.json
{
  "version": "1.0.1"
}
```

### 2. 提交代码

```bash
git add package.json
git commit -m "chore: bump version to 1.0.1"
git push origin master
git push github master
```

### 3. 等待 GitHub Actions 构建

访问 GitHub Actions 页面，等待构建完成（约 5-7 分钟）

### 4. 下载构建产物

从 GitHub Actions 下载：
- `quiet-1.0.1-mac.zip`
- `quiet-1.0.1.dmg`
- `latest-mac.yml`

### 5. 上传到更新服务器

```bash
# 使用 SCP 上传
scp dist/quiet-1.0.1-mac.zip root@159.75.182.85:/var/www/updates/
scp dist/quiet-1.0.1.dmg root@159.75.182.85:/var/www/updates/
scp dist/latest-mac.yml root@159.75.182.85:/var/www/updates/
```

### 6. 验证文件可访问

```bash
# 测试文件是否可访问
curl -I http://159.75.182.85/updates/latest-mac.yml
curl -I http://159.75.182.85/updates/quiet-1.0.1-mac.zip
```

### 7. 测试更新

打开旧版本应用，等待自动检查更新。

---

## 📚 相关文档

- [electron-updater 官方文档](https://www.electron.build/auto-update)
- [Generic Provider 配置](https://www.electron.build/configuration/publish#genericserveroptions)
- [Mac 代码签名指南](https://www.electron.build/code-signing)

---

**创建时间：** 2026-03-05
**更新服务器：** http://159.75.182.85/updates/
