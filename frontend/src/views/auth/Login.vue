<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
    
    <!-- Save Notification Toast -->
    <Transition name="slide-down">
      <div v-if="showSaveNotification" class="fixed top-8 right-8 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-4 max-w-md">
        <div class="text-2xl">✅</div>
        <div>
          <p class="font-black text-sm mb-1">Platform Saved!</p>
          <p class="text-xs opacity-90"><strong>{{ email }}</strong> saved to this device.</p>
          <p class="text-[10px] opacity-75 mt-1">Login faster next time!</p>
        </div>
      </div>
    </Transition>

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

    <div class="bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-primary-100/50 p-10 md:p-14 max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-700">
      
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
        <div v-if="errorMsg" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-lg text-center">
          ⚠️ {{ errorMsg }}
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
            <a href="#" class="text-[9px] font-black text-primary-500 uppercase tracking-tighter hover:text-primary-700">Forgot?</a>
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

        <!-- Save to Platform Checkbox -->
        <label class="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-lg cursor-pointer group hover:bg-blue-100 transition-colors">
          <input 
            v-model="saveToplatform" 
            type="checkbox"
            class="w-5 h-5 accent-blue-600 cursor-pointer"
          >
          <span class="text-[11px] font-black text-blue-700 uppercase tracking-widest">
            💾 Save Email to Platform
          </span>
        </label>

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
import { ZapIcon, MailIcon, LockIcon, Loader2Icon, ArrowLeftIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')
const saveToplatform = ref(false)
const showSaveNotification = ref(false)

// Load saved email from localStorage on mount
function loadSavedEmail() {
  const savedEmail = localStorage.getItem('tracktimi_saved_email')
  if (savedEmail) {
    email.value = savedEmail
    saveToplatform.value = true
  }
}

// Call on component load
onMounted(() => {
  loadSavedEmail()
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

      // Save email to platform if checkbox is checked
      if (saveToplatform.value) {
        localStorage.setItem('tracktimi_saved_email', email.value)
        localStorage.setItem('tracktimi_platform_saved_at', new Date().toISOString())
        showSaveNotification.value = true
        console.log('✅ Email saved to platform:', email.value)
      } else {
        localStorage.removeItem('tracktimi_saved_email')
        localStorage.removeItem('tracktimi_platform_saved_at')
      }

      // Show success notification for 2 seconds before redirecting
      setTimeout(() => {
        if (role === 'Staff') {
          router.push(`/${orgSlug}/user-dashboard`)
        } else {
          router.push(`/${orgSlug}/dashboard`)
        }
      }, saveToplatform.value ? 2000 : 0)
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