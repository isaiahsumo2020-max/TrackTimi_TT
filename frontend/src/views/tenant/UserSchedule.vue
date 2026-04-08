<template>
  <div class="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    <!-- Toast Notifications -->
    <div class="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id"
             class="flex items-center gap-4 px-6 py-4 rounded-lg shadow-2xl border-2 pointer-events-auto animate-in slide-in-from-top-4 duration-300"
             :class="{
               'bg-green-50 border-green-300': toast.type === 'success',
               'bg-red-50 border-red-300': toast.type === 'error',
               'bg-blue-50 border-blue-300': toast.type === 'info',
               'bg-amber-50 border-amber-300': toast.type === 'warning'
             }">
          <CheckCircleIcon v-if="toast.type === 'success'" class="w-6 h-6" />
          <XCircleIcon v-else-if="toast.type === 'error'" class="w-6 h-6" />
          <InfoIcon v-else-if="toast.type === 'info'" class="w-6 h-6" />
          <AlertTriangleIcon v-else class="w-6 h-6" />
          <div>
            <p class="font-black text-sm" :class="{
              'text-green-900': toast.type === 'success',
              'text-red-900': toast.type === 'error',
              'text-blue-900': toast.type === 'info',
              'text-amber-900': toast.type === 'warning'
            }">{{ toast.message }}</p>
            <p v-if="toast.description" class="text-xs opacity-70 mt-1" :class="{
              'text-green-700': toast.type === 'success',
              'text-red-700': toast.type === 'error',
              'text-blue-700': toast.type === 'info',
              'text-amber-700': toast.type === 'warning'
            }">{{ toast.description }}</p>
          </div>
        </div>
      </transition-group>
    </div>
    
    <!-- 1. Premium Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <p class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1">Personnel Portal</p>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">
          Hello, {{ user?.firstName }} <span class="font-light text-slate-400">👋</span>
        </h1>
      </div>
      
      <div class="flex items-center space-x-3">
        <!-- Monthly Hours Card -->
        <div class="bg-gradient-to-br from-primary-50 to-primary-100 px-6 py-3 rounded-lg border border-primary-200 shadow-sm text-center">
          <p class="text-[9px] font-black text-primary-600 uppercase">Work Hours (MTD)</p>
          <p class="text-2xl font-black text-primary-900">{{ loading ? '--' : totalMonthlyHours.toFixed(1) }}h</p>
        </div>
        
        <!-- Weekly Hours Card -->
        <div class="bg-gradient-to-br from-accent-50 to-accent-100 px-6 py-3 rounded-lg border border-accent-200 shadow-sm text-center">
          <p class="text-[9px] font-black text-accent-600 uppercase">This Week</p>
          <p class="text-2xl font-black text-accent-900">{{ loading ? '--' : currentWeeklyHours.toFixed(1) }}h</p>
        </div>
        
        <!-- Quick Action Button - Hidden -->
      </div>
    </div>

    <!-- 2. Status & Shift Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Current Status Card -->
      <div class="bg-primary-50 p-8 rounded-2xl border border-primary-200 shadow-md flex flex-col justify-between relative overflow-hidden group">
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <div :class="statusColor" class="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12">
              <ClockIcon class="w-6 h-6" />
            </div>
            <span :class="statusBadge" class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {{ todayStatus }}
            </span>
          </div>
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
          <h2 class="text-4xl font-black text-slate-900 tracking-tighter mt-1">{{ todayTime }}</h2>
          <p class="text-xs font-bold text-slate-400 mt-2 italic">{{ statusMessage }}</p>
        </div>
        <!-- Decoration -->
        <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
      </div>

      <!-- Upcoming Schedule - Full Month View -->
      <div class="lg:col-span-2 bg-primary-900 p-8 rounded-2xl border-2 border-primary-800 shadow-2xl text-white relative overflow-hidden">
        <div class="relative z-10 space-y-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-xs font-black uppercase tracking-[0.2em] opacity-50 text-primary-400">Scheduled Shifts</h3>
              <p class="text-[10px] font-bold text-white/40 uppercase tracking-wider mt-1">{{ schedulePeriod }}</p>
            </div>
            <div class="flex gap-2">
              <span v-if="currentMonthSchedule.length > 0" class="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-lg text-[10px] font-black uppercase border border-primary-500/30">
                {{ currentMonthSchedule.length }} This Month
              </span>
              <span v-if="nextMonthSchedule.length > 0" class="px-3 py-1 bg-slate-500/20 text-slate-300 rounded-lg text-[10px] font-black uppercase border border-slate-500/30">
                {{ nextMonthSchedule.length }} Next Month
              </span>
            </div>
          </div>

          <!-- Main Schedule Display -->
          <div class="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            <!-- Current Month Shifts -->
            <div v-if="currentMonthSchedule.length > 0" class="space-y-3">
              <p class="text-[10px] font-black text-primary-400 uppercase tracking-widest opacity-50 mb-2">This Month ({{ new Date().toLocaleDateString('en-US', { month: 'long' }) }})</p>
              <div v-for="shift in currentMonthSchedule" :key="shift.Schedule_ID" 
                   class="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-primary-500/30 transition-all group cursor-pointer">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-lg font-black tracking-tight">{{ shift.Start_Time }} — {{ shift.End_Time }}</p>
                    <p class="text-[10px] text-white/60 font-bold uppercase mt-1">{{ formatDate(shift.Start_Date) }}</p>
                    <p class="text-sm text-white/70 font-semibold mt-2">{{ shift.Depart_Name || 'General Duty' }}</p>
                  </div>
                  <div class="text-right">
                    <span class="px-3 py-1 bg-primary-500/30 text-primary-200 rounded-lg text-[9px] font-black uppercase border border-primary-500/50 group-hover:bg-primary-500/50 transition-all">
                      Scheduled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Next Month Shifts -->
            <div v-if="nextMonthSchedule.length > 0" class="space-y-3">
              <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50 mt-6 mb-2">Next Month ({{ new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'long' }) }})</p>
              <div v-for="shift in nextMonthSchedule" :key="shift.Schedule_ID" 
                   class="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-slate-500/30 transition-all group cursor-pointer opacity-75 hover:opacity-100">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-lg font-black tracking-tight">{{ shift.Start_Time }} — {{ shift.End_Time }}</p>
                    <p class="text-[10px] text-white/60 font-bold uppercase mt-1">{{ formatDate(shift.Start_Date) }}</p>
                    <p class="text-sm text-white/70 font-semibold mt-2">{{ shift.Depart_Name || 'General Duty' }}</p>
                  </div>
                  <div class="text-right">
                    <span class="px-3 py-1 bg-slate-500/30 text-slate-200 rounded-lg text-[9px] font-black uppercase border border-slate-500/50">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Schedule -->
            <div v-if="currentMonthSchedule.length === 0 && nextMonthSchedule.length === 0" class="flex-1 flex items-center justify-center py-20">
              <p class="text-xs font-black uppercase opacity-30 tracking-[0.3em]">No Scheduled Shifts</p>
            </div>
          </div>
        </div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[80px] rounded-full"></div>
      </div>
    </div>

    <!-- 3. Performance & Recent Logs -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Recent Check-ins List -->
      <div class="lg:col-span-2 bg-primary-50 p-8 rounded-2xl border-2 border-primary-200 shadow-md">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <HistoryIcon class="w-4 h-4 mr-2 text-primary-500" /> Recent Pulse History
          </h3>
          <router-link :to="`/history`" class="text-[9px] font-black text-primary-600 uppercase border-b-2 border-primary-50">View All Logs</router-link>
        </div>

        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="checkin in checkins" :key="checkin.Attend_ID" 
            class="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {{ checkin.Check_Type === 'IN' ? '↓' : '↑' }}
              </div>
              <div>
                <p class="text-sm font-black text-slate-900">{{ checkin.Check_Type === 'IN' ? 'Clock In' : 'Clock Out' }}</p>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{{ formatDateTime(checkin.Check_in_time) }}</p>
              </div>
            </div>
            <div class="text-right">
              <span class="px-3 py-1 bg-white border border-slate-100 text-[8px] font-black text-slate-500 rounded-full uppercase">
                {{ checkin.Depart_Name || 'Main' }}
              </span>
            </div>
          </div>
          
          <div v-if="checkins.length === 0" class="text-center py-20 opacity-20 italic text-sm">No recent activity found</div>
        </div>
      </div>

      <!-- Weekly Progress (Cool Feature) -->
      <div class="bg-primary-50 p-8 rounded-2xl border-2 border-primary-200 shadow-md text-center space-y-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">Weekly Commitment</h3>
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
            <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Live
          </span>
        </div>
        
        <div class="relative w-40 h-40 mx-auto flex items-center justify-center">
          <!-- Simple SVG Circle Progress -->
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-50" />
            <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" 
              :class="weeklyProgress >= 100 ? 'text-green-600' : 'text-primary-600'"
              class="transition-all duration-1000"
              :stroke-dasharray="440"
              :stroke-dashoffset="440 - (440 * Math.min(100, weeklyProgress) / 100)"
              stroke-linecap="round" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <p class="text-3xl font-black" :class="weeklyProgress >= 100 ? 'text-green-600' : 'text-slate-900'">{{ Math.min(weeklyProgress, 100) }}%</p>
            <p class="text-[8px] font-black text-slate-400 uppercase">of {{ weeklyTarget }}h</p>
          </div>
        </div>
        
        <div class="pt-4 space-y-3">
          <div class="flex justify-between items-center">
            <p class="text-xs font-bold text-slate-600">Completed This Week</p>
            <p class="text-sm font-black text-primary-600">{{ currentWeeklyHours.toFixed(1) }}h</p>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div :class="weeklyProgress >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'"
                 class="h-full transition-all duration-700"
                 :style="{ width: Math.min(100, weeklyProgress) + '%' }"></div>
          </div>
          <div class="flex justify-between">
            <p class="text-[9px] font-bold text-slate-400 uppercase">
              Target: {{ weeklyTarget }}h <span class="text-slate-300">({{ shiftsThisWeek }} shifts × {{ shiftsThisWeek > 0 ? (weeklyTarget / shiftsThisWeek).toFixed(1) : '0' }}h)</span>
            </p>
            <p :class="hoursRemaining > 0 ? 'text-amber-600' : 'text-green-600'" class="text-[9px] font-bold uppercase font-semibold">
              {{ hoursRemaining > 0 ? hoursRemaining.toFixed(1) + 'h to go' : '✓ Complete!' }}
            </p>
          </div>
        </div>
      </div>

    </div>

    <!-- 4. Live Work Zones Map -->
    <div class="bg-primary-50 p-8 rounded-2xl border-2 border-primary-200 shadow-md">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest">Your Work Zones</h3>
          <p class="text-sm text-slate-500 font-semibold mt-1">Authorized locations for check-in</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-black text-green-600 uppercase">Live</span>
        </div>
      </div>
      
      <!-- Map Container -->
      <div id="work-zones-map" class="w-full h-96 rounded-3xl border-2 border-slate-100 shadow-md overflow-hidden"></div>

      <!-- Zone Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p class="text-2xl font-black text-primary-600">{{ authorizedZones.length }}</p>
          <p class="text-[9px] font-bold text-slate-500 uppercase mt-1">Zones Active</p>
        </div>
        <div v-if="currentLocation" class="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <p class="text-2xl font-black text-green-600">✓</p>
          <p class="text-[9px] font-bold text-green-600 uppercase mt-1">Location Found</p>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-lg font-black text-primary-600">{{ userRadius || '500' }}m</p>
          <p class="text-[9px] font-bold text-primary-600 uppercase mt-1">Check-in Radius</p>
        </div>
        <div class="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p class="text-2xl font-black text-amber-600">{{ isInZone ? '✓' : '✕' }}</p>
          <p class="text-[9px] font-bold text-amber-600 uppercase mt-1">In Zone Now</p>
        </div>
      </div>
    </div>

    <!-- Add New Shift Button - Hidden -->
  </div>

  <!-- Add Shift Modal -->
  <div v-if="showAddShiftModal"
       class="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
       @click="closeAddShiftModal">
    <div class="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-lg bg-white"
         @click.stop>
      <div>
        <h3 class="text-lg font-bold text-slate-900 mb-6">Add New Shift</h3>

        <form @submit.prevent="createShift" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Employee *</label>
            <select v-model="shiftForm.userId" required
                    class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all">
              <option value="">Select Employee</option>
              <option v-for="emp in employees" :key="emp.User_ID" :value="emp.User_ID">
                {{ emp.firstName }} {{ emp.surName }}
              </option>
            </select>
            <p v-if="!shiftForm.userId && formSubmitted" class="text-red-500 text-sm mt-1">Please select an employee</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Shift Date * (dd/mm/yyyy)</label>
            <input v-model="shiftForm.shiftDate" type="date" required
                    class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all">
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Start Time * (--:-- --)</label>
            <input v-model="shiftForm.shiftStartTime" type="time" required
                   class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all">
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">End Time * (--:-- --)</label>
            <input v-model="shiftForm.shiftEndTime" type="time" required
                   class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all">
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button type="button" @click="closeAddShiftModal"
                    class="px-5 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit"
                    class="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all active:scale-95">
              Create Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/api'
import { useRoute } from 'vue-router'
import { ClockIcon, CalendarIcon, HistoryIcon, MapPinIcon, CheckCircleIcon, XCircleIcon, InfoIcon, AlertTriangleIcon, ArrowDownIcon, ArrowUpIcon, CheckIcon } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const authStore = useAuthStore()
const route = useRoute()
const orgSlug = computed(() => route.params.orgSlug)
const user = computed(() => authStore.user)

// Data State
const todayStatus = ref('Away')
const todayTime = ref('--:--')
const schedule = ref([]) // Full monthly schedule
const checkins = ref([])
const employees = ref([])
const totalMonthlyHours = ref(0)
const currentWeeklyHours = ref(0)
const weeklyProgress = ref(0)
const weeklyTarget = ref(40)
const hoursRemaining = ref(40)
const showAddShiftModal = ref(false)
const formSubmitted = ref(false)
const loading = ref(true)
const toasts = ref([])

// Map & Location Data
const currentLocation = ref(null)
const authorizedZones = ref([])
const userRadius = ref(500) // meters
const isInZone = ref(false)
let map = null
let userMarker = null
let zoneMarkers = null

const shiftForm = ref({
  userId: '',
  shiftDate: '',
  shiftStartTime: '',
  shiftEndTime: ''
})

// Computed Styles
const statusColor = computed(() => todayStatus.value === 'Checked In' ? 'bg-green-500' : 'bg-slate-400')
const statusBadge = computed(() => todayStatus.value === 'Checked In' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500')
const statusMessage = computed(() => todayStatus.value === 'Checked In' ? 'Your shift is currently being recorded.' : 'Not currently clocked into a work zone.')

const nextShift = computed(() => schedule.value[0] || null)

const currentMonthSchedule = computed(() => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  return schedule.value.filter(shift => {
    const shiftDate = new Date(shift.Start_Date)
    return shiftDate.getMonth() === currentMonth && shiftDate.getFullYear() === currentYear
  })
})

const nextMonthSchedule = computed(() => {
  const today = new Date()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const nextMonthNum = nextMonth.getMonth()
  const nextYear = nextMonth.getFullYear()
  
  return schedule.value.filter(shift => {
    const shiftDate = new Date(shift.Start_Date)
    return shiftDate.getMonth() === nextMonthNum && shiftDate.getFullYear() === nextYear
  })
})

const schedulePeriod = computed(() => {
  if (schedule.value.length === 0) return 'No schedules'
  
  // Find earliest start date and latest end date from all schedules
  let earliestStart = null
  let latestEnd = null
  
  schedule.value.forEach(shift => {
    const startDate = new Date(shift.Start_Date)
    const endDate = new Date(shift.End_Date)
    
    if (!earliestStart || startDate < earliestStart) {
      earliestStart = startDate
    }
    if (!latestEnd || endDate > latestEnd) {
      latestEnd = endDate
    }
  })
  
  if (!earliestStart || !latestEnd) return 'No period'
  
  const startFormatted = earliestStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const endFormatted = latestEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startFormatted} to ${endFormatted}`
})

const shiftsThisWeek = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dayOfWeek)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  return schedule.value.filter(shift => {
    const shiftDate = new Date(shift.Start_Date)
    return shiftDate >= weekStart && shiftDate <= weekEnd
  }).length
})

const loadUserData = async () => {
  try {
    loading.value = true
    
    // 1. Fetch current clock status
    const statusRes = await api.get('/attendance/status')
    if (statusRes.data.checkedIn) {
      todayStatus.value = 'Checked In'
      todayTime.value = new Date(statusRes.data.session.Check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // 2. Fetch Personal History
    const historyRes = await api.get('/attendance/my-history')
    checkins.value = historyRes.data.slice(0, 8) // Get last 8 entries

    // 3. Fetch Schedules - get full upcoming schedules from Schedule table
    try {
      const scheduleRes = await api.get(`/org/my-schedule`)
      schedule.value = scheduleRes.data || []
    } catch (scheduleErr) {
      console.warn('Schedule fetch failed:', scheduleErr)
      schedule.value = []
    }

    // 4. Calculate weekly target based on ACTUAL shifts THIS WEEK
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - dayOfWeek) // Start of current week (Sunday)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6) // End of current week (Saturday)
    
    let weeklyTargetHours = 0
    
    // Sum up all shifts that fall within THIS WEEK
    schedule.value.forEach(shift => {
      const shiftDate = new Date(shift.Start_Date)
      if (shiftDate >= weekStart && shiftDate <= weekEnd) {
        // Calculate shift duration from Start_Time and End_Time
        const [startH, startM] = shift.Start_Time.split(':').map(Number)
        const [endH, endM] = shift.End_Time.split(':').map(Number)
        
        let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM)
        
        // Handle overnight shifts
        if (durationMinutes < 0) {
          durationMinutes += 24 * 60
        }
        
        weeklyTargetHours += durationMinutes / 60
      }
    })
    
    weeklyTarget.value = Math.round(weeklyTargetHours * 10) / 10 || 0

    // 5. Fetch Real Analytics Data
    try {
      const analyticsRes = await api.get('/attendance/analytics')
      if (analyticsRes.data) {
        // Calculate weekly hours from weekly activity
        if (analyticsRes.data.weeklyActivity && Array.isArray(analyticsRes.data.weeklyActivity)) {
          currentWeeklyHours.value = analyticsRes.data.weeklyActivity.reduce((sum, day) => sum + (day.hours || 0), 0)
        }
        // Get monthly hours
        if (analyticsRes.data.totalMonthHours) {
          totalMonthlyHours.value = analyticsRes.data.totalMonthHours
        }
      }
    } catch (analyticsErr) {
      console.warn('Analytics fetch failed, using fallback:', analyticsErr)
      currentWeeklyHours.value = 0
      totalMonthlyHours.value = 0
    }

    // Calculate progress percentage and remaining hours based on dynamic target
    weeklyProgress.value = Math.round((currentWeeklyHours.value / weeklyTarget.value) * 100)
    hoursRemaining.value = Math.max(0, weeklyTarget.value - currentWeeklyHours.value)

    // 6. Fetch Employees (requires admin role)
    try {
      const employeesRes = await api.get(`/org/users`)
      employees.value = employeesRes.data || []
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Admin role required to view employees list')
        employees.value = []
      }
    }

  } catch (error) {
    console.error('User Schedule data sync failed:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

const showToast = (message, type = 'info', description = '', duration = 4000) => {
  const id = Date.now()
  const toast = { id, message, type, description }
  toasts.value.push(toast)
  
  if (duration > 0) {
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, duration)
  }
  
  return id
}

const closeAddShiftModal = () => {
  showAddShiftModal.value = false
  formSubmitted.value = false
  shiftForm.value = {
    userId: '',
    shiftDate: '',
    shiftStartTime: '',
    shiftEndTime: ''
  }
}

const createShift = async () => {
  formSubmitted.value = true

  if (!shiftForm.value.userId || !shiftForm.value.shiftDate || !shiftForm.value.shiftStartTime || !shiftForm.value.shiftEndTime) {
    return
  }

  try {
    await api.post(`/shifts`, {
      userId: shiftForm.value.userId,
      shiftDate: shiftForm.value.shiftDate,
      shiftStartTime: shiftForm.value.shiftStartTime,
      shiftEndTime: shiftForm.value.shiftEndTime
    })

    // Reload schedule
    const scheduleRes = await api.get(`/org/my-schedule`)
    schedule.value = scheduleRes.data || []

    closeAddShiftModal()
  } catch (error) {
    console.error('Failed to create shift:', error)
    alert('Failed to create shift. Please try again.')
  }
}

let refreshInterval

const initializeMap = async () => {
  // Use Leaflet with OpenStreetMap (FREE - no API key needed!)
  const mapContainer = document.getElementById('work-zones-map')
  if (!mapContainer) return
  
  // Default center: Monrovia, Liberia
  const defaultLat = 6.2741
  const defaultLng = -10.6946
  const centerLat = currentLocation.value?.latitude || defaultLat
  const centerLng = currentLocation.value?.longitude || defaultLng
  
  // Initialize map
  map = L.map(mapContainer).setView([centerLat, centerLng], 15)
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  
  // Add user location marker (blue)
  if (currentLocation.value) {
    userMarker = L.marker([currentLocation.value.latitude, currentLocation.value.longitude], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map)
    .bindPopup('📍 Your Location')
    
    // Draw circle around user location (check-in radius)
    L.circle([currentLocation.value.latitude, currentLocation.value.longitude], {
      radius: userRadius.value,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      weight: 2,
      opacity: 0.3
    }).addTo(map)
  }
  
  // Add authorized zones markers (red)
  if (authorizedZones.value && authorizedZones.value.length > 0) {
    authorizedZones.value.forEach(zone => {
      const zoneLat = parseFloat(zone.latitude)
      const zoneLng = parseFloat(zone.longitude)
      const zoneRadius = zone.Radius || 500
      
      // Add marker
      L.marker([zoneLat, zoneLng], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map)
      .bindPopup(`<strong>${zone.Zone_Name}</strong><br>Radius: ${zoneRadius}m`)
      
      // Draw zone circle
      L.circle([zoneLat, zoneLng], {
        radius: zoneRadius,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.05,
        weight: 1,
        opacity: 0.2
      }).addTo(map)
      
      // Check if user is in this zone
      if (currentLocation.value) {
        const R = 6371000 // Earth's radius in meters
        const dLat = (zoneLat - currentLocation.value.latitude) * Math.PI / 180
        const dLng = (zoneLng - currentLocation.value.longitude) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(currentLocation.value.latitude * Math.PI / 180) * Math.cos(zoneLat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c
        
        if (distance <= zoneRadius) {
          isInZone.value = true
        }
      }
    })
  }
}

const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        currentLocation.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      },
      (error) => {
        console.warn('Location access denied:', error)
        showToast('Enable location for check-in zones', 'warning')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    )
  }
}

const fetchAuthorizedZones = async () => {
  try {
    // Fetch zones from backend
    const zonesRes = await api.get('/org/work-zones')
    authorizedZones.value = zonesRes.data || []
  } catch (error) {
    console.warn('Failed to fetch work zones:', error)
    // Demo data
    authorizedZones.value = [
      { Zone_ID: 1, Zone_Name: 'Main Office', latitude: '6.2741', longitude: '-10.6946', Radius: 500 }
    ]
  }
}

const updateMyZone = async () => {
  if (!currentLocation.value) {
    showToast('Location not available', 'warning', 'Enable location permissions to continue')
    return
  }
  
  try {
    // Check if in any authorized zone
    if (!isInZone.value) {
      showToast('Outside zone', 'warning', `You are not currently in an authorized work zone. Please move closer to a work zone to check in.`)
      return
    }
    
    // Emit location update to backend (for check-in)
    const response = await api.post('/attendance/verify-zone', {
      latitude: currentLocation.value.latitude,
      longitude: currentLocation.value.longitude,
      accuracy: currentLocation.value.accuracy
    })
    
    if (response.data.inZone) {
      showToast('Zone verified! ✓', 'success', `You're in ${response.data.zoneName}. Ready to check in!`)
    } else {
      showToast('Not in authorized zone', 'error', 'Please move to an authorized work zone')
    }
  } catch (error) {
    console.error('Zone verification failed:', error)
    showToast('Verification failed', 'error', error.response?.data?.message || 'Could not verify zone')
  }
}

onMounted(() => {
  loadUserData()
  getUserLocation()
  fetchAuthorizedZones()
  
  // Initialize map after a brief delay to allow DOM to render
  setTimeout(() => {
    initializeMap()
  }, 500)
  
  // Auto-refresh every 2 minutes for live data
  refreshInterval = setInterval(() => {
    loadUserData()
  }, 2 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  // Clean up map
  if (map) {
    map = null
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }

.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.3s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(-20px) translateX(20px); }
.toast-leave-to { opacity: 0; transform: translateY(-40px) translateX(20px); }
</style>
