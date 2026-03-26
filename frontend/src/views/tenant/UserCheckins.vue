<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">My Check-ins</h1>
        <p class="text-xl text-gray-600">Your attendance history</p>
      </div>
      <div class="flex space-x-3">
        <button 
          @click="exportCheckins" 
          class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-all"
        >
          📥 Export CSV
        </button>
        <button 
          @click="refreshCheckins" 
          class="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-all"
        >
          🔄 Refresh
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 text-center">
        <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalCheckins }}</div>
        <div class="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total</div>
      </div>
      <div class="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 text-center">
        <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.checkedInToday }}</div>
        <div class="text-sm font-semibold text-green-800 uppercase tracking-wide">Today</div>
      </div>
      <div class="p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-2 border-purple-200 text-center">
        <div class="text-3xl font-bold text-purple-600 mb-2">{{ stats.lateCount }}</div>
        <div class="text-sm font-semibold text-purple-800 uppercase tracking-wide">Late</div>
      </div>
      <div class="p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl border-2 border-orange-200 text-center">
        <div class="text-3xl font-bold text-orange-600 mb-2">{{ stats.avgHours }}</div>
        <div class="text-sm font-semibold text-orange-800 uppercase tracking-wide">Avg Hours</div>
      </div>
    </div>

    <!-- Filter & Search -->
    <div class="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
      <div class="flex flex-col sm:flex-row gap-4 items-center flex-1">
        <div class="flex items-center space-x-2">
          <label class="font-semibold text-gray-700">Show:</label>
          <select v-model="filter.type" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500">
            <option value="">All</option>
            <option value="IN">Check In</option>
            <option value="OUT">Check Out</option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <label class="font-semibold text-gray-700">Department:</label>
          <select v-model="filter.department" class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500">
            <option value="">All Departments</option>
            <option v-for="dept in departments" :key="dept.Dep_ID" :value="dept.Depart_Name">
              {{ dept.Depart_Name }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <input 
          v-model="searchQuery" 
          placeholder="Search by date or notes..." 
          class="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 flex-1 max-w-md"
        />
      </div>
    </div>

    <!-- Check-ins Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Time</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Department</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Duration</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="checkin in filteredCheckins" :key="checkin.Attend_ID" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">{{ formatDate(checkin.Check_in_time) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-bold',
                  checkin.Check_Type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ checkin.Check_Type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatTime(checkin.Check_in_time) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {{ checkin.Depart_Name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {{ checkin.duration || '--' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                {{ checkin.Notes || '---' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredCheckins.length === 0" class="text-center py-20 bg-gray-50">
        <div class="text-6xl mb-6">📭</div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">No check-ins found</h3>
        <p class="text-gray-600 mb-6">Try adjusting your filters or check in today!</p>
        <router-link to="/acmecorp/checkin" class="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl">
          📍 Check In Now
        </router-link>
      </div>

      <!-- Pagination -->
      <div v-if="checkins.length > 10" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between text-sm text-gray-700">
          <div>Showing {{ filteredCheckins.length }} of {{ checkins.length }} check-ins</div>
          <div class="flex space-x-2">
            <button @click="currentPage--" :disabled="currentPage <= 1" 
              class="px-3 py-2 border rounded-xl disabled:opacity-50">Previous</button>
            <span class="px-3 py-2 font-semibold">{{ currentPage }}</span>
            <button @click="currentPage++" :disabled="filteredCheckins.length <= currentPage * 10" 
              class="px-3 py-2 border rounded-xl disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()

// Data
const checkins = ref([])
const departments = ref([])
const stats = ref({
  totalCheckins: 0,
  checkedInToday: 0,
  lateCount: 0,
  avgHours: '0h'
})

// Filters
const searchQuery = ref('')
const filter = ref({ type: '', department: '' })
const currentPage = ref(1)

// Computed
const filteredCheckins = computed(() => {
  let filtered = checkins.value
  
  // Type filter
  if (filter.value.type) {
    filtered = filtered.filter(c => c.Check_Type === filter.value.type)
  }
  
  // Department filter
  if (filter.value.department) {
    filtered = filtered.filter(c => c.Depart_Name === filter.value.department)
  }
  
  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(c => 
      c.Notes?.toLowerCase().includes(query) ||
      formatDate(c.Check_in_time).toLowerCase().includes(query)
    )
  }
  
  return filtered.slice((currentPage.value - 1) * 10, currentPage.value * 10)
})

// Methods
const loadCheckins = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/org/checkins/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      checkins.value = data.map(checkin => ({
        ...checkin,
        duration: checkin.Check_out_time ? 
          Math.round((new Date(checkin.Check_out_time) - new Date(checkin.Check_in_time)) / (1000 * 60 * 60), 1) + 'h' : null
      }))
      
      updateStats()
    }
  } catch (error) {
    console.error('Failed to load check-ins:', error)
  }
}

const loadDepartments = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/org/departments/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.ok) {
      departments.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load departments:', error)
  }
}

const updateStats = () => {
  const today = new Date().toISOString().split('T')[0]
  stats.value = {
    totalCheckins: checkins.value.length,
    checkedInToday: checkins.value.filter(c => formatDate(c.Check_in_time) === today).length,
    lateCount: checkins.value.filter(c => c.Is_Late === 1).length,
    avgHours: checkins.value.length ? 
      Math.round(checkins.value.reduce((sum, c) => sum + (c.duration?.split('h')[0] || 0), 0) / checkins.value.length * 10) / 10 + 'h' : '0h'
  }
}

const refreshCheckins = () => {
  currentPage.value = 1
  loadCheckins()
}

const exportCheckins = () => {
  const csv = [
    ['Date', 'Type', 'Time', 'Department', 'Duration', 'Notes'],
    ...filteredCheckins.value.map(c => [
      formatDate(c.Check_in_time),
      c.Check_Type,
      formatTime(c.Check_in_time),
      c.Depart_Name,
      c.duration || '',
      c.Notes || ''
    ])
  ].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `checkins-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { 
  year: 'numeric', month: 'short', day: 'numeric' 
})
const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { 
  hour: '2-digit', minute: '2-digit' 
})

// Lifecycle
onMounted(async () => {
  await Promise.all([loadCheckins(), loadDepartments()])
})
</script>
