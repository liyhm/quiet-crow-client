<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-[440px] bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-[24px] shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,229,255,0.05)] overflow-hidden flex flex-col"
      style="padding: 24px;"
    >
      <!-- 顶部光带 -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF]/80 to-transparent opacity-70"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[120px] bg-[#00E5FF]/10 blur-[50px] pointer-events-none"></div>

      <!-- 标题栏 -->
      <div class="border-b border-white/5 bg-white/[0.02] flex items-center justify-between z-10 relative" style="margin: -24px -24px 0 -24px; padding: 24px 32px 20px 32px;">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-sm bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"></div>
          <span class="text-[#00E5FF] text-[13px] font-mono tracking-[0.2em] font-bold">PROFILE_DATA</span>
        </div>
        <button
          @click="$emit('close')"
          class="text-[#555555] hover:text-[#FF3366] hover:rotate-90 transition-all duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 头像区域 -->
      <div class="flex flex-col items-center pt-8 pb-6 relative z-10">
        <div class="relative group cursor-pointer" @click="triggerFileInput">
          <!-- Hover 外框 -->
          <div class="absolute -inset-2 border border-[#00E5FF]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 group-hover:scale-100"></div>
          <div class="absolute inset-0 bg-[#00E5FF]/10 blur-xl rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <!-- 头像框 -->
          <div class="relative w-24 h-24 rounded-2xl bg-black border border-[#00E5FF]/40 flex items-center justify-center overflow-hidden shadow-[inset_0_0_20px_rgba(0,229,255,0.15)] group-hover:border-[#00E5FF] transition-colors">
            <img
              v-if="user?.avatar"
              :src="user.avatar"
              alt="头像"
              class="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
            />
            <span
              v-else
              class="text-[#00E5FF] text-4xl font-bold font-mono group-hover:scale-110 transition-transform duration-300"
            >
              {{ userInitial }}
            </span>
            <!-- 扫描线 -->
            <div class="absolute top-0 left-0 w-full h-[2px] bg-[#00E5FF]/50 shadow-[0_0_8px_#00E5FF] animate-[scan_2s_ease-in-out_infinite]"></div>
            
            <!-- Hover 提示 -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg class="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <!-- 隐藏的文件上传 -->
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="$emit('uploadAvatar', $event)"
          :disabled="uploading"
        />
        
        <span
          v-if="uploading"
          class="text-[#00E5FF] text-[12px] font-mono tracking-widest mt-5 font-bold animate-pulse"
        >
          >_ 上传中...
        </span>
        <div
          v-else
          @click="triggerFileInput"
          class="mt-5 text-[#00E5FF] text-[11px] font-mono tracking-[0.2em] cursor-pointer hover:text-[#00E5FF] transition-all duration-300 flex items-center gap-2 group"
        >
          <span class="opacity-70 group-hover:opacity-100">>_</span>
          <span class="group-hover:tracking-[0.25em] transition-all">换张皮</span>
          <span class="text-[9px] opacity-50 group-hover:opacity-70">(UPLOAD)</span>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="pb-4 space-y-5 z-10">
        <!-- 鸦群账号（不可修改） -->
        <div>
          <label class="flex items-center gap-2 text-[#00E5FF] text-[12px] font-mono tracking-widest mb-3 font-bold">
            <span class="text-[#00E5FF]">>></span> 鸦群账号
          </label>
          <div class="w-full bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-4 py-3.5 rounded-xl font-mono text-[15px]">
            {{ user?.username }}
          </div>
        </div>

        <!-- 鸦友代号（可编辑） -->
        <div>
          <label class="flex items-center gap-2 text-[#00E5FF] text-[12px] font-mono tracking-widest mb-3 font-bold">
            <span class="text-[#00E5FF]">>></span> 鸦友代号
          </label>
          <input
            :value="displayName"
            @input="$emit('update:displayName', ($event.target as HTMLInputElement).value)"
            type="text"
            class="w-full bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 transition-all font-mono text-[15px]"
            placeholder="你想叫什么？"
          />
        </div>

        <!-- 密保手机（可编辑） -->
        <div>
          <label class="flex items-center gap-2 text-[#00E5FF] text-[12px] font-mono tracking-widest mb-3 font-bold">
            <span class="text-[#00E5FF]">>></span> 密保手机
          </label>
          <input
            :value="phone"
            @input="$emit('update:phone', ($event.target as HTMLInputElement).value)"
            type="tel"
            class="w-full bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 transition-all font-mono text-[15px] placeholder-[#555555]"
            placeholder="未绑定"
          />
        </div>

        <!-- 核心加密 ID -->
        <div>
          <label class="flex items-center gap-2 text-[#00E5FF] text-[12px] font-mono tracking-widest mb-3 font-bold">
            <span class="text-[#00E5FF]">>></span> 核心加密 ID <span class="text-[#555555] text-[10px] ml-1">(已加密)</span>
          </label>
          <div class="w-full bg-[#050505] border border-white/5 px-4 py-3.5 rounded-xl text-[#888888] font-mono text-[13px] break-all select-all">
            {{ user?.id }}
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-4 pt-6 mt-4 border-t border-white/5">
          <button
            @click="$emit('save')"
            :disabled="saving"
            class="flex-1 py-3.5 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 group flex flex-col items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span class="text-[13px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform">
              {{ saving ? '保存中...' : '保存篡改' }}
            </span>
            <span class="text-[9px] font-mono opacity-60 tracking-[0.2em]">SYS.SAVE</span>
          </button>
          <button
            @click="$emit('logout')"
            class="flex-1 py-3.5 bg-[#FF3366]/10 border border-[#FF3366]/40 text-[#FF3366] rounded-xl hover:bg-[#FF3366]/20 hover:border-[#FF3366] hover:shadow-[0_0_20px_rgba(255,51,102,0.3)] transition-all duration-300 group flex flex-col items-center justify-center gap-1"
          >
            <span class="text-[13px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform">断线跑路</span>
            <span class="text-[9px] font-mono opacity-60 tracking-[0.2em]">LOGOUT</span>
          </button>
        </div>
      </div>

      <!-- 底部关闭按钮 -->
      <div class="w-full flex justify-center pt-2 relative z-10" style="margin: 0 -24px -24px -24px; padding-bottom: 24px;">
        <button
          @click="$emit('close')"
          class="text-[#555555] hover:text-white text-xs tracking-[0.2em] transition-colors font-mono"
        >
          [ 关闭面板 ]
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface User {
  id: string
  username: string
  avatar?: string
  displayName?: string
  phone?: string
}

const props = defineProps<{
  show: boolean
  user: User | null
  displayName: string
  phone: string
  uploading?: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'logout'): void
  (e: 'uploadAvatar', event: Event): void
  (e: 'update:displayName', value: string): void
  (e: 'update:phone', value: string): void
}>()

const fileInputRef = ref<HTMLInputElement>()

const userInitial = computed(() => {
  return props.user?.displayName?.[0] || props.user?.username?.[0] || 'U'
})

const triggerFileInput = () => {
  if (!props.uploading) {
    fileInputRef.value?.click()
  }
}
</script>
