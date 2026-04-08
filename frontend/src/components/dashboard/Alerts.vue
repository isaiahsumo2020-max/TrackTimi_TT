<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h3 class="text-2xl font-black text-primary-600 mb-2">System Alerts</h3>
      <p class="text-sm text-slate-500">Real-time system monitoring and alerts across all organizations</p>
    </div>

    <!-- Alert Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Total Alerts</p>
        <p class="text-3xl font-black text-slate-900">{{ alerts.length }}</p>
      </div>
      
      <div class="bg-white rounded-lg border border-red-200 shadow-sm p-6">
        <p class="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">Critical</p>
        <p class="text-3xl font-black text-red-600">{{ severityCounts.critical }}</p>
      </div>

      <div class="bg-white rounded-lg border border-amber-200 shadow-sm p-6">
        <p class="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Warning</p>
        <p class="text-3xl font-black text-amber-600">{{ severityCounts.warning }}</p>
      </div>

      <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
        <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Info</p>
        <p class="text-3xl font-black text-primary-600">{{ severityCounts.info }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <select
        v-model="filterSeverity"
        class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Severity Levels</option>
        <option value="critical">Critical</option>
        <option value="warning">Warning</option>
        <option value="info">Info</option>
      </select>

      <select
        v-model="filterType"
        class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Alert Types</option>
        <option value="organizations">Organizations</option>
        <option value="attendance">Attendance</option>
        <option value="billing">Billing</option>
        <option value="system">System</option>
      </select>

      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search alerts..."
        class="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <button
        @click="refreshAlerts"
        class="px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm flex items-center gap-2"
      >
        <RefreshCwIcon class="w-4 h-4" />
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <p class="text-sm font-bold text-slate-600">Loading alerts...</p>
      </div>
    </div>

    <!-- Alerts List -->
    <div v-else class="space-y-4">
      <div
        v-for="(alert, idx) in filteredAlerts"
        :key="alert.id"
        class="bg-white rounded-lg border shadow-sm hover:shadow-lg transition-all overflow-hidden"
        :class="severityStyles[alert.severity]"
      >
        <!-- Alert Header -->
        <div class="p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <!-- Title with Type Badge -->
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                  :class="typeStyles[alert.type]"
                >
                  {{ formatAlertType(alert.type) }}
                </span>
                <span
                  class="px-2 py-1 rounded text-xs font-black"
                  :class="severityBadges[alert.severity]"
                >
                  {{ alert.severity.toUpperCase() }}
                </span>
              </div>

              <h4 class="text-lg font-black text-slate-900 mb-1">{{ alert.title }}</h4>
              <p class="text-sm text-slate-600">{{ alert.message }}</p>

              <!-- Count Badge -->
              <div v-if="alert.count" class="mt-3 inline-block">
                <span class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black flex items-center gap-1">
                  <BarChart3Icon class="w-3 h-3" />
                  {{ alert.count }} item{{ alert.count > 1 ? 's' : '' }}
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <button
              v-if="alert.actionRequired"
              @click="toggleDetails(alert.id)"
              class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all whitespace-nowrap"
            >
              {{ expandedAlerts.includes(alert.id) ? 'Hide' : 'Show' }} Details
            </button>

            <!-- Close Button -->
            <button
              @click="dismissAlert(alert.id)"
              class="text-slate-400 hover:text-slate-600 transition-all"
              title="Dismiss alert"
            >
              <XIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Timestamp -->
          <div class="mt-4 flex items-center justify-between">
            <p class="text-xs text-slate-500">{{ formatTime(alert.timestamp) }}</p>
            <p v-if="alert.actionRequired" class="text-xs font-bold text-red-600 flex items-center gap-1">
              <AlertTriangleIcon class="w-3 h-3" />
              Action Required
            </p>
          </div>
        </div>

        <!-- Details Section -->
        <div
          v-if="expandedAlerts.includes(alert.id) && alert.details && alert.details.length > 0"
          class="bg-slate-50 border-t border-slate-200 p-6"
        >
          <h5 class="text-sm font-black text-slate-700 uppercase tracking-wider mb-4">Details</h5>
          <div class="space-y-2">
            <div
              v-for="(detail, idx) in alert.details"
              :key="idx"
              class="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200"
            >
              <span class="text-sm font-black text-primary-600 flex-shrink-0">{{ idx + 1 }}.</span>
              <p class="text-sm text-slate-700">{{ detail }}</p>
            </div>
          </div>

          <!-- Action Buttons based on Alert Type -->
          <div v-if="alert.type === 'organizations'" class="mt-6 flex gap-3">
            <button
              class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all"
            >
              View Organizations
            </button>
            <button
              class="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all"
            >
              Reactivate
            </button>
          </div>

          <div v-else-if="alert.type === 'attendance'" class="mt-6 flex gap-3">
            <button
              class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all"
            >
              View Attendance
            </button>
            <button
              class="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all"
            >
              Manage
            </button>
          </div>

          <div v-else-if="alert.type === 'billing'" class="mt-6 flex gap-3">
            <button
              class="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all"
            >
              Renew Subscriptions
            </button>
            <button
              class="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all"
            >
              Contact Orgs
            </button>
          </div>
        </div>
      </div>

      <!-- No Alerts -->
      <div v-if="filteredAlerts.length === 0" class="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <CheckCircleIcon class="w-12 h-12 text-primary-600 mx-auto mb-4" />
        <p class="text-slate-600 font-bold text-lg mb-2">All Systems Operational</p>
        <p class="text-sm text-slate-500">No alerts matching your filters</p>
      </div>
    </div>

    <!-- Alert Timeline -->
    <div v-if="!loading && alerts.length > 0" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
      <h4 class="text-lg font-black text-primary-600 mb-6">Alert Timeline</h4>
      <div class="space-y-4">
        <div
          v-for="(alert, idx) in sortedByTime"
          :key="alert.id"
          class="flex gap-4 items-start pb-4 border-b border-slate-200 last:border-0"
        >
          <!-- Timeline dot -->
          <div class="flex flex-col items-center mt-1">
            <div
              class="w-3 h-3 rounded-full flex-shrink-0"
              :class="{
                'bg-red-500': alert.severity === 'critical',
                'bg-amber-500': alert.severity === 'warning',
                'bg-blue-500': alert.severity === 'info'
              }"
            ></div>
            <div v-if="idx < sortedByTime.length - 1" class="w-0.5 h-12 bg-slate-200 mt-2"></div>
          </div>

          <!-- Timeline content -->
          <div class="flex-1 pt-1">
            <p class="text-sm font-black text-slate-900">{{ alert.title }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ formatTime(alert.timestamp) }}</p>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { superadminApi } from '@/services/superadminApi'
import { CheckCircleIcon, RefreshCwIcon, BarChart3Icon, AlertTriangleIcon, InfoIcon, XIcon } from 'lucide-vue-next'

// State
const loading = ref(true)
const alerts = ref([])
const expandedAlerts = ref([])
const filterSeverity = ref('')
const filterType = ref('')
const searchQuery = ref('')

// Severity and type styling maps
const severityStyles = {
  critical: 'border-red-300 bg-red-50',
  warning: 'border-amber-300 bg-amber-50',
  info: 'border-blue-300 bg-blue-50'
}

const severityBadges = {
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700'
}

const typeStyles = {
  organizations: 'bg-accent-100 text-accent-700',
  attendance: 'bg-primary-50 text-primary-700',
  billing: 'bg-indigo-100 text-indigo-700',
  system: 'bg-slate-100 text-slate-700'
}

// Fetch alerts
const fetchAlerts = async () => {
  try {
    loading.value = true
    const response = await superadminApi.get('/alerts')
    alerts.value = response.data?.alerts || []
  } catch (error) {
    console.error('Failed to fetch alerts:', error)
  } finally {
    loading.value = false
  }
}

// Refresh alerts
const refreshAlerts = () => {
  fetchAlerts()
}

// Dismiss alert
const dismissAlert = (alertId) => {
  alerts.value = alerts.value.filter(a => a.id !== alertId)
}

// Toggle details
const toggleDetails = (alertId) => {
  const idx = expandedAlerts.value.indexOf(alertId)
  if (idx > -1) {
    expandedAlerts.value.splice(idx, 1)
  } else {
    expandedAlerts.value.push(alertId)
  }
}

// Filter alerts
const filteredAlerts = computed(() => {
  return alerts.value.filter(alert => {
    const matchesSeverity = filterSeverity.value === '' || alert.severity === filterSeverity.value
    const matchesType = filterType.value === '' || alert.type === filterType.value
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.value.toLowerCase())

    return matchesSeverity && matchesType && matchesSearch
  })
})

// Sorted by time (newest first)
const sortedByTime = computed(() => {
  return [...filteredAlerts.value].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Count alerts by severity
const severityCounts = computed(() => {
  return {
    critical: alerts.value.filter(a => a.severity === 'critical').length,
    warning: alerts.value.filter(a => a.severity === 'warning').length,
    info: alerts.value.filter(a => a.severity === 'info').length
  }
})

// Format alert type
const formatAlertType = (type) => {
  const typeMap = {
    organizations: 'Organizations',
    attendance: 'Attendance',
    billing: 'Billing',
    system: 'System'
  }
  return typeMap[type] || type
}

// Format time
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchAlerts()
  // Refresh alerts every 5 minutes
  setInterval(fetchAlerts, 5 * 60 * 1000)
})
</script>
