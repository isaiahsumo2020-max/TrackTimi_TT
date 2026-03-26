<template>
  <div class="p-8 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-12">
      <div>
        <h1 class="text-4xl font-bold text-black">Settings</h1>
        <p class="text-xl text-gray-600 mt-2">{{ settings.orgName }}</p>
      </div>
      <button @click="saveAllSettings" 
        :disabled="saving"
        class="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-xl transition-all"
      >
        {{ saving ? '⏳ Saving...' : '💾 Save All Changes' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-2xl text-gray-600">Loading settings...</p>
    </div>

    <!-- Settings Grid -->
    <div v-else class="grid lg:grid-cols-2 gap-12">
      <!-- Organization Settings -->
      <div class="bg-white p-10 rounded-3xl shadow-xl">
        <h2 class="text-2xl font-bold text-black mb-8">Organization</h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Organization Name</label>
            <input v-model="settings.orgName" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl focus:border-orange-500 focus:outline-none" />
          </div>
          
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Email</label>
            <input v-model="settings.email" type="email" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl focus:border-orange-500 focus:outline-none" />
          </div>
          
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Phone</label>
            <input v-model="settings.phone" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl focus:border-orange-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Address</label>
            <textarea v-model="settings.address" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg focus:border-orange-500 focus:outline-none" rows="3"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold mb-2">Region</label>
              <select v-model="settings.regionId" class="w-full p-4 border-2 border-gray-300 rounded-2xl focus:border-orange-500 focus:outline-none">
                <option value="null">Select Region</option>
                <option v-for="region in regions" :key="region.Region_ID" :value="region.Region_ID">
                  {{ region.Region_Name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-bold mb-2">Organization Type</label>
              <select v-model="settings.orgTypeId" class="w-full p-4 border-2 border-gray-300 rounded-2xl focus:border-orange-500 focus:outline-none">
                <option value="null">Select Type</option>
                <option v-for="type in orgTypes" :key="type.Org_Type_ID" :value="type.Org_Type_ID">
                  {{ type.Type_Name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Number of Employees</label>
            <input v-model.number="settings.numEmployees" type="number" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl focus:border-orange-500 focus:outline-none" />
          </div>
        </div>
      </div>

      <!-- Branding Settings -->
      <div class="bg-white p-10 rounded-3xl shadow-xl">
        <h2 class="text-2xl font-bold text-black mb-8">Branding</h2>
        
        <div class="space-y-6">
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Theme Color</label>
            <div class="flex gap-4 items-center">
              <input v-model="settings.themeColor" type="color" class="w-20 h-20 rounded-2xl cursor-pointer border-2 border-gray-300" />
              <div class="flex-1">
                <input v-model="settings.themeColor" type="text" placeholder="#ff6600" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-lg focus:border-orange-500 focus:outline-none font-mono" />
                <p class="text-sm text-gray-500 mt-2">Current: {{ settings.themeColor }}</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Logo</label>
            <div class="space-y-4">
              <div v-if="settings.logoPath" class="flex justify-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <img :src="`data:${settings.logoMimeType || 'image/png'};base64,${settings.logoPath}`" class="max-h-32 max-w-64" />
              </div>
              <div v-else class="flex justify-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                <p class="text-gray-500">No logo uploaded</p>
              </div>
              <input @change="handleLogoUpload" type="file" accept="image/*" class="w-full p-4 border-2 border-gray-300 rounded-2xl cursor-pointer" />
              <p class="text-sm text-gray-500">Upload PNG, JPG, or GIF (max 1MB)</p>
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
            <input v-model.number="settings.geofenceRadius" type="number" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl focus:border-orange-500 focus:outline-none" />
            <p class="text-sm text-gray-500 mt-2">Default: 500m around office location</p>
          </div>
          
          <div class="space-y-4">
            <label class="font-bold text-lg text-gray-700">Check-in Rules</label>
            <div class="space-y-3">
              <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
                <input type="checkbox" v-model="settings.allowLateCheckin" class="w-5 h-5 text-orange-500 rounded" />
                <span class="text-lg">Allow late check-ins (after shift start)</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
                <input type="checkbox" v-model="settings.requireGPS" class="w-5 h-5 text-orange-500 rounded" />
                <span class="text-lg">Require GPS location verification</span>
              </label>
              <label class="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg">
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
            <button class="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-bold transition-colors">
              Upgrade Plan
            </button>
          </div>
          
          <div>
            <label class="block text-lg font-bold text-gray-700 mb-4">Billing Email</label>
            <input v-model="settings.billingEmail" type="email" class="w-full p-4 border-2 border-gray-300 rounded-2xl text-xl focus:border-orange-500 focus:outline-none" />
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white p-10 rounded-3xl shadow-xl border-2 border-gray-100 lg:col-span-2">
        <h2 class="text-2xl font-bold text-black mb-8 flex items-center">
          <span class="text-red-500 mr-3">⚠️</span>
          Danger Zone
        </h2>
        <div class="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
          <p class="text-lg text-red-800 mb-4">Delete Organization</p>
          <p class="text-sm text-red-700 mb-6">This will permanently delete your organization and all data. Super Admin only.</p>
          <button class="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg transition-colors">
            🗑️ Delete Organization (Super Admin)
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="fixed bottom-8 right-8 bg-green-500 text-white p-6 rounded-2xl shadow-lg">
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="fixed bottom-8 right-8 bg-red-500 text-white p-6 rounded-2xl shadow-lg">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const orgSlug = route.params.orgSlug

const settings = reactive({
  orgId: null,
  orgName: '',
  email: '',
  phone: '',
  address: '',
  regionId: null,
  orgTypeId: null,
  numEmployees: 0,
  themeColor: '#ff6600',
  logoPath: null,
  logoMimeType: 'image/png',
  geofenceRadius: 500,
  allowLateCheckin: true,
  requireGPS: true,
  deviceLockdown: true,
  billingEmail: ''
})

const regions = ref([])
const orgTypes = ref([])
const currentPlan = ref('Starter')
const monthlyPrice = ref(9.99)
const maxUsers = ref(10)

const loadOrganizationSettings = async () => {
  try {
    loading.value = true
    // Get org settings
    console.log('Auth store org_id:', authStore.org_id)
    console.log('Auth store user:', authStore.user)
    
    if (!authStore.org_id) {
      errorMessage.value = 'Organization ID not found. Please log in again.'
      loading.value = false
      return
    }

    const url = `/org/${authStore.org_id}/settings`
    console.log('Fetching from URL:', url)
    
    const response = await authStore.api.get(url)
    console.log('Settings loaded:', response.data)
    const org = response.data
    
    settings.orgId = org.Org_ID
    settings.orgName = org.Org_Name || ''
    settings.email = org.Email || ''
    settings.phone = org.Phone_Num || ''
    settings.address = org.Address || ''
    settings.regionId = org.Region_ID || null
    settings.orgTypeId = org.Org_Type_ID || null
    settings.numEmployees = org.Num_of_Employee || 0
    settings.themeColor = org.Theme_Color || '#ff6600'
    settings.logoPath = org.Logo_Path || null
    settings.logoMimeType = org.Logo_MIME_Type || 'image/png'
    
    loading.value = false
  } catch (error) {
    console.error('Error loading settings:', error)
    console.error('Error response data:', error.response?.data)
    console.error('Error response status:', error.response?.status)
    console.error('Error message:', error.message)
    errorMessage.value = error.response?.data?.error || error.message || 'Failed to load organization settings'
    loading.value = false
  }
}

const loadLookupData = async () => {
  try {
    const [regionsRes, typesRes] = await Promise.all([
      authStore.api.get('/lookup/regions'),
      authStore.api.get('/lookup/org-types')
    ])
    regions.value = regionsRes.data
    orgTypes.value = typesRes.data
  } catch (error) {
    console.error('Error loading lookup data:', error)
  }
}

const handleLogoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      settings.logoPath = e.target.result.split(',')[1] // Get base64 without data URL prefix
      settings.logoMimeType = file.type || 'image/png'
    }
    reader.readAsDataURL(file)
  } catch (error) {
    errorMessage.value = 'Failed to upload logo'
  }
}

const saveAllSettings = async () => {
  try {
    saving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const payload = {
      orgName: settings.orgName,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      regionId: settings.regionId ? parseInt(settings.regionId) : null,
      orgTypeId: settings.orgTypeId ? parseInt(settings.orgTypeId) : null,
      numEmployees: settings.numEmployees ? parseInt(settings.numEmployees) : 0,
      themeColor: settings.themeColor,
      logoPath: settings.logoPath,
      logoMimeType: settings.logoMimeType
    }

    console.log('Sending payload:', payload)
    const response = await authStore.api.put(`/org/${settings.orgId}`, payload)
    console.log('Response:', response)
    successMessage.value = '✅ All settings saved successfully!'
    
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

    saving.value = false
  } catch (error) {
    console.error('Error saving settings:', error)
    console.error('Error response:', error.response)
    errorMessage.value = error.response?.data?.error || 'Failed to save settings'
    saving.value = false
  }
}

onMounted(async () => {
  console.log('Settings page mounted')
  console.log('Current user:', authStore.user)
  console.log('Current org_id:', authStore.org_id)
  console.log('Token:', authStore.token)
  
  // Wait a moment to ensure auth store is fully initialized
  await new Promise(resolve => setTimeout(resolve, 100))
  
  console.log('After delay - org_id:', authStore.org_id)
  
  loadOrganizationSettings()
  loadLookupData()
})
</script>
