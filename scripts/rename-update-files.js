// 重命名更新文件脚本
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

console.log('🔍 检查生成的更新文件...\n');

// 检查 Windows 文件 (quiet-latest.yml)
const windowsFile = path.join(distDir, 'quiet-latest.yml');
if (fs.existsSync(windowsFile)) {
  console.log('✅ Windows 更新文件已生成: quiet-latest.yml');
  const content = fs.readFileSync(windowsFile, 'utf8');
  console.log('   版本信息:', content.split('\n')[0]);
} else {
  console.log('⚠️  未找到 Windows 更新文件 (quiet-latest.yml)');
}

// 检查 Mac 文件 (quiet-latest-mac.yml)
const macFile = path.join(distDir, 'quiet-latest-mac.yml');
if (fs.existsSync(macFile)) {
  console.log('✅ Mac 更新文件已生成: quiet-latest-mac.yml');
  const content = fs.readFileSync(macFile, 'utf8');
  console.log('   版本信息:', content.split('\n')[0]);
} else {
  console.log('⚠️  未找到 Mac 更新文件 (quiet-latest-mac.yml)');
}

console.log('\n✨ 检查完成！');
console.log('\n📝 上传文件到服务器:');
console.log('   Windows: scp dist/quiet-latest.yml root@159.75.182.85:/var/www/updates/quiet/');
console.log('   Mac: scp dist/quiet-latest-mac.yml root@159.75.182.85:/var/www/updates/quiet/');
