<template>
  <div class="min-h-screen bg-white flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-4xl"> <!-- ✅ MUCH WIDER -->
      <!-- TrackTimi Branding Header -->
      <div class="text-center mb-16">
        <!-- Logo -->
        <div class="w-28 h-28 mx-auto bg-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl border-8 border-orange-400">
          <span class="text-5xl font-bold text-white">T</span>
        </div>
        
        <!-- TrackTimi Split Color Name -->
        <div class="mb-8">
          <h1 class="text-5xl lg:text-6xl font-bold mb-4">
            <span class="text-orange-500">Track</span>
            <span class="text-black">Timi</span>
          </h1>
          <div class="flex items-center justify-center space-x-2 text-lg font-semibold text-gray-600">
            <span>📍</span>
            <span>Monrovia, Liberia • Attendance Tracking</span>
          </div>
        </div>
        
        <h2 class="text-3xl font-bold text-black mb-4">Create Organization</h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Set up your company and admin account in one step. Secure device-verified attendance tracking.
        </p>
      </div>

      <!-- Registration Form -->
      <form @submit.prevent="registerOrg" class="space-y-8">
        <!-- Organization Details -->
        <div class="card p-12">
          <h2 class="text-3xl font-bold text-black mb-4">Organization Details</h2>
          <p class="text-gray-600 mb-10 text-lg">Basic information about your company</p>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <!-- Org Name -->
            <div>
              <label class="block text-xl font-bold text-gray-700 mb-4">Organization Name</label>
              <input
                v-model="form.orgName"
                required
                class="w-full px-8 py-6 border-2 border-gray-300 rounded-3xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-xl font-semibold h-16"
                placeholder="Acme Corporation"
              />
            </div>

            <!-- Org Slug -->
            <div>
              <label class="block text-xl font-bold text-gray-700 mb-4">Organization URL</label>
              <div class="flex">
                <span class="px-8 py-6 bg-gray-50 text-gray-600 font-bold rounded-l-3xl border-2 border-gray-300 h-16 flex items-center text-lg">
                  tracktimi.com/
                </span>
                <input
                  v-model="form.orgSlug"
                  required
                  pattern="[a-z0-9-]+"
                  @input="generateSlug"
                  class="flex-1 px-8 py-6 border-2 border-gray-300 rounded-r-3xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-xl font-semibold h-16"
                  placeholder="acme-corp"
                />
              </div>
              <p class="mt-3 text-base text-gray-500 font-medium">Your organization URL (lowercase, no spaces)</p>
            </div>
          </div>
        </div>

        <!-- Admin Details -->
        <div class="card p-12">
          <h2 class="text-3xl font-bold text-black mb-4">Admin Account</h2>
          <p class="text-gray-600 mb-10 text-lg">Primary administrator for your organization</p>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
            <!-- Admin Name -->
            <div>
              <label class="block text-xl font-bold text-gray-700 mb-4">Admin Full Name</label>
              <input
                v-model="form.adminName"
                required
                class="w-full px-8 py-6 border-2 border-gray-300 rounded-3xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-xl font-semibold h-16"
                placeholder="John Doe"
              />
            </div>

            <!-- Admin Email -->
            <div>
              <label class="block text-xl font-bold text-gray-700 mb-4">Admin Email</label>
              <input
                v-model="form.adminEmail"
                type="email"
                required
                class="w-full px-8 py-6 border-2 border-gray-300 rounded-3xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-xl font-semibold h-16"
                placeholder="admin@acmecorp.com"
              />
            </div>
          </div>

          <!-- Admin Password -->
          <div class="lg:col-span-2">
            <label class="block text-xl font-bold text-gray-700 mb-4">Admin Password</label>
            <input
              v-model="form.adminPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-8 py-6 border-2 border-gray-300 rounded-3xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-xl font-semibold h-16"
              placeholder="Minimum 8 characters"
            />
            <p class="mt-3 text-base text-gray-500 font-medium">Password must be at least 8 characters long</p>
          </div>
        </div>

        <!-- Submit -->
        <div class="pt-10">
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full py-10 px-16 bg-orange-500 hover:bg-orange-600 text-white font-bold text-2xl rounded-3xl shadow-2xl border-4 border-orange-500 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed mx-auto block h-20 flex items-center justify-center"
          >
            {{ loading ? '🎯 Creating Organization...' : '🚀 Create Organization & Admin Account' }}
          </button>
        </div>

        <!-- Errors -->
        <div v-if="error" class="p-10 bg-gray-50 border-2 border-gray-300 rounded-3xl">
          <div class="flex items-center space-x-4">
            <span class="text-3xl">⚠️</span>
            <div>
              <div class="text-2xl font-bold text-gray-900 mb-2">{{ error }}</div>
              <div v-if="errorDetails" class="text-lg text-gray-600">{{ errorDetails }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="text-center space-y-6 pt-12 border-t-4 border-gray-100">
          <!-- Back to Login -->
          <router-link 
            to="/login" 
            class="inline-flex items-center justify-center space-x-3 text-xl font-bold text-gray-700 hover:text-orange-500 transition-all py-5 px-8 w-full border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg rounded-3xl group"
          >
            <span class="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Login</span>
          </router-link>

          <!-- Back to TrackTimi (GUARANTEED LANDING) -->
          <button 
            @click="goToLanding"
            class="w-full group flex items-center justify-center space-x-3 text-xl font-bold text-gray-700 hover:text-orange-500 transition-all py-5 px-8 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg rounded-3xl"
          >
            <span class="text-2xl group-hover:-translate-x-1 transition-transform">🏠</span>
            <span>Back to <span class="text-orange-500">Track</span><span class="text-black font-bold">Timi</span></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

// ✅ SINGLE DECLARATIONS ONLY
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  orgName: '',
  orgSlug: '',
  adminName: '',
  adminEmail: '',
  adminPassword: ''
})

const loading = ref(false)
const error = ref('')
const errorDetails = ref('')

// Form validation
const isFormValid = computed(() => {
  return form.orgName.length > 2 &&
         form.orgSlug.length > 2 &&
         form.adminName.length > 2 &&
         form.adminEmail.includes('@') &&
         form.adminPassword.length >= 8
})

// 🔥 BULLETPROOF LANDING NAVIGATION
const goToLanding = async () => {
  // 1. Clear ALL auth state
  authStore.logout()
  
  // 2. Force navigation to landing
  await router.replace('/')
  
  // 3. Ensure scroll to top
  await nextTick()
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
}

// Auto-generate slug from org name
const generateSlug = () => {
  if (form.orgSlug === '' && form.orgName) {
    form.orgSlug = form.orgName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 20)
  }
}

// Watch orgName for auto-slug
watch(() => form.orgName, generateSlug)

const registerOrg = async () => {
  loading.value = true
  error.value = ''
  errorDetails.value = ''

  try {
    const result = await authStore.registerOrg(form)
    
    if (result.success) {
      await router.push(`/${form.orgSlug}/dashboard`)
    } else {
      error.value = result.error
      
      if (result.errorDetails) {
        errorDetails.value = result.errorDetails
      }
      
      if (error.value.includes('UNIQUE')) {
        error.value = 'Organization name or email already exists'
      }
    }
  } catch (e) {
    error.value = 'Failed to create organization. Please try again.'
    console.error('Registration error:', e)
  } finally {
    loading.value = false
  }
}
</script>
