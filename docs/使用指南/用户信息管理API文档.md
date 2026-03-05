# 用户信息管理 API - 前端开发文档

## 📋 目录

- [1. 更新用户信息](#1-更新用户信息)
- [2. 上传用户头像](#2-上传用户头像)
- [3. 获取用户信息](#3-获取用户信息)
- [4. 完整示例](#4-完整示例)

---

## 1. 更新用户信息

### 接口信息

- **接口路径**: `PUT /api/user/me`
- **接口描述**: 更新当前用户的个人信息（昵称、手机号、头像URL等）
- **认证要求**: ✅ 需要 JWT Token
- **请求方式**: `application/json`

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| displayName | String | 否 | 用户昵称/显示名称 |
| phone | String | 否 | 手机号码 |
| avatar | String | 否 | 头像URL（通常通过头像上传接口获取） |

> 注意：所有字段都是可选的，只需要传递需要更新的字段

### 请求示例

#### cURL

```bash
curl -X PUT http://localhost:8080/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "张三",
    "phone": "13800138000"
  }'
```

#### JavaScript (Fetch)

```javascript
const updateUserInfo = async (updates) => {
  const response = await fetch('http://localhost:8080/api/user/me', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  const result = await response.json();
  return result;
};

// 使用示例
updateUserInfo({
  displayName: '张三',
  phone: '13800138000'
}).then(data => {
  console.log('更新成功:', data);
});
```

#### Axios

```javascript
const updateUserInfo = (updates) => {
  return axios.put('/api/user/me', updates, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

// 使用示例
updateUserInfo({
  displayName: '张三',
  phone: '13800138000'
}).then(response => {
  console.log('用户信息:', response.data.data);
});
```

#### React Hook 示例

```javascript
import { useState } from 'react';
import axios from 'axios';

const useUpdateUserInfo = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateUserInfo = async (updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put('/api/user/me', updates, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setLoading(false);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { updateUserInfo, loading, error };
};

// 组件中使用
function UserProfile() {
  const { updateUserInfo, loading } = useUpdateUserInfo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await updateUserInfo({
      displayName: '新昵称',
      phone: '13800138000'
    });
    console.log('更新后的用户:', user);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 响应示例

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user-uuid-123",
    "username": "zhangsan",
    "showName": "张三",
    "phone": "13800138000",
    "avatar": "http://minio-server:9000/chat-files/avatars/user123.jpg",
    "createdTime": "2024-01-01T10:00:00",
    "updatedTime": "2024-01-15T15:30:00"
  }
}
```

#### 错误响应

```json
{
  "code": 500,
  "message": "用户不存在",
  "data": null
}
```

---

## 2. 上传用户头像

### 接口信息

- **接口路径**: `POST /api/user/avatar`
- **接口描述**: 上传图片文件并自动更新用户头像
- **认证要求**: ✅ 需要 JWT Token
- **请求方式**: `multipart/form-data`

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | File | 是 | 头像图片文件 |

### 文件限制

- **支持格式**: jpg, jpeg, png, gif
- **文件大小**: 最大 5MB
- **建议尺寸**: 500x500 像素

### 请求示例

#### HTML 表单

```html
<form id="avatarForm">
  <input type="file" id="avatarInput" accept="image/*" />
  <button type="submit">上传头像</button>
</form>

<script>
document.getElementById('avatarForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fileInput = document.getElementById('avatarInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('请选择图片');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8080/api/user/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const result = await response.json();
    
    if (result.code === 200) {
      console.log('头像URL:', result.data.avatarUrl);
      alert('上传成功！');
    } else {
      alert('上传失败: ' + result.message);
    }
  } catch (error) {
    console.error('上传错误:', error);
    alert('上传失败');
  }
});
</script>
```

#### React 组件示例

```javascript
import React, { useState } from 'react';
import axios from 'axios';

function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);

    try {
      const response = await axios.post('/api/user/avatar', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 200) {
        setAvatarUrl(response.data.data.avatarUrl);
        alert('头像上传成功！');
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>上传中...</p>}
      {avatarUrl && (
        <img src={avatarUrl} alt="头像" style={{ width: 100, height: 100 }} />
      )}
    </div>
  );
}

export default AvatarUpload;
```

#### Vue 3 组件示例

```vue
<template>
  <div class="avatar-upload">
    <input
      type="file"
      ref="fileInput"
      accept="image/*"
      @change="handleFileChange"
      :disabled="uploading"
    />
    <button @click="$refs.fileInput.click()" :disabled="uploading">
      {{ uploading ? '上传中...' : '选择头像' }}
    </button>
    <img v-if="avatarUrl" :src="avatarUrl" alt="头像" class="avatar-preview" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const uploading = ref(false);
const avatarUrl = ref('');
const fileInput = ref(null);

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件');
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  uploading.value = true;

  try {
    const response = await axios.post('/api/user/avatar', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.code === 200) {
      avatarUrl.value = response.data.data.avatarUrl;
      alert('头像上传成功！');
    }
  } catch (error) {
    console.error('上传失败:', error);
    alert('上传失败');
  } finally {
    uploading.value = false;
  }
};
</script>

<style scoped>
.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-top: 10px;
}
</style>
```

### 响应示例

#### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "avatarUrl": "http://minio-server:9000/chat-files/avatars/user123_1234567890.jpg",
    "fileId": "file-uuid-123456"
  }
}
```

#### 错误响应

**文件类型错误**

```json
{
  "code": 500,
  "message": "只支持图片格式（jpg/png/gif）",
  "data": null
}
```

**文件过大**

```json
{
  "code": 500,
  "message": "头像文件不能超过5MB",
  "data": null
}
```

---

## 3. 获取用户信息

### 接口信息

- **接口路径**: `GET /api/user/info`
- **接口描述**: 获取当前登录用户的完整信息
- **认证要求**: ✅ 需要 JWT Token

### 请求示例

```javascript
const getUserInfo = async () => {
  const response = await fetch('http://localhost:8080/api/user/info', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
};
```

### 响应示例

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "user-uuid-123",
    "username": "zhangsan",
    "showName": "张三",
    "phone": "13800138000",
    "avatar": "http://minio-server:9000/chat-files/avatars/user123.jpg",
    "createdTime": "2024-01-01T10:00:00",
    "updatedTime": "2024-01-15T15:30:00"
  }
}
```

---

## 4. 完整示例

### 用户资料编辑页面（React）

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: ''
  });

  // 获取用户信息
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/api/user/info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const userData = response.data.data;
      setUser(userData);
      setFormData({
        displayName: userData.showName || '',
        phone: userData.phone || ''
      });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  // 上传头像
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await axios.post('/api/user/avatar', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.code === 200) {
        alert('头像上传成功！');
        fetchUserInfo(); // 刷新用户信息
      }
    } catch (error) {
      alert('上传失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 更新用户信息
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put('/api/user/me', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.code === 200) {
        alert('信息更新成功！');
        setUser(response.data.data);
      }
    } catch (error) {
      alert('更新失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) return <div>加载中...</div>;

  return (
    <div className="user-profile">
      <h2>个人资料</h2>

      {/* 头像上传 */}
      <div className="avatar-section">
        <img
          src={user.avatar || '/default-avatar.png'}
          alt="头像"
          className="avatar"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          disabled={loading}
          id="avatar-input"
          style={{ display: 'none' }}
        />
        <label htmlFor="avatar-input" className="upload-btn">
          {loading ? '上传中...' : '更换头像'}
        </label>
      </div>

      {/* 信息编辑表单 */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>用户名（不可修改）</label>
          <input type="text" value={user.username} disabled />
        </div>

        <div className="form-group">
          <label>昵称</label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="请输入昵称"
          />
        </div>

        <div className="form-group">
          <label>手机号</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="请输入手机号"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '保存中...' : '保存修改'}
        </button>
      </form>
    </div>
  );
}

export default UserProfilePage;
```

### 样式参考（CSS）

```css
.user-profile {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 3px solid #eee;
}

.upload-btn {
  display: inline-block;
  padding: 8px 20px;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #0056b3;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover {
  background: #218838;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

---

## 📝 使用流程

### 典型的用户资料编辑流程

1. **页面加载** → 调用 `GET /api/user/info` 获取当前用户信息
2. **显示信息** → 在表单中显示用户名、昵称、手机号、头像
3. **更换头像** → 用户选择图片 → 调用 `POST /api/user/avatar` → 自动更新头像
4. **编辑信息** → 用户修改昵称/手机号 → 调用 `PUT /api/user/me` → 更新信息
5. **刷新显示** → 重新获取用户信息显示最新数据

---

## ⚠️ 注意事项

### 1. 头像上传优化建议

```javascript
// 图片压缩（使用 browser-image-compression）
import imageCompression from 'browser-image-compression';

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 500,
    useWebWorker: true
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('压缩失败:', error);
    return file;
  }
};

// 使用
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  const compressedFile = await compressImage(file);
  // 上传 compressedFile
};
```

### 2. 错误处理

```javascript
const handleError = (error) => {
  if (error.response) {
    // 服务器返回错误
    const { code, message } = error.response.data;
    if (code === 401) {
      // Token 过期，跳转登录
      window.location.href = '/login';
    } else {
      alert(message || '操作失败');
    }
  } else if (error.request) {
    // 网络错误
    alert('网络连接失败，请检查网络');
  } else {
    alert('操作失败: ' + error.message);
  }
};
```

### 3. 图片预览

```javascript
const previewImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
};

// 使用
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  const preview = await previewImage(file);
  setPreviewUrl(preview); // 显示预览
  // 然后上传
};
```

### 4. 进度显示

```javascript
const uploadWithProgress = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post('/api/user/avatar', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percentCompleted);
    }
  });
};
```

---

## 🔗 相关接口

- `POST /api/auth/login` - 用户登录（获取Token）
- `GET /api/user/info` - 获取当前用户信息
- `GET /api/user/{id}` - 获取指定用户信息
- `DELETE /api/media/{fileId}` - 删除文件

---

## 📞 技术支持

如有问题，请查看：

- Swagger 文档: http://localhost:8080/swagger-ui.html
- 后端开发文档: `docs/backend/后端API文档.md`
- API 完整文档: `docs/API集成指南.md`

---

**文档版本**: v1.0  
**最后更新**: 2024-02-27  
**维护者**: 后端开发团队
