<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-orange-100 selection:text-orange-600">
    
    <!-- 1. NAVIGATION SIDEBAR -->
    <aside 
      :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-40']"
    >
      <div class="p-6 border-b border-slate-800 flex items-center justify-between h-24">
        <div v-if="sidebarOpen" class="flex items-center space-x-3 animate-in fade-in">
          <div class="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tighter uppercase leading-none italic">TrackTimi</span>
            <span class="text-[8px] font-black text-orange-400 uppercase tracking-[0.4em] mt-1">Registry Node</span>
          </div>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5 text-slate-400" />
          <ChevronLeftIcon v-else class="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all group"
          :class="[$route.path === item.path ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white']"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- 2. MAIN REGISTRY WORKSPACE -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Tenant Registry</h1>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform-Wide Organization Audit</p>
        </div>
        <div class="flex items-center space-x-4">
          <div class="relative group">
            <SearchIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
            <input v-model="searchQuery" placeholder="Filter by Name or Domain..." 
              class="pl-14 pr-6 py-4 bg-slate-50 border-none rounded-xl text-[11px] font-bold shadow-sm w-80 focus:ring-4 focus:ring-orange-50 transition-all outline-none" />
          </div>
          <button @click="loadOrganizations" :disabled="loading" class="p-4 bg-slate-900 text-white rounded-xl hover:bg-orange-500 transition-all active:scale-90 shadow-lg">
             <RefreshCwIcon :class="{'animate-spin': loading}" class="w-5 h-5" />
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border-b border-slate-50">
                  <th class="px-10 py-6">Organization Signature</th>
                  <th class="px-10 py-6">Infrastructure Node</th>
                  <th class="px-10 py-6 text-center">Workforce Load</th>
                  <th class="px-10 py-6 text-center">System Status</th>
                  <th class="px-10 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="org in filteredOrgs" :key="org.Org_ID" class="group hover:bg-orange-50/20 transition-all duration-300">
                  <td class="px-10 py-8">
                    <div class="flex items-center space-x-4">
                      <div class="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-orange-400 shadow-xl group-hover:rotate-6 transition-transform uppercase">
                        {{ org.Org_Name[0] }}
                      </div>
                      <div>
                        <p class="text-sm font-black text-slate-900 leading-none mb-1.5">{{ org.Org_Name }}</p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase">ID: TT-NODE-{{ org.Org_ID }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-8 font-mono text-[11px] font-black text-orange-500 uppercase tracking-tighter">
                    {{ org.Org_Domain }}.tracktimi.com
                  </td>
                  <td class="px-10 py-8">
                    <div class="flex flex-col items-center space-y-2">
                       <span class="text-xs font-black text-slate-900">{{ org.userCount || 0 }} Members</span>
                       <div class="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div class="h-full bg-orange-500" :style="{ width: Math.min((org.userCount/50)*100, 100) + '%' }"></div>
                       </div>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-center">
                    <div v-if="org.Is_Active" class="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 rounded-full border border-green-100">
                      <div class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span class="text-[9px] font-black uppercase tracking-widest">Authorized</span>
                    </div>
                    <div v-else class="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100">
                      <span class="text-[9px] font-black uppercase tracking-widest">Suspended</span>
                    </div>
                  </td>
                  <td class="px-10 py-8 text-right">
                    <button @click="inspectTenant(org.Org_ID)" class="px-6 py-3 bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all active:scale-95 shadow-lg shadow-slate-200">
                      Inspect
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="organizations.length === 0" class="py-32 text-center opacity-30 italic text-sm font-black uppercase tracking-[0.4em]">Node Registry Empty</div>
        </div>
      </div>

      <!-- 3. TENANT INSPECTION DRAWER (Deep Dive) -->
      <Transition name="drawer">
        <div v-if="selectedOrg" class="absolute inset-y-0 right-0 w-[600px] bg-white shadow-[-50px_0_100px_rgba(0,0,0,0.3)] z-50 flex flex-col border-l border-slate-100">
          <div class="h-40 bg-slate-950 text-white flex items-center justify-between px-10 relative overflow-hidden shrink-0">
            <div class="relative z-10">
              <span class="text-[9px] font-black text-orange-400 uppercase tracking-[0.5em] mb-2 block">Tenant Deep Dive</span>
              <h2 class="text-3xl font-black tracking-tighter uppercase">{{ selectedOrg.info.Org_Name }}</h2>
              <div class="flex items-center space-x-3 mt-3">
                 <span class="text-[10px] font-bold text-slate-400 font-mono tracking-tighter">{{ selectedOrg.info.Org_Domain }}.tracktimi.com</span>
              </div>
            </div>
            <button @click="selectedOrg = null" class="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all relative z-10">
                <XIcon class="w-6 h-6" />
            </button>
            <ZapIcon class="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          </div>
          
          <div class="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
            <!-- Global Overrides -->
            <div class="grid grid-cols-2 gap-4">
              <button @click="toggleOrgStatus(selectedOrg.info.Org_ID, selectedOrg.info.Is_Active)"
                :class="selectedOrg.info.Is_Active ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'"
                class="py-5 rounded-lg font-black text-[10px] uppercase tracking-widest border transition-all">
                {{ selectedOrg.info.Is_Active ? 'Revoke Platform Access' : 'Authorize Network Node' }}
              </button>
              <button @click="confirmDelete(selectedOrg.info.Org_ID)" class="bg-slate-900 text-white py-5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all">
                Full Tenant Wipe
              </button>
            </div>

            <!-- Dept Matrix -->
            <section>
              <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
                <LayoutGridIcon class="w-4 h-4 mr-2 text-orange-500" /> Organizational Units
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="dept in selectedOrg.departments" :key="dept.Dep_ID" class="p-6 bg-slate-50 rounded-xl border border-slate-100">
                   <p class="text-xs font-black text-slate-900 truncate uppercase">{{ dept.Depart_Name }}</p>
                   <p class="text-[9px] font-bold text-slate-400 uppercase mt-1">{{ dept.staff_count }} Personnel Assigned</p>
                </div>
              </div>
              <div v-if="selectedOrg.departments.length === 0" class="text-center py-10 bg-slate-50 rounded-xl opacity-30 italic text-xs">No departments provisioned</div>
            </section>

            <!-- Active Registry -->
            <section>
              <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center">
                <UsersIcon class="w-4 h-4 mr-2 text-orange-500" /> Member Registry
              </h3>
              <div class="space-y-3">
                <div v-for="user in selectedOrg.users" :key="user.User_ID" class="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-xl hover:border-orange-200 transition-all group">
                  <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">{{ user.First_Name[0] }}</div>
                    <div class="min-w-0">
                      <p class="text-xs font-black text-slate-900 truncate">{{ user.First_Name }} {{ user.SurName }}</p>
                      <p class="text-[10px] font-medium text-slate-400 truncate">{{ user.Email }}</p>
                    </div>
                  </div>
                  <span class="text-[9px] font-black text-orange-500 uppercase tracking-widest">{{ user.Job_Title || 'Staff' }}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Transition>
    </main>

    <!-- Node Handshake Loading Overlay -->
    <div v-if="loading && !selectedOrg" class="fixed inset-0 z-[100] bg-slate-900/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
       <div class="bg-slate-950 p-6 rounded-xl shadow-3xl flex items-center space-x-4 text-white border border-white/10 animate-in zoom-in">
          <RefreshCwIcon class="w-5 h-5 animate-spin text-orange-400" />
          <span class="text-[10px] font-black uppercase tracking-[0.4em]">Synchronizing Master Node</span>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, BuildingIcon, 
  UsersIcon, SearchIcon, RefreshCwIcon, XIcon, LayoutGridIcon 
} from 'lucide-vue-next'

const sidebarOpen = ref(true)
const loading = ref(false)
const searchQuery = ref('')
const organizations = ref([])
const selectedOrg = ref(null)

const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: ZapIcon },
  { name: 'Network Tenants', path: '/superadmin/organizations', icon: BuildingIcon },
]

const filteredOrgs = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return organizations.value.filter(o => o.Org_Name.toLowerCase().includes(query) || o.Org_Domain.toLowerCase().includes(query))
})

const loadOrganizations = async () => {
  loading.value = true
  const token = localStorage.getItem('superAdminToken')
  try {
    const res = await axios.get('http://localhost:4000/api/superadmin/organizations', {
      headers: { Authorization: `Bearer ${token}` }
    })
    organizations.value = res.data.organizations || []
  } finally { loading.value = false }
}

const inspectTenant = async (id) => {
  loading.value = true
  const token = localStorage.getItem('superAdminToken')
  try {
    const res = await axios.get(`http://localhost:4000/api/superadmin/organizations/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    selectedOrg.value = res.data
  } finally { loading.value = false }
}

const toggleOrgStatus = async (id, current) => {
  if (!confirm('Execute Node Authority Modification?')) return
  const token = localStorage.getItem('superAdminToken')
  await axios.put(`http://localhost:4000/api/superadmin/organizations/${id}/status`, { isActive: !current }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (selectedOrg.value) inspectTenant(id)
  loadOrganizations()
}

const confirmDelete = async (id) => {
  if (!confirm('🚨 MASTER PURGE: Permanently wipe all data for this tenant?')) return
  const token = localStorage.getItem('superAdminToken')
  await axios.delete(`http://localhost:4000/api/superadmin/organizations/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  selectedOrg.value = null
  loadOrganizations()
}

onMounted(loadOrganizations)
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.drawer-enter-active, .drawer-leave-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); opacity: 0; }
</style>