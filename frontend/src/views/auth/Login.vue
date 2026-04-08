<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
    
    <!-- 1. BACK TO LANDING LINK -->
    <router-link 
      to="/" 
      class="absolute top-8 left-8 z-20 flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-colors group"
    >
      <ArrowLeftIcon class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      <span>Return to Home</span>
    </router-link>

    <!-- Background Decorative Blobs -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px]"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-100 rounded-full blur-[100px]"></div>

    <div class="bg-white rounded-lg border border-slate-100 shadow-2xl shadow-primary-100/50 p-10 md:p-14 max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-700">
      
      <!-- Brand Identity (Clickable to Home) -->
      <router-link to="/" class="block text-center mb-10 space-y-3 group">
        <div class="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 mx-auto mb-6 group-hover:rotate-6 transition-transform">
          <ZapIcon class="w-8 h-8 text-white fill-white" />
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tighter">Welcome Back<span class="text-primary-600">.</span></h1>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Access Point</p>
      </router-link>

      <!-- Error Feedback -->
      <Transition name="slide-up">
        <div v-if="errorMsg" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-lg text-center flex items-center justify-center gap-2">
          <AlertTriangleIcon class="w-4 h-4" /> {{ errorMsg }}
        </div>
      </Transition>

      <form @submit.prevent="login" class="space-y-5">
        <!-- Email Input -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Email Address</label>
          <div class="relative group">
            <MailIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
            <input 
              v-model="email" 
              type="email" 
              placeholder="name@company.com" 
              required
              class="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-900"
            >
          </div>
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <div class="flex justify-between items-center px-4">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            <button type="button" @click="showResetModal = true" class="text-[9px] font-black text-primary-500 uppercase tracking-tighter hover:text-primary-700">Forgot?</button>
          </div>
          <div class="relative group">
            <LockIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
            <input 
              v-model="password" 
              type="password" 
              placeholder="••••••••" 
              required
              class="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-900"
            >
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-lg shadow-lg shadow-primary-100 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
        >
          <span v-if="!loading">Initialize Session</span>
          <span v-else class="flex items-center justify-center">
            <Loader2Icon class="w-4 h-4 animate-spin mr-2" /> Authenticating...
          </span>
        </button>
      </form>
      
      <!-- Footer Link -->
      <div class="text-center mt-10">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          New Organization? 
          <router-link to="/register-org" class="text-primary-600 hover:text-primary-800 ml-1">Establish Workspace</router-link>
        </p>
      </div>
    </div>

    <!-- Password Reset Modal -->
    <Transition name="fade">
      <div v-if="showResetModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border border-primary-200 p-10 w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <h2 class="text-2xl font-black text-slate-900 mb-2">Reset Password</h2>
          <p class="text-sm text-slate-500 mb-6">Enter your email to receive a password reset link</p>
          
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Email Address</label>
              <input 
                v-model="resetEmail" 
                type="email" 
                placeholder="your@email.com" 
                required
                class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 text-sm font-bold" />
            </div>

            <div v-if="resetMessage" class="p-4 bg-green-50 border border-green-200 text-green-600 text-[11px] font-bold rounded-lg text-center">
              {{ resetMessage }}
            </div>

            <div v-if="resetError" class="p-4 bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold rounded-lg text-center">
              {{ resetError }}
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button 
              @click="showResetModal = false" 
              class="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button 
              @click="sendPasswordReset"
              :disabled="resetLoading || !resetEmail"
              class="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-all disabled:opacity-50">
              {{ resetLoading ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Small Footer Branding -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
      TrackTimi Enterprise v1.0
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { ZapIcon, MailIcon, LockIcon, Loader2Icon, ArrowLeftIcon, AlertTriangleIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const showResetModal = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetMessage = ref('')
const resetError = ref('')

// Call on component load
onMounted(() => {
  // Initialize component
})

async function login() {
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await authStore.login({ 
      email: email.value, 
      password: password.value 
    })
    
    if (result.success) {
      const { orgSlug, role } = authStore.user || {}
      
      if (!orgSlug) {
        throw new Error('Workspace identifier not found')
      }

      // Redirect immediately to dashboard
      if (role === 'Staff') {
        router.push(`/${orgSlug}/user-dashboard`)
      } else {
        router.push(`/${orgSlug}/dashboard`)
      }
    } else if (result.requiresVerification) {
      // Email not verified - redirect to verification page
      localStorage.setItem('pendingVerificationEmail', result.email)
      router.push('/verify-email')
    } else {
      errorMsg.value = result.error || 'Identity verification failed'
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.error || error.message || 'Connection Interrupted'
  } finally {
    loading.value = false
  }
}

// Send password reset request
async function sendPasswordReset() {
  if (!resetEmail.value) return
  
  resetLoading.value = true
  resetMessage.value = ''
  resetError.value = ''
  
  try {
    const response = await fetch('http://localhost:4000/api/auth/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail.value })
    })
    
    const result = await response.json()
    
    if (result.success) {
      resetMessage.value = 'Password reset link sent! Check your email. You have 30 minutes to reset your password.'
      setTimeout(() => {
        showResetModal.value = false
        resetEmail.value = ''
        resetMessage.value = ''
        resetError.value = ''
      }, 3000)
    } else {
      resetError.value = result.error || result.message || 'Failed to send reset link'
    }
  } catch (error) {
    resetError.value = 'Error sending reset link. Please try again.'
    console.error('Reset password error:', error)
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.4s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-in-from-top-4 {
  animation: slideInFromTop 0.3s ease-out;
}
</style>
