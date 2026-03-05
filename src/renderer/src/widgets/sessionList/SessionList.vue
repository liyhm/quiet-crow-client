<template>
  <div class="w-72 bg-[#0A0A0C] border-r border-white/10 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-white/10 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- 霓虹指示灯 -->
        <div class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></div>
        <!-- 极客风微排版 -->
        <div class="flex items-baseline gap-1.5">
          <span class="text-[#555555] text-[11px] font-mono tracking-wider">[ 鸦口无言 ]</span>
          <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase">SESSIONS</span>
        </div>
      </div>
      <button
        @click="$emit('createGroup')"
        class="w-7 h-7 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 hover:bg-[#00E5FF]/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] flex items-center justify-center text-[#00E5FF] transition-all duration-300 group"
        title="建立鸦群分舵"
      >
        <svg class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
          />
        </svg>
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="p-4 border-b border-white/5 bg-[#0A0A0C]">
      <div class="flex items-center gap-3 group">
        <div class="flex-shrink-0 text-[#555555] group-focus-within:text-[#00E5FF] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜点不可告人的..."
          class="flex-1 bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#00E5FF]/40 focus:bg-black/80 transition-all text-[13px] placeholder-[#555555]"
        />
      </div>
    </div>

    <!-- 会话列表 -->
    <div class="flex-1 overflow-y-auto scrollbar-thin" style="padding: 4px 8px; scrollbar-gutter: stable;">
      <div
        v-for="session in filteredSessions"
        :key="session.id"
        @click="selectSession(session.id)"
        :class="[
          'flex items-center cursor-pointer rounded-lg',
          activeSessionId === session.id
            ? 'bg-[#151518]'
            : 'hover:bg-[#151518]/50'
        ]"
        style="padding: 12px 16px; margin: 2px 0; transition: background-color 0.2s ease;"
      >
        <!-- 头像/图标 -->
        <div
          class="relative w-10 h-10 rounded-lg bg-[#0A0A0C] border border-white/10 flex-shrink-0 overflow-hidden"
          :class="{ 'border-[#00E5FF]/30': activeSessionId === session.id }"
          style="margin-right: 16px;"
        >
          <!-- 群聊网络图标 -->
          <div
            v-if="session.type === 'GROUP'"
            class="w-full h-full flex items-center justify-center"
          >
            <svg
              class="w-5 h-5"
              :class="activeSessionId === session.id ? 'text-[#00E5FF]' : 'text-[#555555]'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="5" r="2" stroke-width="1.5" />
              <circle cx="6" cy="12" r="2" stroke-width="1.5" />
              <circle cx="18" cy="12" r="2" stroke-width="1.5" />
              <circle cx="12" cy="19" r="2" stroke-width="1.5" />
              <path stroke-linecap="round" stroke-width="1.5" d="M12 7v10M8 10l8 4M8 14l8-4" />
            </svg>
          </div>
          <!-- 私聊头像 -->
          <template v-else>
            <!-- 头像图片 -->
            <img
              v-if="session.avatar"
              :src="getAvatarUrl(session.avatar)"
              :alt="session.name"
              class="w-full h-full object-cover"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <!-- 首字母备用 -->
            <div
              v-if="!session.avatar"
              class="w-full h-full flex items-center justify-center font-bold text-sm"
              :class="activeSessionId === session.id ? 'text-[#00E5FF]' : 'text-[#555555]'"
            >
              {{ session.name ? session.name[0] : '?' }}
            </div>
          </template>
          
          <!-- 在线状态指示器（仅私聊显示） -->
          <span
            v-if="session.type === 'PRIVATE' && session.isOnline !== null && session.isOnline !== undefined"
            :class="[
              'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0A0A0C]',
              session.isOnline ? 'bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.8)]' : 'bg-[#555555]'
            ]"
            :title="session.isOnline ? '在线' : '离线'"
          />
          
          <!-- 未读红点 -->
          <span
            v-if="session.unreadCount > 0"
            class="absolute top-0 right-0 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-[#FF3366] text-white text-[9px] font-bold rounded-full shadow-[0_0_8px_rgba(255,51,102,0.8)]"
          >
            {{ session.unreadCount > 99 ? '99+' : session.unreadCount }}
          </span>
        </div>

        <!-- 信息 -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center mb-1">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span
                class="text-[14px] truncate font-medium"
                :class="activeSessionId === session.id ? 'text-[#00E5FF]' : 'text-[#E0E0E0]'"
              >
                {{ session.name }}
              </span>
              <!-- 群聊人数 -->
              <span
                v-if="session.type === 'GROUP' && session.memberCount"
                class="text-[10px] text-[#555555] font-mono flex-shrink-0"
              >
                ({{ session.memberCount }})
              </span>
            </div>
            <span
              class="text-[10px] font-mono ml-4 flex-shrink-0"
              :class="activeSessionId === session.id ? 'text-[#00E5FF]/70' : 'text-[#555555]'"
            >
              {{ formatTime(session.lastMessageTime) }}
            </span>
          </div>
          <div class="text-[12px] text-[#85858A] truncate">{{ session.lastMessage }}</div>
        </div>

        <!-- 删除按钮 -->
        <button
          @click.stop="handleDeleteSession(session.id)"
          class="opacity-0 hover:opacity-100 p-1.5 hover:bg-[#FF3366]/20 rounded transition-all flex-shrink-0 ml-2"
          title="删除会话"
        >
          <svg class="w-4 h-4 text-[#FF3366]" fill="currentColor" viewBox="0 0 16 16">
            <path
              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
            />
            <path
              fill-rule="evenodd"
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
            />
          </svg>
        </button>
      </div>
      <!-- 空状态 -->
      <div
        v-if="filteredSessions.length === 0"
        class="flex flex-col items-center justify-center h-full text-[#85858A] p-4"
      >
        <svg class="w-16 h-16 mb-2 opacity-30" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793V2z"
          />
        </svg>
        <p class="text-sm">一个会话都没有</p>
      </div>
    </div>
  </div>

  <!-- 删除会话确认弹窗 -->
  <ConfirmModal
    v-if="showDeleteConfirm"
    title="删除会话"
    message="确定要删除这个会话吗？删除后对方发新消息会重新出现。"
    type="danger"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />

  <!-- 错误提示弹窗 -->
  <AlertModal
    v-if="showErrorAlert"
    :title="errorTitle"
    :message="errorMessage"
    type="error"
    @close="showErrorAlert = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from '@/entities/session/model/useSessionStore'
import { API_CONFIG } from '@/shared/config/api'
import ConfirmModal from '@/widgets/confirmModal/ConfirmModal.vue'
import AlertModal from '@/widgets/alertModal/AlertModal.vue'

const emit = defineEmits<{
  (e: 'selectSession', sessionId: string): void
  (e: 'createGroup'): void
}>()

const sessionStore = useSessionStore()
const searchQuery = ref('')
const showDeleteConfirm = ref(false)
const pendingDeleteSessionId = ref<string | null>(null)
const showErrorAlert = ref(false)
const errorTitle = ref('错误')
const errorMessage = ref('')

const activeSessionId = computed(() => sessionStore.activeSessionId)

// 获取完整的头像 URL
const getAvatarUrl = (avatar: string): string => {
  if (!avatar) return ''
  // 如果已经是完整 URL，直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }
  // 否则拼接 BASE_URL
  return `${API_CONFIG.BASE_URL}${avatar.startsWith('/') ? '' : '/'}${avatar}`
}

const filteredSessions = computed(() => {
  if (!searchQuery.value) return sessionStore.sortedSessions

  const query = searchQuery.value.toLowerCase()
  return sessionStore.sortedSessions.filter(
    (s) => 
      (s.name && s.name.toLowerCase().includes(query)) || 
      (s.lastMessage && s.lastMessage.toLowerCase().includes(query))
  )
})

const selectSession = (sessionId: string) => {
  emit('selectSession', sessionId)
}

const handleDeleteSession = async (sessionId: string) => {
  pendingDeleteSessionId.value = sessionId
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!pendingDeleteSessionId.value) return
  
  console.log('🗑️ 删除会话:', pendingDeleteSessionId.value)
  const result = await sessionStore.deleteSession(pendingDeleteSessionId.value)
  
  if (result.success) {
    console.log('✅ 会话已删除')
  } else {
    console.error('❌ 删除会话失败:', result.error)
    errorTitle.value = '删除失败'
    errorMessage.value = '删除会话失败: ' + result.error
    showErrorAlert.value = true
  }
  
  showDeleteConfirm.value = false
  pendingDeleteSessionId.value = null
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  pendingDeleteSessionId.value = null
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000)
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>
