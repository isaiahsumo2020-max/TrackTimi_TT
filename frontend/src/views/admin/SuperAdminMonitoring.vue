<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
    <!-- 1. SIDEBAR -->
    <aside :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white transition-all duration-500 flex flex-col z-30 shadow-2xl']">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between h-24">
        <div v-if="sidebarOpen" class="flex items-center space-x-3">
          <ZapIcon class="w-8 h-8 text-primary-500 fill-primary-500" />
          <span class="text-xl font-black tracking-tighter uppercase italic">Sentinel</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900 text-slate-400">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5" />
          <ChevronLeftIcon v-else class="w-5 h-5" />
        </button>
      </div>
      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all text-slate-400 hover:bg-slate-900 hover:text-white"
          active-class="bg-primary-600 text-white shadow-xl shadow-primary-900/40"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 2. MONITORING MAIN -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20 shrink-0">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Infrastructure Sentinel</h1>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-time Node Telemetry</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border border-green-100">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span class="text-[10px] font-black text-green-600 uppercase">All Systems Nominal</span>
          </div>
          <button @click="checkMonitoring" class="p-4 bg-slate-900 text-white rounded-lg hover:bg-primary-600 transition-all">
            <RefreshCwIcon :class="{'animate-spin': loading}" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-700">
        <!-- NODE KPIS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="stat in monitorStats" :key="stat.label" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-lg flex items-center justify-center bg-primary-50 text-primary-600 shadow-sm">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <span :class="stat.statusColor" class="px-3 py-1 rounded-full text-[8px] font-black uppercase border">{{ stat.status }}</span>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
            <h3 class="text-4xl font-black text-slate-900 tracking-tighter mt-1">{{ stat.value }}</h3>
          </div>
        </div>

        <!-- RESOURCE LOAD -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] shadow-3xl text-white relative overflow-hidden flex flex-col h-[400px]">
            <h3 class="text-xs font-black uppercase tracking-widest text-primary-400 mb-10 relative z-10">API Handshake Latency</h3>
            <div class="flex-1 flex items-end justify-between gap-2 relative z-10">
               <div v-for="(v, i) in latencyHistory" :key="i" class="flex-1 bg-primary-500/20 hover:bg-primary-500 transition-all rounded-t-lg" :style="{ height: v + '%' }"></div>
            </div>
            <div class="absolute -bottom-24 -right-24 w-80 h-80 bg-primary-600/10 rounded-full blur-[100px]"></div>
          </div>

          <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">Resource Matrix</h3>
            <div v-for="res in resources" :key="res.label" class="space-y-3">
              <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span class="text-slate-400">{{ res.label }}</span>
                <span class="text-slate-900">{{ res.value }}%</span>
              </div>
              <div class="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                <div class="h-full bg-primary-600 transition-all duration-1000" :style="{ width: res.value + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, LayoutDashboardIcon, BuildingIcon, 
  ActivityIcon, ShieldAlertIcon, RefreshCwIcon, SettingsIcon, LogOutIcon,
  ServerIcon, DatabaseIcon, CpuIcon, HardDriveIcon, CloudIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const responseTime = ref('24ms')
const latencyHistory = ref([20, 45, 30, 80, 40, 55, 35, 90, 40, 60])

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Monitoring', path: '/superadmin/monitoring', icon: ActivityIcon },
  { name: 'Audit Logs', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
]

const monitorStats = computed(() => [
  { label: 'Core API', value: 'Running', status: 'Healthy', statusColor: 'text-green-500 bg-green-50 border-green-100', icon: ServerIcon },
  { label: 'DB Master', value: 'SQLite3', status: 'Nominal', statusColor: 'text-primary-500 bg-primary-50 border-primary-100', icon: DatabaseIcon },
  { label: 'Latency', value: responseTime.value, status: 'Optimal', statusColor: 'text-amber-500 bg-amber-50 border-amber-100', icon: ZapIcon },
  { label: 'Cloud Store', value: 'Active', status: 'Online', statusColor: 'text-blue-500 bg-blue-50 border-blue-100', icon: CloudIcon },
])

const resources = ref([
  { label: 'CPU Cluster', value: 32 },
  { label: 'Memory', value: 58 },
  { label: 'Disk I/O', value: 14 }
])

const checkMonitoring = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const token = localStorage.getItem('superAdminToken')
    await axios.get('http://localhost:4000/api/superadmin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
    const duration = Date.now() - start
    responseTime.value = `${duration}ms`
    latencyHistory.value.push(Math.min(duration, 100))
    if (latencyHistory.value.length > 20) latencyHistory.value.shift()
  } finally { loading.value = false }
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/superadmin/login')
}

let ticker;
onMounted(() => {
  checkMonitoring()
  ticker = setInterval(checkMonitoring, 10000)
})
onBeforeUnmount(() => clearInterval(ticker))
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.shadow-3xl { box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25); }
</style>
