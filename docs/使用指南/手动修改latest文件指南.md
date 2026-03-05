# 手动修改 latest.yml 文件指南

## ⚠️ 重要说明

electron-updater 默认会验证文件的 SHA512 哈希值，这是为了安全性。但如果你想快速测试或手动控制更新，可以按照以下步骤操作。

---

## 📝 latest.yml 文件结构

```yaml
version: 1.0.0
files:
  - url: quiet-1.0.0-setup.exe
    sha512: xxxxx...
    size: 99321087
path: quiet-1.0.0-setup.exe
sha512: xxxxx...
releaseDate: '2026-03-05T03:16:20.942Z'
```

---

## 🎯 只修改版本号（最简单）

如果你只想让应用检测到新版本，可以只修改版本号：

### 步骤 1：修改 latest.yml

```yaml
version: 1.0.1  # 只改这一行
files:
  - url: quiet-1.0.0-setup.exe  # 保持不变
    sha512: xxxxx...  # 保持不变
    size: 99321087  # 保持不变
path: quiet-1.0.0-setup.exe  # 保持不变
sha512: xxxxx...  # 保持不变
releaseDate: '2026-03-05T03:16:20.942Z'  # 保持不变
```

### 步骤 2：上传到服务器

```bash
scp latest.yml root@159.75.182.85:/var/www/updates/
```

### 结果

- ✅ 应用会检测到新版本 1.0.1
- ✅ 会提示用户更新
- ⚠️ 但下载的还是 quiet-1.0.0-setup.exe（因为 path 没变）
- ⚠️ 下载后 SHA512 验证会通过（因为文件没变）

---

## 🔧 完整修改（指向新文件）

如果你想指向新的安装包文件：

### 步骤 1：计算新文件的 SHA512

#### Windows PowerShell
```powershell
# 计算 SHA512 并转换为 Base64
$hash = Get-FileHash -Algorithm SHA512 "quiet-1.0.1-setup.exe"
$bytes = [byte[]] -split ($hash.Hash -replace '..', '0x$& ')
[Convert]::ToBase64String($bytes)
```

#### 或使用在线工具
1. 访问 https://emn178.github.io/online-tools/sha512_checksum.html
2. 上传文件
3. 复制 SHA512 值
4. 转换为 Base64 格式

### 步骤 2：获取文件大小

```powershell
(Get-Item "quiet-1.0.1-setup.exe").Length
```

### 步骤 3：修改 latest.yml

```yaml
version: 1.0.1
files:
  - url: quiet-1.0.1-setup.exe
    sha512: 新计算的SHA512值
    size: 新的文件大小
path: quiet-1.0.1-setup.exe
sha512: 新计算的SHA512值
releaseDate: '2026-03-05T10:00:00.000Z'
```

### 步骤 4：上传文件到服务器

```bash
# 上传新的安装包
scp quiet-1.0.1-setup.exe root@159.75.182.85:/var/www/updates/

# 上传修改后的 latest.yml
scp latest.yml root@159.75.182.85:/var/www/updates/
```

---

## 🚀 快速测试方法（跳过 SHA512 验证）

如果你只是想测试更新功能，不关心文件完整性验证：

### 方法 1：使用相同的文件

```yaml
version: 1.0.1  # 改版本号
files:
  - url: quiet-1.0.0-setup.exe  # 用旧文件
    sha512: 旧文件的SHA512  # 保持不变
    size: 旧文件大小  # 保持不变
path: quiet-1.0.0-setup.exe  # 用旧文件
sha512: 旧文件的SHA512  # 保持不变
```

这样：
- 应用检测到新版本 1.0.1
- 下载的是旧文件 quiet-1.0.0-setup.exe
- SHA512 验证通过（因为文件没变）
- 可以测试更新流程

### 方法 2：复制文件并重命名

```bash
# 复制旧文件并重命名
cp quiet-1.0.0-setup.exe quiet-1.0.1-setup.exe

# 修改 latest.yml
version: 1.0.1
path: quiet-1.0.1-setup.exe
# SHA512 和 size 保持和 1.0.0 一样（因为文件内容相同）
```

---

## 📋 Windows 和 Mac 文件对比

### Windows
```yaml
# latest.yml 或 quiet-latest.yml
version: 1.0.0
path: quiet-1.0.0-setup.exe
sha512: xxxxx...
size: 99321087
```

### Mac
```yaml
# latest-mac.yml 或 quiet-latest-mac.yml
version: 1.0.0
path: quiet-1.0.0-mac.zip  # 注意：Mac 用 .zip 不是 .dmg
sha512: xxxxx...
size: 88888888
```

---

## ⚠️ 注意事项

### 1. SHA512 必须匹配
如果 SHA512 不匹配，更新会失败并显示错误：
```
Error: sha512 checksum mismatch
```

### 2. 文件必须存在
如果服务器上没有对应的文件，下载会失败：
```
Error: 404 Not Found
```

### 3. 版本号格式
版本号必须符合 semver 格式：
- ✅ `1.0.0`
- ✅ `1.0.1`
- ✅ `2.0.0`
- ❌ `v1.0.0`（不要加 v）
- ❌ `1.0`（必须三位）

### 4. Mac 必须用 ZIP
Mac 自动更新必须使用 `.zip` 文件，不能用 `.dmg`：
- ✅ `quiet-1.0.0-mac.zip`
- ❌ `quiet-1.0.0.dmg`

---

## 🎯 推荐做法

### 开发测试阶段
可以手动修改 latest.yml 快速测试更新功能。

### 生产环境
建议使用正确的打包流程：
1. 修改 package.json 版本号
2. 运行 `npm run build:win` 或 `npm run build:mac`
3. 使用自动生成的 latest.yml
4. 上传所有文件到服务器

这样可以保证：
- ✅ SHA512 正确
- ✅ 文件大小正确
- ✅ 安全可靠

---

## 🔍 验证修改是否正确

### 1. 检查文件可访问
```bash
curl http://159.75.182.85/updates/latest.yml
curl -I http://159.75.182.85/updates/quiet-1.0.1-setup.exe
```

### 2. 检查版本号
```bash
curl http://159.75.182.85/updates/latest.yml | grep version
```

### 3. 测试更新
打开应用，等待 5 秒，应该弹出更新提示。

---

## 💡 总结

### 最简单的方法（只测试版本检测）
1. 只修改 `version: 1.0.1`
2. 其他字段保持不变
3. 上传到服务器
4. 应用会检测到新版本

### 完整的方法（真正更新）
1. 计算新文件的 SHA512
2. 获取新文件大小
3. 修改 latest.yml 所有字段
4. 上传新文件和 latest.yml
5. 应用会下载并安装新版本

### 最安全的方法（推荐）
1. 修改 package.json 版本号
2. 重新打包
3. 使用自动生成的 latest.yml
4. 不会出错

---

**创建时间：** 2026-03-05
