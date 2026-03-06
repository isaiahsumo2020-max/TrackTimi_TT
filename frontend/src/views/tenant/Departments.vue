<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-black">Departments</h1>
        <p class="text-gray-600 mt-2">{{ departments.length }} departments total</p>
      </div>
      <button @click="showAddDeptModal = true" class="btn-orange">
        + New Department
      </button>
    </div>

    <!-- Departments Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="dept in departments"
        :key="dept.id"
        class="card group cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all border-2"
      >
        <div class="flex items-start justify-between mb-6">
          <div>
            <h3 class="text-2xl font-bold text-black mb-2">{{ dept.name }}</h3>
            <div class="text-4xl font-bold text-orange-500 mb-1">{{ dept.userCount }}</div>
            <p class="text-sm text-gray-600 font-semibold">members</p>
          </div>
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
            <button class="p-3 bg-orange-50 hover:bg-orange-100 rounded-2xl border border-orange-200 hover:border-orange-300">
              <span class="text-xl">✏️</span>
            </button>
            <button class="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-200 hover:border-gray-300">
              <span class="text-xl">🗑️</span>
            </button>
          </div>
        </div>
        
        <!-- Member avatars -->
        <div class="flex -space-x-3 mb-6">
          <div
            v-for="member in 4"
            :key="member"
            class="w-12 h-12 bg-orange-500 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-sm"
          >
            {{ member }}
          </div>
          <div v-if="dept.userCount > 4" class="w-12 h-12 bg-gray-200 rounded-full border-4 border-white shadow-md flex items-center justify-center text-gray-500 font-bold text-sm">
            +{{ dept.userCount - 4 }}
          </div>
        </div>

        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <span class="text-sm text-gray-600">Last active: {{ dept.lastActive }}</span>
          <span class="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
            {{ dept.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Add Department Modal -->
    <div v-if="showAddDeptModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="showAddDeptModal = false">
      <div class="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-200">
        <h2 class="text-3xl font-bold text-black mb-6">New Department</h2>
        <form @submit.prevent="addDepartment" class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-3">Department Name</label>
            <input
              v-model="newDept.name"
              required
              class="w-full px-4 py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold"
              placeholder="Engineering"
            />
          </div>
          
          <div class="flex gap-4">
            <button type="button" @click="showAddDeptModal = false" class="flex-1 btn-black-light py-4 text-sm">
              Cancel
            </button>
            <button type="submit" :disabled="!newDept.name" class="flex-1 btn-orange py-4 text-sm">
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const departments = ref([
  { id: 1, name: 'Engineering', userCount: 12, lastActive: '2 hours ago', status: 'Active' },
  { id: 2, name: 'HR', userCount: 5, lastActive: '1 day ago', status: 'Active' },
  { id: 3, name: 'Sales', userCount: 8, lastActive: '5 hours ago', status: 'Active' }
])

const showAddDeptModal = ref(false)
const newDept = ref({ name: '' })

const addDepartment = () => {
  departments.value.push({
    id: Date.now(),
    name: newDept.value.name,
    userCount: 0,
    lastActive: 'Just now',
    status: 'Active'
  })
  newDept.value.name = ''
  showAddDeptModal.value = false
}
</script>
