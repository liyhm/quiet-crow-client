import axios from 'axios'
import { API_CONFIG, API_ENDPOINTS } from '../config/api'

export interface UploadMediaParams {
  file: Blob
  metadata: {
    sessionId: string
    fileName: string
    fileSize: number
    mimeType: string
    messageType: 'IMAGE' | 'VIDEO'
  }
}

export interface UploadMediaResponse {
  fileId: string
  uploadTime: string
  fileSize: number
  thumbnailUrl: string | null
}

export interface DownloadMediaResponse {
  data: ArrayBuffer
  fileName: string
  fileSize: number
  mimeType: string
  uploadTime: string
}

export const mediaApi = {
  /**
   * 上传媒体文件
   * @param params 上传参数
   * @param onProgress 进度回调
   * @returns 上传结果
   */
  async uploadMedia(
    params: UploadMediaParams,
    onProgress?: (progress: number) => void
  ): Promise<UploadMediaResponse> {
    const formData = new FormData()
    formData.append('file', params.file, 'encrypted.bin')
    formData.append('metadata', JSON.stringify(params.metadata))

    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY)

    try {
      const response = await axios.post<{
        code: number
        message: string
        data: UploadMediaResponse
      }>(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.MEDIA.UPLOAD}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : ''
        },
        timeout: 300000, // 5 分钟超时
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      })

      if (response.data.code === 200) {
        return response.data.data
      } else {
        throw new Error(response.data.message || '上传失败')
      }
    } catch (error: any) {
      console.error('❌ 文件上传失败:', error)
      if (error.response) {
        throw new Error(error.response.data?.message || '上传失败')
      } else if (error.request) {
        throw new Error('网络错误，请检查连接')
      } else {
        throw new Error(error.message || '上传失败')
      }
    }
  },

  /**
   * 下载媒体文件
   * @param fileId 文件 ID
   * @param onProgress 进度回调
   * @returns 下载结果
   */
  async downloadMedia(
    fileId: string,
    onProgress?: (progress: number) => void
  ): Promise<DownloadMediaResponse> {
    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY)

    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.MEDIA.DOWNLOAD(fileId)}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        responseType: 'arraybuffer',
        timeout: 300000, // 5 分钟超时
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      })

      return {
        data: response.data,
        fileName: response.headers['x-file-name'] || '',
        fileSize: parseInt(response.headers['x-file-size'] || '0'),
        mimeType: response.headers['x-mime-type'] || 'application/octet-stream',
        uploadTime: response.headers['x-upload-time'] || ''
      }
    } catch (error: any) {
      console.error('❌ 文件下载失败:', error)
      if (error.response) {
        throw new Error(error.response.data?.message || '下载失败')
      } else if (error.request) {
        throw new Error('网络错误，请检查连接')
      } else {
        throw new Error(error.message || '下载失败')
      }
    }
  }
}
