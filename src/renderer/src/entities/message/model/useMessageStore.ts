import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message } from '@/shared/types'
import { MessageStatus, MessageType } from '@/shared/types'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { websocketService } from '@/shared/api/websocket'
import { sessionApi } from '@/shared/api/session'
import { encryptionApi } from '@/shared/api/encryption'
import { backendCrypto } from '@/shared/lib/cryptoBackend'

// 辅助函数：根据 messageType 字符串和消息内容返回 MessageType 枚举
const getMessageType = (messageType: string, content?: string): MessageType => {
  switch (messageType) {
    case '1':
      return MessageType.TEXT
    case '2':
      return MessageType.IMAGE
    case '3':
      // 需要根据文件名判断是视频还是普通文件
      if (content) {
        let fileName = ''
        
        // 尝试解析 JSON
        try {
          const parsed = JSON.parse(content)
          fileName = parsed.fileName?.toLowerCase() || ''
        } catch {
          // JSON 解析失败，直接使用 content 作为文件名
          fileName = content.toLowerCase()
        }
        
        // 检查是否是视频文件
        if (fileName.endsWith('.mp4') || fileName.endsWith('.mov') || 
            fileName.endsWith('.avi') || fileName.endsWith('.mkv') ||
            fileName.endsWith('.webm') || fileName.endsWith('.flv') ||
            fileName.endsWith('.m4v') || fileName.endsWith('.wmv')) {
          return MessageType.VIDEO
        }
      }
      return MessageType.FILE
    default:
      return MessageType.TEXT
  }
}

export const useMessageStore = defineStore('message', () => {
  const messagesMap = ref<Record<string, Message[]>>({})
  const pendingQueue = ref<Message[]>([])

  const getMessages = (sessionId: string): Message[] => {
    return messagesMap.value[sessionId] || []
  }

  const pendingCount = computed(() => pendingQueue.value.length)

  const loadMessages = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('========================================')
      console.log('📥 [loadMessages] 开始加载消息')
      console.log('📥 [loadMessages] 会话ID:', sessionId)
      console.log('📥 [loadMessages] 当前时间:', new Date().toISOString())
      
      // 确保有会话密钥
      console.log('🔑 [loadMessages] 检查会话密钥...')
      await ensureSessionKey(sessionId)
      console.log('✅ [loadMessages] 会话密钥已准备')

      // 从 API 获取历史消息
      console.log('🌐 [loadMessages] 调用 API 获取历史消息...')
      console.log('🌐 [loadMessages] API 端点: /api/session/' + sessionId + '/messages')
      
      const messages = await sessionApi.getMessages(sessionId)
      
      console.log('📨 [loadMessages] API 返回成功')
      console.log('📨 [loadMessages] 返回消息数量:', messages.length)
      console.log('📨 [loadMessages] 原始消息数据:', JSON.stringify(messages, null, 2))

      if (messages.length === 0) {
        console.warn('⚠️ [loadMessages] API 返回的消息列表为空！')
        messagesMap.value[sessionId] = []
        return { success: true }
      }

      // 解密并转换消息
      const decryptedMessages: Message[] = []
      console.log('🔓 [loadMessages] 开始解密消息...')
      
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        try {
          console.log(`🔓 [loadMessages] 解密消息 ${i + 1}/${messages.length}:`, {
            id: msg.id,
            sendUser: msg.sendUser,
            sessionId: msg.sessionId,
            messageType: msg.messageType,
            sendTime: msg.sendTime,
            isRead: msg.isRead,
            encryptedContent: msg.messageContent.substring(0, 30) + '...'
          })
          
          const content = backendCrypto.decryptWithSession(sessionId, msg.messageContent)
          console.log(`✅ [loadMessages] 解密成功 ${i + 1}/${messages.length}:`, content)
          
          decryptedMessages.push({
            id: msg.id,
            sessionId: msg.sessionId,
            senderId: msg.sendUser,
            content,
            iv: '',
            authTag: '',
            timestamp: msg.sendTime,
            status: MessageStatus.DELIVERED,
            isRead: msg.isRead,
            type: getMessageType(msg.messageType, content)
          })
        } catch (error) {
          console.error(`❌ [loadMessages] 解密消息失败 ${i + 1}/${messages.length}:`, msg.id, error)
          // 即使解密失败，也显示消息（显示加密内容）
          decryptedMessages.push({
            id: msg.id,
            sessionId: msg.sessionId,
            senderId: msg.sendUser,
            content: '[解密失败: ' + msg.messageContent.substring(0, 20) + '...]',
            iv: '',
            authTag: '',
            timestamp: msg.sendTime,
            status: MessageStatus.DELIVERED,
            isRead: msg.isRead,
            type: getMessageType(msg.messageType, '')
          })
        }
      }

      console.log('✅ [loadMessages] 所有消息解密完成，共', decryptedMessages.length, '条')

      // 获取本地已有的消息（WebSocket 收到的）
      const localMessages = messagesMap.value[sessionId] || []
      console.log('📦 [loadMessages] 本地已有消息:', localMessages.length, '条')

      // 合并消息：去重（按 id）
      const allMessages = [...decryptedMessages]
      const messageIds = new Set(decryptedMessages.map(m => m.id))
      
      // 添加本地消息中不在历史消息中的消息
      for (const localMsg of localMessages) {
        if (!messageIds.has(localMsg.id)) {
          allMessages.push(localMsg)
          console.log('➕ [loadMessages] 保留本地消息:', localMsg.id)
        }
      }

      // 按时间排序
      messagesMap.value[sessionId] = allMessages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      
      console.log('✅ [loadMessages] 消息加载完成，共', messagesMap.value[sessionId].length, '条')
      console.log('📋 [loadMessages] 最终消息列表:', messagesMap.value[sessionId].map(m => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content.substring(0, 30),
        timestamp: m.timestamp
      })))
      console.log('========================================')
      
      return { success: true }
    } catch (error) {
      console.error('========================================')
      console.error('❌ [loadMessages] 加载消息失败')
      console.error('❌ [loadMessages] 会话ID:', sessionId)
      const err = error as Error
      console.error('❌ [loadMessages] 错误类型:', err?.constructor?.name)
      console.error('❌ [loadMessages] 错误信息:', error)
      console.error('❌ [loadMessages] 错误堆栈:', err?.stack)
      console.error('========================================')
      
      if (!messagesMap.value[sessionId]) {
        messagesMap.value[sessionId] = []
      }
      return { success: false, error: String(error) }
    }
  }

  // 确保会话密钥存在
  const ensureSessionKey = async (sessionId: string): Promise<void> => {
    console.log('🔑 [ensureSessionKey] 检查会话密钥:', sessionId)
    
    if (backendCrypto.getSessionKey(sessionId)) {
      console.log('✅ [ensureSessionKey] 会话密钥已存在（从缓存获取）')
      return
    }

    console.log('⚠️ [ensureSessionKey] 会话密钥不存在，尝试从后端获取...')
    
    try {
      // 尝试获取现有密钥
      console.log('🌐 [ensureSessionKey] 调用 API: /api/encryption/session/' + sessionId + '/key')
      const keyResponse = await encryptionApi.getSessionKey(sessionId)
      console.log('✅ [ensureSessionKey] 获取到现有密钥:', keyResponse.aesKey.substring(0, 20) + '...')
      backendCrypto.setSessionKey(sessionId, keyResponse.aesKey)
      console.log('✅ [ensureSessionKey] 密钥已设置到缓存')
    } catch (error) {
      // 如果不存在，生成新密钥
      console.warn('⚠️ [ensureSessionKey] 获取密钥失败，尝试生成新密钥...')
      console.warn('⚠️ [ensureSessionKey] 错误信息:', error)
      
      try {
        console.log('🌐 [ensureSessionKey] 调用 API 生成新密钥')
        const keyResponse = await encryptionApi.generateSessionKey(sessionId)
        console.log('✅ [ensureSessionKey] 生成新密钥成功:', keyResponse.aesKey.substring(0, 20) + '...')
        backendCrypto.setSessionKey(sessionId, keyResponse.aesKey)
        console.log('✅ [ensureSessionKey] 新密钥已设置到缓存')
      } catch (genError) {
        console.error('❌ [ensureSessionKey] 生成新密钥也失败了！')
        console.error('❌ [ensureSessionKey] 错误信息:', genError)
        throw genError
      }
    }
  }

  const addMessage = (sessionId: string, message: Message): void => {
    if (!messagesMap.value[sessionId]) {
      // 使用 Vue 的响应式方式创建新数组
      messagesMap.value = {
        ...messagesMap.value,
        [sessionId]: []
      }
    }
    messagesMap.value[sessionId].push(message)
    console.log('✅ 消息已添加到 messagesMap:', {
      sessionId,
      messageId: message.id,
      totalMessages: messagesMap.value[sessionId].length
    })
  }

  const sendMessage = async (sessionId: string, content: string): Promise<void> => {
    const authStore = useAuthStore()

    // 立即添加消息到本地（乐观更新）
    const tempMessageId = `temp-${Date.now()}-${Math.random()}`
    const message: Message = {
      id: tempMessageId,
      sessionId,
      senderId: authStore.userId || 'current-user',
      content,
      iv: '',
      authTag: '',
      timestamp: new Date().toISOString(),
      status: MessageStatus.SENDING,
      isRead: false,
      type: MessageType.TEXT
    }

    addMessage(sessionId, message)
    console.log('✅ 文本消息已添加到本地（乐观更新）:', tempMessageId)

    try {
      // 确保有会话密钥
      await ensureSessionKey(sessionId)

      // 使用后端加密方式加密消息
      const encrypted = backendCrypto.encryptWithSession(sessionId, content)

      // 通过 WebSocket 发送
      websocketService.sendMessage(sessionId, {
        sessionId,
        content: encrypted,
        encrypted: true,
        messageType: '1'
      })

      // 更新会话列表的最后一条消息
      const { useSessionStore } = await import('@/entities/session/model/useSessionStore')
      const sessionStore = useSessionStore()
      sessionStore.updateLastMessage(sessionId, content.substring(0, 20), new Date().toISOString())

      // 更新消息状态为已发送
      updateMessageStatus(sessionId, message.id, MessageStatus.SENT)
      console.log('✅ 文本消息已发送到 WebSocket')
    } catch (error) {
      console.error('Failed to send message:', error)
      updateMessageStatus(sessionId, message.id, MessageStatus.FAILED)
    }
  }

  const queueMessage = (message: Message): void => {
    pendingQueue.value.push(message)
  }

  const processPendingQueue = async (): Promise<void> => {
    const queue = [...pendingQueue.value]
    pendingQueue.value = []

    for (const message of queue) {
      // TODO: Send each message
      await sendMessage(message.sessionId, message.content)
    }
  }

  const updateMessageStatus = (
    sessionId: string,
    messageId: string,
    status: Message['status']
  ): void => {
    const messages = messagesMap.value[sessionId]
    if (messages) {
      const message = messages.find((m) => m.id === messageId)
      if (message) {
        message.status = status
      }
    }
  }

  const markAsRead = async (sessionId: string, messageId: string): Promise<void> => {
    try {
      // 使用推荐的单条消息标记接口
      await sessionApi.markSingleAsRead(messageId)
      
      // 更新本地状态
      const messages = messagesMap.value[sessionId]
      if (messages) {
        const message = messages.find((m) => m.id === messageId)
        if (message) {
          message.isRead = true
        }
      }
      
      console.log('✅ 消息已标记为已读:', messageId)
    } catch (error) {
      console.error('❌ 标记消息已读失败:', error)
    }
  }

  const markBatchAsRead = async (sessionId: string, messageIds: string[]): Promise<void> => {
    try {
      // 批量标记多条消息
      await sessionApi.markBatchAsRead(sessionId, messageIds)
      
      // 更新本地状态
      const messages = messagesMap.value[sessionId]
      if (messages) {
        messageIds.forEach(id => {
          const message = messages.find((m) => m.id === id)
          if (message) {
            message.isRead = true
          }
        })
      }
      
      console.log('✅ 批量标记已读成功，共', messageIds.length, '条消息')
    } catch (error) {
      console.error('❌ 批量标记已读失败:', error)
    }
  }

  const receiveMessage = async (encryptedMessage: {
    id?: string
    sessionId: string
    senderId?: string
    sendUser?: string
    content: string
    timestamp?: string
    sendTime?: string
    messageType?: string
  }): Promise<Message | null> => {
    try {
      console.log('📩 [receiveMessage] 处理接收到的消息:', {
        id: encryptedMessage.id,
        sessionId: encryptedMessage.sessionId,
        senderId: encryptedMessage.senderId || encryptedMessage.sendUser,
        encrypted: encryptedMessage.content.substring(0, 20) + '...'
      })

      const messageId = encryptedMessage.id || `msg-${Date.now()}`
      const existingMessages = messagesMap.value[encryptedMessage.sessionId] || []
      
      // 确保有会话密钥
      await ensureSessionKey(encryptedMessage.sessionId)

      // 解密消息
      const content = backendCrypto.decryptWithSession(
        encryptedMessage.sessionId,
        encryptedMessage.content
      )

      console.log('🔓 [receiveMessage] 消息解密成功:', content)

      const authStore = useAuthStore()
      const senderId = encryptedMessage.senderId || encryptedMessage.sendUser || 'unknown'
      const timestamp = encryptedMessage.timestamp || encryptedMessage.sendTime || new Date().toISOString()
      
      // 改进的去重逻辑：
      // 1. 检查是否有相同 ID 的消息
      const duplicateById = existingMessages.some(m => m.id === messageId)
      if (duplicateById) {
        console.warn('⚠️ [receiveMessage] 消息已存在（相同ID），跳过重复添加:', messageId)
        return null
      }
      
      // 2. 如果是自己发送的消息，检查是否有临时消息（乐观更新的消息）
      //    如果有，替换临时消息的 ID 为真实 ID
      if (senderId === authStore.userId) {
        const tempMessage = existingMessages.find(m => 
          m.id.startsWith('temp-') && 
          m.senderId === senderId &&
          m.content === content &&
          Math.abs(new Date(m.timestamp).getTime() - new Date(timestamp).getTime()) < 5000 // 5秒内
        )
        
        if (tempMessage) {
          console.log('🔄 [receiveMessage] 找到临时消息，替换为真实消息:', {
            tempId: tempMessage.id,
            realId: messageId
          })
          
          // 更新临时消息的 ID 和状态
          tempMessage.id = messageId
          tempMessage.status = MessageStatus.DELIVERED
          tempMessage.timestamp = timestamp
          
          console.log('✅ [receiveMessage] 临时消息已更新为真实消息')
          return tempMessage
        }
      }
      
      // 3. 如果不是自己发送的，或者没有找到临时消息，添加新消息
      const message: Message = {
        id: messageId,
        sessionId: encryptedMessage.sessionId,
        senderId,
        content,
        iv: '',
        authTag: '',
        timestamp,
        status: MessageStatus.DELIVERED,
        isRead: false,
        type: getMessageType(encryptedMessage.messageType || '1', content)
      }

      addMessage(message.sessionId, message)
      console.log('✅ [receiveMessage] 消息已添加到 store')

      // 显示通知
      if (message.senderId !== authStore.userId) {
        console.log('🔔 [receiveMessage] 显示通知（TODO）')
        // TODO: 显示系统通知
      }

      return message
    } catch (error) {
      console.error('❌ [receiveMessage] 接收消息失败:', error)
      return null
    }
  }

  /**
   * 清空指定会话的消息缓存
   * 用于删除会话时清理本地数据
   */
  const clearSessionMessages = (sessionId: string): void => {
    delete messagesMap.value[sessionId]
    console.log('🗑️ 已清空会话消息缓存:', sessionId)
  }

  /**
   * 删除单条消息
   * 
   * 流程：
   * 1. 调用后端 API 删除消息（仅对当前用户隐藏）
   * 2. 从本地消息列表中移除
   * 
   * 注意：
   * - 仅对当前用户隐藏，其他用户仍可见
   * - 刷新页面后，消息仍然不可见（后端过滤）
   */
  const deleteSingleMessage = async (
    sessionId: string,
    messageId: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🗑️ 删除单条消息:', messageId)

      // 1. 调用后端 API
      await sessionApi.deleteSingleMessage(messageId)
      console.log('✅ 后端删除成功')

      // 2. 从本地消息列表中移除
      const messages = messagesMap.value[sessionId]
      if (messages) {
        messagesMap.value[sessionId] = messages.filter((m) => m.id !== messageId)
        console.log('✅ 消息已从本地列表移除')
      }

      return { success: true }
    } catch (error) {
      console.error('❌ 删除消息失败:', error)
      return { success: false, error: String(error) }
    }
  }

  return {
    messagesMap,
    pendingQueue,
    getMessages,
    pendingCount,
    loadMessages,
    ensureSessionKey,
    addMessage,
    sendMessage,
    queueMessage,
    processPendingQueue,
    updateMessageStatus,
    markAsRead,
    markBatchAsRead,
    receiveMessage,
    clearSessionMessages,
    deleteSingleMessage
  }
})
