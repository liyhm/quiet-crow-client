<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]"
    @click.self="handleClose"
  >
    <div
      class="w-[480px] bg-[#0A0A0C]/95 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1),inset_0_0_20px_rgba(0,229,255,0.05)] overflow-hidden"
      style="padding: 32px"
    >
      <!-- 顶部光带 -->
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-[#00E5FF]/80 to-transparent opacity-70"
        style="margin: -32px 0 0 0"
      ></div>

      <!-- 标题 -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]"></div>
        <div class="flex items-baseline gap-2">
          <span class="text-[#555555] text-[11px] font-mono tracking-wider">>></span>
          <span class="text-[#E0E0E0] text-[16px] font-medium tracking-wide">{{ title }}</span>
          <span class="text-[#00E5FF] text-[10px] font-mono tracking-widest uppercase">UPDATE</span>
        </div>
      </div>

      <!-- 内容 -->
      <div class="mb-8">
        <!-- 检查更新中 -->
        <div v-if="status === 'checking'" class="text-center py-8">
          <div class="inline-block w-12 h-12 border-4 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full animate-spin mb-4"></div>
          <p class="text-[#85858A] text-[13px]">正在检查更新...</p>
        </div>

        <!-- 发现新版本 -->
        <div v-else-if="status === 'available'" class="space-y-4">
          <div class="bg-black/30 border border-[#00E5FF]/20 rounded-xl p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[#85858A] text-[11px] font-mono">当前版本</span>
              <span class="text-[#E0E0E0] text-[13px] font-mono">{{ currentVersion }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[#85858A] text-[11px] font-mono">最新版本</span>
              <span class="text-[#00E5FF] text-[13px] font-mono font-bold">{{ updateInfo?.version }}</span>
            </div>
          </div>
          
          <div v-if="updateInfo?.releaseNotes" class="bg-black/20 border border-white/5 rounded-xl p-4 max-h-[200px] overflow-y-auto">
            <p class="text-[#85858A] text-[11px] font-mono mb-2">更新内容</p>
            <div class="text-[#E0E0E0] text-[12px] leading-relaxed whitespace-pre-wrap">{{ updateInfo.releaseNotes }}</div>
          </div>
        </div>

        <!-- 下载中 -->
        <div v-else-if="status === 'downloading'" class="space-y-4">
          <div class="text-center mb-4">
            <p class="text-[#00E5FF] text-[14px] font-mono mb-2">下载中...</p>
            <p class="text-[#85858A] text-[12px]">{{ downloadProgress.toFixed(1) }}%</p>
          </div>
          
          <div class="bg-black/30 border border-white/5 rounded-full h-3 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-[#00E5FF]/50 to-[#00E5FF] transition-all duration-300 shadow-[0_0_10px_rgba(0,229,255,0.5)]"
              :style="{ width: `${downloadProgress}%` }"
            ></div>
          </div>
          
          <div class="flex justify-between text-[10px] text-[#555555] font-mono">
            <span>{{ formatBytes(downloadedBytes) }}</span>
            <span>{{ formatBytes(totalBytes) }}</span>
          </div>
        </div>

        <!-- 下载完成 -->
        <div v-else-if="status === 'downloaded'" class="text-center py-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-[#00E5FF] text-[14px] font-medium mb-2">更新已下载完成</p>
          <p class="text-[#85858A] text-[12px]">点击"立即重启"安装更新</p>
        </div>

        <!-- 已是最新版本 -->
        <div v-else-if="status === 'not-available'" class="text-center py-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/40 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#00E5FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p class="text-[#00E5FF] text-[14px] font-medium mb-2">当前已是最新版本</p>
          <p class="text-[#85858A] text-[12px]">版本: {{ currentVersion }}</p>
        </div>

        <!-- 错误 -->
        <div v-else-if="status === 'error'" class="text-center py-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FF3366]/10 border border-[#FF3366]/40 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#FF3366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <p class="text-[#FF3366] text-[14px] font-medium mb-2">更新失败</p>
          <p class="text-[#85858A] text-[12px]">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="flex gap-3">
        <button
          v-if="status !== 'downloading'"
          @click="handleClose"
          class="flex-1 py-3 bg-black/40 border border-white/10 text-[#85858A] rounded-xl hover:bg-white/5 hover:text-white transition-all duration-300 text-[13px] font-bold tracking-wider"
        >
          {{ status === 'downloaded' ? '稍后重启' : '关闭' }}
        </button>
        
        <button
          v-if="status === 'available'"
          @click="handleDownload"
          :disabled="loading"
          class="flex-1 py-3 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 text-[13px] font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '准备中...' : '立即更新' }}
        </button>
        
        <button
          v-if="status === 'downloaded'"
          @click="handleInstall"
          class="flex-1 py-3 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 text-[13px] font-bold tracking-wider"
        >
          立即重启
        </button>
        
        <button
          v-if="status === 'error' || status === 'not-available'"
          @click="handleRetry"
          :disabled="loading"
          class="flex-1 py-3 bg-[#00E5FF]/10 border border-[#00E5FF]/40 text-[#00E5FF] rounded-xl hover:bg-[#00E5FF]/20 hover:border-[#00E5FF] hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all duration-300 text-[13px] font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '检查中...' : '重新检查' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const status = ref<'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>('checking')
const currentVersion = ref('')
const updateInfo = ref<any>(null)
const downloadProgress = ref(0)
const downloadedBytes = ref(0)
const totalBytes = ref(0)
const errorMessage = ref('')
const loading = ref(false)

const title = computed(() => {
  switch (status.value) {
    case 'checking': return '检查更新'
    case 'available': return '发现新版本'
    case 'downloading': return '下载更新'
    case 'downloaded': return '准备安装'
    case 'not-available': return '已是最新'
    case 'error': return '更新失败'
    default: return '系统更新'
  }
})

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleClose = () => {
  if (status.value !== 'downloading') {
    emit('close')
  }
}

const handleDownload = async () => {
  loading.value = true
  try {
    const result = await window.api.updater.download()
    if (!result.success) {
      status.value = 'error'
      errorMessage.value = result.error || '下载失败'
    }
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : '下载失败'
  } finally {
    loading.value = false
  }
}

const handleInstall = () => {
  window.api.updater.install()
}

const handleRetry = async () => {
  loading.value = true
  status.value = 'checking'
  errorMessage.value = ''
  
  try {
    const result = await window.api.updater.check()
    if (!result.success) {
      status.value = 'error'
      errorMessage.value = result.error || '检查更新失败'
    }
  } catch (error) {
    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : '检查更新失败'
  } finally {
    loading.value = false
  }
}

const handleUpdateMessage = (message: { event: string; data?: any }) => {
  console.log('📥 收到更新消息:', message)
  
  switch (message.event) {
    case 'checking-for-update':
      status.value = 'checking'
      break
      
    case 'update-available':
      status.value = 'available'
      updateInfo.value = message.data
      break
      
    case 'update-not-available':
      status.value = 'not-available'
      updateInfo.value = message.data
      break
      
    case 'download-progress':
      status.value = 'downloading'
      downloadProgress.value = message.data.percent || 0
      downloadedBytes.value = message.data.transferred || 0
      totalBytes.value = message.data.total || 0
      break
      
    case 'update-downloaded':
      status.value = 'downloaded'
      updateInfo.value = message.data
      break
      
    case 'update-error':
      status.value = 'error'
      errorMessage.value = message.data?.message || '未知错误'
      break
  }
}

onMounted(async () => {
  // 获取当前版本
  currentVersion.value = await window.api.updater.getVersion()
  
  // 监听更新消息
  window.api.updater.onUpdateMessage(handleUpdateMessage)
  
  // 开始检查更新
  if (props.show) {
    handleRetry()
  }
})

onUnmounted(() => {
  // 清理监听器
})
</script>
