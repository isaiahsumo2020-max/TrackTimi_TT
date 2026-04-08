<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h3 class="text-2xl font-black text-primary-600 mb-2">Geofences</h3>
      <p class="text-sm text-slate-500">View all organization geofences with location history</p>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search geofences by name or organization..."
        class="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      
      <select
        v-model="filterStatus"
        class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
        <p class="text-sm font-bold text-slate-600">Loading geofences...</p>
      </div>
    </div>

    <!-- Geofences by Organization -->
    <div v-else class="space-y-8">
      <div v-for="org in groupedByOrganization" :key="org.orgId" class="space-y-4">
        <!-- Organization Header Card -->
        <div class="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border-2 border-primary-200 p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Organization Name -->
            <div>
              <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Organization</p>
              <p class="text-lg font-black text-slate-900">{{ org.orgName }}</p>
            </div>
            <!-- Address -->
            <div>
              <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPinIcon class="w-4 h-4" />
                Address
              </p>
              <p class="text-sm font-bold text-slate-800 line-clamp-2">{{ org.address || '—' }}</p>
            </div>
            <!-- Email -->
            <div>
              <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MailIcon class="w-4 h-4" />
                Email
              </p>
              <p class="text-sm font-bold text-primary-600 truncate">{{ org.email || '—' }}</p>
            </div>
            <!-- Phone -->
            <div>
              <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <PhoneIcon class="w-4 h-4" />
                Contact
              </p>
              <p class="text-sm font-bold text-slate-800">{{ org.phone || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Geofences Grid for this Organization -->
        <div v-if="org.geofences.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="geo in org.geofences"
            :key="geo.Fence_ID"
            class="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6"
          >
            <!-- Geofence Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h4 class="text-sm font-black text-slate-900">{{ geo.Location_Name }}</h4>
              </div>

              <!-- Status Badge -->
              <span :class="geo.Is_Active ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-600'" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ geo.Is_Active ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <!-- Coordinates -->
            <div class="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-slate-200">
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Latitude</p>
                <p class="text-sm font-mono font-black text-primary-600">{{ geo.Latitude?.toFixed(6) }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Longitude</p>
                <p class="text-sm font-mono font-black text-primary-600">{{ geo.Longitude?.toFixed(6) }}</p>
              </div>
            </div>

            <!-- Radius -->
            <div class="mb-6">
              <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Radius Coverage</p>
              <div class="flex items-center gap-3">
                <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                    :style="{ width: Math.min((geo.Radius / 500) * 100, 100) + '%' }"
                  ></div>
                </div>
                <span class="text-sm font-black text-slate-900 whitespace-nowrap">{{ geo.Radius }}m</span>
              </div>
            </div>

            <!-- Created Date -->
            <div class="text-xs text-slate-500">
              Created: {{ formatDate(geo.Created_at) }}
            </div>

            <!-- Expand History Button -->
            <button
              @click="toggleHistory(geo.Fence_ID)"
              class="w-full mt-4 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              {{ expandedGeofences.includes(geo.Fence_ID) ? 'Hide History' : 'Show History' }}
            </button>

            <!-- Location History -->
            <div v-if="expandedGeofences.includes(geo.Fence_ID)" class="mt-4 pt-4 border-t border-slate-200 space-y-3">
              <h5 class="text-xs font-black text-slate-700 uppercase tracking-wider">Location Changes</h5>
              <div v-if="geo.history && geo.history.length > 0" class="space-y-2 max-h-64 overflow-y-auto">
                <div v-for="(change, idx) in geo.history" :key="idx" class="text-xs bg-slate-50 p-3 rounded border border-slate-200">
                  <p class="font-bold text-slate-900 mb-1">
                    {{ idx === 0 ? 'Current Location' : `Change #${idx}` }}
                  </p>
                  <p class="text-slate-600">
                    <span class="font-mono">{{ change.latitude?.toFixed(6) }}, {{ change.longitude?.toFixed(6) }}</span>
                  </p>
                  <p class="text-slate-500 mt-1">{{ formatDate(change.changedAt || change.Created_at) }}</p>
                </div>
              </div>
              <div v-else class="text-xs text-slate-500 p-3 bg-slate-50 rounded">
                No history changes recorded
              </div>
            </div>
          </div>
        </div>

        <!-- No Geofences for this Org -->
        <div v-else class="bg-slate-50 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
          <p class="text-sm font-bold text-slate-500">No geofences configured for this organization</p>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="groupedByOrganization.length === 0" class="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
        <MapPinIcon class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p class="text-slate-500 font-bold">No geofences found</p>
      </div>
    </div>

    <!-- Summary Table -->
    <div v-if="!loading && filteredGeofences.length > 0" class="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
      <h4 class="text-lg font-black text-primary-600 mb-6">All Geofences Summary</h4>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Geofence</th>
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Organization</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Latitude</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Longitude</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Radius</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="geo in filteredGeofences" :key="geo.Fence_ID" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <p class="text-sm font-bold text-slate-900">{{ geo.Location_Name }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-slate-700">{{ geo.OrgName }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="text-sm font-mono text-slate-900">{{ geo.Latitude?.toFixed(6) }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="text-sm font-mono text-slate-900">{{ geo.Longitude?.toFixed(6) }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-sm font-black text-primary-600">{{ geo.Radius }}m</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="geo.Is_Active ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-600'"
                  class="px-3 py-1 rounded-full text-xs font-black"
                >
                  {{ geo.Is_Active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="text-sm font-bold text-slate-700">{{ formatDate(geo.Created_at) }}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MapPinIcon, MailIcon, PhoneIcon } from 'lucide-vue-next'
import { superadminApi } from '@/services/superadminApi'

// State
const loading = ref(true)
const geofences = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const expandedGeofences = ref([])

// Fetch geofences with organization details
const fetchGeofences = async () => {
  try {
    loading.value = true
    const response = await superadminApi.get('/geofences-with-orgs')
    geofences.value = response.data?.data || response.data?.geofences || []
  } catch (error) {
    console.error('Failed to fetch geofences:', error)
    alert('Error fetching geofences: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Filter geofences
const filteredGeofences = computed(() => {
  return geofences.value.filter((geo) => {
    const matchesSearch =
      geo.Location_Name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      geo.OrgName?.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      filterStatus.value === '' ||
      (filterStatus.value === 'active' && geo.Is_Active) ||
      (filterStatus.value === 'inactive' && !geo.Is_Active)

    return matchesSearch && matchesStatus
  })
})

// Group geofences by organization
const groupedByOrganization = computed(() => {
  const grouped = {}
  
  filteredGeofences.value.forEach((geo) => {
    if (!grouped[geo.Org_ID]) {
      grouped[geo.Org_ID] = {
        orgId: geo.Org_ID,
        orgName: geo.OrgName,
        address: geo.Address,
        email: geo.Email,
        phone: geo.Phone_Num,
        geofences: []
      }
    }
    grouped[geo.Org_ID].geofences.push(geo)
  })

  return Object.values(grouped)
})

// Toggle history expansion
const toggleHistory = (geoId) => {
  const idx = expandedGeofences.value.indexOf(geoId)
  if (idx > -1) {
    expandedGeofences.value.splice(idx, 1)
  } else {
    expandedGeofences.value.push(geoId)
  }
}

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchGeofences()
})
</script>

