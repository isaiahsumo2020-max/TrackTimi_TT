<template>
  <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10 shadow-sm">
    <div>
      <h1 class="text-3xl font-black text-primary-600 tracking-tight">Dashboard</h1>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Platform overview and key metrics</p>
    </div>
    
    <div class="flex items-center space-x-4">
      <!-- Notifications Button -->
      <button 
        @click="$emit('notifications')"
        class="relative p-4 bg-slate-50 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-all active:scale-90 shadow-sm font-bold hover:shadow-md"
      >
        <BellIcon class="w-5 h-5" />
        <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </button>

      <!-- Refresh Button -->
      <button 
        @click="$emit('refresh')" 
        :disabled="loading"
        class="p-4 bg-slate-50 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-all active:scale-90 shadow-sm font-bold"
      >
        <RefreshCwIcon :class="{'animate-spin': loading}" class="w-5 h-5" />
      </button>

      <!-- Settings Button -->
      <button 
        @click="$emit('open-settings')"
        class="px-6 py-4 bg-slate-50 text-primary-600 rounded-lg hover:bg-slate-100 transition-all font-black text-xs uppercase tracking-widest flex items-center space-x-2 shadow-sm"
      >
        <SettingsIcon class="w-5 h-5" />
        <span>Settings</span>
      </button>

      <!-- Logout Button -->
      <button 
        @click="$emit('logout')"
        class="px-6 py-4 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-all font-black text-xs uppercase tracking-widest shadow-md active:scale-95"
      >
        Logout
      </button>
    </div>
  </header>
</template>

<script setup>
import { BellIcon, RefreshCwIcon, SettingsIcon, LogOutIcon } from 'lucide-vue-next'

defineProps({
  loading: Boolean,
  unreadCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['refresh', 'notifications', 'open-settings', 'logout'])
</script>
