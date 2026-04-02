<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h3 class="text-2xl font-black text-[#1B8B3C] mb-2">Organizations</h3>
        <p class="text-sm text-slate-500">View and manage all organizations in the system</p>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="flex flex-col sm:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search organizations..."
        class="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
      />
      
      <select
        v-model="filterStatus"
        class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
      <div class="flex items-center justify-center space-x-2">
        <div class="w-2 h-2 bg-[#FF6B35] rounded-full animate-pulse"></div>
        <p class="text-sm font-bold text-slate-600">Loading organizations...</p>
      </div>
    </div>

    <!-- Organizations Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="org in filteredOrganizations"
        :key="org.Org_ID"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6"
      >
        <!-- Organization Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3 flex-1">
            <div class="w-12 h-12 bg-gradient-to-br from-[#1B8B3C] to-[#0F5124] text-white rounded-lg flex items-center justify-center font-black text-lg">
              {{ org.Org_Name[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-black text-slate-900 truncate">{{ org.Org_Name }}</h4>
              <p class="text-xs text-slate-500 truncate">{{ org.Org_Domain }}.tracktimi.com</p>
            </div>
          </div>

          <!-- Status Badge -->
          <span
            :class="org.Is_Active ? 'bg-[#1B8B3C]/10 text-[#1B8B3C]' : 'bg-red-100 text-red-600'"
            class="px-2 py-1 rounded text-xs font-black uppercase tracking-widest"
          >
            {{ org.Is_Active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Organization Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-200">
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Users</p>
            <p class="text-2xl font-black text-[#1B8B3C]">{{ org.userCount || 0 }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Created</p>
            <p class="text-sm font-bold text-slate-900">{{ formatDate(org.Created_at) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="openAdminPasswordModal(org)"
            class="flex-1 px-3 py-2 bg-[#FF6B35] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#E55A25] transition-all"
          >
            <KeyIcon class="w-3 h-3 inline mr-1" />
            Reset Admin Password
          </button>
          <button
            @click="viewOrganizationDetails(org)"
            class="flex-1 px-3 py-2 bg-[#1B8B3C] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#156B2E] transition-all"
          >
            <EyeIcon class="w-3 h-3 inline mr-1" />
            View Details
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredOrganizations.length === 0" class="col-span-full bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <BuildingIcon class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p class="text-slate-500 font-bold">No organizations found</p>
      </div>
    </div>

    <!-- Organizations Table -->
    <div v-if="!loading && filteredOrganizations.length > 0" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <h4 class="text-lg font-black text-[#1B8B3C] mb-6">All Organizations</h4>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-200">
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Organization</th>
              <th class="px-6 py-3 text-left text-xs font-black text-slate-700 uppercase">Domain</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Users</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Status</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Created</th>
              <th class="px-6 py-3 text-center text-xs font-black text-slate-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="org in filteredOrganizations" :key="org.Org_ID" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-[#1B8B3C] to-[#0F5124] text-white rounded-lg flex items-center justify-center font-black text-sm">
                    {{ org.Org_Name[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-slate-900">{{ org.Org_Name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm font-mono text-[#1B8B3C]">{{ org.Org_Domain }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-sm font-black text-slate-900">{{ org.userCount || 0 }}</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  :class="org.Is_Active ? 'bg-[#4ADE80]/20 text-[#1B8B3C]' : 'bg-red-100 text-red-600'"
                  class="px-3 py-1 rounded-full text-xs font-black uppercase"
                >
                  {{ org.Is_Active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <p class="text-sm font-bold text-slate-700">{{ formatDate(org.Created_at) }}</p>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex gap-2 justify-center">
                  <button
                    @click="openAdminPasswordModal(org)"
                    class="px-3 py-1 text-[#FF6B35] hover:bg-[#FF6B35]/10 rounded transition-all text-xs font-bold"
                    title="Reset Admin Password"
                  >
                    Reset Password
                  </button>
                  <button
                    @click="viewOrganizationDetails(org)"
                    class="px-3 py-1 text-[#1B8B3C] hover:bg-[#1B8B3C]/10 rounded transition-all text-xs font-bold"
                    title="View Organization Details"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Admin Password Reset Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h3 class="text-xl font-black text-[#1B8B3C] mb-2">
          Reset Admin Password
        </h3>
        <p class="text-sm text-slate-600 mb-6">{{ selectedOrg?.Org_Name }}</p>

        <form @submit.prevent="resetAdminPassword" class="space-y-4">
          <div>
            <label class="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">New Password</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              required
              minlength="8"
            />
            <p class="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label class="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 block">Confirm Password</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm password"
              class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              required
              minlength="8"
            />
          </div>

          <div v-if="passwordError" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <p class="text-sm font-bold text-red-600">{{ passwordError }}</p>
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="passwordLoading"
              class="flex-1 px-4 py-2 bg-[#1B8B3C] text-white rounded-lg font-bold uppercase tracking-widest hover:bg-[#156B2E] transition-all disabled:opacity-50"
            >
              {{ passwordLoading ? 'Updating...' : 'Reset Password' }}
            </button>
            <button
              type="button"
              @click="showPasswordModal = false"
              class="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Organization Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-black text-[#1B8B3C]">
            Organization Details
          </h3>
          <button
            @click="showDetailsModal = false"
            class="text-slate-400 hover:text-slate-600"
          >
            <XIcon class="w-5 h-5" />
          </button>
        </div>

        <div v-if="selectedOrgDetails" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Organization Name</p>
              <p class="text-lg font-black text-slate-900">{{ selectedOrgDetails.info?.Org_Name }}</p>
            </div>
            <div>
              <p class="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Domain</p>
              <p class="text-lg font-mono text-[#1B8B3C]">{{ selectedOrgDetails.info?.Org_Domain }}</p>
            </div>
          </div>

          <!-- Departments -->
          <div class="border-t border-slate-200 pt-6">
            <h4 class="text-sm font-black text-slate-900 mb-4">Departments ({{ selectedOrgDetails.departments?.length || 0 }})</h4>
            <div class="space-y-2">
              <div v-for="dept in selectedOrgDetails.departments" :key="dept.Dep_ID" class="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <span class="font-bold text-slate-700">{{ dept.Depart_Name }}</span>
                <span class="text-xs font-black text-slate-600">{{ dept.staff_count }} staff</span>
              </div>
            </div>
          </div>

          <!-- Users -->
          <div class="border-t border-slate-200 pt-6">
            <h4 class="text-sm font-black text-slate-900 mb-4">Users ({{ selectedOrgDetails.users?.length || 0 }})</h4>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="user in selectedOrgDetails.users" :key="user.User_ID" class="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 truncate">{{ user.First_Name }} {{ user.SurName }}</p>
                  <p class="text-xs text-slate-500">{{ user.Email }}</p>
                </div>
                <span :class="user.Is_Active ? 'bg-[#4ADE80]/20 text-[#1B8B3C]' : 'bg-red-100 text-red-600'" class="px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                  {{ user.Is_Active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div class="border-t border-slate-200 pt-6 grid grid-cols-3 gap-4">
            <div class="bg-[#1B8B3C]/10 rounded-lg p-4 text-center">
              <p class="text-xs font-black text-slate-600 uppercase mb-2">Check-ins Today</p>
              <p class="text-2xl font-black text-[#1B8B3C]">{{ selectedOrgDetails.stats?.checkinsToday || 0 }}</p>
            </div>
            <div class="bg-[#FF6B35]/10 rounded-lg p-4 text-center">
              <p class="text-xs font-black text-slate-600 uppercase mb-2">Total Departments</p>
              <p class="text-2xl font-black text-[#FF6B35]">{{ selectedOrgDetails.departments?.length || 0 }}</p>
            </div>
            <div class="bg-[#4ADE80]/10 rounded-lg p-4 text-center">
              <p class="text-xs font-black text-slate-600 uppercase mb-2">Total Users</p>
              <p class="text-2xl font-black text-[#4ADE80]">{{ selectedOrgDetails.users?.length || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          <button
            @click="showDetailsModal = false"
            class="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Close
          </button>
        </div>
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
import { ref, onMounted, computed } from 'vue'
import { EyeIcon, KeyIcon, BuildingIcon, XIcon } from 'lucide-vue-next'
import { superadminApi } from '@/services/superadminApi'

// State
const loading = ref(true)
const organizations = ref([])
const showPasswordModal = ref(false)
const showDetailsModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const selectedOrg = ref(null)
const selectedOrgDetails = ref(null)
const passwordLoading = ref(false)
const passwordError = ref('')

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

// Fetch organizations
const fetchOrganizations = async () => {
  try {
    loading.value = true
    console.log('Fetching organizations from backend...')
    console.log('Token:', localStorage.getItem('superAdminToken') ? 'Present' : 'Missing')
    
    const response = await superadminApi.get('/organizations')
    console.log('Organizations response:', response)
    organizations.value = response.data?.data || response.data?.organizations || response.data || []
  } catch (error) {
    console.error('Failed to fetch organizations - Full error:', error)
    console.error('Error response:', error.response)
    console.error('Error message:', error.message)
    
    let errorMsg = 'Error fetching organizations'
    if (error.response?.status === 401) {
      errorMsg += ': Unauthorized - Token may be expired'
    } else if (error.response?.data?.error) {
      errorMsg += ': ' + error.response.data.error
    } else {
      errorMsg += ': ' + (error.message || 'Unknown error')
    }
    console.error(errorMsg)
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}

// Fetch organization details (departments, users, stats)
const fetchOrganizationDetails = async (orgId) => {
  try {
    const response = await superadminApi.get(`/organizations/${orgId}/details`)
    selectedOrgDetails.value = response.data?.data || response.data
  } catch (error) {
    console.error('Failed to fetch organization details:', error)
    alert('Error fetching organization details: ' + error.message)
  }
}

// Filter organizations
const filteredOrganizations = computed(() => {
  return organizations.value.filter((org) => {
    const matchesSearch =
      org.Org_Name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      org.Org_Domain.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      filterStatus.value === '' ||
      (filterStatus.value === 'active' && org.Is_Active) ||
      (filterStatus.value === 'inactive' && !org.Is_Active)

    return matchesSearch && matchesStatus
  })
})

// Open admin password modal
const openAdminPasswordModal = (org) => {
  selectedOrg.value = org
  passwordForm.value = { newPassword: '', confirmPassword: '' }
  passwordError.value = ''
  showPasswordModal.value = true
}

// Reset admin password
const resetAdminPassword = async () => {
  passwordError.value = ''

  if (!passwordForm.value.newPassword) {
    passwordError.value = 'Please enter a new password'
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'Password must be at least 8 characters'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }

  try {
    passwordLoading.value = true
    await superadminApi.put(`/organizations/${selectedOrg.value.Org_ID}/reset-admin-password`, {
      newPassword: passwordForm.value.newPassword
    })

    alert('Admin password reset successfully')
    showPasswordModal.value = false
    passwordForm.value = { newPassword: '', confirmPassword: '' }
  } catch (error) {
    console.error('Failed to reset password:', error)
    passwordError.value = error.response?.data?.message || 'Failed to reset password'
  } finally {
    passwordLoading.value = false
  }
}

// View organization details
const viewOrganizationDetails = async (org) => {
  selectedOrg.value = org
  selectedOrgDetails.value = null
  showDetailsModal.value = true
  await fetchOrganizationDetails(org.Org_ID)
}

// Format date
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  fetchOrganizations()
})
</script>
