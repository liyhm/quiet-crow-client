# Design Document: Media File Upload

## Overview

媒体文件上传功能为 Silent Crow 聊天应用提供安全的图片和视频上传能力。该功能遵循 Feature-Sliced Design 架构，集成到现有的 Vue 3 + TypeScript + Pinia 技术栈中，支持多种上传方式（文件选择、拖放、粘贴），并提供端到端加密保护。

核心设计原则：
- 安全优先：所有媒体文件在传输前加密
- 用户体验：实时进度反馈和多种上传方式
- 架构一致性：遵循 FSD 分层架构
- 性能优化：本地缓存和渐进式加载

## Architecture

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (Widgets)                        │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ MediaUploadButton│  │ MediaPreview     │                │
│  │ - 文件选择        │  │ - 图片/视频显示   │                │
│  │ - 拖放区域        │  │ - 下载/解密      │                │
│  │ - 粘贴监听        │  │ - 加载状态       │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Feature Layer (Features)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            uploadMedia Feature                        │  │
│  │  - 文件验证逻辑                                        │  │
│  │  - 上传流程编排                                        │  │
│  │  - 进度管理                                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Entity Layer (Entities)                     │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ useMediaStore    │  │ useCryptoStore   │                │
│  │ - 上传状态管理    │  │ - 文件加密/解密   │                │
│  │ - 媒体列表       │  │ - 密钥管理       │                │
│  │ - 缓存管理       │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Shared Layer (Shared)                      │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ media.ts (API)   │  │ fileValidator.ts │                │
│  │ - POST /upload   │  │ - 类型检查       │                │
│  │ - GET /{fileId}  │  │ - 大小检查       │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户操作 (选择/拖放/粘贴)
    ↓
文件验证 (类型、大小)
    ↓
文件加密 (AES-256-GCM)
    ↓
上传到服务器 (带进度)
    ↓
接收 fileId
    ↓
存储到 Pinia Store
    ↓
显示在聊天界面
```

## Components and Interfaces

### 1. UI Components (Widgets Layer)

#### MediaUploadButton.vue
```typescript
// 位置: src/renderer/src/widgets/mediaUpload/MediaUploadButton.vue

interface Props {
  disabled?: boolean
  accept?: string  // 默认: 'image/*,video/*'
}

interface Emits {
  (e: 'upload-start', file: File): void
  (e: 'upload-progress', progress: number): void
  (e: 'upload-complete', fileId: string): void
  (e: 'upload-error', error: Error): void
}

// 功能:
// - 渲染上传按钮
// - 监听文件选择事件
// - 监听拖放事件 (dragover, drop)
// - 监听粘贴事件 (paste)
// - 显示上传进度
```

#### MediaPreview.vue
```typescript
// 位置: src/renderer/src/widgets/mediaPreview/MediaPreview.vue

interface Props {
  fileId: string
  fileType: 'image' | 'video'
  thumbnail?: string  // 缩略图 URL
}

interface Emits {
  (e: 'load-complete'): void
  (e: 'load-error', error: Error): void
}

// 功能:
// - 显示加载状态
// - 下载加密文件
// - 解密文件
// - 渲染图片/视频
// - 缓存解密后的文件
```

### 2. Feature Layer

#### uploadMedia Feature
```typescript
// 位置: src/renderer/src/features/uploadMedia/uploadMedia.ts

export interface UploadOptions {
  file: File
  onProgress?: (progress: number) => void
  onComplete?: (fileId: string) => void
  onError?: (error: Error) => void
}

export async function uploadMedia(options: UploadOptions): Promise<string> {
  // 1. 验证文件
  validateFile(options.file)
  
  // 2. 加密文件
  const encryptedData = await encryptFile(options.file)
  
  // 3. 上传文件
  const fileId = await uploadToServer(encryptedData, options.onProgress)
  
  // 4. 更新状态
  const mediaStore = useMediaStore()
  mediaStore.addUploadedFile({
    fileId,
    fileName: options.file.name,
    fileType: getFileType(options.file),
    fileSize: options.file.size,
    encryptionKey: encryptedData.key
  })
  
  return fileId
}
```

### 3. Entity Layer

#### useMediaStore
```typescript
// 位置: src/renderer/src/entities/media/model/useMediaStore.ts

export interface MediaFile {
  fileId: string
  fileName: string
  fileType: 'image' | 'video'
  fileSize: number
  encryptionKey: string
  uploadedAt: number
  thumbnailUrl?: string
}

export interface UploadTask {
  id: string
  file: File
  progress: number
  status: 'pending' | 'encrypting' | 'uploading' | 'complete' | 'error'
  error?: Error
}

export const useMediaStore = defineStore('media', () => {
  // State
  const uploadedFiles = ref<Map<string, MediaFile>>(new Map())
  const activeUploads = ref<Map<string, UploadTask>>(new Map())
  const decryptedCache = ref<Map<string, Blob>>(new Map())
  
  // Actions
  const addUploadTask = (task: UploadTask) => {
    activeUploads.value.set(task.id, task)
  }
  
  const updateUploadProgress = (id: string, progress: number) => {
    const task = activeUploads.value.get(id)
    if (task) {
      task.progress = progress
    }
  }
  
  const completeUpload = (id: string, fileId: string) => {
    activeUploads.value.delete(id)
  }
  
  const addUploadedFile = (file: MediaFile) => {
    uploadedFiles.value.set(file.fileId, file)
  }
  
  const getMediaFile = (fileId: string): MediaFile | undefined => {
    return uploadedFiles.value.get(fileId)
  }
  
  const cacheDecryptedFile = (fileId: string, blob: Blob) => {
    decryptedCache.value.set(fileId, blob)
  }
  
  const getDecryptedFile = (fileId: string): Blob | undefined => {
    return decryptedCache.value.get(fileId)
  }
  
  return {
    uploadedFiles,
    activeUploads,
    addUploadTask,
    updateUploadProgress,
    completeUpload,
    addUploadedFile,
    getMediaFile,
    cacheDecryptedFile,
    getDecryptedFile
  }
})
```

### 4. Shared Layer

#### media.ts (API)
```typescript
// 位置: src/renderer/src/shared/api/media.ts

export interface UploadResponse {
  fileId: string
  uploadedAt: string
}

export interface DownloadResponse {
  encryptedData: ArrayBuffer
  contentType: string
}

export const mediaApi = {
  // 上传加密文件
  async upload(
    encryptedData: ArrayBuffer,
    fileName: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', new Blob([encryptedData]), fileName)
    
    return request.post('/api/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100
          onProgress?.(progress)
        }
      }
    })
  },
  
  // 下载加密文件
  async download(fileId: string): Promise<DownloadResponse> {
    const response = await request.get(`/api/media/${fileId}`, {
      responseType: 'arraybuffer'
    })
    
    return {
      encryptedData: response.data,
      contentType: response.headers['content-type']
    }
  }
}
```

#### fileValidator.ts
```typescript
// 位置: src/renderer/src/shared/lib/fileValidator.ts

export const FILE_CONSTRAINTS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  VIDEO: {
    maxSize: 50 * 1024 * 1024, // 50MB
    types: ['video/mp4', 'video/webm', 'video/quicktime']
  }
}

export class FileValidationError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TYPE' | 'SIZE_EXCEEDED'
  ) {
    super(message)
    this.name = 'FileValidationError'
  }
}

export function validateFile(file: File): void {
  const isImage = FILE_CONSTRAINTS.IMAGE.types.includes(file.type)
  const isVideo = FILE_CONSTRAINTS.VIDEO.types.includes(file.type)
  
  if (!isImage && !isVideo) {
    throw new FileValidationError(
      `不支持的文件类型: ${file.type}`,
      'INVALID_TYPE'
    )
  }
  
  const maxSize = isImage 
    ? FILE_CONSTRAINTS.IMAGE.maxSize 
    : FILE_CONSTRAINTS.VIDEO.maxSize
  
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    throw new FileValidationError(
      `文件大小超过限制 (最大 ${maxSizeMB}MB)`,
      'SIZE_EXCEEDED'
    )
  }
}

export function getFileType(file: File): 'image' | 'video' {
  return FILE_CONSTRAINTS.IMAGE.types.includes(file.type) 
    ? 'image' 
    : 'video'
}
```

## Data Models

### MediaFile Model
```typescript
// 位置: src/renderer/src/shared/types/media.ts

export interface MediaFile {
  fileId: string          // 服务器返回的文件 ID
  fileName: string        // 原始文件名
  fileType: 'image' | 'video'  // 文件类型
  fileSize: number        // 文件大小（字节）
  encryptionKey: string   // AES 加密密钥（Base64）
  uploadedAt: number      // 上传时间戳
  thumbnailUrl?: string   // 缩略图 URL（可选）
}

export interface UploadTask {
  id: string              // 任务 ID (UUID)
  file: File              // 原始文件对象
  progress: number        // 上传进度 (0-100)
  status: UploadStatus    // 任务状态
  error?: Error           // 错误信息
  startedAt: number       // 开始时间
}

export type UploadStatus = 
  | 'pending'      // 等待中
  | 'encrypting'   // 加密中
  | 'uploading'    // 上传中
  | 'complete'     // 完成
  | 'error'        // 错误

export interface EncryptedFileData {
  data: ArrayBuffer       // 加密后的数据
  key: string             // AES 密钥（Base64）
  iv: string              // 初始化向量（Base64）
}
```

### Message Model Extension
```typescript
// 位置: src/renderer/src/shared/types/message.ts

export interface Message {
  id: string
  sessionId: string
  senderId: string
  content: string
  timestamp: number
  isRead: boolean
  
  // 新增：媒体文件支持
  mediaFile?: {
    fileId: string
    fileType: 'image' | 'video'
    thumbnailUrl?: string
  }
}
```

## Correctness Properties

*属性（Property）是系统在所有有效执行中应该保持为真的特征或行为——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

