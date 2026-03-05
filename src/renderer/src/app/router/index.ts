import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/entities/user/model/useAuthStore'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/pages/main/MainPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login/LoginPage.vue')
    }
  ]
})

// Navigation guard
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // Wait for auth store to initialize
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    return '/'
  }
  return true
})

export default router
