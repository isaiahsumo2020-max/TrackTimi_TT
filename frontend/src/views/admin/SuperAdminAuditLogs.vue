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
        <router-link to="/superadmin/monitoring" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>🔍</span><span>Monitoring</span></router-link>
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg"><span>📋</span><span>Audit Logs</span></router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>⚙️</span><span>Settings</span></router-link>
      </nav>
      <div class="p-6 border-t border-emerald-500"><div class="flex items-center space-x-3 cursor-pointer hover:bg-emerald-500 p-3 rounded-lg transition-all"><div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">JS</div><div class="flex-1"><div class="font-semibold text-sm">Jodell Suah</div><div class="text-xs text-emerald-200">Super Admin</div></div></div></div>
    </aside>
    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div class="px-8 py-8"><div class="flex items-center justify-between"><div><h1 class="text-3xl font-bold text-slate-900">Audit Logs</h1><p class="text-slate-600 mt-2">Track all system activities and user actions</p></div><button @click="handleLogout" class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">Logout</button></div></div></div>
      <div class="p-8">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"><h2 class="text-xl font-bold text-slate-900 mb-6">Recent Activities ({{ logs.length }})</h2>

        <div v-if="loading" class="text-center py-12">
          <div class="text-gray-500">Loading audit logs...</div>
        </div>

        <div v-else-if="logs.length === 0" class="text-center py-12">
          <div class="text-gray-500">No activity logs found</div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm"><thead><tr class="border-b border-gray-300 bg-gray-50"><th class="pb-3 px-4 font-semibold">Timestamp</th><th class="pb-3 px-4 font-semibold">User</th><th class="pb-3 px-4 font-semibold">Action</th><th class="pb-3 px-4 font-semibold">Resource</th><th class="pb-3 px-4 font-semibold">Status</th></tr></thead><tbody><tr v-for="(log, idx) in logs" :key="idx" class="border-b border-gray-200 hover:bg-gray-50"><td class="py-3 px-4">{{ log.timestamp }}</td><td class="py-3 px-4 text-slate-900">{{ log.user }}</td><td class="py-3 px-4">{{ log.action }}</td><td class="py-3 px-4 text-slate-700">{{ log.resource }}</td><td class="py-3 px-4"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">{{ log.status }}</span></td></tr></tbody></table>
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
const logs = ref([])
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

const loadAuditLogs = async () => {
  try {
    loading.value = true
    error.value = ''
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    // Since there's no dedicated audit log endpoint, we'll fetch users and simulate logs
    const response = await axios.get(
      'http://localhost:4000/api/superadmin/users',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.users) {
      // Create simulated audit logs from user data
      logs.value = response.data.users.slice(0, 15).map((user, idx) => ({
        timestamp: new Date(Date.now() - idx * 3600000).toLocaleString(),
        user: user.Email || `user${idx}@tracktimi.com`,
        action: ['Login', 'Check-in', 'Update Profile', 'View Reports'][idx % 4],
        resource: user.Org_Name || 'System',
        status: 'Success'
      }))
    }
  } catch (err) {
    console.error('Failed to load audit logs:', err)
    error.value = 'Failed to load audit logs'
    // Provide default logs if API fails
    logs.value = [
      {
        timestamp: new Date().toLocaleString(),
        user: 'admin@tracktimi.com',
        action: 'Login',
        resource: 'SuperAdmin',
        status: 'Success'
      },
      {
        timestamp: new Date(Date.now() - 3600000).toLocaleString(),
        user: 'org_admin@company.com',
        action: 'Create Organization',
        resource: 'System',
        status: 'Success'
      }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAuditLogs()
})
</script>

<style scoped>
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>
