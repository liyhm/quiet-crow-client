<template>
  <form class="w-full flex flex-col" style="gap: 12px;" @submit.prevent="handleSubmit" novalidate>
    <div class="relative group">
        <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-[#555555] group-focus-within:text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300" style="padding-left: 12px;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <input
          v-model="username"
          type="text"
          placeholder="你的代号"
          class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pr-5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[13px] tracking-widest"
          style="padding: 8px 20px 8px 42px;"
          @focus="showHistory = true"
          @blur="hideHistory"
        />
        <!-- 历史记录下拉框 -->
        <div
          v-if="showHistory && loginHistory.length > 0"
          class="absolute z-50 w-full mt-3 bg-[#0A0A0C]/85 backdrop-blur-2xl border border-[#00E5FF]/20 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_15px_rgba(0,229,255,0.15)] overflow-hidden transform transition-all duration-300"
        >
          <div
            v-for="(historyItem, index) in loginHistory"
            :key="index"
            class="group/item px-4 py-3.5 hover:bg-[#00E5FF]/10 cursor-pointer flex items-center justify-between border-b border-white/5 last:border-0 transition-all duration-300"
            @mousedown.prevent="selectHistory(historyItem)"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-4 h-4 text-[#444444] group-hover/item:text-[#00E5FF] transition-colors duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span
                class="text-[14px] text-[#85858A] group-hover/item:text-[#E0E0E0] transition-colors duration-300 tracking-widest font-mono"
              >
                {{ historyItem }}
              </span>
            </div>
            <button
              type="button"
              class="opacity-0 group-hover/item:opacity-100 text-[#FF3366] hover:bg-[#FF3366]/15 px-3 py-1.5 rounded-md text-xs tracking-widest transition-all duration-300 border border-transparent hover:border-[#FF3366]/30 shadow-none hover:shadow-[0_0_10px_rgba(255,51,102,0.2)]"
              @click.stop="removeHistory(historyItem)"
            >
              抹除
            </button>
          </div>
        </div>
      </div>

      <div class="relative group">
        <div class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-[#555555] group-focus-within:text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300" style="padding-left: 12px;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <input
          v-model="password"
          type="password"
          placeholder="暗语 / 密钥"
          class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pr-5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[13px] tracking-widest"
          style="padding: 8px 20px 8px 42px;"
        />
      </div>

    <button
      type="submit"
      class="w-full rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/80 text-[#00E5FF] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style="margin-top: 6px; padding: 3px 0;"
      :disabled="loading"
    >
      {{ loading ? '验证中...' : '接入鸦群' }}
    </button>

    <div v-if="errorMessage" class="text-[#FF3366] text-xs text-center mt-4 bg-[#FF3366]/10 py-2 rounded border border-[#FF3366]/20">
      {{ errorMessage }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

// 登录历史记录
const LOGIN_HISTORY_KEY = 'login_history'
const MAX_HISTORY = 5
const loginHistory = ref<string[]>([])
const showHistory = ref(false)

// 加载登录历史
onMounted(() => {
  const saved = localStorage.getItem(LOGIN_HISTORY_KEY)
  if (saved) {
    try {
      loginHistory.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载登录历史失败:', e)
      loginHistory.value = []
    }
  }
})

// 选择历史记录
const selectHistory = (historyItem: string) => {
  username.value = historyItem
  showHistory.value = false
}

// 删除历史记录
const removeHistory = (historyItem: string) => {
  loginHistory.value = loginHistory.value.filter(item => item !== historyItem)
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(loginHistory.value))
}

// 延迟隐藏历史记录
const hideHistory = () => {
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}

// 保存登录历史
const saveLoginHistory = (username: string) => {
  loginHistory.value = loginHistory.value.filter(item => item !== username)
  loginHistory.value.unshift(username)
  if (loginHistory.value.length > MAX_HISTORY) {
    loginHistory.value = loginHistory.value.slice(0, MAX_HISTORY)
  }
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(loginHistory.value))
}

// 定义 emit
const emit = defineEmits<{
  submit: [{ username: string; password: string; saveHistory: (username: string) => void }]
}>()

const handleSubmit = () => {
  // 自定义验证
  if (!username.value.trim()) {
    errorMessage.value = '请输入你的代号'
    return
  }
  
  if (!password.value) {
    errorMessage.value = '请输入暗语'
    return
  }
  
  errorMessage.value = ''
  loading.value = true
  
  emit('submit', {
    username: username.value,
    password: password.value,
    saveHistory: saveLoginHistory
  })
}

// 暴露方法供父组件调用
defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value
  },
  setError: (message: string) => {
    errorMessage.value = message
  }
})
</script>
