<template>
  <div
    class="h-12 flex items-center justify-between pl-4 bg-[#050505] border-b border-white/5 select-none z-50 relative overflow-hidden"
    style="-webkit-app-region: drag"
  >
    <!-- 跑马灯区域 -->
    <div class="flex-1 h-full flex items-center overflow-hidden mask-fade-edges mr-10 relative">
      <!-- 在线状态 -->
      <div
        v-if="isConnected"
        class="flex items-center animate-marquee whitespace-nowrap text-[#00E5FF] text-[12px] font-mono tracking-widest opacity-80"
      >
        <span class="mx-4 flex items-center">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse mr-2 shadow-[0_0_8px_#00E5FF]"></span>
          [ 链路正常 ] 🦅 正在监听鸦群广播...
        </span>
        <span class="mx-4 flex items-center">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse mr-2 shadow-[0_0_8px_#00E5FF]"></span>
          [ 链路正常 ] 🦅 正在监听鸦群广播...
        </span>
      </div>

      <!-- 离线状态 -->
      <div
        v-else
        class="flex items-center animate-marquee whitespace-nowrap text-[#FF3366] text-[12px] font-mono tracking-widest font-bold"
      >
        <span class="mx-4 flex items-center">
          <span class="w-2 h-2 rounded-sm bg-[#FF3366] animate-ping mr-2 shadow-[0_0_8px_#FF3366]"></span>
          [ 致命警告 ] 物理链路已断开，无法呼叫鸦群！
        </span>
        <span class="mx-4 flex items-center">
          <span class="w-2 h-2 rounded-sm bg-[#FF3366] animate-ping mr-2 shadow-[0_0_8px_#FF3366]"></span>
          [ 致命警告 ] 物理链路已断开，无法呼叫鸦群！
        </span>
      </div>
    </div>

    <!-- 窗口控制按钮 -->
    <div class="absolute right-6 flex items-center gap-3 text-[#555555]" style="-webkit-app-region: no-drag">
      <button
        @click="$emit('minimize')"
        class="hover:text-white transition-colors"
        title="最小化"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor">
          <line x1="1" y1="6" x2="11" y2="6" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
      <button
        @click="$emit('maximize')"
        class="hover:text-white transition-colors"
        title="最大化"
      >
        <svg class="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor">
          <rect x="1.5" y="1.5" width="9" height="9" stroke-width="1.5" rx="1" />
        </svg>
      </button>
      <button
        @click="$emit('close')"
        class="hover:text-[#FF3366] transition-colors"
        title="关闭"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor">
          <line x1="1" y1="1" x2="11" y2="11" stroke-width="1.5" stroke-linecap="round" />
          <line x1="11" y1="1" x2="1" y2="11" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
}>()

defineEmits<{
  (e: 'minimize'): void
  (e: 'maximize'): void
  (e: 'close'): void
}>()

// 从 title 中提取连接状态
const isConnected = computed(() => {
  return props.title.includes('已连接')
})
</script>
