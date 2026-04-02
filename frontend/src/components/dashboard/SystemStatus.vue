<template>
  <div class="bg-gradient-to-br from-[#1B8B3C] to-[#0F5124] rounded-2xl shadow-2xl text-white relative overflow-hidden flex flex-col justify-between p-10">
    <!-- Decorative Background Element -->
    <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-[#FF6B35]/10 rounded-full blur-[80px]"></div>

    <!-- Content -->
    <div class="relative z-10 space-y-10">
      <!-- Header --> <h3 class="text-xs font-black uppercase tracking-[0.3em] text-[#4ADE80]">System Health</h3>

      <!-- Metrics -->
      <div class="space-y-8">
        <!-- Check-in Rate -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold uppercase opacity-70 tracking-widest">Check-in Rate</span>
            <span class="text-sm font-black text-[#FF6B35]">{{ checkInRate }}%</span>
          </div>
          <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div 
              class="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB84A] rounded-full transition-all duration-1000 shadow-lg shadow-[#FF6B35]/50"
              :style="{ width: checkInRate + '%' }"
            ></div>
          </div>
        </div>

        <!-- Server Status -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold uppercase opacity-70 tracking-widest">Server Status</span>
            <span class="text-sm font-black text-[#4ADE80]">{{ serverStatus }}%</span>
          </div>
          <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div 
              class="h-full bg-gradient-to-r from-[#4ADE80] to-[#86EFB3] rounded-full transition-all duration-1000 shadow-lg shadow-[#4ADE80]/50"
              :style="{ width: serverStatus + '%' }"
            ></div>
          </div>
        </div>

        <!-- Database Load -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-bold uppercase opacity-70 tracking-widest">Database Load</span>
            <span class="text-sm font-black text-[#60A5FA]">{{ dbLoad }}%</span>
          </div>
          <div class="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
            <div 
              class="h-full bg-gradient-to-r from-[#60A5FA] to-[#93C5FD] rounded-full transition-all duration-1000 shadow-lg shadow-[#60A5FA]/50"
              :style="{ width: dbLoad + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-12 pt-10 border-t border-white/10 relative z-10">
      <div class="grid grid-cols-3 gap-6">
        <div>
          <p class="text-[9px] font-bold uppercase opacity-50 tracking-wider mb-2">Database</p>
          <p class="text-xs font-black text-white">tracktimi_prod.db</p>
        </div>
        <div>
          <p class="text-[9px] font-bold uppercase opacity-50 tracking-wider mb-2">Uptime</p>
          <p class="text-xs font-black text-[#4ADE80]">99.9%</p>
        </div>
        <div>
          <p class="text-[9px] font-bold uppercase opacity-50 tracking-wider mb-2">Connections</p>
          <p class="text-xs font-black text-[#FF6B35]">{{ connections }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  checkInRate: {
    type: Number,
    default: 75
  },
  serverStatus: {
    type: Number,
    default: 99.9
  },
  dbLoad: {
    type: Number,
    default: 45
  },
  connections: {
    type: [String, Number],
    default: '1.2K'
  }
})
</script>
