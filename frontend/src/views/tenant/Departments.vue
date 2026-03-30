<template>
  <div class="space-y-8 max-w-7xl mx-auto p-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black text-slate-900">Organizational Structure</h1>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage Departments & Personnel</p>
      </div>
      <button @click="showAddDeptModal = true" class="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-100">
        + New Department
      </button>
    </div>

    <!-- Department Cards -->
    <div class="grid grid-cols-1 gap-8">
      <div v-for="dept in departments" :key="dept.id" class="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        
        <!-- Header: Dept Name and Count -->
        <div class="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 class="text-xl font-black text-slate-900">{{ dept.name }}</h3>
            <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">Department</p>
          </div>
          <div class="text-right">
            <span class="text-3xl font-black text-slate-900">{{ dept.users.length }}</span>
            <p class="text-[10px] font-bold text-slate-400 uppercase">Members</p>
          </div>
        </div>

        <!-- Detail: Personnel List -->
        <div class="p-8">
          <div v-if="dept.users.length > 0" class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th class="pb-4 px-2">Name</th>
                  <th class="pb-4 px-2">Email</th>
                  <th class="pb-4 px-2">Job Title</th>
                  <th class="pb-4 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="user in dept.users" :key="user.id" class="group hover:bg-slate-50 transition-colors">
                  <td class="py-4 px-2">
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-[10px]">
                        {{ user.name[0] }}
                      </div>
                      <span class="text-sm font-bold text-slate-700">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="py-4 px-2 text-xs font-medium text-slate-500">{{ user.email }}</td>
                  <td class="py-4 px-2 text-[10px] font-black text-indigo-500 uppercase">{{ user.job || 'Staff' }}</td>
                  <td class="py-4 px-2 text-right">
                    <button class="text-slate-300 hover:text-indigo-600 transition-colors">
                      <SettingsIcon class="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-center py-10">
             <p class="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">No personnel assigned to this department</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal (Keep the same as before) -->
    <div v-if="showAddDeptModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl">
        <h2 class="text-2xl font-black text-slate-900 mb-6">Create Department</h2>
        <input v-model="newDeptName" class="w-full p-5 bg-slate-50 rounded-2xl mb-6 border-none" placeholder="e.g. Sales" />
        <div class="flex gap-4">
          <button @click="showAddDeptModal = false" class="flex-1 py-4 font-bold text-slate-400">Cancel</button>
          <button @click="addDepartment" class="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/utils/api'
import { SettingsIcon } from 'lucide-vue-next'

const departments = ref([])
const showAddDeptModal = ref(false)
const newDeptName = ref('')

const fetchDepts = async () => {
  const res = await api.get('/org/departments')
  departments.value = res.data
}

const addDepartment = async () => {
  if (!newDeptName.value) return
  await api.post('/org/departments', { name: newDeptName.value })
  newDeptName.value = ''
  showAddDeptModal.value = false
  fetchDepts()
}

onMounted(fetchDepts)
</script>