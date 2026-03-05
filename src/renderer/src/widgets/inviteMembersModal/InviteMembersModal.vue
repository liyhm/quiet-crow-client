<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all p-8"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-[440px] max-h-[85vh] bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,229,255,0.05)] overflow-hidden flex flex-col"
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
          <span class="text-[#E0E0E0] text-[14px] font-medium tracking-wide">邀请同伙</span>
          <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase"
            >INVITE</span
          >
        </div>
      </div>

      <!-- 联系人选择区 -->
      <div class="mb-6 relative z-10">
        <label
          class="flex items-center gap-2 text-[#85858A] text-[11px] font-mono tracking-widest mb-3"
        >
          <span class="text-[#00E5FF] opacity-70">>></span> 选择联系人
        </label>
        <div
          class="max-h-[240px] overflow-y-auto scrollbar-thin bg-black/30 border border-white/5 rounded-xl p-3"
        >
          <div
            v-for="contact in availableContacts"
            :key="contact.userId"
            class="group flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-300"
            :class="
              selectedContacts.includes(contact.userId) ? 'bg-[#00E5FF]/10' : 'hover:bg-white/5'
            "
            @click="toggleContact(contact.userId)"
          >
            <!-- 赛博风复选框 -->
            <div
              class="w-5 h-5 rounded border flex items-center justify-center font-mono text-[11px] font-bold transition-all"
              :class="
                selectedContacts.includes(contact.userId)
                  ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                  : 'border-[#555555] text-transparent'
              "
            >
              {{ selectedContacts.includes(contact.userId) ? 'X' : '□' }}
            </div>

            <!-- 头像 -->
            <div
              class="w-8 h-8 rounded-lg bg-[#0A0A0C] border border-white/10 flex items-center justify-center text-[#555555] font-bold text-xs flex-shrink-0"
            >
              {{ contact.displayName[0] }}
            </div>

            <!-- 名称 -->
            <div class="flex-1 min-w-0">
              <div
                class="text-[13px] truncate font-medium transition-colors"
                :class="
                  selectedContacts.includes(contact.userId) ? 'text-[#00E5FF]' : 'text-[#E0E0E0]'
                "
              >
                {{ contact.displayName }}
              </div>
              <div class="text-[10px] text-[#555555] font-mono">@{{ contact.username }}</div>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="availableContacts.length === 0"
            class="text-center py-8 text-[#555555] text-[13px] font-mono"
          >
            [ 所有联系人都已在群内 ]
          </div>
        </div>

        <!-- 已选计数 -->
        <div
          v-if="selectedContacts.length > 0"
          class="mt-2 text-[10px] text-[#00E5FF] font-mono tracking-wider"
        >
          已选择 {{ selectedContacts.length }} 个节点
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-4 relative z-10">
        <button
          :disabled="selectedContacts.length === 0"
          class="flex-1 py-3.5 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 group flex flex-col items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          @click="handleInvite"
        >
          <span
            class="text-[13px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform"
          >
            确认邀请
          </span>
          <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">Confirm</span>
        </button>
        <button
          class="flex-1 py-3.5 bg-white/5 border border-white/10 text-[#85858A] rounded-xl hover:bg-white/10 hover:text-[#E0E0E0] transition-all duration-300 flex flex-col items-center justify-center gap-1"
          @click="$emit('close')"
        >
          <span class="text-[13px] font-bold tracking-[0.15em]">取消</span>
          <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">Cancel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Contact {
  userId: string
  username: string
  displayName: string
}

const props = defineProps<{
  show: boolean
  contacts: Contact[]
  existingMemberIds: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'invite', memberIds: string[]): void
}>()

const selectedContacts = ref<string[]>([])

// 过滤掉已经在群里的联系人
const availableContacts = computed(() => {
  return props.contacts.filter(c => !props.existingMemberIds.includes(c.userId))
})

const toggleContact = (userId: string) => {
  const index = selectedContacts.value.indexOf(userId)
  if (index > -1) {
    selectedContacts.value.splice(index, 1)
  } else {
    selectedContacts.value.push(userId)
  }
}

const handleInvite = () => {
  if (selectedContacts.value.length > 0) {
    emit('invite', selectedContacts.value)
    // 重置选择
    selectedContacts.value = []
  }
}
</script>
