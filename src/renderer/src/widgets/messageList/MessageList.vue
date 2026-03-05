<template>
  <div
    ref="containerRef"
    class="flex-1 overflow-y-auto scrollbar-thin"
    style="padding: 16px 24px 16px 20px;"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
    :class="{ 'bg-blue-50 border-2 border-dashed border-blue-400': isDragging }"
  >
    <MessageBubble
      v-for="message in messages"
      :key="message.id"
      :content="message.content"
      :timestamp="message.timestamp"
      :is-mine="message.senderId === currentUserId"
      :sender-name="getSenderName(message.senderId)"
      :is-group="isGroup"
      :message-type="message.type"
      :session-id="message.sessionId"
      @delete="$emit('deleteMessage', message.id)"
      @contextmenu="$emit('showContextMenu', $event, message.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import MessageBubble from '../messageBubble/MessageBubble.vue'

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  sessionId: string
  type?: string
}

const props = defineProps<{
  messages: Message[]
  currentUserId: string
  senderNames: Record<string, string>
  isGroup?: boolean
}>()

const emit = defineEmits<{
  (e: 'deleteMessage', id: string): void
  (e: 'showContextMenu', event: MouseEvent, messageId: string): void
  (e: 'fileDrop', files: FileList): void
}>()

const containerRef = ref<HTMLDivElement>()
const isDragging = ref(false)

const getSenderName = (senderId: string): string => {
  return props.senderNames[senderId] || 'U'
}

const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  if (e.target === containerRef.value) {
    isDragging.value = false
  }
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('fileDrop', files)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (containerRef.value) {
      containerRef.value.scrollTop = containerRef.value.scrollHeight
    }
  })
}

watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  }
)

defineExpose({
  scrollToBottom
})
</script>
