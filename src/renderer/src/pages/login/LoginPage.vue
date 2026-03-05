<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1E1E28] via-[#0A0A0F] to-[#050505] relative overflow-hidden"
  >
    <!-- 星空背景 -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <div
        v-for="star in stars"
        :key="star.id"
        class="absolute rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF] animate-twinkle"
        :style="{
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          opacity: star.opacity,
          animationDuration: star.duration,
          animationDelay: star.delay
        }"
      ></div>
    </div>

    <!-- 顶部跑马灯 -->
    <div
      class="absolute top-0 left-0 w-full h-12 flex items-center overflow-hidden border-b border-white/5 bg-black/40 z-10 mask-fade-edges"
    >
      <div class="flex whitespace-nowrap animate-marquee-infinite">
        <div v-for="i in 2" :key="i" class="flex items-center pr-40">
          <span class="text-[#00E5FF] text-[12px] font-mono tracking-[0.3em] opacity-60">
            >> 欢迎接入「鸦口无言」暗网终端........
          </span>
          <!-- 乌鸦编队 -->
          <div class="flex items-center gap-3 ml-8 text-[#00E5FF] drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]">
            <svg class="w-6 h-6 opacity-100" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.28 9.38c2.14-1.28 4.7-2.18 7.4-2.5l1.64-3.18 2.05 3.03c2.97.08 5.75.92 8.05 2.27l-2.48 2.27-5.94-1.8-2.6 1.8-5.32-2.02-2.8 1.13z"/>
            </svg>
            <svg class="w-5 h-5 opacity-70 mt-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.28 9.38c2.14-1.28 4.7-2.18 7.4-2.5l1.64-3.18 2.05 3.03c2.97.08 5.75.92 8.05 2.27l-2.48 2.27-5.94-1.8-2.6 1.8-5.32-2.02-2.8 1.13z"/>
            </svg>
            <svg class="w-4 h-4 opacity-40 mt-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.28 9.38c2.14-1.28 4.7-2.18 7.4-2.5l1.64-3.18 2.05 3.03c2.97.08 5.75.92 8.05 2.27l-2.48 2.27-5.94-1.8-2.6 1.8-5.32-2.02-2.8 1.13z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 关闭按钮 -->
    <button
      @click="closeWindow"
      class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300 z-50 group"
      title="关闭应用"
    >
      <svg
        class="w-5 h-5 transition-transform group-hover:rotate-90"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <div
      class="w-[340px] rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col items-center relative z-10"
      style="padding: 28px;"
    >
      <div class="mb-5 relative group cursor-pointer" @click="isRegisterMode && triggerAvatarUpload()">
        <!-- 头像预览（注册模式下显示） -->
        <div
          v-if="isRegisterMode && registerFormRef?.avatarPreview"
          class="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.5)]"
        >
          <img
            :src="registerFormRef.avatarPreview"
            alt="头像预览"
            class="w-full h-full object-cover"
          />
        </div>
        
        <!-- Logo SVG -->
        <svg
          v-if="!isRegisterMode || !registerFormRef?.avatarPreview"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          class="w-10 h-10 transform transition-transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]"
        >
          <path
            d="M14 56 L24 16 L46 12 L62 28 L40 32 L52 42 L28 56 Z"
            fill="#0A0A0C"
            stroke="#00E5FF"
            stroke-width="1.5"
            stroke-linejoin="round"
          />
          <circle
            cx="38"
            cy="24"
            r="2.5"
            fill="#00E5FF"
            class="animate-pulse drop-shadow-[0_0_10px_rgba(0,229,255,1)]"
          />
          <line x1="22" y1="40" x2="32" y2="38" stroke="#00E5FF" stroke-width="1" opacity="0.5" />
          <line x1="24" y1="28" x2="34" y2="28" stroke="#00E5FF" stroke-width="1" opacity="0.3" />
        </svg>

        <!-- 悬停提示（仅注册模式显示） -->
        <div
          v-if="isRegisterMode"
          class="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        >
          <span class="text-[#00E5FF] text-[10px] tracking-widest font-medium">点击上传头像</span>
        </div>
      </div>

      <h2 class="text-lg font-bold text-white tracking-[0.15em] drop-shadow-md" style="margin-bottom: 2px;">
        {{ isRegisterMode ? '获取鸦身份' : '潜入鸦巢网络' }}
      </h2>
      <p class="text-[#666666] text-[11px] tracking-widest uppercase" style="margin-bottom: 20px;">
        端到端加密 · 连鬼都偷窥不了
      </p>

      <!-- 登录表单 -->
      <LoginForm v-if="!isRegisterMode" ref="loginFormRef" @submit="handleLogin" />

      <!-- 注册表单 -->
      <RegisterForm v-else ref="registerFormRef" @submit="handleRegister" />

      <div class="mt-5 flex flex-col items-center gap-2.5">
        <a
          href="#"
          class="text-[#85858A] hover:text-[#00E5FF] text-xs tracking-widest transition-colors duration-300"
          @click.prevent="toggleMode"
        >
          {{ isRegisterMode ? '已经混进来了？直接进' : '是个无名之辈？去搞个身份' }}
        </a>
        <span class="text-[#444444] text-[11px] tracking-widest">
          {{ isRegisterMode ? '注册后将自动生成本地加密密钥' : '首次登录将自动生成本地加密密钥' }}
        </span>
      </div>
    </div>

    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF]/5 blur-[120px] rounded-full pointer-events-none z-0"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/entities/user/model/useAuthStore'
import { useCryptoStore } from '@/entities/crypto/model/useCryptoStore'
import { websocketService } from '@/shared/api/websocket'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const router = useRouter()
const authStore = useAuthStore()
const cryptoStore = useCryptoStore()

const isRegisterMode = ref(false)
const loginFormRef = ref<InstanceType<typeof LoginForm> | null>(null)
const registerFormRef = ref<InstanceType<typeof RegisterForm> | null>(null)

// 生成随机星空数据
const stars = ref<Array<{
  id: number
  left: string
  top: string
  size: string
  duration: string
  delay: string
  opacity: number
}>>([])

onMounted(() => {
  // 生成 60 颗随机星星
  stars.value = Array.from({ length: 60 }).map(() => ({
    id: Math.random(),
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`, // 1px 到 3px 随机大小
    duration: `${Math.random() * 3 + 2}s`, // 闪烁周期 2s-5s
    delay: `${Math.random() * 5}s`, // 随机延迟
    opacity: Math.random() * 0.5 + 0.3 // 基础透明度
  }))
})

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
}

const triggerAvatarUpload = () => {
  if (registerFormRef.value) {
    registerFormRef.value.triggerUpload()
  }
}

const closeWindow = async () => {
  console.log('🚪 关闭窗口...')
  
  // 快速断开 WebSocket（不等待）
  try {
    websocketService.disconnect()
  } catch (error) {
    console.warn('⚠️ 断开 WebSocket 时出错（忽略）:', error)
  }
  
  // 立即关闭窗口
  await window.api.window.close()
}

const handleLogin = async (data: {
  username: string
  password: string
  saveHistory: (username: string) => void
}) => {
  try {
    console.log('🔐 开始登录...', { username: data.username })

    const loginResult = await authStore.login({
      username: data.username,
      password: data.password
    })

    if (!loginResult.success) {
      throw new Error('登录失败，请检查用户名和密码')
    }

    console.log('✅ 登录成功')
    data.saveHistory(data.username)

    // 并行处理：密钥生成和 WebSocket 连接
    const tasks: Promise<any>[] = []
    
    if (!cryptoStore.hasKeyPair) {
      console.log('🔑 生成 RSA 密钥对...')
      tasks.push(
        cryptoStore.generateRSAKeyPair().catch(err => {
          console.warn('⚠️ 密钥生成失败，但不影响登录:', err)
        })
      )
    }

    // WebSocket 在后台连接，不阻塞跳转
    console.log('🔌 初始化 WebSocket（后台连接）...')
    websocketService.initialize()
    websocketService.connect()

    // 等待密钥生成完成（如果有）
    if (tasks.length > 0) {
      await Promise.all(tasks)
    }

    console.log('🚀 跳转到主页面')
    router.push('/')
  } catch (error) {
    console.error('❌ 登录失败:', error)
    loginFormRef.value?.setError(error instanceof Error ? error.message : '登录失败，请重试')
  } finally {
    loginFormRef.value?.setLoading(false)
  }
}

const handleRegister = async (data: {
  username: string
  nickname: string
  password: string
  confirmPassword: string
  avatarFile: File | null
}) => {
  try {
    if (data.password !== data.confirmPassword) {
      throw new Error('两次输入的密码不一致')
    }

    if (data.password.length < 6) {
      throw new Error('密码长度至少为6位')
    }

    console.log('📝 开始注册...', { username: data.username, nickname: data.nickname, hasAvatar: !!data.avatarFile })

    const registerResult = await authStore.register({
      username: data.username,
      password: data.password,
      nickname: data.nickname
    })

    if (!registerResult.success) {
      throw new Error(registerResult.error || '注册失败，请重试')
    }

    console.log('✅ 注册成功，自动登录...')

    const loginResult = await authStore.login({
      username: data.username,
      password: data.password
    })

    if (!loginResult.success) {
      throw new Error('注册成功，但自动登录失败，请手动登录')
    }

    // 如果有头像，上传头像
    if (data.avatarFile) {
      try {
        console.log('📤 上传头像...')
        const { userApi } = await import('@/shared/api/user')
        await userApi.uploadAvatar(data.avatarFile)
        console.log('✅ 头像上传成功')
        
        // 刷新用户信息以获取头像 URL
        console.log('🔄 刷新用户信息...')
        await authStore.fetchUserInfo()
        console.log('✅ 用户信息已刷新，头像 URL:', authStore.currentUser?.avatar)
      } catch (error) {
        console.warn('⚠️ 头像上传失败，但不影响注册:', error)
      }
    }

    // 并行处理：密钥生成和 WebSocket 连接
    const tasks2: Promise<any>[] = []
    
    if (!cryptoStore.hasKeyPair) {
      console.log('🔑 生成 RSA 密钥对...')
      tasks2.push(
        cryptoStore.generateRSAKeyPair().catch(err => {
          console.warn('⚠️ 密钥生成失败，但不影响登录:', err)
        })
      )
    }

    // WebSocket 在后台连接，不阻塞跳转
    console.log('🔌 初始化 WebSocket（后台连接）...')
    websocketService.initialize()
    websocketService.connect()

    // 等待密钥生成完成（如果有）
    if (tasks2.length > 0) {
      await Promise.all(tasks2)
    }

    console.log('🚀 跳转到主页面')
    router.push('/')
  } catch (error) {
    console.error('❌ 注册失败:', error)
    registerFormRef.value?.setError(error instanceof Error ? error.message : '注册失败，请重试')
  } finally {
    registerFormRef.value?.setLoading(false)
  }
}
</script>

<style scoped>
/* 星星闪烁动画 */
@keyframes twinkle {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
    box-shadow: 0 0 10px #00E5FF;
  }
}

.animate-twinkle {
  animation-name: twinkle;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* 跑马灯无缝滚动动画 */
@keyframes marquee-infinite {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee-infinite {
  width: max-content;
  animation: marquee-infinite 25s linear infinite;
}

/* 两端渐变消隐遮罩 */
.mask-fade-edges {
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
}
</style>
