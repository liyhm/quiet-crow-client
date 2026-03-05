// Web Crypto API utilities for RSA and AES encryption

export class CryptoService {
  // Generate RSA-OAEP 2048-bit key pair
  static async generateRSAKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  // Export public key to base64 string
  static async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('spki', publicKey)
    return btoa(String.fromCharCode(...new Uint8Array(exported)))
  }

  // Import public key from base64 string
  static async importPublicKey(base64Key: string): Promise<CryptoKey> {
    const binaryString = atob(base64Key)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return await window.crypto.subtle.importKey(
      'spki',
      bytes,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['encrypt']
    )
  }

  // Export private key to base64 string (for secure storage)
  static async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('pkcs8', privateKey)
    return btoa(String.fromCharCode(...new Uint8Array(exported)))
  }

  // Import private key from base64 string
  static async importPrivateKey(base64Key: string): Promise<CryptoKey> {
    const binaryString = atob(base64Key)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return await window.crypto.subtle.importKey(
      'pkcs8',
      bytes,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
      },
      true,
      ['decrypt']
    )
  }

  // Generate AES-GCM 256-bit key
  static async generateAESKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  // Export AES key to base64
  static async exportAESKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key)
    return btoa(String.fromCharCode(...new Uint8Array(exported)))
  }

  // Import AES key from base64
  static async importAESKey(base64Key: string): Promise<CryptoKey> {
    const binaryString = atob(base64Key)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return await window.crypto.subtle.importKey('raw', bytes, 'AES-GCM', true, [
      'encrypt',
      'decrypt'
    ])
  }

  // Encrypt AES key with RSA public key
  static async encryptAESKeyWithRSA(aesKey: CryptoKey, rsaPublicKey: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', aesKey)
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      rsaPublicKey,
      exported
    )
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  }

  // Decrypt AES key with RSA private key
  static async decryptAESKeyWithRSA(
    encryptedKey: string,
    rsaPrivateKey: CryptoKey
  ): Promise<CryptoKey> {
    const binaryString = atob(encryptedKey)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      rsaPrivateKey,
      bytes
    )

    return await window.crypto.subtle.importKey('raw', decrypted, 'AES-GCM', true, [
      'encrypt',
      'decrypt'
    ])
  }

  // Encrypt message with AES-GCM
  static async encryptMessage(
    plaintext: string,
    aesKey: CryptoKey
  ): Promise<{ ciphertext: string; iv: string; authTag: string }> {
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    // Generate random 12-byte IV
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      aesKey,
      data
    )

    const encryptedArray = new Uint8Array(encrypted)
    const ciphertext = encryptedArray.slice(0, -16)
    const authTag = encryptedArray.slice(-16)

    return {
      ciphertext: btoa(String.fromCharCode(...ciphertext)),
      iv: btoa(String.fromCharCode(...iv)),
      authTag: btoa(String.fromCharCode(...authTag))
    }
  }

  // Decrypt message with AES-GCM
  static async decryptMessage(
    ciphertext: string,
    iv: string,
    authTag: string,
    aesKey: CryptoKey
  ): Promise<string> {
    try {
      const ciphertextBinary = atob(ciphertext)
      const ivBinary = atob(iv)
      const authTagBinary = atob(authTag)

      const ciphertextBytes = new Uint8Array(ciphertextBinary.length)
      for (let i = 0; i < ciphertextBinary.length; i++) {
        ciphertextBytes[i] = ciphertextBinary.charCodeAt(i)
      }

      const ivBytes = new Uint8Array(ivBinary.length)
      for (let i = 0; i < ivBinary.length; i++) {
        ivBytes[i] = ivBinary.charCodeAt(i)
      }

      const authTagBytes = new Uint8Array(authTagBinary.length)
      for (let i = 0; i < authTagBinary.length; i++) {
        authTagBytes[i] = authTagBinary.charCodeAt(i)
      }

      // Combine ciphertext and auth tag
      const combined = new Uint8Array(ciphertextBytes.length + authTagBytes.length)
      combined.set(ciphertextBytes)
      combined.set(authTagBytes, ciphertextBytes.length)

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBytes,
          tagLength: 128
        },
        aesKey,
        combined
      )

      const decoder = new TextDecoder()
      return decoder.decode(decrypted)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt message')
    }
  }

  // Save private key to OS-level secure storage
  static async savePrivateKeySecurely(privateKey: CryptoKey): Promise<boolean> {
    try {
      if (!window.api || !window.api.secureStorage) {
        console.warn('⚠️ Secure storage API not available')
        return false
      }
      const exported = await this.exportPrivateKey(privateKey)
      const result = await window.api.secureStorage.save('rsa-private-key', exported)
      return result.success
    } catch (error) {
      console.error('Failed to save private key:', error)
      return false
    }
  }

  // Load private key from OS-level secure storage
  static async loadPrivateKeySecurely(): Promise<CryptoKey | null> {
    try {
      if (!window.api || !window.api.secureStorage) {
        console.warn('⚠️ Secure storage API not available')
        return null
      }
      const result = await window.api.secureStorage.read('rsa-private-key')
      if (result.success && result.value) {
        return await this.importPrivateKey(result.value)
      }
      return null
    } catch (error) {
      console.error('Failed to load private key:', error)
      return null
    }
  }
}
