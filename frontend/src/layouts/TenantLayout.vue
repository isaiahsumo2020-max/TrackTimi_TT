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
            class="hidden md:flex items-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all duration-200 active:scale-95"
          >
            <MapPinIcon class="w-4 h-4" />
            <span>My Work Zone</span>
          </router-link>
          
          <!-- Notification Bell Icon -->
          <div class="relative">
            <button
              @click="showNotifications = !showNotifications"
              class="relative p-2.5 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <BellIcon class="w-5 h-5" />
              <!-- Unread Badge -->
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>
            
            <!-- Notifications Dropdown Preview -->
            <transition name="fade">
              <div v-if="showNotifications" class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-y-auto">
                <div class="p-4 border-b border-slate-200">
                  <h3 class="font-bold text-slate-900">Notifications</h3>
                  <p class="text-xs text-slate-500">{{ unreadCount }} unread</p>
                </div>
                
                <div v-if="recentNotifications.length === 0" class="p-6 text-center text-slate-500 text-sm">
                  No notifications
                </div>
                
                <div v-else class="divide-y divide-slate-100">
                  <div v-for="notif in recentNotifications.slice(0, 5)" :key="notif.Notify_ID" class="p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                    <p class="font-semibold text-sm text-slate-900">{{ notif.Title }}</p>
                    <p class="text-xs text-slate-600 mt-1 line-clamp-2">{{ notif.Message }}</p>
                    <p class="text-[10px] text-slate-400 mt-2">{{ formatTime(notif.Created_at) }}</p>
                  </div>
                </div>
                
                <div v-if="unreadCount > 0" class="p-3 border-t border-slate-200 text-center">
                  <router-link
                    :to="`/${orgSlug}/notifications`"
                    class="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    View All Notifications
                  </router-link>
                </div>
              </div>
            </transition>
          </div>
          
          <div class="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

          <!-- Refresh Button -->
          <button
            @click="refreshPage"
            :disabled="isRefreshing"
            class="p-2.5 text-slate-600 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            :title="isRefreshing ? 'Refreshing...' : 'Refresh (Ctrl+R)'"
          >
            <svg
              class="w-5 h-5"
              :class="{ 'animate-spin': isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </button>

          <!-- Admin Profile (Name + Role) -->
          <div class="hidden sm:flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <div class="text-right">
              <p class="text-sm font-bold text-slate-900">{{ userShortName }}</p>
              <p class="text-xs text-slate-500 uppercase">{{ userRole }}</p>
            </div>
            <div v-if="userAvatar" class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
              <img :src="`data:${userAvatarMimeType};base64,${userAvatar}`" :alt="userShortName" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
              {{ userInitials }}
            </div>
          </div>

          <div class="h-8 w-[1px] bg-slate-200 hidden md:block"></div>

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
              <!-- Organization Logo or Initial -->
              <div v-if="orgLogo" class="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-md shadow-primary-500/20 flex-shrink-0 border border-primary-200">
                <img :src="orgLogo" :alt="orgName" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 flex-shrink-0 font-bold text-lg">
                <span class="leading-none">{{ orgInitial }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-primary-400 uppercase tracking-tighter">Enterprise</span>
                <span class="text-xl font-black text-white tracking-tight">Track<span class="text-primary-500">Timi</span></span>
              </div>
            </div>

            <!-- User Profile Quick View (Hidden on Mobile/Tablet - shown in header instead) -->
            <div class="hidden lg:flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-primary-600/50 transition-colors">
              <div v-if="userAvatar" class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                <img :src="`data:${userAvatarMimeType};base64,${userAvatar}`" :alt="userShortName" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
                {{ userInitials }}
              </div>
              <div class="flex flex-col overflow-hidden min-w-0">
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
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20' 
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
            <div class="bg-slate-950/30 rounded-xl p-4 border border-primary-500/20">
               <div class="flex items-center space-x-2 text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                 <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useNotifications } from '@/composables/useNotifications'
import api from '@/utils/api'
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
  ClipboardListIcon,
  BellIcon,
  MessageSquareIcon,
  BarChart3Icon,
  CoffeeIcon,
  ClockIcon
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const toggleSidebar = () => { sidebarOpen.value = !sidebarOpen.value }

// Use real-time notifications composable
const { 
  notifications, 
  unreadCount, 
  fetchNotifications, 
  initSocket, 
  cleanup: cleanupNotifications 
} = useNotifications()

const showNotifications = ref(false)
const recentNotifications = computed(() => notifications.value)

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now - date) / 60000)
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  return date.toLocaleDateString()
}

// Refresh functionality
const isRefreshing = ref(false)
let handleKeyPress = null

const refreshPage = async () => {
  isRefreshing.value = true
  try {
    await fetchNotifications()
    if (route.name === 'OrgDashboard' || route.name === 'OrgUsers' || route.name === 'EmployeeManagement' || route.name === 'OrgDepartments' || route.name === 'AdminSchedule') {
      window.dispatchEvent(new Event('page:refresh'))
    }
    setTimeout(() => { isRefreshing.value = false }, 600)
  } catch (err) {
    console.error('Refresh error:', err)
    isRefreshing.value = false
  }
}

// Dynamic Branding Logic
const orgSlug = computed(() => route.params.orgSlug || authStore.user?.orgSlug || 'firm')
const orgName = computed(() => authStore.user?.orgName || 'TrackTimi Firm')
const orgInitial = computed(() => orgName.value.charAt(0).toUpperCase())
const orgLogo = computed(() => {
  const logo = authStore.user?.orgLogo || null
  if (logo && logo.startsWith('data:')) {
    return logo // Already a data URL
  } else if (logo) {
    return `data:image/png;base64,${logo}` // Convert base64 to data URL
  }
  return null
})
const userRole = computed(() => authStore.user?.role || 'Staff')

const userShortName = computed(() => {
  const name = authStore.user?.name || authStore.user?.firstName || 'Admin'
  return name.length > 12 ? name.substring(0, 12) + '...' : name
})

const userInitials = computed(() => {
  return userShortName.value.substring(0, 2).toUpperCase()
})

const userAvatar = computed(() => authStore.user?.avatar || null)
const userAvatarMimeType = computed(() => authStore.user?.avatarMimeType || 'image/png')

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
          { name: 'admin-schedule', label: 'Schedule', path: `${basePath}/admin-schedule`, icon: CalendarIcon },
          { name: 'checkin', label: 'Activity Logs', path: `${basePath}/checkin`, icon: MapPinIcon },
          { name: 'time-tracking', label: 'Time Tracking Report', path: `${basePath}/time-tracking`, icon: ClockIcon },
        ]
      },
      {
        title: 'System',
        items: [
          { name: 'feedback', label: 'Feedback', path: `${basePath}/feedback`, icon: MessageSquareIcon },
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
        { name: 'time-management', label: 'Time Management', path: `${basePath}/time-management`, icon: BarChart3Icon },
        { name: 'checkins', label: 'My History', path: `${basePath}/checkins`, icon: ClipboardListIcon },
      ]
    }
  ]
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Initialize Socket.IO and fetch notifications on mount
onMounted(async () => {
  console.log('🚀 TenantLayout mounted - Initializing real-time notifications')
  
  // Fetch initial notifications
  await fetchNotifications()
  
  // Initialize Socket.IO for real-time updates
  await initSocket()
  
  // Add keyboard shortcut for refresh (Ctrl+R or Cmd+R)
  handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault()
      refreshPage()
    }
  }
  window.addEventListener('keydown', handleKeyPress)
})

// Clean up on unmount
onUnmounted(() => {
  console.log('🧹 TenantLayout unmounted - Cleaning up notifications')
  
  // Clean up Socket.IO and polling
  cleanupNotifications()
  
  // Remove keyboard shortcut listener
  if (handleKeyPress) {
    window.removeEventListener('keydown', handleKeyPress)
  }
})

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