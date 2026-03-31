<template>
  <div class="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-900">
    <!-- Top Header -->
    <header class="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-8 py-4 lg:ml-64 transition-all duration-300">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Left: Hamburger + Title -->
        <div class="flex items-center space-x-4">
          <button
            @click="toggleSidebar"
            class="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          >
            <MenuIcon v-if="!sidebarOpen" class="w-6 h-6" />
            <XIcon v-else class="w-6 h-6" />
          </button>
          
          <div class="flex flex-col">
            <h1 class="text-xl font-bold tracking-tight text-slate-900 truncate lg:block hidden">
              {{ orgName }}
            </h1>
            <p class="text-[10px] uppercase tracking-widest font-bold text-slate-400 lg:block hidden">
              Management Console
            </p>
          </div>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center space-x-4">
          <router-link
            :to="`/${orgSlug}/checkin`"
            class="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg text-sm shadow-sm transition-all duration-200 active:scale-95"
          >
            <MapPinIcon class="w-4 h-4" />
            <span>Check In</span>
          </router-link>
          
          <div class="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

          <button
            @click="logout"
            class="flex items-center space-x-2 px-4 py-2.5 text-slate-600 hover:text-red-600 font-semibold rounded-lg text-sm transition-colors"
          >
            <LogOutIcon class="w-4 h-4" />
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Mobile Sidebar Overlay -->
      <transition name="fade">
        <div
          v-if="sidebarOpen"
          @click="toggleSidebar"
          class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      </transition>

      <!-- Sidebar -->
      <aside
        :class="[
          'bg-slate-900 text-slate-300 border-r border-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed inset-y-0 left-0 w-64 lg:translate-x-0'
        ]"
      >
        <div class="h-full flex flex-col">
          <!-- Brand Header -->
          <div class="p-6 border-b border-slate-800">
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <span class="font-bold text-lg leading-none">{{ orgInitial }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-orange-400 uppercase tracking-tighter">Enterprise</span>
                <span class="text-xl font-black text-white tracking-tight">Track<span class="text-orange-500">Timi</span></span>
              </div>
            </div>

            <!-- User Profile Quick View -->
            <div class="flex items-center space-x-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                {{ userInitials }}
              </div>
              <div class="flex flex-col overflow-hidden">
                <span class="text-xs font-bold text-white truncate">{{ userShortName }}</span>
                <span class="text-[10px] text-slate-400 uppercase font-medium">{{ userRole }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto py-6 px-3 space-y-8 custom-scrollbar">
            <div v-for="(group, idx) in groupedMenu" :key="idx">
              <h3 class="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">{{ group.title }}</h3>
              <div class="space-y-1">
                <router-link
                  v-for="item in group.items"
                  :key="item.path"
                  :to="item.path"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative"
                  :class="route.path.includes(item.name) 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
                  @click="sidebarOpen = false"
                >
                  <component :is="item.icon" class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span>{{ item.label }}</span>
                  <div v-if="route.path.includes(item.name)" class="absolute left-0 w-1 h-5 bg-white rounded-full"></div>
                </router-link>
              </div>
            </div>
          </nav>

          <!-- System Status -->
          <div class="p-6 mt-auto">
            <div class="bg-orange-950/30 rounded-xl p-4 border border-orange-500/20">
               <div class="flex items-center space-x-2 text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                 <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                 </span>
                 <span>System Active</span>
               </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { 
  LayoutDashboardIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  MapPinIcon, 
  SettingsIcon, 
  LogOutIcon, 
  MenuIcon, 
  XIcon,
  CalendarIcon,
  ClipboardListIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }

// Dynamic Branding Logic
const orgSlug = computed(() => route.params.orgSlug || authStore.user?.orgSlug || 'firm')
const orgName = computed(() => authStore.user?.orgName || 'TrackTimi Firm')
const orgInitial = computed(() => orgName.value.charAt(0).toUpperCase())
const userRole = computed(() => authStore.user?.role || 'Staff')

const userShortName = computed(() => {
  const name = authStore.user?.name || authStore.user?.firstName || 'Admin'
  return name.length > 12 ? name.substring(0, 12) + '...' : name
})

const userInitials = computed(() => {
  return userShortName.value.substring(0, 2).toUpperCase()
})

// Corporate Navigation Structure
const groupedMenu = computed(() => {
  const role = authStore.user?.role?.toLowerCase() || ''
  const basePath = `/${orgSlug.value}`

  if (['orgadmin', 'admin', 'manager'].includes(role)) {
    return [
      {
        title: 'Insights',
        items: [
          { name: 'dashboard', label: 'Dashboard', path: `${basePath}/dashboard`, icon: LayoutDashboardIcon },
        ]
      },
      {
        title: 'Workforce',
        items: [
          { name: 'users', label: 'Users', path: `${basePath}/users`, icon: UsersIcon },
          { name: 'departments', label: 'Departments', path: `${basePath}/departments`, icon: BriefcaseIcon },
          { name: 'checkin', label: 'Activity Logs', path: `${basePath}/checkin`, icon: MapPinIcon },
        ]
      },
      {
        title: 'System',
        items: [
          { name: 'settings', label: 'Settings', path: `${basePath}/settings`, icon: SettingsIcon },
        ]
      }
    ]
  }

  return [
    {
      title: 'Self Service',
      items: [
        { name: 'user-dashboard', label: 'My Stats', path: `${basePath}/user-dashboard`, icon: LayoutDashboardIcon },
        { name: 'schedule', label: 'My Schedule', path: `${basePath}/schedule`, icon: CalendarIcon },
        { name: 'checkins', label: 'My History', path: `${basePath}/checkins`, icon: ClipboardListIcon },
      ]
    }
  ]
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

watch(() => route.path, () => { sidebarOpen.value = false })
</script>

<style scoped>
/* Page Transition */
.page-enter-active, .page-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.page-enter-from { opacity: 0; transform: translateY(5px); }
.page-leave-to { opacity: 0; transform: translateY(-5px); }

/* Sidebar Fade */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>