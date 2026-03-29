<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    <!-- 1. Top Metric Cards (The Numbers) -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
        <h3 class="text-3xl font-black mt-1 text-slate-900">{{ stat.value }}</h3>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- 2. Present / On-Site List -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Present Today
          </h3>
          <span class="text-[10px] font-bold text-slate-400">{{ presentList.length }} PERSONNEL</span>
        </div>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="user in presentList" :key="user.name" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">
                {{ user.name[0] }}
              </div>
              <div>
                <p class="text-sm font-black text-slate-900">{{ user.name }}</p>
                <p class="text-[10px] text-slate-500 font-bold uppercase">{{ user.job }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black text-indigo-600">IN: {{ formatTime(user.checkIn) }}</p>
              <p v-if="user.checkOut" class="text-[10px] font-black text-slate-400">OUT: {{ formatTime(user.checkOut) }}</p>
              <span v-else class="text-[8px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded-full">ON-SITE</span>
            </div>
          </div>
          <p v-if="presentList.length === 0" class="text-center py-10 text-xs font-bold text-slate-400 uppercase tracking-widest">No one has checked in yet</p>
        </div>
      </div>

      <!-- 3. Absent List -->
      <div class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
            Absent / Not In Yet
          </h3>
          <span class="text-[10px] font-bold text-slate-400">{{ absentList.length }} PERSONNEL</span>
        </div>

        <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="user in absentList" :key="user.name" class="flex items-center space-x-4 p-4 grayscale opacity-60">
            <div class="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs">
              {{ user.name[0] }}
            </div>
            <div>
              <p class="text-sm font-bold text-slate-900">{{ user.name }}</p>
              <p class="text-[10px] text-slate-400 font-bold uppercase">{{ user.job }}</p>
            </div>
          </div>
          <p v-if="absentList.length === 0" class="text-center py-10 text-xs font-bold text-green-600 uppercase tracking-widest">Everyone is present! 🎉</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/api'

const metrics = ref({ total: 0, present: 0, absent: 0, onSite: 0 })
const presentList = ref([])
const absentList = ref([])

const stats = computed(() => [
  { label: 'Workforce', value: metrics.value.total },
  { label: 'Present Today', value: metrics.value.present },
  { label: 'Currently On-Site', value: metrics.value.onSite },
  { label: 'Absent', value: metrics.value.absent },
])

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return ''
  return new Date(dateTimeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const res = await api.get('/org/dashboard-metrics')
    metrics.value = res.data.metrics
    presentList.value = res.data.presentList
    absentList.value = res.data.absentList
  } catch (err) {
    console.error("Failed to load metrics")
  }
})
</script>