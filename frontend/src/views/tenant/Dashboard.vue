<template>
  <div class="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    <!-- 1. Header: Dynamic Org Name & Health Score -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Intelligence Command</p>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">
          {{ orgDisplayName }} <span class="font-light text-slate-400">Overview</span>
        </h1>
      </div>
      
      <div class="flex items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div class="px-5 py-2 text-center border-r border-slate-100">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Daily Health</p>
          <p class="text-sm font-black" :class="healthColor">{{ healthScore }}%</p>
        </div>
        <div class="px-5 py-2 text-center">
          <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">System Time</p>
          <p class="text-sm font-black text-slate-900 uppercase">{{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- 2. Interactive Metric Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="stat in stats" :key="stat.label" 
        class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group cursor-default">
        <div class="flex items-center justify-between mb-4">
          <div :class="stat.color" class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="flex flex-col items-end">
            <span class="text-[8px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Live</span>
          </div>
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{{ stat.label }}</p>
        <div class="flex items-baseline space-x-2 mt-1">
          <h3 class="text-4xl font-black text-slate-900 tracking-tighter">{{ stat.value }}</h3>
          <span class="text-xs font-bold text-slate-300">/ {{ metrics.total }}</span>
        </div>
      </div>
    </div>

    <!-- 3. Mid Section: 7-Day Trend & Live Pulse -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- 7-Day Trend Card -->
      <div class="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col h-[480px]">
        <div class="relative z-10 flex flex-col h-full">
          <div class="flex justify-between items-center mb-10">
            <div>
              <h3 class="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">7-Day Attendance Velocity</h3>
              <p class="text-[10px] font-bold opacity-40 mt-1 uppercase">Aggregate workforce activity</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span class="text-[10px] font-bold opacity-60">Avg: {{ avgTrend }}%</span>
            </div>
          </div>
          <div class="flex items-end justify-between flex-1 gap-4">
            <div v-for="day in trendData" :key="day.date" class="flex-1 flex flex-col items-center group">
              <div class="w-full bg-indigo-500/10 rounded-t-xl relative group-hover:bg-indigo-500 transition-all duration-500 min-h-[4px]" 
                :style="{ height: metrics.total > 0 ? (day.count / metrics.total * 100) + '%' : '10%' }">
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-2 py-1 rounded-lg text-[9px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                  {{ day.count }}
                </div>
              </div>
              <p class="text-[9px] font-black mt-4 opacity-30 uppercase group-hover:opacity-100 transition-opacity">{{ day.label }}</p>
            </div>
          </div>
        </div>
        <div class="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      </div>

      <!-- Live Pulse Feed -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col h-[480px]">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
            <ZapIcon class="w-4 h-4 mr-2 text-amber-500 fill-amber-500" />
            Activity Pulse
          </h3>
          <div class="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
        </div>
        
        <div class="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          <TransitionGroup name="list">
            <div v-for="(log, index) in activityLogs" :key="index" class="flex items-start space-x-3 group">
              <div :class="log.type === 'attendance' ? 'bg-green-500 shadow-green-100' : 'bg-indigo-500 shadow-indigo-100'" 
                   class="w-2 h-2 rounded-full mt-1.5 shrink-0 shadow-lg"></div>
              <div class="flex-1">
                <p class="text-xs font-black text-slate-800 leading-tight">
                  {{ log.actor }} <span class="font-medium text-slate-400">{{ log.action }}</span>
                </p>
                <p class="text-[9px] font-bold text-slate-300 uppercase mt-1">{{ formatLogTime(log.timestamp) }}</p>
              </div>
            </div>
          </TransitionGroup>
          <div v-if="activityLogs.length === 0" class="text-center py-20 opacity-20 italic text-xs">Awaiting first pulse...</div>
        </div>
      </div>
    </div>

    <!-- 4. Upper Table Section: Presence, Absence & Departments -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Present Members -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
          <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div> Present Personnel
        </h3>
        <div class="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="user in presentList" :key="user.name" class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all">
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-[10px]">{{ user.name[0] }}</div>
              <div>
                <p class="text-xs font-black text-slate-900 mb-0.5">{{ user.name }}</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{{ user.job }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-[9px] font-black text-indigo-600">{{ user.isSystemActive ? 'ONLINE' : formatTimeOnly(user.checkIn) }}</p>
              <p class="text-[7px] font-black text-slate-300 uppercase">{{ user.isSystemActive ? 'SYSTEM ADMIN' : 'Verified' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Off-Duty Members -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
          <div class="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2"></div> Not In Today
        </h3>
        <div class="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="user in absentList" :key="user.name" class="flex items-center space-x-3 p-4 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <div class="w-9 h-9 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs">{{ user.name[0] }}</div>
            <div>
              <p class="text-xs font-bold text-slate-900 mb-0.5">{{ user.name }}</p>
              <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{{ user.job }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Distribution -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Department Load</h3>
        <div class="space-y-7 mt-4">
          <div v-for="dept in departments" :key="dept.name" class="space-y-3">
            <div class="flex justify-between items-center px-1">
              <span class="text-[10px] font-black text-slate-500 uppercase tracking-tight">{{ dept.name }}</span>
              <span class="text-[10px] font-black text-slate-900">{{ dept.staff_count }}</span>
            </div>
            <div class="h-2 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
              <div class="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                :style="{ width: metrics.total > 0 ? (dept.staff_count / metrics.total * 100) + '%' : '0%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. ULTIMATE ATTENDANCE LEDGER (Historical Tracking) -->
    <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <HistoryIcon class="w-4 h-4 mr-2 text-indigo-600" />
            Attendance Ledger
          </h3>
          <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Audit logs & complete history</p>
        </div>
        
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <SearchIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input v-model="ledgerSearch" placeholder="Filter by name..." class="pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none text-[11px] font-bold focus:ring-2 focus:ring-indigo-50 w-48 outline-none" />
          </div>
          <input type="date" v-model="ledgerDate" class="px-4 py-3 bg-slate-50 rounded-xl border-none text-[11px] font-bold focus:ring-2 focus:ring-indigo-50 outline-none" />
          <button @click="downloadCSV" class="px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center">
            <FileDownIcon class="w-3.5 h-3.5 mr-2" />
            Export Ledger
          </button>
        </div>
      </div>

      <div class="overflow-hidden rounded-[2rem] border border-slate-50">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th class="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Employee</th>
              <th class="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Session Date</th>
              <th class="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Time In/Out</th>
              <th class="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Duration</th>
              <th class="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="log in filteredLedger" :key="log.Attend_ID" class="group hover:bg-slate-50/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-colors">{{ log.name[0] }}</div>
                  <div>
                    <p class="text-[11px] font-black text-slate-900">{{ log.name }}</p>
                    <p class="text-[8px] font-bold text-slate-400 uppercase">{{ log.job }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center text-[11px] font-bold text-slate-500">{{ formatDateOnly(log.checkIn) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-black text-slate-900">{{ formatTimeOnly(log.checkIn) }}</span>
                  <span class="text-slate-300">→</span>
                  <span class="text-[10px] font-black" :class="log.checkOut ? 'text-slate-900' : 'text-green-500 animate-pulse'">{{ log.checkOut ? formatTimeOnly(log.checkOut) : 'ACTIVE' }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-[11px] font-black text-slate-900">{{ calculateHours(log.checkIn, log.checkOut) }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="log.checkOut ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600'" class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase">
                  {{ log.checkOut ? 'Shift Completed' : 'In Progress' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredLedger.length === 0" class="py-20 text-center">
          <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">No historical records found for this criteria</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import api from '@/utils/api'
import { useRoute } from 'vue-router'
import { 
  UsersIcon, CheckCircleIcon, ClockIcon, XCircleIcon, 
  ZapIcon, HistoryIcon, SearchIcon, FileDownIcon 
} from 'lucide-vue-next'

const route = useRoute()
const orgSlug = computed(() => route.params.orgSlug)
const currentTime = ref(new Date().toLocaleTimeString())

// Ledger State
const ledgerSearch = ref('')
const ledgerDate = ref('')

// Branding helper: Pull Org Name from localStorage
const orgDisplayName = computed(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  return user?.orgName || 'Workspace'
})

// Data State
const metrics = ref({ total: 0, present: 0, absent: 0, onSite: 0 })
const presentList = ref([])
const absentList = ref([])
const departments = ref([])
const trendData = ref([])
const activityLogs = ref([])

// Ledger Filtering Logic
const filteredLedger = computed(() => {
  return presentList.value.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(ledgerSearch.value.toLowerCase())
    const matchesDate = ledgerDate.value ? log.checkIn.startsWith(ledgerDate.value) : true
    return matchesSearch && matchesDate
  })
})

const downloadCSV = () => {
  let csvContent = "data:text/csv;charset=utf-8,Employee,Job,Check-In,Check-Out,Duration\n"
  filteredLedger.value.forEach(row => {
    const duration = calculateHours(row.checkIn, row.checkOut)
    csvContent += `"${row.name}","${row.job}","${row.checkIn}","${row.checkOut || 'ACTIVE'}","${duration}"\n`
  })
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `attendance_ledger_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
}

const calculateHours = (start, end) => {
  if (!start) return '--'
  if (!end) return '--'
  const diff = (new Date(end) - new Date(start)) / 1000 / 60 / 60
  return diff.toFixed(1) + 'h'
}

// Computed Logic
const healthScore = computed(() => {
  if (metrics.value.total === 0) return 0
  return Math.round((metrics.value.present / metrics.value.total) * 100)
})

const healthColor = computed(() => {
  if (healthScore.value > 80) return 'text-green-600'
  if (healthScore.value > 50) return 'text-amber-500'
  return 'text-red-500'
})

const avgTrend = computed(() => {
  if (trendData.value.length === 0) return 0
  const total = trendData.value.reduce((acc, curr) => acc + curr.count, 0)
  return Math.round((total / (metrics.value.total * 7)) * 100) || 0
})

const stats = computed(() => [
  { label: 'Workforce', value: metrics.value.total, icon: UsersIcon, color: 'bg-indigo-600 shadow-indigo-100' },
  { label: 'Present Today', value: metrics.value.present, icon: CheckCircleIcon, color: 'bg-green-500 shadow-green-100' },
  { label: 'Currently On-Site', value: metrics.value.onSite, icon: ClockIcon, color: 'bg-orange-500 shadow-orange-100' },
  { label: 'Absent Today', value: metrics.value.absent, icon: XCircleIcon, color: 'bg-slate-400 shadow-slate-100' },
])

// Utility: Fill missing days in 7-day trend
const processTrend = (rawTrend) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const entry = rawTrend.find(t => t.day === dateStr)
    last7Days.push({
      label: days[d.getDay()],
      count: entry ? entry.count : 0,
      date: dateStr
    })
  }
  return last7Days
}

const refreshData = async () => {
  try {
    const res = await api.get('/org/dashboard-metrics')
    const data = res.data
    
    // Get currently logged in Admin from LocalStorage
    const currentUser = JSON.parse(localStorage.getItem('user'))
    
    let liveMetrics = data.metrics
    let livePresent = data.presentList
    let liveAbsent = data.absentList

    // Logic: If Admin is in Absent list, move them to Present
    if (currentUser && currentUser.role === 'Admin') {
      const adminInAbsentIndex = liveAbsent.findIndex(u => u.name.includes(currentUser.firstName))
      
      if (adminInAbsentIndex !== -1) {
        // Remove Admin from Absent
        const adminData = liveAbsent.splice(adminInAbsentIndex, 1)[0]
        
        // Add Admin to Present (with a special flag for display)
        livePresent.unshift({
          ...adminData,
          checkIn: new Date().toISOString(),
          isSystemActive: true // Flag to show Admin is online
        })

        // Recalculate numbers
        liveMetrics.present += 1
        liveMetrics.absent -= 1
        liveMetrics.onSite += 1
      }
    }

    metrics.value = liveMetrics
    presentList.value = livePresent
    absentList.value = liveAbsent
    
    departments.value = data.departments
    activityLogs.value = data.activityLogs || []
    trendData.value = processTrend(data.trend || [])
    
  } catch (err) {
    console.error("Dashboard Refresh Interrupted:", err)
  }
}

// Time Formatters
const formatTimeOnly = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'
const formatDateOnly = (ts) => ts ? new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''
const formatLogTime = (ts) => {
  if (!ts) return ''
  const date = new Date(ts)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / 60000)
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

let dataTimer;
let clockTimer;

onMounted(() => {
  refreshData()
  dataTimer = setInterval(refreshData, 20000) 
  clockTimer = setInterval(() => { currentTime.value = new Date().toLocaleTimeString() }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(dataTimer)
  clearInterval(clockTimer)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
</style>