<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 via-gray-100 to-gray-100 flex items-center justify-center p-6">
    <div class="bg-white backdrop-blur-2xl rounded-3xl shadow-2xl border border-white max-w-md w-full p-10">
      <div class="text-center mb-12">
        <div class="w-24 h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border-4 border-white/20">
          <svg class="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-14V7a4 4 0 10-8 0v2h8z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-orange-500 mb-3">Super Admin</h1>
        <p class="text-gray-600 text-lg">Secure access to the admin dashboard</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">Email</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9h4" />
              </svg>
            </span>
            <input
              v-model="email"
              type="email"
              required
              placeholder="superadmin@tracktimi.com"
              class="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">Password</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-14V7a4 4 0 10-8 0v2h8z" />
              </svg>
            </span>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Enter password"
              class="w-full pl-12 pr-14 py-4 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-500 hover:text-orange-600 transition"
            >
              <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.307 1.02-.786 1.975-1.409 2.82" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.966 9.966 0 012.655-4.187m3.052-2.29A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.21 5.774M5.232 5.232l12.04 12.04" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg shadow-md hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span v-if="loading">Signing in...</span>
          <span v-else>Login as Super Admin</span>
        </button>
      </form>

      <div class="mt-6 p-4 bg-blue-50 border border-primary-200 rounded-lg text-xs text-blue-700">
        <p class="font-semibold mb-2">Demo Credentials:</p>
        <p class="font-mono">Email: superadmin@tracktimi.com</p>
        <p class="font-mono">Password: superpass123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const email = ref('superadmin@tracktimi.com')
const password = ref('superpass123')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  // Validate input
  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Email and password are required'
    return
  }

  error.value = ''
  loading.value = true

  try {
    // Direct API call to superadmin auth endpoint
    const response = await axios.post(
      'http://localhost:4000/api/superadmin/auth/login',
      {
        email: email.value,
        password: password.value
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.token) {
      // Store token and user in localStorage
      localStorage.setItem('superAdminToken', response.data.token)
      localStorage.setItem('superAdminUser', JSON.stringify(response.data.user))

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/superadmin')
      }, 500)
    } else {
      error.value = 'No token received from server'
    }
  } catch (err) {
    console.error('Login error:', err)
    if (err.response?.status === 401) {
      error.value = 'Invalid email or password'
    } else if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
input:autofill,
input:autofill:hover,
input:autofill:focus,
input:autofill:active {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}

input:-webkit-autofill {
  -webkit-text-fill-color: #1f2937;
}
</style>

