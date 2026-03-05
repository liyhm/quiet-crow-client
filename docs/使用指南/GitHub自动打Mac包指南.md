# GitHub 自动打 Mac 包指南

## 📦 目标

利用 GitHub Actions 自动构建 macOS 安装包，不影响现有的 Gitee 项目。

---

## 🚀 操作步骤

### 1. 在 GitHub 创建新仓库

1. 访问 https://github.com/new
2. 创建一个新的仓库（例如：`quiet-crow-client`）
3. **不要**初始化 README、.gitignore 或 license（保持空仓库）
4. 记下仓库地址，例如：`https://github.com/你的用户名/quiet-crow-client.git`

---

### 2. 添加 GitHub 作为第二个远程仓库

在项目目录下执行：

```bash
# 添加 GitHub 远程仓库（命名为 github）
git remote add github https://github.com/你的用户名/quiet-crow-client.git

# 验证远程仓库
git remote -v
```

你应该看到：
```
origin  https://gitee.com/lyhmeng/quiet-crow-client.git (fetch)
origin  https://gitee.com/lyhmeng/quiet-crow-client.git (push)
github  https://github.com/你的用户名/quiet-crow-client.git (fetch)
github  https://github.com/你的用户名/quiet-crow-client.git (push)
```

---

### 3. 推送代码到 GitHub

```bash
# 推送当前分支到 GitHub
git push github master

# 如果有标签也推送
git push github --tags
```

---

### 4. 触发 Mac 打包

推送到 GitHub 后，GitHub Actions 会自动开始构建。你可以：

#### 方式 1：推送代码触发
```bash
# 提交修改
git add .
git commit -m "你的提交信息"

# 推送到 Gitee（保持原有流程）
git push origin master

# 同时推送到 GitHub（触发打包）
git push github master
```

#### 方式 2：手动触发
1. 访问 GitHub 仓库页面
2. 点击 `Actions` 标签
3. 选择 `Build macOS App` workflow
4. 点击 `Run workflow` 按钮
5. 选择分支，点击 `Run workflow`

#### 方式 3：打标签触发发布
```bash
# 创建版本标签
git tag v1.0.0

# 推送标签到 GitHub
git push github v1.0.0
```

打标签会触发构建并自动创建 GitHub Release。

---

### 5. 下载打包文件

#### 从 Actions 下载（普通推送）
1. 访问 GitHub 仓库的 `Actions` 页面
2. 点击最新的 workflow 运行记录
3. 在 `Artifacts` 部分下载 `quiet-macos-xxx` 文件
4. 解压后得到 `.dmg` 和 `.zip` 文件

#### 从 Releases 下载（标签推送）
1. 访问 GitHub 仓库的 `Releases` 页面
2. 找到对应版本的 Release
3. 直接下载 `.dmg` 或 `.zip` 文件

---

## 📝 日常工作流程

### 正常开发（只提交到 Gitee）
```bash
git add .
git commit -m "feat: 新功能"
git push origin master
```

### 需要打 Mac 包时
```bash
# 先推送到 Gitee
git push origin master

# 再推送到 GitHub 触发打包
git push github master
```

### 发布新版本
```bash
# 1. 更新 package.json 中的版本号
# 2. 提交修改
git add package.json
git commit -m "chore: bump version to 1.0.1"

# 3. 推送到 Gitee
git push origin master

# 4. 创建标签
git tag v1.0.1

# 5. 推送到 GitHub（触发打包和发布）
git push github master
git push github v1.0.1
```

---

## 🔧 配置说明

### GitHub Actions 配置文件

位置：`.github/workflows/build-mac.yml`

**触发条件：**
- 推送到 `master` 分支
- 推送标签（`v*` 格式）
- 手动触发

**构建环境：**
- macOS 最新版本
- Node.js 20

**输出文件：**
- `quiet-{version}.dmg` - macOS 安装镜像
- `quiet-{version}-mac.zip` - 压缩包

**保留时间：**
- Artifacts 保留 30 天
- Releases 永久保留

---

## ⚙️ electron-builder 配置

位置：`electron-builder.yml`

Mac 相关配置：
```yaml
mac:
  entitlementsInherit: build/entitlements.mac.plist
  extendInfo:
    - NSCameraUsageDescription: Application requests access to the device's camera.
    - NSMicrophoneUsageDescription: Application requests access to the device's microphone.
    - NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.
    - NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.
  notarize: false

dmg:
  artifactName: ${name}-${version}.${ext}
```

**注意：** `notarize: false` 表示不进行苹果公证。如果需要公证，需要配置：
- Apple ID
- App-specific password
- Team ID

---

## 🛠️ 本地测试 Mac 打包

如果你有 Mac 电脑，可以本地测试：

```bash
# 安装依赖
npm install

# 构建并打包
npm run build:mac
```

打包文件会生成在 `dist/` 目录。

---

## 📊 构建时间

- 安装依赖：约 2-3 分钟
- 构建应用：约 1-2 分钟
- 打包 DMG：约 1 分钟
- **总计：约 5-7 分钟**

---

## ❓ 常见问题

### Q1: 构建失败怎么办？

1. 检查 GitHub Actions 日志
2. 常见错误：
   - 依赖安装失败：检查 `package.json`
   - 构建失败：检查 TypeScript 类型错误
   - 打包失败：检查 `electron-builder.yml` 配置

### Q2: 如何删除 GitHub 远程仓库？

```bash
git remote remove github
```

### Q3: 如何只推送特定分支到 GitHub？

```bash
# 只推送 master 分支
git push github master

# 不推送其他分支
```

### Q4: 构建的包能在所有 Mac 上运行吗？

可以，但未签名和公证的应用需要用户手动允许运行：
1. 右键点击应用
2. 选择"打开"
3. 点击"打开"确认

### Q5: 如何配置苹果签名和公证？

需要在 GitHub 仓库设置中添加 Secrets：
- `APPLE_ID` - 你的 Apple ID
- `APPLE_ID_PASSWORD` - App-specific password
- `APPLE_TEAM_ID` - 你的 Team ID

然后修改 `electron-builder.yml`：
```yaml
mac:
  notarize: true
```

---

## 🎯 优势

1. **不影响 Gitee**：Gitee 仍然是主仓库
2. **免费构建**：GitHub Actions 对公开仓库免费
3. **自动化**：推送代码即可自动打包
4. **Mac 环境**：无需自己拥有 Mac 电脑
5. **版本管理**：通过标签管理发布版本

---

## 📚 相关文档

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [electron-builder 文档](https://www.electron.build/)
- [macOS 代码签名指南](https://www.electron.build/code-signing)

---

**创建时间：** 2026-03-05
