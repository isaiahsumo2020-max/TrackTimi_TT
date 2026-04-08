<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
    <!-- Real-time Notifications -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-black text-slate-900">Break Management</h1>
          <p class="text-slate-600 mt-2">Monitor and manage employee break activities across the organization</p>
        </div>
        <div class="text-right">
          <p class="text-3xl font-black text-primary-600">{{ totalBreaksToday }}</p>
          <p class="text-xs text-slate-500 uppercase font-bold">Breaks Today</p>
        </div>
      </div>

      <!-- Filters & Controls -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Date Filter -->
          <div>
            <label class="block text-xs font-black text-slate-600 uppercase mb-2">Filter by Date</label>
            <input
              v-model="selectedDate"
              type="date"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg font-bold text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Employee Filter -->
          <div>
            <label class="block text-xs font-black text-slate-600 uppercase mb-2">Filter by Employee</label>
            <input
              v-model="searchEmployee"
              type="text"
              placeholder="Search by name..."
              class="w-full px-4 py-3 border border-slate-300 rounded-lg font-bold text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Break Type Filter -->
          <div>
            <label class="block text-xs font-black text-slate-600 uppercase mb-2">Break Type</label>
            <select
              v-model="selectedBreakType"
              class="w-full px-4 py-3 border border-slate-300 rounded-lg font-bold text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="lunch">Lunch</option>
              <option value="regular">Regular</option>
              <option value="bathroom">Restroom</option>
            </select>
          </div>
        </div>

        <!-- Apply Filters Button -->
        <div class="flex gap-3 mt-4">
          <button
            @click="applyFilters"
            :disabled="loading"
            class="px-6 py-3 bg-primary-600 text-white font-bold rounded-lg uppercase hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {{ loading ? 'Loading...' : 'Apply Filters' }}
          </button>
          <button
            @click="clearFilters"
            class="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg uppercase hover:bg-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-600 uppercase">Total Breaks</h3>
            <Coffee class="w-6 h-6 text-slate-600" />
          </div>
          <p class="text-3xl font-black text-slate-900">{{ stats.totalBreaks }}</p>
          <p class="text-xs text-slate-500">All employees today</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-600 uppercase">Total Break Time</h3>
            <Clock class="w-6 h-6 text-slate-600" />
          </div>
          <p class="text-3xl font-black text-slate-900">
            {{ Math.floor(stats.totalBreakMinutes / 60) }}h {{ stats.totalBreakMinutes % 60 }}m
          </p>
          <p class="text-xs text-slate-500">Combined duration</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-600 uppercase">Employees w/ Breaks</h3>
            <Users class="w-6 h-6 text-slate-600" />
          </div>
          <p class="text-3xl font-black text-slate-900">{{ stats.employeesWithBreaks }}</p>
          <p class="text-xs text-slate-500">Took at least 1 break</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-black text-slate-600 uppercase">Avg Break Length</h3>
            <BarChart3 class="w-6 h-6 text-slate-600" />
          </div>
          <p class="text-3xl font-black text-slate-900">{{ stats.averageBreakLength }}m</p>
          <p class="text-xs text-slate-500">Per break average</p>
        </div>
      </div>

      <!-- Break Activities Table -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 class="text-lg font-black text-slate-900">Employee Break Activities</h2>
          <span class="text-xs font-bold text-slate-500">{{ filteredActivities.length }} records</span>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-12 text-center">
          <p class="text-slate-600">Loading break activities...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredActivities.length === 0" class="p-12 text-center">
          <p class="text-4xl mb-3">🔍</p>
          <p class="text-slate-600">No break activities found for the selected filters.</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-4 text-left font-black text-slate-600 uppercase text-xs">Employee</th>
                <th class="px-6 py-4 text-left font-black text-slate-600 uppercase text-xs">Date</th>
                <th class="px-6 py-4 text-left font-black text-slate-600 uppercase text-xs">Breaks</th>
                <th class="px-6 py-4 text-left font-black text-slate-600 uppercase text-xs">Total Time</th>
                <th class="px-6 py-4 text-left font-black text-slate-600 uppercase text-xs">Break Types</th>
                <th class="px-6 py-4 text-left font-black text-slate-600 uppercase text-xs">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="activity in filteredActivities" :key="activity.Activity_ID" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900">{{ activity.userName || `${activity.First_Name} ${activity.SurName}` }}</div>
                  <div class="text-xs text-slate-500">{{ activity.userEmail || activity.Email }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-bold text-slate-900">{{ formatDate(activity.Activity_Date) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-bold text-sm">
                    {{ activity.Total_Breaks }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-bold text-slate-900">{{ activity.Total_Break_Minutes }}m</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <span v-if="getBreakTypeCount(activity, 'lunch') > 0" class="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded flex items-center gap-1">
                      <UtensilsCrossed class="w-3 h-3" /> {{ getBreakTypeCount(activity, 'lunch') }}
                    </span>
                    <span v-if="getBreakTypeCount(activity, 'regular') > 0" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded flex items-center gap-1">
                      <Coffee class="w-3 h-3" /> {{ getBreakTypeCount(activity, 'regular') }}
                    </span>
                    <span v-if="getBreakTypeCount(activity, 'bathroom') > 0" class="px-2 py-1 bg-accent-100 text-accent-700 text-xs font-bold rounded">
                      🚻 {{ getBreakTypeCount(activity, 'bathroom') }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <button
                    @click="selectedActivity = activity; showDetailModal = true"
                    class="text-primary-600 hover:text-primary-700 font-bold text-xs uppercase"
                  >
                    View →
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal -->
      <div v-if="showDetailModal && selectedActivity" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-center">
            <h2 class="text-2xl font-black text-slate-900">Break Details</h2>
            <button @click="showDetailModal = false" class="text-slate-500 hover:text-slate-700"><XIcon class="w-5 h-5" /></button>
          </div>

          <!-- Modal Content -->
          <div class="p-6 space-y-6">
            <!-- Employee Info -->
            <div class="bg-slate-50 rounded-lg p-4">
              <h3 class="text-sm font-black text-slate-600 uppercase mb-3">Employee Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-500 uppercase font-bold mb-1">Name</p>
                  <p class="text-lg font-black text-slate-900">{{ selectedActivity.userName || `${selectedActivity.First_Name} ${selectedActivity.SurName}` }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase font-bold mb-1">Email</p>
                  <p class="text-lg font-black text-slate-900">{{ selectedActivity.userEmail || selectedActivity.Email }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase font-bold mb-1">Date</p>
                  <p class="text-lg font-black text-slate-900">{{ formatDate(selectedActivity.Activity_Date) }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-500 uppercase font-bold mb-1">Total Breaks</p>
                  <p class="text-lg font-black text-slate-900">{{ selectedActivity.Total_Breaks }}</p>
                </div>
              </div>
            </div>

            <!-- Break Summary -->
            <div class="bg-blue-50 border border-primary-200 rounded-lg p-4">
              <h3 class="text-sm font-black text-blue-900 uppercase mb-3">Break Summary</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <p class="text-2xl font-black text-primary-600">{{ selectedActivity.Total_Breaks }}</p>
                  <p class="text-xs text-blue-700 font-bold">Total Breaks</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-black text-primary-600">{{ selectedActivity.Total_Break_Minutes }}m</p>
                  <p class="text-xs text-blue-700 font-bold">Total Duration</p>
                </div>
                <div class="text-center">
                  <p class="text-2xl font-black text-primary-600">{{ (selectedActivity.Total_Break_Minutes / selectedActivity.Total_Breaks).toFixed(0) }}m</p>
                  <p class="text-xs text-blue-700 font-bold">Average</p>
                </div>
              </div>
            </div>

            <!-- Detailed Breaks List -->
            <div>
              <h3 class="text-sm font-black text-slate-600 uppercase mb-3">Individual Breaks</h3>
              <div v-if="selectedActivity.Breaks_Summary && Array.isArray(getBreaksSummary(selectedActivity))" class="space-y-3">
                <div v-for="(breakItem, idx) in getBreaksSummary(selectedActivity)" :key="idx" class="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                      <component :is="breakItem.type === 'lunch' ? UtensilsCrossed : breakItem.type === 'regular' ? Coffee : Clock" class="w-5 h-5 text-slate-600" />
                      <div>
                        <p class="font-bold text-slate-900 capitalize">{{ breakItem.type }} Break</p>
                        <p class="text-xs text-slate-500">Break #{{ idx + 1 }}</p>
                      </div>
                    </div>
                    <span class="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-bold rounded-full">
                      {{ breakItem.duration || 0 }}m
                    </span>
                  </div>
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-xs text-slate-500 font-bold uppercase">Start Time</p>
                      <p class="font-bold text-slate-900">{{ formatBreakTime(breakItem.startTime) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-slate-500 font-bold uppercase">Duration</p>
                      <p class="font-bold text-slate-900">{{ breakItem.duration || 0 }} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-slate-500">
                No detailed break information available
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-4 flex justify-end gap-3">
            <button
              @click="showDetailModal = false"
              class="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg uppercase hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Clock, BarChart3, Users, UtensilsCrossed, Coffee, XIcon } from 'lucide-vue-next'
import api from '@/utils/api'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'
import { showError } from '@/utils/dialog'

// State
const loading = ref(false)
const activities = ref([])
const notifications = ref([])
const showDetailModal = ref(false)
const selectedActivity = ref(null)

// Filters
const selectedDate = ref(new Date().toISOString().split('T')[0])
const searchEmployee = ref('')
const selectedBreakType = ref('')

// Statistics
const stats = computed(() => {
  const filtered = filteredActivities.value
  if (filtered.length === 0) {
    return {
      totalBreaks: 0,
      totalBreakMinutes: 0,
      employeesWithBreaks: 0,
      averageBreakLength: 0
    }
  }

  const totalBreaks = filtered.reduce((sum, a) => sum + (a.Total_Breaks || 0), 0)
  const totalMinutes = filtered.reduce((sum, a) => sum + (a.Total_Break_Minutes || 0), 0)
  const employees = new Set(filtered.map(a => a.User_ID)).size
  const avgLength = totalBreaks > 0 ? Math.round(totalMinutes / totalBreaks) : 0

  return {
    totalBreaks,
    totalBreakMinutes: totalMinutes,
    employeesWithBreaks: employees,
    averageBreakLength: avgLength
  }
})

// Total breaks today (unfiltered)
const totalBreaksToday = computed(() => {
  return activities.value.reduce((sum, a) => sum + (a.Total_Breaks || 0), 0)
})

// Filtered activities
const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    // Employee name filter
    if (searchEmployee.value && !activity.userName.toLowerCase().includes(searchEmployee.value.toLowerCase())) {
      return false
    }

    // Break type filter
    if (selectedBreakType.value) {
      const summary = getBreaksSummary(activity)
      if (!summary.some(b => b.type === selectedBreakType.value)) {
        return false
      }
    }

    return true
  })
})

const displayNotifications = computed(() => {
  return notifications.value.filter(n => !n.Is_Read).sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at))
})

// Load activities
const loadActivities = async () => {
  try {
    loading.value = true
    const response = await api.get('/org/activities', {
      params: {
        startDate: selectedDate.value,
        endDate: selectedDate.value
      }
    })
    activities.value = response.data || []
  } catch (err) {
    console.error('Failed to load activities:', err)
    showError('Failed to load break activities', 'Error')
  } finally {
    loading.value = false
  }
}

// Apply filters
const applyFilters = () => {
  loadActivities()
}

// Clear filters
const clearFilters = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
  searchEmployee.value = ''
  selectedBreakType.value = ''
  loadActivities()
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

const formatBreakTime = (timeString) => {
  if (!timeString) return 'N/A'
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return timeString
  }
}

const getBreaksSummary = (activity) => {
  if (!activity.Breaks_Summary) return []
  try {
    if (typeof activity.Breaks_Summary === 'string') {
      return JSON.parse(activity.Breaks_Summary)
    }
    return activity.Breaks_Summary
  } catch {
    return []
  }
}

const getBreakTypeCount = (activity, type) => {
  const summary = getBreaksSummary(activity)
  return summary.filter(b => b.type === type).length
}

const dismissNotification = (notificationId) => {
  notifications.value = notifications.value.map(n => 
    n.Notify_ID === notificationId ? {...n, Is_Read: 1} : n
  )
}

// Lifecycle
onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
</style>

