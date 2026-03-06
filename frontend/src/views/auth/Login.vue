<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-lg">
      <!-- TrackTimi Branding Header -->
      <div class="text-center mb-12">
        <div class="w-20 h-20 mx-auto bg-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <span class="text-3xl font-bold text-white">T</span>
        </div>
        
        <div class="mb-6">
          <h1 class="text-4xl lg:text-5xl font-bold mb-2">
            <span class="text-orange-500">Track</span>
            <span class="text-black">Timi</span>
          </h1>
          <div class="flex items-center justify-center space-x-2 text-sm font-semibold text-gray-600">
            <span>📍</span>
            <span>You're on TrackTimi</span>
          </div>
        </div>
        
        <h2 class="text-2xl font-bold text-black mb-4">Welcome back</h2>
        <p class="text-xl text-gray-600">Sign in to your organization</p>
      </div>
      
      <!-- Login Form -->
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg font-semibold"
            placeholder="admin@acmecorp.com"
          />
        </div>
        
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-3">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg font-semibold"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-6 px-10 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl rounded-2xl shadow-xl border-4 border-orange-500 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div v-if="error" class="p-6 bg-gray-50 border-2 border-gray-300 rounded-2xl">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">⚠️</span>
            <span class="font-bold text-gray-900">{{ error }}</span>
          </div>
        </div>
      </form>

      <!-- Navigation Links -->
      <div class="text-center space-y-6 mt-12 pt-10 border-t-2 border-gray-100">
        <button 
          @click="goToLanding"
          class="w-full group flex items-center justify-center space-x-3 text-xl font-bold text-gray-700 hover:text-orange-500 transition-all py-4 px-6 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg rounded-2xl"
        >
          <span class="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back to <span class="text-orange-500">Track</span><span class="text-black font-bold">Timi</span></span>
        </button>

        <div>
          <p class="text-lg text-gray-700 mb-4">Don't have an organization?</p>
          <router-link to="/register-org" class="block w-full btn-orange py-5 text-lg shadow-xl border-4 border-orange-500">
            🚀 Create Organization
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()  // ✅ SINGLE DECLARATION

const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

// 🔥 BULLETPROOF LANDING NAVIGATION
const goToLanding = async () => {
  authStore.logout()  // ✅ SINGLE authStore usage
  await router.replace('/')
  await nextTick()
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

const login = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await authStore.login(form)
    if (result.success) {
      await router.push(`/${authStore.user.orgSlug}/dashboard`)
    } else {
      error.value = result.error
    }
  } catch (e) {
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
