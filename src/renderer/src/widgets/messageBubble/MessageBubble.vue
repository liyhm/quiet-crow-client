<template>
  <div style="margin-bottom: 12px;">
    <!-- Received Message -->
    <div v-if="!isMine" class="flex items-start gap-2.5">
      <div
        class="w-9 h-9 rounded-lg bg-[#0A0A0C] border border-white/10 flex-shrink-0 flex items-center justify-center text-[#555555] font-bold text-xs"
      >
        {{ senderInitial }}
      </div>
      <div class="flex flex-col max-w-[70%]">
        <!-- 群聊发言人名字 -->
        <div v-if="isGroup" class="text-[10px] text-[#00E5FF]/60 font-mono tracking-widest mb-1 ml-1">
          {{ senderName }}
        </div>
        
        <!-- 文本消息 -->
        <div
          v-if="messageType === 'TEXT'"
          class="rounded-xl rounded-tl-sm bg-[#1E1E24] border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          style="padding: 8px 12px;"
        >
          <div class="text-[13px] text-[#E0E0E0] leading-relaxed break-all">{{ content }}</div>
        </div>
        
        <!-- 图片消息 -->
        <div
          v-else-if="messageType === 'IMAGE'"
          class="rounded-xl rounded-tl-sm overflow-hidden bg-[#1E1E24] border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          <!-- 加载中 -->
          <div
            v-if="loadingMedia"
            class="w-48 h-48 flex items-center justify-center bg-[#1E1E24]"
          >
            <div class="text-[#00E5FF] text-sm">加载中...</div>
          </div>
          <!-- 图片 -->
          <img
            v-else-if="mediaUrl"
            :src="mediaUrl"
            :alt="mediaFileName"
            class="max-w-xs max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
            @click="handleImageClick"
            @error="handleMediaError"
          />
          <!-- 加载失败 -->
          <div
            v-else
            class="w-48 h-48 flex items-center justify-center bg-[#1E1E24]"
          >
            <div class="text-[#666] text-sm">加载失败</div>
          </div>
        </div>
        
        <!-- 视频消息 -->
        <div
          v-else-if="messageType === 'VIDEO'"
          class="rounded-xl rounded-tl-sm overflow-hidden bg-[#1E1E24] border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.3)] cursor-pointer relative"
          @click="handleImageClick"
        >
          <!-- 视频第一帧作为缩略图 -->
          <video
            :src="mediaUrl"
            class="max-w-xs max-h-80 pointer-events-none"
            preload="metadata"
            @error="handleMediaError"
          >
            您的浏览器不支持视频播放
          </video>
          <!-- 播放按钮覆盖层 -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/30">
            <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl hover:bg-white/30 transition-all">
              ▶
            </div>
          </div>
          <!-- 视频时长显示在右下角 -->
          <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs font-mono">
            {{ mediaFileSize }}
          </div>
        </div>
        
        <!-- 文件消息 -->
        <div
          v-else-if="messageType === 'FILE'"
          class="rounded-xl rounded-tl-sm bg-[#1E1E24] border border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.3)] cursor-pointer hover:bg-[#252530] transition-colors"
          style="padding: 8px 12px;"
          @click="handleFileDownload"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] text-xl">
              📎
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] text-[#E0E0E0] truncate">{{ mediaFileName }}</div>
              <div class="text-[11px] text-[#666]">{{ mediaFileSize }}</div>
            </div>
          </div>
        </div>
        
        <div class="text-[10px] text-[#555555] mt-1 ml-1 font-mono">
          {{ formattedTime }}
        </div>
      </div>
    </div>

    <!-- Sent Message -->
    <div v-else class="flex items-start gap-2.5 justify-end">
      <div class="flex flex-col items-end max-w-[70%]">
        <!-- 文本消息 -->
        <div
          v-if="messageType === 'TEXT'"
          class="rounded-xl rounded-tr-sm bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#E0E0E0] shadow-[0_2px_10px_rgba(0,229,255,0.05)] cursor-pointer hover:bg-[#00E5FF]/15 transition-all relative group"
          style="padding: 8px 12px;"
          @contextmenu.prevent="$emit('contextmenu', $event)"
        >
          <div class="text-[13px] leading-relaxed break-all">{{ content }}</div>
          <button
            @click="$emit('delete')"
            class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF3366] hover:bg-[#FF3366]/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            title="删除消息"
          >
            ×
          </button>
        </div>
        
        <!-- 图片消息 -->
        <div
          v-else-if="messageType === 'IMAGE'"
          class="rounded-xl rounded-tr-sm overflow-hidden bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-[0_2px_10px_rgba(0,229,255,0.05)] relative group"
          @contextmenu.prevent="$emit('contextmenu', $event)"
        >
          <!-- 加载中 -->
          <div
            v-if="loadingMedia"
            class="w-48 h-48 flex items-center justify-center bg-[#00E5FF]/10"
          >
            <div class="text-[#00E5FF] text-sm">加载中...</div>
          </div>
          <!-- 图片 -->
          <img
            v-else-if="mediaUrl"
            :src="mediaUrl"
            :alt="mediaFileName"
            class="max-w-xs max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
            @click="handleImageClick"
            @error="handleMediaError"
          />
          <!-- 加载失败 -->
          <div
            v-else
            class="w-48 h-48 flex items-center justify-center bg-[#00E5FF]/10"
          >
            <div class="text-[#00E5FF]/60 text-sm">加载失败</div>
          </div>
          <button
            @click="$emit('delete')"
            class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF3366] hover:bg-[#FF3366]/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            title="删除消息"
          >
            ×
          </button>
        </div>
        
        <!-- 视频消息 -->
        <div
          v-else-if="messageType === 'VIDEO'"
          class="rounded-xl rounded-tr-sm overflow-hidden bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-[0_2px_10px_rgba(0,229,255,0.05)] relative group cursor-pointer"
          @click="handleImageClick"
          @contextmenu.prevent="$emit('contextmenu', $event)"
        >
          <!-- 视频第一帧作为缩略图 -->
          <video
            :src="mediaUrl"
            class="max-w-xs max-h-80 pointer-events-none"
            preload="metadata"
            @error="handleMediaError"
          >
            您的浏览器不支持视频播放
          </video>
          <!-- 播放按钮覆盖层 -->
          <div class="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <div class="w-16 h-16 rounded-full bg-[#00E5FF]/20 backdrop-blur-sm flex items-center justify-center text-[#00E5FF] text-3xl group-hover:bg-[#00E5FF]/30 transition-all">
              ▶
            </div>
          </div>
          <!-- 视频时长显示在右下角 -->
          <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[#00E5FF] text-xs font-mono">
            {{ mediaFileSize }}
          </div>
          <button
            @click.stop="$emit('delete')"
            class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF3366] hover:bg-[#FF3366]/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10"
            title="删除消息"
          >
            ×
          </button>
        </div>
        
        <!-- 文件消息 -->
        <div
          v-else-if="messageType === 'FILE'"
          class="rounded-xl rounded-tr-sm bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-[0_2px_10px_rgba(0,229,255,0.05)] cursor-pointer hover:bg-[#00E5FF]/15 transition-all relative group"
          style="padding: 8px 12px;"
          @click="handleFileDownload"
          @contextmenu.prevent="$emit('contextmenu', $event)"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] text-xl">
              📎
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] text-[#E0E0E0] truncate">{{ mediaFileName }}</div>
              <div class="text-[11px] text-[#00E5FF]/60">{{ mediaFileSize }}</div>
            </div>
          </div>
          <button
            @click.stop="$emit('delete')"
            class="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#FF3366] hover:bg-[#FF3366]/80 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            title="删除消息"
          >
            ×
          </button>
        </div>
        
        <div class="text-[10px] text-[#555555] mt-1 mr-1 font-mono text-right">
          {{ formattedTime }}
        </div>
      </div>
      <div
        class="w-9 h-9 rounded-lg bg-[#0A0A0C] border border-[#00E5FF]/50 flex-shrink-0 flex items-center justify-center text-[#00E5FF] font-bold text-xs"
      >
        {{ senderInitial }}
      </div>
    </div>

    <!-- 媒体预览 -->
    <MediaPreview
      :show="showPreview"
      :media-type="messageType === 'IMAGE' ? 'IMAGE' : 'VIDEO'"
      :media-url="mediaUrl"
      :file-name="mediaFileName"
      :file-size="mediaFileSize"
      @close="handleClosePreview"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import MediaPreview from '@/widgets/mediaPreview/MediaPreview.vue'

const props = defineProps<{
  content: string
  timestamp: string
  isMine: boolean
  senderName: string
  isGroup?: boolean
  messageType?: string
  sessionId?: string
}>()

defineEmits<{
  (e: 'delete'): void
  (e: 'contextmenu', event: MouseEvent): void
}>()

const mediaUrl = ref<string>('')
const mediaFileName = ref<string>('')
const mediaFileSize = ref<string>('')
const loadingMedia = ref(false)
const showPreview = ref(false)

const senderInitial = computed(() => {
  return props.senderName?.[0]?.toUpperCase() || 'U'
})

const formattedTime = computed(() => {
  const date = new Date(props.timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}小时前`

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 加载媒体文件
const loadMediaFile = async () => {
  if (props.messageType !== 'IMAGE' && props.messageType !== 'VIDEO' && props.messageType !== 'FILE') {
    return
  }
  
  if (loadingMedia.value) return
  loadingMedia.value = true
  
  try {
    console.log('🖼️ [MessageBubble] 开始加载媒体文件')
    console.log('🖼️ [MessageBubble] messageType:', props.messageType)
    console.log('🖼️ [MessageBubble] content:', props.content)
    console.log('🖼️ [MessageBubble] sessionId:', props.sessionId)
    
    // 检查是否是解密失败的消息
    if (props.content.startsWith('[解密失败:')) {
      console.error('❌ [MessageBubble] 消息解密失败，无法加载媒体文件')
      mediaFileName.value = '解密失败'
      mediaFileSize.value = ''
      throw new Error('消息解密失败')
    }
    
    // 解析消息内容获取 fileId
    let mediaData
    try {
      mediaData = JSON.parse(props.content)
    } catch (parseError) {
      console.error('❌ [MessageBubble] JSON 解析失败:', parseError)
      console.error('❌ [MessageBubble] content 内容:', props.content)
      console.error('❌ [MessageBubble] content 类型:', typeof props.content)
      console.error('❌ [MessageBubble] content 长度:', props.content.length)
      
      // 如果内容看起来像是 fileId（32位十六进制），尝试直接使用
      if (/^[a-f0-9]{32}$/i.test(props.content)) {
        console.warn('⚠️ [MessageBubble] 内容看起来像 fileId，尝试直接使用')
        mediaData = {
          fileId: props.content,
          fileName: '未知文件',
          fileSize: 0
        }
      } else {
        mediaFileName.value = '格式错误'
        mediaFileSize.value = ''
        throw new Error('消息格式错误')
      }
    }
    
    const { fileId, fileName, fileSize } = mediaData
    
    console.log('🖼️ [MessageBubble] 解析结果:', { fileId, fileName, fileSize })
    
    mediaFileName.value = fileName || '未知文件'
    mediaFileSize.value = formatFileSize(fileSize || 0)
    
    if (!props.sessionId) {
      throw new Error('缺少 sessionId')
    }
    
    if (!fileId) {
      throw new Error('缺少 fileId')
    }
    
    console.log('🖼️ [MessageBubble] 开始下载文件:', fileId)
    
    // 动态导入模块
    const { mediaApi } = await import('@/shared/api/media')
    const { FileCryptoService } = await import('@/shared/lib/cryptoFile')
    const { CryptoService } = await import('@/shared/lib/crypto')
    const { backendCrypto } = await import('@/shared/lib/cryptoBackend')
    
    // 下载加密文件
    const result = await mediaApi.downloadMedia(fileId)
    console.log('✅ [MessageBubble] 文件下载成功，大小:', result.data.byteLength)
    
    // 获取会话密钥
    const sessionKeyBase64 = backendCrypto.getSessionKey(props.sessionId)
    if (!sessionKeyBase64) {
      throw new Error('会话密钥不存在')
    }
    
    const sessionKey = await CryptoService.importAESKey(sessionKeyBase64)
    console.log('🔑 [MessageBubble] 会话密钥已获取')
    
    // 解密文件
    const decryptedData = await FileCryptoService.decryptFile(result.data, sessionKey)
    console.log('🔓 [MessageBubble] 文件解密成功，大小:', decryptedData.byteLength)
    
    // 创建 Blob URL
    const blob = new Blob([decryptedData], { type: result.mimeType })
    mediaUrl.value = URL.createObjectURL(blob)
    console.log('✅ [MessageBubble] Blob URL 已创建:', mediaUrl.value)
    
  } catch (error) {
    console.error('❌ [MessageBubble] 加载媒体文件失败:', error)
    mediaUrl.value = ''
  } finally {
    loadingMedia.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

// 处理图片/视频点击
const handleImageClick = () => {
  if (mediaUrl.value) {
    showPreview.value = true
  }
}

const handleClosePreview = () => {
  showPreview.value = false
}

// 处理文件下载
const handleFileDownload = () => {
  if (!mediaUrl.value) return
  
  const a = document.createElement('a')
  a.href = mediaUrl.value
  a.download = mediaFileName.value
  a.click()
}

// 处理媒体加载错误
const handleMediaError = () => {
  console.error('媒体文件加载失败')
}

// 组件挂载时加载媒体文件
onMounted(() => {
  if (props.messageType === 'IMAGE' || props.messageType === 'VIDEO' || props.messageType === 'FILE') {
    loadMediaFile()
  }
})
</script>
