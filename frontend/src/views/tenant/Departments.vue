<template>
  <div class="space-y-8 max-w-7xl mx-auto p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black text-slate-900">Organizational Structure</h1>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Manage Departments & Personnel</p>
      </div>
      <button 
        @click="showAddDeptModal = true" 
        class="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all active:scale-95"
      >
        ✨ New Department
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-slate-500 font-bold">Loading departments...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="departments.length === 0" class="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
      <div class="text-6xl mb-4">🏢</div>
      <p class="text-slate-600 font-bold text-lg mb-2">No departments yet</p>
      <p class="text-slate-400 text-sm mb-6">Create your first department to get started</p>
      <button 
        @click="showAddDeptModal = true"
        class="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
      >
        Create Department
      </button>
    </div>

    <!-- Department Cards -->
    <div v-else class="grid grid-cols-1 gap-6">
      <div v-for="dept in departments" :key="dept.id" class="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300">
        
        <!-- Header: Dept Name and Count -->
        <div class="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex justify-between items-center">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center border border-orange-200">
              <span class="text-2xl">🏢</span>
            </div>
            <div>
              <h3 class="text-2xl font-black text-slate-900">{{ dept.name }}</h3>
              <p class="text-[10px] font-bold text-orange-600 uppercase tracking-[0.2em] mt-1">Department</p>
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-4xl font-black text-slate-900">{{ dept.users.length }}</span>
              <p class="text-[10px] font-bold text-slate-400 uppercase">Members</p>
            </div>
            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button 
                @click="editDept(dept)"
                class="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all"
                title="Edit department"
              >
                <EditIcon class="w-5 h-5" />
              </button>
              <button 
                @click="deleteDept(dept)"
                class="p-3 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all"
                title="Delete department"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Personnel List -->
        <div class="p-8">
          <div v-if="dept.users.length > 0" class="space-y-4">
            <div v-for="user in dept.users" :key="user.id" class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
              <div class="flex items-center gap-3 flex-1">
                <!-- Avatar -->
                <div v-if="user.avatar" class="w-10 h-10 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border-2 border-slate-200">
                  <img :src="`data:${user.avatarMimeType};base64,${user.avatar}`" :alt="user.name" class="w-full h-full object-cover" />
                </div>
                <div v-else class="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 border-2 border-orange-300">
                  {{ user.name[0].toUpperCase() }}
                </div>
                <!-- User Info -->
                <div class="flex-1">
                  <p class="text-sm font-bold text-slate-900">{{ user.name }}</p>
                  <p class="text-xs text-slate-500">{{ user.email }}</p>
                </div>
              </div>
              <!-- Job Title Badge -->
              <div class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">
                {{ user.job || 'Staff' }}
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <div class="text-4xl mb-3">👥</div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">No personnel assigned</p>
            <p class="text-[10px] text-slate-400 mt-2">Add employees to this department</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Department Modal -->
    <transition name="fade">
      <div v-if="showAddDeptModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <h2 class="text-2xl font-black text-slate-900 mb-2">Create Department</h2>
          <p class="text-sm text-slate-500 mb-6">Add a new department to your organization</p>
          
          <input 
            v-model="newDeptName" 
            @keyup.enter="addDepartment"
            class="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-none mb-6 font-bold placeholder-slate-400" 
            placeholder="e.g. Sales, Marketing, Engineering" 
          />
          
          <div class="flex gap-3">
            <button 
              @click="showAddDeptModal = false" 
              class="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="addDepartment"
              :disabled="!newDeptName || isLoading"
              class="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {{ isLoading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Edit Department Modal -->
    <transition name="fade">
      <div v-if="showEditDeptModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <h2 class="text-2xl font-black text-slate-900 mb-2">Edit Department</h2>
          <p class="text-sm text-slate-500 mb-6">Update department name</p>
          
          <input 
            v-model="editDeptName" 
            @keyup.enter="updateDepartment"
            class="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none mb-6 font-bold" 
          />
          
          <div class="flex gap-3">
            <button 
              @click="showEditDeptModal = false" 
              class="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="updateDepartment"
              :disabled="!editDeptName || isLoading"
              class="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {{ isLoading ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div class="text-4xl mb-4">🗑️</div>
          <h2 class="text-2xl font-black text-slate-900 mb-2">Delete Department?</h2>
          <p class="text-sm text-slate-600 mb-6">Are you sure you want to delete <strong>"{{ deleteDeptName }}"</strong>? This action cannot be undone.</p>
          
          <div class="flex gap-3">
            <button 
              @click="showDeleteConfirm = false" 
              class="flex-1 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="confirmDelete"
              :disabled="isLoading"
              class="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {{ isLoading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { EditIcon, TrashIcon } from 'lucide-vue-next'

const departments = ref([])
const loading = ref(false)
const isLoading = ref(false)

// Add Modal
const showAddDeptModal = ref(false)
const newDeptName = ref('')

// Edit Modal
const showEditDeptModal = ref(false)
const editDeptId = ref(null)
const editDeptName = ref('')

// Delete Modal
const showDeleteConfirm = ref(false)
const deleteDeptId = ref(null)
const deleteDeptName = ref('')

const fetchDepts = async () => {
  loading.value = true
  try {
    const res = await api.get('/org/departments')
    departments.value = res.data
  } catch (error) {
    console.error('Failed to fetch departments:', error)
  } finally {
    loading.value = false
  }
}

const addDepartment = async () => {
  if (!newDeptName.value.trim()) return
  
  isLoading.value = true
  try {
    await api.post('/org/departments', { name: newDeptName.value })
    newDeptName.value = ''
    showAddDeptModal.value = false
    await fetchDepts()
  } catch (error) {
    console.error('Failed to add department:', error)
    alert('Failed to create department')
  } finally {
    isLoading.value = false
  }
}

const editDept = (dept) => {
  editDeptId.value = dept.id
  editDeptName.value = dept.name
  showEditDeptModal.value = true
}

const updateDepartment = async () => {
  if (!editDeptName.value.trim() || !editDeptId.value) return
  
  isLoading.value = true
  try {
    await api.put(`/org/departments/${editDeptId.value}`, { name: editDeptName.value })
    showEditDeptModal.value = false
    await fetchDepts()
  } catch (error) {
    console.error('Failed to update department:', error)
    alert('Failed to update department')
  } finally {
    isLoading.value = false
  }
}

const deleteDept = (dept) => {
  deleteDeptId.value = dept.id
  deleteDeptName.value = dept.name
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!deleteDeptId.value) return
  
  isLoading.value = true
  try {
    console.log(`🗑️ Deleting department ${deleteDeptId.value}...`)
    const res = await api.delete(`/org/departments/${deleteDeptId.value}`)
    console.log('✅ Delete response:', res.data)
    showDeleteConfirm.value = false
    await fetchDepts()
  } catch (error) {
    console.error('❌ Delete error:', error.response?.data || error.message)
    const errorMsg = error.response?.data?.error || 'Failed to delete department. Please try again.'
    alert(errorMsg)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchDepts)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-in-from-bottom-4 {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>