<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-16">
    <div class="max-w-md w-full text-center">
      <!-- 404 Illustration -->
      <div class="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center shadow-2xl">
        <span class="text-5xl">404</span>
      </div>
      
      <h1 class="text-4xl font-bold text-slate-900 mb-4">Page Not Found</h1>
      <p class="text-xl text-slate-500 mb-8 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div class="space-y-4 mb-8">
        <router-link
          to="/"
          class="block w-full max-w-sm mx-auto px-8 py-4 bg-emerald-500 text-white font-semibold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg"
        >
          Go to Login
        </router-link>
        
        <router-link
          to="/register-org"
          class="block w-full max-w-sm mx-auto px-8 py-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          Create Organization
        </router-link>
      </div>
      
      <p class="text-sm text-slate-400">
        Need help? <a href="#" class="underline hover:text-slate-600">Contact support</a>
      </p>
    </div>
  </div>
</template>

<script setup>
// 404 page - no logic needed
</script>
