import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ConnectionStatus } from '@/shared/types'

export const useNetworkStore = defineStore('network', () => {
  const connectionStatus = ref<ConnectionStatus>(ConnectionStatus.DISCONNECTED)
  const latency = ref<number>(0)
  const reconnectAttempts = ref<number>(0)
  const lastHeartbeat = ref<number>(Date.now())

  const isConnected = computed(() => connectionStatus.value === ConnectionStatus.CONNECTED)
  const isReconnecting = computed(() => connectionStatus.value === ConnectionStatus.RECONNECTING)

  const reconnectDelay = computed(() => {
    // Exponential backoff: min(1000 * 2^attempts, 30000)
    return Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
  })

  const connectionQuality = computed(() => {
    if (!isConnected.value) return 'offline'
    if (latency.value > 1000) return 'poor'
    if (latency.value > 500) return 'fair'
    return 'good'
  })

  const setStatus = (status: ConnectionStatus) => {
    connectionStatus.value = status
  }

  const updateLatency = (value: number) => {
    latency.value = value
    lastHeartbeat.value = Date.now()
  }

  const incrementReconnectAttempts = () => {
    reconnectAttempts.value++
  }

  const resetReconnectAttempts = () => {
    reconnectAttempts.value = 0
  }

  return {
    connectionStatus,
    latency,
    reconnectAttempts,
    lastHeartbeat,
    isConnected,
    isReconnecting,
    reconnectDelay,
    connectionQuality,
    setStatus,
    updateLatency,
    incrementReconnectAttempts,
    resetReconnectAttempts
  }
})
