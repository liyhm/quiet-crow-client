// 生成应用图标脚本
const fs = require('fs');
const { createCanvas } = require('canvas');

// 创建 1024x1024 的画布
const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// 背景 - 深色渐变
const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
gradient.addColorStop(0, '#1E1E28');
gradient.addColorStop(0.5, '#0A0A0F');
gradient.addColorStop(1, '#050505');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, size, size);

// 缩放比例（SVG viewBox 是 64x64，我们要放大到 1024x1024）
const scale = size / 64;
ctx.scale(scale, scale);

// 绘制乌鸦主体
ctx.fillStyle = '#0A0A0C';
ctx.strokeStyle = '#00E5FF';
ctx.lineWidth = 1.5;
ctx.lineJoin = 'round';

ctx.beginPath();
ctx.moveTo(14, 56);
ctx.lineTo(24, 16);
ctx.lineTo(46, 12);
ctx.lineTo(62, 28);
ctx.lineTo(40, 32);
ctx.lineTo(52, 42);
ctx.lineTo(28, 56);
ctx.closePath();
ctx.fill();
ctx.stroke();

// 绘制眼睛（发光圆圈）
ctx.fillStyle = '#00E5FF';
ctx.shadowColor = '#00E5FF';
ctx.shadowBlur = 10;
ctx.beginPath();
ctx.arc(38, 24, 2.5, 0, Math.PI * 2);
ctx.fill();

// 重置阴影
ctx.shadowBlur = 0;

// 绘制装饰线条
ctx.strokeStyle = '#00E5FF';
ctx.lineWidth = 1;
ctx.globalAlpha = 0.5;
ctx.beginPath();
ctx.moveTo(22, 40);
ctx.lineTo(32, 38);
ctx.stroke();

ctx.globalAlpha = 0.3;
ctx.beginPath();
ctx.moveTo(24, 28);
ctx.lineTo(34, 28);
ctx.stroke();

// 保存为 PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('resources/icon.png', buffer);

console.log('✓ 图标已生成：resources/icon.png');
console.log('✓ 尺寸：1024x1024');
console.log('✓ 现在可以重新打包了：npm run build:win');
