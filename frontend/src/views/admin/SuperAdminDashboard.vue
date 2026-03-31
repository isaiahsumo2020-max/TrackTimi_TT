<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans">
    
    <!-- 1. NAVIGATION SIDEBAR (SaaS Identity) -->
    <aside :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-20']">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <div v-if="sidebarOpen" class="flex items-center space-x-3 animate-in fade-in">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <span class="text-xl font-black tracking-tighter uppercase">TrackTimi<span class="text-orange-500">.</span></span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5" />
          <ChevronLeftIcon v-else class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        <p v-if="sidebarOpen" class="text-[10px] font-black text-slate-500 uppercase px-4 mb-4 tracking-[0.2em]">Platform Control</p>
        
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all group"
          :class="[$route.path === item.path ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white']"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- SuperAdmin Profile -->
      <div class="p-6 border-t border-slate-800">
        <div class="flex items-center space-x-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-black shadow-lg">SA</div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <div class="font-bold text-xs truncate">TrackTimi Admin</div>
            <div class="text-[9px] font-black text-orange-400 uppercase">Master Control</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. MAIN VIEWPORT -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top Bar -->
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tight">SuperAdmin Command Center</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="refreshData" class="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-400 hover:text-orange-500">
            <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
          </button>
          <button @click="handleLogout" class="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">
            Terminate Session
          </button>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
        
        <!-- Metrics Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="stat in stats" :key="stat.label" class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-4">
              <div :class="stat.bgColor" class="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <span class="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase">Live</span>
            </div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
            <h3 class="text-4xl font-black text-slate-900 tracking-tighter mt-1">{{ stat.value }}</h3>
          </div>
        </div>

        <!-- Middle Section: Org List & Platform Health -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Recent Organizations (Live Data) -->
          <div class="lg:col-span-2 bg-white p-10 rounded-xl border border-slate-100 shadow-sm space-y-8">
            <div class="flex justify-between items-center">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Network Tenants</h3>
              <router-link to="/superadmin/organizations" class="text-[10px] font-black text-orange-500 uppercase border-b-2 border-orange-50">View Registry</router-link>
            </div>
            
            <div class="overflow-hidden rounded-xl border border-slate-50">
              <table class="w-full text-left">
                <thead class="bg-slate-50/50">
                  <tr class="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th class="px-6 py-4">Organization</th>
                    <th class="px-6 py-4">Domain</th>
                    <th class="px-6 py-4">Users</th>
                    <th class="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                  <tr v-for="org in organizationsList.slice(0, 5)" :key="org.Org_ID" class="hover:bg-slate-50/50 transition-colors">
                    <td class="px-6 py-4">
                      <p class="text-xs font-black text-slate-900">{{ org.Org_Name }}</p>
                      <p class="text-[9px] text-slate-400 font-bold uppercase">{{ formatDate(org.Created_at) }}</p>
                    </td>
                    <td class="px-6 py-4 font-mono text-[10px] text-orange-500 font-bold tracking-tighter">
                      {{ org.Org_Domain }}.tracktimi.com
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-xs font-black text-slate-900">{{ org.userCount }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <span class="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase">Provisioned</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Platform Load Health -->
          <div class="bg-slate-900 p-10 rounded-xl shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
            <div class="relative z-10">
              <h3 class="text-xs font-black uppercase tracking-widest opacity-50 mb-8 text-orange-400">Platform Saturation</h3>
              <div class="space-y-8">
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-[10px] font-bold uppercase opacity-60">Global Check-in Density</span>
                    <span class="text-[10px] font-black text-orange-400">{{ densityScore }}%</span>
                  </div>
                  <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-orange-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" :style="{ width: densityScore + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-[10px] font-bold uppercase opacity-60">Server Uptime</span>
                    <span class="text-[10px] font-black text-green-400">99.9%</span>
                  </div>
                  <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500" style="width: 99.9%"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="pt-10 border-t border-white/5 relative z-10">
              <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Database Master</p>
              <p class="text-xs font-bold text-white">tracktimi_production.db</p>
            </div>
            <div class="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full"></div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, BuildingIcon, 
  UsersIcon, ClockIcon, BarChart3Icon, ShieldAlertIcon,
  RefreshCwIcon, LayoutDashboardIcon, ActivityIcon, SettingsIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)

// Data State
const metrics = ref({ totalOrgs: 0, totalUsers: 0, todayCheckins: 0, totalDepts: 0 })
const organizationsList = ref([])
const densityScore = computed(() => {
  if (metrics.value.totalUsers === 0) return 0
  return Math.round((metrics.value.todayCheckins / metrics.value.totalUsers) * 100)
})

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Global Users', path: '/superadmin/users', icon: UsersIcon },
  { name: 'Infrastructure', path: '/superadmin/monitoring', icon: ActivityIcon },
  { name: 'Audit Matrix', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'System Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

const stats = computed(() => [
  { label: 'Network Tenants', value: metrics.value.totalOrgs, icon: BuildingIcon, bgColor: 'bg-orange-500 shadow-orange-100' },
  { label: 'Global Workforce', value: metrics.value.totalUsers, icon: UsersIcon, bgColor: 'bg-slate-900 shadow-slate-200' },
  { label: 'Pulses Today', value: metrics.value.todayCheckins, icon: ClockIcon, bgColor: 'bg-amber-500 shadow-amber-100' },
  { label: 'Global Units', value: metrics.value.totalDepts, icon: BarChart3Icon, bgColor: 'bg-green-500 shadow-green-100' },
])

const refreshData = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    const config = { headers: { Authorization: `Bearer ${token}` } }
    
    // Fetch Live Dashboard Stats
    const statsRes = await axios.get('http://localhost:4000/api/superadmin/dashboard', config)
    metrics.value = statsRes.data.stats

    // Fetch Recent Organizations
    const orgsRes = await axios.get('http://localhost:4000/api/superadmin/organizations', config)
    organizationsList.value = orgsRes.data.organizations || []

  } catch (error) {
    console.error('SuperAdmin Data Sync Failed:', error)
    if (error.response?.status === 403 || error.response?.status === 401) {
      handleLogout()
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'Pending'
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

onMounted(refreshData)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>