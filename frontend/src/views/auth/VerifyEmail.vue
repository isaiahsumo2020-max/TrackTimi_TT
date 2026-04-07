<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-primary-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
        <p class="text-gray-600">Enter the 6-digit code sent to your email</p>
        <p class="text-sm text-gray-500 mt-2">{{ maskedEmail }}</p>
      </div>

      <!-- Message -->
      <div v-if="message" :class="['mb-6 p-4 rounded-lg', messageType === 'success' ? 'bg-blue-50 text-blue-700' : 'bg-blue-50 text-blue-700']">
        <p class="text-sm">{{ message }}</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="mb-6 p-4 rounded-lg bg-red-50 text-red-700">
        <p class="text-sm font-medium">{{ error }}</p>
      </div>

      <!-- Success State -->
      <div v-if="verified" class="text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-blue-700 mb-4">Email Verified!</h2>
        <p class="text-gray-600 mb-6">Your email has been verified successfully. You can now access your dashboard.</p>
        <router-link 
          to="/login" 
          class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Go to Login
        </router-link>
      </div>

      <!-- Verification Form -->
      <form v-else @submit.prevent="handleVerification" class="space-y-6">
        <!-- Code Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <div class="flex gap-2 justify-center mb-4">
            <input
              v-for="(digit, index) in codeDigits"
              :key="index"
              :ref="`digit${index}`"
              v-model="codeDigits[index]"
              type="text"
              maxlength="1"
              class="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              @input="(e) => handleDigitInput(e, index)"
              @keydown.backspace="(e) => handleBackspace(e, index)"
              inputmode="numeric"
            />
          </div>
          <p class="text-xs text-gray-500 text-center">
            Enter the 6-digit code from your email
          </p>
        </div>

        <!-- Verify Button -->
        <button
          type="submit"
          :disabled="!isCodeComplete || isLoading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isLoading">Verify Code</span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        </button>

        <!-- OR Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <!-- Verify Link Info -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-700">
            <strong>Didn't receive the code?</strong><br/>
            You can also verify by clicking the link sent to your email.
          </p>
        </div>

        <!-- Resend Button -->
        <button
          type="button"
          @click="handleResendCode"
          disabled="isResending || cannotResend"
          class="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isResending">
            {{ cannotResend ? `Resend Code in ${resendCountdown}s` : 'Resend Code' }}
          </span>
          <span v-else class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </span>
        </button>
      </form>

      <!-- Footer -->
      <div class="mt-8 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-600">
          Wrong email? 
          <router-link to="/login" class="text-blue-600 hover:underline font-medium">
            Go back to login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmailByCode, resendVerification, verifyEmailByLink } from '@/services/authApi'

export default {
  name: 'VerifyEmail',
  setup() {
    const route = useRoute()
    const router = useRouter()

    const codeDigits = ref(['', '', '', '', '', ''])
    const error = ref('')
    const message = ref('')
    const messageType = ref('info')
    const isLoading = ref(false)
    const isResending = ref(false)
    const verified = ref(false)
    const emailFromStorage = ref('')
    const resendCountdown = ref(0)
    const lastResendTime = ref(0)
    const RESEND_COOLDOWN = 60 // seconds

    const maskedEmail = computed(() => {
      if (!emailFromStorage.value) return ''
      const [localPart, domain] = emailFromStorage.value.split('@')
      const masked = localPart.substring(0, 2) + '*'.repeat(Math.max(1, localPart.length - 2))
      return `${masked}@${domain}`
    })

    const cannotResend = computed(() => resendCountdown.value > 0)

    const isCodeComplete = computed(() => {
      return codeDigits.value.every(digit => digit !== '') && codeDigits.value.length === 6
    })

    // Get email from localStorage or route
    onMounted(() => {
      emailFromStorage.value = localStorage.getItem('pendingVerificationEmail') || route.query.email || ''
      
      // Check if verification link was clicked
      if (route.query.token) {
        handleTokenVerification(route.query.token)
      }

      // Resend countdown timer
      const interval = setInterval(() => {
        if (resendCountdown.value > 0) {
          resendCountdown.value--
        }
      }, 1000)

      return () => clearInterval(interval)
    })

    // Handle token-based verification
    const handleTokenVerification = async (token) => {
      try {
        isLoading.value = true
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          message.value = data.message
          messageType.value = 'success'
          verified.value = true
          localStorage.removeItem('pendingVerificationEmail')
          
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          error.value = data.error || 'Token verification failed'
          if (data.tokenExpired) {
            message.value = 'This verification link has expired. Please request a new code.'
          }
        }
      } catch (err) {
        console.error('Token verification error:', err)
        error.value = 'Failed to verify email. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    // Handle digit input
    const handleDigitInput = (e, index) => {
      const value = e.target.value
      if (!/^\d*$/.test(value)) {
        codeDigits.value[index] = ''
        return
      }

      if (value && index < 5) {
        this.$refs[`digit${index + 1}`]?.[0]?.focus()
      }
    }

    // Handle backspace
    const handleBackspace = (e, index) => {
      if (e.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
        this.$refs[`digit${index - 1}`]?.[0]?.focus()
      }
    }

    // Verify code
    const handleVerification = async () => {
      const code = codeDigits.value.join('')

      if (code.length !== 6) {
        error.value = 'Please enter all 6 digits'
        return
      }

      if (!emailFromStorage.value) {
        error.value = 'Email not found. Please login again.'
        return
      }

      try {
        isLoading.value = true
        error.value = ''

        const response = await verifyEmailByCode({
          email: emailFromStorage.value,
          code: code
        })

        message.value = response.message
        messageType.value = 'success'
        verified.value = true
        localStorage.removeItem('pendingVerificationEmail')

        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } catch (err) {
        console.error('Verification error:', err)
        error.value = err.message || 'Verification failed. Please try again.'
        if (err.codeExpired) {
          error.value = 'This code has expired. Please request a new one.'
        }
      } finally {
        isLoading.value = false
      }
    }

    // Resend code
    const handleResendCode = async () => {
      if (!emailFromStorage.value) {
        error.value = 'Email not found. Please login again.'
        return
      }

      try {
        isResending.value = true
        error.value = ''

        const response = await resendVerification({
          email: emailFromStorage.value
        })

        message.value = response.message
        messageType.value = 'success'
        
        // Reset cooldown
        lastResendTime.value = Date.now()
        resendCountdown.value = RESEND_COOLDOWN

        // Clear code input
        codeDigits.value = ['', '', '', '', '', '']
      } catch (err) {
        console.error('Resend error:', err)
        error.value = err.message || 'Failed to resend code. Please try again.'
      } finally {
        isResending.value = false
      }
    }

    return {
      codeDigits,
      error,
      message,
      messageType,
      isLoading,
      isResending,
      verified,
      maskedEmail,
      resendCountdown,
      cannotResend,
      isCodeComplete,
      handleVerification,
      handleResendCode,
      handleDigitInput,
      handleBackspace
    }
  }
}
</script>

<style scoped>
/* Add subtle animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: slideUp 0.5s ease-out;
}
</style>
