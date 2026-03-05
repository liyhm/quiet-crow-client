import request from './request'
import { API_ENDPOINTS, API_CONFIG } from '../config/api'

export interface SessionUser {
  id: string
  sessionId: string
  userId: string
  showName: string
  avatar?: string
  sessionUserType: 'PRIVATE' | 'GROUP'
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  memberCount?: number
  isOnline?: boolean | null  // 新增：在线状态（私聊有效，群聊为null）
}

export interface CreatePrivateSessionParams {
  targetUserId: string
}

export interface CreateGroupSessionParams {
  name: string
  memberIds: string[]
}

export interface SessionResponse {
  sessionId: string
  type: 'PRIVATE' | 'GROUP'
  name?: string
  participants: string[]
  exists?: boolean
}

export interface MessageItem {
  id: string
  sessionId: string
  sendUser: string
  messageContent: string
  messageType: string
  sendTime: string
  isRead: boolean
}

export interface GroupMember {
  userId: string
  showName: string
  username: string
  avatar: string | null
  userType: 'OWNER' | 'MEMBER'
  isOnline: boolean
}

export const sessionApi = {
  // 获取会话列表
  getMySessions() {
    return request.get<any, SessionUser[]>(API_ENDPOINTS.SESSION.MY)
  },

  // 创建私聊会话
  createPrivate(params: CreatePrivateSessionParams) {
    return request.post<any, SessionResponse>(API_ENDPOINTS.SESSION.PRIVATE, params)
  },

  // 创建群聊会话
  createGroup(params: CreateGroupSessionParams) {
    return request.post<any, SessionResponse>(API_ENDPOINTS.SESSION.GROUP, params)
  },

  // 获取历史消息
  getMessages(sessionId: string, cursor?: string, limit: number = 50) {
    console.log('🌐 [sessionApi.getMessages] 调用 API')
    console.log('🌐 [sessionApi.getMessages] sessionId:', sessionId)
    console.log('🌐 [sessionApi.getMessages] cursor:', cursor)
    console.log('🌐 [sessionApi.getMessages] limit:', limit)
    console.log('🌐 [sessionApi.getMessages] URL:', API_ENDPOINTS.SESSION.MESSAGES(sessionId))
    
    return request.get<any, MessageItem[]>(API_ENDPOINTS.SESSION.MESSAGES(sessionId), {
      params: { cursor, limit },
      timeout: API_CONFIG.LONG_TIMEOUT // 使用长超时（120秒）
    }).then(response => {
      console.log('✅ [sessionApi.getMessages] API 响应成功')
      console.log('✅ [sessionApi.getMessages] 返回数据类型:', typeof response)
      console.log('✅ [sessionApi.getMessages] 是否为数组:', Array.isArray(response))
      console.log('✅ [sessionApi.getMessages] 数据长度:', response?.length)
      console.log('✅ [sessionApi.getMessages] 完整响应:', JSON.stringify(response, null, 2))
      return response
    }).catch(error => {
      console.error('❌ [sessionApi.getMessages] API 请求失败')
      console.error('❌ [sessionApi.getMessages] 错误信息:', error)
      console.error('❌ [sessionApi.getMessages] 错误响应:', error.response?.data)
      console.error('❌ [sessionApi.getMessages] 状态码:', error.response?.status)
      throw error
    })
  },

  // 标记单条消息已读（推荐）
  markSingleAsRead(messageId: string) {
    return request.post(API_ENDPOINTS.SESSION.READ_SINGLE(messageId))
  },

  // 标记到某条消息（批量标记该消息及之前的所有消息）
  markAsRead(sessionId: string, messageId: string) {
    return request.post(API_ENDPOINTS.SESSION.READ(sessionId), { messageId })
  },

  // 批量标记多条消息已读
  markBatchAsRead(sessionId: string, messageIds: string[]) {
    return request.post(API_ENDPOINTS.SESSION.READ_BATCH(sessionId), { messageIds })
  },

  // 删除会话（使用水位线模型）
  deleteSession(sessionId: string) {
    return request.delete(API_ENDPOINTS.SESSION.DELETE(sessionId))
  },

  // 删除单条消息（仅对当前用户隐藏）
  deleteSingleMessage(messageId: string) {
    return request.delete(API_ENDPOINTS.SESSION.DELETE_MESSAGE(messageId))
  },

  // 获取群成员列表
  getGroupMembers(sessionId: string) {
    return request.get<any, GroupMember[]>(API_ENDPOINTS.SESSION.MEMBERS(sessionId))
  },

  // 邀请成员加入群聊
  inviteMembers(sessionId: string, memberIds: string[]) {
    return request.post<any, { sessionId: string; invitedCount: number; failedUsers: any[] }>(
      API_ENDPOINTS.SESSION.INVITE(sessionId),
      { memberIds }
    )
  },

  // 解散群聊
  dissolveGroup(sessionId: string) {
    return request.delete<any, { sessionId: string; dissolvedAt: string }>(
      API_ENDPOINTS.SESSION.DISSOLVE(sessionId)
    )
  },

  // 更新群名称
  updateGroupName(sessionId: string, name: string) {
    return request.put<any, { sessionId: string; name: string }>(
      API_ENDPOINTS.SESSION.UPDATE_NAME(sessionId),
      { name }
    )
  }
}