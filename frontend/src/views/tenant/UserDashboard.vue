<template>
  <div class="max-w-xl mx-auto py-12 px-6 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <div class="w-20 h-20 mx-auto bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl">
        <MapPinIcon class="w-10 h-10 text-white" />
      </div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">Clock In</h1>
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Satellite Verification Active</p>
    </div>

    <!-- Status Card -->
    <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div :class="location ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'" class="p-4 rounded-2xl border-2 text-center transition-all">
          <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Signal</p>
          <p class="text-xs font-bold" :class="location ? 'text-green-600' : 'text-slate-400'">{{ location ? 'LOCKED' : 'SEARCHING' }}</p>
        </div>
        <div :class="inRange ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'" class="p-4 rounded-2xl border-2 text-center transition-all">
          <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Zone</p>
          <p class="text-xs font-bold" :class="inRange ? 'text-green-600' : 'text-red-600'">{{ inRange ? 'IN RANGE' : 'OUTSIDE' }}</p>
        </div>
      </div>

      <!-- 🛠️ DEBUGGER (VERY IMPORTANT FOR YOU NOW) -->
      <div v-if="location" class="pt-4 border-t border-slate-50 text-center space-y-2">
        <div class="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
          <span class="text-[9px] font-black text-slate-400 uppercase">Distance to Office:</span>
          <span class="text-sm font-black text-slate-900">{{ distance }} meters</span>
        </div>
        <div v-if="geofences.length > 0" class="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
          <span class="text-[9px] font-black text-slate-400 uppercase">Allowed Radius:</span>
          <span class="text-sm font-black text-indigo-600">{{ geofences[0].Radius }}m</span>
        </div>
      </div>

      <div v-if="locationError" class="p-4 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl text-center uppercase">
        ⚠️ {{ locationError }}
      </div>
    </div>

    <!-- Main Button -->
    <button 
      @click="submit" 
      :disabled="!inRange || loading"
      class="w-full py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
      :class="inRange ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
    >
      {{ loading ? 'SYNCING...' : 'CONFIRM CHECK IN' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'
import { MapPinIcon } from 'lucide-vue-next'

const location = ref(null)
const geofences = ref([]) 
const locationError = ref('')
const loading = ref(false)

// Accurate Math Engine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3 // meters
  // FORCE PARSING TO FLOAT
  const pLat1 = parseFloat(lat1); const pLon1 = parseFloat(lon1);
  const pLat2 = parseFloat(lat2); const pLon2 = parseFloat(lon2);

  const φ1 = pLat1 * Math.PI/180; const φ2 = pLat2 * Math.PI/180;
  const Δφ = (pLat2 - pLat1) * Math.PI/180;
  const Δλ = (pLon2 - pLon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

const distance = computed(() => {
  if (!location.value || geofences.value.length === 0) return 9999
  const dists = geofences.value.map(f => calculateDistance(location.value.latitude, location.value.longitude, f.Latitude, f.Longitude))
  return Math.min(...dists)
})

const inRange = computed(() => {
  if (!location.value || geofences.value.length === 0) return false
  // Check if you are within the radius defined in the DATABASE for the nearest zone
  const nearest = geofences.value.reduce((prev, curr) => {
    const dPrev = calculateDistance(location.value.latitude, location.value.longitude, prev.Latitude, prev.Longitude)
    const dCurr = calculateDistance(location.value.latitude, location.value.longitude, curr.Latitude, curr.Longitude)
    return dPrev < dCurr ? prev : curr
  })
  return distance.value <= nearest.Radius
})

const getLocation = () => {
  navigator.geolocation.getCurrentPosition(
    p => location.value = { latitude: p.coords.latitude, longitude: p.coords.longitude },
    e => locationError.value = "Please allow GPS",
    { enableHighAccuracy: true }
  )
}

onMounted(async () => {
  getLocation()
  const res = await api.get('/org/geofences')
  geofences.value = res.data
})

const submit = async () => {
  loading.value = true
  try {
    await api.post('/attendance/checkin', {
      latitude: location.value.latitude,
      longitude: location.value.longitude
    })
    alert("✅ Success!")
  } catch (e) {
    alert(e.response?.data?.error)
  } finally { loading.value = false }
}
</script>