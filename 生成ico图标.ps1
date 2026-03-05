# 从 PNG 生成 ICO 图标
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  从 PNG 生成 ICO 图标" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了 ImageMagick
$magickPath = Get-Command magick -ErrorAction SilentlyContinue

if ($magickPath) {
    Write-Host "✓ 找到 ImageMagick" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "正在生成 icon.ico..." -ForegroundColor Yellow
    magick convert build\icon.png -define icon:auto-resize=256,128,64,48,32,16 build\icon.ico
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ icon.ico 已生成" -ForegroundColor Green
    } else {
        Write-Host "✗ 生成失败" -ForegroundColor Red
    }
} else {
    Write-Host "✗ 未找到 ImageMagick" -ForegroundColor Red
    Write-Host ""
    Write-Host "方案 1: 安装 ImageMagick" -ForegroundColor Yellow
    Write-Host "  访问: https://imagemagick.org/script/download.php" -ForegroundColor White
    Write-Host "  下载并安装 Windows 版本" -ForegroundColor White
    Write-Host ""
    Write-Host "方案 2: 使用在线工具转换" -ForegroundColor Yellow
    Write-Host "  1. 访问: https://convertio.co/zh/png-ico/" -ForegroundColor White
    Write-Host "  2. 上传 build\icon.png" -ForegroundColor White
    Write-Host "  3. 下载转换后的 icon.ico" -ForegroundColor White
    Write-Host "  4. 替换到 build\icon.ico" -ForegroundColor White
    Write-Host ""
    Write-Host "方案 3: 暂时使用 PNG（可能不完美）" -ForegroundColor Yellow
    Write-Host "  electron-builder 会尝试自动转换 PNG 为 ICO" -ForegroundColor White
    Write-Host "  直接重新打包试试" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
