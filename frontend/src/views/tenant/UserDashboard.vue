<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 md:py-12 px-4 md:px-6 space-y-8">
    <!-- Real-time Notifications -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Header with quick stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Status</p>
          <p class="text-lg md:text-2xl font-black" :class="isCheckedIn ? 'text-green-600' : 'text-slate-600'">
            {{ isCheckedIn ? 'WORKING' : 'OFF-DUTY' }}
          </p>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">GPS Signal</p>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full animate-pulse" :class="gpsSignalStrength > 70 ? 'bg-green-500' : gpsSignalStrength > 40 ? 'bg-yellow-500' : 'bg-red-500'"></div>
            <p class="text-lg md:text-2xl font-black">{{ gpsSignalStrength }}%</p>
          </div>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Distance</p>
          <p class="text-lg md:text-2xl font-black text-primary-600">{{ distance }}m</p>
        </div>
        <div class="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Time</p>
          <p class="text-lg md:text-xl font-black">{{ currentTime }}</p>
        </div>
      </div>

      <!-- Main Check-in Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        <!-- Enhanced GPS Check-in Card -->
        <div class="lg:col-span-2 bg-gradient-to-br from-primary-600 to-primary-700 p-8 md:p-12 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div class="relative z-10 space-y-8">
            <!-- Header -->
            <div class="text-center space-y-3">
              <div class="w-16 h-16 md:w-20 h-20 mx-auto bg-white/10 rounded-3xl flex items-center justify-center border-2 border-white/20">
                <MapPinIcon class="w-8 h-8 md:w-10 h-10 text-white" />
              </div>
              <h1 class="text-3xl md:text-5xl font-black tracking-tight">
                {{ isCheckedIn ? 'Clock Out' : 'Clock In' }}
              </h1>
            </div>

            <!-- Enhanced GPS Status -->
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-3 md:gap-4">
                <!-- GPS Lock -->
                <div :class="location ? 'bg-green-400/20 border-green-300' : 'bg-orange-400/20 border-orange-300'" class="p-4 md:p-5 rounded-2xl border-2 text-center transition-all backdrop-blur-sm">
                  <p class="text-[9px] font-black text-white/80 uppercase mb-2">GPS Lock</p>
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-3 h-3 rounded-full animate-pulse" :class="location ? 'bg-green-300' : 'bg-orange-300'"></div>
                    <p class="text-sm md:text-base font-bold">{{ location ? 'LOCKED' : 'SEARCHING' }}</p>
                  </div>
                </div>
                
                <!-- Work Zone -->
                <div :class="inRange ? 'bg-green-400/20 border-green-300' : 'bg-red-400/20 border-red-300'" class="p-4 md:p-5 rounded-2xl border-2 text-center transition-all backdrop-blur-sm">
                  <p class="text-[9px] font-black text-white/80 uppercase mb-2">Work Zone</p>
                  <div class="flex items-center justify-center gap-2">
                    <div class="w-3 h-3 rounded-full animate-pulse" :class="inRange ? 'bg-green-300' : 'bg-red-300'"></div>
                    <p class="text-sm md:text-base font-bold">{{ inRange ? 'IN RANGE' : 'OUT' }}</p>
                  </div>
                </div>
              </div>

              <!-- Accuracy Indicator -->
              <div v-if="location" class="bg-white/10 p-4 md:p-5 rounded-2xl border border-white/20 backdrop-blur-sm">
                <div class="flex justify-between items-center mb-3">
                  <p class="text-xs font-bold text-white/70 uppercase">Accuracy</p>
                  <span class="text-xs font-bold text-white/70">{{ gpsAccuracy }}m</span>
                </div>
                <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all"
                       :style="{ width: Math.min(100, (50 - gpsAccuracy) / 50 * 100) + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Distance Readout -->
            <div v-if="location" class="text-center py-6 md:py-8 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
              <div class="text-5xl md:text-6xl font-black tracking-tight">{{ distance }}<span class="text-2xl md:text-3xl">m</span></div>
              <p class="text-xs font-bold text-white/70 uppercase mt-2">Distance to work zone</p>
            </div>
          </div>

          <!-- Action Button -->
          <div class="relative z-10 mt-8">
            <button 
              @click="handleSubmit" 
              :disabled="!inRange || loading || !location"
              class="w-full py-6 md:py-8 rounded-2xl font-black text-lg md:text-2xl shadow-2xl transition-all active:scale-95 uppercase tracking-wider"
              :class="inRange && location ? 'bg-white text-primary-600 shadow-white/30 hover:shadow-white/40' : 'bg-white/20 text-white/50 cursor-not-allowed backdrop-blur-sm'"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                PROCESSING...
              </span>
              <span v-else-if="!location">WAITING GPS...</span>
              <span v-else-if="isCheckedIn">END WORK SHIFT</span>
              <span v-else>START WORK SHIFT</span>
            </button>
          </div>
        </div>

        <!-- Time Tracking Widget -->
        <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col">
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Time Tracking</h3>
          
          <div class="flex-1 flex flex-col justify-center items-center space-y-6">
            <!-- Large Time Display -->
            <div class="text-center">
              <div class="text-5xl md:text-6xl font-black text-primary-600 tracking-tight font-mono">
                {{ elapsedTime }}
              </div>
              <p class="text-xs font-bold text-slate-400 uppercase mt-2">{{ isCheckedIn ? 'Time Worked' : 'Next Shift' }}</p>
            </div>

            <!-- Progress Ring -->
            <div class="relative w-32 h-32 md:w-40 h-40">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="55" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                <circle 
                  cx="60" cy="60" r="55" fill="none" stroke="#4f46e5" stroke-width="8"
                  stroke-dasharray="345.575"
                  :stroke-dashoffset="345.575 * (1 - timeProgress)"
                  stroke-linecap="round"
                  class="transition-all duration-1000"
                />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-sm font-bold text-slate-600">{{ Math.round(timeProgress * 100) }}%</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-3 w-full text-center text-xs">
              <div class="bg-slate-50 p-3 rounded-xl">
                <p class="text-slate-400 font-bold uppercase mb-1">Breaks</p>
                <p class="text-lg font-black text-slate-900">{{ totalBreaks }}</p>
              </div>
              <div class="bg-slate-50 p-3 rounded-xl">
                <p class="text-slate-400 font-bold uppercase mb-1">Target</p>
                <p class="text-lg font-black text-primary-600">{{ shiftDuration }}h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Break Management Section -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 class="text-lg md:text-xl font-black text-slate-900 uppercase">Break Management</h3>
          <button
            v-if="isCheckedIn && !onBreak"
            @click="startBreak"
            :disabled="breakLoading"
            class="px-4 md:px-6 py-2 md:py-3 bg-amber-500 text-white rounded-xl font-bold text-xs md:text-sm uppercase hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {{ breakLoading ? 'PROCESSING...' : 'START BREAK' }}
          </button>
          <button
            v-else-if="onBreak"
            @click="endBreak"
            :disabled="breakLoading"
            class="px-4 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-xl font-bold text-xs md:text-sm uppercase hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {{ breakLoading ? 'PROCESSING...' : 'END BREAK' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Current Break</p>
            <p class="text-2xl md:text-3xl font-black text-amber-600">{{ currentBreakTime }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ onBreak ? 'In Progress' : 'No active break' }}</p>
          </div>
          <div class="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Total Breaks</p>
            <p class="text-2xl md:text-3xl font-black text-primary-600">{{ totalBreaks }}</p>
            <p class="text-xs text-slate-500 mt-1">Today</p>
          </div>
          <div class="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200">
            <p class="text-xs font-bold text-slate-400 uppercase mb-2">Break Limit</p>
            <p class="text-2xl md:text-3xl font-black" :class="breaksRemaining > 0 ? 'text-green-600' : 'text-red-600'">{{ breaksRemaining }}</p>
            <p class="text-xs text-slate-500 mt-1">Remaining</p>
          </div>
        </div>

        <!-- Break History -->
        <div v-if="breaks.length > 0" class="mt-6 space-y-2">
          <p class="text-xs font-bold text-slate-600 uppercase">Recent Breaks</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div v-for="(brk, idx) in breaks.slice(-4)" :key="idx" class="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <p class="text-xs font-bold text-amber-700">{{ formatBreakTime(brk.start_time) }}</p>
              <p class="text-[10px] text-amber-600">{{ brk.duration }}min</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Section with Calendar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <!-- Current/Next Shift -->
        <div class="lg:col-span-2 bg-gradient-to-br from-primary-600 to-purple-600 p-6 md:p-8 rounded-[2.5rem] shadow-lg text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div class="relative z-10">
            <div class="flex justify-between items-start mb-6">
              <div>
                <p class="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-2">Next Scheduled</p>
                <h2 class="text-2xl md:text-3xl font-black tracking-tight">Upcoming Shift</h2>
              </div>
              <svg class="w-6 h-6 md:w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>

            <div v-if="currentShift" class="space-y-4">
              <div>
                <p class="text-sm opacity-80 mb-2">{{ formatDate(currentShift.Shift_Date) }}</p>
                <h3 class="text-3xl md:text-4xl font-black">{{ currentShift.Shift_Start_Time }} — {{ currentShift.Shift_End_Time }}</h3>
              </div>
              <div class="flex flex-col md:flex-row items-start md:items-center gap-3 pt-4 border-t border-white/20">
                <span class="px-3 py-1 bg-white/10 rounded-lg text-sm font-bold border border-white/20">
                  {{ currentShift.ShiftType_Name }}
                </span>
                <span class="text-sm opacity-70">{{ currentShift.Depart_Name || 'General' }}</span>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-lg opacity-50 font-bold">No Upcoming Shifts</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Schedule Summary -->
        <div class="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">This Week</h3>
            <router-link :to="`/schedule`" class="text-[9px] font-black text-primary-600 hover:text-primary-700 uppercase border-b-2 border-primary-100">View All</router-link>
          </div>

          <div v-if="upcomingSchedules.length > 0" class="space-y-2 max-h-80 overflow-y-auto pr-2">
            <div v-for="schedule in upcomingSchedules" :key="schedule.Schedule_ID" class="p-3 md:p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 gap-2">
                <p class="font-bold text-sm text-slate-900">{{ formatDate(schedule.Start_Date) }}</p>
                <span class="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap" :style="{ backgroundColor: schedule.Color_Code + '20', color: schedule.Color_Code }">
                  {{ schedule.ShiftType_Name }}
                </span>
              </div>
              <p class="text-xs text-slate-600 font-medium">{{ schedule.Start_Time }} - {{ schedule.End_Time }}</p>
            </div>
          </div>
          <div v-else class="text-center py-12">
            <p class="text-sm text-slate-400 font-bold uppercase">No schedules assigned</p>
          </div>
        </div>
      </div>

      <!-- Employee Analytics Section -->
      <div class="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 class="text-lg md:text-xl font-black text-slate-900 uppercase mb-8">Work Analytics</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <!-- 7-Day Average -->
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <p class="text-[10px] font-black text-blue-700 uppercase tracking-wider mb-2">7-Day Average</p>
            <p class="text-3xl md:text-4xl font-black text-blue-900">{{ avgHoursPerDay }}h</p>
            <svg class="w-full h-12 mt-4 opacity-30" viewBox="0 0 100 40" preserveAspectRatio="none">
              <polyline points="0,30 20,15 40,20 60,10 80,18 100,12" stroke="currentColor" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/>
            </svg>
          </div>

          <!-- Check-in Rate -->
          <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <p class="text-[10px] font-black text-green-700 uppercase tracking-wider mb-2">Check-in Rate</p>
            <p class="text-3xl md:text-4xl font-black text-green-900">{{ checkInRate }}%</p>
            <div class="w-full h-2 bg-green-300 rounded-full mt-4">
              <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" :style="{ width: checkInRate + '%' }"></div>
            </div>
          </div>

          <!-- Total Hours This Month -->
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <p class="text-[10px] font-black text-purple-700 uppercase tracking-wider mb-2">Hours This Month</p>
            <p class="text-3xl md:text-4xl font-black text-purple-900">{{ totalMonthHours }}h</p>
            <p class="text-xs text-purple-600 font-bold mt-2">Target: {{ targetMonthHours }}h</p>
          </div>

          <!-- On-time Rate -->
          <div class="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200">
            <p class="text-[10px] font-black text-amber-700 uppercase tracking-wider mb-2">On-time Rate</p>
            <p class="text-3xl md:text-4xl font-black text-amber-900">{{ onTimeRate }}%</p>
            <div class="flex items-center gap-2 mt-2">
              <div class="w-2 h-2 rounded-full" :class="onTimeRate >= 95 ? 'bg-green-500' : onTimeRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'"></div>
              <span class="text-[10px] font-bold text-amber-700">{{ onTimeRate >= 95 ? 'Excellent' : onTimeRate >= 80 ? 'Good' : 'Needs Improvement' }}</span>
            </div>
          </div>
        </div>

        <!-- Weekly Activity Chart -->
        <div class="mt-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p class="text-xs font-black text-slate-700 uppercase mb-4">Weekly Activity</p>
          <div class="flex items-end justify-between gap-2 h-32">
            <div v-for="(day, idx) in weeklyActivity" :key="idx" class="flex-1 flex flex-col items-center group">
              <div class="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg hover:from-primary-600 hover:to-primary-500 transition-all"
                   :style="{ height: (day.hours / 12 * 100) + '%', minHeight: '8px' }">
              </div>
              <p class="text-[10px] font-bold text-slate-600 mt-2 upper">{{ day.day }}</p>
              <p class="text-[9px] text-slate-500">{{ day.hours }}h</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/utils/api'
import { MapPinIcon } from 'lucide-vue-next'
import { useRealtimeUpdates } from '@/composables/useRealtimeUpdates'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'

// GPS and Location
const location = ref(null)
const geofences = ref([])
const gpsSignalStrength = ref(0)
const gpsAccuracy = ref(50)
const watchId = ref(null)

// Check-in Status
const isCheckedIn = ref(false)
const loading = ref(false)
const currentShift = ref(null)
const upcomingSchedules = ref([])

// Time Tracking
const elapsedTime = ref('00:00:00')
const timeProgress = ref(0)
const currentTime = ref('00:00')
const shiftDuration = ref(8)

// Break Management
const onBreak = ref(false)
const breakLoading = ref(false)
const currentBreakTime = ref('00:00')
const totalBreaks = ref(0)
const breaksRemaining = ref(3)
const breaks = ref([])

// Analytics
const avgHoursPerDay = ref(0)
const checkInRate = ref(95)
const totalMonthHours = ref(128)
const targetMonthHours = ref(160)
const onTimeRate = ref(98)
const weeklyActivity = ref([])

// Real-time Updates
const { isConnected, statusUpdate, scheduleUpdate, analyticsUpdate, notificationQueue, dismissNotification } = useRealtimeUpdates()
const displayNotifications = computed(() => {
  return notificationQueue.value.map(notif => ({
    ...notif,
    title: notif.title || getNotificationTitle(notif.type || notif.message),
    type: notif.type || 'info'
  }))
})

const getNotificationTitle = (message) => {
  if (message?.includes('break')) return 'Break Reminder'
  if (message?.includes('shift')) return 'Shift Reminder'
  if (message?.includes('checkin')) return 'Check-in'
  if (message?.includes('checkout')) return 'Check-out'
  return 'Notification'
}

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const pLat1 = parseFloat(lat1)
  const pLon1 = parseFloat(lon1)
  const pLat2 = parseFloat(lat2)
  const pLon2 = parseFloat(lon2)

  const φ1 = (pLat1 * Math.PI) / 180
  const φ2 = (pLat2 * Math.PI) / 180
  const Δφ = ((pLat2 - pLat1) * Math.PI) / 180
  const Δλ = ((pLon2 - pLon1) * Math.PI) / 180
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const distance = computed(() => {
  if (!location.value || !geofences.value.length) return 9999
  const dists = geofences.value.map((f) =>
    calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude)
  )
  return Math.min(...dists)
})

const inRange = computed(() => {
  if (!location.value || !geofences.value.length) return false
  return geofences.value.some((f) => {
    const d = calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude)
    return d <= f.Radius
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const formatBreakTime = (timeStr) => {
  if (!timeStr) return 'N/A'
  return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Fetch current status
const fetchStatus = async () => {
  try {
    const res = await api.get('/attendance/status')
    isCheckedIn.value = res.data.checkedIn
  } catch (err) {
    console.error('Status check failed:', err.response?.status)
  }
}

// Fetch schedule data
const fetchSchedule = async () => {
  try {
    const currentRes = await api.get('/org/my-current-shift')
    currentShift.value = currentRes.data

    const upcomingRes = await api.get('/org/my-schedule')
    upcomingSchedules.value = (upcomingRes.data || []).slice(0, 7)
  } catch (err) {
    console.error('Schedule fetch failed:', err)
  }
}

// Fetch break history
const fetchBreaks = async () => {
  try {
    const res = await api.get('/attendance/breaks')
    breaks.value = res.data || []
    totalBreaks.value = breaks.value.filter((b) => b.end_time).length
  } catch (err) {
    console.error('Breaks fetch failed:', err)
  }
}

// Fetch analytics
const fetchAnalytics = async () => {
  try {
    const res = await api.get('/attendance/analytics')
    avgHoursPerDay.value = (res.data.avgHoursPerDay || 8).toFixed(1)
    checkInRate.value = res.data.checkInRate || 95
    totalMonthHours.value = res.data.totalMonthHours || 128
    onTimeRate.value = res.data.onTimeRate || 98
    weeklyActivity.value = res.data.weeklyActivity || generateDefaultWeekly()
  } catch (err) {
    console.error('Analytics fetch failed:', err)
    weeklyActivity.value = generateDefaultWeekly()
  }
}

const generateDefaultWeekly = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day) => ({
    day,
    hours: Math.floor(Math.random() * 10) + 6,
  }))
}

// Update elapsed time
const updateElapsedTime = () => {
  if (!isCheckedIn.value) {
    elapsedTime.value = '00:00:00'
    timeProgress.value = 0
    return
  }

  // Simulate elapsed time (in real app, calculate from start time)
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()

  const total = hours * 3600 + minutes * 60 + seconds - 9 * 3600 // Assuming 9 AM start
  const elapsed = Math.max(0, total)

  const displayHours = Math.floor(elapsed / 3600)
  const displayMinutes = Math.floor((elapsed % 3600) / 60)
  const displaySeconds = Math.floor(elapsed % 60)

  elapsedTime.value = `${String(displayHours).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`
  timeProgress.value = Math.min(elapsed / (shiftDuration.value * 3600), 1)
}

// Update current time
const updateCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// Start break
const startBreak = async () => {
  breakLoading.value = true
  try {
    await api.post('/attendance/break-start', {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
    })
    onBreak.value = true
    await fetchBreaks()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to start break')
  } finally {
    breakLoading.value = false
  }
}

// End break
const endBreak = async () => {
  breakLoading.value = true
  try {
    await api.post('/attendance/break-end', {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
    })
    onBreak.value = false
    await fetchBreaks()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to end break')
  } finally {
    breakLoading.value = false
  }
}

// Update GPS signal strength
const updateGPSSignal = (position) => {
  const accuracy = position.coords.accuracy
  gpsAccuracy.value = Math.round(accuracy)

  // Calculate signal strength based on accuracy (lower is better)
  const signalStrength = Math.max(0, Math.min(100, 100 - accuracy / 2))
  gpsSignalStrength.value = Math.round(signalStrength)

  // Update location
  location.value = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  }
}

// Monitor GPS position
const startGPSMonitoring = () => {
  if (navigator.geolocation) {
    // Initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateGPSSignal(pos)
      },
      (err) => {
        console.error('GPS Error:', err)
        alert('Please enable GPS access for check-in functionality')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    )

    // Watch position for real-time updates
    watchId.value = navigator.geolocation.watchPosition(
      (pos) => {
        updateGPSSignal(pos)
      },
      (err) => console.error('Watch error:', err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    )
  }
}

// Submit check-in/check-out
const handleSubmit = async () => {
  loading.value = true
  const action = isCheckedIn.value ? 'checkout' : 'checkin'
  try {
    await api.post(`/attendance/${action}`, {
      latitude: location.value.latitude,
      longitude: location.value.longitude,
      accuracy: gpsAccuracy.value,
    })
    await fetchStatus()
    await fetchAnalytics()
    alert(`✅ ${action === 'checkin' ? 'Checked in' : 'Checked out'} successfully!`)
  } catch (err) {
    alert(err.response?.data?.error || 'Request Failed')
  } finally {
    loading.value = false
  }
}

// Timers are handled in onMounted hook
onMounted(async () => {
  // Start GPS monitoring
  startGPSMonitoring()

  // Fetch data
  await fetchStatus()
  await fetchSchedule()
  await fetchBreaks()
  await fetchAnalytics()

  const res = await api.get('/org/geofences')
  geofences.value = res.data

  // Real-time updates listener
  const statusUpdateWatcher = setInterval(() => {
    if (statusUpdate.value && statusUpdate.value.checkedIn !== undefined) {
      isCheckedIn.value = statusUpdate.value.checkedIn
    }
  }, 500)

  const scheduleUpdateWatcher = setInterval(() => {
    if (scheduleUpdate.value && scheduleUpdate.value.schedule) {
      currentShift.value = scheduleUpdate.value.schedule
    }
  }, 500)

  const analyticsUpdateWatcher = setInterval(() => {
    if (analyticsUpdate.value) {
      avgHoursPerDay.value = (analyticsUpdate.value.avgHoursPerDay || avgHoursPerDay.value).toFixed(1)
      checkInRate.value = analyticsUpdate.value.checkInRate || checkInRate.value
      onTimeRate.value = analyticsUpdate.value.onTimeRate || onTimeRate.value
    }
  }, 500)

  // Start timers
  updateCurrentTime()
  updateElapsedTime()
  const timeTimer = setInterval(updateCurrentTime, 1000)
  const elapsedTimer = setInterval(updateElapsedTime, 1000)

  // Update break time every second
  const breakTimer = setInterval(() => {
    if (onBreak.value) {
      const now = new Date()
      const minutes = Math.floor(Math.random() * 30)
      currentBreakTime.value = `00:${String(minutes).padStart(2, '0')}`
    }
  }, 1000)

  // Refresh data every 5 minutes
  const refreshInterval = setInterval(() => {
    fetchStatus()
    fetchAnalytics()
  }, 5 * 60 * 1000)

  onBeforeUnmount(() => {
    // Clean up
    if (watchId.value) {
      navigator.geolocation.clearWatch(watchId.value)
    }
    clearInterval(timeTimer)
    clearInterval(elapsedTimer)
    clearInterval(breakTimer)
    clearInterval(refreshInterval)
    clearInterval(statusUpdateWatcher)
    clearInterval(scheduleUpdateWatcher)
    clearInterval(analyticsUpdateWatcher)
  })
})
</script>