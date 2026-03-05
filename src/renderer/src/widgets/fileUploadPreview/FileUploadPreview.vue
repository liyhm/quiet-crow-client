<template>
  <div
    v-if="files.length > 0"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    @click.self="$emit('cancel')"
  >
    <div class="w-full max-w-2xl mx-4 bg-[#0A0A0C]/95 border border-[#00E5FF]/30 rounded-lg shadow-2xl backdrop-blur-md">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[#00E5FF]/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center">
            <svg class="w-6 h-6 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-[#00E5FF]">
              FILE_UPLOAD_PREVIEW
            </h3>
            <p class="text-sm text-gray-400">
              {{ files.length }} 个文件待发送
            </p>
          </div>
        </div>
        <button
          @click="$emit('cancel')"
          class="w-8 h-8 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 flex items-center justify-center transition-colors"
        >
          <svg class="w-5 h-5 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- File List -->
      <div class="max-h-96 overflow-y-auto p-6 space-y-4">
        <div
          v-for="(file, index) in files"
          :key="index"
          class="flex items-center gap-4 p-4 bg-[#1A1A1C]/50 border border-[#00E5FF]/10 rounded-lg hover:border-[#00E5FF]/30 transition-colors"
        >
          <!-- Preview -->
          <div class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#0A0A0C] flex items-center justify-center">
            <img
              v-if="file.preview && file.type.startsWith('image/')"
              :src="file.preview"
              :alt="file.name"
              class="w-full h-full object-cover"
            />
            <svg
              v-else-if="file.type.startsWith('video/')"
              class="w-8 h-8 text-[#00E5FF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg
              v-else
              class="w-8 h-8 text-[#00E5FF]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#00E5FF] truncate">
              {{ file.name }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ formatFileSize(file.size) }} • {{ getFileTypeLabel(file.type) }}
            </p>
          </div>

          <!-- Remove Button -->
          <button
            @click="removeFile(index)"
            class="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors"
          >
            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-6 py-4 border-t border-[#00E5FF]/20">
        <div class="text-sm text-gray-400">
          总大小: {{ formatFileSize(totalSize) }}
        </div>
        <div class="flex gap-3">
          <button
            @click="$emit('cancel')"
            class="px-6 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            @click="$emit('confirm', files)"
            class="px-6 py-2 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/50 transition-colors font-medium"
          >
            发送 ({{ files.length }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FileCryptoService } from '@/shared/lib/cryptoFile'

interface FileWithPreview extends File {
  preview?: string
}

interface Props {
  files: FileWithPreview[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: [files: FileWithPreview[]]
  cancel: []
  remove: [index: number]
}>()

const totalSize = computed(() => {
  return props.files.reduce((sum, file) => sum + file.size, 0)
})

const formatFileSize = (bytes: number): string => {
  return FileCryptoService.formatFileSize(bytes)
}

const getFileTypeLabel = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '图片'
  if (mimeType.startsWith('video/')) return '视频'
  return '文件'
}

const removeFile = (index: number): void => {
  emit('remove', index)
}
</script>
