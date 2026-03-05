<template>
  <div class="fixed bottom-4 right-4 z-40 w-80 space-y-2">
    <div
      v-for="upload in uploads"
      :key="upload.id"
      class="bg-[#0A0A0C]/95 border border-[#00E5FF]/30 rounded-lg p-4 backdrop-blur-md shadow-lg"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center"
            :class="upload.status === 'error' ? 'bg-red-500/20' : 'bg-[#00E5FF]/20'"
          >
            <svg
              v-if="upload.status === 'uploading'"
              class="w-5 h-5 text-[#00E5FF] animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg
              v-else-if="upload.status === 'success'"
              class="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg
              v-else-if="upload.status === 'error'"
              class="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-[#00E5FF] truncate">
              {{ upload.fileName }}
            </p>
            <p class="text-xs text-gray-400">
              {{ getStatusText(upload) }}
            </p>
          </div>
        </div>
        <button
          v-if="upload.status === 'uploading'"
          @click="$emit('cancel', upload.id)"
          class="w-6 h-6 rounded flex items-center justify-center hover:bg-[#00E5FF]/10 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          v-else
          @click="$emit('remove', upload.id)"
          class="w-6 h-6 rounded flex items-center justify-center hover:bg-[#00E5FF]/10 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Progress Bar -->
      <div v-if="upload.status === 'uploading'" class="relative h-2 bg-[#1A1A1C] rounded-full overflow-hidden">
        <div
          class="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00E5FF] to-[#00B8D4] transition-all duration-300"
          :style="{ width: `${upload.progress}%` }"
        >
          <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="upload.status === 'error' && upload.error" class="mt-2 text-xs text-red-400">
        {{ upload.error }}
      </div>

      <!-- Retry Button -->
      <button
        v-if="upload.status === 'error'"
        @click="$emit('retry', upload.id)"
        class="mt-2 w-full px-3 py-1.5 rounded bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] text-sm transition-colors"
      >
        重试
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileCryptoService } from '@/shared/lib/cryptoFile'

export interface UploadItem {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

interface Props {
  uploads: UploadItem[]
}

defineProps<Props>()

defineEmits<{
  cancel: [id: string]
  retry: [id: string]
  remove: [id: string]
}>()

const getStatusText = (upload: UploadItem): string => {
  switch (upload.status) {
    case 'uploading':
      return `上传中 ${upload.progress}% • ${FileCryptoService.formatFileSize(upload.fileSize)}`
    case 'success':
      return `上传成功 • ${FileCryptoService.formatFileSize(upload.fileSize)}`
    case 'error':
      return `上传失败 • ${FileCryptoService.formatFileSize(upload.fileSize)}`
    default:
      return ''
  }
}
</script>
