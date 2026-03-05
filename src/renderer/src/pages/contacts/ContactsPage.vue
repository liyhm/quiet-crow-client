<template>
  <div class="w-72 bg-[#0A0A0C] border-r border-white/10 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-white/10 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- 霓虹指示灯 -->
        <div class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)] animate-pulse"></div>
        <!-- 极客风微排版 -->
        <div class="flex items-baseline gap-1.5">
          <span class="text-[#555555] text-[11px] font-mono tracking-wider">[ 鸦群节点 ]</span>
          <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase">NODES</span>
        </div>
      </div>
      <button
        @click="showAddFriend = true"
        class="w-7 h-7 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 hover:bg-[#00E5FF]/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] flex items-center justify-center text-[#00E5FF] transition-all duration-300 group"
        title="添加好友"
      >
        <svg class="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
          />
        </svg>
      </button>
    </div>

    <!-- Friend Requests -->
    <div v-if="pendingRequests.length > 0" class="mx-4 mb-3 flex flex-col gap-1">
      <div 
        class="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-[#00E5FF]/15 to-transparent border border-[#00E5FF]/30 rounded-lg cursor-pointer hover:bg-[#00E5FF]/20 transition-all duration-300 shadow-[0_0_10px_rgba(0,229,255,0.1)]"
        @click="showRequests = !showRequests"
      >
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-ping shadow-[0_0_5px_#00E5FF]"></span>
          <span class="text-[#00E5FF] text-[11px] font-mono tracking-widest font-bold">>> 拦截到未知握手请求 ({{ pendingRequests.length }})</span>
        </div>
        <svg 
          class="w-4 h-4 text-[#00E5FF] transform transition-transform duration-300" 
          :class="{ 'rotate-180': showRequests }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      <!-- Requests List -->
      <div v-if="showRequests" class="flex flex-col gap-2">
        <div
          v-for="request in pendingRequests"
          :key="request.requestId"
          class="relative bg-[#050505] border border-[#00E5FF]/20 rounded-lg p-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          <div class="absolute top-0 right-0 w-16 h-16 bg-[#00E5FF]/5 blur-xl rounded-full pointer-events-none"></div>
          
          <div class="flex items-center gap-3 relative z-10 mb-3">
            <div class="w-10 h-10 bg-[#151518] border border-[#00E5FF]/30 rounded-lg flex items-center justify-center text-[#00E5FF] font-bold font-mono shadow-[0_0_8px_rgba(0,229,255,0.15)]">
              {{ request.fromShowName?.[0] || request.fromUsername?.[0] || 'I' }}
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <span class="text-[#E0E0E0] text-[13px] font-medium tracking-wider truncate">{{ request.fromShowName || request.fromUsername }}</span>
              <span class="text-[#555555] text-[10px] font-mono mt-0.5 truncate">ID: @{{ request.fromUsername }}</span>
            </div>
          </div>

          <div v-if="request.requestMessage" class="text-[#85858A] text-[12px] mb-3 relative z-10 leading-relaxed">
            {{ request.requestMessage }}
          </div>

          <div class="flex gap-2 relative z-10">
            <button
              @click="handleAcceptRequest(request.requestId)"
              class="flex-1 py-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-md hover:bg-[#00E5FF]/20 hover:shadow-[0_0_12px_rgba(0,229,255,0.25)] transition-all flex flex-col items-center justify-center group"
            >
              <span class="text-[12px] font-bold tracking-widest group-hover:scale-105 transition-transform">允许接入</span>
              <span class="text-[8px] font-mono opacity-60 tracking-[0.2em] mt-0.5">ACCEPT</span>
            </button>
            <button
              @click="handleRejectRequest(request.requestId)"
              class="flex-1 py-1.5 bg-black/60 border border-white/10 text-[#85858A] rounded-md hover:bg-[#FF3366]/10 hover:border-[#FF3366]/40 hover:text-[#FF3366] transition-all flex flex-col items-center justify-center group"
            >
              <span class="text-[12px] font-bold tracking-widest group-hover:scale-105 transition-transform">直接抹杀</span>
              <span class="text-[8px] font-mono opacity-60 tracking-[0.2em] mt-0.5">DROP</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="p-4">
      <div class="relative flex items-center gap-3 group">
        <div class="flex-shrink-0 w-4 h-4 flex items-center justify-center text-[#555555] group-focus-within:text-[#00E5FF] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜点不可告人的..."
          class="flex-1 bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-3 py-2 rounded-xl focus:outline-none focus:border-[#00E5FF]/40 focus:bg-black/80 transition-all text-[13px] tracking-wider placeholder-[#555555]"
        />
      </div>
    </div>

    <!-- Contacts List -->
    <div class="flex-1 overflow-y-auto scrollbar-thin">
      <div
        v-for="contact in filteredContacts"
        :key="contact.userId"
        @click="selectContact(contact)"
        class="hover:bg-[#151518]/50 cursor-pointer transition-colors"
        style="padding: 8px 12px; margin: 2px 0;"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="relative w-9 h-9 rounded-lg bg-[#0A0A0C] border border-white/10 flex-shrink-0 overflow-hidden"
          >
            <!-- 头像图片 -->
            <img
              v-if="contact.avatar"
              :src="getAvatarUrl(contact.avatar)"
              :alt="contact.displayName"
              class="w-full h-full object-cover"
              @error="(e) => (e.target as HTMLImageElement).style.display = 'none'"
            />
            <!-- 首字母备用 -->
            <div
              v-if="!contact.avatar"
              class="w-full h-full flex items-center justify-center text-[#555555] font-bold text-xs"
            >
              {{ contact.displayName[0] }}
            </div>
            <!-- 在线状态指示器 -->
            <span
              v-if="contact.isOnline !== undefined"
              :class="[
                'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-[#0A0A0C]',
                contact.isOnline ? 'bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.8)]' : 'bg-[#555555]'
              ]"
              :title="contact.isOnline ? '在线' : '离线'"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-[13px] truncate text-[#E0E0E0]">{{ contact.displayName }}</div>
            <div 
              :class="[
                'text-[11px] truncate',
                contact.isOnline ? 'text-[#00E5FF]/70' : 'text-[#85858A]'
              ]"
            >
              {{ contact.isOnline ? '在线' : (contact.statusMessage || '离线') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State - 全息雷达涟漪风格 -->
      <div
        v-if="filteredContacts.length === 0 && !loading"
        class="w-full h-full flex flex-col items-center justify-center select-none opacity-90"
        style="margin-top: -120px"
      >
        <!-- 全息雷达涟漪动画 -->
        <div class="relative w-40 h-40 flex items-center justify-center mb-10">
          <!-- 外层涟漪 - 最大范围 -->
          <div
            class="absolute inset-0 rounded-full border border-[#00E5FF]/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"
          ></div>
          <!-- 中层涟漪 - 延迟 1 秒 -->
          <div
            class="absolute inset-4 rounded-full border border-[#00E5FF]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]"
            style="animation-delay: 1s"
          ></div>
          <!-- 内层静态圆环 -->
          <div class="absolute inset-8 rounded-full border border-[#00E5FF]/5"></div>

          <!-- 雷达核心 -->
          <div
            class="relative w-20 h-20 bg-[#0A0A0C] border border-[#00E5FF]/40 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.15)] z-10 hover:border-[#00E5FF] transition-colors duration-300"
          >
            <!-- WiFi 信号图标 -->
            <svg
              class="w-10 h-10 text-[#00E5FF]/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12 18.75h.007v.008H12v-.008z"
              ></path>
            </svg>
          </div>
        </div>

        <!-- 状态标签 - 青色待机 -->
        <span
          class="text-[#00E5FF] text-[11px] font-mono tracking-[0.15em] bg-[#00E5FF]/10 px-3 py-1 rounded-sm border border-[#00E5FF]/20 mb-3"
        >
          >> 状态：本地网络静默
        </span>

        <!-- 嘲讽文案 -->
        <span class="text-[#555555] text-[13px] tracking-widest mt-1 mb-12">
          周围连个活着的鸦友都没有。
        </span>

        <!-- 双层按钮 - 带流光效果 -->
        <button
          @click="showAddFriend = true"
          class="relative rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/80 overflow-hidden group hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300"
          style="padding: 8px 24px"
        >
          <!-- 流光动画层 -->
          <div
            class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#00E5FF]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"
          ></div>

          <!-- 按钮文字 -->
          <div class="relative flex flex-col items-center" style="gap: 2px">
            <span
              class="text-[13px] font-bold tracking-[0.2em] group-hover:scale-105 transition-transform z-10 text-[#00E5FF]"
            >
              开启主动嗅探
            </span>
            <span class="text-[9px] font-mono opacity-50 tracking-[0.25em] z-10 text-[#00E5FF]/70">
              [ 发送广播信号 ]
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Add Friend Modal -->
    <div
      v-if="showAddFriend"
      class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-8"
      @click.self="showAddFriend = false"
    >
      <div
        class="relative w-[460px] max-h-[85vh] bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,229,255,0.05)] overflow-hidden flex flex-col"
        style="padding: 24px"
      >
        <!-- 顶部光带 -->
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF]/80 to-transparent opacity-70"
          style="margin: -24px 0 0 0"
        ></div>
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[120px] bg-[#00E5FF]/10 blur-[50px] pointer-events-none"
        ></div>

        <!-- 标题栏 -->
        <div class="flex items-center gap-2.5 mb-6 relative z-10">
          <div
            class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"
          ></div>
          <div class="flex items-baseline gap-2">
            <span class="text-[#555555] text-[11px] font-mono tracking-wider">>></span>
            <span class="text-[#E0E0E0] text-[14px] font-medium tracking-wide">找个鸦</span>
            <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase"
              >ADD_CONTACT</span
            >
          </div>
        </div>

        <!-- 搜索区域 -->
        <div class="mb-6 relative z-10">
          <label
            class="flex items-center gap-2 text-[#85858A] text-[11px] font-mono tracking-widest mb-2.5"
          >
            <span class="text-[#00E5FF] opacity-70">>></span> 搜索用户
          </label>
          <div class="flex gap-2.5">
            <input
              v-model="searchUsername"
              type="text"
              class="flex-1 bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-4 py-3 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 transition-all font-mono text-[13px] placeholder-[#444444]"
              placeholder="输入代号或昵称"
              @keyup.enter="handleSearchUser"
            />
            <button
              @click="handleSearchUser"
              :disabled="searchLoading"
              class="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center flex-shrink-0"
              title="搜索"
            >
              <svg
                v-if="!searchLoading"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <svg
                v-else
                class="w-5 h-5 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-if="searchResults.length > 0" class="mb-5 relative z-10">
          <label
            class="flex items-center gap-2 text-[#85858A] text-[11px] font-mono tracking-widest mb-2.5"
          >
            <span class="text-[#00E5FF] opacity-70">>></span> 搜索结果
          </label>
          <div class="max-h-[180px] overflow-y-auto scrollbar-thin bg-black/30 border border-white/5 rounded-xl p-2">
            <div
              v-for="user in searchResults"
              :key="user.id"
              @click="selectUser(user)"
              class="group flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-300"
              :class="
                selectedUser?.id === user.id
                  ? 'bg-[#00E5FF]/10 border border-[#00E5FF]/30'
                  : 'hover:bg-white/5'
              "
            >
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center text-[#E0E0E0] font-bold text-sm flex-shrink-0 relative overflow-hidden"
                :class="
                  selectedUser?.id === user.id
                    ? 'bg-[#00E5FF]/20 border border-[#00E5FF]/50'
                    : 'bg-[#0A0A0C] border border-white/10'
                "
              >
                {{ user.showName[0] }}
                <!-- 扫描线效果 -->
                <div
                  v-if="selectedUser?.id === user.id"
                  class="absolute top-0 left-0 w-full h-[1px] bg-[#00E5FF]/50 shadow-[0_0_5px_#00E5FF] animate-[scan_2s_ease-in-out_infinite]"
                ></div>
              </div>
              <div class="flex-1 min-w-0">
                <div
                  class="text-[13px] font-medium truncate"
                  :class="selectedUser?.id === user.id ? 'text-[#00E5FF]' : 'text-[#E0E0E0]'"
                >
                  {{ user.showName }}
                </div>
                <div class="text-[10px] text-[#555555] font-mono">@{{ user.username }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 无搜索结果 -->
        <div
          v-if="searchAttempted && searchResults.length === 0"
          class="mb-5 text-center text-[#555555] text-[12px] font-mono py-6 bg-black/20 rounded-xl border border-white/5 relative z-10"
        >
          [ 这人不存在，或者躲起来了 ]
        </div>

        <!-- 目标档案展示 -->
        <div v-if="selectedUser" class="mb-5 relative z-10">
          <label
            class="flex items-center gap-2 text-[#85858A] text-[11px] font-mono tracking-widest mb-3"
          >
            <span class="text-[#00E5FF] opacity-70">>></span> 目标档案
            <span class="text-[#00E5FF] text-[10px] tracking-widest uppercase ml-auto"
              >TARGET_ACQUIRED</span
            >
          </label>
          <div
            class="flex items-center gap-4 p-4 bg-black/30 border border-[#00E5FF]/20 rounded-xl"
          >
            <div
              class="relative w-14 h-14 rounded-xl bg-black border border-[#00E5FF]/40 flex items-center justify-center overflow-hidden shadow-[inset_0_0_15px_rgba(0,229,255,0.1)]"
            >
              <span class="text-[#00E5FF] text-2xl font-bold font-mono">{{
                selectedUser.showName[0]
              }}</span>
              <div
                class="absolute top-0 left-0 w-full h-[1px] bg-[#00E5FF]/50 shadow-[0_0_5px_#00E5FF] animate-[scan_2s_ease-in-out_infinite]"
              ></div>
            </div>
            <div class="flex flex-col flex-1">
              <span class="text-[#E0E0E0] text-[16px] font-bold tracking-widest mb-1">{{
                selectedUser.showName
              }}</span>
              <span class="text-[#555555] text-[10px] font-mono tracking-widest"
                >STATUS:
                <span class="text-[#00E5FF]">AWAITING_CONNECTION</span></span
              >
            </div>
          </div>
        </div>

        <!-- 验证消息 -->
        <div v-if="selectedUser" class="mb-6 relative z-10">
          <label
            class="flex items-center gap-2 text-[#85858A] text-[11px] font-mono tracking-widest mb-2.5"
          >
            <span class="text-[#00E5FF] opacity-70">>></span> 敲门暗号
            <span class="text-[#555555] text-[10px] uppercase">(HANDSHAKE_MSG)</span>
          </label>
          <div class="relative group">
            <textarea
              v-model="addFriendForm.message"
              class="w-full h-24 bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#00E5FF] p-4 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_10px_rgba(0,229,255,0.1)] transition-all font-mono text-[13px] resize-none leading-relaxed"
              placeholder="输入指令，不然对方会把你当垃圾数据清理掉..."
            ></textarea>
          </div>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="addFriendError"
          class="mb-5 text-[#FF3366] text-[11px] font-mono bg-[#FF3366]/10 py-2.5 px-3 rounded-xl border border-[#FF3366]/30 relative z-10"
        >
          {{ addFriendError }}
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-3 relative z-10 mt-6">
          <button
            @click="closeAddFriendModal"
            class="flex-1 py-3 bg-black/40 border border-white/10 text-[#85858A] rounded-xl hover:bg-white/5 hover:text-white transition-all duration-300 group flex flex-col items-center justify-center gap-1"
          >
            <span class="text-[13px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform">战术撤退</span>
            <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">Cancel</span>
          </button>
          <button
            v-if="selectedUser"
            @click="handleAddFriend"
            :disabled="addFriendLoading"
            class="flex-1 py-3 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 group flex flex-col items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span
              class="text-[13px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform"
            >
              {{ addFriendLoading ? '握手中...' : '强制握手' }}
            </span>
            <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">SEND_PING</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useContactStore, type Contact } from '@/entities/contact/model/useContactStore'
import { userApi, type UserInfo } from '@/shared/api/user'
import { API_CONFIG } from '@/shared/config/api'

const emit = defineEmits<{
  (e: 'selectContact', contact: Contact): void
}>()

const contactStore = useContactStore()

const searchQuery = ref('')
const showRequests = ref(false)
const showAddFriend = ref(false)
const searchUsername = ref('')
const searchResults = ref<UserInfo[]>([])
const selectedUser = ref<UserInfo | null>(null)
const searchLoading = ref(false)
const searchAttempted = ref(false)
const addFriendForm = ref({
  message: '🔐 试图建立加密通讯链路...\n(翻译：别装死，通过一下)'
})
const addFriendLoading = ref(false)
const addFriendError = ref('')

const loading = computed(() => contactStore.loading)
const pendingRequests = computed(() => contactStore.pendingRequests)

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

const filteredContacts = computed(() => {
  if (!searchQuery.value) return contactStore.contacts

  const query = searchQuery.value.toLowerCase()
  return contactStore.contacts.filter(
    (c) =>
      c.displayName.toLowerCase().includes(query) || c.username.toLowerCase().includes(query)
  )
})

const selectContact = (contact: Contact): void => {
  emit('selectContact', contact)
}

const handleAcceptRequest = async (requestId: string): Promise<void> => {
  const result = await contactStore.acceptRequest(requestId)
  if (result.success) {
    console.log('✅ 已接受好友请求')
  }
}

const handleRejectRequest = async (requestId: string): Promise<void> => {
  const result = await contactStore.rejectRequest(requestId)
  if (result.success) {
    console.log('✅ 已拒绝好友请求')
  }
}

const handleSearchUser = async (): Promise<void> => {
  if (!searchUsername.value.trim()) {
    addFriendError.value = '请输入用户名或昵称'
    return
  }

  searchLoading.value = true
  searchAttempted.value = true
  addFriendError.value = ''

  try {
    console.log('🔍 搜索用户:', searchUsername.value)
    const results = await userApi.search(searchUsername.value)
    searchResults.value = results
    console.log('✅ 搜索结果:', results.length)

    if (results.length === 0) {
      addFriendError.value = '未找到用户'
    }
  } catch (error) {
    console.error('❌ 搜索用户失败:', error)
    addFriendError.value = '搜索失败，请重试'
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const selectUser = (user: UserInfo): void => {
  selectedUser.value = user
  addFriendError.value = ''
}

const handleAddFriend = async (): Promise<void> => {
  if (!selectedUser.value) {
    addFriendError.value = '请先搜索并选择用户'
    return
  }

  addFriendLoading.value = true
  addFriendError.value = ''

  const result = await contactStore.sendRequestByUsername(
    selectedUser.value.username,
    addFriendForm.value.message
  )

  addFriendLoading.value = false

  if (result.success) {
    console.log('✅ 好友请求已发送')
    closeAddFriendModal()
  } else {
    addFriendError.value = result.error || '发送失败，请重试'
  }
}

const closeAddFriendModal = (): void => {
  showAddFriend.value = false
  searchUsername.value = ''
  searchResults.value = []
  selectedUser.value = null
  searchAttempted.value = false
  addFriendForm.value = {
    message: '你好，我想加你为好友'
  }
  addFriendError.value = ''
}

onMounted(async () => {
  // 如果联系人列表为空且不在加载中，则加载
  // 通常情况下，MainPage 已经预加载了数据
  if (contactStore.contacts.length === 0 && !contactStore.loading) {
    await Promise.all([
      contactStore.loadContacts(),
      contactStore.loadPendingRequests()
    ])
  }
})
</script>


<style scoped>
@keyframes scan {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(56px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
