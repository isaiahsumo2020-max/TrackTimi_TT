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
            <span class="text-[8px] font-black text-primary-400 uppercase tracking-[0.4em] mt-1">Audit Node</span>
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
            <div class="font-bold text-[11px] text-red-500 uppercase tracking-widest">Terminate</div>
            <div class="text-[8px] font-black text-slate-500 uppercase">Master Session</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 2. MAIN AUDIT VIEWPORT -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      
      <!-- Top Intelligence Bar -->
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div class="flex flex-col">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center italic">
            Network Audit Ledger
            <span class="ml-3 px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary-100">Live Stream</span>
          </h1>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Immutable record of all platform-wide operational pulses</p>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
             <button @click="loadAuditLogs" :disabled="loading" class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary-600 active:scale-90">
               <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
             </button>
             <button @click="exportToCSV" class="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-primary-600 active:scale-90">
               <FileDownIcon class="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <!-- ROW 1: AUDIT SUMMARY KPIS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="stat in auditStats" :key="stat.label" 
            class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
            <div class="flex justify-between items-start mb-4">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{{ stat.label }}</p>
              <div :class="stat.color" class="p-2 rounded-lg bg-opacity-10">
                 <component :is="stat.icon" class="w-4 h-4" />
              </div>
            </div>
            <h3 class="text-4xl font-black text-slate-900 tracking-tighter">{{ stat.value }}</h3>
            <p class="text-[9px] font-black text-slate-300 uppercase mt-2">24h Operational window</p>
          </div>
        </div>

        <!-- ROW 2: ADVANCED FILTERING -->
        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-6">
          <div class="flex-1 min-w-[300px] relative group">
            <SearchIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by User, Organization, Action or IP Address..." 
              class="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-primary-50 outline-none transition-all"
            />
          </div>

          <div class="flex items-center space-x-3">
             <div class="space-y-1">
                <p class="text-[9px] font-black text-slate-400 uppercase ml-2">Action Type</p>
                <select v-model="filterAction" class="bg-slate-50 border-none rounded-xl px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-primary-500">
                  <option value="all">All Actions</option>
                  <option value="LOGIN">Security: Login</option>
                  <option value="CHECK_IN">Operational: Check-in</option>
                  <option value="CREATE_USER">System: Provision</option>
                  <option value="UPDATE_SETTINGS">Config: Settings</option>
                </select>
             </div>
             <div class="space-y-1">
                <p class="text-[9px] font-black text-slate-400 uppercase ml-2">Date Frame</p>
                <input type="date" v-model="filterDate" class="bg-slate-50 border-none rounded-xl px-6 py-3 text-[11px] font-bold text-slate-600 focus:ring-2 focus:ring-primary-500" />
             </div>
          </div>
        </div>

        <!-- ROW 3: THE MASTER LEDGER TABLE -->
        <div class="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                  <th class="px-10 py-6">Event Timestamp</th>
                  <th class="px-10 py-6">Authorized Actor</th>
                  <th class="px-10 py-6">Operation Type</th>
                  <th class="px-10 py-6">Network Target</th>
                  <th class="px-10 py-6 text-right">Data Pulse</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="log in filteredLogs" :key="log.Log_ID" class="group hover:bg-primary-50/30 transition-all duration-300">
                  <td class="px-10 py-7">
                    <div class="flex items-center space-x-3">
                       <ClockIcon class="w-3.5 h-3.5 text-slate-300" />
                       <span class="text-[11px] font-bold text-slate-500">{{ formatDate(log.Created_at) }}</span>
                    </div>
                  </td>
                  <td class="px-10 py-7">
                    <div class="flex items-center space-x-4">
                      <div class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm">
                        {{ log.userInitials }}
                      </div>
                      <div>
                        <p class="text-xs font-black text-slate-900 leading-none mb-1">{{ log.User_Email }}</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">IP: {{ log.IP_Address || '127.0.0.1' }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-7">
                    <span :class="getActionStyle(log.Action)" class="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border">
                      {{ log.Action }}
                    </span>
                  </td>
                  <td class="px-10 py-7">
                    <div class="flex items-center space-x-2">
                       <BuildingIcon class="w-3.5 h-3.5 text-primary-400" />
                       <span class="text-[11px] font-black text-slate-900">{{ log.Org_Name || 'System Master' }}</span>
                    </div>
                  </td>
                  <td class="px-10 py-7 text-right">
                    <button @click="inspectLog(log)" class="p-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-primary-600 hover:text-white transition-all group-hover:shadow-lg">
                       <EyeIcon class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="p-8 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing {{ filteredLogs.length }} Pulses across network</p>
             <div class="flex space-x-2">
                <button class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Prev</button>
                <button class="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-100">Next</button>
             </div>
          </div>
        </div>

      </div>

      <!-- 3. DATA INSPECTOR MODAL -->
      <Transition name="modal">
        <div v-if="activeInspector" class="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-md" @click="activeInspector = null"></div>
          <div class="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-3xl relative z-10 animate-in zoom-in duration-300">
             <div class="h-24 bg-slate-900 p-8 flex items-center justify-between">
                <h2 class="text-xl font-black text-white tracking-tight uppercase">Payload Inspection</h2>
                <button @click="activeInspector = null" class="text-slate-400 hover:text-white"><XIcon class="w-6 h-6" /></button>
             </div>
             <div class="p-10 space-y-8">
                <div class="grid grid-cols-2 gap-6">
                   <div class="space-y-1">
                      <p class="text-[10px] font-black text-slate-400 uppercase">Actor</p>
                      <p class="text-sm font-black text-slate-900">{{ activeInspector.User_Email }}</p>
                   </div>
                   <div class="space-y-1">
                      <p class="text-[10px] font-black text-slate-400 uppercase">Operation</p>
                      <p class="text-sm font-black text-primary-600">{{ activeInspector.Action }}</p>
                   </div>
                </div>

                <div class="space-y-2">
                   <p class="text-[10px] font-black text-slate-400 uppercase">JSON Payload Body</p>
                   <div class="bg-slate-950 p-6 rounded-3xl font-mono text-[11px] text-green-400 overflow-x-auto leading-relaxed border border-white/5">
                      <pre>{{ formatJSON(activeInspector.New_Data) }}</pre>
                   </div>
                </div>

                <div class="pt-6 flex justify-end">
                   <button @click="activeInspector = null" class="px-8 py-3 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest">Close Inspector</button>
                </div>
             </div>
          </div>
        </div>
      </Transition>

    </main>

    <!-- Global Loading State -->
    <div v-if="loading" class="fixed inset-0 z-[100] bg-white/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
       <div class="bg-slate-950 p-6 rounded-3xl shadow-3xl flex items-center space-x-4 text-white">
          <RefreshCwIcon class="w-5 h-5 animate-spin text-primary-400" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Querying Master Log</span>
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
  SearchIcon, DownloadIcon, CreditCardIcon, LogOutIcon,
  ClockIcon, EyeIcon, XIcon, ShieldCheckIcon, AlertTriangleIcon,
  UserPlusIcon, LockIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const filterAction = ref('all')
const filterDate = ref('')
const logs = ref([])
const activeInspector = ref(null)

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Intelligence', path: '/superadmin/analytics', icon: ActivityIcon },
  { name: 'Audit Matrix', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'Monitoring', path: '/superadmin/monitoring', icon: RefreshCwIcon },
  { name: 'Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

const auditStats = computed(() => {
  return [
    { label: 'Total Pulses', value: logs.value.length, icon: ActivityIcon, color: 'text-primary-600' },
    { label: 'Provision Events', value: logs.value.filter(l => l.Action === 'CREATE_USER').length, icon: UserPlusIcon, color: 'text-green-600' },
    { label: 'Security Locks', value: logs.value.filter(l => l.Action.includes('SUSPEND')).length, icon: LockIcon, color: 'text-red-600' },
    { label: 'Auth Success', value: logs.value.filter(l => l.Action === 'LOGIN').length, icon: ShieldCheckIcon, color: 'text-primary-600' },
  ]
})

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = 
      l.User_Email?.toLowerCase().includes(q) || 
      l.Org_Name?.toLowerCase().includes(q) ||
      l.Action?.toLowerCase().includes(q) ||
      l.IP_Address?.includes(q)

    const matchesAction = filterAction.value === 'all' || l.Action === filterAction.value
    const matchesDate = !filterDate.value || l.Created_at.startsWith(filterDate.value)

    return matchesSearch && matchesAction && matchesDate
  })
})

// === BUSINESS LOGIC ===

const loadAuditLogs = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('superAdminToken')
    if (!token) return router.push('/superadmin/login')

    // Using your established 18-table SQLite JOIN architecture
    const response = await axios.get('http://localhost:4000/api/superadmin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    logs.value = response.data.logs.map(l => ({
      ...l,
      userInitials: (l.User_Email?.[0] || 'A').toUpperCase()
    }))
  } catch (err) {
    console.error("Audit log handshake failed", err)
    if (err.response?.status === 403) handleLogout()
  } finally {
    setTimeout(() => { loading.value = false }, 800)
  }
}

const getActionStyle = (action) => {
  if (action === 'LOGIN') return 'bg-primary-50 text-primary-600 border-primary-100'
  if (action.includes('CREATE')) return 'bg-green-50 text-green-600 border-green-100'
  if (action.includes('DELETE') || action.includes('SUSPEND')) return 'bg-red-50 text-red-600 border-red-100'
  return 'bg-slate-50 text-slate-500 border-slate-100'
}

const inspectLog = (log) => { activeInspector.value = log }

const formatJSON = (data) => {
  if (!data) return "{}"
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data
    return JSON.stringify(parsed, null, 2)
  } catch (e) { return data }
}

const exportToCSV = () => {
  let csv = "Timestamp,User,Action,Org,IP\n"
  filteredLogs.value.forEach(l => {
    csv += `"${l.Created_at}","${l.User_Email}","${l.Action}","${l.Org_Name}","${l.IP_Address}"\n`
  })
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = `tracktimi_global_audit_${Date.now()}.csv`
  link.click()
}

const formatDate = (ts) => {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/superadmin/login')
}

onMounted(loadAuditLogs)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.shadow-3xl {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
</style>
