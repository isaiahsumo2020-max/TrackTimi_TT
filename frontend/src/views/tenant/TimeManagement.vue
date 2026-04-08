<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
    <!-- Real-time Notifications -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-black text-slate-900">Time Management</h1>
        <p class="text-slate-600 mt-2">View your break history, activities, and time tracking details</p>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-sm border border-slate-200 mb-6">
        <div class="flex gap-0">
          <button
            @click="activeTab = 'overview'"
            :class="{
              'bg-primary-50 text-primary-700 border-b-2 border-primary-600': activeTab === 'overview',
              'text-slate-600 hover:bg-slate-50': activeTab !== 'overview'
            }"
            class="flex-1 px-6 py-4 font-bold text-center transition-colors uppercase text-sm flex items-center justify-center gap-2"
          >
            <TrendingUp class="w-4 h-4" /> Overview
          </button>
          <button
            @click="activeTab = 'breaks'"
            :class="{
              'bg-primary-50 text-primary-700 border-b-2 border-primary-600': activeTab === 'breaks',
              'text-slate-600 hover:bg-slate-50': activeTab !== 'breaks'
            }"
            class="flex-1 px-6 py-4 font-bold text-center transition-colors uppercase text-sm flex items-center justify-center gap-2"
          >
            <Coffee class="w-4 h-4" /> Break History
          </button>
          <button
            @click="activeTab = 'analytics'"
            :class="{
              'bg-primary-50 text-primary-700 border-b-2 border-primary-600': activeTab === 'analytics',
              'text-slate-600 hover:bg-slate-50': activeTab !== 'analytics'
            }"
            class="flex-1 px-6 py-4 font-bold text-center transition-colors uppercase text-sm flex items-center justify-center gap-2"
          >
            <TrendingUp class="w-4 h-4" /> Analytics
          </button>
        </div>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Today's Breaks Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-600 uppercase">Today's Breaks</h3>
              <Coffee class="w-6 h-6 text-slate-600" />
            </div>
            <div class="space-y-1">
              <p class="text-3xl font-black text-slate-900">
                {{ todayActivity?.Total_Breaks || 0 }}
                <span class="text-lg text-slate-500">/{{ maxBreaksPerShift }}</span>
              </p>
              <p class="text-xs text-slate-500">Allowance: {{ maxBreaksPerShift }} breaks per shift</p>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary-600 transition-all" 
                :style="{ width: `${(todayActivity?.Total_Breaks || 0) / maxBreaksPerShift * 100}%` }"
              ></div>
            </div>
            <p class="text-xs text-primary-600 font-bold">
              {{ maxBreaksPerShift - (todayActivity?.Total_Breaks || 0) }} breaks remaining
            </p>
          </div>

          <!-- Total Break Time Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-600 uppercase">Total Break Time</h3>
              <Hourglass class="w-6 h-6 text-slate-600" />
            </div>
            <div class="space-y-1">
              <p class="text-3xl font-black text-slate-900">
                {{ todayActivity?.Total_Break_Minutes || 0 }}
                <span class="text-lg text-slate-500">min</span>
              </p>
              <p class="text-xs text-slate-500">Cumulative duration today</p>
            </div>
            <div class="bg-blue-50 rounded px-3 py-2">
              <p class="text-xs text-blue-700">
                <span class="font-bold">{{ formatMinutesToTime(todayActivity?.Total_Break_Minutes || 0) }}</span> of break time taken
              </p>
            </div>
          </div>

          <!-- Average Break Length Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-600 uppercase">Avg Break Length</h3>
              <ClockIcon class="w-6 h-6 text-slate-600" />
            </div>
            <div class="space-y-1">
              <p class="text-3xl font-black text-slate-900">
                {{ averageBreakLength }}
                <span class="text-lg text-slate-500">min</span>
              </p>
              <p class="text-xs text-slate-500">Average per break</p>
            </div>
            <div class="bg-green-50 rounded px-3 py-2">
              <p class="text-xs text-green-700">
                Good break discipline maintained
              </p>
            </div>
          </div>

          <!-- Break Types Card -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-black text-slate-600 uppercase">Break By Type</h3>
              <Target class="w-6 h-6 text-slate-600" />
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-slate-600 flex items-center gap-2"><UtensilsCrossed class="w-4 h-4" /> Lunch</span>
                <span class="font-bold text-slate-900">{{ lunchBreaks }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600 flex items-center gap-2"><Coffee class="w-4 h-4" /> Regular</span>
                <span class="font-bold text-slate-900">{{ regularBreaks }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-600 flex items-center gap-2"><ClockIcon class="w-4 h-4" /> Restroom</span>
                <span class="font-bold text-slate-900">{{ restroomBreaks }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Banner -->
        <div 
          v-if="todayActivity"
          class="rounded-lg border-2 p-6 flex items-start gap-4"
          :class="{
            'bg-green-50 border-green-200': (todayActivity?.Total_Breaks || 0) <= maxBreaksPerShift,
            'bg-orange-50 border-orange-200': (todayActivity?.Total_Breaks || 0) > maxBreaksPerShift
          }"
        >
          <CheckCircleIcon v-if="(todayActivity?.Total_Breaks || 0) <= maxBreaksPerShift" class="w-8 h-8 text-green-600" />
          <AlertTriangleIcon v-else class="w-8 h-8 text-orange-600" />
          <div>
            <h3 class="font-black text-slate-900 mb-1" 
              :class="{
                'text-green-900': (todayActivity?.Total_Breaks || 0) <= maxBreaksPerShift,
                'text-orange-900': (todayActivity?.Total_Breaks || 0) > maxBreaksPerShift
              }">
              {{ (todayActivity?.Total_Breaks || 0) > maxBreaksPerShift ? 'Break Limit Reached' : 'Within Break Limit' }}
            </h3>
            <p 
              class="text-sm"
              :class="{
                'text-green-700': (todayActivity?.Total_Breaks || 0) <= maxBreaksPerShift,
                'text-orange-700': (todayActivity?.Total_Breaks || 0) > maxBreaksPerShift
              }">
              You have taken {{ todayActivity?.Total_Breaks || 0 }} of {{ maxBreaksPerShift }} allowed breaks today.
              {{ (todayActivity?.Total_Breaks || 0) <= maxBreaksPerShift 
                ? `You have ${maxBreaksPerShift - (todayActivity?.Total_Breaks || 0)} break(s) remaining.`
                : `You have exceeded the break limit by ${(todayActivity?.Total_Breaks || 0) - maxBreaksPerShift} break(s).`
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Break History Tab -->
      <div v-if="activeTab === 'breaks'" class="space-y-6">
        <div v-if="loading" class="text-center py-12">
          <p class="text-slate-600">Loading break history...</p>
        </div>

        <div v-else-if="!todayActivity || !todayActivity.Breaks_Summary || todayActivity.Breaks_Summary.length === 0" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
          <Coffee class="w-16 h-16 text-slate-400 mx-auto mb-3" />
          <p class="text-slate-600">No breaks recorded today yet.</p>
          <p class="text-sm text-slate-500">Start a break when you take one and clock out when you resume work.</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Break Cards -->
          <div 
            v-for="(breakItem, index) in todayActivity.Breaks_Summary"
            :key="index"
            class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <component :is="breakItem.type === 'lunch' ? UtensilsCrossed : breakItem.type === 'regular' ? Coffee : ClockIcon" class="w-8 h-8 text-slate-600" />
                <div>
                  <h3 class="font-black text-slate-900 capitalize">{{ breakItem.type }} Break</h3>
                  <p class="text-xs text-slate-500">Break #{{ index + 1 }} of {{ todayActivity.Breaks_Summary.length }}</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-bold rounded-full">
                {{ breakItem.duration || 'N/A' }} min
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p class="text-xs font-black text-slate-500 uppercase mb-1">Start Time</p>
                <p class="text-sm font-bold text-slate-900">
                  {{ formatBreakTime(breakItem.startTime) }}
                </p>
              </div>
              <div>
                <p class="text-xs font-black text-slate-500 uppercase mb-1">Duration</p>
                <p class="text-sm font-bold text-slate-900">
                  {{ breakItem.duration || 'Ongoing' }} minutes
                </p>
              </div>
              <div>
                <p class="text-xs font-black text-slate-500 uppercase mb-1">Status</p>
                <p class="text-sm font-bold text-green-600 flex items-center gap-1">
                  <CheckCircleIcon class="w-4 h-4" /> Recorded
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div v-if="activeTab === 'analytics'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Break Distribution Chart -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="font-black text-slate-900 mb-6 text-lg">Break Distribution</h3>
            
            <div v-if="todayActivity?.Breaks_Summary?.length > 0" class="space-y-4">
              <div v-for="(breakItem, idx) in todayActivity.Breaks_Summary" :key="idx" class="space-y-2">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-bold text-slate-700 capitalize">
                    {{ breakItem.type }} - {{ breakItem.duration }}min
                  </span>
                  <span class="text-xs font-bold text-slate-500">
                    {{ ((breakItem.duration || 0) / (todayActivity.Total_Break_Minutes || 1) * 100).toFixed(0) }}%
                  </span>
                </div>
                <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    class="h-full transition-all"
                    :class="breakItem.type === 'lunch' ? 'bg-orange-500' : breakItem.type === 'regular' ? 'bg-blue-500' : 'bg-accent-500'"
                    :style="{ width: `${(breakItem.duration || 0) / (todayActivity.Total_Break_Minutes || 1) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-slate-500">
              <p>No breaks recorded yet</p>
            </div>
          </div>

          <!-- Time Distribution -->
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 class="font-black text-slate-900 mb-6 text-lg">Time Summary</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span class="text-sm font-semibold text-slate-700">Total Break Time</span>
                <span class="text-xl font-black text-primary-600">
                  {{ formatMinutesToTime(todayActivity?.Total_Break_Minutes || 0) }}
                </span>
              </div>
              <div class="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <span class="text-sm font-semibold text-slate-700">Average Per Break</span>
                <span class="text-xl font-black text-primary-600">
                  {{ averageBreakLength }} min
                </span>
              </div>
              <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-primary-200">
                <span class="text-sm font-semibold text-blue-900">Breaks Remaining</span>
                <span class="text-xl font-black text-primary-600">
                  {{ Math.max(0, maxBreaksPerShift - (todayActivity?.Total_Breaks || 0)) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Guidelines -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 class="font-black text-green-900 mb-4 flex items-center gap-2"><CheckCircleIcon class="w-5 h-5" /> Good Practices</h4>
            <ul class="text-sm text-green-800 space-y-2">
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Take breaks within the approved limit ({{ maxBreaksPerShift }} per shift)</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Keep breaks within reasonable duration (15-45 minutes total)</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Clock in and out for each break to maintain accurate records</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Specify break type for better tracking and reporting</span>
              </li>
            </ul>
          </div>

          <div class="bg-blue-50 border border-primary-200 rounded-lg p-6">
            <h4 class="font-black text-blue-900 mb-4">ℹ️ How Breaks Work</h4>
            <ul class="text-sm text-blue-800 space-y-2">
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Each break records GPS location and timestamps</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Break duration is automatically calculated when you clock out</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>All breaks are tracked for admin analytics and reporting</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="font-bold">•</span>
                <span>Break time is deducted from shift countdown timer</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'
import { Coffee, TrendingUp, Hourglass, Target, UtensilsCrossed, AlertTriangleIcon, CheckCircleIcon, Info as InfoIcon, ClockIcon } from 'lucide-vue-next'

// State
const activeTab = ref('overview')
const loading = ref(false)
const todayActivity = ref(null)
const maxBreaksPerShift = ref(2)
const notifications = ref([])

// Load activities
const loadActivities = async () => {
  try {
    loading.value = true
    
    // Fetch org settings first
    const settingsRes = await api.get('/org/settings')
    maxBreaksPerShift.value = settingsRes.data?.Max_Breaks_Per_Shift || 2
    
    // Then fetch today's activities
    const res = await api.get('/org/activities-today')
    
    if (res.data) {
      todayActivity.value = res.data
      
      // Parse Breaks_Summary if it's a string
      if (typeof todayActivity.value.Breaks_Summary === 'string') {
        todayActivity.value.Breaks_Summary = JSON.parse(todayActivity.value.Breaks_Summary)
      }
    }
  } catch (err) {
    console.error('Failed to load activities:', err)
    // Initialize empty activity if fetch fails
    todayActivity.value = {
      Total_Breaks: 0,
      Total_Break_Minutes: 0,
      Breaks_Summary: []
    }
  } finally {
    loading.value = false
  }
}

// Computed properties
const lunchBreaks = computed(() => {
  if (!todayActivity.value?.Breaks_Summary) return 0
  return todayActivity.value.Breaks_Summary.filter(b => b.type === 'lunch').length
})

const regularBreaks = computed(() => {
  if (!todayActivity.value?.Breaks_Summary) return 0
  return todayActivity.value.Breaks_Summary.filter(b => b.type === 'regular').length
})

const restroomBreaks = computed(() => {
  if (!todayActivity.value?.Breaks_Summary) return 0
  return todayActivity.value.Breaks_Summary.filter(b => b.type === 'bathroom').length
})

const averageBreakLength = computed(() => {
  if (!todayActivity.value || todayActivity.value.Total_Breaks === 0) return 0
  return Math.round((todayActivity.value.Total_Break_Minutes || 0) / todayActivity.value.Total_Breaks)
})

const displayNotifications = computed(() => {
  return notifications.value.filter(n => !n.Is_Read).sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at))
})

// Helper functions
const formatMinutesToTime = (minutes) => {
  if (!minutes) return '0 min'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
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

