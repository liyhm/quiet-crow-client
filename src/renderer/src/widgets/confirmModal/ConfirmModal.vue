<template>
  <div
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-lg transition-all"
    @click.self="handleCancel"
  >
    <div
      class="relative w-[400px] bg-[#0A0A0C]/98 backdrop-blur-2xl border border-[#00E5FF]/30 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,1),inset_0_0_30px_rgba(0,229,255,0.08)] overflow-hidden"
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

      <!-- 警告图标 -->
      <div class="flex justify-center mb-5 relative z-10">
        <div
          class="w-16 h-16 rounded-full bg-[#00E5FF]/10 border-2 border-[#00E5FF]/40 flex items-center justify-center relative"
        >
          <div
            class="absolute inset-0 rounded-full bg-[#00E5FF]/20 blur-xl animate-pulse"
          ></div>
          <svg
            class="w-8 h-8 text-[#00E5FF] relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <!-- 标题 -->
      <div class="text-center mb-3 relative z-10">
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

      <!-- 按钮组 -->
      <div class="flex gap-3 relative z-10">
        <button
          class="flex-1 py-3.5 bg-white/5 border border-white/10 text-[#85858A] rounded-xl hover:bg-white/10 hover:text-[#E0E0E0] hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-1"
          @click="handleCancel"
        >
          <span class="text-[13px] font-bold tracking-[0.15em]">取消</span>
          <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">Cancel</span>
        </button>
        <button
          class="flex-1 py-3.5 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-1"
          :class="
            type === 'danger'
              ? 'bg-red-500/15 border border-red-500/50 text-red-400 hover:bg-red-500/25 hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]'
              : 'bg-[#00E5FF]/15 border border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/25 hover:border-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]'
          "
          @click="handleConfirm"
        >
          <span class="text-[13px] font-bold tracking-[0.15em]">{{ confirmText }}</span>
          <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">Confirm</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmText?: string
  type?: 'normal' | 'danger'
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
