<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
    <!-- Sidebar Navigation -->
    <aside :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 flex flex-col z-20']">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <div v-if="sidebarOpen" class="flex items-center space-x-3">
          <ZapIcon class="w-6 h-6" style="color: #F2D479;" />
          <span class="text-xl font-black uppercase" style="color: #000000;">TrackTimi</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5" />
          <ChevronLeftIcon v-else class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all group"
          :class="[$route.path === item.path ? 'text-white shadow-xl' : 'text-slate-400 hover:bg-slate-900 hover:text-white']"
          :style="$route.path === item.path ? { backgroundColor: '#0284c7' } : {}"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <button @click="handleLogout" class="w-full p-3 rounded-xl text-xs font-bold uppercase text-white" style="background-color: #0284c7;">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
        <div>
          <h1 class="text-xl font-black uppercase" style="color: #000000;">System Health Monitoring</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="loadHealth" class="p-3 bg-slate-50 rounded-xl hover:bg-slate-100" style="color: #0284c7;">
            <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-8">
        <!-- Health Status Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white" style="background-color: #0284c7;">
                <CheckCircleIcon class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-black px-2 py-1 rounded uppercase text-white" style="background-color: #0284c7;">Healthy</span>
            </div>
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Server Status</p>
            <h3 class="text-2xl font-black mt-1" style="color: #000000;">{{ health.serverStatus || 'Checking...' }}</h3>
          </div>

          <div class="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white" style="background-color: #ea580c;">
                <HardDriveIcon class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-black px-2 py-1 rounded uppercase text-white" style="background-color: #ea580c;">Live</span>
            </div>
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Database Size</p>
            <h3 class="text-2xl font-black mt-1" style="color: #000000;">{{ health.dbSize || '0 MB' }}</h3>
          </div>

          <div class="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white" style="background-color: #0284c7;">
                <UsersIcon class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-black px-2 py-1 rounded uppercase text-white" style="background-color: #0284c7;">Active</span>
            </div>
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Active Users</p>
            <h3 class="text-2xl font-black mt-1" style="color: #000000;">{{ health.activeUsersToday || 0 }}</h3>
          </div>

          <div class="bg-white p-6 rounded-lg border border-slate-100 shadow-sm">
            <div class="flex justify-between items-start mb-4">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white" style="background-color: #ea580c;">
                <ClockIcon class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-black px-2 py-1 rounded uppercase text-white" style="background-color: #ea580c;">Running</span>
            </div>
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Server Uptime</p>
            <h3 class="text-2xl font-black mt-1" style="color: #000000;">{{ formatUptime }}</h3>
          </div>
        </div>

        <!-- Database Tables -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
            <h2 class="text-sm font-black uppercase mb-6 tracking-widest" style="color: #000000;">Database Tables</h2>
            <div class="space-y-4">
              <div v-for="table in health.tableStats" :key="table.table_name" class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p class="text-xs font-bold" style="color: #000000;">{{ table.table_name }}</p>
                  <p class="text-[10px]" style="color: #000000;">Records</p>
                </div>
                <div class="text-right">
                  <p class="text-lg font-black" style="color: #0284c7;">{{ table.record_count }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- System Events -->
          <div class="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
            <h2 class="text-sm font-black uppercase mb-6 tracking-widest" style="color: #000000;">System Events</h2>
            <div v-if="health.recentErrors && health.recentErrors.length > 0" class="space-y-3">
              <div v-for="error in health.recentErrors.slice(0, 5)" :key="error.Log_ID" class="p-3 rounded-lg border" style="background-color: #FEE2E2; border-color: #ef4444;">
                <p class="text-xs font-bold" style="color: #7f1d1d;">{{ error.Action }}</p>
                <p class="text-[10px]" style="color: #7f1d1d;">{{ formatDate(error.Created_at) }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8" style="color: #000000;">
              <p class="text-xs font-bold">No recent events</p>
              <p class="text-[10px]">System running smoothly ✓</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSystemHealth } from '@/services/superadminApi'
import {
  ZapIcon, MenuIcon, ChevronLeftIcon, RefreshCwIcon,
  CheckCircleIcon, HardDriveIcon, UsersIcon, ClockIcon,
  LayoutDashboardIcon, BuildingIcon, TrendingUpIcon, MapPinIcon,
  BriefcaseIcon, ActivityIcon, FileTextIcon, AlertCircleIcon,
  ShieldAlertIcon, SettingsIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const health = ref({
  serverStatus: 'Checking...',
  dbSize: '0 MB',
  activeUsersToday: 0,
  tableStats: [],
  recentErrors: [],
  uptime: 0
})

const formatUptime = computed(() => {
  const hours = Math.floor(health.value.uptime / 3600)
  const minutes = Math.floor((health.value.uptime % 3600) / 60)
  return `${hours}h ${minutes}m`
})

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Global Users', path: '/superadmin/users', icon: UsersIcon },
  { name: 'Attendance', path: '/superadmin/analytics', icon: TrendingUpIcon },
  { name: 'Geofences', path: '/superadmin/geofences', icon: MapPinIcon },
  { name: 'Departments', path: '/superadmin/departments', icon: BriefcaseIcon },
  { name: 'Shifts', path: '/superadmin/shifts', icon: ClockIcon },
  { name: 'Infrastructure', path: '/superadmin/monitoring', icon: ActivityIcon },
  { name: 'Reports', path: '/superadmin/reports', icon: FileTextIcon },
  { name: 'Alerts', path: '/superadmin/alerts', icon: AlertCircleIcon },
  { name: 'System Health', path: '/superadmin/health', icon: ShieldAlertIcon },
  { name: 'Audit Matrix', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'System Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

const loadHealth = async () => {
  loading.value = true
  try {
    const res = await getSystemHealth()
    if (res.data.success && res.data.health) {
      health.value = res.data.health
    }
  } catch (error) {
    console.error('Failed to load health:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString()
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  router.push('/superadmin/login')
}

onMounted(() => {
  loadHealth()
  // Auto-refresh every 30 seconds
  setInterval(loadHealth, 30000)
})
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

