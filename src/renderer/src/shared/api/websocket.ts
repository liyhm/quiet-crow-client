import { Client, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useNetworkStore } from '@/entities/network/model/useNetworkStore'
import { useMessageStore } from '@/entities/message/model/useMessageStore'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { useSessionStore } from '@/entities/session/model/useSessionStore'
import { ConnectionStatus } from '@/shared/types'
import { API_CONFIG } from '@/shared/config/api'

class WebSocketService {
  private client: Client | null = null
  private subscriptions: Map<string, StompSubscription> = new Map()
  private reconnectTimer: number | null = null

  initialize() {
    const networkStore = useNetworkStore()
    const authStore = useAuthStore()

    console.log('🔌 初始化 WebSocket 客户端')
    console.log('📋 Token:', authStore.token ? '已设置' : '未设置')
    console.log('📋 WS URL:', API_CONFIG.WS_URL)

    this.client = new Client({
      webSocketFactory: () => {
        console.log('🏭 创建 WebSocket 连接...')
        return new SockJS(API_CONFIG.WS_URL)
      },

      connectHeaders: {
        Authorization: `Bearer ${authStore.token || ''}`
      },

      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      reconnectDelay: 3000, // 自动重连延迟 3 秒

      debug: (str) => {
        console.log('[STOMP Debug]', str)
      },

      // 启用自动重连
      connectionTimeout: 5000, // 连接超时 5 秒

      onConnect: () => {
        console.log('✅ WebSocket 连接成功！')
        networkStore.setStatus(ConnectionStatus.CONNECTED)
        networkStore.resetReconnectAttempts()

        // Process pending messages
        const messageStore = useMessageStore()
        messageStore.processPendingQueue()

        // Subscribe to user's private queue
        this.subscribeToPrivateMessages()
      },

      onDisconnect: () => {
        console.log('❌ WebSocket 断开连接')
        networkStore.setStatus(ConnectionStatus.DISCONNECTED)
        this.handleReconnect()
      },

      onStompError: (frame) => {
        console.error('❌ STOMP 错误:', frame)
        networkStore.setStatus(ConnectionStatus.DISCONNECTED)
        this.handleReconnect()
      },

      onWebSocketClose: () => {
        console.log('❌ WebSocket 关闭')
        networkStore.setStatus(ConnectionStatus.DISCONNECTED)
        this.handleReconnect()
      },

      onWebSocketError: (error) => {
        console.error('❌ WebSocket 错误:', error)
      }
    })
    
    console.log('✅ WebSocket 客户端初始化完成')
  }

  connect() {
    console.log('🔗 开始连接 WebSocket...')
    if (this.client && !this.client.active) {
      console.log('📡 激活 WebSocket 客户端')
      this.client.activate()
    } else if (this.client?.active) {
      console.log('⚠️ WebSocket 已经处于活动状态')
    } else {
      console.error('❌ WebSocket 客户端未初始化')
    }
  }

  disconnect() {
    console.log('🔌 断开 WebSocket 连接...')
    
    // 清理所有订阅
    this.subscriptions.forEach((subscription, key) => {
      console.log(`📡 取消订阅: ${key}`)
      subscription.unsubscribe()
    })
    this.subscriptions.clear()
    
    // 快速断开连接（不等待）
    if (this.client) {
      try {
        this.client.deactivate()
        console.log('✅ WebSocket 已断开')
      } catch (error) {
        console.warn('⚠️ WebSocket 断开时出错（忽略）:', error)
      }
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  private handleReconnect() {
    const networkStore = useNetworkStore()
    
    // 如果已经在重连中，不要重复触发
    if (this.reconnectTimer) {
      console.log('⏳ 已有重连任务在进行中')
      return
    }
    
    // 如果已经连接，不需要重连
    if (this.client?.connected) {
      console.log('✅ WebSocket 已连接，无需重连')
      return
    }
    
    const attempt = networkStore.reconnectAttempts + 1
    const maxAttempts = 15 // 增加最大重连次数
    
    if (attempt > maxAttempts) {
      console.error('❌ 达到最大重连次数，停止重连')
      networkStore.setStatus(ConnectionStatus.DISCONNECTED)
      return
    }
    
    // 指数退避：2^attempt 秒，最多 30 秒
    const delay = Math.min(Math.pow(2, attempt) * 1000, 30000)
    
    console.log(`🔄 准备重连 WebSocket (尝试 ${attempt}/${maxAttempts})，${delay/1000} 秒后重试...`)
    networkStore.setStatus(ConnectionStatus.RECONNECTING)
    networkStore.incrementReconnectAttempts()
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null
      console.log(`🔄 开始第 ${attempt} 次重连...`)
      
      try {
        // 先完全停用客户端
        if (this.client?.active) {
          console.log('🔌 先停用现有连接')
          this.client.deactivate()
        }
        
        // 重新初始化并连接
        console.log('🔄 重新初始化 WebSocket 客户端')
        this.initialize()
        
        // 延迟一下再激活，确保初始化完成
        setTimeout(() => {
          console.log('📡 激活 WebSocket 客户端')
          this.connect()
        }, 100)
      } catch (error) {
        console.error('❌ 重连失败:', error)
        // 继续尝试重连
        this.handleReconnect()
      }
    }, delay)
  }

  private subscribeToPrivateMessages() {
    if (!this.client) {
      console.error('❌ WebSocket client 未初始化')
      return
    }

    const authStore = useAuthStore()
    const userId = authStore.userId

    if (!userId) {
      console.error('❌ 用户 ID 不存在，无法订阅消息')
      return
    }

    console.log('📡 订阅私有消息队列:', `/user/queue/messages`)

    const subscription = this.client.subscribe(`/user/queue/messages`, (message) => {
      console.log('📬 收到私有消息:', message.body)
      this.handleIncomingMessage(JSON.parse(message.body))
    })

    this.subscriptions.set('private', subscription)
    console.log('✅ 私有消息队列订阅成功')
    
    // 订阅好友请求通知
    this.subscribeToFriendRequests()
    
    // 订阅在线状态变化通知
    this.subscribeToOnlineStatus()
  }

  /**
   * 订阅好友请求相关的 WebSocket 通知
   * 
   * 监听两种事件：
   * 1. 收到新的好友请求
   * 2. 好友请求被接受（对方同意了你的请求）
   */
  private subscribeToFriendRequests() {
    if (!this.client) {
      console.error('❌ WebSocket client 未初始化')
      return
    }

    console.log('📡 订阅好友请求通知:', `/user/queue/friend-requests`)

    const subscription = this.client.subscribe(`/user/queue/friend-requests`, (message) => {
      console.log('📬 收到好友请求通知:', message.body)
      this.handleFriendRequestNotification(JSON.parse(message.body))
    })

    this.subscriptions.set('friend-requests', subscription)
    console.log('✅ 好友请求通知订阅成功')
  }

  /**
   * 订阅在线状态变化通知
   * 
   * 监听好友的在线/离线状态变化，实时更新前端显示
   */
  private subscribeToOnlineStatus() {
    if (!this.client) {
      console.error('❌ WebSocket client 未初始化')
      return
    }

    console.log('📡 订阅在线状态通知:', `/user/queue/online-status`)

    const subscription = this.client.subscribe(`/user/queue/online-status`, (message) => {
      console.log('📬 收到在线状态通知:', message.body)
      this.handleOnlineStatusChange(JSON.parse(message.body))
    })

    this.subscriptions.set('online-status', subscription)
    console.log('✅ 在线状态通知订阅成功')
  }

  /**
   * 处理在线状态变化通知
   * 
   * @param notification 通知内容
   * @param notification.userId 用户ID
   * @param notification.username 用户名
   * @param notification.isOnline 是否在线
   * @param notification.timestamp 时间戳
   */
  private async handleOnlineStatusChange(notification: any) {
    console.log('========================================')
    console.log('🔔 [handleOnlineStatusChange] 处理在线状态变化')
    console.log('🔔 [handleOnlineStatusChange] 用户ID:', notification.userId)
    console.log('🔔 [handleOnlineStatusChange] 用户名:', notification.username)
    console.log('🔔 [handleOnlineStatusChange] 在线状态:', notification.isOnline ? '在线' : '离线')
    console.log('🔔 [handleOnlineStatusChange] 时间戳:', notification.timestamp)

    const { useContactStore } = await import('@/entities/contact/model/useContactStore')
    const contactStore = useContactStore()

    // 更新联系人列表中的在线状态
    const contact = contactStore.contacts.find(c => c.userId === notification.userId)
    if (contact) {
      contact.isOnline = notification.isOnline
      console.log('✅ 已更新联系人在线状态:', contact.displayName, notification.isOnline ? '在线' : '离线')
    } else {
      console.log('⚠️ 未找到联系人:', notification.userId)
    }

    // 同时更新会话列表中的在线状态（如果有私聊会话）
    const { useSessionStore } = await import('@/entities/session/model/useSessionStore')
    const sessionStore = useSessionStore()
    
    const session = sessionStore.sessions.find(s => 
      s.type === 'PRIVATE' && s.participants.includes(notification.userId)
    )
    if (session) {
      session.isOnline = notification.isOnline
      console.log('✅ 已更新会话在线状态:', session.name, notification.isOnline ? '在线' : '离线')
    }

    console.log('========================================')
  }

  /**
   * 处理好友请求通知
   * 
   * @param notification 通知内容
   * @param notification.type 通知类型：'NEW_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED'
   * @param notification.requestId 请求ID
   * @param notification.fromUserId 发送方用户ID
   * @param notification.fromUsername 发送方用户名
   * @param notification.fromShowName 发送方显示名称
   * @param notification.fromAvatar 发送方头像URL
   * @param notification.requestMessage 请求消息（仅 NEW_REQUEST 时有值）
   * @param notification.timestamp 时间戳
   */
  private async handleFriendRequestNotification(notification: any) {
    console.log('========================================')
    console.log('🔔 [handleFriendRequestNotification] 处理好友请求通知')
    console.log('🔔 [handleFriendRequestNotification] 通知类型:', notification.type)
    console.log('🔔 [handleFriendRequestNotification] 通知内容:', notification)

    const { useContactStore } = await import('@/entities/contact/model/useContactStore')
    const contactStore = useContactStore()

    switch (notification.type) {
      case 'NEW_REQUEST':
        // 收到新的好友请求
        console.log('📬 收到新的好友请求')
        console.log('📬 来自:', notification.fromShowName, `(@${notification.fromUsername})`)
        console.log('📬 消息:', notification.requestMessage)
        
        await contactStore.loadPendingRequests()
        console.log('✅ 好友请求列表已刷新，当前待处理数量:', contactStore.pendingRequests.length)
        
        // 显示桌面通知（可选）
        this.showDesktopNotification(
          '新的好友请求',
          `${notification.fromShowName} 想添加你为好友`
        )
        break

      case 'REQUEST_ACCEPTED':
        // 对方接受了你的好友请求
        console.log('✅ 好友请求被接受')
        console.log('✅ 对方:', notification.fromShowName, `(@${notification.fromUsername})`)
        
        await contactStore.loadPendingRequests()
        await contactStore.loadContacts()
        console.log('✅ 好友请求列表和联系人列表已刷新')
        console.log('✅ 当前待处理数量:', contactStore.pendingRequests.length)
        console.log('✅ 当前联系人数量:', contactStore.contacts.length)
        
        // 显示桌面通知（可选）
        this.showDesktopNotification(
          '好友请求已接受',
          `${notification.fromShowName} 接受了你的好友请求`
        )
        break

      case 'REQUEST_REJECTED':
        // 对方拒绝了你的好友请求
        console.log('❌ 好友请求被拒绝')
        console.log('❌ 对方:', notification.fromShowName, `(@${notification.fromUsername})`)
        
        await contactStore.loadPendingRequests()
        console.log('✅ 好友请求列表已刷新，当前待处理数量:', contactStore.pendingRequests.length)
        break

      default:
        console.warn('⚠️ 未知的通知类型:', notification.type)
    }

    console.log('========================================')
  }

  /**
   * 显示桌面通知
   */
  private showDesktopNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      })
    }
  }

  subscribeToChat(sessionId: string, callback: (message: any) => void) {
    if (!this.client) return

    const subscription = this.client.subscribe(`/topic/sessions/${sessionId}`, (message) => {
      callback(JSON.parse(message.body))
    })

    this.subscriptions.set(sessionId, subscription)
  }

  unsubscribeFromChat(sessionId: string) {
    const subscription = this.subscriptions.get(sessionId)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(sessionId)
    }
  }

  sendMessage(sessionId: string, encryptedPayload: any) {
    if (!this.client || !this.client.connected) {
      console.warn('⚠️ WebSocket 未连接，消息加入队列')
      const messageStore = useMessageStore()
      messageStore.queueMessage(encryptedPayload)
      return
    }

    console.log('📤 发送消息到 WebSocket:', {
      destination: `/app/chat/${sessionId}`,
      sessionId: sessionId,
      encrypted: encryptedPayload.content?.substring(0, 20) + '...'
    })

    this.client.publish({
      destination: `/app/chat/${sessionId}`,
      body: JSON.stringify(encryptedPayload)
    })
    
    console.log('✅ 消息已发送')
  }

  /**
   * 处理接收到的 WebSocket 消息
   * 
   * 流程：
   * 1. 检查本地会话列表中是否存在该会话
   * 2. 如果不存在（可能被删除或是新会话），重新加载会话列表
   *    - 私聊：后端会自动创建 session_user 记录，会话会重新出现
   *    - 群聊：不会自动重新加入
   * 3. 解密消息并添加到消息列表
   * 4. 更新会话的最后消息预览（使用解密后的内容）
   * 5. 增加未读计数（如果不是当前活动会话）
   * 
   * 会话复活逻辑：
   * - 用户删除会话后，本地消息缓存已清空
   * - 对方发送新消息时，会话重新出现在列表顶部
   * - 由于本地缓存为空，只会显示新消息，表现为"干净的新会话"
   */
  private async handleIncomingMessage(message: any) {
    console.log('========================================')
    console.log('📨 [handleIncomingMessage] 收到 WebSocket 消息')
    console.log('📨 [handleIncomingMessage] sessionId:', message.sessionId)
    console.log('📨 [handleIncomingMessage] senderId:', message.senderId || message.sendUser)
    console.log('📨 [handleIncomingMessage] messageType:', message.messageType)
    console.log('📨 [handleIncomingMessage] timestamp:', message.timestamp || message.sendTime)
    console.log('📨 [handleIncomingMessage] 完整消息:', message)

    const messageStore = useMessageStore()
    const sessionStore = useSessionStore()
    
    // 1. 检查会话是否存在
    const sessionExists = sessionStore.sessions.find(s => s.id === message.sessionId)
    console.log('📨 [handleIncomingMessage] 会话存在:', !!sessionExists)
    
    if (!sessionExists) {
      console.log('⚠️ [handleIncomingMessage] 会话不存在，重新加载会话列表')
      console.log('💡 [handleIncomingMessage] 提示：如果是私聊，后端会自动创建 session_user，会话会重新出现')
      await sessionStore.loadSessions()
      console.log('✅ [handleIncomingMessage] 会话列表已重新加载')
    }
    
    // 2. 接收并解密消息
    console.log('📨 [handleIncomingMessage] 开始接收消息...')
    const receivedMessage = await messageStore.receiveMessage(message)
    console.log('📨 [handleIncomingMessage] 消息接收结果:', !!receivedMessage)
    
    if (receivedMessage) {
      console.log('📨 [handleIncomingMessage] 消息内容:', receivedMessage.content?.substring(0, 50))
      
      // 3. 更新会话的最后消息预览（使用解密后的内容）
      let preview = '新消息'
      
      // 根据消息类型生成预览
      if (receivedMessage.type === 'IMAGE') {
        preview = '[图片]'
      } else if (receivedMessage.type === 'VIDEO') {
        preview = '[视频]'
      } else if (receivedMessage.type === 'FILE') {
        // 尝试从 JSON 中提取文件名
        try {
          const fileData = JSON.parse(receivedMessage.content)
          preview = `[文件] ${fileData.fileName || '未知文件'}`
        } catch {
          preview = '[文件]'
        }
      } else {
        // 文本消息
        preview = receivedMessage.content?.substring(0, 20) || '新消息'
      }
      
      console.log('📨 [handleIncomingMessage] 更新会话预览:', preview)
      
      sessionStore.updateLastMessage(
        message.sessionId,
        preview,
        message.timestamp || message.sendTime || new Date().toISOString()
      )
      
      // 4. 增加未读计数（如果不是当前活动会话）
      console.log('📨 [handleIncomingMessage] 准备增加未读数')
      console.log('📨 [handleIncomingMessage] 当前活动会话:', sessionStore.activeSessionId)
      console.log('📨 [handleIncomingMessage] 消息所属会话:', message.sessionId)
      
      sessionStore.incrementUnread(message.sessionId)
      
      console.log('✅ [handleIncomingMessage] 消息已处理，会话列表已更新')
      
      // 5. 如果当前正在查看该会话，触发 UI 更新
      if (sessionStore.activeSessionId === message.sessionId) {
        console.log('💡 [handleIncomingMessage] 当前正在查看该会话，消息已自动显示')
      }
    } else {
      console.error('❌ [handleIncomingMessage] 消息接收失败')
    }
    
    console.log('========================================')
  }

  requestOfflineMessages(sessionId: string, lastMessageId: string) {
    if (!this.client || !this.client.connected) return

    this.client.publish({
      destination: '/app/sync',
      body: JSON.stringify({
        sessionId,
        cursor: lastMessageId
      })
    })
  }
}

export const websocketService = new WebSocketService()
