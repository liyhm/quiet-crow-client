# Quiet Crow - 清理并打包脚本
# 使用方法: 以管理员身份运行 PowerShell，然后执行 .\clean-and-build.ps1

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  Quiet Crow - 清理并打包" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# 1. 结束可能占用文件的进程
Write-Host "[1/5] 正在检查并结束 Electron 进程..." -ForegroundColor Yellow
$electronProcesses = Get-Process | Where-Object {$_.ProcessName -like "*electron*"} -ErrorAction SilentlyContinue
if ($electronProcesses) {
    Write-Host "      发现 $($electronProcesses.Count) 个 Electron 进程，正在结束..." -ForegroundColor Yellow
    $electronProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "      ✓ Electron 进程已结束" -ForegroundColor Green
} else {
    Write-Host "      ✓ 没有发现 Electron 进程" -ForegroundColor Green
}

# 2. 等待进程完全结束
Write-Host ""
Write-Host "[2/5] 等待进程完全结束..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "      ✓ 完成" -ForegroundColor Green

# 3. 清理构建目录
Write-Host ""
Write-Host "[3/5] 正在清理构建目录..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "      ✓ 已删除 dist 目录" -ForegroundColor Green
}
if (Test-Path "out") {
    Remove-Item -Recurse -Force "out" -ErrorAction SilentlyContinue
    Write-Host "      ✓ 已删除 out 目录" -ForegroundColor Green
}

# 4. 等待文件系统释放
Write-Host ""
Write-Host "[4/5] 等待文件系统释放..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "      ✓ 完成" -ForegroundColor Green

# 5. 开始打包
Write-Host ""
Write-Host "[5/5] 开始打包..." -ForegroundColor Yellow
Write-Host "      这可能需要 3-5 分钟，请耐心等待..." -ForegroundColor Cyan
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

npm run build:win

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 打包成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "  安装包位置: dist\quiet-1.0.0-setup.exe" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Cyan
} else {
    Write-Host "  ✗ 打包失败！" -ForegroundColor Red
    Write-Host ""
    Write-Host "  请尝试以下解决方案：" -ForegroundColor Yellow
    Write-Host "  1. 确保以管理员身份运行此脚本" -ForegroundColor Yellow
    Write-Host "  2. 临时关闭 Windows Defender" -ForegroundColor Yellow
    Write-Host "  3. 查看详细错误信息" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  详细文档: docs\问题修复\打包权限错误修复.md" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}
