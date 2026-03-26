<template>
  <div class="flex h-screen bg-gray-100">
    <aside :class="[sidebarOpen ? 'w-64' : 'w-0 overflow-hidden', 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-xl flex flex-col transition-all duration-300']">
      <div class="p-6 border-b border-emerald-500 flex items-center justify-between">
        <div class="flex items-center space-x-3"><div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center"><span class="text-xl font-bold text-white">A</span></div><span class="text-lg font-bold">TrackTimi</span></div>
        <button @click="toggleSidebar" class="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400"><span v-if="sidebarOpen">←</span><span v-else>→</span></button>
      </div>
      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link to="/superadmin" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>📊</span><span>Dashboard</span></router-link>
        <router-link to="/superadmin/organizations" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>🏢</span><span>Organizations</span></router-link>
        <router-link to="/superadmin/revenue" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>💰</span><span>Revenue</span></router-link>
        <router-link to="/superadmin/subscriptions" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>📦</span><span>Subscriptions</span></router-link>
        <router-link to="/superadmin/analytics" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>📈</span><span>Analytics</span></router-link>
        <router-link to="/superadmin/monitoring" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg"><span>🔍</span><span>Monitoring</span></router-link>
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>📋</span><span>Audit Logs</span></router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>⚙️</span><span>Settings</span></router-link>
      </nav>
      <div class="p-6 border-t border-emerald-500"><div class="flex items-center space-x-3 cursor-pointer hover:bg-emerald-500 p-3 rounded-lg transition-all"><div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">JS</div><div class="flex-1"><div class="font-semibold text-sm">Jodell Suah</div><div class="text-xs text-emerald-200">Super Admin</div></div></div></div>
    </aside>
    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div class="px-8 py-8"><div class="flex items-center justify-between"><div><h1 class="text-3xl font-bold text-slate-900">Monitoring</h1><p class="text-slate-600 mt-2">System health and performance monitoring</p></div><button @click="handleLogout" class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">Logout</button></div></div></div>
      <div class="p-8">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">API Status</p><div class="flex items-center mt-3"><div :class="['w-3 h-3 rounded-full mr-2', apiStatus === 'All Systems Normal' ? 'bg-green-500' : 'bg-red-500']"></div><p class="text-slate-900 font-semibold">{{ apiStatus }}</p></div></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Uptime</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ uptime }}</p><p class="text-slate-600 text-xs mt-1">This month</p></div>
          <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><p class="text-gray-600 text-sm font-bold uppercase">Avg Response</p><p class="text-4xl font-bold text-slate-900 mt-2">{{ responseTime }}</p><p class="text-green-600 text-xs mt-1">Excellent</p></div>
        </div>

        <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-12">
          <div class="text-gray-500">Checking system status...</div>
        </div>

        <div v-else class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><h2 class="text-xl font-bold text-slate-900 mb-6">Server Status</h2><div class="space-y-3"><div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"><div><p class="font-semibold">API Server</p><p class="text-sm text-slate-600">Production</p></div><div class="flex items-center"><div :class="['w-2 h-2 rounded-full mr-2', serverStatus.api === 'Running' ? 'bg-green-500' : 'bg-red-500']"></div><span :class="['font-semibold', serverStatus.api === 'Running' ? 'text-green-600' : 'text-red-600']">{{ serverStatus.api }}</span></div></div><div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"><div><p class="font-semibold">Database</p><p class="text-sm text-slate-600">SQLite</p></div><div class="flex items-center"><div :class="['w-2 h-2 rounded-full mr-2', serverStatus.db === 'Healthy' ? 'bg-green-500' : 'bg-red-500']"></div><span :class="['font-semibold', serverStatus.db === 'Healthy' ? 'text-green-600' : 'text-red-600']">{{ serverStatus.db }}</span></div></div></div></div>
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
const apiStatus = ref('Checking...')
const uptime = ref('99.9%')
const responseTime = ref('120ms')
const serverStatus = ref({
  api: 'Checking...',
  db: 'Checking...'
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

const checkMonitoring = async () => {
  try {
    loading.value = true
    error.value = ''
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    const startTime = Date.now()
    const dashboardResponse = await axios.get(
      'http://localhost:4000/api/superadmin/dashboard',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    const responseTime_ = Date.now() - startTime

    if (dashboardResponse.data) {
      apiStatus.value = 'All Systems Normal'
      serverStatus.value.api = 'Running'
      serverStatus.value.db = 'Healthy'
      responseTime.value = `${responseTime_}ms`
    }
  } catch (err) {
    console.error('Failed to check monitoring:', err)
    apiStatus.value = 'Error - Check Connection'
    serverStatus.value.api = 'Error'
    serverStatus.value.db = 'Error'
    error.value = 'Failed to check system status'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkMonitoring()
})
</script>

<style scoped>
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>
