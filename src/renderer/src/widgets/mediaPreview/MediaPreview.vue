<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        @click="handleClose"
      >
        <!-- 关闭按钮 -->
        <button
          class="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white text-2xl transition-all z-10"
          @click="handleClose"
          title="关闭 (ESC)"
        >
          ×
        </button>

        <!-- 文件信息 -->
        <div
          class="absolute top-6 left-6 bg-black/50 backdrop-blur-md rounded-lg px-4 py-2 border border-white/10 z-10"
        >
          <div class="text-white text-sm font-mono">{{ fileName }}</div>
          <div class="text-white/60 text-xs mt-1">{{ fileSize }}</div>
        </div>

        <!-- 图片缩放控制 -->
        <div
          v-if="mediaType === 'IMAGE'"
          class="absolute top-6 right-24 bg-black/50 backdrop-blur-md rounded-lg px-3 py-2 border border-white/10 z-10 flex items-center gap-2"
        >
          <button
            @click.stop="handleZoomOut"
            class="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title="缩小"
          >
            −
          </button>
          <span class="text-white text-sm font-mono min-w-[3rem] text-center">{{ Math.round(scale * 100) }}%</span>
          <button
            @click.stop="handleZoomIn"
            class="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            title="放大"
          >
            +
          </button>
          <button
            @click.stop="handleResetZoom"
            class="w-8 h-8 rounded bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all text-xs"
            title="重置"
          >
            1:1
          </button>
        </div>

        <!-- 媒体内容 -->
        <div class="w-full h-full flex items-center justify-center p-20" @click.stop>
          <!-- 图片预览 -->
          <div
            v-if="mediaType === 'IMAGE'"
            class="w-full h-full flex items-center justify-center"
            @wheel.prevent="handleWheel"
          >
            <img
              :src="mediaUrl"
              :alt="fileName"
              :style="{ 
                transform: `scale(${scale})`, 
                transformOrigin: 'center', 
                transition: 'transform 0.2s',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }"
              class="rounded-lg shadow-2xl cursor-move"
              draggable="false"
              @mousedown="handleMouseDown"
            />
          </div>

          <!-- 视频预览 -->
          <video
            v-else-if="mediaType === 'VIDEO'"
            ref="videoRef"
            :src="mediaUrl"
            controls
            autoplay
            class="rounded-lg shadow-2xl"
            style="width: 100%; height: 100%; object-fit: contain;"
            @click.stop
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- 下载按钮 -->
        <button
          class="absolute bottom-6 right-6 px-6 py-3 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF]/50 text-[#00E5FF] font-mono transition-all z-10"
          @click.stop="handleDownload"
          title="下载文件"
        >
          <span class="mr-2">⬇</span>
          下载
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  mediaType: 'IMAGE' | 'VIDEO'
  mediaUrl: string
  fileName: string
  fileSize: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// 未使用的变量，注释掉
// const videoRef = ref<HTMLVideoElement>()
const scale = ref(1)
// 未使用的变量，注释掉
// const isDragging = ref(false)
// const dragStart = ref({ x: 0, y: 0 })

const handleClose = () => {
  scale.value = 1
  emit('close')
}

const handleDownload = () => {
  const a = document.createElement('a')
  a.href = props.mediaUrl
  a.download = props.fileName
  a.click()
}

// 缩放控制
const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 5)
}

const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.25)
}

const handleResetZoom = () => {
  scale.value = 1
}

// 鼠标滚轮缩放
const handleWheel = (e: WheelEvent) => {
  if (props.mediaType === 'IMAGE') {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    scale.value = Math.max(0.25, Math.min(5, scale.value + delta))
  }
}

// 拖拽移动（暂不实现，保持简单）
const handleMouseDown = (_e: MouseEvent) => {
  // 可以添加拖拽功能
}

// ESC 键关闭
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 阻止背景滚动
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = 'hidden'
      scale.value = 1
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
