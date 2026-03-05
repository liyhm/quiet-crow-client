<template>
  <div
    class="h-14 bg-[#151518] border-b border-white/5 flex items-center justify-between pr-6"
    style="padding-left: 28px;"
  >
    <!-- 左侧：会话名称 + 群人数/在线状态 -->
    <div class="flex items-center gap-3">
      <div class="flex flex-col">
        <div class="flex items-baseline gap-2">
          <span class="font-medium text-[#E0E0E0] text-[15px] tracking-wide">
            {{ sessionName }}
          </span>
          <!-- 群聊人数 -->
          <span
            v-if="isGroup && memberCount"
            class="text-[11px] text-[#555555] font-mono"
          >
            ({{ memberCount }})
          </span>
        </div>
        <!-- 私聊在线状态 -->
        <div
          v-if="!isGroup && isOnline !== null && isOnline !== undefined"
          class="flex items-center gap-1.5 mt-0.5"
        >
          <span
            :class="[
              'w-1.5 h-1.5 rounded-full',
              isOnline ? 'bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.8)]' : 'bg-[#555555]'
            ]"
          />
          <span
            :class="[
              'text-[10px] font-mono',
              isOnline ? 'text-[#00E5FF]/80' : 'text-[#555555]'
            ]"
          >
            {{ isOnline ? '在线' : '离线' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧：操作按钮 -->
    <div class="flex items-center gap-2 mr-2">
      <!-- 查看潜伏者按钮（仅群聊显示） -->
      <button
        v-if="isGroup"
        @click="$emit('showMembers')"
        class="group flex items-center gap-4 rounded-lg bg-white/5 hover:bg-[#00E5FF]/10 transition-all duration-300"
        style="padding: 6px 16px; margin: 4px 0;"
        title="查看群成员"
      >
        <svg
          class="w-6 h-6 text-[#00E5FF]/60 group-hover:text-[#00E5FF] transition-colors drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span class="text-[14px] font-mono text-[#00E5FF]/80 group-hover:text-[#00E5FF] transition-colors tracking-wider font-medium">
          潜伏者
        </span>
      </button>

      <!-- 更多菜单按钮 -->
      <button
        @click="$emit('showMenu')"
        class="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-[#555555] hover:text-[#00E5FF] transition-all"
        title="更多选项"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  sessionName: string
  isGroup?: boolean
  memberCount?: number
  isOnline?: boolean | null  // 新增：在线状态
}>()

defineEmits<{
  (e: 'showMenu'): void
  (e: 'showMembers'): void
}>()
</script>
