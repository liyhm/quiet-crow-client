<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-[480px] bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,229,255,0.05)] overflow-hidden flex flex-col"
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
          <span class="text-[#E0E0E0] text-[14px] font-medium tracking-wide">建立鸦群分舵</span>
          <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase"
            >NEW_SYNDICATE</span
          >
        </div>
      </div>

      <!-- 群名输入 -->
      <div class="mb-10 relative z-10">
        <label
          class="flex items-center gap-2 text-[#00E5FF] text-[13px] font-mono tracking-widest mb-4 font-bold leading-loose"
        >
          <span class="text-[#00E5FF]">>></span> 阴谋代号
        </label>
        <input
          v-model="groupName"
          type="text"
          class="w-full bg-black/50 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] px-4 py-3.5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 transition-all font-mono text-[14px] placeholder-[#444444]"
          placeholder="为你们的阴谋起个代号"
        />
      </div>

      <!-- 联系人选择区 -->
      <div class="mb-12 relative z-10">
        <label
          class="flex items-center gap-2 text-[#00E5FF] text-[13px] font-mono tracking-widest mb-6 font-bold leading-loose"
        >
          <span class="text-[#00E5FF]">>></span> 选择同伙
        </label>
        <div
          class="max-h-[280px] overflow-y-auto scrollbar-thin bg-black/30 border border-white/5 rounded-xl p-3 mb-4"
        >
          <div
            v-for="contact in contacts"
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
            v-if="contacts.length === 0"
            class="text-center py-8 text-[#555555] text-[13px] font-mono"
          >
            [ 无可用联系人 ]
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
          :disabled="!canCreate"
          class="flex-1 py-3.5 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 group flex flex-col items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
          @click="handleCreate"
        >
          <span
            class="text-[13px] font-bold tracking-[0.15em] group-hover:scale-105 transition-transform"
          >
            熔铸链接
          </span>
          <span class="text-[9px] font-mono opacity-60 tracking-[0.2em] uppercase">Establish</span>
        </button>
        <button
          class="flex-1 py-3.5 bg-white/5 border border-white/10 text-[#85858A] rounded-xl hover:bg-white/10 hover:text-[#E0E0E0] transition-all duration-300 flex flex-col items-center justify-center gap-1"
          @click="$emit('close')"
        >
          <span class="text-[13px] font-bold tracking-[0.15em]">放弃计划</span>
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
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', data: { name: string; memberIds: string[] }): void
}>()

const groupName = ref('')
const selectedContacts = ref<string[]>([])

const canCreate = computed(() => {
  return groupName.value.trim().length > 0 && selectedContacts.value.length > 0
})

const toggleContact = (userId: string) => {
  const index = selectedContacts.value.indexOf(userId)
  if (index > -1) {
    selectedContacts.value.splice(index, 1)
  } else {
    selectedContacts.value.push(userId)
  }
}

const handleCreate = () => {
  if (canCreate.value) {
    emit('create', {
      name: groupName.value.trim(),
      memberIds: selectedContacts.value
    })
    // 重置表单
    groupName.value = ''
    selectedContacts.value = []
  }
}
</script>
