<template>
  <div class="p-6 lg:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    <!-- 1. Premium Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <p class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Personnel Portal</p>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight">
          Hello, {{ user?.firstName }} <span class="font-light text-slate-400">👋</span>
        </h1>
      </div>
      
      <div class="flex items-center space-x-4">
        <div class="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm text-center">
          <p class="text-[9px] font-black text-slate-400 uppercase">Work Hours (MTD)</p>
          <p class="text-sm font-black text-slate-900">{{ totalMonthlyHours }}h</p>
        </div>
        <!-- Quick Action Button -->
        <router-link :to="`/checkin`" 
          class="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          Clock Center 📍
        </router-link>
      </div>
    </div>

    <!-- 2. Status & Shift Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Current Status Card -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden group">
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <div :class="statusColor" class="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12">
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

      <!-- Upcoming Shift -->
      <div class="lg:col-span-2 bg-slate-900 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
        <div class="relative z-10 flex flex-col h-full">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xs font-black uppercase tracking-[0.2em] opacity-50 text-indigo-400">Next Scheduled Shift</h3>
            <CalendarIcon class="w-4 h-4 opacity-50" />
          </div>
          
          <div v-if="nextShift" class="flex-1 flex flex-col justify-center">
            <div class="flex items-center space-x-4 mb-4">
              <span class="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-[10px] font-black uppercase border border-indigo-500/30">
                {{ nextShift.Depart_Name || 'General' }}
              </span>
              <span class="text-xs font-bold opacity-60">{{ formatDate(nextShift.Shift_Date) }}</span>
            </div>
            <h2 class="text-3xl font-black tracking-tight">{{ nextShift.Shift_Start_Time }} — {{ nextShift.Shift_End_Time }}</h2>
            <p class="text-sm opacity-50 mt-2 font-medium">{{ nextShift.Shift_Title || 'Standard Operational Duty' }}</p>
          </div>
          
          <div v-else class="flex-1 flex items-center justify-center">
            <p class="text-xs font-black uppercase opacity-30 tracking-[0.3em]">No Upcoming Shifts Found</p>
          </div>
        </div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full"></div>
      </div>
    </div>

    <!-- 3. Performance & Recent Logs -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Recent Check-ins List -->
      <div class="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
            <HistoryIcon class="w-4 h-4 mr-2 text-indigo-500" /> Recent Pulse History
          </h3>
          <router-link :to="`/history`" class="text-[9px] font-black text-indigo-600 uppercase border-b-2 border-indigo-50">View All Logs</router-link>
        </div>

        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <div v-for="checkin in checkins" :key="checkin.Attend_ID" 
            class="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all group">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
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
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center space-y-6">
        <h3 class="text-xs font-black text-slate-900 uppercase tracking-widest">Weekly Commitment</h3>
        
        <div class="relative w-40 h-40 mx-auto flex items-center justify-center">
          <!-- Simple SVG Circle Progress -->
          <svg class="w-full h-full transform -rotate-90">
            <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-50" />
            <circle cx="80" cy="80" r="70" stroke="currentColor" stroke-width="12" fill="transparent" 
              class="text-indigo-600 transition-all duration-1000"
              :stroke-dasharray="440"
              :stroke-dashoffset="440 - (440 * weeklyProgress / 100)"
              stroke-linecap="round" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <p class="text-3xl font-black text-slate-900">{{ weeklyProgress }}%</p>
            <p class="text-[8px] font-black text-slate-400 uppercase">Target: 40h</p>
          </div>
        </div>
        
        <div class="pt-4 space-y-2">
          <p class="text-xs font-bold text-slate-600">You've completed <span class="text-indigo-600">{{ currentWeeklyHours }}h</span> this week.</p>
          <p class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Keep it up! 🚀</p>
        </div>
      </div>

    </div>

    <!-- Add New Shift Button -->
    <div class="flex justify-end">
      <button @click="showAddShiftModal = true"
              class="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
        + Add New Shift
      </button>
    </div>
  </div>

  <!-- Add Shift Modal -->
  <div v-if="showAddShiftModal"
       class="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center"
       @click="closeAddShiftModal">
    <div class="relative mx-auto p-6 border w-full max-w-md shadow-lg rounded-2xl bg-white"
         @click.stop>
      <div>
        <h3 class="text-lg font-bold text-slate-900 mb-6">Add New Shift</h3>

        <form @submit.prevent="createShift" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Employee *</label>
            <select v-model="shiftForm.userId" required
                    class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all">
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
                   class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all">
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Start Time * (--:-- --)</label>
            <input v-model="shiftForm.shiftStartTime" type="time" required
                   class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all">
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">End Time * (--:-- --)</label>
            <input v-model="shiftForm.shiftEndTime" type="time" required
                   class="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all">
          </div>

          <div class="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button type="button" @click="closeAddShiftModal"
                    class="px-5 py-2.5 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit"
                    class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all active:scale-95">
              Create Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/utils/api'
import { useRoute } from 'vue-router'
import { ClockIcon, CalendarIcon, HistoryIcon, MapPinIcon } from 'lucide-vue-next'

const authStore = useAuthStore()
const route = useRoute()
const orgSlug = computed(() => route.params.orgSlug)
const user = computed(() => authStore.user)

// Data State
const todayStatus = ref('Away')
const todayTime = ref('--:--')
const shifts = ref([])
const checkins = ref([])
const employees = ref([])
const totalMonthlyHours = ref(0)
const currentWeeklyHours = ref(0)
const weeklyProgress = ref(0)
const showAddShiftModal = ref(false)
const formSubmitted = ref(false)

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

const nextShift = computed(() => shifts.value[0] || null)

const loadUserData = async () => {
  try {
    // 1. Fetch current clock status
    const statusRes = await api.get('/attendance/status')
    if (statusRes.data.checkedIn) {
      todayStatus.value = 'Checked In'
      todayTime.value = new Date(statusRes.data.session.Check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    // 2. Fetch Personal History
    const historyRes = await api.get('/attendance/my-history')
    checkins.value = historyRes.data.slice(0, 8) // Get last 8 entries

    // 3. Fetch Shifts - get current user's shifts
    const shiftsRes = await api.get(`/shifts/user/${user.value.userId}`)
    shifts.value = shiftsRes.data

    // 4. Fetch Employees (requires admin role)
    try {
      const employeesRes = await api.get(`/org/users`)
      employees.value = employeesRes.data || []
    } catch (error) {
      if (error.response?.status === 403) {
        console.warn('Admin role required to view employees list')
        employees.value = []
      } else {
        throw error
      }
    }

    // 5. Calculate Mock Metrics (Replace with real backend sums if available)
    totalMonthlyHours.value = 142 // Example
    currentWeeklyHours.value = 28.5 // Example
    weeklyProgress.value = Math.round((28.5 / 40) * 100)

  } catch (error) {
    console.error('User Dashboard data sync failed:', error)
  }
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

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

    // Reload shifts for current user
    const shiftsRes = await api.get(`/shifts/user/${user.value.userId}`)
    shifts.value = shiftsRes.data

    closeAddShiftModal()
  } catch (error) {
    console.error('Failed to create shift:', error)
    alert('Failed to create shift. Please try again.')
  }
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
</style>