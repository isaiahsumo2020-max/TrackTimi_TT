<template>
  <div class="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
    <!-- Sidebar -->
    <aside :class="[sidebarOpen ? 'w-72' : 'w-20', 'bg-slate-950 text-white shadow-2xl transition-all duration-500 flex flex-col z-20']">
      <div class="p-6 border-b border-slate-800 flex items-center justify-between">
        <div v-if="sidebarOpen" class="flex items-center space-x-3">
          <ZapIcon class="w-6 h-6" style="color: #F2D479;" />
          <span class="text-xl font-black uppercase" style="color: #000000;">TrackTimi</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-xl bg-slate-900">
          <MenuIcon v-if="!sidebarOpen" class="w-5 h-5" />
          <ChevronLeftIcon v-else class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path"
          class="flex items-center space-x-4 px-4 py-3.5 rounded-lg font-bold text-xs uppercase transition-all"
          :class="[$route.path === item.path ? 'text-white shadow-xl' : 'text-slate-400 hover:bg-slate-900']"
          :style="$route.path === item.path ? { backgroundColor: '#0284c7' } : {}"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-slate-800">
        <button @click="handleLogout" class="w-full p-3 rounded-xl text-xs font-bold uppercase text-white" style="background-color: #0284c7;">
          Logout
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <header class="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-10">
        <h1 class="text-xl font-black uppercase" style="color: #000000;">Departments</h1>
        <button @click="loadDepartments" class="p-3 bg-slate-50 rounded-xl hover:bg-slate-100" style="color: #0284c7;">
          <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-8">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Total Departments</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0284c7;">{{ departments.length }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Total Staff</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0284c7;">{{ totalUsers }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Check-ins Today</p>
            <h3 class="text-3xl font-black mt-2" style="color: #ea580c;">{{ totalCheckins }}</h3>
          </div>
        </div>

        <!-- Departments Table -->
        <div class="bg-white rounded-lg border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100">
            <h2 class="text-sm font-black uppercase" style="color: #000000;">All Departments</h2>
          </div>

          <div v-if="departments.length > 0" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-slate-50 border-b border-slate-100">
                <tr class="text-[9px] font-black uppercase tracking-widest" style="color: #000000;">
                  <th class="px-6 py-4">Department</th>
                  <th class="px-6 py-4">Organization</th>
                  <th class="px-6 py-4">Staff Count</th>
                  <th class="px-6 py-4">Today's Checkins</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="dept in departments" :key="dept.Dep_ID" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <p class="text-xs font-bold text-slate-900">{{ dept.Depart_Name }}</p>
                  </td>
                  <td class="px-6 py-4 text-xs text-slate-600">{{ dept.Org_Name }}</td>
                  <td class="px-6 py-4 text-xs font-bold text-primary-600">{{ dept.user_count }}</td>
                  <td class="px-6 py-4 text-xs font-bold text-accent-600">{{ dept.today_checkins || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-8 text-center text-slate-400">
            <p class="text-sm font-bold">No departments found</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDepartments } from '@/services/superadminApi'
import {
  ZapIcon, MenuIcon, ChevronLeftIcon, RefreshCwIcon, LayoutDashboardIcon,
  BuildingIcon, UsersIcon, TrendingUpIcon, MapPinIcon, BriefcaseIcon,
  ClockIcon, ActivityIcon, FileTextIcon, AlertCircleIcon, ShieldAlertIcon, SettingsIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const departments = ref([])

const totalUsers = computed(() => departments.value.reduce((sum, d) => sum + (d.user_count || 0), 0))
const totalCheckins = computed(() => departments.value.reduce((sum, d) => sum + (d.today_checkins || 0), 0))

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

const loadDepartments = async () => {
  loading.value = true
  try {
    const res = await getDepartments()
    if (res.data.success && res.data.departments) {
      departments.value = res.data.departments
    }
  } catch (error) {
    console.error('Failed to load departments:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  router.push('/superadmin/login')
}

onMounted(loadDepartments)
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

