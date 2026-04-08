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
        <h1 class="text-xl font-black uppercase" style="color: #000000;">Reports & Export</h1>
        <div class="flex items-center space-x-3">
          <button @click="generateReport('pdf')" class="px-4 py-2 rounded-lg text-xs font-bold uppercase text-white" style="background-color: #0284c7;">
            PDF Export
          </button>
          <button @click="generateReport('csv')" class="px-4 py-2 rounded-lg text-xs font-bold uppercase text-white" style="background-color: #ea580c;">
            CSV Export
          </button>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-10 space-y-8">
        <!-- Report Builder -->
        <div class="bg-white rounded-lg border border-slate-100 p-8">
          <h2 class="text-sm font-black uppercase mb-6" style="color: #000000;">Create Custom Report</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label class="text-xs font-bold uppercase block mb-2" style="color: #000000;">Report Type</label>
              <select v-model="reportType" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="attendance">Attendance Overview</option>
                <option value="users">User Activity</option>
                <option value="departments">Department Summary</option>
                <option value="revenue">Revenue Summary</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold uppercase block mb-2" style="color: #000000;">Date Range</label>
              <select v-model="dateRange" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-bold uppercase block mb-2" style="color: #000000;">Organization</label>
              <select v-model="selectedOrg" class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">All Organizations</option>
                <option value="org1">Organization 1</option>
              </select>
            </div>
          </div>

          <button @click="previewReport" class="px-6 py-2 text-white rounded-lg font-bold uppercase text-xs" style="background-color: #0284c7;">
            Preview Report
          </button>
        </div>

        <!-- Quick Reports -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h3 class="text-sm font-black uppercase mb-4" style="color: #000000;">Attendance Summary</h3>
            <div class="space-y-3">
              <button @click="generateReport('attendance')" class="w-full p-3 rounded-lg text-xs font-bold uppercase" style="background-color: #F0F9FF; color: #D97A2B;">
                Generate Attendance Report
              </button>
              <p class="text-[10px]" style="color: #000000;">Daily check-ins, attendance trends, absence patterns</p>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h3 class="text-sm font-black uppercase mb-4" style="color: #000000;">User Activity</h3>
            <div class="space-y-3">
              <button @click="generateReport('activity')" class="w-full p-3 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100 uppercase">
                Generate Activity Report
              </button>
              <p class="text-[10px] text-slate-500">User logins, department activity, peak hours</p>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h3 class="text-sm font-black text-slate-900 uppercase mb-4">Department Analytics</h3>
            <div class="space-y-3">
              <button @click="generateReport('departments')" class="w-full p-3 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 uppercase">
                Generate Department Report
              </button>
              <p class="text-[10px] text-slate-500">Department-wise statistics, performance metrics</p>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-slate-100 p-8">
            <h3 class="text-sm font-black text-slate-900 uppercase mb-4">Revenue Summary</h3>
            <div class="space-y-3">
              <button @click="generateReport('revenue')" class="w-full p-3 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 uppercase">
                Generate Revenue Report
              </button>
              <p class="text-[10px] text-slate-500">Billing overview, payment status, MRR calculation</p>
            </div>
          </div>
        </div>

        <!-- Scheduled Reports -->
        <div class="bg-white rounded-lg border border-slate-100 p-8">
          <h2 class="text-sm font-black text-slate-900 uppercase mb-6">Scheduled Reports</h2>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="text-xs font-bold text-slate-900">Weekly Attendance Report</p>
                <p class="text-[10px] text-slate-500">Every Monday at 9:00 AM</p>
              </div>
              <input type="checkbox" checked class="w-4 h-4">
            </div>
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p class="text-xs font-bold text-slate-900">Monthly Revenue Report</p>
                <p class="text-[10px] text-slate-500">First day of month at 12:00 PM</p>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAttendanceAnalytics, getUsers, getDepartments, getRevenueSummary } from '@/services/superadminApi'
import {
  ZapIcon, MenuIcon, ChevronLeftIcon, LayoutDashboardIcon,
  BuildingIcon, UsersIcon, TrendingUpIcon, MapPinIcon, BriefcaseIcon,
  ClockIcon, ActivityIcon, FileTextIcon, AlertCircleIcon, ShieldAlertIcon, SettingsIcon
} from 'lucide-vue-next'

const router = useRouter()
const sidebarOpen = ref(true)
const reportType = ref('attendance')
const dateRange = ref('30days')
const selectedOrg = ref('')

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

const generateReport = async (type) => {
  try {
    let res
    const days = dateRange.value === '7days' ? 7 : dateRange.value === '30days' ? 30 : dateRange.value === '90days' ? 90 : 365
    
    switch (type) {
      case 'pdf':
      case 'csv':
        alert(`Generating ${type.toUpperCase()} report for ${reportType.value}...`)
        return
      case 'attendance':
        res = await getAttendanceAnalytics(days)
        break
      case 'activity':
        res = await getUsers()
        break
      case 'departments':
        res = await getDepartments()
        break
      case 'revenue':
        res = await getRevenueSummary()
        break
      default:
        return
    }

    if (res.data.success) {
      alert(`Generated ${type} report successfully!`)
      console.log('Report data:', res.data)
    }
  } catch (error) {
    console.error('Failed to generate report:', error)
    alert('Failed to generate report')
  }
}

const previewReport = async () => {
  try {
    let res
    const days = dateRange.value === '7days' ? 7 : dateRange.value === '30days' ? 30 : dateRange.value === '90days' ? 90 : 365
    
    if (reportType.value === 'attendance') {
      res = await getAttendanceAnalytics(days)
    } else if (reportType.value === 'users') {
      res = await getUsers()
    } else if (reportType.value === 'departments') {
      res = await getDepartments()
    } else if (reportType.value === 'revenue') {
      res = await getRevenueSummary()
    }

    if (res && res.data.success) {
      alert(`Preview: ${reportType.value} report - ${days} days\n\n` + JSON.stringify(res.data, null, 2).substring(0, 200) + '...')
    }
  } catch (error) {
    console.error('Failed to preview report:', error)
    alert('Failed to preview report')
  }
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  router.push('/superadmin/login')
}
</script>

<style scoped>
input[type="checkbox"] {
  cursor: pointer;
}
</style>

