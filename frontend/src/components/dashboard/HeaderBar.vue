<template>
  <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm">
    <div>
      <h1 class="text-3xl font-black text-[#1B8B3C] tracking-tight">Dashboard</h1>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Platform overview and key metrics</p>
    </div>
    
    <div class="flex items-center space-x-4">
      <!-- Refresh Button -->
      <button 
        @click="$emit('refresh')" 
        :disabled="loading"
        class="p-4 bg-slate-50 text-[#1B8B3C] rounded-xl hover:bg-[#1B8B3C] hover:text-white transition-all active:scale-90 shadow-sm font-bold"
      >
        <RefreshCwIcon :class="{'animate-spin': loading}" class="w-5 h-5" />
      </button>

      <!-- Settings Button -->
      <button 
        @click="$emit('open-settings')"
        class="px-6 py-4 bg-slate-50 text-[#1B8B3C] rounded-xl hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-sm"
      >
        <SettingsIcon class="w-5 h-5" />
        <span>Settings</span>
      </button>

      <!-- Logout Button -->
      <button 
        @click="$emit('logout')"
        class="px-6 py-4 bg-[#FF6B35] text-white rounded-xl hover:bg-[#E55A25] transition-all font-black text-xs uppercase tracking-widest shadow-lg active:scale-95"
      >
        Logout
      </button>
    </div>
  </header>
</template>

<script setup>
import { RefreshCwIcon, SettingsIcon, LogOutIcon } from 'lucide-vue-next'

defineProps({
  loading: Boolean
})

defineEmits(['refresh', 'open-settings', 'logout'])
</script>
