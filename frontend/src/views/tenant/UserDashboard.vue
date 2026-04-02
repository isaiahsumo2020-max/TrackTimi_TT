<template>
  <div class="max-w-6xl mx-auto py-12 px-6 space-y-10">
    <!-- Main Check-in Section -->
    <div class="max-w-xl mx-auto space-y-8">
      <div class="text-center space-y-4">
        <div class="w-20 h-20 mx-auto bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
          <MapPinIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">
          {{ isCheckedIn ? 'Clock Out' : 'Clock In' }}
        </h1>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification: Satellite GPS</p>
      </div>

      <!-- Accuracy Box -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div :class="location ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'" class="p-5 rounded-2xl border-2 text-center transition-all">
            <p class="text-[9px] font-black text-slate-400 uppercase mb-1">GPS Signal</p>
            <p class="text-xs font-bold" :class="location ? 'text-green-600' : 'text-slate-400'">{{ location ? 'LOCKED' : 'SEARCHING' }}</p>
          </div>
          <div :class="inRange ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'" class="p-5 rounded-2xl border-2 text-center transition-all">
            <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Work Zone</p>
            <p class="text-xs font-bold" :class="inRange ? 'text-green-600' : 'text-red-600'">{{ inRange ? 'IN RANGE' : 'OUTSIDE' }}</p>
          </div>
        </div>

        <!-- Distance Readout -->
        <div v-if="location" class="text-center py-6 bg-slate-50 rounded-[2rem]">
          <div class="text-4xl font-black text-slate-900">{{ distance }}m</div>
          <p class="text-[9px] font-bold text-slate-400 uppercase">Distance to target office</p>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        @click="handleSubmit" 
        :disabled="!inRange || loading"
        class="w-full py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95"
        :class="inRange ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
      >
        <span v-if="loading">PROCESSING...</span>
        <span v-else-if="isCheckedIn">END WORK SHIFT</span>
        <span v-else>START WORK SHIFT</span>
      </button>
    </div>

    <!-- Schedule Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Current/Next Shift -->
      <div class="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[3rem] shadow-lg text-white relative overflow-hidden">
        <div class="relative z-10">
          <div class="flex justify-between items-start mb-6">
            <div>
              <p class="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Next Scheduled</p>
              <h2 class="text-3xl font-black tracking-tight">Upcoming Shift</h2>
            </div>
            <svg class="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>

          <div v-if="currentShift" class="space-y-4">
            <div>
              <p class="text-sm opacity-80 mb-1">{{ formatDate(currentShift.Shift_Date) }}</p>
              <h3 class="text-4xl font-black">{{ currentShift.Shift_Start_Time }} — {{ currentShift.Shift_End_Time }}</h3>
            </div>
            <div class="flex items-center gap-3 pt-4 border-t border-white/20">
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
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <!-- Upcoming Schedule Summary -->
      <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">This Week</h3>
          <router-link :to="`/schedule`" class="text-[9px] font-black text-indigo-600 hover:text-indigo-700 uppercase border-b-2 border-indigo-100">View All</router-link>
        </div>

        <div v-if="upcomingSchedules.length > 0" class="space-y-3 max-h-64 overflow-y-auto pr-2">
          <div v-for="schedule in upcomingSchedules" :key="schedule.Schedule_ID" class="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
            <div class="flex items-start justify-between mb-2">
              <p class="font-bold text-sm text-slate-900">{{ formatDate(schedule.Start_Date) }}</p>
              <span class="text-[10px] font-bold px-2 py-1 rounded-full" :style="{ backgroundColor: schedule.Color_Code + '20', color: schedule.Color_Code }">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { MapPinIcon } from 'lucide-vue-next'

const location = ref(null)
const geofences = ref([])
const isCheckedIn = ref(false)
const loading = ref(false)
const currentShift = ref(null)
const upcomingSchedules = ref([])

// Precise Haversine distance math
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const pLat1 = parseFloat(lat1); const pLon1 = parseFloat(lon1);
  const pLat2 = parseFloat(lat2); const pLon2 = parseFloat(lon2);

  const φ1 = pLat1 * Math.PI/180; const φ2 = pLat2 * Math.PI/180;
  const Δφ = (pLat2 - pLat1) * Math.PI/180;
  const Δλ = (pLon2 - pLon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const distance = computed(() => {
  if (!location.value || !geofences.value.length) return 9999;
  const dists = geofences.value.map(f => calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude));
  return Math.min(...dists);
});

const inRange = computed(() => {
  if (!location.value || !geofences.value.length) return false;
  return geofences.value.some(f => {
    const d = calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude);
    return d <= f.Radius; // Use the dynamic radius from Admin settings
  });
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const fetchStatus = async () => {
  try {
    const res = await api.get('/attendance/status'); 
    isCheckedIn.value = res.data.checkedIn;
  } catch (err) {
    console.error("Status check failed:", err.response?.status);
  }
}

const fetchSchedule = async () => {
  try {
    // Fetch current/next shift
    const currentRes = await api.get('/org/my-current-shift')
    currentShift.value = currentRes.data

    // Fetch upcoming schedules
    const upcomingRes = await api.get('/org/my-schedule')
    upcomingSchedules.value = (upcomingRes.data || []).slice(0, 7) // Show next 7 shifts
  } catch (err) {
    console.error("Schedule fetch failed:", err)
  }
}

onMounted(async () => {
  // Get Current Location
  navigator.geolocation.getCurrentPosition(p => {
    location.value = { latitude: p.coords.latitude, longitude: p.coords.longitude }
  }, () => alert("Please allow GPS access"))
  
  // Load Work Zones, Status, and Schedule
  await fetchStatus()
  await fetchSchedule()
  const res = await api.get('/org/geofences')
  geofences.value = res.data
})

const handleSubmit = async () => {
  loading.value = true
  const action = isCheckedIn.value ? 'checkout' : 'checkin'
  try {
    await api.post(`/attendance/${action}`, { 
      latitude: location.value.latitude, 
      longitude: location.value.longitude 
    })
    await fetchStatus()
    alert("✅ Attendance Recorded!")
  } catch (e) {
    alert(e.response?.data?.error || "Request Failed")
  } finally {
    loading.value = false
  }
}
</script>