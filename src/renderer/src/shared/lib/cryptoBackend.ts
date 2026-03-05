// 与后端兼容的加密工具类（使用 crypto-js）
import CryptoJS from 'crypto-js'

const SESSION_KEYS_STORAGE_KEY = 'chat_session_keys'

export class BackendCryptoUtil {
  private sessionKeys: Map<string, string> = new Map()

  constructor() {
    // 从 localStorage 恢复会话密钥
    this.loadKeysFromStorage()
  }

  // 从 localStorage 加载密钥
  private loadKeysFromStorage() {
    try {
      const stored = localStorage.getItem(SESSION_KEYS_STORAGE_KEY)
      if (stored) {
        const keys = JSON.parse(stored)
        this.sessionKeys = new Map(Object.entries(keys))
        console.log('✅ [BackendCrypto] 从 localStorage 恢复了', this.sessionKeys.size, '个会话密钥')
      }
    } catch (error) {
      console.error('❌ [BackendCrypto] 加载会话密钥失败:', error)
    }
  }

  // 保存密钥到 localStorage
  private saveKeysToStorage() {
    try {
      const keys = Object.fromEntries(this.sessionKeys)
      localStorage.setItem(SESSION_KEYS_STORAGE_KEY, JSON.stringify(keys))
    } catch (error) {
      console.error('❌ [BackendCrypto] 保存会话密钥失败:', error)
    }
  }

  // 设置会话密钥（Base64 格式）
  setSessionKey(sessionId: string, aesKeyBase64: string) {
    this.sessionKeys.set(sessionId, aesKeyBase64)
    this.saveKeysToStorage() // 持久化
  }

  // 获取会话密钥
  getSessionKey(sessionId: string): string | undefined {
    return this.sessionKeys.get(sessionId)
  }

  // AES-ECB 加密消息（与后端一致）
  encryptMessage(message: string, aesKeyBase64: string): string {
    const key = CryptoJS.enc.Base64.parse(aesKeyBase64)
    const encrypted = CryptoJS.AES.encrypt(message, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.toString()
  }

  // AES-ECB 解密消息（与后端一致）
  decryptMessage(encryptedMessage: string, aesKeyBase64: string): string {
    const key = CryptoJS.enc.Base64.parse(aesKeyBase64)
    const decrypted = CryptoJS.AES.decrypt(encryptedMessage, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return decrypted.toString(CryptoJS.enc.Utf8)
  }

  // 使用会话密钥加密
  encryptWithSession(sessionId: string, message: string): string {
    const aesKey = this.sessionKeys.get(sessionId)
    if (!aesKey) {
      throw new Error(`会话密钥不存在: ${sessionId}`)
    }
    return this.encryptMessage(message, aesKey)
  }

  // 使用会话密钥解密
  decryptWithSession(sessionId: string, encryptedMessage: string): string {
    const aesKey = this.sessionKeys.get(sessionId)
    if (!aesKey) {
      throw new Error(`会话密钥不存在: ${sessionId}`)
    }
    return this.decryptMessage(encryptedMessage, aesKey)
  }

  // 清除会话密钥
  clearSessionKey(sessionId: string) {
    this.sessionKeys.delete(sessionId)
    this.saveKeysToStorage() // 持久化
  }

  // 清除所有密钥
  clearAllKeys() {
    this.sessionKeys.clear()
    localStorage.removeItem(SESSION_KEYS_STORAGE_KEY)
  }
}

// 导出单例
export const backendCrypto = new BackendCryptoUtil()
