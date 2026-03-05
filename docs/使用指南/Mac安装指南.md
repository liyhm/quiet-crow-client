# Mac 安装指南

## 问题 1：无法打开应用（安全提示）

当你在 Mac 上首次打开 quiet 应用时，可能会看到以下提示：

```
未打开 "quiet"
Apple 无法验证 "quiet" 是否包含可能危害 Mac 安全或泄漏隐私的恶意软件。
```

### 解决方案

#### 方法一：通过系统设置允许（推荐）

1. 点击提示框中的"完成"按钮
2. 打开"系统设置"（System Settings）
3. 点击"隐私与安全性"（Privacy & Security）
4. 向下滚动，找到"仍要打开"（Open Anyway）按钮
5. 点击"打开"（Open）
6. 输入你的 Mac 密码确认

#### 方法二：使用命令行（最快）

打开"终端"（Terminal），输入以下命令：

```bash
sudo xattr -rd com.apple.quarantine /Applications/quiet.app
```

然后输入你的 Mac 密码，再次打开应用即可。

#### 方法三：右键打开

1. 在 Finder 中找到 quiet 应用
2. 按住 Control 键点击应用图标（或右键点击）
3. 选择"打开"（Open）
4. 在弹出的对话框中点击"打开"（Open）

---

## 问题 2：应用崩溃（代码签名问题）

如果应用打开后立即崩溃，崩溃报告显示：

```
code signature ... not valid for use in process: 
mapping process and mapped file (non-platform) have different Team IDs
```

这是因为应用的代码签名有问题。

### 解决方案

使用命令行移除代码签名：

```bash
# 移除隔离属性
sudo xattr -rd com.apple.quarantine /Applications/quiet.app

# 移除代码签名
sudo codesign --remove-signature /Applications/quiet.app/Contents/Frameworks/Electron\ Framework.framework/Versions/A/Electron\ Framework

# 移除主程序签名
sudo codesign --remove-signature /Applications/quiet.app
```

然后重新打开应用。

---

## 为什么会出现这个提示？

macOS 的 Gatekeeper 安全机制要求应用必须：
1. 使用 Apple 开发者证书签名
2. 经过 Apple 公证（notarize）

由于我们的应用目前没有经过公证，所以会出现这个提示。

---

## 未来计划

如果需要让用户无需手动操作就能安装，需要：

1. 注册 Apple 开发者账号（$99/年）
2. 配置代码签名证书
3. 配置应用公证（notarize）

配置后，用户就可以直接安装，不会看到安全提示。

---

## 常见问题

### Q: 这个应用安全吗？
A: 是的，这是我们自己开发的应用。只是没有经过 Apple 的公证流程。

### Q: 每次更新都要重新允许吗？
A: 不需要。只有首次安装时需要允许一次。

### Q: 可以跳过这个提示吗？
A: 可以，使用上面的方法二（命令行）或方法三（右键打开）。
