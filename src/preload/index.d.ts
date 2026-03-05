import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      window: {
        minimize: () => Promise<void>
        maximize: () => Promise<boolean>
        close: () => Promise<void>
        isMaximized: () => Promise<boolean>
      }
      secureStorage: {
        save: (key: string, value: string) => Promise<{ success: boolean; error?: string }>
        read: (key: string) => Promise<{ success: boolean; value?: string; error?: string }>
        delete: (key: string) => Promise<{ success: boolean; error?: string }>
      }
      notification: {
        show: (title: string, body: string) => Promise<void>
      }
      devtools: {
        toggle: () => Promise<void>
      }
      updater: {
        check: () => Promise<{ success: boolean; updateInfo?: any; error?: string }>
        download: () => Promise<{ success: boolean; error?: string }>
        install: () => Promise<void>
        getVersion: () => Promise<string>
        onUpdateMessage: (callback: (message: { event: string; data?: any }) => void) => void
      }
    }
  }
}
