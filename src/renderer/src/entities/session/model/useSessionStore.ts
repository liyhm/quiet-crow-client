import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatSession } from '@/shared/types'
import { SessionType } from '@/shared/types'
import { sessionApi } from '@/shared/api/session'
import { backendCrypto } from '@/shared/lib/cryptoBackend'
import { encryptionApi } from '@/shared/api/encryption'

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<ChatSession[]>([])
  const activeSessionId = ref<string | null>(null)

  const activeSession = computed(() => sessions.value.find((s) => s.id === activeSessionId.value))

  const sortedSessions = computed(() =>
    [...sessions.value].sort(
      (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    )
  )

  const totalUnreadCount = computed(() =>
    sessions.value.reduce((sum, session) => sum + session.unreadCount, 0)
  )

  const loadSessions = async () => {
    console.log('📋 开始加载会话列表...')
    try {
      console.log('🔗 调用 sessionApi.getMySessions()')
      const sessionUsers = await sessionApi.getMySessions()
      console.log('✅ 获取到会话数据:', sessionUsers)

      // 转换为前端格式（并解密最后一条消息）
      const sessionsPromises = sessionUsers.map(async (su) => {
        // 处理显示名称
        let displayName = '未知用户'
        
        // 如果是群聊，showName 可能是加密的群聊名称
        if (su.sessionUserType === 'GROUP' && su.showName) {
          try {
            // 尝试解析 JSON 格式（某些后端可能返回 JSON）
            if (su.showName.startsWith('{')) {
              const parsed = JSON.parse(su.showName)
              displayName = parsed.field || parsed.name || '未命名群聊'
            } else {
              // 直接使用 showName
              displayName = su.showName
            }
          } catch {
            // 如果解析失败，直接使用原值
            displayName = su.showName || '未命名群聊'
          }
        } else {
          // 私聊：优先使用 showName，如果没有则使用 userId 的前8位
          displayName = su.showName || '未知用户'
          if (!su.showName && su.userId) {
            displayName = `用户 ${su.userId.substring(0, 8)}...`
          }
        }
        
        // 尝试解密最后一条消息
        let lastMessageDisplay = su.lastMessage || ''
        
        // 如果消息看起来像是加密的（Base64 格式）
        if (lastMessageDisplay && lastMessageDisplay.length > 20 && /^[A-Za-z0-9+/=]+$/.test(lastMessageDisplay)) {
          try {
            // 确保有会话密钥
            if (!backendCrypto.getSessionKey(su.sessionId)) {
              try {
                const keyResponse = await encryptionApi.getSessionKey(su.sessionId)
                backendCrypto.setSessionKey(su.sessionId, keyResponse.aesKey)
              } catch {
                // 密钥不存在，跳过解密
                lastMessageDisplay = '新消息'
              }
            }
            
            // 解密消息
            if (backendCrypto.getSessionKey(su.sessionId)) {
              const decrypted = backendCrypto.decryptWithSession(su.sessionId, lastMessageDisplay)
              
              // 检查是否是文件消息（JSON 格式）
              try {
                const parsed = JSON.parse(decrypted)
                if (parsed.fileId) {
                  // 根据文件名判断是图片还是其他文件
                  const fileName = parsed.fileName || ''
                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)
                  lastMessageDisplay = isImage ? '[图片]' : '[文件]'
                } else {
                  // 普通文本消息
                  lastMessageDisplay = decrypted.length > 30 ? decrypted.substring(0, 30) + '...' : decrypted
                }
              } catch {
                // 不是 JSON，是普通文本消息
                lastMessageDisplay = decrypted.length > 30 ? decrypted.substring(0, 30) + '...' : decrypted
              }
            }
          } catch (error) {
            console.warn('解密最后一条消息失败:', su.sessionId, error)
            lastMessageDisplay = '新消息'
          }
        } else if (lastMessageDisplay && lastMessageDisplay.length > 30) {
          // 如果消息很长但不是加密格式，可能是 fileId，截断显示
          lastMessageDisplay = lastMessageDisplay.substring(0, 30) + '...'
        }
        
        return {
          id: su.sessionId,
          type: su.sessionUserType === 'PRIVATE' ? SessionType.PRIVATE : SessionType.GROUP,
          name: displayName,
          avatar: su.avatar || '',
          participants: [su.userId],
          lastMessage: lastMessageDisplay,
          lastMessageTime: su.lastMessageTime || new Date().toISOString(),
          unreadCount: su.unreadCount || 0,
          memberCount: su.sessionUserType === 'GROUP' ? (su.memberCount || 0) : undefined,
          isPinned: false,
          isMuted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })

      sessions.value = await Promise.all(sessionsPromises)

      console.log('✅ 会话列表加载成功，共', sessions.value.length, '个会话')
      
      // 打印每个会话的未读数（用于调试）
      sessions.value.forEach(session => {
        if (session.unreadCount > 0) {
          console.log(`📊 [loadSessions] 会话 "${session.name}" 未读数: ${session.unreadCount}`)
        }
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ 加载会话列表失败:', error)
      const err = error as Error
      console.error('错误详情:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
      return { success: false, error: String(error) }
    }
  }

  const createPrivateSession = async (targetUserId: string) => {
    try {
      const response = await sessionApi.createPrivate({ targetUserId })

      // 如果会话已存在，直接返回
      if (response.exists) {
        return { success: true, sessionId: response.sessionId }
      }

      // 添加新会话到列表
      const newSession: ChatSession = {
        id: response.sessionId,
        type: SessionType.PRIVATE,
        name: '新会话',
        avatar: '',
        participants: response.participants,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      sessions.value.push(newSession)

      return { success: true, sessionId: response.sessionId }
    } catch (error) {
      console.error('Failed to create private session:', error)
      return { success: false, error: String(error) }
    }
  }

  const setActiveSession = (sessionId: string) => {
    activeSessionId.value = sessionId
    // Reset unread count for active session
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.unreadCount = 0
    }
  }

  const updateLastMessage = (sessionId: string, message: string, timestamp: string) => {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      // 检查是否是文件消息
      let displayMessage = message
      try {
        const parsed = JSON.parse(message)
        if (parsed.fileId) {
          // 根据文件名判断是图片还是其他文件
          const fileName = parsed.fileName || ''
          const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName)
          displayMessage = isImage ? '[图片]' : '[文件]'
        } else {
          // 普通文本消息，截取前 30 个字符
          displayMessage = message.length > 30 ? message.substring(0, 30) + '...' : message
        }
      } catch {
        // 不是 JSON，是普通文本消息
        // 截取前 30 个字符
        displayMessage = message.length > 30 ? message.substring(0, 30) + '...' : message
      }
      
      session.lastMessage = displayMessage
      session.lastMessageTime = timestamp
      session.updatedAt = timestamp
    }
  }

  const incrementUnread = (sessionId: string) => {
    console.log('========================================')
    console.log('🔔 [incrementUnread] 被调用')
    console.log('🔔 [incrementUnread] sessionId:', sessionId)
    console.log('🔔 [incrementUnread] activeSessionId:', activeSessionId.value)
    console.log('🔔 [incrementUnread] 调用堆栈:')
    console.trace()
    
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session && session.id !== activeSessionId.value) {
      console.log('📊 [incrementUnread] 找到会话:', session.name)
      console.log('📊 [incrementUnread] 当前未读数:', session.unreadCount)
      
      session.unreadCount++
      
      console.log('📊 [incrementUnread] 新的未读数:', session.unreadCount)
      console.log('✅ [incrementUnread] 未读数已增加')

      // Update badge count via IPC
      if (window.api?.notification) {
        // TODO: Update app badge
      }
    } else if (session && session.id === activeSessionId.value) {
      console.log('ℹ️ [incrementUnread] 当前会话是活动会话，不增加未读数')
    } else {
      console.warn('⚠️ [incrementUnread] 未找到会话:', sessionId)
    }
    console.log('========================================')
  }

  const resetUnread = (sessionId: string) => {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.unreadCount = 0
    }
  }

  /**
   * 删除会话
   * 
   * 流程：
   * 1. 调用后端 API 删除会话（真删除）
   * 2. 清空该会话的本地消息缓存
   * 3. 如果是当前活动会话，清除选中状态
   * 4. 从本地会话列表中移除
   * 
   * 注意：
   * - 私聊：删除后对方发消息，后端会自动创建新的 session_user，会话会重新出现
   * - 群聊：删除后不会自动重新加入，需要主动加入
   */
  const deleteSession = async (sessionId: string) => {
    try {
      console.log('🗑️ 删除会话:', sessionId)
      
      // 1. 调用后端 API 删除会话（真删除）
      await sessionApi.deleteSession(sessionId)
      console.log('✅ 后端删除成功')
      
      // 2. 清空该会话的消息缓存
      const { useMessageStore } = await import('@/entities/message/model/useMessageStore')
      const messageStore = useMessageStore()
      messageStore.clearSessionMessages(sessionId)
      
      // 3. 如果是当前活动会话，清除选中状态
      if (activeSessionId.value === sessionId) {
        activeSessionId.value = null
      }
      
      // 4. 从本地列表中移除
      sessions.value = sessions.value.filter((s) => s.id !== sessionId)
      
      console.log('✅ 会话已删除，消息缓存已清空')
      return { success: true }
    } catch (error) {
      console.error('❌ 删除会话失败:', error)
      return { success: false, error: String(error) }
    }
  }

  return {
    sessions,
    activeSessionId,
    activeSession,
    sortedSessions,
    totalUnreadCount,
    loadSessions,
    createPrivateSession,
    setActiveSession,
    updateLastMessage,
    incrementUnread,
    resetUnread,
    deleteSession
  }
})
