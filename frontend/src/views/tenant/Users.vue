<template>
  <div class="p-8 lg:p-12 max-w-7xl mx-auto min-h-screen bg-[#FDFDFD]">
    
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
      <div class="space-y-2">
        <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em]">Personnel Management</p>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">Workforce Directory</h1>
      </div>
      <button @click="showCreateModal = true" class="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-black transition-all shadow-xl active:scale-95">
        Provision Personnel +
      </button>
    </div>

    <!-- Live Grid -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Empty State -->
      <div v-if="users.length === 0" class="col-span-full py-20 bg-slate-50 border border-slate-100 rounded-[3rem] text-center">
        <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Personnel Records Found</p>
      </div>

      <!-- User Card -->
      <div v-for="user in users" :key="user.User_ID" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 group">
        <div class="flex items-center justify-between mb-8">
          <!-- Replace the old avatar div with this safer version -->
<div class="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
  {{ user?.firstName?.[0] || '?' }}{{ user?.surName?.[0] || '' }}
</div>
          <span class="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded tracking-tighter">{{ user.employeeId }}</span>
        </div>
        
        <h3 class="text-xl font-black text-slate-900 leading-tight">{{ user.firstName }} {{ user.surName }}</h3>
        <p class="text-xs text-slate-500 font-medium mb-6">{{ user.email }}</p>
        
        <div class="pt-6 border-t border-slate-50 flex justify-between items-center">
          <span class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{{ user.jobTitle || 'Staff' }}</span>
          <div class="flex items-center space-x-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span class="text-[9px] font-black text-green-600 uppercase">Verified</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6" @click.self="showCreateModal = false">
      <div class="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl relative">
         <h2 class="text-2xl font-black text-slate-900 mb-8 tracking-tight">Provision Personnel</h2>
         <AdminUserCreate @success="handleUserCreated" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import AdminUserCreate from '@/components/AdminUserCreate.vue'

const users = ref([])
const loading = ref(true)
const showCreateModal = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/org/users')
    users.value = res.data || []
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const handleUserCreated = () => {
  showCreateModal.value = false
  fetchUsers() // 🚀 The Live Re-sync
}

onMounted(fetchUsers)
</script>