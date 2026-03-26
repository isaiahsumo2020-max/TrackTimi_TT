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
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-emerald-100 hover:bg-emerald-500"><span>📋</span><span>Audit Logs</span></router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg"><span>⚙️</span><span>Settings</span></router-link>
      </nav>
      <div class="p-6 border-t border-emerald-500"><div class="flex items-center space-x-3 cursor-pointer hover:bg-emerald-500 p-3 rounded-lg transition-all"><div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">JS</div><div class="flex-1"><div class="font-semibold text-sm">Jodell Suah</div><div class="text-xs text-emerald-200">Super Admin</div></div></div></div>
    </aside>
    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10"><div class="px-8 py-8"><div class="flex items-center justify-between"><div><h1 class="text-3xl font-bold text-slate-900">Settings</h1><p class="text-slate-600 mt-2">Manage platform settings and preferences</p></div><button @click="handleLogout" class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all">Logout</button></div></div></div>
      <div class="p-8">
        <div v-if="saveMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {{ saveMessage }}
        </div>

        <div class="max-w-2xl">
          <div class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm mb-6">
            <h2 class="text-xl font-bold text-slate-900 mb-6">General Settings</h2>
            <div class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Platform Name</label>
                <input v-model="settings.platformName" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Support Email</label>
                <input v-model="settings.supportEmail" type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Max Organizations</label>
                <input v-model.number="settings.maxOrganizations" type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
              </div>
              <button @click="saveSettings" :disabled="saving" class="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 class="text-xl font-bold text-slate-900 mb-6">Security</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-semibold text-slate-900">Two-Factor Authentication</p>
                  <p class="text-sm text-slate-600">Require 2FA for super admin accounts</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="settings.twoFactorAuth" type="checkbox" class="sr-only peer">
                  <div :class="['w-11 h-6 rounded-full peer', settings.twoFactorAuth ? 'bg-emerald-500' : 'bg-gray-300']"></div>
                </label>
              </div>
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p class="font-semibold text-slate-900">Rate Limiting</p>
                  <p class="text-sm text-slate-600">Enable API rate limiting</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input v-model="settings.rateLimiting" type="checkbox" class="sr-only peer">
                  <div :class="['w-11 h-6 rounded-full peer', settings.rateLimiting ? 'bg-emerald-500' : 'bg-gray-300']"></div>
                </label>
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

const router = useRouter()
const sidebarOpen = ref(true)
const settings = ref({
  platformName: 'TrackTimi',
  supportEmail: 'support@tracktimi.com',
  maxOrganizations: 9999,
  twoFactorAuth: true,
  rateLimiting: true
})
const saving = ref(false)
const saveMessage = ref('')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

const saveSettings = () => {
  saving.value = true
  setTimeout(() => {
    saveMessage.value = 'Settings saved successfully!'
    saving.value = false
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  }, 500)
}

onMounted(() => {
  // Load settings from localStorage if available
  const savedSettings = localStorage.getItem('platformSettings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }
})
</script>

<style scoped>
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
</style>
