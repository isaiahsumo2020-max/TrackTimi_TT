<template>
  <div class="flex h-screen bg-gray-100">
    <aside :class="[sidebarOpen ? 'w-64' : 'w-0 overflow-hidden', 'bg-gradient-to-b from-gray-700 to-gray-700 text-white shadow-xl flex flex-col transition-all duration-300']">
      <div class="p-6 border-b border-gray-700 flex items-center justify-between">
        <div class="flex items-center space-x-3"><div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center"><span class="text-xl font-bold text-white">A</span></div><span class="text-lg font-bold">TrackTimi</span></div>
        <button @click="toggleSidebar" class="p-1 rounded-lg bg-gray-700 hover:bg-gray-600"><span v-if="sidebarOpen">←</span><span v-else>→</span></button>
      </div>
      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link to="/superadmin" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-700"><span>📊</span><span>Dashboard</span></router-link>
        <router-link to="/superadmin/organizations" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500"><span>🏢</span><span>Organizations</span></router-link>
        <router-link to="/superadmin/revenue" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500"><span>💰</span><span>Revenue</span></router-link>
        <router-link to="/superadmin/subscriptions" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500"><span>📦</span><span>Subscriptions</span></router-link>
        <router-link to="/superadmin/analytics" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg"><span>📈</span><span>Analytics</span></router-link>
        <router-link to="/superadmin/monitoring" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500"><span>🔍</span><span>Monitoring</span></router-link>
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500"><span>📋</span><span>Audit Logs</span></router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500"><span>⚙️</span><span>Settings</span></router-link>
      </nav>
      <div class="p-6 border-t border-gray-500"><div class="flex items-center space-x-3 cursor-pointer hover:bg-gray-500 p-3 rounded-lg transition-all"><div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">JS</div><div class="flex-1"><div class="font-semibold text-sm">Jodell Suah</div><div class="text-xs text-gray-400">Super Admin</div></div></div></div>
    </aside>
    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div class="px-8 py-8"><div class="flex items-center justify-between"><div><h1 class="text-3xl font-bold text-slate-900">Analytics</h1><p class="text-slate-600 mt-2">Platform analytics and trend analysis</p></div><button @click="handleLogout" class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">Logout</button></div></div></div>
      <div class="p-8">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Total Orgs</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.newOrgs }}</p><p class="text-green-600 text-xs mt-1">+5.2% this month</p></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Active Users</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.activeUsers }}</p><p class="text-green-600 text-xs mt-1">Across platform</p></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Today Checkins</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.avgCheckins }}</p><p class="text-slate-600 text-xs mt-1">Attendance records</p></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Retention</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ metrics.retention }}</p><p class="text-green-600 text-xs mt-1">3-month cohort</p></div>
        </div>

        <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-12">
          <div class="text-gray-500">Loading analytics...</div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><h2 class="text-xl font-bold text-slate-900 mb-6">Usage Trends</h2><div class="h-64 bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg flex items-end justify-center p-4 space-x-2"><div v-for="i in 7" :key="i" class="flex-1 bg-emerald-400 rounded-t" :style="{ height: Math.random() * 100 + '%' }"></div></div></div>
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
const metrics = ref({
  newOrgs: 0,
  activeUsers: 0,
  avgCheckins: 0,
  retention: '87%'
})
const loading = ref(false)
const error = ref('')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

const loadAnalyticsData = async () => {
  try {
    loading.value = true
    error.value = ''
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

    if (response.data) {
      const dashboardData = response.data
      metrics.value = {
        newOrgs: dashboardData.totalOrgs || 0,
        activeUsers: (dashboardData.totalUsers || 0),
        avgCheckins: dashboardData.todayCheckins || 0,
        retention: '87%'
      }
    }
  } catch (err) {
    console.error('Failed to load analytics data:', err)
    error.value = 'Failed to load analytics data'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnalyticsData()
})
</script>

<style scoped>
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>
