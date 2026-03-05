<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div
      class="bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_15px_rgba(0,229,255,0.1)] overflow-hidden flex flex-col w-72 transform origin-center transition-all"
      style="padding: 24px;"
    >
      <!-- 标题栏 -->
      <div class="border-b border-white/5 bg-gradient-to-r from-white/[0.05] to-transparent flex items-center gap-3" style="margin: -24px -24px 0 -24px; padding: 16px 24px;">
        <span class="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"></span>
        <span class="text-[#00E5FF] text-[11px] font-mono tracking-[0.2em] font-bold">SYS.SETTINGS</span>
      </div>

      <!-- 查看真面目 -->
      <button
        @click="$emit('showProfile')"
        class="group flex items-center gap-4 py-3.5 hover:bg-[#00E5FF]/10 transition-all duration-300 text-left w-full cursor-pointer"
        style="margin: 0 -24px; padding-left: 24px; padding-right: 24px;"
      >
        <div class="w-9 h-9 rounded-md bg-black/50 border border-white/5 flex items-center justify-center group-hover:border-[#00E5FF]/50 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all">
          <svg class="w-5 h-5 text-[#555555] group-hover:text-[#00E5FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-[#E0E0E0] text-[13px] group-hover:text-[#00E5FF] transition-colors font-medium tracking-wide">查看真面目</span>
          <span class="text-[#555555] text-[10px] font-mono tracking-widest group-hover:text-[#00E5FF]/60 uppercase">Profile Data</span>
        </div>
      </button>

      <!-- 检查更新 -->
      <button
        @click="$emit('checkUpdate')"
        class="group flex items-center gap-4 py-3.5 hover:bg-[#00E5FF]/10 transition-all duration-300 text-left w-full cursor-pointer border-t border-white/5"
        style="margin: 0 -24px; padding-left: 24px; padding-right: 24px;"
      >
        <div class="w-9 h-9 rounded-md bg-black/50 border border-white/5 flex items-center justify-center group-hover:border-[#00E5FF]/50 group-hover:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all">
          <svg class="w-5 h-5 text-[#555555] group-hover:text-[#00E5FF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-[#E0E0E0] text-[13px] group-hover:text-[#00E5FF] transition-colors font-medium tracking-wide">检查更新</span>
          <span class="text-[#555555] text-[10px] font-mono tracking-widest group-hover:text-[#00E5FF]/60 uppercase">Check Update</span>
        </div>
      </button>

      <!-- 断线跑路 -->
      <button
        @click="$emit('logout')"
        class="group flex items-center gap-4 py-3.5 hover:bg-[#FF3366]/10 transition-all duration-300 text-left w-full cursor-pointer border-t border-white/5"
        style="margin: 0 -24px; padding-left: 24px; padding-right: 24px;"
      >
        <div class="w-9 h-9 rounded-md bg-black/50 border border-white/5 flex items-center justify-center group-hover:border-[#FF3366]/50 group-hover:shadow-[0_0_10px_rgba(255,51,102,0.2)] transition-all">
          <svg class="w-5 h-5 text-[#FF3366]/60 group-hover:text-[#FF3366] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </div>
        <div class="flex flex-col">
          <span class="text-[#FF3366] text-[13px] group-hover:drop-shadow-[0_0_5px_rgba(255,51,102,0.8)] transition-all font-medium tracking-wide">断线跑路</span>
          <span class="text-[#FF3366]/50 text-[10px] font-mono tracking-widest uppercase">Disconnect</span>
        </div>
      </button>

      <!-- 关闭按钮 -->
      <div class="border-t border-white/5 flex justify-center" style="margin: 0 -24px -24px -24px; padding: 16px 24px;">
        <button
          @click="$emit('close')"
          class="text-[#555555] hover:text-[#E0E0E0] text-[11px] font-mono tracking-[0.2em] transition-colors"
        >
          [ 隐藏面板 ]
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'showProfile'): void
  (e: 'checkUpdate'): void
  (e: 'logout'): void
}>()
</script>
