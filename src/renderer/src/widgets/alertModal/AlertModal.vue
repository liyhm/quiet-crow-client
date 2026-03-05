<template>
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-lg transition-all"
    @click.self="handleClose"
  >
    <div
      class="relative w-[380px] bg-[#0A0A0C]/98 backdrop-blur-2xl border border-[#00E5FF]/30 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1),inset_0_0_30px_rgba(0,229,255,0.08)] overflow-hidden"
      style="padding: 28px"
    >
      <!-- 顶部光带 -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent opacity-80"
        style="margin: -28px 0 0 0"
      ></div>
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[100px] bg-[#00E5FF]/15 blur-[40px] pointer-events-none"
      ></div>

      <!-- 图标 -->
      <div class="flex justify-center mb-5 relative z-10">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center relative"
          :class="
            type === 'success'
              ? 'bg-[#00E5FF]/10 border-2 border-[#00E5FF]/40'
              : type === 'error'
              ? 'bg-red-500/10 border-2 border-red-500/40'
              : 'bg-[#00E5FF]/10 border-2 border-[#00E5FF]/40'
          "
        >
          <div
            class="absolute inset-0 rounded-full blur-xl animate-pulse"
            :class="
              type === 'success'
                ? 'bg-[#00E5FF]/20'
                : type === 'error'
                ? 'bg-red-500/20'
                : 'bg-[#00E5FF]/20'
            "
          ></div>
          <!-- Success Icon -->
          <svg
            v-if="type === 'success'"
            class="w-8 h-8 text-[#00E5FF] relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <!-- Error Icon -->
          <svg
            v-else-if="type === 'error'"
            class="w-8 h-8 text-red-400 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <!-- Info Icon -->
          <svg
            v-else
            class="w-8 h-8 text-[#00E5FF] relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>

      <!-- 标题 -->
      <div v-if="title" class="text-center mb-3 relative z-10">
        <h3 class="text-[#E0E0E0] text-[16px] font-bold tracking-wide">
          {{ title }}
        </h3>
      </div>

      <!-- 消息内容 -->
      <div class="text-center mb-8 relative z-10">
        <p class="text-[#85858A] text-[13px] leading-relaxed whitespace-pre-line">
          {{ message }}
        </p>
      </div>

      <!-- 确定按钮 -->
      <div class="relative z-10">
        <button
          class="w-full py-3.5 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-1"
          :class="
            type === 'error'
              ? 'bg-red-500/15 border border-red-500/50 text-red-400 hover:bg-red-500/25 hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]'
              : 'bg-[#00E5FF]/15 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/25 hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]'
          "
          @click="handleClose"
        >
          <span class="text-[13px] font-bold tracking-[0.15em]">确定</span>
          <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">OK</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  message: string
  type?: 'info' | 'success' | 'error'
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}
</script>
