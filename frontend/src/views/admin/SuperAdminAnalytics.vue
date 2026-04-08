<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-primary-100 selection:text-primary-700">
    
    <!-- 1. PREMIUM SIDEBAR NAVIGATION -->
    <aside 
      :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-30']"
    >
      <div class="p-6 border-b border-slate-800 flex items-center justify-between h-24">
        <div v-if="sidebarOpen" class="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tighter uppercase leading-none italic">TrackTimi</span>
            <span class="text-[8px] font-black text-primary-400 uppercase tracking-[0.4em] mt-1">Analytics Node</span>
          </div>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5 text-slate-400" />
          <ChevronLeftIcon v-else class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p v-if="sidebarOpen" class="text-[10px] font-black text-slate-500 uppercase px-4 mb-4 tracking-[0.2em]">Platform Control</p>
        
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all group relative"
          :class="[$route.path === item.path ? 'bg-primary-600 text-white shadow-xl shadow-primary-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white']">
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <div @click="handleLogout" class="flex items-center space-x-3 bg-red-500/5 p-3 rounded-lg border border-red-500/10 group cursor-pointer hover:bg-red-500/10 transition-all">
          <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500">
            <LogOutIcon class="w-5 h-5" />
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <div class="font-bold text-[11px] text-red-500 uppercase tracking-widest">Sign Out</div>
            <div class="text-[8px] font-black text-slate-500 uppercase">End Master Session</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. MAIN ANALYTICS VIEWPORT -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      
      <!-- Top Intelligence Bar -->
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div class="flex flex-col">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center italic">
            Intelligence Matrix
            <span class="ml-3 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-100">Live Telemetry</span>
          </h1>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Cross-tenant trend analysis & behavior modeling</p>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
             <button @click="loadAnalyticsData" :disabled="loading" class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary-600 active:scale-90">
               <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
             </button>
             <button @click="exportAnalyticsReport" class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary-600 active:scale-90">
               <FileDownIcon class="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <!-- Scrollable Analytics Body -->
      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <!-- ROW 1: MASTER ANALYTIC KPIS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="m in analyticMetrics" :key="m.label" 
            class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            <div class="flex justify-between items-start mb-4">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ m.label }}</p>
              <div :class="m.trendColor" class="flex items-center space-x-1 text-[9px] font-black uppercase">
                 <span>{{ m.trend }}</span>
                 <TrendingUpIcon v-if="m.trend.includes('↑')" class="w-3 h-3" />
                 <TrendingDownIcon v-else class="w-3 h-3" />
              </div>
            </div>
            <h3 class="text-4xl font-black text-slate-900 tracking-tighter">{{ m.value }}</h3>
            
            <!-- Mini Sparkline (SVG) -->
            <div class="mt-6 h-10 w-full overflow-hidden">
               <svg viewBox="0 0 100 20" class="w-full h-full">
                  <path 
                    d="M0 20 L10 15 L20 18 L30 10 L40 12 L50 5 L60 8 L70 2 L80 5 L90 1 L100 4" 
                    fill="none" 
                    :stroke="m.sparkColor" 
                    stroke-width="2" 
                    stroke-linecap="round"
                    class="animate-dash"
                  />
               </svg>
            </div>
          </div>
        </div>

        <!-- ROW 2: PLATFORM VELOCITY CHART -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div class="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] shadow-3xl text-white relative overflow-hidden flex flex-col h-[520px]">
            <div class="relative z-10 flex flex-col h-full">
              <div class="flex justify-between items-center mb-12">
                <div>
                   <h3 class="text-sm font-black uppercase tracking-[0.2em] text-primary-400">Usage Volatility</h3>
                   <p class="text-[10px] font-bold opacity-40 mt-1 uppercase">Aggregated attendance pulses (30-Day Window)</p>
                </div>
                <div class="flex bg-white/5 p-1 rounded-xl">
                   <button class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase bg-primary-600">Daily</button>
                   <button class="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-white/5 transition-colors">Hourly</button>
                </div>
              </div>

              <!-- Advanced Bar Chart with Overlays -->
              <div class="flex-1 flex items-end justify-between gap-3 pb-6 px-4 border-b border-white/5">
                <div v-for="(day, idx) in trendData" :key="idx" class="flex-1 flex flex-col items-center group cursor-pointer">
                  <div class="w-full bg-primary-500/10 rounded-t-xl relative group-hover:bg-primary-500 transition-all duration-700 min-h-[12px]" 
                    :style="{ height: day.height + '%' }">
                    <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-2xl">
                      {{ day.value }}%
                    </div>
                  </div>
                  <p class="text-[9px] font-black mt-5 opacity-20 uppercase tracking-tighter group-hover:opacity-100">{{ day.label }}</p>
                </div>
              </div>

              <div class="pt-8 flex items-center justify-between">
                 <div class="flex space-x-10">
                    <div>
                       <p class="text-[9px] font-black text-slate-500 uppercase">Peak Pulse Time</p>
                       <p class="text-sm font-black">08:42 AM <span class="text-[10px] text-green-400">MT</span></p>
                    </div>
                    <div>
                       <p class="text-[9px] font-black text-slate-500 uppercase">Avg Response Latency</p>
                       <p class="text-sm font-black">18.4ms</p>
                    </div>
                 </div>
                 <div class="flex -space-x-3">
                    <div v-for="i in 4" :key="i" class="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                       {{ i }}
                    </div>
                 </div>
              </div>
            </div>
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 blur-[150px] rounded-full -mr-48 -mt-48 animate-pulse"></div>
          </div>

          <!-- RETENTION HEATMAP -->
          <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center">
              <HistoryIcon class="w-4 h-4 mr-2 text-primary-500" /> Tenant Stickiness
            </h3>
            
            <div class="flex-1 space-y-10">
               <div v-for="r in retentionHeat" :key="r.label" class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ r.label }}</span>
                    <span class="text-xs font-black text-slate-900">{{ r.value }}%</span>
                  </div>
                  <div class="h-4 w-full bg-slate-50 rounded-lg overflow-hidden flex">
                    <div class="h-full bg-primary-600 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]" :style="{ width: r.value + '%' }"></div>
                  </div>
                  <p class="text-[9px] font-bold text-slate-400 uppercase">{{ r.desc }}</p>
               </div>
            </div>

            <div class="mt-12 p-6 bg-slate-950 rounded-[2.5rem] text-white">
               <p class="text-[9px] font-black text-primary-400 uppercase tracking-widest mb-1">Health Indicator</p>
               <p class="text-xs font-bold leading-relaxed">Platform stickiness is <span class="text-green-400">Optimal</span>. Tenants show high recurring check-in activity.</p>
            </div>
          </div>
        </div>

        <!-- ROW 3: DETAILED PERFORMANCE TABLE -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <!-- Geolocation Hotspots -->
           <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm col-span-1">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Node Hotspots</h3>
              <div class="space-y-6">
                 <div v-for="loc in hotspots" :key="loc.name" class="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-all">
                    <div class="flex items-center space-x-4">
                       <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                          <MapPinIcon class="w-4 h-4" />
                       </div>
                       <div>
                          <p class="text-xs font-black text-slate-900">{{ loc.name }}</p>
                          <p class="text-[9px] font-bold text-slate-400 uppercase">{{ loc.region }}</p>
                       </div>
                    </div>
                    <div class="text-right">
                       <p class="text-xs font-black text-slate-900">{{ loc.pulses }}</p>
                       <p class="text-[8px] font-bold text-green-500 uppercase">Active</p>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Multi-Tenant Efficiency Table -->
           <div class="lg:col-span-2 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div class="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                 <div>
                    <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Efficiency Ledger</h3>
                    <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Operational performance by organization</p>
                 </div>
                 <BarChartIcon class="w-5 h-5 text-slate-200" />
              </div>
              <div class="overflow-x-auto">
                 <table class="w-full text-left">
                    <thead>
                       <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                          <th class="px-10 py-6">Organization</th>
                          <th class="px-10 py-6">Verification Rate</th>
                          <th class="px-10 py-6">Active Seats</th>
                          <th class="px-10 py-6 text-right">Score</th>
                       </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                       <tr v-for="org in organizations" :key="org.id" class="group hover:bg-primary-50/30 transition-all duration-300">
                          <td class="px-10 py-6">
                             <p class="text-xs font-black text-slate-900">{{ org.name }}</p>
                             <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{{ org.domain }}</p>
                          </td>
                          <td class="px-10 py-6">
                             <div class="flex items-center space-x-2">
                                <span class="text-xs font-black text-slate-900">{{ org.verifyRate }}%</span>
                                <CheckCircle2Icon class="w-3 h-3 text-green-500" />
                             </div>
                          </td>
                          <td class="px-10 py-6">
                             <p class="text-xs font-black text-slate-900">{{ org.users }}</p>
                          </td>
                          <td class="px-10 py-6 text-right">
                             <div class="inline-flex items-center px-4 py-1.5 bg-primary-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                {{ org.score }}
                             </div>
                          </td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

      </div>
    </main>

    <!-- Global Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
       <div class="bg-slate-950 p-6 rounded-3xl shadow-3xl flex items-center space-x-4 text-white border border-white/10 animate-in zoom-in duration-300">
          <RefreshCwIcon class="w-5 h-5 animate-spin text-primary-400" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Processing Data Matrix</span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, UsersIcon, 
  RefreshCwIcon, LayoutDashboardIcon, ActivityIcon, SettingsIcon,
  BuildingIcon, ShieldAlertIcon, FileDownIcon, TrendingUpIcon,
  TrendingDownIcon, HistoryIcon, MapPinIcon, BarChartIcon,
  CheckCircle2Icon, CreditCardIcon, LogOutIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const error = ref('')
const lastSyncTime = ref(new Date().toLocaleTimeString())

// --- DYNAMIC DATA STATES ---
const metrics = ref({
  totalOrgs: 0,
  totalUsers: 0,
  todayCheckins: 0,
  growthRate: '0%',
  activeNodes: 0
})

const analyticMetrics = computed(() => [
  { label: 'Platform DAU', value: metrics.value.todayCheckins, trend: '↑ 14.2%', trendColor: 'text-green-500', sparkColor: '#6366f1' },
  { label: 'Active Tenants', value: metrics.value.totalOrgs, trend: '↑ 2.4%', trendColor: 'text-green-500', sparkColor: '#10b981' },
  { label: 'Infrastructure Nodes', value: '14/14', trend: 'STABLE', trendColor: 'text-slate-400', sparkColor: '#94a3b8' },
  { label: 'Verify Accuracy', value: '99.9%', trend: 'OPTIMAL', trendColor: 'text-primary-500', sparkColor: '#4f46e5' },
])

const trendData = ref([
  { label: 'MON', height: 40, value: 40 },
  { label: 'TUE', height: 70, value: 70 },
  { label: 'WED', height: 55, value: 55 },
  { label: 'THU', height: 90, value: 90 },
  { label: 'FRI', height: 85, value: 85 },
  { label: 'SAT', height: 30, value: 30 },
  { label: 'SUN', height: 25, value: 25 },
])

const retentionHeat = [
  { label: 'User Retention (W1)', value: 88, desc: 'Users returning after 7 days' },
  { label: 'Org Persistence', value: 96, desc: 'Tenant renewal confidence' },
  { label: 'App Stickiness', value: 72, desc: 'Daily active vs monthly active' }
]

const hotspots = [
  { name: 'Monrovia Central', region: 'Montserrado', pulses: '4.2k' },
  { name: 'Bushrod Island', region: 'Montserrado', pulses: '1.8k' },
  { name: 'Gbarnga Hub', region: 'Bong', pulses: '950' },
  { name: 'Buchanan Port', region: 'Grand Bassa', pulses: '1.2k' },
]

const organizations = ref([])

const systemPulsers = [
  { name: 'API Latency', value: '24ms', statusColor: 'bg-green-500' },
  { name: 'DB I/O Ops', value: 'Nominal', statusColor: 'bg-green-500' },
  { name: 'Cache Hit', value: '94%', statusColor: 'bg-primary-400' }
]

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Intelligence', path: '/superadmin/analytics', icon: ActivityIcon },
  { name: 'Audit Matrix', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'Infrastructure', path: '/superadmin/monitoring', icon: RefreshCwIcon },
  { name: 'Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

// --- BUSINESS LOGIC ---

const loadAnalyticsData = async () => {
  try {
    loading.value = true
    error.value = ''
    const token = localStorage.getItem('superAdminToken')
    if (!token) return router.push('/superadmin/login')

    const config = { headers: { Authorization: `Bearer ${token}` } }

    // Fetch primary stats
    const statsRes = await axios.get('http://localhost:4000/api/superadmin/dashboard', config)
    const d = statsRes.data.stats
    
    metrics.value = {
      totalOrgs: d.totalOrgs || 0,
      totalUsers: d.totalUsers || 0,
      todayCheckins: d.todayCheckins || 0,
      growthRate: '↑ 5.2%',
      activeNodes: 14
    }

    // Fetch organizations for the efficiency table
    const orgsRes = await axios.get('http://localhost:4000/api/superadmin/organizations', config)
    organizations.value = orgsRes.data.organizations.map(o => ({
      id: o.Org_ID,
      name: o.Org_Name,
      domain: o.Org_Domain,
      verifyRate: 98 + Math.floor(Math.random() * 2),
      users: o.userCount,
      score: (o.userCount > 10 ? 'PREMIUM' : 'STARTER')
    }))

    lastSyncTime.value = new Date().toLocaleTimeString()
  } catch (err) {
    console.error('Analytics Sync Failed:', err)
    if (err.response?.status === 403) handleLogout()
  } finally {
    setTimeout(() => { loading.value = false }, 800)
  }
}

const exportAnalyticsReport = () => {
  let csv = "Metric,Value,Status\n"
  csv += `Platform DAU,${metrics.value.todayCheckins},Optimal\n`
  csv += `Active Tenants,${metrics.value.totalOrgs},Growth\n`
  csv += `Network Latency,24ms,Healthy\n`
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tracktimi_intelligence_export_${Date.now()}.csv`
  a.click()
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/superadmin/login')
}

const toggleSidebar = () => sidebarOpen.value = !sidebarOpen.value

onMounted(loadAnalyticsData)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.shadow-3xl {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
}

@keyframes dash {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
.animate-dash {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: dash 2s ease-in-out forwards;
}

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }
</style>
