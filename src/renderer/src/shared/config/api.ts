// API 配置
// 从环境变量读取，支持开发和生产环境切换
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws',  // SockJS 使用 HTTP/HTTPS
  TOKEN_KEY: 'chat_token',
  TIMEOUT: 60000, // 默认 60 秒
  LONG_TIMEOUT: 120000, // 长超时 120 秒（用于获取消息等耗时操作）
  // 当前环境
  ENV: import.meta.env.MODE,
  // 是否为生产环境
  IS_PROD: import.meta.env.PROD,
  // 是否为开发环境
  IS_DEV: import.meta.env.DEV
}

// 打印配置信息（仅开发环境）
if (API_CONFIG.IS_DEV) {
  console.log('🔧 API 配置:', {
    BASE_URL: API_CONFIG.BASE_URL,
    WS_URL: API_CONFIG.WS_URL,
    ENV: API_CONFIG.ENV,
    IS_DEV: API_CONFIG.IS_DEV,
    IS_PROD: API_CONFIG.IS_PROD
  })
}

export const API_ENDPOINTS = {
  // 认证
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh'
  },
  // 用户
  USER: {
    INFO: '/api/user/info',
    SEARCH: '/api/user/search',
    UPDATE: '/api/user/me',
    AVATAR: '/api/user/avatar'
  },
  // 好友
  CONTACTS: {
    LIST: '/api/contact/list',
    REQUESTS: '/api/contact/request',
    REQUEST_BY_USERNAME: '/api/contact/request/by-username',
    PENDING: '/api/contact/pending',
    ACCEPT: (id: string) => `/api/contact/accept/${id}`,
    REJECT: (id: string) => `/api/contact/reject/${id}`,
    DELETE: (userId: string) => `/api/contact/${userId}`
  },
  // 会话
  SESSION: {
    MY: '/api/session/my',
    PRIVATE: '/api/session/private',
    GROUP: '/api/session/group',
    MEMBERS: (sessionId: string) => `/api/session/${sessionId}/members`,
    INVITE: (sessionId: string) => `/api/session/${sessionId}/invite`,
    DISSOLVE: (sessionId: string) => `/api/session/${sessionId}/dissolve`,
    UPDATE_NAME: (sessionId: string) => `/api/session/${sessionId}/name`,
    MESSAGES: (sessionId: string) => `/api/session/${sessionId}/messages`,
    READ: (sessionId: string) => `/api/session/${sessionId}/read`,
    READ_SINGLE: (messageId: string) => `/api/session/message/${messageId}/read`,
    READ_BATCH: (sessionId: string) => `/api/session/${sessionId}/read/batch`,
    DELETE: (sessionId: string) => `/api/session/${sessionId}`,
    DELETE_MESSAGE: (messageId: string) => `/api/session/message/${messageId}`
  },
  // 加密
  ENCRYPTION: {
    PUBLIC_KEY: '/api/encryption/public-key',
    USER_KEY: (userId: string) => `/api/encryption/user/${userId}/public-key`,
    BATCH_KEYS: '/api/encryption/keys/public/batch',
    SESSION_KEY: (sessionId: string) => `/api/encryption/session/${sessionId}/key`,
    GENERATE_KEY: (sessionId: string) => `/api/encryption/session/${sessionId}/key`
  },
  // 文件
  MEDIA: {
    UPLOAD: '/api/media/upload',
    DOWNLOAD: (fileId: string) => `/api/media/${fileId}`
  }
}
