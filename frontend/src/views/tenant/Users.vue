<!-- src/views/tenant/Users.vue - FULL WORKING PAGE -->
<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="flex items-center justify-between mb-12">
      <h1 class="text-4xl font-bold text-black">👥 Manage Users</h1>
      <router-link to="/dashboard" class="btn-black px-8 py-3 rounded-2xl font-bold">
        ← Dashboard
      </router-link>
    </div>

    <!-- Add User Button -->
    <div class="mb-12">
      <button @click="showCreateModal = true" class="btn-orange px-8 py-4 text-xl rounded-3xl font-bold shadow-2xl">
        ➕ Add New User
      </button>
    </div>

    <!-- USERS LIST (stub data) -->
    <div class="grid gap-6">
      <div v-for="user in users" :key="user.id" class="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-all">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-14 h-14 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              {{ user.initials }}
            </div>
            <div>
              <h3 class="text-2xl font-bold text-black">{{ user.name }}</h3>
              <p class="text-gray-600">{{ user.email }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ user.department }}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ⭐ PHONE TRACKING CONSENT MODAL -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showCreateModal = false">
      <div class="bg-white rounded-3xl p-10 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-black">➕ Add User</h2>
          <button @click="showCreateModal = false" class="text-2xl hover:text-gray-600">&times;</button>
        </div>

        <form @submit.prevent="createUser">
          <!-- First Name -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-gray-900 mb-3">First Name</label>
            <input v-model="newUser.firstName" required type="text" placeholder="John" 
                   class="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all">
          </div>

          <!-- Last Name -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-gray-900 mb-3">Last Name</label>
            <input v-model="newUser.surName" required type="text" placeholder="Doe" 
                   class="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all">
          </div>

          <!-- Email/Phone -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-gray-900 mb-3">Email/Phone</label>
            <input v-model="newUser.email" required type="text" placeholder="john@example.com or +231..." 
                   class="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all">
          </div>

          <!-- Department -->
          <div class="mb-6">
            <label class="block text-lg font-bold text-gray-900 mb-3">Department</label>
            <select v-model="newUser.departId" required class="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-500 focus:outline-none">
              <option value="">Select Department</option>
              <option value="1">Engineering</option>
              <option value="2">HR</option>
              <option value="3">Sales</option>
              <option value="4">Management</option>
            </select>
          </div>

          <!-- User Type -->
          <div class="mb-8">
            <label class="block text-lg font-bold text-gray-900 mb-3">User Type</label>
            <select v-model="newUser.userTypeId" required class="w-full p-4 border-2 border-gray-200 rounded-2xl text-xl focus:border-orange-500 focus:outline-none">
              <option value="">Select User Type</option>
              <option value="1">Admin</option>
              <option value="2">Manager</option>
              <option value="3">Staff</option>
              <option value="4">Student</option>
            </select>
          </div>

          <!-- ⭐ PHONE TRACKING CONSENT CHECKBOX -->
          <div class="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 mb-8">
            <label class="flex items-start space-x-4 cursor-pointer group">
              <div class="flex-shrink-0 mt-1">
                <input v-model="newUser.consent" required type="checkbox" class="w-6 h-6 rounded-lg border-4 border-orange-300 focus:ring-orange-500 accent-orange-500">
              </div>
              <div class="flex-1">
                <p class="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600">
                  📱 Phone Tracking Consent Required
                </p>
                <p class="text-sm text-gray-700 leading-relaxed">
                  <strong>I confirm:</strong> TrackTimi will track my phone's <strong>GPS location, browser fingerprint, and device ID</strong> during check-ins to prevent proxy attendance. This data is stored securely and used only for attendance verification. I understand and consent to this tracking.
                </p>
                <p class="text-xs text-gray-500 mt-2 font-medium">GDPR/Liberian Data Protection Compliant</p>
              </div>
            </label>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-4">
            <button type="button" @click="showCreateModal = false" 
                    class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 px-6 rounded-2xl font-bold text-lg transition-all">
              Cancel
            </button>
            <button type="submit" :disabled="!newUser.consent || isLoading" 
                    class="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center">
              <span v-if="isLoading">⏳ Creating...</span>
              <span v-else-if="!newUser.consent">✅ Consent Required</span>
              <span v-else>✅ Create User</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ⭐ SUCCESS MODAL WITH EMPLOYEE ID -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showSuccessModal = false">
      <div class="bg-white rounded-3xl p-10 max-w-md w-full shadow-2xl">
        <div class="text-center">
          <div class="text-6xl mb-6">✅</div>
          <h2 class="text-3xl font-bold text-black mb-4">User Created Successfully!</h2>
          
          <div class="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-2xl p-8 mb-8">
            <p class="text-gray-600 text-lg mb-2">Employee ID</p>
            <p class="text-4xl font-bold text-green-600 break-all">{{ createdEmployeeId }}</p>
            <p class="text-sm text-gray-500 mt-4">This ID is unique and can be shared with the employee for reference.</p>
            
            <div class="flex gap-3 mt-6">
              <button @click="copyToClipboard" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all">
                📋 Copy ID
              </button>
              <button @click="shareEmployeeId" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all">
                📨 Share
              </button>
            </div>
          </div>

          <div class="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <p class="font-bold text-gray-900 mb-3">📋 User Details:</p>
            <p class="text-gray-700 mb-2"><strong>Name:</strong> {{ createdUser.firstName }} {{ createdUser.surName }}</p>
            <p class="text-gray-700 mb-2"><strong>Email:</strong> {{ createdUser.email }}</p>
            <p class="text-gray-700"><strong>User Type:</strong> {{ getUserTypeName(createdUser.userTypeId) }}</p>
          </div>

          <button @click="showSuccessModal = false" 
                  class="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transition-all">
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const { addUser } = useApi()

// Data
const showCreateModal = ref(false)
const showSuccessModal = ref(false)
const isLoading = ref(false)

const newUser = ref({
  firstName: '',
  surName: '',
  email: '',
  departId: '',
  userTypeId: '',
  consent: false
})

const createdUser = ref(null)
const createdEmployeeId = ref('')

// Mock users list
const users = ref([
  { id: 1, name: 'John Doe', email: 'john@acmecorp.com', department: 'Engineering', initials: 'JD', employeeId: 'EMP123456' },
  { id: 2, name: 'Jane Smith', email: '+23112345678', department: 'HR', initials: 'JS', employeeId: 'EMP789012' }
])

// Get user type name from ID
const getUserTypeName = (userTypeId) => {
  const types = {
    '1': 'Admin',
    '2': 'Manager',
    '3': 'Staff',
    '4': 'Student'
  }
  return types[userTypeId] || 'Unknown'
}

// Copy Employee ID to clipboard
const copyToClipboard = () => {
  navigator.clipboard.writeText(createdEmployeeId.value)
  alert('✅ Employee ID copied to clipboard!')
}

// Share Employee ID
const shareEmployeeId = () => {
  const text = `Employee ID: ${createdEmployeeId.value}\nName: ${createdUser.value.firstName} ${createdUser.value.surName}`
  if (navigator.share) {
    navigator.share({
      title: 'TrackTimi Employee ID',
      text: text
    }).catch(err => console.log('Share failed:', err))
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(text)
    alert('✅ Employee ID copied! You can now paste and share it.')
  }
}

// Create user
const createUser = async () => {
  if (!newUser.value.consent) {
    alert('Phone tracking consent is REQUIRED!')
    return
  }
  
  isLoading.value = true
  
  try {
    // Prepare data for API
    const userData = {
      firstName: newUser.value.firstName,
      surName: newUser.value.surName,
      email: newUser.value.email,
      departId: parseInt(newUser.value.departId),
      userTypeId: parseInt(newUser.value.userTypeId)
    }
    
    // Call backend API
    const response = await addUser(userData)
    
    // Store created user info
    createdUser.value = response.data || userData
    createdEmployeeId.value = response.data?.Employee_ID || 'N/A'
    
    // Add to local list
    const user = {
      id: users.value.length + 1,
      name: `${newUser.value.firstName} ${newUser.value.surName}`,
      email: newUser.value.email,
      department: `Dept ${newUser.value.departId}`,
      initials: `${newUser.value.firstName.charAt(0)}${newUser.value.surName.charAt(0)}`.toUpperCase(),
      employeeId: createdEmployeeId.value
    }
    
    users.value.push(user)
    
    // Reset form and show success modal
    newUser.value = { firstName: '', surName: '', email: '', departId: '', userTypeId: '', consent: false }
    showCreateModal.value = false
    showSuccessModal.value = true
    
  } catch (error) {
    console.error('Error creating user:', error)
    alert(`❌ Error creating user: ${error.message || 'Unknown error'}`)
  } finally {
    isLoading.value = false
  }
}
</script>
