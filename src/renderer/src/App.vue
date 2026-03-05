<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 3 次连击 Ctrl 键呼出开发者工具
let ctrlPressCount = 0
let ctrlPressTimer: number | null = null

const handleKeyDown = (event: KeyboardEvent) => {
  // 检测 Ctrl 键（Windows/Linux）或 Command 键（macOS）
  if (event.key === 'Control' || event.key === 'Meta') {
    ctrlPressCount++
    
    // 清除之前的计时器
    if (ctrlPressTimer) {
      clearTimeout(ctrlPressTimer)
    }
    
    // 如果在 800ms 内按了 3 次 Ctrl，打开开发者工具
    if (ctrlPressCount === 3) {
      console.log('🔧 3 次连击 Ctrl 检测到，打开开发者工具')
      window.api.devtools.toggle()
      ctrlPressCount = 0
    }
    
    // 800ms 后重置计数
    ctrlPressTimer = window.setTimeout(() => {
      ctrlPressCount = 0
      ctrlPressTimer = null
    }, 800)
  }
}

onMounted(() => {
  // 添加全局键盘监听
  window.addEventListener('keydown', handleKeyDown)
  console.log('✅ 3 次连击 Ctrl 快捷键已启用')
})

onUnmounted(() => {
  // 清理监听器
  window.removeEventListener('keydown', handleKeyDown)
  if (ctrlPressTimer) {
    clearTimeout(ctrlPressTimer)
  }
})
</script>
