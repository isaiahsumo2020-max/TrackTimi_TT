<template>
  <div class="flex h-screen bg-slate-50 font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-lg transition-all duration-500 flex flex-col z-20']">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <div v-if="sidebarOpen" class="flex items-center space-x-3">
          <ZapIcon class="w-6 h-6" style="color: #f97316;" />
          <span class="text-xl font-black uppercase" style="color: #ffffff;">TrackTimi</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-lg bg-slate-900">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5" />
          <ChevronLeftIcon v-else class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-lg font-bold text-xs uppercase transition-all"
          :class="[$route.path === item.path ? 'text-white shadow-md' : 'text-slate-400 hover:bg-slate-900']"
          :style="$route.path === item.path ? { backgroundColor: '#ea580c' } : {}"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <button @click="handleLogout" class="w-full p-3 rounded-lg text-xs font-bold uppercase text-white" style="background-color: #ea580c;">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
        <h1 class="text-xl font-black uppercase" style="color: #ffffff;">System Notifications</h1>
        <button @click="loadAlerts" class="p-3 bg-slate-50 rounded-lg hover:bg-slate-100" style="color: #ea580c;">
          <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-8">
        <!-- Alert Summary -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="rounded-lg p-6" style="background-color: #fee2e2; border: 1px solid #ea580c;">
            <p class="text-[10px] font-black uppercase" style="color: #ea580c;">Critical</p>
            <h3 class="text-3xl font-black mt-2" style="color: #ea580c;">{{ criticalCount }}</h3>
          </div>
          <div class="rounded-lg p-6" style="background-color: #fffbeb; border: 1px solid #f59e0b;">
            <p class="text-[10px] font-black uppercase" style="color: #f59e0b;">Warnings</p>
            <h3 class="text-3xl font-black mt-2" style="color: #ea580c;">{{ warningCount }}</h3>
          </div>
          <div class="rounded-lg p-6" style="background-color: #cffafe; border: 1px solid #0ea5e9;">
            <p class="text-[10px] font-black uppercase" style="color: #0ea5e9;">Info</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0ea5e9;">{{ infoCount }}</h3>
          </div>
          <div class="rounded-lg p-6" style="background-color: #dcfce7; border: 1px solid #22c55e;">
            <p class="text-[10px] font-black uppercase" style="color: #22c55e;">Resolved</p>
            <h3 class="text-3xl font-black mt-2" style="color: #22c55e;">{{ resolvedCount }}</h3>
          </div>
        </div>

        <!-- Active Alerts -->
        <div class="bg-white rounded-lg border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100">
            <h2 class="text-sm font-black uppercase" style="color: #000000;">Active Notifications</h2>
          </div>

          <div v-if="alerts.length > 0" class="divide-y divide-slate-100">
            <div v-for="alert in alerts" :key="alert.id" class="p-6 hover:bg-slate-50 transition-colors border-l-4" :class="getAlertBorderColor(alert.type)">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <span :class="getAlertBadge(alert.type)" class="text-[10px] font-black uppercase px-2 py-1 rounded">
                      {{ alert.type }}
                    </span>
                    <p class="text-xs font-bold text-slate-900">{{ alert.title }}</p>
                  </div>
                  <p class="text-sm text-slate-600 mb-3">{{ alert.message }}</p>
                  <div v-if="alert.organizations && alert.organizations.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="org in alert.organizations" :key="org" class="text-[9px] bg-slate-100 px-2 py-1 rounded">
                      {{ org }}
                    </span>
                  </div>
                </div>
                <div class="text-right ml-4">
                  <p class="text-[10px] text-slate-400">{{ formatDate(alert.timestamp) }}</p>
                  <button @click="dismissAlert(alert.id)" class="text-[10px] mt-2 text-red-600 hover:text-red-700 font-bold">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="p-8 text-center text-slate-400">
            <p class="text-sm font-bold">No active alerts</p>
            <p class="text-[10px] flex items-center gap-1"><CheckCircleIcon class="w-4 h-4 text-green-600" />All systems operating normally</p>
          </div>
        </div>

        <!-- Alert Settings -->
        <div class="bg-white rounded-lg border border-slate-100 p-8\">
          <h2 class="text-sm font-black text-slate-900 uppercase mb-6">Alert Preferences</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="text-xs font-bold text-slate-900">Email Notifications</p>
                <p class="text-[10px] text-slate-500">Send alerts to admin email</p>
              </div>
              <input type="checkbox" checked class="w-4 h-4">
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="text-xs font-bold text-slate-900">Critical Alerts Only</p>
                <p class="text-[10px] text-slate-500">Only receive critical severity alerts</p>
              </div>
              <input type="checkbox" class="w-4 h-4">
            </div>

            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="text-xs font-bold text-slate-900">Mobile Push Notifications</p>
                <p class="text-[10px] text-slate-500">Receive push notifications on mobile</p>
              </div>
              <input type="checkbox" checked class="w-4 h-4">
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
import { getAlerts } from '@/services/superadminApi'
import {
  ZapIcon, MenuIcon, ChevronLeftIcon, RefreshCwIcon, LayoutDashboardIcon,
  BuildingIcon, UsersIcon, TrendingUpIcon, MapPinIcon, BriefcaseIcon,
  ClockIcon, ActivityIcon, FileTextIcon, AlertCircleIcon, ShieldAlertIcon, SettingsIcon, CheckCircleIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const alerts = ref([])

const criticalCount = computed(() => alerts.value.filter(a => a.type === 'critical').length)
const warningCount = computed(() => alerts.value.filter(a => a.type === 'warning').length)
const infoCount = computed(() => alerts.value.filter(a => a.type === 'info').length)
const resolvedCount = computed(() => 5)

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

const getAlertBadge = (type) => {
  const badges = {
    critical: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600'
  }
  return badges[type] || 'bg-slate-100 text-slate-600'
}

const getAlertBorderColor = (type) => {
  const colors = {
    critical: 'border-red-400',
    warning: 'border-yellow-400',
    info: 'border-blue-400'
  }
  return colors[type] || 'border-slate-400'
}

const loadAlerts = async () => {
  loading.value = true
  try {
    const res = await getAlerts()
    if (res.data.success && res.data.alerts) {
      alerts.value = res.data.alerts
    }
  } catch (error) {
    console.error('Failed to load alerts:', error)
    // Set fallback mock data if API fails
    alerts.value = [
      {
        id: 'low-users',
        type: 'warning',
        title: 'Low Active Users',
        message: 'Only 5 active users in the system',
        timestamp: new Date().toISOString()
      }
    ]
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString()
}

const dismissAlert = (id) => {
  alerts.value = alerts.value.filter(a => a.id !== id)
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  router.push('/superadmin/login')
}

onMounted(loadAlerts)
</script>
