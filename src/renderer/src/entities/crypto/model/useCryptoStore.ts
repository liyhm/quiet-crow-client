import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CryptoService } from '@/shared/lib/crypto'
import type { RSAKeyPair } from '@/shared/types'

export const useCryptoStore = defineStore('crypto', () => {
  const rsaKeyPair = ref<RSAKeyPair | null>(null)
  const publicKeyPem = ref<string>('')
  const sessionKeys = ref<Record<string, CryptoKey>>({})
  const isInitialized = ref(false)

  const hasKeyPair = computed(() => !!rsaKeyPair.value)
  const publicKeyBase64 = computed(() => publicKeyPem.value)

  const initialize = async () => {
    try {
      // 检查 window.api 是否可用
      if (!window.api || !window.api.secureStorage) {
        console.warn('⚠️ Secure storage API not available, skipping crypto initialization')
        isInitialized.value = true
        return
      }

      // Try to load existing private key from secure storage
      const privateKey = await CryptoService.loadPrivateKeySecurely()

      if (privateKey) {
        // TODO: Fetch public key from server or regenerate
        const keyPair = await CryptoService.generateRSAKeyPair()
        rsaKeyPair.value = { publicKey: keyPair.publicKey, privateKey }
        publicKeyPem.value = await CryptoService.exportPublicKey(keyPair.publicKey)
      }

      isInitialized.value = true
      console.log('✅ Crypto initialized')
    } catch (error) {
      console.error('❌ Failed to initialize crypto:', error)
      isInitialized.value = true
    }
  }

  const generateRSAKeyPair = async () => {
    try {
      const keyPair = await CryptoService.generateRSAKeyPair()
      rsaKeyPair.value = keyPair
      publicKeyPem.value = await CryptoService.exportPublicKey(keyPair.publicKey)

      // Save private key to secure storage
      await CryptoService.savePrivateKeySecurely(keyPair.privateKey)

      // TODO: Upload public key to server

      return { success: true, publicKey: publicKeyPem.value }
    } catch (error) {
      console.error('Failed to generate RSA key pair:', error)
      return { success: false, error: String(error) }
    }
  }

  const negotiateSessionKey = async (sessionId: string, _targetUserId: string) => {
    try {
      // Check if session key already exists
      if (sessionKeys.value[sessionId]) {
        return { success: true }
      }

      // Generate new AES session key
      const aesKey = await CryptoService.generateAESKey()

      // TODO: Fetch target user's public key from server
      // TODO: Encrypt AES key with target's RSA public key
      // TODO: Send encrypted key to server

      // Store session key
      sessionKeys.value[sessionId] = aesKey

      return { success: true }
    } catch (error) {
      console.error('Failed to negotiate session key:', error)
      return { success: false, error: String(error) }
    }
  }

  const encryptMessage = async (sessionId: string, plaintext: string) => {
    try {
      const sessionKey = sessionKeys.value[sessionId]
      if (!sessionKey) {
        throw new Error('Session key not found')
      }

      const encrypted = await CryptoService.encryptMessage(plaintext, sessionKey)
      return { success: true as const, ...encrypted }
    } catch (error) {
      console.error('Failed to encrypt message:', error)
      return { success: false as const, error: String(error) }
    }
  }

  const decryptMessage = async (
    sessionId: string,
    ciphertext: string,
    iv: string,
    authTag: string
  ) => {
    try {
      const sessionKey = sessionKeys.value[sessionId]
      if (!sessionKey) {
        throw new Error('Session key not found')
      }

      const plaintext = await CryptoService.decryptMessage(ciphertext, iv, authTag, sessionKey)
      return { success: true as const, plaintext }
    } catch (error) {
      console.error('Failed to decrypt message:', error)
      return { success: false as const, error: String(error) }
    }
  }

  const getSessionKey = (sessionId: string) => {
    return sessionKeys.value[sessionId]
  }

  return {
    rsaKeyPair,
    publicKeyPem,
    sessionKeys,
    isInitialized,
    hasKeyPair,
    publicKeyBase64,
    initialize,
    generateRSAKeyPair,
    negotiateSessionKey,
    encryptMessage,
    decryptMessage,
    getSessionKey
  }
})
