<template>
  <div class="h-full w-full flex flex-col bg-[#0A0A0C] relative" @click="handleClickOutside">
    <!-- 星空背景 -->
    <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        v-for="star in stars"
        :key="star.id"
        class="absolute rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-twinkle"
        :style="{
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          opacity: star.opacity,
          animationDuration: star.duration,
          animationDelay: star.delay
        }"
      ></div>
    </div>

    <!-- Title Bar -->
    <TitleBar
      :title="`鸦口无言 - ${connectionStatusText}`"
      @minimize="minimizeWindow"
      @maximize="maximizeWindow"
      @close="closeWindow"
    />

    <!-- Main Content: Three Column Layout -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar -->
      <Sidebar
        :activeTab="activeTab"
        @switchTab="handleSwitchTab"
        @showProfile="showProfileModal = true"
        @showSettings="showSettingsModal = true"
      />

      <!-- Middle List (Session or Contacts) -->
      <SessionList
        v-if="activeTab === 'messages'"
        @selectSession="selectSession"
        @createGroup="showCreateGroupModal = true"
      />
      <ContactsPage v-else-if="activeTab === 'contacts'" @selectContact="handleSelectContact" />

      <!-- Right Workspace -->
      <div class="flex-1 flex flex-col bg-[#0A0A0C]">
        <template v-if="activeSession">
          <!-- Chat Header -->
          <ChatHeader
            :session-name="activeSession.name"
            :is-group="activeSession.type === 'GROUP'"
            :member-count="activeSession.memberCount"
            :is-online="activeSession.isOnline"
            @showMembers="handleShowMembers"
          />

          <!-- Messages Area -->
          <MessageList
            ref="messageListRef"
            :messages="currentMessages"
            :current-user-id="currentUserId"
            :sender-names="senderNamesMap"
            :is-group="activeSession.type === 'GROUP'"
            @deleteMessage="handleDeleteMessage"
            @showContextMenu="showMessageMenu"
          />

          <!-- Input Area -->
          <MessageInput
            v-model="messageInput"
            @send="sendMessage"
            @sendFiles="handleSendFiles"
            @screenshot="handleScreenshot"
          />
        </template>

        <!-- No Session Selected -->
        <EmptyState v-else />
      </div>
    </div>

    <!-- Profile Modal -->
    <ProfileModal
      :show="showProfileModal"
      :user="currentUser"
      v-model:displayName="editForm.displayName"
      v-model:phone="editForm.phone"
      :uploading="uploadingAvatar"
      :saving="savingProfile"
      @close="showProfileModal = false"
      @save="handleSaveProfile"
      @logout="handleLogout"
      @uploadAvatar="handleAvatarUpload"
    />

    <!-- Settings Modal -->
    <SettingsModal
      :show="showSettingsModal"
      @close="showSettingsModal = false"
      @showProfile="handleShowProfileFromSettings"
      @checkUpdate="showUpdateModal = true"
      @logout="handleLogout"
    />

    <!-- Update Modal -->
    <UpdateModal
      :show="showUpdateModal"
      @close="showUpdateModal = false"
    />

    <!-- Context Menu -->
    <ContextMenu
      :show="showContextMenu"
      :x="contextMenuX"
      :y="contextMenuY"
      @close="showContextMenu = false"
      @delete="handleDeleteMessage(selectedMessageId)"
    />

    <!-- Create Group Modal -->
    <CreateGroupModal
      :show="showCreateGroupModal"
      :contacts="contactList"
      @close="showCreateGroupModal = false"
      @create="handleCreateGroup"
    />

    <!-- Group Members Modal -->
    <GroupMembersModal
      :show="showGroupMembersModal"
      :group-name="currentGroupName"
      :members="currentGroupMembers"
      :current-user-id="currentUserId"
      @close="showGroupMembersModal = false"
      @inviteMembers="handleInviteMembers"
      @dissolveGroup="handleDissolveGroup"
      @updateGroupName="handleUpdateGroupName"
    />

    <!-- Invite Members Modal -->
    <InviteMembersModal
      :show="showInviteMembersModal"
      :contacts="contactList"
      :existing-member-ids="currentGroupMembers.map(m => m.userId)"
      @close="showInviteMembersModal = false"
      @invite="handleConfirmInvite"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      v-if="showConfirmModal"
      :title="confirmModalConfig.title"
      :message="confirmModalConfig.message"
      :confirm-text="confirmModalConfig.confirmText"
      :type="confirmModalConfig.type"
      @confirm="confirmModalConfig.onConfirm"
      @cancel="showConfirmModal = false"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-if="showAlertModal"
      :title="alertModalConfig.title"
      :message="alertModalConfig.message"
      :type="alertModalConfig.type"
      @close="showAlertModal = false"
    />

    <!-- File Upload Preview -->
    <!-- Upload Progress -->
    <UploadProgress
      :uploads="uploadQueue"
      @cancel="handleCancelUploadItem"
      @retry="handleRetryUpload"
      @remove="handleRemoveUploadItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/entities/session/model/useSessionStore'
import { useMessageStore } from '@/entities/message/model/useMessageStore'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { useNetworkStore } from '@/entities/network/model/useNetworkStore'
import { useContactStore } from '@/entities/contact/model/useContactStore'
import { sessionApi } from '@/shared/api/session'
import { websocketService } from '@/shared/api/websocket'
import { userApi } from '@/shared/api/user'
import type { Contact } from '@/entities/contact/model/useContactStore'
import type { Message } from '@/shared/types'
import { MessageStatus, MessageType } from '@/shared/types'

// 生成随机星空数据
const stars = ref<Array<{
  id: number
  left: string
  top: string
  size: string
  duration: string
  delay: string
  opacity: number
}>>([])

// 初始化星空
const initStars = () => {
  stars.value = Array.from({ length: 80 }).map(() => ({
    id: Math.random(),
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`,
    duration: `${Math.random() * 3 + 2}s`,
    delay: `${Math.random() * 5}s`,
    opacity: Math.random() * 0.4 + 0.2
  }))
}

// Components
import TitleBar from '@/widgets/titleBar/TitleBar.vue'
import Sidebar from '@/widgets/sidebar/Sidebar.vue'
import SessionList from '@/widgets/sessionList/SessionList.vue'
import ContactsPage from '@/pages/contacts/ContactsPage.vue'
import ChatHeader from '@/widgets/chatHeader/ChatHeader.vue'
import MessageList from '@/widgets/messageList/MessageList.vue'
import MessageInput from '@/widgets/messageInput/MessageInput.vue'
import EmptyState from '@/widgets/emptyState/EmptyState.vue'
import ProfileModal from '@/widgets/profileModal/ProfileModal.vue'
import SettingsModal from '@/widgets/settingsModal/SettingsModal.vue'
import UpdateModal from '@/widgets/updateModal/UpdateModal.vue'
import ContextMenu from '@/widgets/contextMenu/ContextMenu.vue'
import CreateGroupModal from '@/widgets/createGroupModal/CreateGroupModal.vue'
import GroupMembersModal from '@/widgets/groupMembersModal/GroupMembersModal.vue'
import InviteMembersModal from '@/widgets/inviteMembersModal/InviteMembersModal.vue'
import ConfirmModal from '@/widgets/confirmModal/ConfirmModal.vue'
import AlertModal from '@/widgets/alertModal/AlertModal.vue'
import UploadProgress from '@/widgets/uploadProgress/UploadProgress.vue'

const router = useRouter()
const sessionStore = useSessionStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const networkStore = useNetworkStore()

// Refs
const activeTab = ref<'messages' | 'contacts'>('messages')
const messageInput = ref('')
const messageListRef = ref<InstanceType<typeof MessageList>>()
const showProfileModal = ref(false)
const showSettingsModal = ref(false)
const showUpdateModal = ref(false)
const showContextMenu = ref(false)
const showCreateGroupModal = ref(false)
const showGroupMembersModal = ref(false)
const showInviteMembersModal = ref(false)
const showConfirmModal = ref(false)
const showAlertModal = ref(false)
const alertModalConfig = ref({
  title: '',
  message: '',
  type: 'info' as 'info' | 'success' | 'error'
})
const confirmModalConfig = ref({
  title: '',
  message: '',
  confirmText: '确定',
  type: 'normal' as 'normal' | 'danger',
  onConfirm: () => {}
})
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const selectedMessageId = ref<string | null>(null)
const uploadingAvatar = ref(false)
const savingProfile = ref(false)
const editForm = ref({
  displayName: '',
  phone: ''
})

// Computed
const activeSessionId = computed(() => sessionStore.activeSessionId)
const activeSession = computed(() => sessionStore.activeSession)
const currentUserId = computed(() => authStore.userId || 'current-user')
const currentUser = computed(() => authStore.currentUser)

// 联系人列表（用于创建群聊）
const contactStore = useContactStore()
const contactList = computed(() => contactStore.contacts)

// 当前群聊信息
const currentGroupName = computed(() => {
  if (activeSession.value?.type === 'GROUP') {
    return activeSession.value.name || '未命名群聊'
  }
  return ''
})

const currentGroupMembers = ref<Array<{
  userId: string
  showName: string
  username: string
  avatar: string | null
  userType: 'OWNER' | 'MEMBER'
  isOnline: boolean
}>>([])

// 加载群成员列表
const loadGroupMembers = async (sessionId: string): Promise<void> => {
  try {
    console.log('🔍 加载群成员列表:', sessionId)
    const members = await sessionApi.getGroupMembers(sessionId)
    currentGroupMembers.value = members
    console.log('✅ 群成员列表加载成功:', members)
  } catch (error) {
    console.error('❌ 加载群成员列表失败:', error)
    currentGroupMembers.value = []
  }
}

const connectionStatusText = computed(() => {
  switch (networkStore.connectionStatus) {
    case 'CONNECTED':
      return '已连接'
    case 'RECONNECTING':
      return '重连中...'
    case 'DISCONNECTED':
      return '未连接'
    default:
      return ''
  }
})

const currentMessages = computed(() => {
  if (!activeSessionId.value) return []
  return messageStore.getMessages(activeSessionId.value)
})

const senderNamesMap = computed(() => {
  const map: Record<string, string> = {}
  if (activeSession.value) {
    map[currentUserId.value] = authStore.currentUser?.displayName || 'Me'
    // Add other participants' names here if needed
    map['other'] = activeSession.value.name
  }
  return map
})

// Window Controls
const minimizeWindow = async (): Promise<void> => {
  await window.api.window.minimize()
}

const maximizeWindow = async (): Promise<void> => {
  await window.api.window.maximize()
}

const closeWindow = async (): Promise<void> => {
  console.log('🚪 关闭窗口...')
  
  // 快速断开 WebSocket（不等待）
  try {
    websocketService.disconnect()
  } catch (error) {
    console.warn('⚠️ 断开 WebSocket 时出错（忽略）:', error)
  }
  
  // 立即关闭窗口
  await window.api.window.close()
}

// Tab Switching
const handleSwitchTab = (tab: 'messages' | 'contacts'): void => {
  activeTab.value = tab
}

// Session Selection
const selectSession = async (sessionId: string): Promise<void> => {
  sessionStore.setActiveSession(sessionId)
  const result = await messageStore.loadMessages(sessionId)

  if (result.success) {
    const messages = messageStore.getMessages(sessionId)
    const unreadMessages = messages.filter((m) => !m.isRead && m.senderId !== authStore.userId)

    if (unreadMessages.length > 0) {
      const messageIds = unreadMessages.map((m) => m.id)
      await messageStore.markBatchAsRead(sessionId, messageIds)
    }

    nextTick(() => {
      messageListRef.value?.scrollToBottom()
    })
  }
}

// Contact Selection
const handleSelectContact = async (contact: Contact): Promise<void> => {
  if (!contact.userId) {
    showAlert('联系人数据错误，无法创建会话', 'error')
    return
  }

  try {
    const result = await sessionApi.createPrivate({ targetUserId: contact.userId })
    await sessionStore.loadSessions()
    activeTab.value = 'messages'
    sessionStore.setActiveSession(result.sessionId)
  } catch (error) {
    console.error('❌ 创建会话失败:', error)
    showAlert('创建会话失败: ' + (error instanceof Error ? error.message : String(error)), 'error')
  }
}

// Message Sending
const sendMessage = async (): Promise<void> => {
  if (!messageInput.value.trim() || !activeSessionId.value) return

  await messageStore.sendMessage(activeSessionId.value, messageInput.value)
  messageInput.value = ''

  nextTick(() => {
    messageListRef.value?.scrollToBottom()
  })
}

// Message Deletion
const showMessageMenu = (event: MouseEvent, messageId: string): void => {
  selectedMessageId.value = messageId
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenu.value = true
}

const handleDeleteMessage = (messageId: string | null): void => {
  if (!messageId || !activeSessionId.value) return

  showContextMenu.value = false

  confirmModalConfig.value = {
    title: '确定删除这条消息吗？',
    message: '注意：删除后仅对你隐藏，其他人仍可见。',
    confirmText: '删除',
    type: 'danger',
    onConfirm: async () => {
      try {
        const result = await messageStore.deleteSingleMessage(activeSessionId.value!, messageId)
        showConfirmModal.value = false
        if (!result.success) {
          showAlert('删除失败: ' + result.error, 'error')
        }
      } catch (error) {
        console.error('❌ 删除消息异常:', error)
        showAlert('删除失败', 'error')
      }
    }
  }
  showConfirmModal.value = true
}

// 处理截图按钮点击
const handleScreenshot = (): void => {
  showAlert('用微信的不就行了 📸', 'info', '鸦雀无声')
}

// File Handling
const uploadQueue = ref<Array<{
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}>>([])

// 处理文件发送
const handleSendFiles = async (files: File[]): Promise<void> => {
  if (!activeSessionId.value) return
  
  console.log('发送文件:', files)
  
  for (const file of files) {
    await uploadFile(file)
  }
}

const uploadFile = async (file: File): Promise<void> => {
  if (!activeSessionId.value) return
  
  // 检查文件大小（最大 50MB）
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    showAlert(`文件大小不能超过 50MB\n当前文件: ${(file.size / 1024 / 1024).toFixed(2)}MB`, 'error')
    return
  }
  
  const uploadId = `upload-${Date.now()}-${Math.random()}`
  const uploadItem = {
    id: uploadId,
    fileName: file.name,
    fileSize: file.size,
    progress: 0,
    status: 'uploading' as const
  }
  
  uploadQueue.value.push(uploadItem)
  
  try {
    // 动态导入模块
    const { FileCryptoService } = await import('@/shared/lib/cryptoFile')
    const { mediaApi } = await import('@/shared/api/media')
    const { CryptoService } = await import('@/shared/lib/crypto')
    const { backendCrypto } = await import('@/shared/lib/cryptoBackend')
    
    // 获取会话密钥
    const sessionKeyBase64 = backendCrypto.getSessionKey(activeSessionId.value)
    if (!sessionKeyBase64) {
      throw new Error('会话密钥不存在')
    }
    
    const sessionKey = await CryptoService.importAESKey(sessionKeyBase64)
    
    // 加密文件（返回包含 IV 的 ArrayBuffer）
    const encryptedData = await FileCryptoService.encryptFile(file, sessionKey)
    const encryptedBlob = new Blob([encryptedData])
    
    // 加密文件名
    const encryptedFileName = await FileCryptoService.encryptText(file.name, sessionKey)
    
    // 确定 mimeType，如果为空则使用默认值
    const mimeType = file.type || 'application/octet-stream'
    
    // 确定消息类型
    let messageType: 'IMAGE' | 'VIDEO' = 'VIDEO'
    if (mimeType.startsWith('image/')) {
      messageType = 'IMAGE'
    }
    
    // 上传文件
    const result = await mediaApi.uploadMedia(
      {
        file: encryptedBlob,
        metadata: {
          sessionId: activeSessionId.value,
          fileName: encryptedFileName,
          fileSize: file.size,
          mimeType: mimeType,
          messageType: messageType
        }
      },
      (progress) => {
        const item = uploadQueue.value.find(u => u.id === uploadId)
        if (item) {
          item.progress = progress
        }
      }
    )
    
    // 更新状态
    const item = uploadQueue.value.find(u => u.id === uploadId)
    if (item) {
      item.status = 'success'
      item.progress = 100
    }
    
    // 发送媒体消息
    const messageContent = JSON.stringify({
      fileId: result.fileId,
      fileName: file.name,
      fileSize: file.size
    })
    
    const encryptedContent = backendCrypto.encryptWithSession(activeSessionId.value, messageContent)
    
    // 立即添加消息到本地（乐观更新）
    const tempMessageId = `temp-${Date.now()}-${Math.random()}`
    const localMessage: Message = {
      id: tempMessageId,
      sessionId: activeSessionId.value,
      senderId: authStore.userId || 'current-user',
      content: messageContent,
      iv: '',
      authTag: '',
      timestamp: new Date().toISOString(),
      status: MessageStatus.SENDING,
      isRead: false,
      type: messageType === 'IMAGE' ? MessageType.IMAGE : MessageType.FILE
    }
    
    messageStore.addMessage(activeSessionId.value, localMessage)
    console.log('✅ 媒体消息已添加到本地（乐观更新）:', tempMessageId)
    
    // 发送 WebSocket 消息
    websocketService.sendMessage(activeSessionId.value, {
      sessionId: activeSessionId.value,
      content: encryptedContent,
      encrypted: true,
      messageType: messageType === 'IMAGE' ? '2' : '3'
    })
    
    // 更新会话列表的最后一条消息预览
    const preview = messageType === 'IMAGE' ? '[图片]' : `[文件] ${file.name}`
    sessionStore.updateLastMessage(activeSessionId.value, preview, new Date().toISOString())
    
    console.log('✅ 媒体消息已发送到 WebSocket')
    
    // 立即移除上传项（不显示"上传成功"）
    uploadQueue.value = uploadQueue.value.filter(u => u.id !== uploadId)
    
  } catch (error) {
    console.error('❌ 文件上传失败:', error)
    const item = uploadQueue.value.find(u => u.id === uploadId)
    if (item) {
      item.status = 'error'
      item.error = error instanceof Error ? error.message : '上传失败'
    }
  }
}

const handleRetryUpload = async (uploadId: string): Promise<void> => {
  // TODO: 实现重试逻辑
  console.log('Retry upload:', uploadId)
}

const handleCancelUploadItem = (uploadId: string): void => {
  uploadQueue.value = uploadQueue.value.filter(u => u.id !== uploadId)
}

const handleRemoveUploadItem = (uploadId: string): void => {
  uploadQueue.value = uploadQueue.value.filter(u => u.id !== uploadId)
}

// Profile Management
const handleAvatarUpload = async (event: Event): Promise<void> => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    console.log('ℹ️ 没有选择文件')
    return
  }

  console.log('📤 开始上传头像:', file.name, (file.size / 1024).toFixed(2), 'KB')

  if (!file.type.startsWith('image/')) {
    showAlert('请选择图片文件', 'error')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    showAlert('图片大小不能超过5MB', 'error')
    return
  }

  uploadingAvatar.value = true

  try {
    console.log('🔄 调用上传 API...')
    const result = await userApi.uploadAvatar(file)
    console.log('✅ 头像上传成功:', result.avatarUrl)
    
    console.log('🔄 刷新用户信息...')
    await authStore.fetchUserInfo()
    console.log('✅ 用户信息已刷新')
    console.log('📸 当前用户对象:', authStore.currentUser)
    console.log('📸 当前用户头像 URL:', authStore.currentUser?.avatar)
    console.log('📸 头像 URL 类型:', typeof authStore.currentUser?.avatar)
    console.log('📸 头像 URL 长度:', authStore.currentUser?.avatar?.length)
    
    // 强制刷新弹窗以显示新头像
    showProfileModal.value = false
    await nextTick()
    showProfileModal.value = true
    
    showAlert('头像上传成功！', 'success')
  } catch (error: any) {
    console.error('❌ 头像上传失败:', error)
    
    let errorMessage = '未知错误'
    if (error.message) {
      errorMessage = error.message
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '上传超时，请检查网络连接'
    }
    
    showAlert('头像上传失败: ' + errorMessage, 'error')
  } finally {
    uploadingAvatar.value = false
    target.value = ''
    console.log('🏁 头像上传流程结束')
  }
}

const handleSaveProfile = async (): Promise<void> => {
  if (!editForm.value.displayName.trim()) {
    showAlert('昵称不能为空', 'error')
    return
  }

  savingProfile.value = true

  try {
    await userApi.update({
      displayName: editForm.value.displayName,
      phone: editForm.value.phone || undefined
    })

    await authStore.fetchUserInfo()
    showAlert('个人信息更新成功！', 'success')
  } catch (error: any) {
    console.error('❌ 个人信息更新失败:', error)
    showAlert('更新失败: ' + (error.message || '未知错误'), 'error')
  } finally {
    savingProfile.value = false
  }
}

const handleLogout = (): void => {
  try {
    websocketService.disconnect()
  } catch (error) {
    console.warn('WebSocket 断开失败:', error)
  }

  authStore.logout()
  showProfileModal.value = false
  showSettingsModal.value = false
  router.push('/login')
}

const handleShowProfileFromSettings = (): void => {
  showProfileModal.value = true
  showSettingsModal.value = false
}

// Group Chat Handlers
const handleCreateGroup = async (data: { name: string; memberIds: string[] }): Promise<void> => {
  try {
    console.log('🔨 创建群聊:', data)
    const result = await sessionApi.createGroup(data)
    
    if (result.sessionId) {
      console.log('✅ 群聊创建成功:', result.sessionId)
      showCreateGroupModal.value = false
      
      // 刷新会话列表
      await sessionStore.loadSessions()
      
      // 切换到消息标签并选中新创建的群聊
      activeTab.value = 'messages'
      sessionStore.setActiveSession(result.sessionId)
    }
  } catch (error) {
    console.error('❌ 创建群聊失败:', error)
    showAlert('创建群聊失败: ' + (error instanceof Error ? error.message : String(error)), 'error')
  }
}

const handleShowMembers = async (): Promise<void> => {
  if (activeSession.value?.type === 'GROUP' && activeSession.value.id) {
    // 加载群成员列表
    await loadGroupMembers(activeSession.value.id)
    showGroupMembersModal.value = true
  }
}

// 邀请成员
const handleInviteMembers = (): void => {
  showGroupMembersModal.value = false
  showInviteMembersModal.value = true
}

// 解散群聊
const handleDissolveGroup = (): void => {
  if (!activeSession.value?.id) return

  confirmModalConfig.value = {
    title: '确定要解散这个鸦群吗？',
    message: '解散后所有成员将被移除，聊天记录将被清空，此操作不可恢复！',
    confirmText: '解散',
    type: 'danger',
    onConfirm: async () => {
      try {
        console.log('🔨 解散群聊:', activeSession.value!.id)
        await sessionApi.dissolveGroup(activeSession.value!.id)
        
        showGroupMembersModal.value = false
        showConfirmModal.value = false
        
        // 刷新会话列表
        await sessionStore.loadSessions()
        
        // 清空当前会话
        sessionStore.setActiveSession('')
        
        showAlert('鸦群已解散', 'success')
      } catch (error) {
        console.error('❌ 解散群聊失败:', error)
        showAlert('解散失败: ' + (error instanceof Error ? error.message : String(error)), 'error')
      }
    }
  }
  showConfirmModal.value = true
}

// 更新群名称
const handleUpdateGroupName = async (newName: string): Promise<void> => {
  if (!activeSession.value?.id) return

  try {
    console.log('🔨 更新群名称:', newName)
    await sessionApi.updateGroupName(activeSession.value.id, newName)
    
    // 更新会话列表
    await sessionStore.loadSessions()
    await sessionStore.loadSessions()
    
    showAlert('群名称已更新', 'success')
  } catch (error) {
    console.error('❌ 更新群名称失败:', error)
    showAlert('更新失败: ' + (error instanceof Error ? error.message : String(error)), 'error')
  }
}

// 确认邀请成员
const handleConfirmInvite = async (memberIds: string[]): Promise<void> => {
  if (!activeSession.value?.id) return

  try {
    console.log('🔨 邀请成员:', memberIds)
    const result = await sessionApi.inviteMembers(activeSession.value.id, memberIds)
    
    showInviteMembersModal.value = false
    
    // 重新加载群成员列表
    await loadGroupMembers(activeSession.value.id)
    
    if (result.failedUsers && result.failedUsers.length > 0) {
      showAlert(`邀请完成！\n成功: ${result.invitedCount} 人\n失败: ${result.failedUsers.length} 人`, 'info', '邀请结果')
    } else {
      showAlert(`邀请成功！已邀请 ${result.invitedCount} 人`, 'success')
    }
  } catch (error) {
    console.error('❌ 邀请成员失败:', error)
    showAlert('邀请失败: ' + (error instanceof Error ? error.message : String(error)), 'error')
  }
}

// UI Helpers
const handleClickOutside = (): void => {
  if (showContextMenu.value) {
    showContextMenu.value = false
  }
}

// Alert 辅助函数
const showAlert = (message: string, type: 'info' | 'success' | 'error' = 'info', title?: string) => {
  alertModalConfig.value = {
    title: title || '',
    message,
    type
  }
  showAlertModal.value = true
}

// Watchers
watch(showProfileModal, (newVal) => {
  if (newVal && currentUser.value) {
    editForm.value.displayName = currentUser.value.displayName || currentUser.value.username
    editForm.value.phone = currentUser.value.phone || ''
  }
})

// Lifecycle
onMounted(async () => {
  console.log('🚀 MainPage mounted')
  
  // 初始化星空背景
  initStars()
  
  // 检查 WebSocket 连接状态
  if (networkStore.connectionStatus !== 'CONNECTED') {
    console.log('⚠️ WebSocket 未连接，尝试重新连接...')
    websocketService.initialize()
    websocketService.connect()
  } else {
    console.log('✅ WebSocket 已连接')
  }
  
  // 并行加载会话列表、联系人列表和好友请求
  await Promise.all([
    sessionStore.loadSessions(),
    contactStore.loadContacts(),
    contactStore.loadPendingRequests()
  ])
  
  console.log('✅ MainPage 初始化完成')
})
</script>

<style scoped>
/* 星星闪烁动画 */
@keyframes twinkle {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    box-shadow: 0 0 10px #00E5FF;
  }
}

.animate-twinkle {
  animation-name: twinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}
</style>
