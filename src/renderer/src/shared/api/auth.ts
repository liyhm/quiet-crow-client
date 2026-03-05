import request from './request'
import { API_ENDPOINTS } from '../config/api'

export interface RegisterParams {
  username: string
  password: string
  nickname: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
}

export const authApi = {
  // 注册
  register(params: RegisterParams) {
    return request.post<any, string>(API_ENDPOINTS.AUTH.REGISTER, params)
  },

  // 登录
  login(params: LoginParams) {
    return request.post<any, LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, params)
  },

  // 刷新 Token
  refresh() {
    return request.post<any, LoginResponse>(API_ENDPOINTS.AUTH.REFRESH)
  }
}
