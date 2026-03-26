<template>
  <!-- Dashboard Content (sidebar and header provided by TenantLayout) -->
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-slate-600 mt-1">{{ today }}</p>
    </div>

    <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <!-- Total Employees Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Employees</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.total }}</p>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span class="text-xl">👥</span>
              </div>
            </div>
          </div>

          <!-- In Work Today Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">In Work Today</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.present }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span class="text-xl">🚀</span>
              </div>
            </div>
          </div>

          <!-- Passed on Time Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">On-Time Check-ins</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">{{ stats.onTime }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="text-xl">✅</span>
              </div>
            </div>
          </div>

          <!-- Total Assets Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Assets</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">{{ assets.total }}</p>
              </div>
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span class="text-xl">🧾</span>
              </div>
            </div>
          </div>

          <!-- In Use Assets Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Assets In Use</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">{{ assets.inUse }}</p>
              </div>
              <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span class="text-xl">🔧</span>
              </div>
            </div>
          </div>

          <!-- Maintenance Due Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Maintenance Due</p>
                <p class="text-3xl font-bold text-slate-900 mt-2">{{ assets.maintenance }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span class="text-xl">🛠️</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold">{{ error }}</div>

        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">Latest Attendance Logs</h2>
            <span class="text-xs text-gray-500">Showing up to 15 records</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th class="px-4 py-2">Employee</th>
                  <th class="px-4 py-2">Check-in</th>
                  <th class="px-4 py-2">Check-out</th>
                  <th class="px-4 py-2">Status</th>
                  <th class="px-4 py-2">Location</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in attendanceLogs" :key="log.Attend_ID" class="border-t border-gray-100">
                  <td class="px-4 py-2 font-medium text-slate-900">{{ log.First_Name }} {{ log.SurName }}</td>
                  <td class="px-4 py-2">{{ new Date(log.Check_in_time).toLocaleString() }}</td>
                  <td class="px-4 py-2">{{ log.Check_out_time ? new Date(log.Check_out_time).toLocaleString() : '—' }}</td>
                  <td class="px-4 py-2">{{ log.Status_ID === 1 ? 'On Time' : 'Late' }}</td>
                  <td class="px-4 py-2">{{ log.Latitude || 'n/a' }}, {{ log.Longitude || 'n/a' }}</td>
                </tr>
                <tr v-if="attendanceLogs.length === 0">
                  <td colspan="5" class="px-4 py-6 text-center text-gray-500">No logs found yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <h2 class="text-lg font-bold text-slate-900 mb-4">Automated Analysis & Reports</h2>
          <p class="text-sm text-gray-500 mb-3">Summary pulled from latest attendance activity.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase text-gray-500">Average Check-in Duration (mins)</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.avgMinutes }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase text-gray-500">Late Check-ins</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.late }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase text-gray-500">Today Check-ins</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.present }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-xs uppercase text-gray-500">Total to Date</p>
              <p class="text-2xl font-bold text-slate-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Real-time Attendance Status -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-slate-900">Real-time Attendance Status</h2>
              <span class="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              <span class="text-xs text-gray-500">Live</span>
            </div>
            <div class="h-64 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-end justify-center space-x-4 p-6">
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t"
                     :style="{ height: (stats.attendanceChart[0] / 25 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">04:00</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t"
                     :style="{ height: (stats.attendanceChart[1] / 25 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">08:00</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t"
                     :style="{ height: (stats.attendanceChart[2] / 25 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">12:00</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t"
                     :style="{ height: (stats.attendanceChart[3] / 25 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">16:00</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t"
                     :style="{ height: (stats.attendanceChart[4] / 25 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">20:00</span>
              </div>
            </div>
          </div>

          <!-- Weekly Attendance Trend -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-slate-900">Weekly Attendance Trend</h2>
            </div>
            <div class="h-64 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-end justify-center space-x-3 p-6">
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[0] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Mon</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[1] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Tue</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[2] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Wed</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[3] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Thu</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[4] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Fri</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[5] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Sat</span>
              </div>
              <div class="flex flex-col items-center flex-1">
                <div class="w-full bg-gradient-to-t from-purple-400 to-purple-300 rounded-t opacity-70"
                     :style="{ height: (stats.weeklyChart[6] / 100 * 200) + 'px' }"></div>
                <span class="text-xs text-gray-600 mt-2">Sun</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Asset Inventory -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">Asset Inventory</h2>
            <span class="text-xs text-gray-500">Updated just now</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th class="px-4 py-3">Asset</th>
                  <th class="px-4 py-3">Category</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Location</th>
                  <th class="px-4 py-3">Last Checked</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in assetList" :key="item.id" class="border-t border-gray-100">
                  <td class="px-4 py-3 font-medium text-slate-900">{{ item.name }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ item.category }}</td>
                  <td class="px-4 py-3">
                    <span :class="{
                      'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold': item.status === 'In Use',
                      'bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold': item.status === 'Available',
                      'bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold': item.status === 'Maintenance'
                    }">{{ item.status }}</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600">{{ item.location }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ item.lastChecked }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Activity + Quick Actions -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Today's Check-in Activity -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-6">Today's Check-in Activity</h2>
            
            <div v-if="recentCheckins.length === 0" class="text-center py-20">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p class="text-gray-400 text-sm">No activity today</p>
            </div>

            <div v-for="(checkin, idx) in recentCheckins" :key="idx" class="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span class="text-sm">👤</span>
                </div>
                <div>
                  <p class="font-semibold text-slate-900">{{ checkin.name }}</p>
                  <p class="text-xs text-gray-500">{{ checkin.department }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-slate-900">{{ checkin.time }}</p>
                <span class="text-xs font-semibold" :class="checkin.status === 'On Time' ? 'text-green-600' : 'text-orange-600'">
                  {{ checkin.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 class="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
            
            <div class="space-y-3">
              <router-link
                :to="`/${orgSlug}/users/create`"
                class="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-sm"
              >
                <span>👤</span>
                <span>Add Employee</span>
              </router-link>

              <button
                @click="generateReport"
                :disabled="loading"
                class="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-lg transition-all shadow-sm disabled:opacity-60"
              >
                <span>📄</span>
                <span>Generate Report</span>
              </button>

              <router-link
                :to="`/${orgSlug}/geofence`"
                class="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-sm"
              >
                <span>📍</span>
                <span>Create Geofence</span>
              </router-link>
            </div>
          </div>
        </div>

        <div v-if="reportData" class="bg-white rounded-xl border border-blue-200 p-6 shadow-sm mt-6">
          <h2 class="text-lg font-bold text-slate-900 mb-3">Latest Generated Report</h2>
          <p class="text-sm text-gray-600 mb-3">Generated at {{ new Date(reportData.generatedAt).toLocaleString() }}</p>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th class="px-3 py-2">#</th>
                  <th class="px-3 py-2">Employee</th>
                  <th class="px-3 py-2">Check-in</th>
                  <th class="px-3 py-2">Check-out</th>
                  <th class="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in reportData.results.slice(0, 15)" :key="item.id" class="border-t border-gray-100">
                  <td class="px-3 py-2">{{ item.id }}</td>
                  <td class="px-3 py-2">{{ item.name }}</td>
                  <td class="px-3 py-2">{{ new Date(item.checkIn).toLocaleString() }}</td>
                  <td class="px-3 py-2">{{ item.checkOut ? new Date(item.checkOut).toLocaleString() : '—' }}</td>
                  <td class="px-3 py-2">{{ item.statusId === 1 ? 'On Time' : 'Late' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth.js"
import api from "@/utils/api.js"

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const orgSlug = computed(() => route.params.orgSlug || "acmecorp")

const orgName = computed(() => {
  return authStore.user?.orgName || orgSlug.value.charAt(0).toUpperCase() + orgSlug.value.slice(1)
})

const userName = computed(() => {
  return authStore.user?.name?.split(' ')[0] || 'Admin'
})

const userInitial = computed(() => {
  const name = authStore.user?.name || 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
})

const userRole = computed(() => {
  return authStore.user?.role || 'Admin'
})

const isEmployee = computed(() => userRole.value.toLowerCase() === 'employee')
const isAdminUser = computed(() => ['admin', 'orgadmin', 'manager'].includes(userRole.value.toLowerCase()))

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const stats = ref({
  total: 0,
  present: 0,
  onTime: 0,
  late: 0,
  avgMinutes: 0,
  attendanceChart: [2, 5, 12, 8, 3],
  weeklyChart: [65, 72, 58, 80, 90, 75, 40]
})

const assets = ref({
  total: 38,
  inUse: 22,
  maintenance: 4,
  available: 12
})

const recentCheckins = ref([])
const attendanceLogs = ref([])
const weeklyTrend = ref([])
const reportData = ref(null)
const loading = ref(false)
const error = ref(null)

const assetList = ref([
  { id: 1, name: 'MacBook Pro', category: 'Laptop', status: 'In Use', location: 'HQ - Desk 12', lastChecked: 'Today 09:30' },
  { id: 2, name: 'iPhone 14', category: 'Mobile', status: 'Available', location: 'Asset Cabinet', lastChecked: 'Yesterday 16:10' },
  { id: 3, name: 'Projector X220', category: 'Conference', status: 'Maintenance', location: 'Servicing Wing', lastChecked: '2 days ago' },
  { id: 4, name: 'Dell Latitude', category: 'Laptop', status: 'In Use', location: 'Branch B', lastChecked: 'Today 10:00' },
  { id: 5, name: 'Edge Router', category: 'Network', status: 'Available', location: 'Data Center', lastChecked: 'Today 07:20' }
])

const isActive = (path) => {
  return route.path.includes(path)
}

const loadDashboard = async () => {
  loading.value = true
  error.value = null

  try {
    const [summaryRes, logsRes] = await Promise.all([
      api.get('/attendance/summary'),
      api.get('/attendance/logs?limit=15')
    ])

    const summary = summaryRes.data.summary || {}
    stats.value.total = summary.total_checkins || 0
    stats.value.present = summary.today_checkins || 0
    stats.value.onTime = summary.on_time || 0
    stats.value.late = summary.late || 0
    stats.value.avgMinutes = Number(summary.avg_minutes || 0).toFixed(1)
    stats.value.weeklyChart = (summaryRes.data.weeklyTrend || []).map(item => item.total)
    weeklyTrend.value = summaryRes.data.weeklyTrend || []

    attendanceLogs.value = logsRes.data.logs || []
    recentCheckins.value = attendanceLogs.value.slice(0, 8).map(item => ({
      name: `${item.First_Name} ${item.SurName}`,
      department: item.Job_Title || 'N/A',
      time: new Date(item.Check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: item.Status_ID === 1 ? 'On Time' : 'Late'
    }))

  } catch (e) {
    console.error('Dashboard load error', e)
    error.value = e?.response?.data?.error || 'Failed to load dashboard data'
  } finally {
    loading.value = false
  }
}

const generateReport = async () => {
  loading.value = true
  error.value = null

  try {
    const reportRes = await api.get('/attendance/report')
    reportData.value = reportRes.data.report
    alert('Report generated successfully! Check console for report object.')
    console.log('Generated report', reportData.value)
  } catch (e) {
    console.error('Generate report failed', e)
    error.value = e?.response?.data?.error || 'Report generation failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

</script>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}


.sidebar-link{
  display:block;
  padding:10px 14px;
  border-radius:8px;
  color:#d1d5db;
  transition:0.2s;
}

.sidebar-link:hover{
  background:#374151;
}

.sidebar-link.active{
  background:#f97316;
  color:white;
}

.stat-card{
  background:white;
  padding:20px;
  border-radius:14px;
  border:1px solid #e5e7eb;
}

.stat-card p{
  font-size:13px;
  color:#6b7280;
}

.stat-card h2{
  font-size:28px;
  font-weight:bold;
  color:#111827;
}

.card{
  background:white;
  padding:24px;
  border-radius:14px;
  border:1px solid #e5e7eb;
}

.card-title{
  font-weight:bold;
  margin-bottom:16px;
}

.activity-item{
  display:flex;
  justify-content:space-between;
  padding:12px 0;
  border-bottom:1px solid #f1f5f9;
}

.action-btn{
  display:block;
  width:100%;
  padding:12px;
  color:white;
  border-radius:10px;
  text-align:center;
  font-weight:600;
}

</style>