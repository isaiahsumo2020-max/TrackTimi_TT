<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Employee Management</h1>
            <p class="text-sm text-gray-600 mt-1">Manage your organization's employees</p>
          </div>
          <button @click="showAddEmployeeModal = true"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Employee
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Employees</p>
              <p class="text-2xl font-bold text-gray-900">{{ employees.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Today</p>
              <p class="text-2xl font-bold text-gray-900">{{ activeToday }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Invitations</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingInvitations }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mb-6">
        <nav class="flex space-x-8">
          <button @click="activeTab = 'employees'"
                  :class="activeTab === 'employees' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
            Employees
          </button>
          <button @click="activeTab = 'invitations'"
                  :class="activeTab === 'invitations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
                  class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm">
            Invitations
          </button>
        </nav>
      </div>

      <!-- Employees Tab -->
      <div v-if="activeTab === 'employees'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium text-gray-900">All Employees</h3>
            <input v-model="searchQuery" type="text" placeholder="Search employees..."
                   class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="employee in filteredEmployees" :key="employee.User_ID">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">
                            {{ employee.First_Name?.[0] }}{{ employee.SurName?.[0] }}
                          </span>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">
                          {{ employee.First_Name }} {{ employee.SurName }}
                        </div>
                        <div class="text-sm text-gray-500">{{ employee.Email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.User_Type_ID === 1 ? 'Admin' : 'Staff' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ employee.Depart_ID ? 'Department ' + employee.Depart_ID : 'Not Assigned' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="employee.Is_Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ employee.Is_Active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button class="text-red-600 hover:text-red-900">Deactivate</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Invitations Tab -->
      <div v-if="activeTab === 'invitations'" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h3>

          <div class="space-y-4">
            <div v-for="invitation in invitations" :key="invitation.Invitation_ID"
                 class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ invitation.Email }}</p>
                  <p class="text-sm text-gray-500">Role: {{ invitation.UserType }}</p>
                  <p class="text-sm text-gray-500">Sent: {{ formatDate(invitation.Created_at) }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <span :class="getStatusClass(invitation.Status)"
                        class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ invitation.Status }}
                  </span>
                  <button v-if="invitation.Status === 'Pending'"
                          @click="resendInvitation(invitation.Invitation_ID)"
                          class="text-blue-600 hover:text-blue-900 text-sm">
                    Resend
                  </button>
                </div>
              </div>
            </div>

            <div v-if="invitations.length === 0" class="text-center py-8 text-gray-500">
              No pending invitations
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployeeModal"
         class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
         @click="showAddEmployeeModal = false">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
           @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>

          <form @submit.prevent="inviteEmployee" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">First Name</label>
              <input v-model="newEmployee.firstName" type="text" required
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Last Name</label>
              <input v-model="newEmployee.surName" type="text" required
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="newEmployee.email" type="email" required
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Department</label>
              <select v-model="newEmployee.departmentId"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Department</option>
                <option v-for="dept in departments" :key="dept.Depart_ID" :value="dept.Depart_ID">
                  {{ dept.Depart_Name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Job Title</label>
              <input v-model="newEmployee.jobTitle" type="text"
                     class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select v-model="newEmployee.userTypeId"
                      class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="3">Staff</option>
                <option value="2">Manager</option>
                <option value="5">Supervisor</option>
              </select>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button type="button" @click="showAddEmployeeModal = false"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" :disabled="inviting"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50">
                {{ inviting ? 'Sending...' : 'Send Invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/api.js'

const authStore = useAuthStore()

// State
const employees = ref([])
const invitations = ref([])
const departments = ref([])
const activeTab = ref('employees')
const searchQuery = ref('')
const showAddEmployeeModal = ref(false)
const inviting = ref(false)
const activeToday = ref(0)
const pendingInvitations = ref(0)

const newEmployee = ref({
  firstName: '',
  surName: '',
  email: '',
  departmentId: '',
  jobTitle: '',
  userTypeId: '3'
})

// Computed
const filteredEmployees = computed(() => {
  if (!searchQuery.value) return employees.value
  return employees.value.filter(emp =>
    `${emp.First_Name} ${emp.SurName}`.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    emp.Email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Methods
const loadEmployees = async () => {
  try {
    const response = await api.get('/users')
    employees.value = response.data
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

const loadInvitations = async () => {
  try {
    const response = await api.get('/admin/invitations')
    invitations.value = response.data.invitations
    pendingInvitations.value = response.data.invitations.filter(inv => inv.Status === 'Pending').length
  } catch (error) {
    console.error('Error loading invitations:', error)
  }
}

const loadDepartments = async () => {
  try {
    const response = await api.get('/departments')
    departments.value = response.data
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

const inviteEmployee = async () => {
  inviting.value = true
  try {
    await api.post('/admin/invite-employee', newEmployee.value)
    showAddEmployeeModal.value = false
    newEmployee.value = { firstName: '', surName: '', email: '', departmentId: '', jobTitle: '', userTypeId: '3' }
    await loadInvitations()
    alert('Employee invitation sent successfully!')
  } catch (error) {
    console.error('Error inviting employee:', error)
    alert(error.response?.data?.error || 'Failed to send invitation')
  } finally {
    inviting.value = false
  }
}

const resendInvitation = async (invitationId) => {
  try {
    await api.post(`/admin/resend-invitation/${invitationId}`)
    alert('Invitation resent successfully!')
    await loadInvitations()
  } catch (error) {
    console.error('Error resending invitation:', error)
    alert('Failed to resend invitation')
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Accepted': return 'bg-green-100 text-green-800'
    case 'Expired': return 'bg-red-100 text-red-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadEmployees(),
    loadInvitations(),
    loadDepartments()
  ])
})
</script>