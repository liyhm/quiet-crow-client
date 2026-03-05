// Enums
export enum UserRole {
  USER = 'ROLE_USER',
  ADMIN = 'ROLE_ADMIN'
}

export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY'
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM'
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING'
}

export enum SessionType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP'
}

// User Interface
export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  email: string
  phone?: string
  role: UserRole
  status: UserStatus
  statusMessage: string
  publicKey: string
  createdAt: string
  updatedAt: string
}

// Message Interface
export interface Message {
  id: string
  sessionId: string
  senderId: string
  content: string // encrypted content
  iv: string // initialization vector
  authTag: string // authentication tag
  timestamp: string
  status: MessageStatus
  isRead: boolean
  type: MessageType
}

// Chat Session Interface
export interface ChatSession {
  id: string
  type: SessionType
  name: string
  avatar: string
  participants: string[] // user IDs
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isPinned: boolean
  isMuted: boolean
  memberCount?: number // 群聊成员数量（仅群聊）
  isOnline?: boolean // 在线状态（仅私聊）
  createdAt: string
  updatedAt: string
}

// Contact Interface
export interface Contact {
  userId: string
  username: string
  displayName: string
  avatar: string
  status: UserStatus
  statusMessage: string
  publicKey: string
  tags: string[]
  addedAt: string
}

// Crypto Types
export interface RSAKeyPair {
  publicKey: CryptoKey
  privateKey: CryptoKey
}

export interface EncryptedMessage {
  ciphertext: string
  iv: string
  authTag: string
}

// Network Types
export interface NetworkMetrics {
  latency: number
  lastHeartbeat: number
  reconnectAttempts: number
}

// Window State
export interface WindowState {
  isMaximized: boolean
  isMinimized: boolean
  isFocused: boolean
}
