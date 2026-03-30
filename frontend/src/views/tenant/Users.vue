<template>
  <div class="p-6 lg:p-10 max-w-7xl mx-auto min-h-screen bg-[#FDFDFD] space-y-10 animate-in fade-in duration-700">
    
    <!-- 1. Header & Quick Stats -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-4">
        <div class="space-y-1">
          <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Personnel Management</p>
          <h1 class="text-4xl font-black text-slate-900 tracking-tight">Workforce Directory</h1>
        </div>
        
        <!-- Mini Stats Strip -->
        <div class="flex items-center space-x-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl font-black text-slate-900">{{ users.length }}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Staff</span>
          </div>
          <div class="w-px h-4 bg-slate-200"></div>
          <div class="flex items-center space-x-2">
            <span class="text-xl font-black text-green-600">{{ activeCount }}</span>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currently Active</span>
          </div>
        </div>
      </div>

      <button @click="showCreateModal = true" class="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 active:scale-95 flex items-center">
        <PlusIcon class="w-4 h-4 mr-2" />
        Provision Personnel
      </button>
    </div>

    <!-- 2. Search & Filter Bar -->
    <div class="flex flex-col md:flex-row gap-4">
      <div class="relative flex-1 group">
        <SearchIcon class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by name, email, or employee ID..." 
          class="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
        />
      </div>
      <select v-model="filterStatus" class="px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 outline-none shadow-sm">
        <option value="all">All Status</option>
        <option value="active">Active Only</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- 3. Live Grid / Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Skeleton Loader -->
      <div v-for="i in 6" :key="i" class="bg-slate-50 h-64 rounded-[2.5rem] animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Empty State -->
      <div v-if="filteredUsers.length === 0" class="col-span-full py-32 bg-slate-50 border border-dashed border-slate-200 rounded-[4rem] text-center space-y-4">
        <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <UsersIcon class="w-8 h-8 text-slate-200" />
        </div>
        <p class="text-sm font-black text-slate-400 uppercase tracking-widest">No matching personnel found</p>
      </div>

      <!-- User Card -->
      <div v-for="user in filteredUsers" :key="user.User_ID" 
        class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
        
        <!-- Header: Avatar & Menu -->
        <div class="flex items-start justify-between mb-8">
          <div class="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg shadow-slate-200 group-hover:rotate-6 transition-transform">
            {{ user?.firstName?.[0] || '?' }}{{ user?.surName?.[0] || '' }}
          </div>
          
          <div class="flex flex-col items-end space-y-2">
            <span class="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 uppercase tracking-tighter">
              #{{ user.employeeId || 'PENDING' }}
            </span>
            <!-- Simple Action Dropdown (Visual Only for now) -->
            <button class="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
              <MoreHorizontalIcon class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- Body -->
        <div class="space-y-1">
          <h3 class="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
            {{ user.firstName }} {{ user.surName }}
          </h3>
          <p class="text-xs text-slate-500 font-bold truncate">{{ user.email }}</p>
        </div>
        
        <!-- Footer Stats -->
        <div class="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
          <div class="space-y-1">
            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Department</p>
            <p class="text-[10px] font-black text-indigo-600 uppercase tracking-tight">{{ user.jobTitle || 'Staff' }}</p>
          </div>
          
          <div class="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[9px] font-black text-green-700 uppercase">Active</span>
          </div>
        </div>

        <!-- Decorative background glow on hover -->
        <div class="absolute -bottom-12 -right-12 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="showCreateModal = false"></div>
        <div class="bg-white rounded-[3.5rem] p-12 max-w-xl w-full shadow-2xl relative z-10 animate-in zoom-in duration-300">
           <div class="flex justify-between items-start mb-10">
             <div class="space-y-1">
               <h2 class="text-3xl font-black text-slate-900 tracking-tight">Provision Access</h2>
               <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Add a new member to your workspace</p>
             </div>
             <button @click="showCreateModal = false" class="p-2 hover:bg-slate-50 rounded-xl transition-colors">
               <XIcon class="w-6 h-6 text-slate-400" />
             </button>
           </div>
           <AdminUserCreate @success="handleUserCreated" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/utils/api'
import AdminUserCreate from '@/components/AdminUserCreate.vue'
import { 
  PlusIcon, SearchIcon, UsersIcon, 
  MoreHorizontalIcon, XIcon, ShieldCheckIcon 
} from 'lucide-vue-next'

const users = ref([])
const loading = ref(true)
const showCreateModal = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')

// Compute Metrics
const activeCount = computed(() => users.value.filter(u => u.Is_Active !== 0).length)

// Advanced Filtering Logic
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const name = `${user.firstName} ${user.surName}`.toLowerCase()
    const email = user.email.toLowerCase()
    const query = searchQuery.value.toLowerCase()
    
    const matchesSearch = name.includes(query) || email.includes(query) || (user.employeeId && user.employeeId.toLowerCase().includes(query))
    const matchesStatus = filterStatus.value === 'all' ? true : (filterStatus.value === 'active' ? user.Is_Active !== 0 : user.Is_Active === 0)
    
    return matchesSearch && matchesStatus
  })
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/org/users')
    users.value = res.data || []
  } catch (err) {
    console.error("Directory sync failed", err)
  } finally {
    loading.value = false
  }
}

const handleUserCreated = () => {
  showCreateModal.value = false
  fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
/* Modal Transition Animation */
.modal-enter-active, .modal-leave-active { transition: opacity 0.4s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>