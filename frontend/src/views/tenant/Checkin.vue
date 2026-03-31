<template>
  <div class="p-8 lg:p-12 max-w-6xl mx-auto space-y-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <p class="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">System Settings</p>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">Work Zones</h1>
        <p class="text-sm text-slate-500 font-medium">Create authorized locations where staff are allowed to clock in.</p>
      </div>
      <!-- THIS IS THE BUTTON YOU ARE LOOKING FOR -->
      <button @click="showAddModal = true" class="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-gray-600 transition-all shadow-xl active:scale-95">
        Establish New Zone +
      </button>
    </div>

    <!-- Active Zones List -->
    <div v-if="zones.length === 0" class="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
      <MapPinIcon class="w-10 h-10 text-slate-300 mx-auto mb-4" />
      <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">No Authorized Zones Found</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="zone in zones" :key="zone.Fence_ID" class="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all group">
        <div class="flex justify-between items-start mb-6">
          <div class="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
            <MapPinIcon class="w-6 h-6 text-orange-500" />
          </div>
          <button @click="deleteZone(zone.Fence_ID)" class="p-2 text-slate-200 hover:text-red-500 transition-colors">
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>
        <h3 class="text-xl font-black text-slate-900">{{ zone.Location_Name }}</h3>
        <p class="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Radius: {{ zone.Radius }}m</p>
        <div class="mt-8 pt-6 border-t border-slate-50 space-y-2">
          <div class="flex justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
            <span>Lat: {{ zone.Latitude?.toFixed(4) }}</span>
            <span>Lng: {{ zone.Longitude?.toFixed(4) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Zone Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6" @click.self="showAddModal = false">
      <div class="bg-white rounded-xl p-12 max-w-lg w-full shadow-2xl relative animate-in zoom-in duration-300">
        <h2 class="text-2xl font-black text-slate-900 mb-6 tracking-tight">Create Work Zone</h2>
        <form @submit.prevent="saveZone" class="space-y-4">
          <input v-model="form.locationName" type="text" placeholder="Branch Name (e.g. Main Office)" class="w-full p-4 bg-slate-50 rounded-xl border-none text-sm" required />
          <div class="grid grid-cols-2 gap-4">
            <input v-model="form.latitude" type="number" step="any" placeholder="Latitude" class="p-4 bg-slate-50 rounded-xl border-none text-sm" required />
            <input v-model="form.longitude" type="number" step="any" placeholder="Longitude" class="p-4 bg-slate-50 rounded-xl border-none text-sm" required />
          </div>
          <!-- AUTO DETECT BUTTON -->
          <button type="button" @click="detectGPS" class="w-full py-3 text-[10px] font-black text-orange-500 uppercase bg-orange-50 rounded-xl hover:bg-orange-100 transition-all">
            📍 Use My Current Location
          </button>
          <input v-model="form.radius" type="number" placeholder="Radius (meters) e.g. 500" class="w-full p-4 bg-slate-50 rounded-xl border-none text-sm" required />
          <div class="flex gap-4 pt-6">
            <button type="button" @click="showAddModal = false" class="flex-1 py-4 font-bold text-slate-400 text-xs">CANCEL</button>
            <button type="submit" :disabled="loading" class="flex-1 py-4 bg-orange-500 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-orange-100">
              {{ loading ? 'SAVING...' : 'SAVE ZONE' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import { MapPinIcon, TrashIcon } from 'lucide-vue-next'

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

onMounted(fetchZones)
</script>