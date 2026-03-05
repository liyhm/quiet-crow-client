import request from './request'
import { API_ENDPOINTS } from '../config/api'

export interface ContactRelation {
  id: string
  userId: string
  username: string
  showName: string
  avatar: string
  remark: string | null
  addedTime: string
  publicKey: string
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  isOnline?: boolean  // 新增：在线状态
}

export interface ContactRequest {
  requestId: string
  fromUserId: string
  fromUsername: string
  fromShowName: string
  fromAvatar: string
  requestMessage: string
  requestTime: string
}

export interface SendRequestParams {
  targetUserId: string
  message: string
}

export interface SendRequestByUsernameParams {
  username: string
  message: string
}

export const contactsApi = {
  // 获取好友列表
  getList() {
    return request.get<any, ContactRelation[]>(API_ENDPOINTS.CONTACTS.LIST)
  },

  // 发送好友请求（通过用户ID）
  sendRequest(params: SendRequestParams) {
    return request.post(API_ENDPOINTS.CONTACTS.REQUESTS, params)
  },

  // 发送好友请求（通过用户名）
  sendRequestByUsername(params: SendRequestByUsernameParams) {
    return request.post(API_ENDPOINTS.CONTACTS.REQUEST_BY_USERNAME, params)
  },

  // 获取待处理请求
  getPendingRequests() {
    return request.get<any, ContactRequest[]>(API_ENDPOINTS.CONTACTS.PENDING)
  },

  // 接受好友请求
  acceptRequest(requestId: string) {
    return request.post(API_ENDPOINTS.CONTACTS.ACCEPT(requestId))
  },

  // 拒绝好友请求
  rejectRequest(requestId: string) {
    return request.post(API_ENDPOINTS.CONTACTS.REJECT(requestId))
  },

  // 删除好友
  deleteFriend(userId: string) {
    return request.delete(API_ENDPOINTS.CONTACTS.DELETE(userId))
  }
}
