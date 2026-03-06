// src/router/guards.js
import { useAuthStore } from '@/stores/auth.js'

export const authGuard = (to, from, next) => {
  const authStore = useAuthStore()
  
  // Allow public routes
  if (to.path === '/' || to.path === '/login' || to.path === '/register' || to.path === '/register-org') {
    next()
    return
  }
  
  // Require auth for tenant routes
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
    return
  }
  
  next()
}
