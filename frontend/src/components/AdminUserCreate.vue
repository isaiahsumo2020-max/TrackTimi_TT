<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Error Feedback -->
    <div v-if="errorMessage" class="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 uppercase tracking-widest">
      {{ errorMessage }}
    </div>

    <!-- 1. Name Row -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-[10px] font-black text-slate-400 uppercase ml-2">First Name</label>
        <input v-model="form.firstName" type="text" placeholder="e.g. Abraham" class="p-4 bg-slate-50 rounded-lg border-none text-sm w-full focus:ring-2 focus:ring-primary-500" required />
      </div>
      <div class="space-y-1">
        <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Surname</label>
        <input v-model="form.surName" type="text" placeholder="e.g. Fallah" class="p-4 bg-slate-50 rounded-lg border-none text-sm w-full focus:ring-2 focus:ring-primary-500" required />
      </div>
    </div>
    
    <!-- 2. Email -->
    <div class="space-y-1">
      <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Email Address</label>
      <input v-model="form.email" type="email" placeholder="staff@company.com" class="w-full p-4 bg-slate-50 rounded-lg border-none text-sm focus:ring-2 focus:ring-primary-500" required />
    </div>
    
    <!-- 3. Organization Structure Row -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Department</label>
        <select v-model="form.depId" class="p-4 bg-slate-50 rounded-lg text-sm w-full font-bold text-slate-600 border-none focus:ring-2 focus:ring-primary-500" required>
          <option value="" disabled>Select Dept</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <div class="space-y-1">
        <label class="text-[10px] font-black text-slate-400 uppercase ml-2">System Role</label>
        <select v-model="form.userTypeId" class="p-4 bg-slate-50 rounded-lg text-sm w-full font-bold text-slate-600 border-none focus:ring-2 focus:ring-primary-500">
          <option value="3">Staff / Employee</option>
          <option value="2">Manager</option>
          <option value="1">Admin</option>
        </select>
      </div>
    </div>

    <!-- 4. Job Title -->
    <div class="space-y-1">
      <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Official Job Title</label>
      <input v-model="form.jobTitle" type="text" placeholder="e.g. Operations Manager" class="w-full p-4 bg-slate-50 rounded-lg border-none text-sm focus:ring-2 focus:ring-primary-500" />
    </div>

    <!-- 5. Password (Optional - will be mailed to user) -->
    <div class="space-y-1">
      <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Temporary Password (Optional)</label>
      <div class="flex gap-2">
        <input v-model="form.password" type="text" placeholder="Leave blank to auto-generate" class="flex-1 p-4 bg-slate-50 rounded-lg border-none text-sm font-mono focus:ring-2 focus:ring-primary-500" />
        <button type="button" @click="generatePassword" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold uppercase transition">
          🔄 Generate
        </button>
      </div>
      <p class="text-[9px] text-slate-400 ml-2 mt-1">Password will be sent to user's email</p>
    </div>

    <!-- Submit Button -->
    <button type="submit" :disabled="loading" class="w-full py-5 bg-primary-600 text-white rounded-lg font-black text-sm hover:bg-primary-700 transition-all shadow-md shadow-primary-100 active:scale-[0.98] disabled:opacity-50">
      {{ loading ? 'SENDING INVITATION...' : 'SEND INVITATION' }}
    </button>
  </form>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'

const emit = defineEmits(['success'])

const loading = ref(false)
const errorMessage = ref('')
const departments = ref([])

const form = reactive({
  firstName: '',
  surName: '',
  email: '',
  jobTitle: '',
  depId: '', 
  userTypeId: '3',
  password: ''
})

// Fetch live departments from the Org Route we just updated
const fetchDepartments = async () => {
  try {
    const res = await api.get('/org/departments')
    departments.value = res.data
  } catch (err) {
    console.error("Failed to load departments")
  }
}

// Generate a random password
const generatePassword = () => {
  const length = 10
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  form.password = password
}

const handleSubmit = async () => {
  loading.value = true
  errorMessage.value = ''
  
  // Auto-generate password if not provided
  if (!form.password) {
    generatePassword()
  }
  
  try {
    // This now sends invitation email instead of creating user directly
    const res = await api.post('/org/users', form)
    
    // Clear form and notify parent (Users.vue) to refresh list and close modal
    Object.assign(form, { firstName: '', surName: '', email: '', jobTitle: '', depId: '', password: '', userTypeId: '3' })
    emit('success', { message: res.data.message })
  } catch (err) {
    errorMessage.value = err.response?.data?.error || 'Invitation failed. Check server logs.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDepartments)
</script>