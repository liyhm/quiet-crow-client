<template>
  <div
    v-if="show"
    class="absolute bottom-full left-0 mb-2 bg-[#1E1E24] border border-[#00E5FF]/30 rounded-lg shadow-[0_0_30px_rgba(0,229,255,0.2)] z-50"
    style="width: 360px; max-height: 400px;"
  >
    <!-- 标题栏 -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <span class="text-[#00E5FF] text-sm font-medium">选择表情</span>
      <button
        @click="$emit('close')"
        class="text-[#666] hover:text-[#00E5FF] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- 最近使用 -->
    <div v-if="recentEmojis.length > 0" class="px-4 py-3 border-b border-white/5">
      <div class="text-[#666] text-xs mb-2">最近使用</div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="emoji in recentEmojis"
          :key="emoji"
          @click="selectEmoji(emoji)"
          class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-xl"
          :title="emoji"
        >
          {{ emoji }}
        </button>
      </div>
    </div>

    <!-- 所有表情 -->
    <div class="p-4 overflow-y-auto" style="max-height: 280px;">
      <div class="grid grid-cols-10 gap-1">
        <button
          v-for="emoji in allEmojis"
          :key="emoji"
          @click="selectEmoji(emoji)"
          class="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors text-xl"
          :title="emoji"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'select', emoji: string): void
  (e: 'close'): void
}>()

// 微信常用表情包（Unicode Emoji）
const allEmojis = ref([
  // 笑脸类
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  
  // 表情类
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
  
  // 情绪类
  '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
  '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
  '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
  
  // 其他表情
  '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
  '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  
  // 手势类
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
  '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
  
  // 身体部位
  '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
  '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸',
  
  // 人物类
  '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👩‍🦱', '🧑‍🦱', '👨‍🦱',
  '👩‍🦰', '🧑‍🦰', '👨‍🦰', '👱‍♀️', '👱', '👱‍♂️', '👩‍🦳', '🧑‍🦳', '👨‍🦳', '👩‍🦲',
  
  // 动物类
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
  
  // 食物类
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
  '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒',
  
  // 活动类
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
  '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣',
  
  // 符号类
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
  
  // 其他符号
  '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥', '🌈', '☀️', '🌤️',
  '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️'
])

const recentEmojis = ref<string[]>([])

// 选择表情
const selectEmoji = (emoji: string) => {
  // 添加到最近使用
  const index = recentEmojis.value.indexOf(emoji)
  if (index > -1) {
    recentEmojis.value.splice(index, 1)
  }
  recentEmojis.value.unshift(emoji)
  
  // 只保留最近 8 个
  if (recentEmojis.value.length > 8) {
    recentEmojis.value = recentEmojis.value.slice(0, 8)
  }
  
  // 保存到 localStorage
  localStorage.setItem('recentEmojis', JSON.stringify(recentEmojis.value))
  
  emit('select', emoji)
}

// 加载最近使用的表情
onMounted(() => {
  const saved = localStorage.getItem('recentEmojis')
  if (saved) {
    try {
      recentEmojis.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load recent emojis:', e)
    }
  }
})
</script>

<style scoped>
/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 229, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 229, 255, 0.3);
}
</style>
