<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <!-- Organization Header -->
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="text-2xl font-bold text-white">{{ orgInitial }}</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">{{ orgName }}</h1>
        <p class="text-sm text-gray-600 mt-1">{{ orgDomain }}</p>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div>
          <input v-model="email" type="email" placeholder="Email" required
                 class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
        </div>
        <div>
          <input v-model="password" type="password" placeholder="Password" required
                 class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
        </div>
        <button type="submit" :disabled="loading"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50">
          {{ loading ? 'Signing In...' : 'Sign In' }}
        </button>
      </form>

      <div class="text-center mt-4 text-sm text-gray-600">
        <p>Employee login for {{ orgName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)

// Get organization info from URL/domain
const orgName = computed(() => {
  // For now, we'll get it from the route params or local storage
  return 'Your Organization'
})

const orgDomain = computed(() => {
  // This would be the actual domain
  return window.location.hostname
})

const orgInitial = computed(() => {
  return orgName.value.slice(0, 2).toUpperCase()
})

async function login() {
  loading.value = true
  try {
    const result = await authStore.domainLogin({ email: email.value, password: password.value })
    if (result.success) {
      const { orgSlug, role } = authStore.user || {}

      // Validate orgSlug exists
      if (!orgSlug) {
        throw new Error('Organization slug not found in login response')
      }

      // Route based on role
      if (role === 'Staff') {
        router.push(`/${orgSlug}/user-dashboard`)
      } else {
        // OrgAdmin or any other role goes to dashboard
        router.push(`/${orgSlug}/dashboard`)
      }
    } else {
      alert('Login failed: ' + result.error)
    }
  } catch (error) {
    alert('Login failed: ' + (error.response?.data?.error || error.message))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Check if we have organization info from domain detection
  // This would be implemented in a real domain-based system
})
</script>
