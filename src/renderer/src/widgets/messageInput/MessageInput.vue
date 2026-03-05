<template>
  <div class="h-44 bg-[#0A0A0C] border-t border-white/5 flex flex-col relative" style="padding: 16px 20px;">
    <!-- 表情选择器 -->
    <EmojiPicker
      :show="showEmojiPicker"
      @select="insertEmoji"
      @close="showEmojiPicker = false"
    />
    
    <!-- 工具栏 -->
    <div class="flex items-center gap-4 mb-2 text-[#555555]">
      <!-- 表情按钮 -->
      <button
        @click="showEmojiPicker = !showEmojiPicker"
        class="hover:text-[#00E5FF] transition-colors"
        :class="{ 'text-[#00E5FF]': showEmojiPicker }"
        title="表情"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </button>
      
      <!-- 选择文件按钮 -->
      <button
        @click="triggerFileInput"
        class="hover:text-[#00E5FF] transition-colors"
        title="选择文件"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          ></path>
        </svg>
      </button>
      
      <!-- 截图按钮 -->
      <button
        @click="handleScreenshot"
        class="hover:text-[#00E5FF] transition-colors"
        title="截图 (Ctrl+Alt+A)"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
          ></path>
        </svg>
      </button>
      
      <!-- 隐藏的文件输入框 -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        @change="handleFileSelect"
        style="display: none;"
      />
    </div>

    <!-- 输入框容器 -->
    <div
      ref="inputContainerRef"
      class="flex-1 relative overflow-y-auto"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      :class="{ 'drag-over': isDragging }"
    >
      <!-- 拖拽提示 -->
      <div
        v-if="isDragging"
        class="absolute inset-0 bg-[#00E5FF]/10 border-2 border-dashed border-[#00E5FF] rounded flex items-center justify-center z-10"
      >
        <span class="text-[#00E5FF] text-sm">松开鼠标上传文件</span>
      </div>
      
      <!-- 输入框和文件预览混合布局 -->
      <div class="min-h-full">
        <!-- 输入框 -->
        <textarea
          ref="inputRef"
          v-model="localMessage"
          @keydown.enter.exact.prevent="handleSend"
          @paste="handlePaste"
          :placeholder="hasContent ? '' : '想吐点什么槽？ (Enter 发送，Ctrl+V 粘贴文件)'"
          class="w-full bg-transparent text-[#E0E0E0] placeholder-[#555555] resize-none focus:outline-none text-[14px]"
          :style="{ minHeight: pendingFiles.length > 0 ? '40px' : '100%' }"
        ></textarea>
        
        <!-- 文件预览 - inline 显示 -->
        <div
          v-if="pendingFiles.length > 0"
          class="flex flex-wrap gap-2 items-start mt-2"
        >
          <div
            v-for="(file, index) in pendingFiles"
            :key="index"
            class="relative group inline-block"
          >
            <!-- 图片预览 -->
            <div
              v-if="file.type.startsWith('image/')"
              class="relative inline-block w-16 h-16 rounded overflow-hidden bg-black/50"
            >
              <img
                :src="getFilePreview(file)"
                :alt="file.name"
                class="w-full h-full object-cover"
              />
              <!-- 删除按钮 -->
              <button
                @click="removeFile(index)"
                class="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="删除"
              >
                ×
              </button>
            </div>
            
            <!-- 非图片文件 -->
            <div
              v-else
              class="relative inline-block w-16 h-16 rounded bg-white/5 border border-white/10"
            >
              <div class="w-full h-full flex flex-col items-center justify-center p-1">
                <!-- 文件图标 -->
                <span class="text-xl mb-0.5">{{ getFileIcon(file.type) }}</span>
                <!-- 文件名 -->
                <span class="text-[9px] text-[#E0E0E0] text-center truncate w-full px-0.5">
                  {{ file.name }}
                </span>
              </div>
              <!-- 删除按钮 -->
              <button
                @click="removeFile(index)"
                class="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="删除"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 发送按钮 -->
    <button
      @click="handleSend"
      :disabled="!canSend"
      class="absolute rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#00E5FF]/10 disabled:hover:shadow-none flex items-center justify-center group"
      style="bottom: 16px; right: 20px; width: 36px; height: 36px;"
      title="发送 (Enter)"
    >
      <svg class="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import EmojiPicker from '../emojiPicker/EmojiPicker.vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'send'): void
  (e: 'sendFiles', files: File[]): void
  (e: 'screenshot'): void
}>()

const inputRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()
// 未使用的变量，注释掉
// const inputContainerRef = ref<HTMLDivElement>()
const localMessage = ref(props.modelValue)
const pendingFiles = ref<File[]>([])
const isDragging = ref(false)
const showEmojiPicker = ref(false)
const filePreviewUrls = ref<Map<File, string>>(new Map())

watch(
  () => props.modelValue,
  (newVal) => {
    localMessage.value = newVal
  }
)

watch(localMessage, (newVal) => {
  emit('update:modelValue', newVal)
})

// 是否可以发送
const canSend = computed(() => {
  return localMessage.value.trim() || pendingFiles.value.length > 0
})

// 是否有内容（用于控制 placeholder 显示）
const hasContent = computed(() => {
  return localMessage.value.trim() || pendingFiles.value.length > 0
})

// 获取文件预览 URL
const getFilePreview = (file: File): string => {
  if (!filePreviewUrls.value.has(file)) {
    const url = URL.createObjectURL(file)
    filePreviewUrls.value.set(file, url)
  }
  return filePreviewUrls.value.get(file)!
}

// 插入表情
const insertEmoji = (emoji: string) => {
  const textarea = inputRef.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = localMessage.value

  localMessage.value = text.substring(0, start) + emoji + text.substring(end)

  // 设置光标位置
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length
    textarea.focus()
  }, 0)

  showEmojiPicker.value = false
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理截图
const handleScreenshot = () => {
  emit('screenshot')
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    addFiles(Array.from(target.files))
    target.value = '' // 清空input，允许重复选择同一文件
  }
}

// 添加文件
const addFiles = (files: File[]) => {
  pendingFiles.value.push(...files)
}

// 移除文件
const removeFile = (index: number) => {
  const file = pendingFiles.value[index]
  
  // 释放预览 URL
  const url = filePreviewUrls.value.get(file)
  if (url) {
    URL.revokeObjectURL(url)
    filePreviewUrls.value.delete(file)
  }
  
  pendingFiles.value.splice(index, 1)
}

// 处理拖拽进入
const handleDragOver = (_event: DragEvent) => {
  isDragging.value = true
}

// 处理拖拽离开
const handleDragLeave = (_event: DragEvent) => {
  isDragging.value = false
}

// 处理文件拖放
const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

// 处理粘贴
const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items
  if (!items) return

  const files: File[] = []
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    
    // 处理文件
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }

  if (files.length > 0) {
    event.preventDefault()
    addFiles(files)
  }
}

// 发送消息
const handleSend = () => {
  if (!canSend.value) return

  // 如果有待发送的文件
  if (pendingFiles.value.length > 0) {
    emit('sendFiles', [...pendingFiles.value])
    pendingFiles.value = []
  }

  // 如果有文本消息
  if (localMessage.value.trim()) {
    emit('send')
  }
}

// 获取文件图标
const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎬'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦'
  return '📎'
}

// 监听全局快捷键 Ctrl+Alt+A 截图
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.altKey && event.key === 'a') {
    event.preventDefault()
    handleScreenshot()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  
  // 清理所有预览 URL
  filePreviewUrls.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  filePreviewUrls.value.clear()
})

defineExpose({
  focus: () => inputRef.value?.focus(),
  clearFiles: () => {
    // 清理预览 URL
    filePreviewUrls.value.forEach((url) => {
      URL.revokeObjectURL(url)
    })
    filePreviewUrls.value.clear()
    pendingFiles.value = []
  }
})
</script>

<style scoped>
.drag-over {
  position: relative;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
