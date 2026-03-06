<template>
  <div class="max-w-2xl mx-auto space-y-12 py-12">
    <!-- Header -->
    <div class="text-center space-y-6">
      <div class="w-28 h-28 mx-auto bg-orange-500 rounded-3xl flex items-center justify-center shadow-2xl border-8 border-orange-400">
        <span class="text-5xl">📍</span>
      </div>
      <div>
        <h1 class="text-4xl font-bold text-black mb-4">Check In</h1>
        <p class="text-xl text-gray-600 max-w-md mx-auto">Record your attendance with GPS + device verification</p>
      </div>
    </div>

    <!-- Location Status -->
    <div class="card p-8">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-black">Device & Location</h2>
        <button @click="getLocation" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold border border-gray-200 text-sm">
          🔄 Refresh
        </button>
      </div>

      <!-- Device Verification -->
      <div class="mb-8 p-6 bg-orange-50 border-2 border-orange-200 rounded-2xl">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">Registered Device</div>
            <div class="font-mono font-bold text-black text-lg">{{ deviceInfo.name }}</div>
            <div class="text-sm text-gray-600">{{ deviceInfo.type }} • {{ deviceInfo.lastSeen }}</div>
          </div>
          <div :class="deviceVerified ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'" 
               class="px-6 py-3 rounded-full font-bold text-sm border-2">
            {{ deviceVerified ? '✅ Verified' : '⚠️ Unverified' }}
          </div>
        </div>
      </div>

      <!-- GPS Location -->
      <div v-if="locationError" class="p-6 bg-gray-50 border border-gray-200 rounded-2xl mb-8">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <div class="font-bold text-gray-900">Location Access Required</div>
            <div class="text-sm text-gray-600">{{ locationError }}</div>
          </div>
        </div>
      </div>

      <div v-else-if="location" class="space-y-4">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <span class="text-sm font-bold text-gray-600 block mb-1">Latitude</span>
            <div class="font-mono font-bold text-black text-xl">{{ location.latitude.toFixed(6) }}</div>
          </div>
          <div>
            <span class="text-sm font-bold text-gray-600 block mb-1">Longitude</span>
            <div class="font-mono font-bold text-black text-xl">{{ location.longitude.toFixed(6) }}</div>
          </div>
        </div>
        <div class="flex items-center justify-center space-x-4 pt-4">
          <span :class="inGeofence ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-600 border-gray-200'"
                class="px-6 py-3 rounded-full font-bold text-sm border-2">
            {{ inGeofence ? '✅ Within Office Range' : '⚠️ Outside Geofence (500m)' }}
          </span>
          <span class="text-sm font-semibold text-gray-700">{{ distance }}m from office</span>
        </div>
      </div>

      <div v-else class="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
        <div class="text-4xl mb-4">📍</div>
        <p class="text-lg text-gray-600 mb-6">Location not available</p>
        <button @click="getLocation" class="btn-orange px-8 py-4 text-lg">
          Enable Location
        </button>
      </div>
    </div>

    <!-- Check-in Action -->
    <div class="card p-12 text-center">
      <div v-if="checkinSuccess" class="space-y-6">
        <div class="w-32 h-32 mx-auto bg-orange-500 rounded-3xl flex items-center justify-center shadow-2xl border-8 border-orange-400">
          <span class="text-6xl">✅</span>
        </div>
        <div>
          <h2 class="text-4xl font-bold text-black mb-4">Check-in Successful!</h2>
          <p class="text-xl font-bold text-gray-700">{{ checkinTime }}</p>
          <p class="text-lg text-gray-600">Device verified • GPS recorded</p>
        </div>
        <router-link to="/dashboard" class="inline-block btn-orange px-12 py-4 text-lg shadow-lg">
          ← Back to Dashboard
        </router-link>
      </div>

      <div v-else>
        <div :class="canCheckin ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'"
             class="p-8 rounded-2xl border-2 mb-8">
          <div class="flex items-center justify-center space-x-3 text-lg font-bold">
            <span>{{ deviceVerified ? '✅' : '❌' }}</span>
            <span>{{ inGeofence ? '✅' : '❌' }}</span>
            <span>Ready: {{ readyStatus }}</span>
          </div>
        </div>
        
        <button
          @click="submitCheckin"
          :disabled="!canCheckin || loading"
          :class="[
            'w-full max-w-2xl mx-auto block px-12 py-8 text-2xl font-bold rounded-3xl shadow-2xl border-4 transition-all mx-0',
            canCheckin ? 'bg-orange-500 hover:bg-orange-600 border-orange-500 text-white hover:shadow-3xl' : 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
          ]"
        >
          {{ loading ? '🔄 Recording Check-in...' : '📍 Check In Now' }}
        </button>
        
        <p class="text-sm text-gray-500 mt-6 text-center">
          Requires: Device verification + GPS within 500m of office
        </p>
      </div>

      <div v-if="checkinError" class="mt-8 p-6 bg-gray-50 border border-gray-300 rounded-2xl">
        <div class="flex items-center space-x-3">
          <span class="text-2xl">⚠️</span>
          <div>
            <div class="font-bold text-gray-900 text-lg">{{ checkinError }}</div>
            <button @click="resetCheckin" class="mt-3 btn-orange-light px-6 py-2 text-sm">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data
const location = ref({ latitude: 6.315606, longitude: -10.807374 })
const deviceInfo = ref({ 
  name: 'Chrome on Windows', 
  type: 'Web Browser', 
  lastSeen: '2 minutes ago' 
})
const deviceVerified = ref(true)
const locationError = ref('')
const loading = ref(false)
const checkinSuccess = ref(false)
const checkinTime = ref('')
const checkinError = ref('')

const OFFICE_LAT = 6.3156
const OFFICE_LNG = -10.8074
const GEOFENCE_RADIUS = 500

const distance = computed(() => {
  if (!location.value) return 'N/A'
  const R = 6371e3 // Earth's radius in meters
  const φ1 = location.value.latitude * Math.PI/180
  const φ2 = OFFICE_LAT * Math.PI/180
  const Δφ = (OFFICE_LAT - location.value.latitude) * Math.PI/180
  const Δλ = (OFFICE_LNG - location.value.longitude) * Math.PI/180
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
})

const inGeofence = computed(() => distance.value <= GEOFENCE_RADIUS)
const canCheckin = computed(() => deviceVerified.value && inGeofence.value)
const readyStatus = computed(() => 
  canCheckin.value ? 'Ready!' : 
  !deviceVerified.value ? 'Device not verified' : 'Outside geofence'
)

const getLocation = () => {
  locationError.value = ''
  // Mock GPS - replace with real navigator.geolocation
  location.value = { latitude: 6.315606, longitude: -10.807374 }
}

const submitCheckin = async () => {
  loading.value = true
  checkinError.value = ''
  
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    checkinSuccess.value = true
    checkinTime.value = new Date().toLocaleString()
  }, 2000)
}

const resetCheckin = () => {
  checkinSuccess.value = false
  checkinError.value = ''
}

onMounted(() => {
  getLocation()
})
</script>
