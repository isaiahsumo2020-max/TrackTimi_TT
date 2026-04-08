<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 md:px-6">
    <!-- Real-time Notifications (Toast) -->
    <RealtimeNotifications 
      :notifications="displayNotifications"
      @dismiss="dismissNotification"
    />

    <!-- Notification Panel (Modal) -->
    <NotificationPanel
      :isOpen="showNotificationsPanel"
      :notifications="notifications"
      :unreadCount="unreadCount"
      @close="showNotificationsPanel = false"
      @mark-as-read="markNotificationAsRead"
      @delete="deleteNotification"
      @mark-all-read="markAllAsRead"
    />

    <div class="max-w-6xl mx-auto">
      <!-- Header with Notification Bell -->
      <div class="mb-8 flex justify-between items-start">
        <div>
          <h1 class="text-4xl font-black text-slate-900">Organization Settings</h1>
          <p class="text-slate-600 mt-2">Configure attendance policies and system-wide settings</p>
        </div>
        <!-- Notification Bell -->
        <button 
          @click="showNotificationsPanel = !showNotificationsPanel"
          class="relative p-3 bg-white rounded-lg border border-slate-200 hover:border-primary-300 shadow-sm transition-all hover:shadow-md"
        >
          <svg class="w-6 h-6 text-slate-600 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Navigation Sidebar -->
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-fit">
          <h3 class="font-black text-slate-900 uppercase text-sm mb-4">Settings</h3>
          <div class="space-y-2">
            <button
              v-for="section in settingsSections"
              :key="section.id"
              @click="activeSection = section.id"
              :class="{
                'bg-primary-100 text-primary-700': activeSection === section.id,
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
          <div v-if="activeSection === 'attendance'" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
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
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <p class="text-xs font-bold text-primary-900 uppercase mb-2">⏰ Policy Preview</p>
              <div class="text-sm text-primary-800 space-y-1">
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Clock-in available for <span class="font-black">{{ formData.clockInWindow }} minutes</span> after shift starts</p></div>
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Clock-out alert sent <span class="font-black">{{ formData.clockOutAlert }} minutes</span> before shift ends</p></div>
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Late clock-ins marked and tracked in system</p></div>
              </div>
            </div>

            <!-- Save Button -->
            <button
              @click="saveSettings"
              :disabled="savingSettings || !formChanged"
              class="w-full py-4 bg-primary-600 text-white font-black rounded-lg uppercase hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
            
            <p v-if="settingsSaved" class="text-xs text-green-600 font-bold mt-3 flex items-center gap-2">
              <CheckCircleIcon class="w-4 h-4" />
              Settings saved successfully
            </p>
          </div>

          <!-- Break Management Section -->
          <div v-if="activeSection === 'breaks'" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 class="text-2xl font-black text-slate-900 mb-6 uppercase">Break Management</h2>
            
            <!-- Max Breaks Per Shift Setting -->
            <div class="mb-8 pb-8 border-b border-slate-200">
              <label class="block text-sm font-black text-slate-900 mb-3 uppercase">
                Maximum Breaks Per Shift
              </label>
              <p class="text-xs text-slate-600 mb-4">
                Set the maximum number of breaks employees are allowed to take during a single shift.
              </p>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="formData.maxBreaksPerShift"
                  type="number"
                  min="1"
                  max="10"
                  class="flex-1 px-4 py-3 border border-slate-300 rounded-lg font-bold text-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 max-w-xs"
                />
                <span class="text-2xl font-black text-slate-900">breaks</span>
              </div>
              <p class="text-xs text-slate-500 mt-3">
                Current Setting: <span class="font-bold">{{ formData.maxBreaksPerShift }} breaks per shift</span>
                <br>
                Valid Range: 1 to 10 breaks
              </p>
            </div>

            <!-- Break Types Info -->
            <div class="bg-blue-50 border border-primary-200 rounded-lg p-4 mb-6">
              <h4 class="font-bold text-blue-900 mb-3">ℹ️ Break Types Supported</h4>
              <ul class="text-sm text-blue-800 space-y-2">
                <li class="flex items-start gap-2">
                  <span class="font-bold">🍽️ Lunch Break:</span> Primary meal break (typically 1 per shift)
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold">☕ Regular Break:</span> Short break for rest (typically 5-15 min)
                </li>
                <li class="flex items-start gap-2">
                  <span class="font-bold">🚻 Restroom Break:</span> Quick restroom visit (typically 5 min)
                </li>
              </ul>
            </div>

            <!-- Preview -->
            <div class="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <p class="text-xs font-bold text-primary-900 uppercase mb-2">☕ Break Policy Preview</p>
              <div class="text-sm text-primary-800 space-y-1">
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Employees can take up to <span class="font-black">{{ formData.maxBreaksPerShift }} breaks</span> per shift</p></div>
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Break types: Lunch, Regular, Restroom</p></div>
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>GPS location tracking enabled for validation</p></div>
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Break duration automatically calculated and tracked</p></div>
                <div class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" /><p>Admin can view all break activities and analytics</p></div>
              </div>
            </div>

            <!-- Save Button -->
            <button
              @click="saveSettings"
              :disabled="savingSettings || !formChanged"
              class="w-full py-4 bg-primary-600 text-white font-black rounded-lg uppercase hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
            
            <div v-if="settingsSaved" class="text-xs text-green-600 font-bold mt-3 flex items-center gap-2">
              <CheckCircleIcon class="w-4 h-4" />
              Settings saved successfully - Employees will be notified about the policy change
            </div>
          </div>

          <!-- Geofence Settings Section -->
          <div v-if="activeSection === 'geofence'" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
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
          <div v-if="activeSection === 'notifications'" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
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
              class="w-full mt-8 py-4 bg-primary-600 text-white font-black rounded-lg uppercase hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {{ savingSettings ? 'Saving...' : 'Save Settings' }}
            </button>
          </div>

          <!-- Dashboard Info Section -->
          <div v-if="activeSection === 'dashboard-info'" class="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h2 class="text-2xl font-black text-slate-900 mb-6 uppercase">Dashboard Information</h2>
            
            <div class="space-y-6">
              <div class="bg-blue-50 border border-primary-200 rounded-lg p-4">
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

              <div class="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <h4 class="font-bold text-accent-900 mb-2">🔒 Access Control</h4>
                <ul class="text-sm text-accent-800 space-y-1 list-disc list-inside">
                  <li>Users cannot edit their own profile, schedule, or attendance</li>
                  <li>All changes require administrator approval</li>
                  <li>Read-only view of contracts and policies</li>
                  <li>Real-time notifications from organization</li>
                </ul>
              </div>

              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="font-bold text-green-900 mb-2">⏰ Clock-in/out Settings</h4>
                <ul class="text-sm text-green-800 space-y-2">
                  <li class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" />Clock-in Window: Employees can clock in up to <span class="font-black">{{ formData.clockInWindow }} minutes</span> after shift start</li>
                  <li class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" />Clock-out Alert: System sends reminder <span class="font-black">{{ formData.clockOutAlert }} minutes</span> before shift end</li>
                  <li class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" />Location Validation: GPS must be within configured work zone</li>
                  <li class="flex items-center gap-2"><CheckCircleIcon class="w-4 h-4 text-green-600" />Late Tracking: Late clock-ins are automatically flagged</li>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/utils/api'
import { CheckCircleIcon } from 'lucide-vue-next'
import { getNotifications, markNotificationAsRead, getUnreadNotificationCount, deleteNotification as deleteNotifApi, markAllNotificationsAsRead } from '@/services/orgApi'
import RealtimeNotifications from '@/components/dashboard/RealtimeNotifications.vue'
import NotificationPanel from '@/components/dashboard/NotificationPanel.vue'

// State
const activeSection = ref('attendance')
const savingSettings = ref(false)
const settingsSaved = ref(false)
const geofences = ref([])
const notifications = ref([])
const unreadCount = ref(0)
const notifRefreshInterval = ref(null)
const showNotificationsPanel = ref(false)

const settingsSections = [
  { id: 'attendance', label: '⏰ Attendance Policies' },
  { id: 'breaks', label: '☕ Break Management' },
  { id: 'geofence', label: '📍 Work Locations' },
  { id: 'notifications', label: '🔔 Notifications' },
  { id: 'dashboard-info', label: 'ℹ️ Dashboard Info' }
]

const formData = ref({
  clockInWindow: 30,
  clockOutAlert: 15,
  maxBreaksPerShift: 2,
  notifyClockIn: true,
  notifyClockOut: true,
  notifyLateClock: true,
  notifyOrgUpdates: true
})

const initialFormData = ref({...formData.value})

const formChanged = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(initialFormData.value)
})

// Computed for notifications display (unread only, newest first)
const displayNotifications = computed(() => {
  return notifications.value
    .filter(n => !n.Is_Read)
    .sort((a, b) => new Date(b.Created_at) - new Date(a.Created_at))
})

// Load settings
const loadSettings = async () => {
  try {
    const res = await api.get('/org/settings')
    if (res.data) {
      formData.value = {
        clockInWindow: res.data.Clock_In_Window_Minutes || 30,
        clockOutAlert: res.data.Clock_Out_Alert_Minutes || 15,
        maxBreaksPerShift: res.data.Max_Breaks_Per_Shift || 2,
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
      Clock_Out_Alert_Minutes: formData.value.clockOutAlert,
      maxBreaksPerShift: formData.value.maxBreaksPerShift
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

// Load notifications
const loadNotifications = async () => {
  try {
    const res = await getNotifications(20)
    notifications.value = res.data || []
    
    // Also get unread count
    const countRes = await getUnreadNotificationCount()
    unreadCount.value = countRes.data?.unreadCount || 0
  } catch (err) {
    console.error('Failed to load notifications:', err)
  }
}

// Dismiss notification (mark as read)
const dismissNotification = async (notificationId) => {
  try {
    await markNotificationAsRead(notificationId)
    notifications.value = notifications.value.map(n => 
      n.Notify_ID === notificationId ? {...n, Is_Read: 1} : n
    )
    // Decrement unread count
    if (unreadCount.value > 0) unreadCount.value--
  } catch (err) {
    console.error('Failed to dismiss notification:', err)
  }
}

// Delete notification
const deleteNotification = async (notifyId) => {
  try {
    await deleteNotifApi(notifyId)
    notifications.value = notifications.value.filter(n => n.Notify_ID !== notifyId)
  } catch (err) {
    console.error('Failed to delete notification:', err)
  }
}

// Mark all as read
const markAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead()
    notifications.value = notifications.value.map(n => ({...n, Is_Read: 1}))
    unreadCount.value = 0
  } catch (err) {
    console.error('Failed to mark all as read:', err)
  }
}

onMounted(() => {
  loadSettings()
  loadGeofences()
  loadNotifications()
  
  // Refresh notifications every 3 seconds for real-time updates
  notifRefreshInterval.value = setInterval(() => {
    loadNotifications()
  }, 3000)
})

onBeforeUnmount(() => {
  if (notifRefreshInterval.value) {
    clearInterval(notifRefreshInterval.value)
  }
})
</script>

<style scoped>
/* Animations */
</style>

