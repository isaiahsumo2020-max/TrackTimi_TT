<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-black">Users</h1>
        <p class="text-gray-600 mt-2">{{ users.length }} total employees</p>
      </div>
      <button @click="showAddUserModal = true" class="btn-orange">
        + Add User
      </button>
    </div>

    <!-- Users Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Device</th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {{ user.initials }}
                  </div>
                  <div class="ml-4">
                    <div class="font-bold text-black text-lg">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ user.email }}</div>
                </td>
              
              <td class="px-6 py-4">
                <span class="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold border border-gray-200">
                  {{ user.department }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span :class="user.role === 'OrgAdmin' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-black/10 text-black border-black/20'"
                      class="px-4 py-2 rounded-full text-sm font-bold border">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-700">
                  <div>{{ user.device }}</div>
                  <div class="text-xs text-gray-500">Last seen: {{ user.lastSeen }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span :class="user.active ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
                      class="px-4 py-2 rounded-full text-sm font-bold border">
                  {{ user.active ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add User Modal -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showAddUserModal = false">
      <div class="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <h2 class="text-3xl font-bold text-black mb-8">Add New User</h2>
        <form @submit.prevent="addUser" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <input v-model="newUser.firstName" required type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <input v-model="newUser.lastName" required type="text" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <input v-model="newUser.email" required type="email" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input v-model="newUser.password" required type="password" minlength="6" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Role</label>
              <select v-model="newUser.role" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Department</label>
              <select v-model="newUser.departmentId" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option value="">No Department</option>
                <option value="1">Engineering</option>
                <option value="2">HR</option>
                <option value="3">Sales</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="showAddUserModal = false" class="flex-1 btn-black-light">
              Cancel
            </button>
            <button type="submit" :disabled="!isFormValid" class="flex-1 btn-orange">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const users = ref([
  { id: 1, initials: 'JD', name: 'John Doe', email: 'john@company.com', department: 'Engineering', role: 'OrgAdmin', device: 'Chrome-Web-XYZ123', lastSeen: '2 min ago', active: true },
  { id: 2, initials: 'JS', name: 'Jane Smith', email: 'jane@company.com', department: 'HR', role: 'Manager', device: 'iPhone 14-Web', lastSeen: '5 min ago', active: true },
  { id: 3, initials: 'MJ', name: 'Mike Johnson', email: 'mike@company.com', department: 'Engineering', role: 'Staff', device: 'Samsung S23-App', lastSeen: '1 hour ago', active: true }
])

const showAddUserModal = ref(false)
const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'Staff',
  departmentId: ''
})

const isFormValid = computed(() => {
  return newUser.value.firstName && newUser.value.lastName && newUser.value.email && newUser.value.password.length >= 6
})

const addUser = () => {
  // Simulate API call
  users.value.push({
    id: Date.now(),
    initials: (newUser.value.firstName[0] + newUser.value.lastName[0]).toUpperCase(),
    name: `${newUser.value.firstName} ${newUser.value.lastName}`,
    email: newUser.value.email,
    department: newUser.value.departmentId ? ['Engineering', 'HR', 'Sales'][newUser.value.departmentId - 1] : 'None',
    role: newUser.value.role,
    device: 'New Device',
    lastSeen: 'Just now',
    active: true
  })
  
  newUser.value = { firstName: '', lastName: '', email: '', password: '', role: 'Staff', departmentId: '' }
  showAddUserModal.value = false
}
</script>
