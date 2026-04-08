<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h3 class="text-2xl font-black text-primary-600 mb-2">Audit Logs</h3>
      <p class="text-sm text-slate-500">System-wide activity log tracking all actions and changes</p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Total Logs ({{ dateRange }}d)</p>
        <p class="text-3xl font-black text-slate-900">{{ logs.length }}</p>
      </div>
      
      <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
        <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Unique Actions</p>
        <p class="text-3xl font-black text-primary-600">{{ filters.actions.length }}</p>
      </div>

      <div class="bg-white rounded-lg border border-primary-200 shadow-sm p-6">
        <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">Modified Tables</p>
        <p class="text-3xl font-black text-primary-600">{{ filters.tables.length }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
      <h4 class="text-sm font-black text-slate-900 uppercase tracking-wider">Filters & Search</h4>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Date Range -->
        <select
          v-model="dateRange"
          class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="365">Last Year</option>
        </select>

        <!-- Action Filter -->
        <select
          v-model="filterAction"
          class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Actions</option>
          <option v-for="action in filters.actions" :key="action" :value="action">
            {{ action }}
          </option>
        </select>

        <!-- Table Filter -->
        <select
          v-model="filterTable"
          class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Tables</option>
          <option v-for="table in filters.tables" :key="table" :value="table">
            {{ table }}
          </option>
        </select>

        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by user, org, IP..."
          class="px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <button
        @click="refreshLogs"
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
        <p class="text-sm font-bold text-slate-600">Loading audit logs...</p>
      </div>
    </div>

    <!-- Logs List -->
    <div v-else class="space-y-3">
      <div
        v-for="log in filteredLogs"
        :key="log.Log_ID"
        class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
      >
        <!-- Log Header -->
        <div class="p-6">
          <div class="flex items-start justify-between gap-4 mb-4">
            <!-- Left: Main Info -->
            <div class="flex-1 min-w-0">
              <!-- Action Badge and Timestamp -->
              <div class="flex items-center gap-3 mb-3 flex-wrap">
                <span
                  class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1"
                  :class="getActionBadgeStyle(log.Action)"
                >
                  <component :is="getActionIcon(log.Action)" class="w-3 h-3" />
                  {{ log.Action }}
                </span>
                <span
                  class="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700"
                >
                  {{ log.Table_Name }}
                </span>
              </div>

              <!-- User + Organization -->
              <div class="text-sm text-slate-700 mb-2">
                <span class="font-bold">{{ log.User_Name }}</span>
                <span v-if="log.Org_Name" class="text-slate-500"> in </span>
                <span v-if="log.Org_Name" class="font-bold text-primary-600">{{ log.Org_Name }}</span>
              </div>

              <!-- Changes Summary -->
              <div v-if="log.changesSummary" class="text-sm text-slate-600 italic">
                {{ log.changesSummary }}
              </div>
            </div>

            <!-- Right: Time and Details Button -->
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <p class="text-xs font-bold text-slate-500">{{ formatTime(log.Created_at) }}</p>
              <button
                @click="toggleDetails(log.Log_ID)"
                class="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold hover:bg-slate-200 transition-all whitespace-nowrap"
              >
                {{ expandedLogs.includes(log.Log_ID) ? '△ Less' : '▽ Details' }}
              </button>
            </div>
          </div>

          <!-- IP Address and Record ID -->
          <div class="flex gap-6 text-xs text-slate-500">
            <span v-if="log.IP_Address" class="flex items-center gap-1">
              <MapPinIcon class="w-4 h-4" />
              IP: <span class="font-mono font-bold">{{ log.IP_Address }}</span>
            </span>
            <span v-if="log.Record_ID" class="flex items-center gap-1">
              <KeyIcon class="w-4 h-4" />
              Record: <span class="font-mono font-bold">{{ log.Record_ID }}</span>
            </span>
          </div>
        </div>

        <!-- Expandable Details -->
        <div v-if="expandedLogs.includes(log.Log_ID)" class="bg-slate-50 border-t border-slate-200 p-6 space-y-4">
          <!-- Old Data -->
          <div v-if="log.Old_Data">
            <h5 class="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <FileTextIcon class="w-4 h-4" />
              Previous Values
            </h5>
            <div class="bg-white rounded-lg p-4 border border-red-200 max-h-48 overflow-y-auto">
              <pre class="text-xs text-slate-700 font-mono whitespace-pre-wrap break-words">{{ formatJSON(log.Old_Data) }}</pre>
            </div>
          </div>

          <!-- New Data -->
          <div v-if="log.New_Data">
            <h5 class="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <PencilIcon class="w-4 h-4" />
              New Values
            </h5>
            <div class="bg-white rounded-lg p-4 border border-primary-200 max-h-48 overflow-y-auto">
              <pre class="text-xs text-slate-700 font-mono whitespace-pre-wrap break-words">{{ formatJSON(log.New_Data) }}</pre>
            </div>
          </div>

          <!-- Changes Diff -->
          <div v-if="getDifferences(log.Old_Data, log.New_Data).length > 0">
            <h5 class="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
              <RefreshCwIcon class="w-4 h-4" />
              Changes
            </h5>
            <div class="space-y-2">
              <div
                v-for="(change, idx) in getDifferences(log.Old_Data, log.New_Data)"
                :key="idx"
                class="flex items-start gap-3 p-3 bg-white rounded-lg border border-primary-200"
              >
                <span class="text-sm font-black text-primary-600 flex-shrink-0">{{ change.field }}:</span>
                <div class="flex-1 text-sm">
                  <span class="line-through text-red-600">{{ change.old }}</span>
                  <span class="text-slate-500 mx-2">→</span>
                  <span class="text-primary-600 font-bold">{{ change.new }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <p class="font-bold text-slate-700">Log ID</p>
              <p class="font-mono">{{ log.Log_ID }}</p>
            </div>
            <div>
              <p class="font-bold text-slate-700">Created</p>
              <p>{{ new Date(log.Created_at).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="filteredLogs.length === 0" class="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <InboxIcon class="w-12 h-12 text-slate-300 mb-4 mx-auto" />
        <p class="text-slate-600 font-bold text-lg mb-2">No Logs Found</p>
        <p class="text-sm text-slate-500">Adjust your filters to see audit logs</p>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div v-if="!loading && logs.length > 0" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
      <h4 class="text-lg font-black text-primary-600 mb-6">Activity Timeline</h4>
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div
          v-for="(log, idx) in sortedByTime"
          :key="log.Log_ID"
          class="flex gap-4 items-start pb-4 border-b border-slate-200 last:border-0"
        >
          <!-- Timeline dot -->
          <div class="flex flex-col items-center mt-1">
            <div
              class="w-3 h-3 rounded-full flex-shrink-0"
              :class="getActionColor(log.Action)"
            ></div>
            <div v-if="idx < sortedByTime.length - 1" class="w-0.5 h-12 bg-slate-200 mt-2"></div>
          </div>

          <!-- Timeline content -->
          <div class="flex-1 pt-1 min-w-0">
            <p class="text-sm font-black text-slate-900">{{ log.Action }} - {{ log.Table_Name }}</p>
            <p class="text-xs text-slate-600 mt-1">{{ log.User_Name }} <span v-if="log.Org_Name" class="text-primary-600">in {{ log.Org_Name }}</span></p>
            <p class="text-xs text-slate-500 mt-1">{{ formatTime(log.Created_at) }}</p>
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
import {
  SparklesIcon, PencilIcon, TrashIcon, PlusIcon, EyeIcon, WrenchIcon,
  MapPinIcon, KeyIcon, FileTextIcon, RefreshCwIcon, InboxIcon
} from 'lucide-vue-next'

// State
const loading = ref(true)
const logs = ref([])
const expandedLogs = ref([])
const dateRange = ref('30')
const filterAction = ref('')
const filterTable = ref('')
const searchQuery = ref('')
const filters = ref({ actions: [], tables: [] })

// Fetch audit logs
const fetchAuditLogs = async () => {
  try {
    loading.value = true
    const response = await superadminApi.get('/audit-logs', {
      params: {
        days: dateRange.value,
        action: filterAction.value || undefined,
        table: filterTable.value || undefined
      }
    })
    logs.value = response.data?.logs || []
    filters.value = response.data?.filters || { actions: [], tables: [] }
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

// Refresh logs
const refreshLogs = () => {
  fetchAuditLogs()
}

// Toggle details
const toggleDetails = (logId) => {
  const idx = expandedLogs.value.indexOf(logId)
  if (idx > -1) {
    expandedLogs.value.splice(idx, 1)
  } else {
    expandedLogs.value.push(logId)
  }
}

// Filter logs
const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesAction = filterAction.value === '' || log.Action === filterAction.value
    const matchesTable = filterTable.value === '' || log.Table_Name === filterTable.value
    const matchesSearch =
      !searchQuery.value ||
      log.User_Name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.Org_Name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.IP_Address?.includes(searchQuery.value) ||
      log.Log_ID?.toString().includes(searchQuery.value)

    return matchesAction && matchesTable && matchesSearch
  })
})

// Sorted by time (newest first)
const sortedByTime = computed(() => {
  return [...filteredLogs.value].sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at))
})

// Get action icon
const getActionIcon = (action) => {
  const icons = {
    'CREATE': SparklesIcon,
    'UPDATE': PencilIcon,
    'DELETE': TrashIcon,
    'INSERT': PlusIcon,
    'SELECT': EyeIcon,
    'PATCH': WrenchIcon
  }
  for (const [key, icon] of Object.entries(icons)) {
    if (action.includes(key)) return icon
  }
  return FileTextIcon
}

// Get action badge style
const getActionBadgeStyle = (action) => {
  if (action.includes('CREATE') || action.includes('INSERT')) return 'bg-primary-100 text-primary-700'
  if (action.includes('UPDATE') || action.includes('PATCH')) return 'bg-blue-100 text-blue-700'
  if (action.includes('DELETE')) return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

// Get action color for timeline
const getActionColor = (action) => {
  if (action.includes('CREATE') || action.includes('INSERT')) return 'bg-primary-500'
  if (action.includes('UPDATE') || action.includes('PATCH')) return 'bg-blue-500'
  if (action.includes('DELETE')) return 'bg-red-500'
  return 'bg-slate-500'
}

// Format JSON for display
const formatJSON = (data) => {
  if (!data) return ''
  try {
    const obj = typeof data === 'string' ? JSON.parse(data) : data
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(data)
  }
}

// Get differences between old and new data
const getDifferences = (oldData, newData) => {
  if (!oldData || !newData) return []
  
  const old = typeof oldData === 'string' ? JSON.parse(oldData) : oldData
  const neu = typeof newData === 'string' ? JSON.parse(newData) : newData
  
  if (typeof old !== 'object' || typeof neu !== 'object') return []
  
  const differences = []
  for (const key in neu) {
    if (old[key] !== neu[key]) {
      differences.push({
        field: key,
        old: old[key],
        new: neu[key]
      })
    }
  }
  return differences
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
  fetchAuditLogs()
})
</script>

