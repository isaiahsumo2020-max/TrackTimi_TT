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
            <span class="text-[8px] font-black text-primary-400 uppercase tracking-[0.4em] mt-1">Billing Node</span>
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

    <!-- 2. MAIN SUBSCRIPTION WORKSPACE -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      
      <!-- Top Intelligence Bar -->
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div class="flex flex-col">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center italic uppercase">
            Subscription Matrix
            <span class="ml-3 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-100">Live Tiering</span>
          </h1>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tenant Plan Distribution & Quota Enforcement</p>
        </div>

        <div class="flex items-center space-x-4">
          <button @click="loadSubscriptionData" :disabled="loading" class="p-4 bg-slate-50 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-all active:scale-90 shadow-sm border border-slate-100">
             <RefreshCwIcon :class="{'animate-spin': loading}" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <!-- ROW 1: TIER DISTRIBUTION KPIS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(count, plan) in subscriptionStats" :key="plan" 
            class="bg-primary-50 p-8 rounded-2xl border border-primary-200 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
            <div class="flex justify-between items-start mb-6 relative z-10">
              <div :class="getPlanColor(plan)" class="w-14 h-14 rounded-lg flex items-center justify-center text-white shadow-xl">
                <BoxIcon v-if="plan === 'free'" class="w-7 h-7" />
                <ZapIcon v-else-if="plan === 'pro'" class="w-7 h-7" />
                <CrownIcon v-else class="w-7 h-7" />
              </div>
              <div class="text-right">
                 <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">{{ plan }} Level</span>
              </div>
            </div>
            <div class="relative z-10">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Subscriptions</p>
              <h3 class="text-5xl font-black text-slate-900 tracking-tighter mt-1">{{ count }}</h3>
              <p class="text-[9px] font-black text-primary-500 uppercase mt-4">Calculated from global registry</p>
            </div>
            <div class="absolute -right-4 -bottom-4 opacity-[0.03]">
               <CreditCardIcon class="w-32 h-32 text-slate-900" />
            </div>
          </div>
        </div>

        <!-- ROW 2: PLAN MANAGEMENT GRID -->
        <div class="space-y-8">
          <div class="flex items-center justify-between">
             <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
                <LayoutGridIcon class="w-4 h-4 mr-2 text-primary-600" /> System Plan Definitions
             </h3>
             <span class="text-[10px] font-bold text-slate-400 uppercase">3 Defined Protocols</span>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div v-for="plan in platformPlans" :key="plan.id" 
                  class="bg-white p-10 rounded-[3.5rem] border-2 border-slate-50 hover:border-primary-100 transition-all group">
                <div class="flex justify-between items-center mb-8">
                   <h4 class="text-2xl font-black text-slate-900 tracking-tighter">{{ plan.name }}</h4>
                   <span class="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                     {{ plan.price }}
                   </span>
                </div>
                
                <div class="space-y-4 mb-10">
                   <div v-for="feat in plan.features" :key="feat" class="flex items-center space-x-3 text-xs font-bold text-slate-500">
                      <CheckCircleIcon class="w-4 h-4 text-green-500" />
                      <span>{{ feat }}</span>
                   </div>
                </div>

                <div class="pt-8 border-t border-slate-50 flex items-center justify-between">
                   <button @click="viewPlanDetail(plan)" class="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-600 transition-all">
                      Configure Tier
                   </button>
                   <div class="text-right">
                      <p class="text-[8px] font-black text-slate-300 uppercase">Tenant Load</p>
                      <p class="text-sm font-black text-slate-900">{{ subscriptionStats[plan.id] }}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <!-- ROW 3: DETAILED PLAN LEDGER -->
        <div class="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="p-10 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
             <div>
               <h3 class="text-lg font-black text-slate-900 tracking-tight italic">Global Subscription Ledger</h3>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Audit of every organizational tier on the platform</p>
             </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                  <th class="px-10 py-6">Organization Node</th>
                  <th class="px-10 py-6 text-center">Active Tier</th>
                  <th class="px-10 py-6 text-center">Monthly Yield</th>
                  <th class="px-10 py-6 text-center">Renewal Authority</th>
                  <th class="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="org in organizations" :key="org.Org_ID" class="group hover:bg-slate-50 transition-all duration-300">
                  <td class="px-10 py-8">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-primary-400 shadow-xl group-hover:rotate-6 transition-transform">
                        {{ org.Org_Name[0] }}
                      </div>
                      <div>
                        <p class="text-sm font-black text-slate-900 leading-none mb-1.5">{{ org.Org_Name }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase">DOMAIN: {{ org.Org_Domain }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-center">
                    <span :class="getPlanBadgeStyle(org.Plan_Name)" class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border">
                      {{ org.Plan_Name || 'FREE_TIER' }}
                    </span>
                  </td>
                  <td class="px-10 py-8 text-center text-sm font-black text-slate-900">
                    ${{ getPlanPriceValue(org.Plan_Name) }}
                  </td>
                  <td class="px-10 py-8 text-center">
                    <div class="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-full border border-green-100">
                      <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span class="text-[9px] font-black uppercase tracking-widest">Authorized</span>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-right">
                    <button @click="openTenantDetail(org.Org_ID)" class="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all">
                      Modify Tier
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div v-if="organizations.length === 0" class="py-32 text-center opacity-30 italic text-sm font-bold uppercase tracking-[0.4em]">
            No Subscription Data Synthesized
          </div>
        </div>
      </div>
    </main>

    <!-- Global Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
       <div class="bg-slate-950 p-6 rounded-3xl shadow-3xl flex items-center space-x-4 text-white border border-white/10 animate-in zoom-in">
          <RefreshCwIcon class="w-5 h-5 animate-spin text-primary-400" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Processing Billing Registry</span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, BuildingIcon, 
  UsersIcon, RefreshCwIcon, LayoutDashboardIcon, ActivityIcon, SettingsIcon,
  ShieldAlertIcon, SearchIcon, CreditCardIcon, BoxIcon, CrownIcon,
  CheckCircleIcon, LayoutGridIcon, LogOutIcon, XIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const error = ref('')

// DATA STATES
const organizations = ref([])
const subscriptionStats = ref({ free: 0, pro: 0, enterprise: 0 })

const platformPlans = [
  { id: 'free', name: 'Starter Free', price: '$0.00', features: ['Up to 10 Users', 'Basic GPS Fencing', '7-Day Log History'] },
  { id: 'pro', name: 'Pro SaaS', price: '$49.00', features: ['Up to 50 Users', 'Multi-Site Zones', 'Advanced Audit Matrix'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', features: ['Unlimited Users', 'API Access Nodes', 'Priority Support'] }
]

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Intelligence', path: '/superadmin/analytics', icon: ActivityIcon },
  { name: 'Subscriptions', path: '/superadmin/subscriptions', icon: CreditCardIcon },
  { name: 'Audit Ledger', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'Infrastructure', path: '/superadmin/monitoring', icon: RefreshCwIcon },
  { name: 'System Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

// === BUSINESS LOGIC ===

const loadSubscriptionData = async () => {
  loading.value = true
  const token = localStorage.getItem('superAdminToken')
  if (!token) return router.push('/superadmin/login')

  try {
    const res = await axios.get('http://localhost:4000/api/superadmin/organizations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    organizations.value = res.data.organizations || []
    
    // LIVE CALCULATION: Tiering Logic
    const stats = { free: 0, pro: 0, enterprise: 0 }
    organizations.value.forEach(o => {
      const plan = (o.Plan_Name || '').toLowerCase()
      if (plan.includes('enterprise') || plan.includes('premium')) stats.enterprise++
      else if (plan.includes('pro') || plan.includes('professional')) stats.pro++
      else stats.free++
    })
    subscriptionStats.value = stats

  } catch (err) {
    if (err.response?.status === 403) handleLogout()
  } finally {
    loading.value = false
  }
}

const getPlanColor = (plan) => {
  if (plan === 'enterprise') return 'bg-slate-900'
  if (plan === 'pro') return 'bg-primary-600'
  return 'bg-slate-400'
}

const getPlanBadgeStyle = (plan) => {
  const p = (plan || '').toLowerCase()
  if (p.includes('enterprise')) return 'bg-purple-50 text-purple-600 border-purple-100'
  if (p.includes('pro')) return 'bg-primary-50 text-primary-600 border-primary-100'
  return 'bg-slate-50 text-slate-500 border-slate-100'
}

const getPlanPriceValue = (plan) => {
  const p = (plan || '').toLowerCase()
  if (p.includes('enterprise')) return '250.00'
  if (p.includes('pro')) return '49.00'
  return '0.00'
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/superadmin/login')
}

const toggleSidebar = () => sidebarOpen.value = !sidebarOpen.value

onMounted(loadSubscriptionData)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.shadow-3xl {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
