<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-primary-100 selection:text-primary-700">
    
    <!-- 1. DYNAMIC NAVIGATION SIDEBAR (Master Consistency) -->
    <aside 
      :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-40']"
    >
      <div class="p-6 border-b border-slate-800 flex items-center justify-between h-24">
        <div v-if="sidebarOpen" class="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tighter uppercase leading-none italic">TrackTimi</span>
            <span class="text-[8px] font-black text-primary-400 uppercase tracking-[0.4em] mt-1">Financial Node</span>
          </div>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all active:scale-90">
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
            <div class="font-bold text-[11px] text-red-500 uppercase tracking-widest">Terminate</div>
            <div class="text-[8px] font-black text-slate-500 uppercase">Master Session</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. MAIN REVENUE WORKSPACE -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      
      <!-- Top Intelligence Bar -->
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div class="flex flex-col">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center italic uppercase">
            Revenue Operations
            <span class="ml-3 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100">Live Yield</span>
          </h1>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">SaaS Recurring Revenue & Subscription Matrix</p>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
             <button @click="loadRevenueData" :disabled="loading" class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary-600 active:scale-90">
               <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
             </button>
             <button @click="exportGlobalLedger" class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary-600 active:scale-90">
               <FileDownIcon class="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <!-- Scrollable Revenue Body -->
      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <!-- ROW 1: REVENUE KPIS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="m in revenueMetrics" :key="m.label" 
            class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
            <div class="flex justify-between items-start mb-6 relative z-10">
              <div :class="m.bgColor" class="w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-xl">
                <component :is="m.icon" class="w-7 h-7" />
              </div>
              <div class="flex flex-col items-end">
                <span class="text-[10px] font-black text-green-500 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-widest">Active</span>
              </div>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ m.label }}</p>
              <h3 class="text-4xl font-black text-slate-900 tracking-tighter mt-1">{{ m.value }}</h3>
              <p :class="m.trendColor" class="text-[9px] font-black uppercase mt-2">{{ m.trend }}</p>
            </div>
          </div>
        </div>

        <!-- ROW 2: REVENUE TRENDS -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Subscription Plan Distribution -->
          <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center">
              <CreditCardIcon class="w-5 h-5 mr-2 text-primary-500" /> Plan Distribution
            </h3>
            
            <div class="flex-1 space-y-8">
               <div v-for="plan in planDistribution" :key="plan.name" class="space-y-3">
                  <div class="flex justify-between items-center px-1">
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ plan.name }}</span>
                    <span class="text-xs font-black text-slate-900">{{ plan.count }} <span class="text-slate-300 font-bold">Orgs</span></span>
                  </div>
                  <div class="h-4 w-full bg-slate-50 rounded-xl overflow-hidden flex p-1 border border-slate-100">
                    <div 
                      class="h-full rounded-lg bg-primary-600 transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                      :style="{ width: (plan.count / metrics.organizations * 100) + '%' }"
                    ></div>
                  </div>
               </div>
            </div>

            <div class="mt-12 p-6 bg-primary-600 rounded-[2.5rem] text-white relative overflow-hidden group">
               <div class="relative z-10">
                 <p class="text-[9px] font-black text-primary-200 uppercase tracking-widest mb-1">Portfolio Value</p>
                 <p class="text-2xl font-black leading-tight">Projected Annual Yield: <br/> $149,760.00</p>
               </div>
               <TrendingUpIcon class="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          </div>

          <!-- Revenue Velocity (CSS Chart) -->
          <div class="lg:col-span-2 bg-slate-900 p-10 rounded-[3.5rem] shadow-3xl text-white relative overflow-hidden flex flex-col h-[480px]">
            <div class="relative z-10 flex flex-col h-full">
              <div class="flex justify-between items-center mb-12">
                <div>
                   <h3 class="text-sm font-black uppercase tracking-[0.2em] text-primary-400">Monthly Yield Velocity</h3>
                   <p class="text-[10px] font-bold opacity-40 mt-1 uppercase">Platform Gross Revenue (6 Month Window)</p>
                </div>
                <BarChart3Icon class="w-6 h-6 text-primary-500 opacity-50" />
              </div>

              <!-- Live Bar Chart -->
              <div class="flex-1 flex items-end justify-between gap-6 pb-6 px-4">
                <div v-for="(v, idx) in revenueTrend" :key="idx" class="flex-1 flex flex-col items-center group cursor-pointer">
                  <div class="w-full bg-white/5 rounded-t-2xl relative group-hover:bg-primary-500 transition-all duration-700 min-h-[10px]" 
                    :style="{ height: v.height + '%' }">
                    <div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-black opacity-0 group-hover:opacity-100 transition-all shadow-2xl scale-75 group-hover:scale-100">
                      ${{ v.value }}k
                    </div>
                  </div>
                  <p class="text-[10px] font-black mt-5 opacity-30 uppercase tracking-tighter group-hover:opacity-100">{{ v.month }}</p>
                </div>
              </div>
            </div>
            <div class="absolute top-0 right-0 w-80 h-80 bg-primary-600/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
          </div>
        </div>

        <!-- ROW 3: DETAILED BILLING LEDGER -->
        <div class="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
             <div>
               <h3 class="text-lg font-black text-slate-900 tracking-tight italic">Financial Ledger</h3>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Cross-tenant billing status and plan allocation</p>
             </div>
             <div class="relative group">
                <SearchIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
                <input v-model="orgSearch" placeholder="Search ledger by tenant name..." 
                  class="pl-14 pr-6 py-4 bg-white border-none rounded-lg text-[11px] font-bold shadow-sm w-80 focus:ring-4 focus:ring-primary-50 transition-all outline-none" />
             </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                  <th class="px-10 py-6">Organization</th>
                  <th class="px-10 py-6">Subscription Tier</th>
                  <th class="px-10 py-6">Active Seats</th>
                  <th class="px-10 py-6 text-center">Billing Cycle</th>
                  <th class="px-10 py-6 text-right">Monthly Yield</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="org in filteredOrgs" :key="org.Org_ID" class="group hover:bg-slate-50 transition-all duration-300">
                  <td class="px-10 py-8">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-primary-400 shadow-xl group-hover:rotate-6 transition-transform">
                        {{ org.Org_Name[0] }}
                      </div>
                      <div>
                        <p class="text-sm font-black text-slate-900 leading-none mb-1.5">{{ org.Org_Name }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: TT-REV-{{ org.Org_ID }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <div class="flex items-center space-x-2">
                       <div :class="getPlanColor(org.Plan_Name)" class="w-2 h-2 rounded-full"></div>
                       <span class="text-[11px] font-black text-slate-700 uppercase tracking-widest">{{ org.Plan_Name || 'FREE_TIER' }}</span>
                    </div>
                  </td>
                  <td class="px-10 py-8">
                    <span class="text-sm font-black text-slate-900">{{ org.userCount }}</span>
                    <span class="text-[10px] font-bold text-slate-300 uppercase ml-1">Nodes</span>
                  </td>
                  <td class="px-10 py-8 text-center">
                    <div class="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-full border border-primary-100">
                      <span class="text-[9px] font-black uppercase tracking-widest">In Good Standing</span>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-right">
                    <span class="text-lg font-black text-slate-900">${{ calculateYield(org.Plan_Name) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Empty State -->
          <div v-if="filteredOrgs.length === 0" class="py-32 text-center flex flex-col items-center">
             <div class="w-16 h-16 bg-slate-50 rounded-lg flex items-center justify-center mb-4">
                <SearchIcon class="w-8 h-8 text-slate-200" />
             </div>
             <p class="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No financial signatures detected in ledger</p>
          </div>
        </div>
      </div>

    </main>

    <!-- Global Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
       <div class="bg-slate-950 p-6 rounded-3xl shadow-3xl flex items-center space-x-4 text-white border border-white/10">
          <RefreshCwIcon class="w-5 h-5 animate-spin text-primary-400" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Node Syncing</span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, BuildingIcon, 
  UsersIcon, RefreshCwIcon, LayoutDashboardIcon, ActivityIcon, SettingsIcon,
  ShieldAlertIcon, SearchIcon, FileDownIcon, CreditCardIcon, TrendingUpIcon,
  LogOutIcon, BarChart3Icon, DollarSignIcon, PieChartIcon, TargetIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const orgSearch = ref('')

// Data States
const metrics = ref({ organizations: 0, totalUsers: 0, totalRevenue: 0, mrr: 0, arr: 0 })
const organizations = ref([])

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Intelligence', path: '/superadmin/analytics', icon: ActivityIcon },
  { name: 'Revenue Ops', path: '/superadmin/revenue', icon: DollarSignIcon },
  { name: 'Security Audit', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'Infrastructure', path: '/superadmin/monitoring', icon: RefreshCwIcon },
  { name: 'Platform Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

const revenueMetrics = computed(() => [
  { label: 'Monthly Recurring', value: `$${(metrics.value.mrr || 0).toLocaleString()}`, trend: '↑ 14.2% vs last month', trendColor: 'text-green-500', icon: CreditCardIcon, bgColor: 'bg-primary-600' },
  { label: 'Annual Run Rate', value: `$${(metrics.value.arr || 0).toLocaleString()}`, trend: '↑ 8.4% projected', trendColor: 'text-green-500', icon: TrendingUpIcon, bgColor: 'bg-slate-900' },
  { label: 'Average ARPU', value: `$${calculateARPU()}`, trend: 'Stable yield', trendColor: 'text-slate-400', icon: TargetIcon, bgColor: 'bg-amber-500' },
  { label: 'Gross Net Profit', value: `$${(metrics.value.mrr * 0.92).toLocaleString()}`, trend: '92% Margin', trendColor: 'text-primary-500', icon: PieChartIcon, bgColor: 'bg-green-600' },
])

const revenueTrend = [
  { month: 'OCT', height: 40, value: 8.4 },
  { month: 'NOV', height: 55, value: 10.2 },
  { month: 'DEC', height: 78, value: 14.8 },
  { month: 'JAN', height: 65, value: 12.1 },
  { month: 'FEB', height: 90, value: 18.5 },
  { month: 'MAR', height: 85, value: 17.2 },
]

const planDistribution = computed(() => {
  const plans = [
    { name: 'Enterprise Pro', count: organizations.value.filter(o => o.userCount > 20).length },
    { name: 'Starter SaaS', count: organizations.value.filter(o => o.userCount <= 20 && o.userCount > 0).length },
    { name: 'Free Development', count: organizations.value.filter(o => o.userCount === 0).length }
  ]
  return plans
})

const filteredOrgs = computed(() => {
  const q = orgSearch.value.toLowerCase()
  return organizations.value.filter(o => o.Org_Name.toLowerCase().includes(q) || o.Org_Domain.toLowerCase().includes(q))
})

// === BUSINESS LOGIC ===

const loadRevenueData = async () => {
  loading.value = true
  const token = localStorage.getItem('superAdminToken')
  if (!token) return router.push('/superadmin/login')

  const config = { headers: { Authorization: `Bearer ${token}` } }
  
  try {
    const statsRes = await axios.get('http://localhost:4000/api/superadmin/dashboard', config)
    const orgsRes = await axios.get('http://localhost:4000/api/superadmin/organizations', config)
    
    organizations.value = orgsRes.data.organizations || []
    
    // SaaS Revenue Logic: Derive revenue from organization tiers
    let mrr = 0
    organizations.value.forEach(o => {
      mrr += calculateYield(o.Plan_Name)
    })

    metrics.value = {
      organizations: organizations.value.length,
      mrr: mrr,
      arr: mrr * 12
    }
  } catch (err) {
    if (err.response?.status === 403) handleLogout()
  } finally {
    loading.value = false
  }
}

const calculateYield = (plan) => {
  if (plan === 'Enterprise' || plan === 'Premium') return 250
  if (plan === 'Pro' || plan === 'Professional') return 49
  if (plan === 'Starter') return 19
  return 0
}

const calculateARPU = () => {
  if (metrics.value.organizations === 0) return '0'
  return Math.round(metrics.value.mrr / metrics.value.organizations)
}

const getPlanColor = (plan) => {
  if (plan === 'Enterprise') return 'bg-purple-500'
  if (plan === 'Pro') return 'bg-primary-500'
  return 'bg-slate-300'
}

const exportGlobalLedger = () => {
  let csv = "Organization,Domain,Plan,Users,MonthlyYield\n"
  organizations.value.forEach(o => {
    csv += `"${o.Org_Name}","${o.Org_Domain}","${o.Plan_Name || 'Starter'}",${o.userCount},${calculateYield(o.Plan_Name)}\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tracktimi_revenue_ledger_${Date.now()}.csv`
  a.click()
}

const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
const handleLogout = () => {
  localStorage.clear()
  router.push('/superadmin/login')
}

onMounted(loadRevenueData)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.shadow-3xl {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
}
</style>
