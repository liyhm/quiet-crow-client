import request from './request'
import { API_ENDPOINTS } from '../config/api'

export interface UserInfo {
  id: string
  username: string
  showName: string
  avatar: string | null
  phone: string | null
}

export interface UpdateUserParams {
  displayName?: string
  phone?: string
  avatar?: string
}

export interface AvatarUploadResponse {
  avatarUrl: string
  fileId: string
}

export const userApi = {
  // 获取当前用户信息
  getInfo() {
    return request.get<any, UserInfo>(API_ENDPOINTS.USER.INFO)
  },

  // 搜索用户
  search(keyword: string) {
    return request.get<any, UserInfo[]>(API_ENDPOINTS.USER.SEARCH, {
      params: { keyword }
    })
  },

  // 更新用户信息
  update(params: UpdateUserParams) {
    return request.put<any, UserInfo>(API_ENDPOINTS.USER.UPDATE, params)
  },

  // 上传头像
  uploadAvatar(file: File) {
    console.log('📤 [userApi.uploadAvatar] 开始上传头像')
    console.log('📤 [userApi.uploadAvatar] 文件名:', file.name)
    console.log('📤 [userApi.uploadAvatar] 文件大小:', (file.size / 1024).toFixed(2), 'KB')
    console.log('📤 [userApi.uploadAvatar] 文件类型:', file.type)
    
    const formData = new FormData()
    formData.append('file', file)
    
    return request.post<any, AvatarUploadResponse>(API_ENDPOINTS.USER.AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 秒超时
    }).then(response => {
      console.log('✅ [userApi.uploadAvatar] 上传成功')
      console.log('✅ [userApi.uploadAvatar] 响应:', response)
      return response
    }).catch(error => {
      console.error('❌ [userApi.uploadAvatar] 上传失败')
      console.error('❌ [userApi.uploadAvatar] 错误:', error)
      console.error('❌ [userApi.uploadAvatar] 响应:', error.response?.data)
      console.error('❌ [userApi.uploadAvatar] 状态码:', error.response?.status)
      throw error
    })
  }
}
