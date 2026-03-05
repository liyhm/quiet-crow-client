import axios, { AxiosInstance } from 'axios'
import { API_CONFIG } from '../config/api'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT
})

// 请求拦截器 - 自动添加 Token
request.interceptors.request.use(
  (config) => {
    console.log('🚀 发送请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers
    })

    const token = localStorage.getItem(API_CONFIG.TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('✅ Token 已添加')
    } else {
      console.log('⚠️ 没有 Token')
    }
    return config
  },
  (error) => {
    console.error('❌ 请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和错误
request.interceptors.response.use(
  (response) => {
    console.log('✅ 收到响应:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    })

    // 后端统一响应格式: { code: 200, message: "success", data: {...} }
    const { code, data, message } = response.data

    if (code === 200) {
      return data
    } else {
      console.error('❌ 业务错误:', { code, message })
      return Promise.reject(new Error(message || '请求失败'))
    }
  },
  (error) => {
    console.error('❌ 请求失败详情:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      },
      response: error.response
        ? {
            status: error.response.status,
            statusText: error.response.statusText,
            headers: error.response.headers,
            data: error.response.data
          }
        : '无响应'
    })

    // Token 过期或无效处理 (401 未授权, 403 禁止访问)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🔒 Token 无效或过期，清除本地数据')
      localStorage.removeItem(API_CONFIG.TOKEN_KEY)
      // 只有在不是登录页面时才跳转
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default request
