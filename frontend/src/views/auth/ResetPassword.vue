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
      
      <!-- Brand Identity -->
      <router-link to="/" class="block text-center mb-10 space-y-3 group">
        <div class="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200 mx-auto mb-6 group-hover:rotate-6 transition-transform">
          <ZapIcon class="w-8 h-8 text-white fill-white" />
        </div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tighter">Reset Password<span class="text-primary-600">.</span></h1>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Create a New Password</p>
      </router-link>

      <!-- Error Feedback -->
      <Transition name="slide-up">
        <div v-if="errorMsg" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-lg text-center flex items-center justify-center gap-2">
          <AlertTriangleIcon class="w-4 h-4" /> {{ errorMsg }}
        </div>
      </Transition>

      <!-- Success Message -->
      <Transition name="slide-up">
        <div v-if="successMsg" class="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-[11px] font-black uppercase tracking-widest rounded-lg text-center">
          {{ successMsg }}
        </div>
      </Transition>

      <!-- Reset Form -->
      <form v-if="!resetComplete" @submit.prevent="resetPassword" class="space-y-5">
        <!-- New Password Input -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">New Password</label>
          <div class="relative group">
            <LockIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
            <input 
              v-model="newPassword" 
              type="password"
              autocomplete="new-password"
              placeholder="••••••••" 
              required
              class="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-900"
            >
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Confirm Password</label>
          <div class="relative group">
            <LockIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
            <input 
              v-model="confirmPassword" 
              type="password"
              autocomplete="new-password"
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
          <span v-if="!loading">Reset Password</span>
          <span v-else class="flex items-center justify-center">
            <Loader2Icon class="w-4 h-4 animate-spin mr-2" /> Processing...
          </span>
        </button>
      </form>

      <!-- Success Message with Login Link -->
      <div v-if="resetComplete" class="space-y-6">
        <div class="text-center">
          <CheckCircleIcon class="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 class="text-2xl font-black text-green-600 mb-2">Password Reset Successful!</h2>
          <p class="text-sm text-slate-600">Your password has been successfully updated. You can now login with your new password.</p>
        </div>

        <router-link 
          to="/login" 
          class="w-full bg-primary-600 hover:bg-primary-700 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-lg shadow-lg shadow-primary-100 transition-all text-center block"
        >
          Back to Login
        </router-link>
      </div>
      
      <!-- Footer Link -->
      <div class="text-center mt-10">
        <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          Remember your password? 
          <router-link to="/login" class="text-primary-600 hover:text-primary-800 ml-1">Sign In</router-link>
        </p>
      </div>
    </div>

    <!-- Small Footer Branding -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
      TrackTimi Enterprise v1.0
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ZapIcon, MailIcon, LockIcon, Loader2Icon, ArrowLeftIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const resetComplete = ref(false)
const resetToken = ref('')

onMounted(() => {
  // Get reset token from URL query parameter
  resetToken.value = route.query.token || ''
  
  if (!resetToken.value) {
    errorMsg.value = 'Invalid or missing reset link. Please request a new password reset.'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }
})

async function resetPassword() {
  // Validate inputs
  if (!newPassword.value || !confirmPassword.value) {
    errorMsg.value = 'Please fill in all fields'
    return
  }

  if (newPassword.value.length < 6) {
    errorMsg.value = 'Password must be at least 6 characters'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Passwords do not match'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const requestBody = {
      token: resetToken.value,
      newPassword: newPassword.value,
      confirmPassword: confirmPassword.value
    }
    
    console.log('🔐 Sending reset request with token:', resetToken.value.substring(0, 8) + '...')
    
    const response = await fetch('http://localhost:4000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 Reset response status:', response.status)
    
    const result = await response.json()
    
    console.log('📡 Reset response data:', result)

    if (result.success) {
      successMsg.value = result.message
      resetComplete.value = true
      
      // Auto redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/login')
      }, 5000)
    } else {
      errorMsg.value = result.error || 'Failed to reset password'
      console.error('❌ Reset error:', result.error)
    }
  } catch (error) {
    errorMsg.value = 'Connection error. Please try again.'
    console.error('❌ Reset password error:', error)
  } finally {
    loading.value = false
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

.fade-in-enter-active, .fade-in-leave-active {
  transition: opacity 0.3s ease;
}
.fade-in-enter-from, .fade-in-leave-to {
  opacity: 0;
}

.zoom-in-enter-active, .zoom-in-leave-active {
  transition: all 0.3s ease;
}
.zoom-in-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
</style>
