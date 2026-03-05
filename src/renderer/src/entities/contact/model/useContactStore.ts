import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contactsApi, type ContactRequest } from '@/shared/api/contacts'

export interface Contact {
  userId: string
  username: string
  displayName: string
  avatar: string
  status: string
  statusMessage: string
  isOnline?: boolean  // 新增：在线状态
}

export const useContactStore = defineStore('contact', () => {
  const contacts = ref<Contact[]>([])
  const pendingRequests = ref<ContactRequest[]>([])
  const loading = ref(false)

  const loadContacts = async () => {
    try {
      loading.value = true
      console.log('📇 加载联系人列表...')
      
      const relations = await contactsApi.getList()
      console.log('✅ 后端返回的联系人关系:', JSON.stringify(relations, null, 2))

      // 后端返回的联系人列表已经包含了用户信息
      // 直接映射到 Contact 接口
      contacts.value = relations
        .filter((r) => {
          console.log('检查联系人状态:', r)
          return r.status === 'ACCEPTED' || !r.status // 如果没有 status 字段，也认为是已接受的
        })
        .map((relation: any) => {
          const contact = {
            userId: relation.userId || relation.toUserId || relation.id || '',
            username: relation.username || 'unknown',
            displayName: relation.showName || relation.username || '未知用户',
            avatar: relation.avatar || '',
            status: 'ONLINE',
            statusMessage: '',
            isOnline: relation.isOnline  // 新增：映射在线状态
          }
          console.log('映射联系人:', contact)
          
          // 验证必需字段
          if (!contact.userId) {
            console.error('⚠️ 联系人缺少 userId:', relation)
          }
          
          return contact
        })
        .filter(c => c.userId) // 过滤掉没有 userId 的联系人
      
      console.log('✅ 联系人列表加载完成:', contacts.value.length, '个联系人')
      return { success: true }
    } catch (error) {
      console.error('❌ 加载联系人失败:', error)
      return { success: false, error: String(error) }
    } finally {
      loading.value = false
    }
  }

  const loadPendingRequests = async () => {
    try {
      console.log('📬 加载好友请求...')
      const requests = await contactsApi.getPendingRequests()
      pendingRequests.value = requests
      console.log('✅ 好友请求:', requests.length)
      return { success: true }
    } catch (error) {
      console.error('❌ 加载好友请求失败:', error)
      return { success: false, error: String(error) }
    }
  }

  const sendRequest = async (targetUserId: string, message: string) => {
    try {
      console.log('📤 发送好友请求:', { targetUserId, message })
      await contactsApi.sendRequest({ targetUserId, message })
      console.log('✅ 好友请求已发送')
      return { success: true }
    } catch (error) {
      console.error('❌ 发送好友请求失败:', error)
      return { success: false, error: String(error) }
    }
  }

  const sendRequestByUsername = async (username: string, message: string) => {
    try {
      console.log('📤 通过用户名发送好友请求:', { username, message })
      await contactsApi.sendRequestByUsername({ username, message })
      console.log('✅ 好友请求已发送')
      return { success: true }
    } catch (error) {
      console.error('❌ 发送好友请求失败:', error)
      return { success: false, error: String(error) }
    }
  }

  const acceptRequest = async (requestId: string) => {
    try {
      console.log('✅ 接受好友请求:', requestId)
      const response = await contactsApi.acceptRequest(requestId)
      console.log('✅ 接受请求响应:', response)
      
      console.log('🔄 重新加载联系人列表...')
      await loadContacts()
      
      console.log('🔄 重新加载好友请求列表...')
      await loadPendingRequests()
      
      return { success: true }
    } catch (error) {
      console.error('❌ 接受好友请求失败:', error)
      return { success: false, error: String(error) }
    }
  }

  const rejectRequest = async (requestId: string) => {
    try {
      console.log('❌ 拒绝好友请求:', requestId)
      await contactsApi.rejectRequest(requestId)
      await loadPendingRequests()
      return { success: true }
    } catch (error) {
      console.error('❌ 拒绝好友请求失败:', error)
      return { success: false, error: String(error) }
    }
  }

  const deleteFriend = async (userId: string) => {
    try {
      console.log('🗑️ 删除好友:', userId)
      await contactsApi.deleteFriend(userId)
      await loadContacts()
      return { success: true }
    } catch (error) {
      console.error('❌ 删除好友失败:', error)
      return { success: false, error: String(error) }
    }
  }

  return {
    contacts,
    pendingRequests,
    loading,
    loadContacts,
    loadPendingRequests,
    sendRequest,
    sendRequestByUsername,
    acceptRequest,
    rejectRequest,
    deleteFriend
  }
})
