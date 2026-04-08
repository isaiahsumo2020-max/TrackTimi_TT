<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center px-4 py-16">
    <div class="max-w-md w-full text-center">
      <!-- Unauthorized Illustration -->
      <div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-rose-400 to-rose-500 rounded-3xl flex items-center justify-center shadow-2xl text-white">
        <ShieldAlertIcon class="w-16 h-16 text-white" />
      </div>
      
      <h1 class="text-4xl font-bold text-slate-900 mb-4">Unauthorized</h1>
      <p class="text-xl text-slate-500 mb-8 max-w-sm mx-auto">
        You don't have permission to access this page.
      </p>
      
      <div class="space-y-4 mb-8">
        <router-link
          to="/login"
          class="block w-full max-w-sm mx-auto px-8 py-4 bg-orange-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg"
        >
          Sign In
        </router-link>
        
        <router-link
          to="/register-org"
          class="block w-full max-w-sm mx-auto px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          Create Organization
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShieldAlertIcon } from 'lucide-vue-next'
// Unauthorized page
</script>
