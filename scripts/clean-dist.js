// 清理 dist 目录
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

console.log('🧹 清理 dist 目录...\n');

if (fs.existsSync(distDir)) {
  try {
    // 递归删除目录
    fs.rmSync(distDir, { recursive: true, force: true });
    console.log('✅ dist 目录已清理');
  } catch (error) {
    console.error('❌ 清理失败:', error.message);
    process.exit(1);
  }
} else {
  console.log('ℹ️  dist 目录不存在，跳过清理');
}

console.log('');
