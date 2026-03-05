import request from './request'
import { API_ENDPOINTS } from '../config/api'

export interface PublicKeyResponse {
  userId: string
  publicKey: string
}

export interface SessionKeyResponse {
  sessionId: string
  aesKey: string
}

export interface BatchKeysParams {
  userIds: string[]
}

export const encryptionApi = {
  // 获取自己的公钥
  getMyPublicKey() {
    return request.get<any, PublicKeyResponse>(API_ENDPOINTS.ENCRYPTION.PUBLIC_KEY)
  },

  // 获取其他用户公钥
  getUserPublicKey(userId: string) {
    return request.get<any, PublicKeyResponse>(API_ENDPOINTS.ENCRYPTION.USER_KEY(userId))
  },

  // 批量获取公钥
  getBatchPublicKeys(params: BatchKeysParams) {
    return request.post<any, Record<string, string>>(API_ENDPOINTS.ENCRYPTION.BATCH_KEYS, params)
  },

  // 生成会话密钥
  generateSessionKey(sessionId: string) {
    return request.post<any, SessionKeyResponse>(API_ENDPOINTS.ENCRYPTION.GENERATE_KEY(sessionId))
  },

  // 获取会话密钥
  getSessionKey(sessionId: string) {
    return request.get<any, SessionKeyResponse>(API_ENDPOINTS.ENCRYPTION.SESSION_KEY(sessionId))
  }
}
