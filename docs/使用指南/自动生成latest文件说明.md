# 自动生成 latest 文件说明

## ✅ 已修复配置

现在打包时会自动生成 `quiet-latest-mac.yml` 文件，包含完整的 SHA512 哈希值。

---

## 🔧 修改内容

### 1. electron-builder.yml
```yaml
publish:
  provider: generic
  url: http://159.75.182.85/updates/
  channel: quiet

# 确保生成更新配置文件
generateUpdatesFilesForAllChannels: true
```

### 2. .github/workflows/build-mac.yml
添加了调试步骤，会显示生成的文件列表：
```yaml
- name: List generated files
  run: |
    echo "=== Files in dist directory ==="
    ls -la dist/
    echo "=== Checking for yml files ==="
    find dist/ -name "*.yml" -type f
```

---

## 📦 打包后会生成的文件

### Windows 打包
```
dist/
├── quiet-1.0.0-setup.exe       ← 安装包
├── quiet-latest.yml            ← 自动生成（带 SHA512）
└── latest.yml                  ← 也会生成（不带 channel 前缀）
```

### Mac 打包
```
dist/
├── quiet-1.0.0.dmg             ← 安装包
├── quiet-1.0.0-mac.zip         ← 更新包
├── quiet-latest-mac.yml        ← 自动生成（带 SHA512）
└── latest-mac.yml              ← 也会生成（不带 channel 前缀）
```

---

## 🎯 自动生成的 yml 文件内容

### quiet-latest-mac.yml
```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-mac.zip
    sha512: roLuQmFLtfAYQ2uQGa2dkTURj71gl28rEADDCwSXrNTNzt6eT1nBF59Z8mzwZZUWID+ouuRJOvMCvCTcn3knAQ==
    size: 111388672
path: quiet-1.0.0-mac.zip
sha512: roLuQmFLtfAYQ2uQGa2dkTURj71gl28rEADDCwSXrNTNzt6eT1nBF59Z8mzwZZUWID+ouuRJOvMCvCTcn3knAQ==
releaseDate: '2026-03-05T05:51:00.000Z'
```

**关键点：**
- ✅ `version` - 自动从 package.json 读取
- ✅ `sha512` - 自动计算文件的 SHA512 哈希值
- ✅ `size` - 自动获取文件大小
- ✅ `releaseDate` - 自动生成当前时间

---

## 🚀 使用流程

### 1. 修改版本号
```json
// package.json
{
  "version": "1.0.1"
}
```

### 2. 提交并推送
```bash
git add package.json electron-builder.yml .github/workflows/build-mac.yml
git commit -m "chore: bump version to 1.0.1 and fix yml generation"
git push github master
```

### 3. 等待构建完成
访问 GitHub Actions，等待约 5-7 分钟

### 4. 查看构建日志
在构建日志中会看到：
```
=== Files in dist directory ===
-rw-r--r--  1 runner  staff  112606000 Mar  5 05:51 quiet-1.0.1.dmg
-rw-r--r--  1 runner  staff  111388672 Mar  5 05:51 quiet-1.0.1-mac.zip
-rw-r--r--  1 runner  staff        458 Mar  5 05:51 quiet-latest-mac.yml
-rw-r--r--  1 runner  staff        458 Mar  5 05:51 latest-mac.yml

=== Checking for yml files ===
dist/quiet-latest-mac.yml
dist/latest-mac.yml
```

### 5. 下载 Artifacts
下载后解压，应该包含 3 个文件：
- `quiet-1.0.1.dmg`
- `quiet-1.0.1-mac.zip`
- `quiet-latest-mac.yml` ✅ 自动生成

### 6. 上传到服务器
```bash
scp quiet-1.0.1-mac.zip root@159.75.182.85:/var/www/updates/
scp quiet-1.0.1.dmg root@159.75.182.85:/var/www/updates/
scp quiet-latest-mac.yml root@159.75.182.85:/var/www/updates/
```

---

## ⚠️ 如果还是没有生成 yml 文件

### 检查 1：package.json 中是否有 build 配置
确保没有 `build` 字段覆盖 electron-builder.yml：
```json
{
  "name": "quiet",
  "version": "1.0.0",
  // 不要有 "build": {} 字段
}
```

### 检查 2：是否配置了 publish
electron-builder.yml 中必须有 `publish` 配置：
```yaml
publish:
  provider: generic
  url: http://159.75.182.85/updates/
```

### 检查 3：本地测试
在本地打包测试：
```bash
npm run build:mac
ls dist/
# 应该看到 quiet-latest-mac.yml
```

---

## 🔍 为什么之前没有生成？

可能的原因：
1. ❌ 没有配置 `publish` 字段
2. ❌ 配置了 `publish: false`
3. ❌ GitHub Actions 环境问题
4. ❌ electron-builder 版本太旧

现在已经修复：
- ✅ 添加了 `generateUpdatesFilesForAllChannels: true`
- ✅ 确保 `publish` 配置正确
- ✅ 添加了调试日志

---

## 💡 验证修复

### 1. 提交修改
```bash
git add .
git commit -m "fix: ensure yml files are generated"
git push github master
```

### 2. 查看构建日志
在 GitHub Actions 日志中搜索 "Checking for yml files"，应该能看到：
```
dist/quiet-latest-mac.yml
dist/latest-mac.yml
```

### 3. 下载 Artifacts
解压后应该有 3 个文件，包括 yml 文件

---

## 🎯 总结

**现在不需要手动填 SHA512 了！**

- ✅ electron-builder 会自动计算 SHA512
- ✅ 自动生成 `quiet-latest-mac.yml`
- ✅ 包含完整的版本信息、哈希值、文件大小
- ✅ 你只需要下载并上传到服务器

**下次打包时：**
1. 改版本号
2. 推送代码
3. 等待构建
4. 下载 3 个文件（dmg + zip + yml）
5. 上传到服务器
6. 完成！

---

**创建时间：** 2026-03-05
