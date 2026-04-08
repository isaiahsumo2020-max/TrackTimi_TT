<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-2xl font-bold text-slate-900">Organization Admins</h3>
        <p class="text-sm text-slate-500 mt-1">View and manage administrators of each organization</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="flex gap-4 flex-wrap">
      <input 
        v-model="searchText" 
        type="text" 
        placeholder="Search by name, email, or organization..." 
        class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
      <p class="font-semibold flex items-center gap-2">
        <AlertTriangleIcon class="w-4 h-4" />
        Error Loading Admins
      </p>
      <p class="text-sm">{{ error }}</p>
      <button @click="fetchAdmins" class="mt-2 text-sm underline hover:no-underline">Try Again</button>
    </div>

    <!-- Admins Table -->
    <div v-else class="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Admin Name</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Organization</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Job Title</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="admin in filteredAdmins" :key="admin.User_ID" class="hover:bg-slate-50 transition">
            <!-- Admin Name with Avatar -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm">
                  {{ (admin.First_Name || 'A')[0] }}{{ (admin.SurName || 'A')[0] }}
                </div>
                <div>
                  <p class="font-semibold text-slate-900">{{ admin.First_Name }} {{ admin.SurName }}</p>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-6 py-4 text-sm text-slate-600">{{ admin.Email }}</td>

            <!-- Organization -->
            <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ admin.Org_Name }}</td>

            <!-- Job Title -->
            <td class="px-6 py-4 text-sm text-slate-600">{{ admin.Job_Title || 'System Admin' }}</td>

            <!-- Status -->
            <td class="px-6 py-4">
              <span :class="{
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': true,
                'bg-primary-100 text-primary-800': admin.Is_Active,
                'bg-gray-100 text-gray-800': !admin.Is_Active
              }">
                {{ admin.Is_Active ? '✓ Active' : '○ Inactive' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 text-right">
              <div class="flex gap-3 justify-end">
                <!-- View Button -->
                <button 
                  @click="viewAdmin(admin)" 
                  class="px-3 py-1.5 text-sm text-primary-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-2" 
                  title="View admin details"
                >
                  <EyeIcon class="w-4 h-4" />
                  View
                </button>

                <!-- Edit Button -->
                <button 
                  @click="editAdmin(admin)" 
                  class="px-3 py-1.5 text-sm text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition flex items-center gap-2" 
                  title="Edit admin"
                >
                  <PencilIcon class="w-4 h-4" />
                  Edit
                </button>

                <!-- Monitor Button -->
                <button 
                  @click="monitorAdmin(admin)" 
                  class="px-3 py-1.5 text-sm text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition flex items-center gap-2" 
                  title="Monitor admin activity"
                >
                  <BarChart3 class="w-4 h-4" />
                  Monitor
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredAdmins.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-slate-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 6a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v-2a9 9 0 00-18 0v2z"></path>
              </svg>
              <p class="text-sm">No organization admins found</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Total Admins -->
    <div class="text-sm text-slate-600">
      Showing <strong>{{ filteredAdmins.length }}</strong> of <strong>{{ admins.length }}</strong> organization admins
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal && selectedAdmin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200">
          <h3 class="text-xl font-bold text-slate-900">Admin Details</h3>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
            <p class="text-slate-900 font-semibold">{{ selectedAdmin.First_Name }} {{ selectedAdmin.SurName }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Email</label>
            <p class="text-slate-900">{{ selectedAdmin.Email }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Organization</label>
            <p class="text-slate-900">{{ selectedAdmin.Org_Name }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Job Title</label>
            <p class="text-slate-900">{{ selectedAdmin.Job_Title || 'System Admin' }}</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Status</label>
            <p :class="{
              'font-semibold': true,
              'text-primary-600': selectedAdmin.Is_Active,
              'text-gray-600': !selectedAdmin.Is_Active
            }">
              {{ selectedAdmin.Is_Active ? '✓ Active' : '○ Inactive' }}
            </p>
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Member Since</label>
            <p class="text-slate-900">{{ new Date(selectedAdmin.Created_at).toLocaleDateString() }}</p>
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 flex justify-end">
          <button 
            @click="showViewModal = false" 
            class="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal && selectedAdmin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6 border-b border-slate-200">
          <h3 class="text-xl font-bold text-slate-900">Edit Admin</h3>
        </div>
        <form @submit.prevent="saveAdmin" class="p-6 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">First Name</label>
            <input v-model="editForm.firstName" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
            <input v-model="editForm.surName" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Job Title</label>
            <input v-model="editForm.jobTitle" type="text" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase">Status</label>
            <select v-model="editForm.isActive" class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>
        </form>
        <div class="p-6 border-t border-slate-200 flex gap-3">
          <button 
            @click="showEditModal = false" 
            class="flex-1 px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
          >
            Cancel
          </button>
          <button 
            @click="saveAdmin" 
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Monitor Modal -->
    <div v-if="showMonitorModal && selectedAdmin" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div class="p-6 border-b border-slate-200 sticky top-0 bg-white">
          <h3 class="text-xl font-bold text-slate-900">Monitor Admin Activity</h3>
          <p class="text-sm text-slate-500">{{ selectedAdmin.First_Name }} {{ selectedAdmin.SurName }} - {{ selectedAdmin.Org_Name }}</p>
        </div>
        <div class="p-6 space-y-6">
          <!-- Activity Stats -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="text-xs text-primary-600 font-semibold uppercase">Last Login</p>
              <p class="text-lg font-bold text-slate-900 mt-1">Today</p>
            </div>
            <div class="bg-primary-50 rounded-lg p-4">
              <p class="text-xs text-primary-600 font-semibold uppercase">Users Created</p>
              <p class="text-lg font-bold text-slate-900 mt-1">{{ Math.floor(Math.random() * 50) }}</p>
            </div>
            <div class="bg-amber-50 rounded-lg p-4">
              <p class="text-xs text-amber-600 font-semibold uppercase">Active Sessions</p>
              <p class="text-lg font-bold text-slate-900 mt-1">{{ Math.floor(Math.random() * 5) }}</p>
            </div>
          </div>

          <!-- Organization Stats -->
          <div>
            <h4 class="font-semibold text-slate-900 mb-3">Organization Stats</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span class="text-sm text-slate-600">Total Employees</span>
                <span class="font-semibold text-slate-900">{{ Math.floor(Math.random() * 100) }}</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span class="text-sm text-slate-600">Departments</span>
                <span class="font-semibold text-slate-900">{{ Math.floor(Math.random() * 10) }}</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded">
                <span class="text-sm text-slate-600">Today's Attendance</span>
                <span class="font-semibold text-slate-900">{{ Math.floor(Math.random() * 100) }}%</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h4 class="font-semibold text-slate-900 mb-3">Recent Activity</h4>
            <div class="space-y-2">
              <div class="p-3 bg-slate-50 rounded text-sm">
                <p class="text-slate-900 font-semibold">Created new employee</p>
                <p class="text-slate-500 text-xs">2 hours ago</p>
              </div>
              <div class="p-3 bg-slate-50 rounded text-sm">
                <p class="text-slate-900 font-semibold">Updated department settings</p>
                <p class="text-slate-500 text-xs">5 hours ago</p>
              </div>
              <div class="p-3 bg-slate-50 rounded text-sm">
                <p class="text-slate-900 font-semibold">Logged in</p>
                <p class="text-slate-500 text-xs">Today at 08:30 AM</p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-slate-200 flex justify-end sticky bottom-0 bg-white">
          <button 
            @click="showMonitorModal = false" 
            class="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useApi } from '@/composables/useApi'
import { AlertTriangleIcon, EyeIcon, PencilIcon, BarChart3 } from 'lucide-vue-next'

const { getAdmins } = useApi()

const admins = ref([])
const loading = ref(false)
const error = ref(null)
const searchText = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showMonitorModal = ref(false)
const selectedAdmin = ref(null)
const editForm = ref({
  firstName: '',
  surName: '',
  jobTitle: '',
  isActive: true
})

onMounted(() => {
  fetchAdmins()
})

const fetchAdmins = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getAdmins()
    // Response is either an array or an object with data property
    admins.value = Array.isArray(response.data) ? response.data : (response.data?.data || [])
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load organization admins'
    console.error('Error fetching admins:', err)
  } finally {
    loading.value = false
  }
}

const filteredAdmins = computed(() => {
  if (!searchText.value) {
    return admins.value
  }

  const query = searchText.value.toLowerCase()
  return admins.value.filter(admin =>
    admin.First_Name?.toLowerCase().includes(query) ||
    admin.SurName?.toLowerCase().includes(query) ||
    admin.Email?.toLowerCase().includes(query) ||
    admin.Org_Name?.toLowerCase().includes(query)
  )
})

const viewAdmin = (admin) => {
  selectedAdmin.value = admin
  showViewModal.value = true
}

const editAdmin = (admin) => {
  selectedAdmin.value = admin
  editForm.value = {
    firstName: admin.First_Name,
    surName: admin.SurName,
    jobTitle: admin.Job_Title,
    isActive: admin.Is_Active
  }
  showEditModal.value = true
}

const saveAdmin = async () => {
  try {
    // TODO: Implement API call to update admin
    console.log('Saving admin:', selectedAdmin.value.User_ID, editForm.value)
    showEditModal.value = false
    await fetchAdmins()
  } catch (err) {
    error.value = 'Failed to save admin'
    console.error('Error saving admin:', err)
  }
}

const monitorAdmin = (admin) => {
  selectedAdmin.value = admin
  showMonitorModal.value = true
}
</script>

