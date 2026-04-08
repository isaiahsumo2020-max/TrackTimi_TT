<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h3 class="text-2xl font-black text-primary-600 mb-2">System Configuration</h3>
      <p class="text-sm text-slate-500">Manage global system settings, features, and integrations</p>
    </div>

    <!-- Tabs -->
    <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all flex items-center gap-2',
          activeTab === tab.id
            ? 'bg-primary-500 text-white shadow-lg'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <p class="text-sm font-bold text-slate-600">Loading configuration...</p>
      </div>
    </div>

    <!-- System Tab -->
    <div v-else-if="activeTab === 'system'" class="space-y-6">
      <!-- System Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">System Name</p>
          <p class="text-xl font-black text-slate-900">{{ config.system.name }}</p>
        </div>

        <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
          <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Version</p>
          <p class="text-xl font-black text-primary-600">{{ config.system.version }}</p>
        </div>

        <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
          <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Environment</p>
          <p class="text-xl font-black text-primary-600">{{ config.system.environment }}</p>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">API URL</p>
          <p class="text-sm font-mono text-slate-900">{{ config.system.apiUrl }}</p>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Frontend URL</p>
          <p class="text-sm font-mono text-slate-900">{{ config.system.frontendUrl }}</p>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Support Email</p>
          <p class="text-sm font-bold text-primary-600">{{ config.system.supportEmail }}</p>
        </div>
      </div>

      <!-- System Settings -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-slate-900 mb-6">Settings</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(value, key) in systemSettings" :key="key" class="space-y-2">
            <label class="text-sm font-bold text-slate-700 block capitalize">{{ formatLabel(key) }}</label>
            <select v-if="key === 'timeFormat' || key === 'dateFormat'" v-model="editableSettings[key]" class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option v-if="key === 'timeFormat'" value="24h">24 Hour</option>
              <option v-if="key === 'timeFormat'" value="12h">12 Hour</option>
              <option v-if="key === 'dateFormat'" value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option v-if="key === 'dateFormat'" value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
            <input v-else type="text" v-model="editableSettings[key]" class="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500" disabled />
          </div>
        </div>
      </div>
    </div>

    <!-- Database Tab -->
    <div v-else-if="activeTab === 'database'" class="space-y-6">
      <!-- Database Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Database Type</p>
          <p class="text-xl font-black text-slate-900">{{ config.database.type }}</p>
        </div>

        <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
          <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Database Size</p>
          <p class="text-2xl font-black text-primary-600">{{ config.database.sizeInMB }} <span class="text-sm">MB</span></p>
        </div>

        <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
          <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Backup Status</p>
          <p class="text-xl font-black text-primary-600">{{ config.database.backupStatus }}</p>
        </div>
      </div>

      <!-- Database Stats Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-slate-900 mb-6">Database Statistics</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(value, key) in databaseStats" :key="key" class="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{{ formatLabel(key) }}</p>
            <p class="text-2xl font-black text-slate-900">{{ formatNumber(value) }}</p>
          </div>
        </div>
      </div>

      <!-- Backup Options -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-slate-900 mb-6">Backup Management</h4>
        <div class="space-y-4">
          <button class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <HardDrive class="w-4 h-4" />
            Create Full Backup Now
          </button>
          <button class="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <Download class="w-4 h-4" />
            Download Latest Backup
          </button>
          <button class="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <Trash2 class="w-4 h-4" />
            Prune Old Logs (>90 days)
          </button>
        </div>
      </div>
    </div>

    <!-- Security Tab -->
    <div v-else-if="activeTab === 'security'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="(value, key) in config.security" :key="key" class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">{{ formatLabel(key) }}</p>
          <div v-if="typeof value === 'boolean'" class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="value"
              class="w-6 h-6 rounded cursor-pointer"
              disabled
            />
            <span class="font-bold text-slate-900">{{ value ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <p v-else class="text-2xl font-black text-slate-900">{{ value }}</p>
        </div>
      </div>

      <!-- Security Actions -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-slate-900 mb-6">Security Actions</h4>
        <div class="space-y-3">
          <button class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <Key class="w-4 h-4" />
            Rotate JWT Secret
          </button>
          <button class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <Lock class="w-4 h-4" />
            Force Password Reset (All Users)
          </button>
          <button class="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2">
            <AlertTriangleIcon class="w-4 h-4" />
            Revoke All Active Sessions
          </button>
        </div>
      </div>
    </div>

    <!-- Features Tab -->
    <div v-else-if="activeTab === 'features'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(value, key) in config.features"
          :key="key"
          class="bg-white rounded-lg border shadow-sm p-6 flex items-center justify-between"
          :class="value ? 'border-primary-200 bg-primary-50' : 'border-slate-200'"
        >
          <p class="font-bold text-slate-900 capitalize">{{ formatLabel(key) }}</p>
          <div class="flex items-center gap-2">
            <span
              class="px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1"
              :class="value ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700'"
            >
              <CheckCircle v-if="value" class="w-4 h-4" />
              <X v-else class="w-4 h-4" />
              {{ value ? 'On' : 'Off' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Tab -->
    <div v-else-if="activeTab === 'notifications'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(value, key) in config.notifications"
          :key="key"
          class="bg-white rounded-lg border border-slate-200 shadow-sm p-6"
        >
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">{{ formatLabel(key) }}</p>
          <div v-if="typeof value === 'boolean'" class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="value"
              @change="updateSetting('notifications', key, $event.target.checked)"
              class="w-6 h-6 rounded cursor-pointer"
            />
            <span class="font-bold text-slate-900">{{ value ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <p v-else class="text-lg font-black text-slate-900">{{ value }}</p>
        </div>
      </div>
    </div>

    <!-- Performance Tab -->
    <div v-else-if="activeTab === 'performance'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="(value, key) in config.performance" :key="key" class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
          <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">{{ formatLabel(key) }}</p>
          <div v-if="typeof value === 'boolean'" class="flex items-center gap-3">
            <input type="checkbox" :checked="value" class="w-6 h-6 rounded cursor-pointer" disabled />
            <span class="font-bold text-slate-900">{{ value ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <p v-else class="text-lg font-black text-slate-900">{{ value }}</p>
        </div>
      </div>
    </div>

    <!-- System Health Tab -->
    <div v-else-if="activeTab === 'health'" class="space-y-6">
      <!-- Health Status -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-slate-900 mb-6">System Health Status</h4>
        <div v-if="diagnostics.checks" class="space-y-4">
          <div
            v-for="(status, check) in diagnostics.checks"
            :key="check"
            class="flex items-center justify-between p-4 rounded-lg border-2"
            :class="status === 'Healthy' ? 'border-primary-300 bg-primary-50' : 'border-amber-300 bg-amber-50'"
          >
            <p class="text-sm font-bold text-slate-900 capitalize">{{ formatLabel(check) }}</p>
            <span
              class="px-4 py-2 rounded-full text-xs font-black uppercase"
              :class="status === 'Healthy' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700'"
            >
              {{ status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="diagnostics.recommendations && diagnostics.recommendations.length > 0" class="bg-amber-50 rounded-lg border border-amber-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-amber-900 mb-4">Recommendations</h4>
        <ul class="space-y-2">
          <li v-for="(rec, idx) in diagnostics.recommendations" :key="idx" class="flex gap-3 text-amber-900">
            <span class="font-bold">•</span>
            <span class="text-sm font-bold">{{ rec }}</span>
          </li>
        </ul>
      </div>

      <!-- Issues -->
      <div v-if="diagnostics.issues && diagnostics.issues.length > 0" class="bg-red-50 rounded-lg border border-red-200 shadow-sm p-8">
        <h4 class="text-lg font-black text-red-900 mb-4 flex items-center gap-2">
          <AlertTriangleIcon class="w-5 h-5" />
          Issues Found
        </h4>
        <ul class="space-y-2">
          <li v-for="(issue, idx) in diagnostics.issues" :key="idx" class="flex gap-3 text-red-900">
            <AlertTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span class="text-sm font-bold">{{ issue }}</span>
          </li>
        </ul>
      </div>

      <!-- Run Diagnostics Button -->
      <button
        @click="runDiagnostics"
        class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
      >
        <Search class="w-4 h-4" />
        Run Full Diagnostics
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { superadminApi } from '@/services/superadminApi'
import { AlertTriangleIcon, Settings, HardDrive, Lock, Sparkles, Bell, Zap, Heart, Key, Download, Trash2, Search, CheckCircle, X } from 'lucide-vue-next'

// State
const loading = ref(true)
const activeTab = ref('system')
const config = ref({
  system: {},
  security: {},
  notifications: {},
  features: {},
  performance: {},
  database: {}
})
const editableSettings = ref({})
const diagnostics = ref({ checks: {}, issues: [], recommendations: [] })

const tabs = [
  { id: 'system', label: 'System', icon: Settings },
  { id: 'database', label: 'Database', icon: HardDrive },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'features', label: 'Features', icon: Sparkles },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'health', label: 'Health', icon: Heart }
]

// Computed
const systemSettings = computed(() => config.value.system)
const databaseStats = computed(() => {
  const { sizeInMB, backupStatus, type, version, location, ...stats } = config.value.database || {}
  return stats
})

// Fetch configuration
const fetchConfig = async () => {
  try {
    loading.value = true
    const response = await superadminApi.get('/system/config')
    config.value = response.data?.config || {}
    editableSettings.value = { ...config.value.system }
  } catch (error) {
    console.error('Failed to fetch config:', error)
  } finally {
    loading.value = false
  }
}

// Update setting
const updateSetting = async (category, key, value) => {
  try {
    await superadminApi.put('/system/config', {
      category,
      settings: { [key]: value }
    })
  } catch (error) {
    console.error('Failed to update setting:', error)
  }
}

// Run diagnostics
const runDiagnostics = async () => {
  try {
    const response = await superadminApi.get('/system/diagnostics')
    diagnostics.value = response.data?.diagnostics || {}
  } catch (error) {
    console.error('Failed to run diagnostics:', error)
  }
}

// Format label from camelCase to Title Case
const formatLabel = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim()
}

// Format large numbers
const formatNumber = (num) => {
  if (typeof num !== 'number') return num
  return num.toLocaleString()
}

// Lifecycle
onMounted(() => {
  fetchConfig()
})
</script>


