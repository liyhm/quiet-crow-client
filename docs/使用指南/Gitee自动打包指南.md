# Gitee 自动打包指南

## 概述

Gitee 提供了 Gitee Go（CI/CD）功能，可以自动打包 Windows、macOS、Linux 版本。

## Gitee Go 介绍

Gitee Go 是 Gitee 提供的持续集成/持续部署服务，类似于 GitHub Actions。

### 功能特点

- 支持 Windows、macOS、Linux 构建环境
- 每月免费 2000 分钟构建时间
- 国内访问速度快
- 支持自动发布到 Gitee Release

### 价格

| 版本 | 免费额度 | 价格 |
|------|---------|------|
| 免费版 | 2000 分钟/月 | 免费 |
| 基础版 | 10000 分钟/月 | ¥99/月 |
| 专业版 | 50000 分钟/月 | ¥499/月 |

---

## 配置步骤

### 1. 开通 Gitee Go

1. 访问 Gitee 仓库
2. 点击 "服务" → "Gitee Go"
3. 点击 "开通 Gitee Go"
4. 选择免费版或付费版

### 2. 创建工作流文件

工作流文件已创建：`.gitee/workflows/build.yml`

### 3. 推送代码到 Gitee

```bash
# 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/your-username/your-repo.git

# 推送代码
git push gitee main

# 推送所有分支和标签
git push gitee --all
git push gitee --tags
```

### 4. 触发自动打包

#### 方法 1：推送标签（推荐）

```bash
# 创建标签
git tag v1.0.0

# 推送标签到 Gitee
git push gitee v1.0.0
```

#### 方法 2：手动触发

1. 访问 Gitee 仓库
2. 点击 "服务" → "Gitee Go"
3. 选择 "Build and Release" 工作流
4. 点击 "运行工作流"
5. 选择分支，点击 "运行"

### 5. 查看构建结果

1. 访问 Gitee 仓库
2. 点击 "服务" → "Gitee Go"
3. 查看构建进度和日志
4. 构建完成后，在 "制品" 中下载安装包

---

## 发布到 Gitee Release

### 自动发布

修改 `.gitee/workflows/build.yml`，添加发布步骤：

```yaml
- name: Create Release
  if: startsWith(github.ref, 'refs/tags/')
  uses: actions/create-release@v1
  env:
    GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
  with:
    tag_name: ${{ github.ref }}
    release_name: Release ${{ github.ref }}
    draft: false
    prerelease: false

- name: Upload Release Asset
  uses: actions/upload-release-asset@v1
  env:
    GITEE_TOKEN: ${{ secrets.GITEE_TOKEN }}
  with:
    upload_url: ${{ steps.create_release.outputs.upload_url }}
    asset_path: ./dist/quiet-1.0.0-setup.exe
    asset_name: quiet-1.0.0-setup.exe
    asset_content_type: application/octet-stream
```

### 手动发布

1. 下载构建产物
2. 访问 Gitee 仓库
3. 点击 "发行版" → "创建发行版"
4. 填写版本信息
5. 上传安装包
6. 点击 "发布"

---

## 配置自动更新

### 1. 修改 electron-builder.yml

```yaml
publish:
  provider: generic
  url: https://gitee.com/your-username/your-repo/releases/download/v${version}
```

### 2. 上传文件到 Gitee Release

确保以下文件上传到 Release：

- `quiet-1.0.0-setup.exe`（Windows 安装包）
- `latest.yml`（Windows 更新元数据）
- `quiet-1.0.0.dmg`（macOS 安装包）
- `latest-mac.yml`（macOS 更新元数据）
- `quiet-1.0.0.AppImage`（Linux 安装包）
- `latest-linux.yml`（Linux 更新元数据）

### 3. 更新 URL 格式

Gitee Release 下载 URL 格式：

```
https://gitee.com/{owner}/{repo}/releases/download/{tag}/{filename}
```

例如：
```
https://gitee.com/your-username/quiet-crow/releases/download/v1.0.0/quiet-1.0.0-setup.exe
```

---

## Gitee vs GitHub

| 功能 | Gitee | GitHub |
|------|-------|--------|
| 国内访问速度 | 快 | 慢（需要代理） |
| CI/CD 免费额度 | 2000 分钟/月 | 2000 分钟/月 |
| macOS 构建 | 支持 | 支持 |
| 私有仓库 | 免费 | 免费 |
| 社区活跃度 | 中等 | 高 |
| 国际化 | 主要中文 | 全球 |

---

## 推荐方案

### 方案 1：仅使用 Gitee

适合：
- 国内用户
- 不需要国际化
- 希望访问速度快

配置：
```yaml
# electron-builder.yml
publish:
  provider: generic
  url: https://gitee.com/your-username/your-repo/releases/download/v${version}
```

### 方案 2：Gitee + GitHub 双发布

适合：
- 国内外用户都有
- 希望覆盖更广

配置：
```yaml
# electron-builder.yml
publish:
  - provider: generic
    url: https://gitee.com/your-username/your-repo/releases/download/v${version}
  - provider: github
    owner: your-username
    repo: your-repo
```

同时推送到两个平台：
```bash
# 添加两个远程仓库
git remote add github https://github.com/your-username/your-repo.git
git remote add gitee https://gitee.com/your-username/your-repo.git

# 推送到两个平台
git push github main
git push gitee main

# 推送标签
git push github v1.0.0
git push gitee v1.0.0
```

### 方案 3：Gitee 打包 + 自建服务器分发

适合：
- 需要完全控制
- 有自己的服务器

流程：
1. Gitee Go 自动打包
2. 下载构建产物
3. 上传到自己的服务器
4. 配置自动更新 URL

---

## 常见问题

### 1. Gitee Go 构建失败

检查：
- 是否开通了 Gitee Go
- 工作流文件格式是否正确
- 依赖是否能正常安装
- 查看构建日志

### 2. macOS 构建需要付费吗？

Gitee Go 的 macOS 构建环境：
- 免费版：包含在 2000 分钟内
- macOS 构建消耗分钟数较多（约 10-20 分钟/次）

### 3. 如何加速构建？

```yaml
# 使用缓存
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 4. 构建超时怎么办？

Gitee Go 默认超时时间：60 分钟

如果超时：
- 优化依赖安装（使用 npm ci 而不是 npm install）
- 减少构建目标（只构建必要的平台）
- 升级到付费版（更高性能的构建机器）

---

## 完整示例

### 发布脚本（release-gitee.sh）

```bash
#!/bin/bash

# 检查版本号
VERSION=$(node -p "require('./package.json').version")
echo "📦 准备发布版本: v$VERSION"

# 确认发布
read -p "确认发布到 Gitee? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# 提交代码
git add .
git commit -m "Release v$VERSION"

# 推送到 Gitee
git push gitee main

# 创建并推送标签
git tag v$VERSION
git push gitee v$VERSION

echo "✅ 发布完成！"
echo "🌐 Gitee Go 正在自动打包..."
echo "📦 访问 https://gitee.com/your-username/your-repo/actions 查看进度"
```

### Windows 发布脚本（release-gitee.ps1）

```powershell
# 检查版本号
$version = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "📦 准备发布版本: v$version"

# 确认发布
$confirm = Read-Host "确认发布到 Gitee? (y/n)"
if ($confirm -ne 'y') {
    exit
}

# 提交代码
git add .
git commit -m "Release v$version"

# 推送到 Gitee
git push gitee main

# 创建并推送标签
git tag "v$version"
git push gitee "v$version"

Write-Host "✅ 发布完成！"
Write-Host "🌐 Gitee Go 正在自动打包..."
Write-Host "📦 访问 https://gitee.com/your-username/your-repo/actions 查看进度"
```

---

## 相关链接

- [Gitee Go 官方文档](https://gitee.com/help/articles/4193)
- [Gitee Go 定价](https://gitee.com/enterprises/go)
- [跨平台打包指南](./跨平台打包指南.md)
- [自动更新服务器部署指南](./自动更新服务器部署指南.md)

---

## 总结

Gitee Go 是国内开发者的好选择：
- ✅ 访问速度快
- ✅ 免费额度充足
- ✅ 支持所有平台
- ✅ 配置简单

推荐使用 Gitee Go 进行自动打包，特别是如果你的用户主要在国内。
