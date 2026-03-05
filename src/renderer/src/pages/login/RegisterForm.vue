<template>
  <form class="w-full flex flex-col" style="gap: 12px;" @submit.prevent="handleSubmit" novalidate>
    <!-- 隐藏的文件上传输入框 -->
    <input
      ref="avatarInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleAvatarChange"
    />

    <div class="relative group">
        <div
          class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-[#555555] group-focus-within:text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300"
          style="padding-left: 12px;"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
        </div>
        <input
          v-model="username"
          type="text"
          placeholder="你的代号"
          class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pr-5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[13px] tracking-widest"
          style="padding: 8px 20px 8px 42px;"
        />
      </div>

      <div class="relative group">
        <div
          class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-[#555555] group-focus-within:text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300"
          style="padding-left: 12px;"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <input
          v-model="nickname"
          type="text"
          placeholder="你想叫什么？"
          class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pr-5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[13px] tracking-widest"
          style="padding: 8px 20px 8px 42px;"
        />
      </div>

      <div class="relative group">
        <div
          class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-[#555555] group-focus-within:text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300"
          style="padding-left: 12px;"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
        </div>
        <input
          v-model="password"
          type="password"
          placeholder="暗语 / 密钥（至少6位）"
          class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pr-5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[13px] tracking-widest"
          style="padding: 8px 20px 8px 42px;"
        />
      </div>

      <div class="relative group">
        <div
          class="absolute inset-y-0 left-0 flex items-center pointer-events-none text-[#555555] group-focus-within:text-neon-cyan group-focus-within:drop-shadow-[0_0_8px_rgba(0,229,255,0.8)] transition-all duration-300"
          style="padding-left: 12px;"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            ></path>
          </svg>
        </div>
        <input
          v-model="confirmPassword"
          type="password"
          placeholder="再说一遍暗语"
          class="w-full bg-black/40 border border-white/5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] text-[#E0E0E0] pr-5 rounded-xl focus:outline-none focus:border-[#00E5FF]/50 focus:bg-black/80 focus:shadow-[inset_0_1px_4px_rgba(0,229,255,0.1),0_0_12px_rgba(0,229,255,0.15)] transition-all duration-300 placeholder-[#555555] text-[13px] tracking-widest"
          style="padding: 8px 20px 8px 42px;"
          required
        />
      </div>

    <button
      type="submit"
      class="w-full rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/80 text-[#00E5FF] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,229,255,0.2)] hover:bg-[#00E5FF]/20 hover:shadow-[0_0_35px_rgba(0,229,255,0.5)] hover:-translate-y-0.5 transition-all duration-300 uppercase disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      style="margin-top: 6px; padding: 3px 0;"
      :disabled="loading"
    >
      {{ loading ? '创建中...' : '获取身份' }}
    </button>

    <div
      v-if="errorMessage"
      class="text-[#FF3366] text-xs text-center mt-4 bg-[#FF3366]/10 py-2 rounded border border-[#FF3366]/20"
    >
      {{ errorMessage }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const nickname = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')
// 未使用的变量，注释掉
// const uploadingAvatar = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)

// 定义 emit
const emit = defineEmits<{
  submit: [{ 
    username: string
    nickname: string
    password: string
    confirmPassword: string
    avatarFile: File | null
  }]
}>()

const triggerUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择图片文件'
    return
  }

  // 验证文件大小（最大 5MB）
  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = '图片大小不能超过 5MB'
    return
  }

  avatarFile.value = file
  errorMessage.value = ''

  // 生成预览
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleSubmit = () => {
  // 自定义验证
  if (!username.value.trim()) {
    errorMessage.value = '请输入你的代号'
    return
  }
  
  if (!nickname.value.trim()) {
    errorMessage.value = '请输入你的昵称'
    return
  }
  
  if (!password.value) {
    errorMessage.value = '请输入暗语'
    return
  }
  
  if (password.value.length < 6) {
    errorMessage.value = '暗语至少需要6位'
    return
  }
  
  if (!confirmPassword.value) {
    errorMessage.value = '请再次输入暗语'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    errorMessage.value = '两次输入的暗语不一致'
    return
  }
  
  errorMessage.value = ''
  loading.value = true

  emit('submit', {
    username: username.value,
    nickname: nickname.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    avatarFile: avatarFile.value
  })
}

// 暴露方法供父组件调用
defineExpose({
  setLoading: (value: boolean) => {
    loading.value = value
  },
  setError: (message: string) => {
    errorMessage.value = message
  },
  triggerUpload,
  avatarPreview
})
</script>
