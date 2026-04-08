<template>
  <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
    <h2 class="text-xl font-semibold mb-4">Activate your account</h2>

    <div v-if="loading">Loading invitation...</div>
    <div v-else>
      <div v-if="error" class="text-red-600 mb-3">{{ error }}</div>

      <div class="mb-4">
        <div class="text-sm text-gray-600">Invited email</div>
        <div class="font-medium">{{ email }}</div>
        <div v-if="firstName || surName" class="text-sm text-gray-500">{{ firstName }} {{ surName }}</div>
      </div>

      <form @submit.prevent="submit">
        <label class="block mb-2">Choose a password</label>
        <input v-model="password" type="password" class="w-full p-2 border rounded mb-3" placeholder="Password" />
        <input v-model="confirm" type="password" class="w-full p-2 border rounded mb-3" placeholder="Confirm password" />

        <div class="flex justify-end">
          <button :disabled="submitting" class="px-4 py-2 bg-blue-600 text-white rounded">Activate</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const token = route.params.token

const loading = ref(true)
const submitting = ref(false)
const email = ref('')
const firstName = ref('')
const surName = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')

onMounted(async () => {
  try {
    const res = await api.get(`/auth/invitation/${token}`)
    email.value = res.data.email || ''
    firstName.value = res.data.firstName || ''
    firstName.value = res.data.firstName || ''
    surName.value = res.data.surName || ''
  } catch (e) {
    error.value = e.response?.data?.error || 'Invitation not found or expired.'
  } finally {
    loading.value = false
  }
})

async function submit() {
  error.value = ''
  if (!password.value || password.value.length < 6) { error.value = 'Password must be at least 6 characters'; return }
  if (password.value !== confirm.value) { error.value = 'Passwords do not match'; return }
  submitting.value = true
  try {
    await api.post('/auth/activate', { token, password: password.value })
    // success -> go to login
    router.push({ name: 'Login' })
  } catch (e) {
    error.value = e.response?.data?.error || 'Activation failed'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.max-w-md { max-width: 520px; }
</style>
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-primary-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">Welcome to TrackTimi</h1>
        <p class="text-gray-600 mt-2">Complete your account setup</p>
      </div>

      <!-- Employee Info -->
      <div v-if="invitationDetails" class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Account Details</h3>
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">Name:</span> {{ invitationDetails.firstName }} {{ invitationDetails.surName }}</p>
          <p><span class="font-medium">Email:</span> {{ invitationDetails.email }}</p>
        </div>
      </div>

      <!-- Activation Form -->
      <form v-if="!activated" @submit.prevent="activateAccount" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
          <input v-model="password" type="password" required minlength="6"
                 placeholder="Enter a strong password"
                 class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
          <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
          <input v-model="confirmPassword" type="password" required
                 placeholder="Confirm your password"
                 class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
        </div>

        <button type="submit" :disabled="activating || password !== confirmPassword"
                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {{ activating ? 'Setting up your account...' : 'Complete Setup' }}
        </button>
      </form>

      <!-- Success Message -->
      <div v-else class="text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-800 mb-2">Account Activated!</h2>
        <p class="text-gray-600 mb-6">Your account has been successfully set up. You can now sign in to your dashboard.</p>
        <router-link to="/login"
                     class="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          Go to Login
        </router-link>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p class="text-sm text-gray-600 mt-2">Loading invitation details...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/utils/api.js'

const route = useRoute()
const router = useRouter()

// State
const invitationDetails = ref(null)
const password = ref('')
const confirmPassword = ref('')
const activating = ref(false)
const activated = ref(false)
const loading = ref(true)
const error = ref('')

// Methods
const loadInvitationDetails = async () => {
  const token = route.params.token
  if (!token) {
    error.value = 'Invalid invitation link'
    loading.value = false
    return
  }

  try {
    const response = await api.get(`/auth/invitation/${token}`)
    invitationDetails.value = response.data
  } catch (err) {
    error.value = err.response?.data?.error || 'Invalid or expired invitation'
  } finally {
    loading.value = false
  }
}

const activateAccount = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  activating.value = true
  error.value = ''

  try {
    const response = await api.post('/auth/activate-invitation', {
      token: route.params.token,
      password: password.value
    })

    activated.value = true

    // Store the token for automatic login
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to activate account'
  } finally {
    activating.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadInvitationDetails()
})
</script>
