<template>
  <div class="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <p class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">System Settings</p>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">Work Zones</h1>
        <p class="text-sm text-slate-500 font-medium">Create authorized locations where staff are allowed to clock in.</p>
      </div>
      <!-- THIS IS THE BUTTON YOU ARE LOOKING FOR -->
      <button @click="showAddModal = true" class="px-8 py-4 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-black transition-all shadow-xl active:scale-95">
        Establish New Zone +
      </button>
    </div>

    <!-- Active Zones List -->
    <div v-if="zones.length === 0" class="py-20 bg-primary-50 border-2 border-dashed border-primary-300 rounded-2xl text-center">
      <MapPinIcon class="w-10 h-10 text-slate-300 mx-auto mb-4" />
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No Authorized Zones Found</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="zone in zones" :key="zone.Fence_ID" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
        <div class="flex justify-between items-start mb-6">
          <div class="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
            <MapPinIcon class="w-6 h-6 text-primary-600" />
          </div>
          <button @click="deleteZone(zone.Fence_ID)" class="p-2 text-slate-200 hover:text-red-500 transition-colors">
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
        <h3 class="text-xl font-black text-slate-900">{{ zone.Location_Name }}</h3>
        <p class="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Radius: {{ zone.Radius }}m</p>
        <div class="mt-8 pt-6 border-t border-slate-50 space-y-2">
          <div class="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
            <span>Lat: {{ zone.Latitude?.toFixed(4) }}</span>
            <span>Lng: {{ zone.Longitude?.toFixed(4) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Map View -->
    <div v-if="zones.length > 0" class="bg-primary-50 p-8 rounded-2xl border-2 border-primary-200 shadow-md">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h3 class="text-lg font-black text-slate-900 uppercase tracking-widest">Zone Map Visualization</h3>
          <p class="text-sm text-slate-500 font-medium mt-1">View all authorized work zones on the map</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-black text-red-600 uppercase">Live</span>
        </div>
      </div>
      
      <!-- Map Container -->
      <div id="zones-map" class="w-full h-96 rounded-3xl border-2 border-slate-100 shadow-md overflow-hidden"></div>
      
      <!-- Zone Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
          <p class="text-2xl font-black text-primary-600">{{ zones.length }}</p>
          <p class="text-[9px] font-bold text-slate-500 uppercase mt-1">Total Zones</p>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-lg font-black text-primary-600">{{ averageRadius }}m</p>
          <p class="text-[9px] font-bold text-primary-600 uppercase mt-1">Avg Radius</p>
        </div>
        <div class="text-center p-4 bg-green-50 rounded-lg border border-green-100">
          <p class="text-lg font-black text-green-600">{{ minRadius }}m</p>
          <p class="text-[9px] font-bold text-green-600 uppercase mt-1">Min Radius</p>
        </div>
        <div class="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p class="text-lg font-black text-amber-600">{{ maxRadius }}m</p>
          <p class="text-[9px] font-bold text-amber-600 uppercase mt-1">Max Radius</p>
        </div>
      </div>
    </div>

    <!-- Add Zone Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6" @click.self="showAddModal = false">
      <div class="bg-primary-100 rounded-2xl p-12 max-w-lg w-full shadow-2xl relative animate-in zoom-in duration-300">
        <h2 class="text-2xl font-black text-slate-900 mb-6 tracking-tight">Create Work Zone</h2>
        <form @submit.prevent="saveZone" class="space-y-4">
          <input v-model="form.locationName" type="text" placeholder="Branch Name (e.g. Main Office)" class="w-full p-4 bg-slate-50 rounded-lg border-none text-sm" required />
          <div class="grid grid-cols-2 gap-4">
            <input v-model="form.latitude" type="number" step="any" placeholder="Latitude" class="p-4 bg-slate-50 rounded-lg border-none text-sm" required />
            <input v-model="form.longitude" type="number" step="any" placeholder="Longitude" class="p-4 bg-slate-50 rounded-lg border-none text-sm" required />
          </div>
          <!-- AUTO DETECT BUTTON -->
          <button type="button" @click="detectGPS" class="w-full py-3 text-[10px] font-black text-primary-600 uppercase bg-primary-50 rounded-xl hover:bg-primary-100 transition-all flex items-center justify-center gap-2">
            <MapPinIcon class="w-4 h-4" />
            Use My Current Location
          </button>
          <input v-model="form.radius" type="number" placeholder="Radius (meters) e.g. 500" class="w-full p-4 bg-slate-50 rounded-lg border-none text-sm" required />
          <div class="flex gap-4 pt-6">
            <button type="button" @click="showAddModal = false" class="flex-1 py-4 font-bold text-slate-400 text-xs">CANCEL</button>
            <button type="submit" :disabled="loading" class="flex-1 py-4 bg-primary-600 text-white rounded-lg font-bold text-xs uppercase shadow-lg shadow-primary-100">
              {{ loading ? 'SAVING...' : 'SAVE ZONE' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/utils/api'
import { MapPinIcon, TrashIcon } from 'lucide-vue-next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const zones = ref([])
const showAddModal = ref(false)
const loading = ref(false)
const form = reactive({ locationName: '', latitude: null, longitude: null, radius: 500 })

const fetchZones = async () => {
  const res = await api.get('/org/geofences')
  zones.value = res.data
}

const detectGPS = () => {
  navigator.geolocation.getCurrentPosition(pos => {
    form.latitude = pos.coords.latitude
    form.longitude = pos.coords.longitude
  })
}

const saveZone = async () => {
  loading.value = true
  try {
    await api.post('/org/geofences', form)
    showAddModal.value = false
    Object.assign(form, { locationName: '', latitude: null, longitude: null, radius: 500 })
    await fetchZones()
  } catch (e) { alert("Failed to save zone") }
  finally { loading.value = false }
}

const deleteZone = async (id) => {
  if (confirm("Delete this zone? Staff won't be able to clock in here.")) {
    await api.delete(`/org/geofences/${id}`)
    fetchZones()
  }
}

let map = null

const averageRadius = computed(() => {
  if (zones.value.length === 0) return 0
  const sum = zones.value.reduce((acc, z) => acc + z.Radius, 0)
  return Math.round(sum / zones.value.length)
})

const minRadius = computed(() => {
  if (zones.value.length === 0) return 0
  return Math.min(...zones.value.map(z => z.Radius))
})

const maxRadius = computed(() => {
  if (zones.value.length === 0) return 0
  return Math.max(...zones.value.map(z => z.Radius))
})

const initializeMap = () => {
  const mapContainer = document.getElementById('zones-map')
  if (!mapContainer || zones.value.length === 0 || map) return
  
  // Calculate center from all zones
  const avgLat = zones.value.reduce((sum, z) => sum + z.Latitude, 0) / zones.value.length
  const avgLng = zones.value.reduce((sum, z) => sum + z.Longitude, 0) / zones.value.length
  
  // Initialize map
  map = L.map(mapContainer).setView([avgLat, avgLng], 13)
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  
  // Add zone markers
  zones.value.forEach((zone, index) => {
    const color = ['red', 'blue', 'green', 'purple', 'orange'][index % 5]
    
    // Add marker
    L.marker([zone.Latitude, zone.Longitude], {
      icon: L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map)
    .bindPopup(`<strong>${zone.Location_Name}</strong><br>Radius: ${zone.Radius}m<br>Lat: ${zone.Latitude.toFixed(4)}, Lng: ${zone.Longitude.toFixed(4)}`)
    
    // Draw zone circle
    L.circle([zone.Latitude, zone.Longitude], {
      radius: zone.Radius,
      color: color,
      fillColor: color,
      fillOpacity: 0.15,
      weight: 2,
      opacity: 0.4
    }).addTo(map)
  })
}

onMounted(() => {
  fetchZones()
  setTimeout(() => {
    initializeMap()
  }, 500)
})
</script>
