<template>
  <div class="w-20 bg-[#0A0A0C] border-r border-white/5 flex flex-col items-center py-6 gap-6">
    <!-- 头像 - 折纸机甲乌鸦或用户头像 -->
    <div class="w-full flex justify-center">
      <div
        @click="showProfile"
        class="w-12 h-12 rounded-xl border-2 border-white/10 hover:border-[#00E5FF]/50 overflow-hidden flex items-center justify-center bg-[#0A0A0C] cursor-pointer transition-all duration-300 group relative shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        :title="currentUser?.displayName"
      >
        <!-- 用户头像 -->
        <img
          v-if="currentUser?.avatar"
          :src="currentUser.avatar"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt="Avatar"
        />
        <!-- 默认乌鸦 Logo -->
        <svg
          v-else
          class="w-7 h-7 text-[#00E5FF] group-hover:scale-110 transition-transform duration-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
        >
          <path
            d="M14 56 L24 16 L46 12 L62 28 L40 32 L52 42 L28 56 Z"
            fill="currentColor"
            opacity="0.15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <circle
            cx="38"
            cy="24"
            r="2.5"
            fill="currentColor"
            class="animate-pulse drop-shadow-[0_0_5px_rgba(0,229,255,1)]"
          />
        </svg>
      </div>
    </div>

    <div class="flex-1 flex flex-col gap-8 mt-2">
      <!-- 消息图标 -->
      <button
        @click="switchTab('messages')"
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center relative transition-all duration-300',
          activeTab === 'messages'
            ? 'bg-[#00E5FF]/10 text-[#00E5FF] shadow-[inset_0_0_12px_rgba(0,229,255,0.2),0_0_15px_rgba(0,229,255,0.15)] border-2 border-[#00E5FF]/40'
            : 'text-[#555555] hover:text-[#E0E0E0] hover:bg-white/5 border-2 border-transparent hover:border-white/10'
        ]"
        title="消息"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.221-1.147-2.164-2.364-2.28a49.19 49.19 0 0 0-9.67 0C5.397 4.473 4.25 5.416 4.25 6.637v8.326c0 1.22 1.147 2.164 2.364 2.28 1.3.123 2.61.205 3.927.246l3.459 3.46v-3.321Z" />
        </svg>
        <!-- 未读数 -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-2 rounded-full bg-[#FF3366] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(255,51,102,0.8),0_0_20px_rgba(255,51,102,0.4)] border-[3px] border-[#0A0A0C]"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <!-- 联系人图标 -->
      <button
        @click="switchTab('contacts')"
        :class="[
          'w-12 h-12 rounded-xl flex items-center justify-center relative transition-all duration-300',
          activeTab === 'contacts'
            ? 'bg-[#00E5FF]/10 text-[#00E5FF] shadow-[inset_0_0_12px_rgba(0,229,255,0.2),0_0_15px_rgba(0,229,255,0.15)] border-2 border-[#00E5FF]/40'
            : 'text-[#555555] hover:text-[#E0E0E0] hover:bg-white/5 border-2 border-transparent hover:border-white/10'
        ]"
        title="联系人"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
        <!-- 好友请求数 -->
        <span
          v-if="pendingRequestCount > 0"
          class="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-2 rounded-full bg-[#FF3366] text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(255,51,102,0.8),0_0_20px_rgba(255,51,102,0.4)] border-[3px] border-[#0A0A0C]"
        >
          {{ pendingRequestCount > 99 ? '99+' : pendingRequestCount }}
        </span>
      </button>
    </div>

    <!-- 设置图标 -->
    <button
      @click="showSettings"
      class="w-12 h-12 rounded-xl flex items-center justify-center text-[#555555] hover:text-[#E0E0E0] hover:bg-white/5 transition-all duration-300 border-2 border-transparent hover:border-white/10"
      title="设置"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { useSessionStore } from '@/entities/session/model/useSessionStore'
import { useContactStore } from '@/entities/contact/model/useContactStore'

const emit = defineEmits<{
  (e: 'switchTab', tab: 'messages' | 'contacts'): void
  (e: 'showProfile'): void
  (e: 'showSettings'): void
}>()

defineProps<{
  activeTab: 'messages' | 'contacts'
}>()

const authStore = useAuthStore()
const sessionStore = useSessionStore()
const contactStore = useContactStore()

const currentUser = computed(() => authStore.currentUser)
const unreadCount = computed(() => {
  return sessionStore.sessions.reduce((sum, s) => sum + s.unreadCount, 0)
})
const pendingRequestCount = computed(() => contactStore.pendingRequests.length)

const switchTab = (tab: 'messages' | 'contacts') => {
  emit('switchTab', tab)
}

const showProfile = () => {
  emit('showProfile')
}

const showSettings = () => {
  emit('showSettings')
}
</script>
