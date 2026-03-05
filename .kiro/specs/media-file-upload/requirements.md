# Requirements Document

## Introduction

本文档定义了即时通讯应用中媒体文件上传功能的需求。该功能允许用户在聊天会话中发送图片和视频文件，文件将被加密后上传到服务器，接收方可以下载并解密查看。支持多种上传方式（文件选择、拖放、粘贴），并提供上传进度反馈和错误处理。

## Glossary

- **Media_Upload_System**: 媒体文件上传系统，负责处理文件的选择、验证、加密、上传和进度管理
- **File_Validator**: 文件验证器，负责检查文件类型、大小等是否符合要求
- **Crypto_Module**: 加密模块，负责文件内容的加密和解密
- **Upload_Manager**: 上传管理器，负责文件上传的网络请求和进度跟踪
- **Media_Message**: 媒体消息，包含文件信息的特殊消息类型
- **File_Preview**: 文件预览，在发送前显示文件的缩略图或信息
- **Progress_Indicator**: 进度指示器，显示文件上传的实时进度
- **Thumbnail**: 缩略图，图片或视频的小尺寸预览图
- **File_Metadata**: 文件元数据，包含文件名、大小、类型、上传时间等信息

## Requirements

### Requirement 1: 文件选择上传

**User Story:** 作为用户，我希望能够通过点击按钮选择图片或视频文件进行上传，以便分享媒体内容。

#### Acceptance Criteria

1. WHEN 用户点击图片按钮，THEN THE Media_Upload_System SHALL 打开文件选择对话框，仅显示图片文件（jpg, jpeg, png, gif, webp）
2. WHEN 用户点击文件按钮，THEN THE Media_Upload_System SHALL 打开文件选择对话框，显示图片和视频文件（mp4, mov, avi, webm）
3. WHEN 用户选择文件后，THEN THE File_Validator SHALL 验证文件类型和大小
4. WHEN 用户取消选择，THEN THE Media_Upload_System SHALL 不执行任何操作
5. THE Media_Upload_System SHALL 支持一次选择多个文件（最多 5 个）

### Requirement 2: 拖放上传

**User Story:** 作为用户，我希望能够通过拖放文件到聊天区域来上传，以便快速分享文件。

#### Acceptance Criteria

1. WHEN 用户拖动文件到消息列表区域，THEN THE Media_Upload_System SHALL 显示拖放提示覆盖层
2. WHEN 用户释放文件，THEN THE File_Validator SHALL 验证所有拖放的文件
3. WHEN 拖放的文件包含不支持的类型，THEN THE Media_Upload_System SHALL 过滤掉不支持的文件并提示用户
4. WHEN 用户拖动文件离开区域，THEN THE Media_Upload_System SHALL 隐藏拖放提示覆盖层
5. THE Media_Upload_System SHALL 支持同时拖放多个文件（最多 5 个）

### Requirement 3: 粘贴上传

**User Story:** 作为用户，我希望能够通过粘贴剪贴板中的图片来上传，以便快速分享截图。

#### Acceptance Criteria

1. WHEN 用户在输入框中按下 Ctrl+V（或 Cmd+V），THEN THE Media_Upload_System SHALL 检查剪贴板内容
2. WHEN 剪贴板包含图片数据，THEN THE Media_Upload_System SHALL 提取图片并准备上传
3. WHEN 剪贴板包含文件，THEN THE Media_Upload_System SHALL 处理文件上传
4. WHEN 剪贴板仅包含文本，THEN THE Media_Upload_System SHALL 不拦截粘贴操作
5. THE Media_Upload_System SHALL 为粘贴的图片生成默认文件名（如 "pasted-image-{timestamp}.png"）

### Requirement 4: 文件验证

**User Story:** 作为系统，我需要验证上传的文件是否符合要求，以确保安全性和性能。

#### Acceptance Criteria

1. THE File_Validator SHALL 检查图片文件大小不超过 5MB
2. THE File_Validator SHALL 检查视频文件大小不超过 50MB
3. THE File_Validator SHALL 验证文件类型在允许列表中：
   - 图片：image/jpeg, image/png, image/gif, image/webp
   - 视频：video/mp4, video/quicktime, video/x-msvideo, video/webm
4. WHEN 文件验证失败，THEN THE Media_Upload_System SHALL 显示具体的错误原因（文件过大、类型不支持等）
5. WHEN 文件验证成功，THEN THE Media_Upload_System SHALL 继续文件预览流程

### Requirement 5: 文件预览

**User Story:** 作为用户，我希望在发送前能够预览选择的文件，以确认文件正确。

#### Acceptance Criteria

1. WHEN 图片文件验证通过，THEN THE Media_Upload_System SHALL 生成并显示图片缩略图
2. WHEN 视频文件验证通过，THEN THE Media_Upload_System SHALL 显示视频第一帧作为缩略图
3. THE File_Preview SHALL 显示文件名、文件大小和文件类型
4. THE File_Preview SHALL 提供"发送"和"取消"按钮
5. WHEN 用户点击取消，THEN THE Media_Upload_System SHALL 清除预览并释放文件资源
6. WHEN 预览多个文件，THEN THE Media_Upload_System SHALL 以列表形式显示所有文件

### Requirement 6: 文件加密

**User Story:** 作为用户，我希望上传的文件被加密，以保护文件内容的隐私。

#### Acceptance Criteria

1. WHEN 用户确认发送文件，THEN THE Crypto_Module SHALL 使用会话密钥加密文件内容
2. THE Crypto_Module SHALL 使用 AES-256-GCM 算法加密文件
3. WHEN 加密失败，THEN THE Media_Upload_System SHALL 取消上传并显示错误提示
4. THE Crypto_Module SHALL 在 Web Worker 中执行加密操作，避免阻塞 UI
5. WHEN 文件较大（>1MB），THEN THE Crypto_Module SHALL 分块加密并显示加密进度

### Requirement 7: 文件上传

**User Story:** 作为用户，我希望文件能够可靠地上传到服务器，并能看到上传进度。

#### Acceptance Criteria

1. WHEN 文件加密完成，THEN THE Upload_Manager SHALL 使用 multipart/form-data 格式上传文件
2. THE Upload_Manager SHALL 使用 API 端点 `POST /api/media/upload` 上传文件
3. THE Upload_Manager SHALL 在请求中包含以下信息：
   - encryptedFile: 加密后的文件数据
   - fileName: 原始文件名（加密）
   - fileSize: 原始文件大小
   - mimeType: 文件 MIME 类型
   - sessionId: 会话 ID
4. WHEN 上传进行中，THEN THE Progress_Indicator SHALL 实时显示上传百分比
5. WHEN 上传成功，THEN THE Upload_Manager SHALL 接收服务器返回的 fileId
6. WHEN 上传失败，THEN THE Media_Upload_System SHALL 提供重试选项

### Requirement 8: 发送媒体消息

**User Story:** 作为用户，我希望文件上传成功后自动发送媒体消息，以便接收方能够看到。

#### Acceptance Criteria

1. WHEN 文件上传成功，THEN THE Media_Upload_System SHALL 创建媒体消息
2. THE Media_Message SHALL 包含以下信息：
   - messageType: "IMAGE" 或 "VIDEO"
   - fileId: 服务器返回的文件 ID
   - fileName: 文件名
   - fileSize: 文件大小
   - thumbnailUrl: 缩略图 URL（如果有）
3. THE Media_Upload_System SHALL 通过 WebSocket 发送媒体消息
4. THE Media_Message SHALL 在消息列表中显示为特殊的媒体消息气泡
5. WHEN 发送失败，THEN THE Media_Upload_System SHALL 显示失败状态并提供重试

### Requirement 9: 接收媒体消息

**User Story:** 作为用户，我希望能够接收并查看其他用户发送的图片和视频。

#### Acceptance Criteria

1. WHEN 接收到 messageType 为 "IMAGE" 或 "VIDEO" 的消息，THEN THE Media_Upload_System SHALL 识别为媒体消息
2. THE Media_Upload_System SHALL 显示媒体消息占位符（包含文件名和大小）
3. WHEN 用户点击媒体消息，THEN THE Media_Upload_System SHALL 下载并解密文件
4. THE Media_Upload_System SHALL 使用 API 端点 `GET /api/media/{fileId}` 下载文件
5. WHEN 下载完成，THEN THE Crypto_Module SHALL 解密文件内容
6. WHEN 解密成功，THEN THE Media_Upload_System SHALL 显示图片或视频播放器

### Requirement 10: 图片查看器

**User Story:** 作为用户，我希望能够全屏查看图片，并支持缩放和旋转操作。

#### Acceptance Criteria

1. WHEN 用户点击图片消息，THEN THE Media_Upload_System SHALL 打开全屏图片查看器
2. THE 图片查看器 SHALL 支持以下操作：
   - 缩放（鼠标滚轮或双指缩放）
   - 拖动（鼠标拖动或单指拖动）
   - 旋转（按钮控制）
   - 下载原图（按钮控制）
3. THE 图片查看器 SHALL 显示图片文件名和大小
4. WHEN 用户按下 ESC 键或点击关闭按钮，THEN THE 图片查看器 SHALL 关闭
5. WHEN 会话中有多张图片，THEN THE 图片查看器 SHALL 支持左右切换

### Requirement 11: 视频播放器

**User Story:** 作为用户，我希望能够在应用内播放视频，并支持基本的播放控制。

#### Acceptance Criteria

1. WHEN 用户点击视频消息，THEN THE Media_Upload_System SHALL 打开视频播放器
2. THE 视频播放器 SHALL 支持以下功能：
   - 播放/暂停
   - 进度条拖动
   - 音量控制
   - 全屏播放
   - 播放速度调整（0.5x, 1x, 1.5x, 2x）
3. THE 视频播放器 SHALL 显示视频时长和当前播放时间
4. WHEN 用户关闭播放器，THEN THE Media_Upload_System SHALL 停止播放并释放资源
5. THE 视频播放器 SHALL 使用 HTML5 video 元素实现

### Requirement 12: 上传进度管理

**User Story:** 作为用户，我希望能够看到文件上传的实时进度，并能够取消上传。

#### Acceptance Criteria

1. WHEN 文件开始上传，THEN THE Progress_Indicator SHALL 显示进度条和百分比
2. THE Progress_Indicator SHALL 显示上传速度（KB/s 或 MB/s）
3. THE Progress_Indicator SHALL 显示预计剩余时间
4. THE Progress_Indicator SHALL 提供取消按钮
5. WHEN 用户点击取消，THEN THE Upload_Manager SHALL 中止上传请求并清理资源
6. WHEN 上传完成，THEN THE Progress_Indicator SHALL 显示"处理中"状态（加密/发送消息）

### Requirement 13: 缓存管理

**User Story:** 作为系统，我需要管理已下载文件的缓存，以提高性能并节省带宽。

#### Acceptance Criteria

1. THE Media_Upload_System SHALL 缓存已下载并解密的文件到 IndexedDB
2. WHEN 用户再次查看相同文件，THEN THE Media_Upload_System SHALL 从缓存加载而不是重新下载
3. THE Media_Upload_System SHALL 限制缓存大小不超过 500MB
4. WHEN 缓存超过限制，THEN THE Media_Upload_System SHALL 删除最旧的文件
5. THE Media_Upload_System SHALL 提供清除缓存的选项（在设置中）

### Requirement 14: 错误处理

**User Story:** 作为用户，当文件上传或下载过程中出现错误时，我希望收到清晰的错误提示。

#### Acceptance Criteria

1. WHEN 文件类型不支持，THEN THE Media_Upload_System SHALL 显示"不支持的文件类型"错误
2. WHEN 文件大小超过限制，THEN THE Media_Upload_System SHALL 显示"文件过大"错误并说明限制
3. WHEN 网络错误导致上传失败，THEN THE Media_Upload_System SHALL 显示"网络错误"并提供重试
4. WHEN 加密或解密失败，THEN THE Media_Upload_System SHALL 显示"加密失败"错误
5. WHEN 服务器返回错误，THEN THE Media_Upload_System SHALL 显示服务器返回的错误信息
6. WHEN 下载文件失败，THEN THE Media_Upload_System SHALL 显示"下载失败"并提供重试
7. THE Media_Upload_System SHALL 记录所有错误到控制台以便调试

### Requirement 15: 性能优化

**User Story:** 作为用户，我希望文件上传和查看功能响应迅速，不会影响应用的整体性能。

#### Acceptance Criteria

1. THE Crypto_Module SHALL 在 Web Worker 中执行加密和解密操作
2. THE Media_Upload_System SHALL 对大文件（>5MB）进行分块处理
3. THE Media_Upload_System SHALL 压缩图片到合理尺寸（最大宽度 1920px）后再上传
4. THE Media_Upload_System SHALL 生成缩略图（最大 200x200px）用于消息列表显示
5. THE Media_Upload_System SHALL 使用懒加载，仅在消息可见时才下载媒体文件
6. THE Media_Upload_System SHALL 限制同时上传的文件数量不超过 3 个
7. THE Media_Upload_System SHALL 使用 Blob URL 显示本地文件，避免 base64 编码

### Requirement 16: UI/UX 设计

**User Story:** 作为用户，我希望媒体上传功能的界面美观且易用，符合应用的整体设计风格。

#### Acceptance Criteria

1. THE Media_Upload_System SHALL 使用赛博朋克暗黑风格设计所有 UI 组件
2. THE 文件预览 SHALL 使用毛玻璃效果和青色光带装饰
3. THE Progress_Indicator SHALL 使用动画效果显示进度
4. THE 图片查看器 SHALL 使用黑色半透明背景
5. THE 视频播放器 SHALL 使用自定义控制条，符合应用主题
6. THE 拖放提示覆盖层 SHALL 使用虚线边框和青色高亮
7. THE 媒体消息气泡 SHALL 与文本消息气泡保持一致的设计风格

## Technical Constraints

1. **前端框架**: 必须使用 Vue 3 + TypeScript + Pinia 实现
2. **架构模式**: 必须遵循 Feature-Sliced Design 架构
3. **加密库**: 必须使用现有的 `src/renderer/src/shared/lib/crypto.ts` 实现
4. **API 配置**: 必须使用 `src/renderer/src/shared/config/api.ts` 中配置的端点
5. **文件存储**: 使用 IndexedDB 存储缓存的文件
6. **Web Worker**: 加密和解密操作必须在 Web Worker 中执行
7. **文件上传**: 使用 XMLHttpRequest 或 Fetch API 实现，支持进度跟踪
8. **图片处理**: 使用 Canvas API 进行图片压缩和缩略图生成
9. **视频处理**: 使用 HTML5 Video API 实现播放功能
10. **浏览器兼容性**: 必须支持现代浏览器（Chrome, Firefox, Edge 最新版本）

## Non-Functional Requirements

1. **安全性**: 
   - 所有文件必须在客户端加密后再上传
   - 使用 AES-256-GCM 算法加密
   - 文件名也需要加密
   
2. **性能**: 
   - 图片上传延迟应小于 3 秒（5MB 图片，正常网络）
   - 视频上传延迟应小于 30 秒（50MB 视频，正常网络）
   - 图片查看器打开延迟应小于 500ms
   
3. **可靠性**: 
   - 上传失败时必须提供重试机制
   - 支持断点续传（可选，优先级低）
   
4. **可用性**: 
   - UI 必须提供清晰的进度反馈
   - 错误提示必须具体且易懂
   - 支持键盘快捷键操作
   
5. **可维护性**: 
   - 代码必须遵循 TypeScript 最佳实践
   - 组件必须高度可复用
   - 必须编写单元测试（覆盖率 >80%）

## API Requirements

### 后端需要提供的接口

#### 1. 文件上传接口

```
POST /api/media/upload
Content-Type: multipart/form-data

Request Body:
- file: 加密后的文件（二进制）
- metadata: JSON 字符串，包含：
  {
    "sessionId": "会话ID",
    "fileName": "加密后的文件名",
    "fileSize": 原始文件大小（字节）,
    "mimeType": "文件MIME类型",
    "messageType": "IMAGE" | "VIDEO"
  }

Response (200 OK):
{
  "fileId": "生成的文件ID",
  "uploadTime": "上传时间戳",
  "thumbnailUrl": "缩略图URL（可选）"
}

Error Responses:
- 400: 文件格式不支持
- 413: 文件过大
- 500: 服务器错误
```

#### 2. 文件下载接口

```
GET /api/media/{fileId}
Headers:
- Authorization: Bearer {token}

Response (200 OK):
- Content-Type: application/octet-stream
- Content-Disposition: attachment; filename="encrypted-file"
- Body: 加密的文件二进制数据

Response Headers:
- X-File-Name: 加密的文件名
- X-File-Size: 文件大小
- X-Mime-Type: 原始MIME类型

Error Responses:
- 404: 文件不存在
- 403: 无权限访问
- 500: 服务器错误
```

#### 3. 文件元数据接口（可选）

```
GET /api/media/{fileId}/metadata
Headers:
- Authorization: Bearer {token}

Response (200 OK):
{
  "fileId": "文件ID",
  "fileName": "加密的文件名",
  "fileSize": 文件大小,
  "mimeType": "MIME类型",
  "uploadTime": "上传时间",
  "uploaderId": "上传者ID"
}
```

## Implementation Priority

### Phase 1: 基础功能（高优先级）
1. 文件选择上传（图片）
2. 文件验证
3. 文件加密
4. 文件上传（带进度）
5. 发送图片消息
6. 接收并显示图片消息
7. 基础错误处理

### Phase 2: 增强功能（中优先级）
1. 视频文件上传
2. 拖放上传
3. 粘贴上传
4. 图片查看器
5. 视频播放器
6. 文件预览
7. 上传进度管理（取消、重试）

### Phase 3: 优化功能（低优先级）
1. 缓存管理
2. 图片压缩
3. 缩略图生成
4. 懒加载
5. 断点续传
6. 批量上传优化
7. 性能监控

## Success Metrics

1. **功能完整性**: 所有核心功能（Phase 1 + Phase 2）实现率 100%
2. **上传成功率**: >95%（正常网络条件下）
3. **用户满意度**: 通过用户测试，满意度 >4/5
4. **性能指标**: 
   - 图片上传平均时间 <3 秒
   - 视频上传平均时间 <30 秒
   - 图片查看器打开时间 <500ms
5. **错误率**: 客户端错误率 <1%
6. **代码质量**: 
   - TypeScript 类型覆盖率 100%
   - 单元测试覆盖率 >80%
   - ESLint 零警告
