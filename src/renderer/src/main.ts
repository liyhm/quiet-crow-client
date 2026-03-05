import { createApp } from 'vue'
import App from './App.vue'
import router from './app/router'
import { pinia } from './app/providers/pinia'
import './app/styles/global.css'
import { useCryptoStore } from './entities/crypto/model/useCryptoStore'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')

// Initialize crypto and WebSocket after app is mounted
const initializeApp = async () => {
  const cryptoStore = useCryptoStore()

  // Initialize crypto store
  await cryptoStore.initialize()

  // WebSocket connection disabled in demo mode
  // Uncomment below when backend is ready:
  /*
  if (authStore.isAuthenticated) {
    websocketService.initialize()
    websocketService.connect()
  }
  */

  console.log('App initialized in demo mode (WebSocket disabled)')
}

initializeApp().catch(console.error)
