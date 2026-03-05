/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Silent Crow - 赛博朋克暗黑配色
        'bg-void': '#0A0A0C',        // 深渊底色
        'bg-surface': '#151518',      // 毛玻璃面板
        'bg-input': 'rgba(255, 255, 255, 0.03)',      // 输入框背景（3%白色）
        'bg-input-focus': 'rgba(255, 255, 255, 0.06)', // 输入框聚焦背景（6%白色）
        'text-primary': '#E0E0E0',    // 主文字
        'text-muted': '#85858A',      // 副文字
        'neon-cyan': '#00E5FF',       // 霓虹青色
        'alert-red': '#FF3366',       // 警告红
        'bubble-other': '#1E1E24',    // 对方气泡
      },
      dropShadow: {
        'neon': '0 0 8px rgba(0, 229, 255, 0.6)',
        'neon-strong': '0 0 16px rgba(0, 229, 255, 0.8)',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    }
  },
  plugins: []
}
