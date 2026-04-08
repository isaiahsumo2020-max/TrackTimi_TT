<template>
  <div class="bg-white p-8 rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group cursor-default">
    <!-- Header: Icon & Badge -->
    <div class="flex items-center justify-between mb-6">
      <div 
        class="w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-md group-hover:rotate-6 group-hover:shadow-lg transition-all"
        :style="{ backgroundColor: color }"
      >
        <component :is="icon" class="w-7 h-7" />
      </div>
      <div class="flex items-center space-x-2 px-3 py-1 bg-primary-600/10 rounded-full border border-primary-600/20">
        <div class="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
        <span class="text-[8px] font-black text-primary-600 uppercase tracking-widest">Live</span>
      </div>
    </div>

    <!-- Label -->
    <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">{{ label }}</p>

    <!-- Value -->
    <div class="flex items-baseline space-x-3">
      <h3 class="text-5xl font-black text-slate-900 tracking-tighter leading-none">{{ value }}</h3>
      <span v-if="total" class="text-sm font-bold text-slate-300 mb-1">/ {{ total }}</span>
    </div>

    <!-- Footer: Trend or Change -->
    <div v-if="trend" class="mt-5 pt-5 border-t border-slate-100">
      <div class="flex items-center space-x-2">
        <div :class="trendUp ? 'text-primary-600' : 'text-red-500'" class="flex items-center gap-1 text-xs font-black uppercase tracking-widest">
          <component :is="trendUp ? TrendingUpIcon : TrendingDownIcon" class="w-4 h-4" />
          {{ Math.abs(trend) }}%
        </div>
        <span class="text-[9px] text-slate-400 font-medium">vs last month</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-vue-next'

const props = defineProps({
  icon: null, // Accept any component (function, object, etc.)
  label: String,
  value: [String, Number],
  color: String,
  total: [String, Number],
  trend: Number
})

const trendUp = computed(() => props.trend >= 0)
</script>
