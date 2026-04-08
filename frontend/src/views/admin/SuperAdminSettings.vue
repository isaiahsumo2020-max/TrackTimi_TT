<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-primary-100 selection:text-primary-700">
    
    <!-- 1. PREMIUM SIDEBAR NAVIGATION -->
    <aside 
      :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 ease-in-out flex flex-col z-30']"
    >
      <div class="p-6 border-b border-slate-800 flex items-center justify-between h-24 text-white">
        <div v-if="sidebarOpen" class="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <ZapIcon class="w-6 h-6 fill-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tighter uppercase leading-none italic">TrackTimi</span>
            <span class="text-[8px] font-black text-primary-400 uppercase tracking-[0.4em] mt-1">Config Node</span>
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

    <!-- 2. MAIN SETTINGS VIEWPORT -->
    <main class="flex-1 flex flex-col min-w-0 relative">
      
      <!-- Top Intelligence Bar -->
      <header class="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
        <div class="flex flex-col">
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center italic uppercase">
            Global Config
            <span class="ml-3 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Master Key Required</span>
          </h1>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Platform parameters & infrastructure governance</p>
        </div>

        <div class="flex items-center space-x-4">
          <button @click="saveSettings" :disabled="saving" 
            class="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-100 transition-all active:scale-95 flex items-center">
            <SaveIcon v-if="!saving" class="w-4 h-4 mr-2" />
            <RefreshCwIcon v-else class="w-4 h-4 mr-2 animate-spin" />
            {{ saving ? 'Syncing...' : 'Commit Changes' }}
          </button>
        </div>
      </header>

      <!-- Scrollable Settings Body -->
      <div class="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar animate-in fade-in duration-1000">
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <!-- SECTION 1: GENERAL PLATFORM BRANDING -->
          <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
                <LayoutIcon class="w-5 h-5" />
              </div>
              <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">Identity Matrix</h2>
            </div>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Platform Display Name</label>
                <input v-model="settings.platformName" type="text" class="w-full p-4 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-primary-50 transition-all outline-none" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Master Support Channel (Email)</label>
                <input v-model="settings.supportEmail" type="email" class="w-full p-4 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-primary-50 transition-all outline-none" />
              </div>
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Node Capacity</label>
                  <input v-model.number="settings.maxOrganizations" type="number" class="w-full p-4 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-primary-50 outline-none" />
                </div>
                <div class="space-y-2">
                   <label class="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-[0.2em]">Default Radius (M)</label>
                   <input v-model.number="settings.defaultRadius" type="number" class="w-full p-4 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-4 focus:ring-primary-50 outline-none" />
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: SECURITY & GATEWAY PROTOCOLS -->
          <div class="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div class="flex items-center space-x-3 mb-2">
              <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <ShieldCheckIcon class="w-5 h-5" />
              </div>
              <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">Security Protocols</h2>
            </div>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-primary-100 transition-all group">
                <div class="flex-1">
                  <p class="text-xs font-black text-slate-900 uppercase tracking-tighter mb-1">Enforce 2FA</p>
                  <p class="text-[10px] font-bold text-slate-400 leading-none">Mandatory for all SuperAdmin nodes</p>
                </div>
                <button @click="settings.twoFactorAuth = !settings.twoFactorAuth" 
                  :class="settings.twoFactorAuth ? 'bg-primary-600' : 'bg-slate-300'"
                  class="w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner">
                  <div :class="settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'" class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md"></div>
                </button>
              </div>

              <div class="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-primary-100 transition-all group">
                <div class="flex-1">
                  <p class="text-xs font-black text-slate-900 uppercase tracking-tighter mb-1">Rate Limiting</p>
                  <p class="text-[10px] font-bold text-slate-400 leading-none">Prevent credential stuffing attacks</p>
                </div>
                <button @click="settings.rateLimiting = !settings.rateLimiting" 
                  :class="settings.rateLimiting ? 'bg-primary-600' : 'bg-slate-300'"
                  class="w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner">
                  <div :class="settings.rateLimiting ? 'translate-x-6' : 'translate-x-1'" class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md"></div>
                </button>
              </div>

              <div class="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-transparent hover:border-primary-100 transition-all group">
                <div class="flex-1">
                  <p class="text-xs font-black text-slate-900 uppercase tracking-tighter mb-1">Maintenance Mode</p>
                  <p class="text-[10px] font-bold text-red-400 leading-none uppercase">LOCK ALL PLATFORM API TRAFFIC</p>
                </div>
                <button @click="settings.maintenanceMode = !settings.maintenanceMode" 
                  :class="settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'"
                  class="w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner">
                  <div :class="settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'" class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md"></div>
                </button>
              </div>
            </div>
          </div>

          <!-- SECTION 3: SYSTEM SECRETS (Senior Feature) -->
          <div class="bg-slate-950 p-10 rounded-[4rem] text-white space-y-10 relative overflow-hidden group">
            <div class="relative z-10">
              <h3 class="text-xs font-black uppercase tracking-[0.4em] opacity-40 mb-10 text-primary-400">Master Integration Keys</h3>
              
              <div class="space-y-6">
                 <div class="space-y-2">
                    <p class="text-[9px] font-black uppercase tracking-widest opacity-60">Global Secret Key (HS256)</p>
                    <div class="flex items-center space-x-3 bg-white/5 p-4 rounded-lg border border-white/5 font-mono text-[10px] text-primary-300 overflow-hidden">
                       <LockIcon class="w-3 h-3 shrink-0" />
                       <span class="truncate">****************************************</span>
                       <button class="text-xs font-black text-white uppercase ml-auto hover:text-primary-400 transition-colors">Reveal</button>
                    </div>
                 </div>

                 <div class="p-6 bg-primary-600/10 rounded-3xl border border-primary-500/20">
                    <div class="flex items-center space-x-3 mb-3 text-primary-400">
                       <DatabaseIcon class="w-5 h-5" />
                       <span class="text-xs font-black uppercase tracking-widest">Database Backup</span>
                    </div>
                    <p class="text-[10px] opacity-60 leading-relaxed font-medium">Automatic hourly snapshots are being archived to the secondary cloud vault.</p>
                    <button class="mt-4 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:shadow-primary-500/40 transition-all active:scale-95">Trigger Manual Backup</button>
                 </div>
              </div>
            </div>
            <ZapIcon class="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
          </div>

          <!-- SECTION 4: COMPLIANCE & LEGAL NODES -->
          <div class="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm space-y-8 flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center italic">
                <FileTextIcon class="w-5 h-5 mr-2 text-slate-400" /> Regulatory & Privacy
              </h3>
              <div class="space-y-4">
                 <div v-for="legal in ['Terms of Protocol', 'Privacy Governance', 'SLA Agreement', 'Cookie Matrix']" :key="legal"
                   class="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group">
                    <span class="text-xs font-bold text-slate-600 uppercase group-hover:text-slate-900">{{ legal }}</span>
                    <ExternalLinkIcon class="w-3.5 h-3.5 text-slate-300" />
                 </div>
              </div>
            </div>
            <div class="pt-10 border-t border-slate-50 text-center">
               <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Revision 1.0.4-Stable</p>
               <p class="text-[8px] font-black text-primary-500 mt-1 uppercase tracking-[0.5em]">TrackTimi Systems Liberia</p>
            </div>
          </div>

        </div>

      </div>
    </main>

    <!-- Success Message Portal -->
    <Transition name="slide-up">
      <div v-if="saveMessage" class="fixed bottom-10 right-10 z-[100] bg-green-500 text-white p-6 rounded-3xl shadow-3xl flex items-center space-x-4 animate-in slide-in-from-right duration-500">
         <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckIcon class="w-6 h-6" />
         </div>
         <div>
            <p class="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Global Node Updated</p>
            <p class="text-xs font-bold opacity-80">{{ saveMessage }}</p>
         </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ZapIcon, MenuIcon, ChevronLeftIcon, LayoutDashboardIcon, BuildingIcon, 
  ActivityIcon, ShieldAlertIcon, RefreshCwIcon, SettingsIcon, LogOutIcon,
  SaveIcon, LayoutIcon, ShieldCheckIcon, LockIcon, DatabaseIcon, FileTextIcon,
  ExternalLinkIcon, CheckIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const saving = ref(false)
const saveMessage = ref('')

// Platform Authority Items
const navItems = [
  { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboardIcon },
  { name: 'Organizations', path: '/superadmin/organizations', icon: BuildingIcon },
  { name: 'Intelligence', path: '/superadmin/analytics', icon: ActivityIcon },
  { name: 'Audit Logs', path: '/superadmin/audit-logs', icon: ShieldAlertIcon },
  { name: 'Monitoring', path: '/superadmin/monitoring', icon: RefreshCwIcon },
  { name: 'Settings', path: '/superadmin/settings', icon: SettingsIcon },
]

// System Settings State
const settings = reactive({
  platformName: 'TrackTimi',
  supportEmail: 'support@tracktimi.com',
  maxOrganizations: 9999,
  defaultRadius: 500,
  twoFactorAuth: true,
  rateLimiting: true,
  maintenanceMode: false
})

const saveSettings = () => {
  saving.value = true
  
  // Real Persistence Logic (LocalStorage simulation for SA)
  setTimeout(() => {
    localStorage.setItem('platformSettings', JSON.stringify(settings))
    saveMessage.value = 'Identity & Security parameters synchronized.'
    saving.value = false
    
    // Auto-clear message
    setTimeout(() => {
      saveMessage.value = ''
    }, 4000)
  }, 1200)
}

const handleLogout = () => {
  localStorage.clear()
  router.push('/superadmin/login')
}

onMounted(() => {
  const saved = localStorage.getItem('platformSettings')
  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

.shadow-3xl {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
}

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.5s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(30px); }
.slide-up-leave-to { opacity: 0; transform: translateY(-30px); }

/* Toggle Switch Smoothness */
button div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
