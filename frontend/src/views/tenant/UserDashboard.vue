<template>
  <div class="max-w-xl mx-auto py-12 px-6 space-y-8">
    <div class="text-center space-y-4">
      <div class="w-20 h-20 mx-auto bg-orange-500 rounded-xl flex items-center justify-center shadow-xl">
        <MapPinIcon class="w-10 h-10 text-white" />
      </div>
      <h1 class="text-4xl font-black text-slate-900 tracking-tight">
        {{ isCheckedIn ? 'Clock Out' : 'Clock In' }}
      </h1>
      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification: Satellite GPS</p>
    </div>

    <!-- Accuracy Box -->
    <div class="bg-white p-8 rounded-xl border border-slate-100 shadow-sm space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div :class="location ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'" class="p-5 rounded-xl border-2 text-center transition-all">
          <p class="text-[9px] font-black text-slate-400 uppercase mb-1">GPS Signal</p>
          <p class="text-xs font-bold" :class="location ? 'text-green-600' : 'text-slate-400'">{{ location ? 'LOCKED' : 'SEARCHING' }}</p>
        </div>
        <div :class="inRange ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'" class="p-5 rounded-xl border-2 text-center transition-all">
          <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Work Zone</p>
          <p class="text-xs font-bold" :class="inRange ? 'text-green-600' : 'text-red-600'">{{ inRange ? 'IN RANGE' : 'OUTSIDE' }}</p>
        </div>
      </div>

      <!-- Distance Readout -->
      <div v-if="location" class="text-center py-6 bg-slate-50 rounded-lg">
        <div class="text-4xl font-black text-slate-900">{{ distance }}m</div>
        <p class="text-[9px] font-bold text-slate-400 uppercase">Distance to target office</p>
      </div>
    </div>

    <!-- Action Button -->
    <button 
      @click="handleSubmit" 
      :disabled="!inRange || loading"
      class="w-full py-8 rounded-xl font-black text-2xl shadow-2xl transition-all active:scale-95"
      :class="inRange ? 'bg-orange-500 text-white shadow-orange-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
    >
      <span v-if="loading">PROCESSING...</span>
      <span v-else-if="isCheckedIn">END WORK SHIFT</span>
      <span v-else>START WORK SHIFT</span>
    </button>
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

const fetchStatus = async () => {
  try {
    // This must match the router.get('/status', ...) in the backend
    const res = await api.get('/attendance/status'); 
    isCheckedIn.value = res.data.checkedIn;
  } catch (err) {
    console.error("Status check failed:", err.response?.status);
    // If you see a 404 here in the console, the route above is wrong
  }
}

onMounted(async () => {
  // Get Current Location
  navigator.geolocation.getCurrentPosition(p => {
    location.value = { latitude: p.coords.latitude, longitude: p.coords.longitude }
  }, () => alert("Please allow GPS access"))
  
  // Load Work Zones and Status
  fetchStatus()
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