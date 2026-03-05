import { app, shell, BrowserWindow, ipcMain, safeStorage, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

let mainWindow: BrowserWindow | null = null

// 配置自动更新
function setupAutoUpdater(): void {
  // 设置更新服务器地址
  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'http://159.75.182.85/updates/',
    channel: 'quiet'  // 明确指定 channel，会查找 quiet-latest.yml 和 quiet-latest-mac.yml
  })

  // 禁用自动下载，改为手动控制
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  
  // 设置请求超时（10秒）
  // @ts-ignore
  autoUpdater.requestHeaders = {
    'Cache-Control': 'no-cache'
  }

  // 检查更新
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 正在检查更新...')
    console.log('📡 更新服务器:', 'http://159.75.182.85/updates/')
    sendUpdateMessage('checking-for-update')
  })

  // 发现新版本
  autoUpdater.on('update-available', (info) => {
    console.log('✅ 发现新版本:', info.version)
    sendUpdateMessage('update-available', info)
  })

  // 没有新版本
  autoUpdater.on('update-not-available', (info) => {
    console.log('ℹ️ 当前已是最新版本:', info.version)
    sendUpdateMessage('update-not-available', info)
  })

  // 下载进度
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`📥 下载进度: ${progressObj.percent.toFixed(2)}%`)
    sendUpdateMessage('download-progress', progressObj)
  })

  // 下载完成
  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ 更新下载完成:', info.version)
    sendUpdateMessage('update-downloaded', info)
  })

  // 更新错误
  autoUpdater.on('error', (error) => {
    console.error('❌ 更新错误:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
    sendUpdateMessage('update-error', { message: error.message })
  })
}

// 发送更新消息到渲染进程
function sendUpdateMessage(event: string, data?: any): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-message', { event, data })
  }
}

function createWindow(): void {
  // Create the browser window with frameless design
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 680,
    minWidth: 800,
    minHeight: 550,
    show: false,
    frame: false, // Frameless window
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    backgroundColor: '#F5F5F5',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    // Open DevTools in development
    if (is.dev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  // 设置 CSP 允许连接到后端 API
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
          "connect-src 'self' http://localhost:* http://127.0.0.1:* http://159.75.182.85:* ws://localhost:* ws://127.0.0.1:* ws://159.75.182.85:* wss://localhost:* wss://127.0.0.1:* wss://159.75.182.85:*; " +
          "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:* http://159.75.182.85:*; " +
          "media-src 'self' blob:;"
        ]
      }
    })
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully')
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 添加全局快捷键打开开发者工具（生产环境也可用）
  const { globalShortcut } = require('electron')
  
  // F12 - 打开/关闭开发者工具
  globalShortcut.register('F12', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      if (focusedWindow.webContents.isDevToolsOpened()) {
        focusedWindow.webContents.closeDevTools()
      } else {
        focusedWindow.webContents.openDevTools()
      }
    }
  })

  // Ctrl+Shift+I - 打开/关闭开发者工具（备用快捷键）
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      if (focusedWindow.webContents.isDevToolsOpened()) {
        focusedWindow.webContents.closeDevTools()
      } else {
        focusedWindow.webContents.openDevTools()
      }
    }
  })

  // Ctrl+Shift+C - 打开开发者工具并激活元素选择器
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      focusedWindow.webContents.openDevTools({ mode: 'detach' })
    }
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // 开发者工具控制
  ipcMain.handle('devtools:toggle', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    if (focusedWindow) {
      if (focusedWindow.webContents.isDevToolsOpened()) {
        focusedWindow.webContents.closeDevTools()
      } else {
        focusedWindow.webContents.openDevTools()
      }
    }
  })

  // Window control IPC handlers
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
    return mainWindow?.isMaximized()
  })

  ipcMain.handle('window:close', () => {
    console.log('🚪 收到关闭窗口请求')
    
    // 立即关闭窗口，不等待清理
    if (mainWindow) {
      mainWindow.destroy() // 使用 destroy() 而不是 close()，强制立即关闭
      mainWindow = null
    }
    
    // 在后台清理资源（不阻塞关闭）
    setTimeout(() => {
      console.log('🧹 后台清理资源...')
    }, 0)
  })

  ipcMain.handle('window:isMaximized', () => {
    return mainWindow?.isMaximized()
  })

  // Safe storage IPC handlers for RSA private key
  ipcMain.handle('secure-save', async (_event, key: string, value: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Encryption not available')
      }

      const encrypted = safeStorage.encryptString(value)
      const keyPath = join(app.getPath('userData'), `.${key}.enc`)
      fs.writeFileSync(keyPath, encrypted)
      return { success: true }
    } catch (error) {
      console.error('Secure save error:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('secure-read', async (_event, key: string) => {
    try {
      const keyPath = join(app.getPath('userData'), `.${key}.enc`)

      if (!fs.existsSync(keyPath)) {
        return { success: false, error: 'Key not found' }
      }

      const encrypted = fs.readFileSync(keyPath)
      const decrypted = safeStorage.decryptString(encrypted)
      return { success: true, value: decrypted }
    } catch (error) {
      console.error('Secure read error:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('secure-delete', async (_event, key: string) => {
    try {
      const keyPath = join(app.getPath('userData'), `.${key}.enc`)
      if (fs.existsSync(keyPath)) {
        fs.unlinkSync(keyPath)
      }
      return { success: true }
    } catch (error) {
      console.error('Secure delete error:', error)
      return { success: false, error: String(error) }
    }
  })

  // System notification
  ipcMain.handle('show-notification', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  // 自动更新 IPC 处理
  ipcMain.handle('updater:check', async () => {
    try {
      console.log('🔍 手动检查更新...')
      console.log('📡 更新服务器:', 'http://159.75.182.85/updates/')
      console.log('📦 当前版本:', app.getVersion())
      
      // 添加超时处理
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('检查更新超时（30秒）')), 30000)
      })
      
      const checkPromise = autoUpdater.checkForUpdates()
      
      const result = await Promise.race([checkPromise, timeoutPromise]) as any
      
      console.log('✅ 检查更新完成:', result)
      return { success: true, updateInfo: result?.updateInfo }
    } catch (error) {
      console.error('❌ 检查更新失败:', error)
      console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('错误消息:', error instanceof Error ? error.message : String(error))
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  ipcMain.handle('updater:download', async () => {
    try {
      console.log('📥 开始下载更新...')
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      console.error('❌ 下载更新失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('updater:install', () => {
    console.log('🚀 安装更新并重启...')
    autoUpdater.quitAndInstall(false, true)
  })

  ipcMain.handle('updater:get-version', () => {
    return app.getVersion()
  })

  // 初始化自动更新
  setupAutoUpdater()

  // 应用启动 5 秒后自动检查更新（不打扰用户）
  setTimeout(() => {
    if (!is.dev) {
      console.log('🔍 自动检查更新...')
      autoUpdater.checkForUpdates().catch(err => {
        console.error('❌ 自动检查更新失败:', err)
      })
    }
  }, 5000)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // 注销所有全局快捷键
  const { globalShortcut } = require('electron')
  globalShortcut.unregisterAll()
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
