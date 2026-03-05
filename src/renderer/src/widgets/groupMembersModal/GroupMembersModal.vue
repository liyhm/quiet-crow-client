<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all"
    @click.self="$emit('close')"
  >
    <div
      class="relative bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,229,255,0.05)]"
      style="padding: 14px; width: 340px;"
    >
      <!-- 顶部光带 -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-[#00E5FF]/80 to-transparent"
      ></div>
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[100px] bg-[#00E5FF]/10 blur-[40px] pointer-events-none z-0"
      ></div>

      <!-- 内容容器 -->
      <div class="relative z-10 flex flex-col">
        <!-- 标题栏 -->
        <div class="pb-3 mb-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div class="flex items-center gap-2">
            <div
              class="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_8px_#00E5FF]"
            ></div>
            <span class="text-[#00E5FF] text-[13px] font-mono tracking-[0.15em] font-bold"
              >SYNDICATE_ROSTER</span
            >
          </div>
          <button
            @click="$emit('close')"
            class="text-[#555555] hover:text-[#FF3366] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- 群信息控制台 -->
        <div class="mb-3">
          <div
            class="flex items-center gap-3 bg-black/40 border border-white/5 rounded-xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
            style="padding: 10px;"
          >
            <div
              class="rounded-xl bg-[#151518] border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.15)]"
              style="width: 36px; height: 36px;"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <div class="flex flex-col">
              <div class="flex items-center gap-2 group">
                <input
                  v-if="isEditingName"
                  v-model="editingGroupName"
                  @blur="handleSaveGroupName"
                  @keyup.enter="handleSaveGroupName"
                  @keyup.esc="cancelEditName"
                  class="bg-[#151518] border border-[#00E5FF]/40 text-[#E0E0E0] text-[14px] font-bold tracking-widest px-2 py-1 rounded focus:outline-none focus:border-[#00E5FF]"
                  style="width: 180px;"
                  ref="nameInput"
                />
                <span
                  v-else
                  @click="startEditName"
                  class="text-[#E0E0E0] text-[14px] font-bold tracking-widest drop-shadow-md cursor-pointer hover:text-[#00E5FF] transition-colors"
                  style="margin-bottom: 2px;"
                  title="点击修改群名称"
                >
                  {{ groupName }}
                </span>
                <button
                  v-if="!isEditingName"
                  @click="startEditName"
                  class="opacity-0 group-hover:opacity-100 text-[#00E5FF]/60 hover:text-[#00E5FF] transition-all"
                  title="修改群名称"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              </div>
              <span class="text-[#00E5FF]/80 text-[10px] font-mono flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-[#00E5FF] rounded-full animate-ping"></span>
                {{ onlineCount }} 节点在线 / 共 {{ members.length }} 成员
              </span>
            </div>
          </div>
        </div>

        <!-- 成员列表标题 -->
        <div class="mb-3">
          <span class="text-[#555555] text-[10px] font-mono tracking-[0.2em] uppercase"
            >>> 潜伏者列表 (MEMBERS)</span
          >
        </div>

        <!-- 成员列表 - 网格布局 -->
        <div class="mb-4 max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div class="grid grid-cols-4" style="gap: 6px;">
            <div
              v-for="member in members"
              :key="member.userId"
              class="flex flex-col items-center rounded-lg hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group cursor-default"
              style="padding: 4px;"
            >
              <div
                class="relative rounded-md overflow-hidden flex items-center justify-center shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                style="width: 40px; height: 40px; margin-bottom: 4px;"
                :class="
                  member.userType === 'OWNER'
                    ? 'bg-[#0A0A0C] border-2 border-[#00E5FF]/40'
                    : 'bg-[#151518] border border-white/10'
                "
              >
                <img
                  v-if="member.avatar"
                  :src="member.avatar"
                  class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  :alt="member.showName"
                />
                <span v-else class="text-[#555555] font-bold text-sm">{{
                  member.showName[0]
                }}</span>
              </div>
              <div class="flex flex-col items-center w-full">
                <div class="flex items-center gap-1 mb-1">
                  <span
                    class="text-[#E0E0E0] text-[12px] font-medium tracking-wide truncate max-w-[70px]"
                    >{{ member.showName }}</span
                  >
                  <!-- 首领标签 -->
                  <span
                    v-if="member.userType === 'OWNER'"
                    class="text-[#00E5FF] text-[7px] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-1 py-0.5 rounded-[3px] font-mono tracking-widest shadow-[0_0_5px_rgba(0,229,255,0.2)]"
                  >
                    首领
                  </span>
                </div>
                <span
                  class="text-[8px] font-mono"
                  :class="member.isOnline ? 'text-[#00E5FF]/70' : 'text-[#555555]'"
                >
                  {{ member.isOnline ? 'ONLINE' : 'OFFLINE' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="members.length === 0"
            class="text-center py-8 text-[#555555] text-[13px] font-mono"
          >
            [ 无成员数据 ]
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="pt-3 border-t border-white/5 bg-white/[0.01] flex" style="gap: 6px;">
          <button
            class="flex-1 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-lg hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all duration-300 group flex flex-col items-center justify-center"
            style="padding: 4px; gap: 1px;"
            @click="$emit('inviteMembers')"
          >
            <span
              class="text-[9px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform"
              >邀请同伙</span
            >
            <span class="text-[7px] font-mono opacity-60 tracking-[0.2em]">INVITE</span>
          </button>

          <button
            v-if="isOwner"
            class="flex-1 bg-[#FF3366]/10 border border-[#FF3366]/30 text-[#FF3366] rounded-lg hover:bg-[#FF3366]/20 hover:border-[#FF3366] hover:shadow-[0_0_15px_rgba(255,51,102,0.3)] transition-all duration-300 group flex flex-col items-center justify-center"
            style="padding: 4px; gap: 1px;"
            @click="$emit('dissolveGroup')"
          >
            <span
              class="text-[9px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform"
              >解散鸦群</span
            >
            <span class="text-[7px] font-mono opacity-60 tracking-[0.2em]">DISSOLVE</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

interface Member {
  userId: string
  showName: string
  username: string
  avatar: string | null
  userType: 'OWNER' | 'MEMBER'
  isOnline: boolean
}

const props = defineProps<{
  show: boolean
  groupName: string
  members: Member[]
  currentUserId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'inviteMembers'): void
  (e: 'dissolveGroup'): void
  (e: 'updateGroupName', newName: string): void
}>()

// 判断当前用户是否是群主
const isOwner = computed(() => {
  const currentMember = props.members.find(m => m.userId === props.currentUserId)
  return currentMember?.userType === 'OWNER'
})

// 计算在线成员数量
const onlineCount = computed(() => {
  return props.members.filter(m => m.isOnline).length
})

// 群名称编辑
const isEditingName = ref(false)
const editingGroupName = ref('')
const nameInput = ref<HTMLInputElement>()

const startEditName = () => {
  editingGroupName.value = props.groupName
  isEditingName.value = true
  nextTick(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  })
}

const cancelEditName = () => {
  isEditingName.value = false
  editingGroupName.value = ''
}

const handleSaveGroupName = () => {
  const newName = editingGroupName.value.trim()
  if (newName && newName !== props.groupName) {
    emit('updateGroupName', newName)
  }
  isEditingName.value = false
  editingGroupName.value = ''
}
</script>
