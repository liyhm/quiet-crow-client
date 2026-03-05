# 生成 latest-mac.yml 文件

## 🔍 问题

GitHub Actions 打包后只有 2 个文件：
- `quiet-1.0.0.dmg`
- `quiet-1.0.0-arm64-mac.zip`

缺少 `quiet-latest-mac.yml` 文件。

---

## 💡 解决方案

### 方案 1：手动创建 latest-mac.yml（推荐）

创建一个 `quiet-latest-mac.yml` 文件，内容如下：

```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-arm64-mac.zip
    sha512: 计算的SHA512值
    size: 108778000
path: quiet-1.0.0-arm64-mac.zip
sha512: 计算的SHA512值
releaseDate: '2026-03-05T05:51:00.000Z'
```

#### 步骤 1：计算 SHA512

**macOS/Linux:**
```bash
# 计算 SHA512
shasum -a 512 quiet-1.0.0-arm64-mac.zip | awk '{print $1}' | xxd -r -p | base64
```

**Windows PowerShell:**
```powershell
$hash = Get-FileHash -Algorithm SHA512 "quiet-1.0.0-arm64-mac.zip"
$bytes = [byte[]] -split ($hash.Hash -replace '..', '0x$& ')
[Convert]::ToBase64String($bytes)
```

**在线工具:**
1. 访问 https://emn178.github.io/online-tools/sha512_checksum.html
2. 上传 `quiet-1.0.0-arm64-mac.zip`
3. 复制 SHA512 值
4. 转换为 Base64（或使用在线 Base64 转换工具）

#### 步骤 2：获取文件大小

**macOS/Linux:**
```bash
ls -l quiet-1.0.0-arm64-mac.zip | awk '{print $5}'
```

**Windows:**
```powershell
(Get-Item "quiet-1.0.0-arm64-mac.zip").Length
```

从你的截图看，文件大小是 `108778 KB = 111388672 字节`

#### 步骤 3：创建 yml 文件

创建 `quiet-latest-mac.yml`：

```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-arm64-mac.zip
    sha512: 你计算的SHA512值
    size: 111388672
path: quiet-1.0.0-arm64-mac.zip
sha512: 你计算的SHA512值
releaseDate: '2026-03-05T05:51:00.000Z'
```

---

### 方案 2：本地打包生成（最准确）

如果你有 Mac 电脑，可以本地打包：

```bash
# 1. 安装依赖
npm install

# 2. 打包
npm run build:mac

# 3. 查看 dist 目录
ls dist/
# 应该会看到：
# - quiet-1.0.0.dmg
# - quiet-1.0.0-mac.zip
# - quiet-latest-mac.yml  ← 自动生成
```

然后使用本地生成的 `quiet-latest-mac.yml` 文件。

---

### 方案 3：修改 GitHub Actions（治本）

问题可能是 electron-builder 在 GitHub Actions 环境中没有生成 yml 文件。

修改 `.github/workflows/build-mac.yml`，添加一个步骤来验证文件：

```yaml
- name: List dist files
  run: |
    echo "Files in dist directory:"
    ls -la dist/
    
- name: Check for yml file
  run: |
    if [ ! -f dist/*latest*.yml ]; then
      echo "Warning: No latest yml file found!"
      echo "Creating minimal yml file..."
      cat > dist/quiet-latest-mac.yml << EOF
    version: $(node -p "require('./package.json').version")
    files:
      - url: quiet-$(node -p "require('./package.json').version")-arm64-mac.zip
        sha512: placeholder
        size: $(stat -f%z dist/*-mac.zip)
    path: quiet-$(node -p "require('./package.json').version")-arm64-mac.zip
    sha512: placeholder
    releaseDate: '$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'
    EOF
    fi
```

---

## 🎯 快速解决方案（临时）

如果你只是想快速测试，可以创建一个简化的 yml 文件：

```yaml
version: 1.0.0
path: quiet-1.0.0-arm64-mac.zip
```

然后上传到服务器：

```bash
scp quiet-1.0.0-arm64-mac.zip root@159.75.182.85:/var/www/updates/
scp quiet-1.0.0.dmg root@159.75.182.85:/var/www/updates/
scp quiet-latest-mac.yml root@159.75.182.85:/var/www/updates/
```

**注意：** 这个简化版本缺少 SHA512 验证，可能会导致更新失败。

---

## 📋 完整的 latest-mac.yml 示例

```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-arm64-mac.zip
    sha512: roLuQmFLtfAYQ2uQGa2dkTURj71gl28rEADDCwSXrNTNzt6eT1nBF59Z8mzwZZUWID+ouuRJOvMCvCTcn3knAQ==
    size: 111388672
path: quiet-1.0.0-arm64-mac.zip
sha512: roLuQmFLtfAYQ2uQGa2dkTURj71gl28rEADDCwSXrNTNzt6eT1nBF59Z8mzwZZUWID+ouuRJOvMCvCTcn3knAQ==
releaseDate: '2026-03-05T05:51:00.000Z'
```

---

## ⚠️ 重要提示

### 1. 文件名必须匹配
- yml 中的 `path` 必须和实际文件名一致
- 你的文件是 `quiet-1.0.0-arm64-mac.zip`（带 arm64）
- 所以 yml 中也要写 `quiet-1.0.0-arm64-mac.zip`

### 2. SHA512 必须正确
如果 SHA512 不正确，更新会失败。必须：
- 计算实际文件的 SHA512
- 转换为 Base64 格式
- 填入 yml 文件

### 3. 文件大小必须准确
从你的截图：`108,778 KB = 111,388,672 字节`

---

## 🔍 验证文件

上传后验证：

```bash
# 检查文件是否可访问
curl http://159.75.182.85/updates/quiet-latest-mac.yml
curl -I http://159.75.182.85/updates/quiet-1.0.0-arm64-mac.zip

# 检查版本号
curl http://159.75.182.85/updates/quiet-latest-mac.yml | grep version
```

---

## 💡 总结

**最简单的方法：**
1. 手动创建 `quiet-latest-mac.yml`
2. 计算 SHA512 和文件大小
3. 填入 yml 文件
4. 上传到服务器

**最准确的方法：**
1. 在 Mac 上本地打包
2. 使用自动生成的 yml 文件
3. 上传到服务器

**临时测试方法：**
1. 创建简化版 yml（只有 version 和 path）
2. 上传测试
3. 后续再补充完整信息

---

**创建时间：** 2026-03-05
