<template>
  <div class="p-8 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-12">
      <div>
        <h1 class="text-4xl font-bold text-black">Settings</h1>
        <p class="text-xl text-gray-600 mt-2">{{ orgName }}</p>
      </div>
      <button @click="saveAllSettings" 
        :disabled="saving"
        class="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-xl"
      >
        💾 Save All Changes
      </button>
    </div>

    <!-- Settings Grid -->
    <div class="grid lg:grid-cols-2 gap-12">
      <!-- Organization Settings -->
      <div class="bg-white p-10 rounded-3xl shadow-xl">
        <h2 class="text-2xl font-bold text-black mb-8">Organization</h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Organization Name</label>
            <input v-model="settings.orgName" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl" />
          </div>
          
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Email</label>
            <input v-model="settings.orgEmail" type="email" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl" />
          </div>
          
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Phone</label>
            <input v-model="settings.orgPhone" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl" />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold mb-2">Region</label>
              <select v-model="settings.regionId" class="w-full p-4 border-2 border-gray-300 rounded-2xl">
                <option value="1">Montserrado</option>
                <option value="2">Bong</option>
                <option value="3">Margibi</option>
                <option value="4">Nimba</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold mb-2">Type</label>
              <select v-model="settings.orgTypeId" class="w-full p-4 border-2 border-gray-300 rounded-2xl">
                <option value="1">School</option>
                <option value="2">NGO</option>
                <option value="3">Company</option>
                <option value="4">Government</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Security & Attendance Settings -->
      <div class="bg-white p-10 rounded-3xl shadow-xl">
        <h2 class="text-2xl font-bold text-black mb-8">Security & Attendance</h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">GPS Geofence Radius (meters)</label>
            <input v-model.number="settings.geofenceRadius" type="number" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl" />
            <p class="text-sm text-gray-500 mt-2">Default: 500m around office location</p>
          </div>
          
          <div class="space-y-4">
            <label class="font-bold text-lg text-gray-700">Check-in Rules</label>
            <div class="space-y-3">
              <label class="flex items-center space-x-3">
                <input type="checkbox" v-model="settings.allowLateCheckin" class="w-5 h-5 text-orange-500 rounded" />
                <span class="text-lg">Allow late check-ins (after shift start)</span>
              </label>
              <label class="flex items-center space-x-3">
                <input type="checkbox" v-model="settings.requireGPS" class="w-5 h-5 text-orange-500 rounded" />
                <span class="text-lg">Require GPS location verification</span>
              </label>
              <label class="flex items-center space-x-3">
                <input type="checkbox" v-model="settings.deviceLockdown" class="w-5 h-5 text-orange-500 rounded" />
                <span class="text-lg">Strict 1-user-per-device policy</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing & Subscription -->
      <div class="bg-white p-10 rounded-3xl shadow-xl">
        <h2 class="text-2xl font-bold text-black mb-8">Billing & Plan</h2>
        <div class="space-y-6">
          <div class="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200">
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ currentPlan }}</h3>
            <p class="text-lg text-gray-700">${{ monthlyPrice }}/month • {{ maxUsers }} users</p>
            <button class="mt-4 bg-orange-500 text-white px-6 py-2 rounded-xl font-bold">
              Upgrade Plan
            </button>
          </div>
          
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Billing Email</label>
            <input v-model="settings.billingEmail" type="email" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl" />
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white p-10 rounded-3xl shadow-xl border-2 border-gray-100">
        <h2 class="text-2xl font-bold text-black mb-8 flex items-center">
          <span class="text-red-500 mr-3">⚠️</span>
          Danger Zone
        </h2>
        <div class="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
          <p class="text-lg text-red-800 mb-4">Delete Organization</p>
          <p class="text-sm text-red-700 mb-6">This will permanently delete your organization and all data. Super Admin only.</p>
          <button class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">
            🗑️ Delete Organization (Super Admin)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const orgSlug = route.params.orgSlug
const settings = reactive({
  orgName: '',
  orgEmail: '',
  orgPhone: '',
  regionId: 1,
  orgTypeId: 3,
  geofenceRadius: 500,
  allowLateCheckin: true,
  requireGPS: true,
  deviceLockdown: true,
  billingEmail: ''
})

const saving = ref(false)
const currentPlan = ref('Starter')
const monthlyPrice = ref(9.99)
const maxUsers = ref(10)

const saveAllSettings = async () => {
  saving.value = true
  // Save logic here
  setTimeout(() => {
    saving.value = false
    alert('Settings saved!')
  }, 2000)
}

// In Settings.vue - Auto-detect free plan limit
const checkSubscriptionStatus = async () => {
  try {
    const response = await authStore.api.get('/org/subscription/status')
    subscriptionStatus.value = response.data
    
    if (subscriptionStatus.value.needsPayment) {
      alert(`⚠️ Upgrade required! ${subscriptionStatus.value.message}`)
    }
  } catch (error) {
    console.error('Subscription check failed:', error)
  }
}

onMounted(() => {
  // Load org settings from API
  console.log('Loading settings for:', orgSlug)
})
</script>
