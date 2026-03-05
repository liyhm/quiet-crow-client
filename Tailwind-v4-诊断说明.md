# Tailwind CSS v4 诊断说明

## 发现的问题

项目使用的是 **Tailwind CSS v4** (`@tailwindcss/postcss": "^4.2.1"`)，而不是 v3。

在 v4 中：
- ❌ 不再使用 `tailwind.config.js` 的 `theme.extend.colors`
- ✅ 使用 CSS 中的 `@theme` 指令定义自定义颜色

## 已修复

### 1. 在 `src/renderer/src/app/styles/global.css` 中添加了 `@theme` 块

```css
@import 'tailwindcss';

/* Silent Crow - 自定义颜色变量 */
@theme {
  --color-bg-void: #0A0A0C;
  --color-bg-surface: #151518;
  --color-bg-input: rgba(255, 255, 255, 0.03);
  --color-bg-input-focus: rgba(255, 255, 255, 0.06);
  --color-text-primary: #E0E0E0;
  --color-text-muted: #85858A;
  --color-neon-cyan: #00E5FF;
  --color-alert-red: #FF3366;
  --color-bubble-other: #1E1E24;
}
```

### 2. 登录页面使用的类名

```html
<input class="bg-bg-input focus:bg-bg-input-focus text-text-primary border-neon-cyan/60" />
```

## 如何验证

### 步骤1：重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 步骤2：打开浏览器开发者工具
1. 按 `F12` 打开开发者工具
2. 切换到 `Elements` 标签
3. 选中输入框元素
4. 查看 `Computed` 样式

### 步骤3：检查背景颜色
应该看到：
```css
background-color: rgba(255, 255, 255, 0.03);
```

而不是：
```css
background-color: #0A0A0C; /* 死黑色 */
```

## 如果还是不行

### 方法1：清除所有缓存
```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 启动
npm run dev
```

### 方法2：检查浏览器控制台
打开浏览器控制台（F12），查看是否有 CSS 错误：
- 红色错误信息
- Tailwind 相关的警告

### 方法3：手动检查编译后的 CSS
1. 打开浏览器开发者工具
2. 切换到 `Sources` 标签
3. 找到编译后的 CSS 文件
4. 搜索 `bg-bg-input`
5. 确认是否有对应的 CSS 规则

## Tailwind v4 的关键变化

### v3 方式（旧）
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-input': 'rgba(255, 255, 255, 0.03)'
      }
    }
  }
}
```

### v4 方式（新）
```css
/* global.css */
@theme {
  --color-bg-input: rgba(255, 255, 255, 0.03);
}
```

## 预期效果

重启后，输入框应该：
1. ✅ 背景是透明的白色（3%透明度）
2. ✅ 可以隐隐看到底部的青色环境光
3. ✅ 不再是"死黑砖头"
4. ✅ 聚焦时背景稍微变亮（6%透明度）
5. ✅ 左侧图标在聚焦时变成霓虹青色并发光

## 故障排查清单

- [ ] 已修改 `global.css` 添加 `@theme` 块
- [ ] 已重启开发服务器
- [ ] 已硬刷新浏览器（Ctrl+Shift+R）
- [ ] 已检查浏览器控制台无错误
- [ ] 已检查元素的 Computed 样式
- [ ] 如果还不行，尝试清除 node_modules 重新安装
