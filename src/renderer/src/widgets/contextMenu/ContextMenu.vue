<template>
  <div
    v-if="show"
    class="fixed glass-panel border border-white/10 rounded-lg shadow-lg py-1 z-50"
    :style="{ top: y + 'px', left: x + 'px' }"
    @click="$emit('close')"
  >
    <button
      @click="$emit('delete')"
      class="w-full px-4 py-2 text-left hover:bg-alert-red/10 text-alert-red flex items-center gap-2 transition-colors"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
        <path
          d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
        />
        <path
          fill-rule="evenodd"
          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
        />
      </svg>
      删除消息
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  x: number
  y: number
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'delete'): void
}>()
</script>
