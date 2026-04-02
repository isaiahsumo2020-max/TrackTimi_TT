<template>
  <div class="space-y-8 max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-900 mb-1">My History</h1>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance & Hours</p>
      </div>
      <button @click="loadLogs" class="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase transition-all">🔄 Refresh</button>
    </div>

    <div class="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
      <table class="w-full text-left">
        <thead class="bg-slate-50/50 border-b border-slate-100">
          <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <th class="px-8 py-5">Date</th>
            <th class="px-8 py-5">Checked In</th>
            <th class="px-8 py-5">Checked Out</th>
            <th class="px-8 py-5">Status</th>
            <th class="px-8 py-5">Duration</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="log in logs" :key="log.Attend_ID" class="hover:bg-slate-50/50 transition-colors">
            <td class="px-8 py-5 text-sm font-bold text-slate-900">{{ formatDate(log.Check_in_time) }}</td>
            <td class="px-8 py-5 text-sm font-medium text-slate-600">{{ formatTime(log.Check_in_time) }}</td>
            <td class="px-8 py-5 text-sm font-medium text-slate-600">{{ log.Check_out_time ? formatTime(log.Check_out_time) : '---' }}</td>
            <td class="px-8 py-5">
              <span :class="log.Status_Name === 'Present' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'" class="px-3 py-1 rounded-full text-[9px] font-black uppercase">
                {{ log.Status_Name }}
              </span>
            </td>
            <td class="px-8 py-5 text-sm font-black text-slate-900">{{ log.duration ? log.duration.toFixed(1) + 'h' : '--' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'

const logs = ref([])
const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const formatTime = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const loadLogs = async () => {
  const res = await api.get('/attendance/my-history')
  logs.value = res.data
}

onMounted(loadLogs)
</script>