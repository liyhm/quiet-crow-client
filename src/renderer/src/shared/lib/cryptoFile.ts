// File encryption utilities using AES-GCM

export class FileCryptoService {
  /**
   * 加密文件
   * @param file 原始文件
   * @param aesKey AES 密钥
   * @returns 加密后的文件数据（包含 IV）
   */
  static async encryptFile(file: File, aesKey: CryptoKey): Promise<ArrayBuffer> {
    try {
      // 读取文件内容
      const fileData = await file.arrayBuffer()

      // 生成随机 IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      // 加密文件数据
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        aesKey,
        fileData
      )

      // 合并 IV 和加密数据
      const result = new Uint8Array(iv.length + encrypted.byteLength)
      result.set(iv, 0)
      result.set(new Uint8Array(encrypted), iv.length)

      return result.buffer
    } catch (error) {
      console.error('❌ 文件加密失败:', error)
      throw new Error('文件加密失败')
    }
  }

  /**
   * 加密文件（从 ArrayBuffer）
   * @param fileBuffer 文件内容
   * @param aesKey AES 密钥
   * @returns 加密后的文件数据（包含 IV）
   */
  static async encryptFileBuffer(fileBuffer: ArrayBuffer, aesKey: CryptoKey): Promise<ArrayBuffer> {
    try {
      // 生成随机 IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12))

      // 加密文件数据
      const encrypted = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        aesKey,
        fileBuffer
      )

      // 合并 IV 和加密数据
      const result = new Uint8Array(iv.length + encrypted.byteLength)
      result.set(iv, 0)
      result.set(new Uint8Array(encrypted), iv.length)

      return result.buffer
    } catch (error) {
      console.error('❌ 文件加密失败:', error)
      throw new Error('文件加密失败')
    }
  }

  /**
   * 解密文件
   * @param encryptedBuffer 加密的文件数据（包含 IV）
   * @param aesKey AES 密钥
   * @returns 解密后的文件数据
   */
  static async decryptFile(encryptedBuffer: ArrayBuffer, aesKey: CryptoKey): Promise<ArrayBuffer> {
    try {
      // 提取 IV 和加密数据
      const data = new Uint8Array(encryptedBuffer)
      const iv = data.slice(0, 12)
      const encrypted = data.slice(12)

      // 解密
      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128
        },
        aesKey,
        encrypted
      )

      return decrypted
    } catch (error) {
      console.error('❌ 文件解密失败:', error)
      throw new Error('文件解密失败')
    }
  }

  /**
   * 加密文本
   * @param text 原始文本
   * @param aesKey AES 密钥
   * @returns Base64 编码的加密文本
   */
  static async encryptText(text: string, aesKey: CryptoKey): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)
      const encrypted = await this.encryptFileBuffer(data.buffer, aesKey)
      return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    } catch (error) {
      console.error('❌ 文本加密失败:', error)
      throw new Error('文本加密失败')
    }
  }

  /**
   * 解密文本
   * @param encryptedText Base64 编码的加密文本
   * @param aesKey AES 密钥
   * @returns 原始文本
   */
  static async decryptText(encryptedText: string, aesKey: CryptoKey): Promise<string> {
    try {
      const data = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0))
      const decrypted = await this.decryptFile(data.buffer, aesKey)
      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('❌ 文本解密失败:', error)
      throw new Error('文本解密失败')
    }
  }

  /**
   * 生成图片缩略图
   * @param file 图片文件
   * @param maxWidth 最大宽度
   * @param maxHeight 最大高度
   * @returns 缩略图 Blob
   */
  static async generateThumbnail(
    file: File,
    maxWidth: number = 200,
    maxHeight: number = 200
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      img.onload = () => {
        // 计算缩放比例
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // 绘制缩略图
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('生成缩略图失败'))
            }
          },
          'image/jpeg',
          0.8
        )
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 压缩图片
   * @param file 图片文件
   * @param maxWidth 最大宽度
   * @param quality 质量 (0-1)
   * @returns 压缩后的 Blob
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'))
        return
      }

      img.onload = () => {
        let width = img.width
        let height = img.height

        // 如果图片宽度超过最大宽度，进行缩放
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * 验证文件类型
   * @param file 文件
   * @param allowedTypes 允许的 MIME 类型列表
   * @returns 是否有效
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2)
        return file.type.startsWith(prefix)
      }
      return file.type === type
    })
  }

  /**
   * 验证文件大小
   * @param file 文件
   * @param maxSize 最大大小（字节）
   * @returns 是否有效
   */
  static validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize
  }

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化的字符串
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
