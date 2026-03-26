<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside :class="[
        sidebarOpen ? 'w-64' : 'w-0 overflow-hidden',
        'bg-gradient-to-b from-gray-700 to-gray-700 text-white shadow-xl flex flex-col transition-all duration-300'
      ]">
      <div class="p-6 border-b border-gray-600 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-xl font-bold text-white">A</span>
          </div>
          <span class="text-lg font-bold">TrackTimi</span>
        </div>
        <button @click="toggleSidebar" class="p-1 rounded-lg bg-gray-700 hover:bg-gray-600">
          <span v-if="sidebarOpen">←</span>
          <span v-else>→</span>
        </button>
      </div>

      <nav class="flex-1 py-8 px-4 space-y-2">
        <router-link to="/superadmin" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/superadmin/organizations" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all bg-orange-500 text-white shadow-lg">
          <span>🏢</span>
          <span>Organizations</span>
        </router-link>
        <router-link to="/superadmin/revenue" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-500">
          <span>💰</span>
          <span>Revenue</span>
        </router-link>
        <router-link to="/superadmin/subscriptions" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📦</span>
          <span>Subscriptions</span>
        </router-link>
        <router-link to="/superadmin/analytics" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📈</span>
          <span>Analytics</span>
        </router-link>
        <router-link to="/superadmin/monitoring" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>🔍</span>
          <span>Monitoring</span>
        </router-link>
        <router-link to="/superadmin/audit-logs" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>📋</span>
          <span>Audit Logs</span>
        </router-link>
        <router-link to="/superadmin/settings" class="flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-100 hover:bg-gray-600">
          <span>⚙️</span>
          <span>Settings</span>
        </router-link>
      </nav>

      <div class="p-6 border-t border-gray-600">
        <div class="flex items-center space-x-3 cursor-pointer hover:bg-gray-600 p-3 rounded-lg transition-all">
          <div class="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center font-bold">
            JS
          </div>
          <div class="flex-1">
            <div class="font-semibold text-sm">Jodell Suah</div>
            <div class="text-xs text-orange-400">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <div class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div class="px-8 py-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Organizations</h1>
              <p class="text-slate-600 mt-2">Manage all organizations and their details</p>
            </div>
            <div class="flex items-center space-x-3">
              <button class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-lg font-semibold transition-all">
                Filters
              </button>
              <button @click="handleLogout" class="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-8">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-900">All Organizations ({{ organizations.length }})</h2>
            <p class="text-slate-600 mt-1">Manage all organizations on the platform</p>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="text-gray-500">Loading organizations...</div>
          </div>

          <div v-else-if="organizations.length === 0" class="text-center py-12">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-slate-600">No organizations found</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-300 bg-gray-50">
                  <th class="pb-3 px-4 font-semibold text-slate-700">Logo</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Organization Name</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Users</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Departments</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Plan</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Status</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Created</th>
                  <th class="pb-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="org in organizations" :key="org.Org_ID" class="border-b border-gray-200 hover:bg-gray-50 transition-all">
                  <td class="py-4 px-4">
                    <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center font-bold text-emerald-700">
                      {{ org.initials }}
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    <p class="font-semibold text-slate-900">{{ org.Org_Name }}</p>
                    <p class="text-xs text-slate-500">{{ org.Org_Slug }}</p>
                  </td>
                  <td class="py-4 px-4">
                    <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{{ org.userCount || 0 }}</span>
                  </td>
                  <td class="py-4 px-4">
                    <span class="text-slate-900 font-medium">{{ org.deptCount || 0 }}</span>
                  </td>
                  <td class="py-4 px-4">
                    <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">{{ org.Plan_Name || 'Free' }}</span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                      <span v-if="org.Is_Active" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">✅ Active</span>
                      <span v-else class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">🔴 Inactive</span>
                    </div>
                  </td>
                  <td class="py-4 px-4 text-sm text-slate-600">
                    {{ new Date(org.Created_at).toLocaleDateString() }}
                  </td>
                  <td class="py-4 px-4">
                    <button @click="viewOrgDetails(org)" class="text-emerald-600 hover:text-emerald-700 font-semibold text-sm">
                      👁️ View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Organization Detail Modal -->
    <div v-if="selectedOrg" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-16 h-16 bg-white rounded-lg flex items-center justify-center font-bold text-emerald-600 text-2xl">
              {{ selectedOrg.initials }}
            </div>
            <div>
              <h2 class="text-2xl font-bold">{{ selectedOrg.Org_Name }}</h2>
              <p class="text-emerald-100">{{ selectedOrg.Org_Domain }}</p>
            </div>
          </div>
          <button @click="selectedOrg = null" class="text-2xl hover:bg-emerald-500 p-2 rounded">✕</button>
        </div>

        <!-- Modal Body -->
        <div class="p-8 space-y-6">
          <!-- Status Indicator -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm font-semibold text-blue-700 mb-2">Current Status</p>
            <div class="flex items-center space-x-4">
              <span v-if="selectedOrg.Is_Active" class="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">✅ Active</span>
              <span v-else class="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold">🔴 Inactive</span>
              <p class="text-sm text-gray-600">Created: {{ new Date(selectedOrg.Created_at).toLocaleDateString() }}</p>
            </div>
          </div>

          <!-- Organization Details Grid -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600 font-semibold">Organization Type</p>
              <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedOrg.Org_Type_ID ? `Type ${selectedOrg.Org_Type_ID}` : 'N/A' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600 font-semibold">Region</p>
              <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedOrg.Region_ID ? `Region ${selectedOrg.Region_ID}` : 'N/A' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600 font-semibold">Email</p>
              <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedOrg.Email || 'N/A' }}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600 font-semibold">Phone</p>
              <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedOrg.Phone_Num || 'N/A' }}</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-blue-600 font-semibold">Total Users</p>
              <p class="text-lg font-bold text-blue-900 mt-1">{{ selectedOrg.user_count || 0 }}</p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <p class="text-sm text-purple-600 font-semibold">Departments</p>
              <p class="text-lg font-bold text-purple-900 mt-1">{{ selectedOrg.dept_count || 0 }}</p>
            </div>
          </div>

          <!-- Address -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 font-semibold">Address</p>
            <p class="text-gray-900 mt-2">{{ selectedOrg.Address || 'Not provided' }}</p>
          </div>

          <!-- Employees -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 font-semibold">Number of Employees</p>
            <p class="text-lg font-bold text-gray-900 mt-1">{{ selectedOrg.Num_of_Employee || 0 }}</p>
          </div>

          <!-- Theme Color -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 font-semibold">Theme Color</p>
            <div class="flex items-center space-x-3 mt-2">
              <div class="w-12 h-12 rounded-lg border-2 border-gray-300" :style="{ backgroundColor: selectedOrg.Theme_Color }"></div>
              <p class="text-lg font-mono text-gray-900">{{ selectedOrg.Theme_Color }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="border-t pt-6 space-y-3">
            <p class="text-sm font-semibold text-gray-700 mb-4">Superadmin Actions</p>
            <div class="grid grid-cols-2 gap-3">
              <button @click="suspendOrg(selectedOrg.Org_ID)" :disabled="submitting" class="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all">
                ⏸️ {{ selectedOrg.Is_Active ? 'Suspend' : 'Activate' }}
              </button>
              <button @click="deleteOrg(selectedOrg.Org_ID)" :disabled="submitting" class="px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all">
                🗑️ Delete Organization
              </button>
              <button @click="extendTrial(selectedOrg.Org_ID)" :disabled="submitting" class="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all">
                ⏳ Extend Trial
              </button>
              <button @click="viewUsers(selectedOrg.Org_ID)" :disabled="submitting" class="px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all">
                👥 View Users
              </button>
            </div>
          </div>

          <div v-if="actionMessage" :class="['p-4 rounded-lg', actionMessageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800']">
            {{ actionMessage }}
          </div>
        </div>
      </div>
    </div>

    <!-- Users Modal -->
    <div v-if="showUsersModal && selectedOrgUsers" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold">Organization Users</h2>
          <button @click="showUsersModal = false" class="text-2xl hover:bg-purple-500 p-2 rounded">✕</button>
        </div>
        <div class="p-6">
          <div v-if="selectedOrgUsers.length === 0" class="text-center py-8">
            <p class="text-gray-500">No users found</p>
          </div>
          <div v-else class="space-y-3">
            <div v-for="user in selectedOrgUsers" :key="user.User_ID" class="border border-gray-200 p-4 rounded-lg hover:bg-gray-50">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-bold text-gray-900">{{ user.First_Name }} {{ user.SurName }}</p>
                  <p class="text-sm text-gray-600">{{ user.Email }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ new Date(user.Created_at).toLocaleDateString() }}</p>
                </div>
                <span v-if="user.Is_Active" class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Active</span>
                <span v-else class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Inactive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const sidebarOpen = ref(true)
const organizations = ref([])
const loading = ref(false)
const error = ref('')
const selectedOrg = ref(null)
const selectedOrgUsers = ref(null)
const showUsersModal = ref(false)
const submitting = ref(false)
const actionMessage = ref('')
const actionMessageType = ref('success')

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = () => {
  localStorage.removeItem('superAdminToken')
  localStorage.removeItem('superAdminUser')
  router.push('/superadmin/login')
}

const loadOrganizations = async () => {
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    const response = await axios.get(
      'http://localhost:4000/api/superadmin/organizations',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data?.organizations) {
      organizations.value = response.data.organizations.map(org => ({
        ...org,
        initials: org.Org_Name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
      }))
    }
  } catch (err) {
    console.error('Failed to load organizations:', err)
    error.value = 'Failed to load organizations'
  } finally {
    loading.value = false
  }
}

const viewOrgDetails = async (org) => {
  try {
    const token = localStorage.getItem('superAdminToken')
    const response = await axios.get(
      `http://localhost:4000/api/superadmin/organizations/${org.Org_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    selectedOrg.value = {
      ...response.data,
      initials: org.initials
    }
    actionMessage.value = ''
  } catch (err) {
    console.error('Failed to load org details:', err)
    error.value = 'Failed to load organization details'
  }
}

const suspendOrg = async (orgId) => {
  submitting.value = true
  try {
    const token = localStorage.getItem('superAdminToken')
    const newStatus = selectedOrg.value.Is_Active ? 'suspended' : 'active'
    
    await axios.put(
      `http://localhost:4000/api/superadmin/organizations/${orgId}/status`,
      { status: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    selectedOrg.value.Is_Active = !selectedOrg.value.Is_Active
    actionMessage.value = `✅ Organization ${newStatus} successfully`
    actionMessageType.value = 'success'
    
    // Reload organizations
    setTimeout(() => {
      loadOrganizations()
    }, 1500)
  } catch (err) {
    actionMessage.value = err.response?.data?.error || 'Failed to update status'
    actionMessageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

const deleteOrg = async (orgId) => {
  if (!confirm('⚠️ Are you sure you want to delete this organization? This action cannot be undone!')) {
    return
  }

  submitting.value = true
  try {
    const token = localStorage.getItem('superAdminToken')
    
    await axios.delete(
      `http://localhost:4000/api/superadmin/organizations/${orgId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    actionMessage.value = '✅ Organization deleted successfully'
    actionMessageType.value = 'success'
    
    setTimeout(() => {
      selectedOrg.value = null
      loadOrganizations()
    }, 1500)
  } catch (err) {
    actionMessage.value = err.response?.data?.error || 'Failed to delete organization'
    actionMessageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

const extendTrial = async (orgId) => {
  submitting.value = true
  try {
    const token = localStorage.getItem('superAdminToken')
    
    await axios.put(
      `http://localhost:4000/api/superadmin/organizations/${orgId}/extend-trial`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    actionMessage.value = '✅ Trial extended by 30 days'
    actionMessageType.value = 'success'
  } catch (err) {
    actionMessage.value = err.response?.data?.error || 'Failed to extend trial'
    actionMessageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

const viewUsers = async (orgId) => {
  submitting.value = true
  try {
    const token = localStorage.getItem('superAdminToken')
    
    const response = await axios.get(
      `http://localhost:4000/api/superadmin/organizations/${orgId}/users`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    selectedOrgUsers.value = response.data
    showUsersModal.value = true
  } catch (err) {
    actionMessage.value = err.response?.data?.error || 'Failed to load users'
    actionMessageType.value = 'error'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadOrganizations()
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
