<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 md:px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-black text-slate-900">Organization Settings</h1>
        <p class="text-slate-600 mt-2">Configure attendance policies and system-wide settings</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Navigation Sidebar -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
          <h3 class="font-black text-slate-900 uppercase text-sm mb-4">Settings</h3>
          <div class="space-y-2">
            <button
              v-for="section in settingsSections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="{
                'bg-indigo-100 text-indigo-700': activeSection === section.id,
                'text-slate-600 hover:bg-slate-50': activeSection !== section.id
              }"
              class="w-full text-left px-4 py-3 rounded-lg font-bold text-sm transition-colors"
            >
              {{ section.label }}
            </button>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Attendance Policies Section -->
          <div v-if="activeSection === 'attendance'" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-2xl font-black text-slate-900 mb-6 uppercase">Attendance Policies</h2>
            
            <!-- Clock-in Window Setting -->
            <div class="mb-8 pb-8 border-b border-slate-200">
              <label class="block text-sm font-black text-slate-900 mb-3 uppercase">
                Clock-in Window (Minutes After Shift Start)
              </label>
              <p class="text-xs text-slate-600 mb-4">
                Employees can clock in up to this many minutes after their scheduled shift start time.
              </p>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="formData.clockInWindow"
                  type="number"
                  min="0"
                  max="120"
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span class="text-2xl font-black text-slate-900">minutes</span>
              </div>
              <p class="text-xs text-slate-500 mt-3">
                Current: {{ formData.clockInWindow }} minutes
                <br>
                Examples: 0 = on-time only, 15 = 15 min grace, 30 = late is acceptable
              </p>
            </div>

            <!-- Clock-out Alert Setting -->
            <div class="mb-8 pb-8 border-b border-slate-200">
              <label class="block text-sm font-black text-slate-900 mb-3 uppercase">
                Clock-out Alert (Minutes Before Shift End)
              </label>
              <p class="text-xs text-slate-600 mb-4">
                System will alert employees this many minutes before their shift ends to clock out.
              </p>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="formData.clockOutAlert"
                  type="number"
                  min="5"
                  max="60"
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <span class="text-2xl font-black text-slate-900">minutes</span>
              </div>
              <p class="text-xs text-slate-500 mt-3">
                Current: {{ formData.clockOutAlert }} minutes
                <br>
                Recommended: 15 minutes before shift end
              </p>
            </div>

            <!-- Preview -->
            <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <p class="text-xs font-bold text-indigo-900 uppercase mb-2">⏰ Policy Preview</p>
              <div class="text-sm text-indigo-800 space-y-1">
                <p>✓ Clock-in available for <span class="font-black">{{ formData.clockInWindow }} minutes</span> after shift starts</p>
                <p>✓ Clock-out alert sent <span class="font-black">{{ formData.clockOutAlert }} minutes</span> before shift ends</p>
                <p>✓ Late clock-ins marked and tracked in system</p>
              </div>
            </div>

            <!-- Save Button -->
            <button
              @click="saveSettings"
              :disabled="savingSettings || !formChanged"
              class="w-full py-4 bg-indigo-600 text-white font-black rounded-lg uppercase hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
            
            <p v-if="settingsSaved" class="text-xs text-green-600 font-bold mt-3">
              ✓ Settings saved successfully
            </p>
          </div>

          <!-- Geofence Settings Section -->
          <div v-if="activeSection === 'geofence'" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-2xl font-black text-slate-900 mb-6 uppercase">Work Locations (Geofences)</h2>
            
            <div v-if="geofences.length > 0" class="space-y-4 mb-6">
              <div v-for="fence in geofences" :key="fence.Fence_ID" class="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-bold text-slate-900">{{ fence.Location_Name }}</h4>
                  <span v-if="fence.Is_Active" class="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded">Active</span>
                  <span v-else class="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded">Inactive</span>
                </div>
                <p class="text-xs text-slate-600">Radius: {{ fence.Radius }}m</p>
                <p class="text-xs text-slate-500">{{ fence.Latitude }}, {{ fence.Longitude }}</p>
              </div>
            </div>
            <div v-else class="text-center py-8 text-slate-500">
              <p class="text-sm">No geofences configured</p>
              <p class="text-xs">Contact administrator to add work locations</p>
            </div>
          </div>

          <!-- Notifications Section -->
          <div v-if="activeSection === 'notifications'" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-2xl font-black text-slate-900 mb-6 uppercase">Notification Settings</h2>
            
            <div class="space-y-6">
              <!-- Clock-in Notifications -->
              <div>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="formData.notifyClockIn"
                    type="checkbox"
                    class="w-5 h-5 rounded border-slate-300 cursor-pointer"
                  />
                  <span class="font-bold text-slate-900">Send clock-in confirmation</span>
                </label>
                <p class="text-xs text-slate-600 mt-2 ml-8">Notify employees when they successfully clock in</p>
              </div>

              <!-- Clock-out Alerts -->
              <div>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="formData.notifyClockOut"
                    type="checkbox"
                    class="w-5 h-5 rounded border-slate-300 cursor-pointer"
                  />
                  <span class="font-bold text-slate-900">Send clock-out reminder</span>
                </label>
                <p class="text-xs text-slate-600 mt-2 ml-8">Send alert before shift end to remind employees to clock out</p>
              </div>

              <!-- Late Clock-in Alerts -->
              <div>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="formData.notifyLateClock"
                    type="checkbox"
                    class="w-5 h-5 rounded border-slate-300 cursor-pointer"
                  />
                  <span class="font-bold text-slate-900">Alert on late clock-in</span>
                </label>
                <p class="text-xs text-slate-600 mt-2 ml-8">Notify employees and managers when employee clocks in late</p>
              </div>

              <!-- Organizational Updates -->
              <div>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    v-model="formData.notifyOrgUpdates"
                    type="checkbox"
                    class="w-5 h-5 rounded border-slate-300 cursor-pointer"
                  />
                  <span class="font-bold text-slate-900">Enable organization announcements</span>
                </label>
                <p class="text-xs text-slate-600 mt-2 ml-8">Allow broadcasting important updates to all employees</p>
              </div>
            </div>

            <button
              @click="saveSettings"
              :disabled="savingSettings || !formChanged"
              class="w-full mt-8 py-4 bg-indigo-600 text-white font-black rounded-lg uppercase hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>

          <!-- Dashboard Info Section -->
          <div v-if="activeSection === 'dashboard-info'" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 class="text-2xl font-black text-slate-900 mb-6 uppercase">Dashboard Information</h2>
            
            <div class="space-y-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="font-bold text-blue-900 mb-2">👤 User Dashboard Features</h4>
                <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>View today's schedule and upcoming shifts</li>
                  <li>Clock-in and clock-out with GPS validation</li>
                  <li>See attendance history (read-only)</li>
                  <li>View profile information (read-only)</li>
                  <li>Receive notifications and alerts on updates</li>
                  <li>Automatic clock-out alerts 15 minutes before shift ends</li>
                </ul>
              </div>

              <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 class="font-bold text-purple-900 mb-2">🔒 Access Control</h4>
                <ul class="text-sm text-purple-800 space-y-1 list-disc list-inside">
                  <li>Users cannot edit their own profile, schedule, or attendance</li>
                  <li>All changes require administrator approval</li>
                  <li>Read-only view of contracts and policies</li>
                  <li>Real-time notifications from organization</li>
                </ul>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-bold text-green-900 mb-2">⏰ Clock-in/out Settings</h4>
                <ul class="text-sm text-green-800 space-y-2">
                  <li>✓ Clock-in Window: Employees can clock in up to <span class="font-black">{{ formData.clockInWindow }} minutes</span> after shift start</li>
                  <li>✓ Clock-out Alert: System sends reminder <span class="font-black">{{ formData.clockOutAlert }} minutes</span> before shift end</li>
                  <li>✓ Location Validation: GPS must be within configured work zone</li>
                  <li>✓ Late Tracking: Late clock-ins are automatically flagged</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/api'

// State
const activeSection = ref('attendance')
const savingSettings = ref(false)
const settingsSaved = ref(false)
const geofences = ref([])

const settingsSections = [
  { id: 'attendance', label: '⏰ Attendance Policies' },
  { id: 'geofence', label: '📍 Work Locations' },
  { id: 'notifications', label: '🔔 Notifications' },
  { id: 'dashboard-info', label: 'ℹ️ Dashboard Info' }
]

const formData = ref({
  clockInWindow: 30,
  clockOutAlert: 15,
  notifyClockIn: true,
  notifyClockOut: true,
  notifyLateClock: true,
  notifyOrgUpdates: true
})

const initialFormData = ref({...formData.value})

const formChanged = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(initialFormData.value)
})

// Load settings
const loadSettings = async () => {
  try {
    const res = await api.get('/org/settings')
    if (res.data) {
      formData.value = {
        clockInWindow: res.data.Clock_In_Window_Minutes || 30,
        clockOutAlert: res.data.Clock_Out_Alert_Minutes || 15,
        notifyClockIn: true,
        notifyClockOut: true,
        notifyLateClock: true,
        notifyOrgUpdates: true
      }
      initialFormData.value = {...formData.value}
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
  }
}

// Load geofences
const loadGeofences = async () => {
  try {
    const res = await api.get('/org/geofences')
    geofences.value = res.data || []
  } catch (err) {
    console.error('Failed to load geofences:', err)
  }
}

// Save settings
const saveSettings = async () => {
  try {
    savingSettings.value = true
    settingsSaved.value = false
    
    await api.put('/org/settings', {
      Clock_In_Window_Minutes: formData.value.clockInWindow,
      Clock_Out_Alert_Minutes: formData.value.clockOutAlert
    })
    
    initialFormData.value = {...formData.value}
    settingsSaved.value = true
    
    setTimeout(() => {
      settingsSaved.value = false
    }, 3000)
  } catch (err) {
    alert('Failed to save settings: ' + (err.response?.data?.error || err.message))
  } finally {
    savingSettings.value = false
  }
}

onMounted(() => {
  loadSettings()
  loadGeofences()
})
</script>

<style scoped>
/* Animations */
</style>
