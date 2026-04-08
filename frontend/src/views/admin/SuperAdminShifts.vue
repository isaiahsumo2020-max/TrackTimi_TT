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
        <h1 class="text-xl font-black uppercase" style="color: #000000;">Shifts</h1>
        <button @click="loadShifts" class="p-3 bg-slate-50 rounded-xl hover:bg-slate-100" style="color: #0284c7;">
          <RefreshCwIcon :class="{'animate-spin': loading}" class="w-4 h-4" />
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-8">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Total Shifts</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0284c7;">{{ shifts.length }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Assigned Users</p>
            <h3 class="text-3xl font-black mt-2" style="color: #0284c7;">{{ totalAssigned }}</h3>
          </div>
          <div class="bg-white p-6 rounded-lg border border-slate-100">
            <p class="text-[10px] font-black uppercase" style="color: #000000;">Organizations</p>
            <h3 class="text-3xl font-black mt-2" style="color: #F2D479;">{{ uniqueOrgs }}</h3>
          </div>
        </div>

        <!-- Shifts Table -->
        <div class="bg-white rounded-lg border border-slate-100 overflow-hidden">
          <div class="p-8 border-b border-slate-100">
            <h2 class="text-sm font-black uppercase" style="color: #000000;">All Shifts</h2>
          </div>

          <div v-if="shifts.length > 0" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-slate-50 border-b border-slate-100">
                <tr class="text-[9px] font-black uppercase tracking-widest" style="color: #000000;">
                  <th class="px-6 py-4">Shift Name</th>
                  <th class="px-6 py-4">Organization</th>
                  <th class="px-6 py-4">Start Time</th>
                  <th class="px-6 py-4">End Time</th>
                  <th class="px-6 py-4">Assigned Users</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="shift in shifts" :key="shift.Shift_ID" class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <p class="text-xs font-bold" style="color: #000000;">{{ shift.Shift_Name }}</p>
                  </td>
                  <td class="px-6 py-4 text-xs" style="color: #000000;">{{ shift.Org_Name }}</td>
                  <td class="px-6 py-4 text-xs font-mono" style="color: #0284c7;">{{ formatTime(shift.Start_Time) }}</td>
                  <td class="px-6 py-4 text-xs font-mono" style="color: #0284c7;">{{ formatTime(shift.End_Time) }}</td>
                  <td class="px-6 py-4 text-xs font-bold" style="color: #000000;">{{ shift.assigned_users }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-8 text-center" style="color: #000000;">
            <p class="text-sm font-bold">No shifts found</p>
          </div>
        </div>

        <!-- Shift Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h2 class="text-sm font-black text-slate-900 uppercase mb-6">Top Shifts by Assignment</h2>
            <div class="space-y-3">
              <div v-for="(shift, idx) in shifts.slice(0, 5)" :key="shift.Shift_ID" class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <p class="text-xs font-bold text-slate-900">{{ shift.Shift_Name }}</p>
                <span class="text-xs font-black text-primary-600">{{ shift.assigned_users }} users</span>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h2 class="text-sm font-black text-slate-900 uppercase mb-6">Organizations Overview</h2>
            <div class="space-y-3">
              <div v-for="org in organizationStats" :key="org.name" class="p-3 bg-slate-50 rounded-lg">
                <p class="text-xs font-bold text-slate-900">{{ org.name }}</p>
                <div class="flex justify-between mt-1 text-[10px] text-slate-600">
                  <span>Shifts: {{ org.shiftCount }}</span>
                  <span>Users: {{ org.userCount }}</span>
                </div>
              </div>
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
import { getShifts } from '@/services/superadminApi'
import {
  ZapIcon, MenuIcon, ChevronLeftIcon, RefreshCwIcon, LayoutDashboardIcon,
  BuildingIcon, UsersIcon, TrendingUpIcon, MapPinIcon, BriefcaseIcon,
  ClockIcon, ActivityIcon, FileTextIcon, AlertCircleIcon, ShieldAlertIcon, SettingsIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const loading = ref(false)
const shifts = ref([])

const totalAssigned = computed(() => shifts.value.reduce((sum, s) => sum + (s.assigned_users || 0), 0))
const uniqueOrgs = computed(() => new Set(shifts.value.map(s => s.Org_ID)).size)

const organizationStats = computed(() => {
  const stats = {}
  shifts.value.forEach(shift => {
    if (!stats[shift.Org_Name]) {
      stats[shift.Org_Name] = { name: shift.Org_Name, shiftCount: 0, userCount: 0 }
    }
    stats[shift.Org_Name].shiftCount++
    stats[shift.Org_Name].userCount += shift.assigned_users || 0
  })
  return Object.values(stats)
})

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

const loadShifts = async () => {
  loading.value = true
  try {
    const res = await getShifts()
    if (res.data.success && res.data.shifts) {
      shifts.value = res.data.shifts
    }
  } catch (error) {
    console.error('Failed to load shifts:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A'
  return timeStr
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  router.push('/superadmin/login')
}

onMounted(loadShifts)
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

