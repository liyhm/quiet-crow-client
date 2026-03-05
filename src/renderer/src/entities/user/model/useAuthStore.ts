import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '@/shared/types'
import { UserStatus } from '@/shared/types'
import { authApi } from '@/shared/api/auth'
import { userApi } from '@/shared/api/user'
import { API_CONFIG } from '@/shared/config/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const currentUser = ref<User | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const userId = computed(() => currentUser.value?.id)
  const userRole = computed(() => currentUser.value?.role)
  const isAdmin = computed(() => userRole.value === 'ROLE_ADMIN')

  const login = async (credentials: { username: string; password: string }) => {
    try {
      // 调用登录 API
      const response = await authApi.login(credentials)

      // 保存 token
      token.value = response.token
      localStorage.setItem(API_CONFIG.TOKEN_KEY, response.token)

      // 获取用户信息
      const userInfo = await userApi.getInfo()
      currentUser.value = {
        id: userInfo.id,
        username: userInfo.username,
        displayName: userInfo.showName,
        avatar: userInfo.avatar || '',
        email: `${userInfo.username}@example.com`,
        role: 'ROLE_USER' as UserRole,
        status: UserStatus.ONLINE,
        statusMessage: '',
        publicKey: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: String(error) }
    }
  }

  const register = async (params: { username: string; password: string; nickname: string }) => {
    try {
      await authApi.register(params)
      return { success: true }
    } catch (error) {
      console.error('Register failed:', error)
      return { success: false, error: String(error) }
    }
  }

  const logout = () => {
    console.log('🚪 开始登出...')
    
    // 快速清理本地数据
    token.value = null
    currentUser.value = null
    localStorage.removeItem(API_CONFIG.TOKEN_KEY)
    
    // 清除会话密钥
    try {
      const { backendCrypto } = require('@/shared/lib/cryptoBackend')
      backendCrypto.clearAllKeys()
      console.log('✅ 已清除所有会话密钥')
    } catch (error) {
      console.warn('⚠️ 清除密钥时出错（忽略）:', error)
    }
    
    // 断开 WebSocket（不等待）
    try {
      const { websocketService } = require('@/shared/api/websocket')
      websocketService.disconnect()
    } catch (error) {
      console.warn('⚠️ 断开 WebSocket 时出错（忽略）:', error)
    }
    
    console.log('✅ 登出完成')
  }

  const checkAuth = async () => {
    const savedToken = localStorage.getItem(API_CONFIG.TOKEN_KEY)
    if (savedToken) {
      token.value = savedToken
      
      // 如果已经有用户信息，直接使用（避免重复请求）
      if (currentUser.value) {
        console.log('✅ 使用缓存的用户信息')
        isInitialized.value = true
        return
      }
      
      try {
        console.log('🔍 验证已保存的 Token...')
        // 验证 token 并获取用户信息（添加超时）
        const userInfo = await Promise.race([
          userApi.getInfo(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('请求超时')), 5000)
          )
        ]) as any
        
        currentUser.value = {
          id: userInfo.id,
          username: userInfo.username,
          displayName: userInfo.showName,
          avatar: userInfo.avatar || '',
          email: `${userInfo.username}@example.com`,
          role: 'ROLE_USER' as UserRole,
          status: UserStatus.ONLINE,
          statusMessage: '',
          publicKey: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        console.log('✅ Token 验证成功')
      } catch (error) {
        console.error('❌ Token 验证失败，清除本地数据:', error)
        logout()
      }
    } else {
      console.log('ℹ️ 没有保存的 Token')
    }
    isInitialized.value = true
  }

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(API_CONFIG.TOKEN_KEY, newToken)
  }

  const setUser = (user: User) => {
    currentUser.value = user
  }

  const fetchUserInfo = async () => {
    try {
      const userInfo = await userApi.getInfo()
      currentUser.value = {
        id: userInfo.id,
        username: userInfo.username,
        displayName: userInfo.showName,
        avatar: userInfo.avatar || '',
        email: `${userInfo.username}@example.com`,
        phone: userInfo.phone || '',
        role: 'ROLE_USER' as UserRole,
        status: UserStatus.ONLINE,
        statusMessage: '',
        publicKey: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      console.log('✅ 用户信息已刷新')
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error)
      throw error
    }
  }

  return {
    token,
    currentUser,
    isInitialized,
    isAuthenticated,
    userId,
    userRole,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
    setToken,
    setUser,
    fetchUserInfo
  }
})
