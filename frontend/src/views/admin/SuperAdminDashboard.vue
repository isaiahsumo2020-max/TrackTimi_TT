<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside :class="[
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
        'bg-gradient-to-b from-gray-600 to-emerald-700 text-white shadow-xl flex flex-col transition-all duration-300'
      ]">
      <!-- Logo -->
      <div class="p-6 border-b border-emerald-500 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-xl font-bold text-white">A</span>
          </div>
          <span class="text-lg font-bold">TrackTimi</span>
        </div>
        <button @click="toggleSidebar" class="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400">
          <span v-if="sidebarOpen">←</span>
          <span v-else>→</span>
        </button>
      </div>
      <!-- <div class="p-6 border-b border-emerald-500">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-xl font-bold text-white">A</span>
          </div>
          <span class="text-lg font-bold">TrackTimi</span>
        </div>
      </div> -->

      <!-- Navigation -->
      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link
          to="/superadmin"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all"
          :class="[$route.path === '/superadmin' ? 'bg-orange-500 text-white shadow-lg' : 'text-emerald-100 hover:bg-emerald-500']"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/superadmin/organizations"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>🏢</span>
          <span>Organizations</span>
        </router-link>

        <router-link
          to="/superadmin/revenue"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>💰</span>
          <span>Revenue</span>
        </router-link>

        <router-link
          to="/superadmin/subscriptions"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>📦</span>
          <span>Subscriptions</span>
        </router-link>

        <router-link
          to="/superadmin/analytics"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>📈</span>
          <span>Analytics</span>
        </router-link>

        <router-link
          to="/superadmin/monitoring"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>🔍</span>
          <span>Monitoring</span>
        </router-link>

        <router-link
          to="/superadmin/audit-logs"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>📋</span>
          <span>Audit Logs</span>
        </router-link>

        <router-link
          to="/superadmin/settings"
          class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </router-link>
      </nav>

      <!-- User Profile -->
      <div class="p-6 border-t border-emerald-500">
        <div class="flex items-center space-x-3 cursor-pointer hover:bg-emerald-500 p-3 rounded-lg transition-all">
          <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">
            JS
          </div>
          <div class="flex-1">
            <div class="font-semibold text-sm">Jodell Suah</div>
            <div class="text-xs text-emerald-200">Super Admin</div>
          </div>
          <span>→</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="px-8 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p class="text-slate-600 mt-2">Platform overview and key metrics</p>
            </div>
            <div class="flex items-center space-x-3">
              <button
                @click="refreshData"
                class="flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all shadow-sm"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg font-semibold transition-all">
                Settings
              </button>
              <button @click="handleLogout" class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8">
        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- Organizations Card -->
          <div @click="viewOrganizationsDetail" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Organizations</p>
                <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.organizations }}</p>
                <p class="text-gray-500 text-xs mt-1">Click to view details</p>
              </div>
              <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span class="text-3xl">🏢</span>
              </div>
            </div>
          </div>

          <!-- Total Employees Card -->
          <div @click="viewEmployeesDetail" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Total Employees</p>
                <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.employees }}</p>
                <p class="text-gray-500 text-xs mt-1">Click to view details</p>
              </div>
              <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <span class="text-3xl">👥</span>
              </div>
            </div>
          </div>

          <!-- Today's Check-ins Card -->
          <div @click="viewCheckinsDetail" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-purple-300">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Today's Check-ins</p>
                <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.checkins }}</p>
                <p class="text-gray-500 text-xs mt-1">Click to view details</p>
              </div>
              <div class="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                <span class="text-3xl">👤</span>
              </div>
            </div>
          </div>

          <!-- MRR Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">MRR</p>
                <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.mrr }}</p>
                <p class="text-emerald-600 text-xs mt-1 font-semibold">+12.5% from last month</p>
              </div>
              <div class="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span class="text-3xl">📈</span>
              </div>
            </div>
          </div>

          <!-- Active Subscriptions Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Active Subscriptions</p>
                <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.subscriptions }}</p>
                <p class="text-gray-500 text-xs mt-1">95 paid</p>
              </div>
              <div class="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span class="text-3xl">📦</span>
              </div>
            </div>
          </div>

          <!-- Churn Rate Card -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-bold uppercase tracking-wide">Churn Rate</p>
                <p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.churnRate }}</p>
                <p class="text-red-600 text-xs mt-1 font-semibold">Last 30 days</p>
              </div>
              <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
                <span class="text-3xl">📉</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Organization Growth Chart -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-900">Organization Growth (6 Months)</h2>
              <a href="#" class="text-emerald-600 font-semibold text-sm hover:text-emerald-700">View Details →</a>
            </div>
            <div class="h-64 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg flex items-end justify-center space-x-1 p-4">
              <div v-for="(value, idx) in chartData.growth" :key="idx" class="flex flex-col items-center flex-1">
                <div 
                  class="w-full bg-gradient-to-t from-slate-400 to-slate-300 rounded-t opacity-70 transition-all hover:opacity-100"
                  :style="{ height: (value / 35) * 100 + '%' }"
                ></div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mt-4 px-2">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
            </div>
          </div>

          <!-- Revenue Trend Chart -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-900">Revenue Trend (MRR)</h2>
              <a href="#" class="text-emerald-600 font-semibold text-sm hover:text-emerald-700">View Details →</a>
            </div>
            <div class="h-64 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg flex items-end justify-center space-x-2 p-4">
              <div v-for="(value, idx) in chartData.revenue" :key="idx" class="flex-1">
                <div 
                  class="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t transition-all hover:opacity-80"
                  :style="{ height: (value / 200000) * 100 + '%' }"
                ></div>
              </div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mt-4 px-2">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
            </div>
          </div>

          <!-- Global Attendance Trend -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-900">Global Attendance Trend</h2>
              <a href="#" class="text-emerald-600 font-semibold text-sm hover:text-emerald-700">View Details →</a>
            </div>
            <div class="h-64 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg flex items-end justify-center p-4">
              <svg class="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                <polyline
                  points="0,180 50,160 100,140 150,120 200,100 250,90 300,80 350,70 400,60"
                  fill="none"
                  stroke="#06b6d4"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <!-- Subscription Plan Distribution -->
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-900">Subscription Plan Distribution</h2>
              <a href="#" class="text-emerald-600 font-semibold text-sm hover:text-emerald-700">View Details →</a>
            </div>
            <div class="h-64 flex items-center justify-center">
              <div class="relative w-48 h-48 rounded-full" style="background: conic-gradient(#2563eb 0deg 90deg, #000000 90deg 270deg, #0ea5e9 270deg);">
                <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center text-center">
                    <div>
                      <p class="text-sm text-gray-600">Active</p>
                      <p class="text-2xl font-bold text-slate-900">85%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Organizations Detail Modal -->
        <div v-if="selectedModalType === 'organizations'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Organizations Overview</h2>
              <button @click="selectedModalType = null" class="text-2xl hover:text-emerald-200">&times;</button>
            </div>
            <div class="p-8">
              <div v-if="organizationsList.length" class="space-y-3">
                <div v-for="org in organizationsList.slice(0, 10)" :key="org.Org_ID" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-all">
                  <div class="flex-1">
                    <p class="font-semibold text-slate-900">{{ org.Org_Name }}</p>
                    <p class="text-xs text-gray-600">ID: {{ org.Org_ID }}</p>
                  </div>
                  <div class="flex items-center space-x-4">
                    <span :class="['px-3 py-1 rounded-full text-xs font-semibold', org.Is_Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                      {{ org.Is_Active ? 'Active' : 'Inactive' }}
                    </span>
                    <router-link :to="`/superadmin/organizations`" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all text-sm">
                      Manage
                    </router-link>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-12">
                <p class="text-gray-500">No organizations found</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Employees Detail Modal -->
        <div v-if="selectedModalType === 'employees'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Employees Overview</h2>
              <button @click="selectedModalType = null" class="text-2xl hover:text-blue-200">&times;</button>
            </div>
            <div class="p-8">
              <div v-if="employeesList.length" class="space-y-3">
                <div v-for="emp in employeesList.slice(0, 10)" :key="emp.User_ID" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="flex-1">
                    <p class="font-semibold text-slate-900">{{ emp.Full_Name }}</p>
                    <p class="text-xs text-gray-600">{{ emp.Email }}</p>
                  </div>
                  <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{{ emp.Role }}</span>
                </div>
              </div>
              <div v-else class="text-center py-12">
                <p class="text-gray-500">No employees found</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Check-ins Detail Modal -->
        <div v-if="selectedModalType === 'checkins'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between">
              <h2 class="text-2xl font-bold">Today's Check-ins</h2>
              <button @click="selectedModalType = null" class="text-2xl hover:text-purple-200">&times;</button>
            </div>
            <div class="p-8">
              <div v-if="checkinsList.length" class="space-y-3">
                <div v-for="(checkin, idx) in checkinsList.slice(0, 10)" :key="idx" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div class="flex-1">
                    <p class="font-semibold text-slate-900">{{ checkin.employeeId }}</p>
                    <p class="text-xs text-gray-600">{{ checkin.time }}</p>
                  </div>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Checked In</span>
                </div>
              </div>
              <div v-else class="text-center py-12">
                <p class="text-gray-500">No check-ins found for today</p>
              </div>
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
import axios from 'axios'

const router = useRouter()

const sidebarOpen = ref(true)
const selectedModalType = ref(null)
const organizationsList = ref([])
const employeesList = ref([])
const checkinsList = ref([])

const metrics = ref({
  organizations: 0,
  employees: 0,
  checkins: 0,
  mrr: '$0',
  subscriptions: 0,
  churnRate: '0%'
})

const chartData = ref({
  growth: [12, 18, 15, 23, 20, 32],
  revenue: [25000, 28000, 26000, 32000, 35000, 180000]
})

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

const loadDashboardData = async () => {
  try {
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    const response = await axios.get(
      'http://localhost:4000/api/superadmin/dashboard',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.stats) {
      const stats = response.data.stats
      metrics.value = {
        organizations: stats.totalOrgs || 0,
        employees: stats.totalUsers || 0,
        checkins: stats.todayCheckins || 0,
        mrr: '$' + (stats.mrr || 0).toLocaleString(),
        subscriptions: stats.totalSubscriptions || 0,
        churnRate: (stats.churnRate || 0).toFixed(1) + '%'
      }
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

const viewOrganizationsDetail = async () => {
  try {
    const token = localStorage.getItem('superAdminToken')
    const response = await axios.get('http://localhost:4000/api/superadmin/organizations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    organizationsList.value = response.data?.organizations || []
    selectedModalType.value = 'organizations'
  } catch (error) {
    console.error('Failed to load organizations:', error)
  }
}

const viewEmployeesDetail = async () => {
  try {
    const token = localStorage.getItem('superAdminToken')
    const response = await axios.get('http://localhost:4000/api/superadmin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    employeesList.value = response.data?.users || []
    selectedModalType.value = 'employees'
  } catch (error) {
    console.error('Failed to load employees:', error)
  }
}

const viewCheckinsDetail = async () => {
  try {
    const token = localStorage.getItem('superAdminToken')
    // Simulate check-ins for today
    const today = new Date().toDateString()
    checkinsList.value = [
      { employeeId: 'EMP001', time: 'Today 08:15 AM', org: 'Company A' },
      { employeeId: 'EMP002', time: 'Today 08:22 AM', org: 'Company B' },
      { employeeId: 'EMP003', time: 'Today 08:30 AM', org: 'Company C' },
      { employeeId: 'EMP004', time: 'Today 08:45 AM', org: 'Company A' },
      { employeeId: 'EMP005', time: 'Today 09:00 AM', org: 'Company D' }
    ]
    selectedModalType.value = 'checkins'
  } catch (error) {
    console.error('Failed to load check-ins:', error)
  }
}

const refreshData = async () => {
  console.log('Refreshing dashboard data...')
  await loadDashboardData()
}

onMounted(() => {
  loadDashboardData()
})
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
</style>
