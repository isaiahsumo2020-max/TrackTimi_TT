<template>
  <!-- Settings Modal -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click="$emit('close')"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-8 border-b border-slate-200">
        <h2 class="text-3xl font-black text-primary-600">Settings</h2>
        <button
          @click="$emit('close')"
          class="text-slate-400 hover:text-slate-600"
        >
          <XIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Sidebar Menu -->
        <div class="w-48 bg-slate-50 border-r border-slate-200 overflow-y-auto">
          <nav class="p-4 space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-2',
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow'
                  : 'text-slate-700 hover:bg-slate-200'
              ]"
            >
              <component :is="getTabIcon(tab.id)" class="w-4 h-4" />
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto p-8">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="space-y-6 max-w-2xl">
            <h3 class="text-xl font-black text-slate-900">Profile Information</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input
                  v-model="editSettings.profile.fullName"
                  type="text"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Email</label>
                <input
                  v-model="editSettings.profile.email"
                  type="email"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                <input
                  v-model="editSettings.profile.phone"
                  type="tel"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Address</label>
                <textarea
                  v-model="editSettings.profile.address"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                ></textarea>
              </div>

              <div class="pt-4 border-t border-slate-200">
                <p class="text-xs text-slate-500 mb-4">Role: {{ editSettings.profile.role }}</p>
                <p class="text-xs text-slate-500">Joined: {{ formatDate(editSettings.profile.joinedDate) }}</p>
              </div>

              <button
                @click="saveSettings('profile')"
                class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider"
              >
                💾 Save Profile
              </button>
            </div>
          </div>

          <!-- Password Tab -->
          <div v-else-if="activeTab === 'password'" class="space-y-6 max-w-2xl">
            <h3 class="text-xl font-black text-slate-900">Change Password</h3>

            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 flex items-start gap-3">
              <AlertTriangleIcon class="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-bold">Security Notice</p>
                <p class="mt-1">Use a strong password with uppercase, lowercase, numbers, and symbols.</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                <input
                  v-model="passwordData.currentPassword"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                <input
                  v-model="passwordData.newPassword"
                  type="password"
                  @input="checkPasswordStrength"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <!-- Password Strength Indicator -->
                <div class="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all"
                    :class="passwordStrength.color"
                    :style="{ width: passwordStrength.percent + '%' }"
                  ></div>
                </div>
                <p class="text-xs text-slate-600 mt-1">{{ passwordStrength.label }}</p>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                <input
                  v-model="passwordData.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <button
                @click="changePassword"
                class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider"
              >
                🔐 Change Password
              </button>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div v-else-if="activeTab === 'preferences'" class="space-y-6 max-w-2xl">
            <h3 class="text-xl font-black text-slate-900">Preferences</h3>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Theme</label>
                <select
                  v-model="editSettings.preferences.theme"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Language</label>
                <select
                  v-model="editSettings.preferences.language"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="es">🇪🇸 Español</option>
                  <option value="fr">🇫🇷 Français</option>
                  <option value="de">🇩🇪 Deutsch</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Timezone</label>
                <select
                  v-model="editSettings.preferences.timezone"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Africa/Monrovia">Africa/Monrovia (GMT)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Date Format</label>
                <select
                  v-model="editSettings.preferences.dateFormat"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="editSettings.preferences.sidebarCollapsed"
                    class="w-5 h-5 rounded"
                  />
                  <span class="text-sm font-bold text-slate-700">Collapse Sidebar by Default</span>
                </label>

                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="editSettings.preferences.compactView"
                    class="w-5 h-5 rounded"
                  />
                  <span class="text-sm font-bold text-slate-700">Compact View</span>
                </label>
              </div>

              <button
                @click="saveSettings('preferences')"
                class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider"
              >
                💾 Save Preferences
              </button>
            </div>
          </div>

          <!-- Branding Tab -->
          <div v-else-if="activeTab === 'branding'" class="space-y-6 max-w-2xl">
            <h3 class="text-xl font-black text-slate-900">Organization Branding</h3>

            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
              <p class="font-bold">🎨 Company Logo</p>
              <p class="mt-1">Upload your organization logo. It will be displayed in the TrackTimi admin dashboard.</p>
            </div>

            <div class="space-y-4">
              <!-- Current Logo Display -->
              <div class="bg-slate-50 rounded-lg p-6 border-2 border-dashed border-slate-300 text-center">
                <div v-if="currentLogo" class="mb-4">
                  <img :src="currentLogo" alt="Organization Logo" class="w-32 h-32 object-cover rounded-lg mx-auto border border-slate-300" />
                  <p class="text-xs text-slate-600 mt-3">Current Logo Preview</p>
                </div>
                <div v-else class="text-slate-500 py-8 text-center">
                  <ImageIcon class="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p class="font-bold">No logo uploaded yet</p>
                </div>
              </div>

              <!-- Upload Form -->
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-3">Upload Logo</label>
                <label class="flex items-center justify-center w-full px-4 py-4 rounded-lg border-2 border-dashed border-primary-300 bg-primary-50 cursor-pointer hover:bg-primary-100 transition">
                  <div class="text-center">
                    <UploadIcon class="w-8 h-8 text-primary-400 mx-auto mb-2" />
                    <p class="text-sm font-bold text-primary-600">Click to upload or drag and drop</p>
                    <p class="text-xs text-slate-600">PNG, JPEG, GIF, WebP (Max 500KB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleLogoUpload"
                  />
                </label>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button
                  @click="saveOrgLogo"
                  :disabled="!selectedLogoFile"
                  class="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SaveIcon class="w-4 h-4 inline mr-1" />
                  Save Logo
                </button>
                <button
                  v-if="currentLogo"
                  @click="deleteLogo"
                  class="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all text-sm uppercase tracking-wider"
                >
                  <TrashIcon class="w-4 h-4 inline mr-1" />
                  Delete Logo
                </button>
              </div>

              <!-- File info -->
              <p v-if="selectedLogoFile" class="text-xs text-slate-600 text-center">
                Selected: {{ selectedLogoFile.name }} ({{ (selectedLogoFile.size / 1024).toFixed(2) }}KB)
              </p>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-else-if="activeTab === 'notifications'" class="space-y-6 max-w-2xl">
            <h3 class="text-xl font-black text-slate-900">Notification Settings</h3>

            <div class="space-y-3">
              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.notifications.emailOnOrgCreation"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">Email on Organization Creation</p>
                  <p class="text-xs text-slate-600">Receive email when new organization signs up</p>
                </div>
              </label>

              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.notifications.emailOnHighAbsence"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">Email on High Absence Rate</p>
                  <p class="text-xs text-slate-600">Alert when organizations have high absence rates</p>
                </div>
              </label>

              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.notifications.emailOnSubscriptionExpiry"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">Email on Subscription Expiry</p>
                  <p class="text-xs text-slate-600">Remind about expiring subscriptions</p>
                </div>
              </label>

              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.notifications.emailOnSecurityIssues"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">Email on Security Issues</p>
                  <p class="text-xs text-slate-600">Critical security alerts</p>
                </div>
              </label>

              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.notifications.pushNotifications"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">Push Notifications</p>
                  <p class="text-xs text-slate-600">Real-time browser notifications</p>
                </div>
              </label>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Email Digest Frequency</label>
              <select
                v-model="editSettings.notifications.emailDigestFrequency"
                class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="realtime">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <button
              @click="saveSettings('notifications')"
              class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider"
            >
              💾 Save Notifications
            </button>
          </div>

          <!-- Security Tab -->
          <div v-else-if="activeTab === 'security'" class="space-y-6 max-w-2xl">
            <h3 class="text-xl font-black text-slate-900">Security Settings</h3>

            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
              <p class="font-bold">🔒 Your Account Security</p>
              <p class="mt-1">These settings help protect your superadmin account</p>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Session Timeout (minutes)</label>
                <input
                  v-model.number="editSettings.security.sessionTimeout"
                  type="number"
                  min="10"
                  max="480"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 mb-2">Password Expiry (days)</label>
                <input
                  v-model.number="editSettings.security.passwordExpiryDays"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p class="text-xs text-slate-600 mt-1">0 = Never expires</p>
              </div>

              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.security.twoFactorAuth"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">Two-Factor Authentication</p>
                  <p class="text-xs text-slate-600">Enable 2FA for extra security</p>
                </div>
              </label>

              <label class="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <input
                  type="checkbox"
                  v-model="editSettings.security.ipWhitelist"
                  class="w-5 h-5 rounded"
                />
                <div>
                  <p class="font-bold text-slate-900">IP Whitelist</p>
                  <p class="text-xs text-slate-600">Only allow login from specific IPs</p>
                </div>
              </label>

              <button
                @click="saveSettings('security')"
                class="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-all text-sm uppercase tracking-wider"
              >
                💾 Save Security Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-slate-200 p-8 bg-slate-50 flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all text-sm uppercase tracking-wider"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { settingsApi } from '@/services/settingsApi'
import orgApi, { uploadOrgLogo, deleteOrgLogo } from '@/services/orgApi'
import { useAuthStore } from '@/stores/auth'
import { AlertTriangleIcon, ImageIcon, UploadIcon, SaveIcon, TrashIcon, UserIcon, LockIcon, SettingsIcon, PaletteIcon, BellIcon, ShieldIcon, XIcon } from 'lucide-vue-next'

const emit = defineEmits(['close'])
const props = defineProps({
  isOpen: Boolean
})

const authStore = useAuthStore()

const activeTab = ref('profile')
const selectedLogoFile = ref(null)
const currentLogo = ref(null)
const editSettings = reactive({
  profile: {},
  preferences: {},
  notifications: {},
  security: {}
})
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const passwordStrength = reactive({
  percent: 0,
  label: 'Weak',
  color: 'bg-red-500'
})

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'password', label: 'Password' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'branding', label: 'Branding' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' }
]

const getTabIcon = (tabId) => {
  const iconMap = {
    profile: UserIcon,
    password: LockIcon,
    preferences: SettingsIcon,
    branding: PaletteIcon,
    notifications: BellIcon,
    security: ShieldIcon
  }
  return iconMap[tabId] || SettingsIcon
}

const fetchSettings = async () => {
  try {
    console.log('📡 Fetching settings...')
    const response = await settingsApi.getSettings()
    console.log('✅ Settings loaded:', response.data)
    
    const settings = response.data?.settings || {}
    Object.assign(editSettings, settings)
    
    // Also fetch organization settings to get the current logo
    try {
      const orgSettingsResponse = await orgApi.get('/settings')
      if (orgSettingsResponse.data?.Logo_Path) {
        currentLogo.value = orgSettingsResponse.data.Logo_Path
        console.log('✅ Current logo loaded:', currentLogo.value)
      }
    } catch (orgError) {
      console.warn('⚠️ Could not fetch organization settings:', orgError)
    }
  } catch (error) {
    console.error('❌ Failed to fetch settings:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data?.error || error.message,
      fullError: error
    })
  }
}

const saveSettings = async (category) => {
  try {
    console.log(`💾 Saving ${category} settings:`, editSettings[category])
    
    const response = await settingsApi.updateSettings(category, editSettings[category])
    
    console.log(`✅ ${category} saved successfully`)
    // Show success toast
    alert(`${category} settings saved successfully!`)
  } catch (error) {
    console.error('❌ Failed to save settings:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      error: error.response?.data?.error || error.message,
      fullError: error
    })
    
    // Show detailed error message
    const errorMessage = error.response?.data?.error || 
                        error.response?.statusText || 
                        error.message || 
                        'Failed to save settings'
    alert(`Failed to save settings: ${errorMessage}`)
  }
}

const changePassword = async () => {
  if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
    alert('Please fill in all password fields')
    return
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    alert('New password and confirmation do not match')
    return
  }

  if (passwordData.newPassword.length < 8) {
    alert('Password must be at least 8 characters long')
    return
  }

  try {
    await settingsApi.changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    )
    alert('Password changed successfully!')
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
  } catch (error) {
    console.error('Failed to change password:', error)
    alert(error.response?.data?.error || 'Failed to change password')
  }
}

const checkPasswordStrength = () => {
  const password = passwordData.newPassword
  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z\d]/.test(password)) strength++

  passwordStrength.percent = (strength / 5) * 100

  if (strength < 2) {
    passwordStrength.label = 'Weak'
    passwordStrength.color = 'bg-red-500'
  } else if (strength < 4) {
    passwordStrength.label = 'Fair'
    passwordStrength.color = 'bg-amber-500'
  } else if (strength < 5) {
    passwordStrength.label = 'Strong'
    passwordStrength.color = 'bg-primary-500'
  } else {
    passwordStrength.label = 'Very Strong'
    passwordStrength.color = 'bg-primary-600'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Logo Upload Handlers
const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    alert('Invalid image type. Allowed: PNG, JPEG, GIF, WebP')
    return
  }

  // Validate file size (max 500KB)
  if (file.size > 500 * 1024) {
    alert('Image size exceeds 500KB limit')
    return
  }

  selectedLogoFile.value = file

  // Show preview
  const reader = new FileReader()
  reader.onload = (e) => {
    currentLogo.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveOrgLogo = async () => {
  if (!selectedLogoFile.value) {
    alert('Please select a logo file first')
    return
  }

  try {
    // Convert file to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const logoData = e.target.result
      
      try {
        await uploadOrgLogo(logoData, selectedLogoFile.value.type)
        console.log('✅ Logo uploaded successfully')
        
        // Fetch updated organization settings to get the new logo path
        try {
          const settingsResponse = await orgApi.get('/settings')
          console.log('✅ Organization settings fetched:', settingsResponse.data)
          
          // Update authStore with new logo
          if (settingsResponse.data?.Logo_Path) {
            authStore.user.orgLogo = settingsResponse.data.Logo_Path
            console.log('✅ AuthStore updated with new logo')
          }
        } catch (settingsError) {
          console.error('⚠️ Could not fetch updated settings:', settingsError)
        }
        
        alert('Logo uploaded successfully!')
        selectedLogoFile.value = null
      } catch (error) {
        console.error('❌ Logo upload failed:', error)
        alert('Failed to upload logo: ' + (error.response?.data?.error || error.message))
      }
    }
    reader.readAsDataURL(selectedLogoFile.value)
  } catch (error) {
    console.error('❌ Error processing logo:', error)
    alert('Error processing logo: ' + error.message)
  }
}

const deleteLogo = async () => {
  if (!confirm('Are you sure you want to delete your organization logo?')) return

  try {
    await deleteOrgLogo()
    console.log('✅ Logo deleted successfully')
    
    // Fetch updated organization settings to clear the logo
    try {
      const settingsResponse = await orgApi.get('/settings')
      console.log('✅ Organization settings fetched after delete:', settingsResponse.data)
      
      // Update authStore - clear the logo
      authStore.user.orgLogo = null
      console.log('✅ AuthStore updated - logo cleared')
    } catch (settingsError) {
      console.error('⚠️ Could not fetch updated settings:', settingsError)
    }
    
    currentLogo.value = null
    selectedLogoFile.value = null
    alert('Logo deleted successfully!')
  } catch (error) {
    console.error('❌ Logo delete failed:', error)
    alert('Failed to delete logo: ' + (error.response?.data?.error || error.message))
  }
}

onMounted(() => {
  if (props.isOpen) {
    fetchSettings()
  }
})
</script>
