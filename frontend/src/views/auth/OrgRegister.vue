<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12 overflow-hidden bg-gradient-to-br from-slate-50 to-white">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Create your account</h2>
        <p class="mt-2 text-base text-slate-600">Register your organization and start managing attendance</p>
      </div>

      <!-- Registration Card -->
      <div class="bg-white rounded-2xl border border-orange-400 p-8 shadow-sm">
        <form @submit.prevent="handleRegister" class="flex flex-col gap-6">
          <!-- Organization Section -->
          <div class="space-y-4">
            <h3
              class="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1 border-l-4 border-orange-500 pl-3">
              Organization Details</h3>

            <!-- Organization Name -->
            <div>
              <label for="orgName" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Name <span class="text-orange-600">*</span>
              </label>
              <input id="orgName" v-model="form.orgName" type="text" required placeholder="Acme Corporation"
                class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
            </div>

            <!-- Organization Domain -->
            <div>
              <label for="orgDomain" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Domain <span class="text-orange-600">*</span>
              </label>
              <input id="orgDomain" v-model="form.orgDomain" type="text" required placeholder="acme.tracktimi.com"
                @input="onDomainInput"
                class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
              <p class="text-xs text-slate-500 mt-1">
                Domain is auto-generated from organization name, but you can customize it.
              </p>
            </div>

            <!-- Organization Type -->
            <div>
              <label for="orgType" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Type <span class="text-orange-600">*</span>
              </label>
              <select id="orgType" v-model="form.orgTypeId" required
                class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-base">
                <option value="">Select organization type</option>
                <option v-for="type in organizationTypes" :key="type.Org_Type_ID" :value="type.Org_Type_ID">
                  {{ type.Type_Name }}
                </option>
              </select>
            </div>

            <!-- Organization Size -->
            <div>
              <label for="orgSize" class="block text-sm font-medium text-slate-700 mb-1.5">
                Organization Size <span class="text-orange-600">*</span>
              </label>
              <select id="orgSize" v-model="form.orgSize" required
                class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-base">
                <option value="">Select your organization size</option>
                <option value="startup">Startup (1-25 employees)</option>
                <option value="small">Small (26-100 employees)</option>
                <option value="medium">Medium (101-500 employees)</option>
                <option value="large">Large (501-1000 employees)</option>
                <option value="enterprise">Enterprise (1000+ employees)</option>
              </select>
            </div>

            <!-- Region/County -->
            <div>
              <label for="region" class="block text-sm font-medium text-slate-700 mb-1.5">
                Region (County) <span class="text-orange-600">*</span>
              </label>
              <select id="region" v-model="form.regionId" required
                class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all bg-white text-base">
                <option value="">Select your region</option>
                <option v-for="region in regions" :key="region.Region_ID" :value="region.Region_ID">
                  {{ region.Region_Name }}
                </option>
              </select>
            </div>

            <!-- Location (GPS) - MATCHES SCREENSHOT -->
            <!-- GPS with REFRESH BUTTON -->
            <div>
              <label class="flex text-sm font-medium text-slate-700 mb-2.5 items-center justify-between">
                Organization Location <span class="text-orange-600">*</span>
                <button @click="refreshLocation" :disabled="locationLoading"
                  class="flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-sm disabled:bg-gray-400">
                  {{ locationLoading ? '📍' : '🔄' }} {{ locationLoading ? 'Getting...' : 'Refresh' }}
                </button>
              </label>
              <div class="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-sm">📍 {{ locationStatus }}</span>
                  <span class="text-green-600 text-xs font-bold">{{ accuracy }}</span>
                </div>
                <div class="font-mono text-xs bg-white px-3 py-2 rounded border">
                  Lat: {{ form.location.latitude.toFixed(6) }} | Long: {{ form.location.longitude.toFixed(6) }}
                </div>
                <p class="text-xs text-slate-600 mt-1">{{ form.location.address }}</p>
              </div>
            </div>


            <!-- Logo Upload -->
            <div>
              <label for="logo" class="block text-sm font-medium text-slate-700 mb-1.5">Organization Logo
                (Optional)</label>
              <div class="space-y-3">
                <div class="flex items-center gap-4">
                  <div v-if="logoPreview"
                    class="w-20 h-20 rounded-lg border-2 border-orange-400 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <img :src="logoPreview" :alt="form.orgName" class="w-full h-full object-cover" />
                  </div>
                  <div v-else
                    class="w-20 h-20 rounded-lg border-2 border-dashed border-orange-400 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <span class="text-2xl text-slate-400">📷</span>
                  </div>
                  <div class="flex-1">
                    <input id="logo" type="file" accept="image/*" @change="handleLogoUpload"
                      class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 text-base file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
                    <p class="text-xs text-slate-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                  </div>
                </div>
                <button v-if="logoPreview" type="button" @click="clearLogo"
                  class="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">
                  ❌ Remove logo
                </button>
              </div>
            </div>

            <!-- Theme Color -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Primary Theme Color</label>
              <div class="flex gap-3 items-center">
                <input type="color" v-model="form.theme.primary"
                  class="h-12 w-16 cursor-pointer border-2 border-orange-400 rounded-lg shadow-sm" />
                <input v-model="form.theme.primary" type="text" placeholder="#ff6600" maxlength="7"
                  class="flex-1 px-4 py-3 rounded-lg border-2 border-orange-400 text-base placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all" />
                <button type="button" @click="generateRandomColor"
                  class="px-4 py-3 bg-orange-50 hover:bg-orange-100 border-2 border-orange-400 rounded-lg font-semibold text-orange-700 transition-all text-sm whitespace-nowrap">
                  🎨 Random
                </button>
              </div>
              <p class="text-xs text-slate-500 mt-1.5">Customize your dashboard appearance</p>
            </div>
          </div>

          <!-- Admin Account Section -->
          <div class="space-y-4 border-t border-orange-400 pt-6">
            <h3
              class="text-sm font-semibold text-slate-900 uppercase tracking-wider px-1 border-l-4 border-orange-500 pl-3">
              Admin Account</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name <span class="text-orange-600">*</span>
                </label>
                <input id="firstName" v-model="form.firstName" type="text" required placeholder="John"
                  class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name <span class="text-orange-600">*</span>
                </label>
                <input id="lastName" v-model="form.lastName" type="text" required placeholder="Doe"
                  class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address <span class="text-orange-600">*</span>
              </label>
              <input id="email" v-model="form.email" type="email" required autocomplete="email"
                placeholder="admin@company.com"
                class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="password" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Password <span class="text-orange-600">*</span>
                </label>
                <input id="password" v-model="form.password" type="password" required minlength="8"
                  placeholder="Min. 8 characters"
                  class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
              </div>
              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm Password <span class="text-orange-600">*</span>
                </label>
                <input id="confirmPassword" v-model="form.confirmPassword" type="password" required
                  placeholder="Repeat password"
                  class="w-full px-4 py-3 rounded-lg border-2 border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-base" />
              </div>
            </div>
          </div>

          <!-- Terms -->
          <div class="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border-2 border-orange-200">
            <input id="terms" v-model="form.agreeToTerms" type="checkbox" required
              class="mt-1 w-5 h-5 rounded border-orange-500 cursor-pointer accent-orange-500 flex-shrink-0" />
            <label for="terms" class="flex-1 text-sm text-slate-800 cursor-pointer select-none">
              I agree to the <a href="#" class="font-semibold text-orange-600 hover:text-orange-700">Terms &
                Conditions</a>
              and <a href="#" class="font-semibold text-orange-600 hover:text-orange-700">Privacy Policy</a> <span
                class="text-orange-600">*</span>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage"
            class="p-4 rounded-lg bg-red-50 border-2 border-red-200 text-red-800 text-sm animate-pulse">
            ⚠️ {{ errorMessage }}
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="isSubmitting || !form.agreeToTerms || !isFormValid"
            class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all border-2 border-orange-500 flex items-center justify-center">
            <span v-if="isSubmitting" class="animate-spin mr-2">⏳</span>
            {{ isSubmitting ? 'Creating Organization...' : 'Create Organization Account' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="mt-8 text-center text-sm text-slate-600">
        Already have an account?
        <router-link to="/login" class="font-semibold text-orange-600 hover:text-orange-700">
          Sign in here
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  orgName: '',
  orgDomain: '',
  orgTypeId: '',
  orgSize: '',
  regionId: '',
  logo: null,
  theme: {
    primary: '#FF6B6B', // Start with a default color
    darkMode: false
  },
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  location: {
    latitude: 6.315606,
    longitude: -10.807370,
    address: 'Monrovia Office'
  }
})

const logoPreview = ref(null)
const isSubmitting = ref(false)
const errorMessage = ref('')
const regions = ref([])
const organizationTypes = ref([])

// Domain auto-generation
const domainCustomized = ref(false)

// ADD these 3 lines AFTER your existing refs
const locationLoading = ref(false)
const locationStatus = ref('Monrovia Default')
const accuracy = ref('15m')


// Form validation
const isFormValid = computed(() => {
  return form.orgName.trim().length > 2 &&
    form.orgDomain.trim().length > 3 &&
    form.orgDomain.includes('.') &&
    form.orgTypeId &&
    form.orgSize &&
    form.regionId &&
    form.firstName.trim().length > 1 &&
    form.lastName.trim().length > 1 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword
})

// Fetch regions from API
const fetchRegions = async () => {
  try {
    const response = await fetch('/api/lookup/regions')
    const data = await response.json()
    regions.value = data || []
  } catch (error) {
    console.error('Failed to fetch regions:', error)
    // Fallback: set default regions
    regions.value = [
      { Region_ID: 1, Region_Name: 'Montserrado' },
      { Region_ID: 2, Region_Name: 'Margibi' },
      { Region_ID: 3, Region_Name: 'Grand Bassa' },
      { Region_ID: 4, Region_Name: 'Nimba' },
      { Region_ID: 5, Region_Name: 'Bong' },
      { Region_ID: 6, Region_Name: 'Lofa' },
      { Region_ID: 7, Region_Name: 'Bomi' },
      { Region_ID: 8, Region_Name: 'Grand Gedeh' },
      { Region_ID: 9, Region_Name: 'Rivercess' },
      { Region_ID: 10, Region_Name: 'Grand Cape Mount' }
    ]
  }
}

// Fetch organization types from API
const fetchOrganizationTypes = async () => {
  try {
    const response = await fetch('/api/lookup/org-types')
    const data = await response.json()
    organizationTypes.value = data || []
  } catch (error) {
    console.error('Failed to fetch organization types:', error)
    // Fallback: set default types
    organizationTypes.value = [
      { Org_Type_ID: 1, Type_Name: 'School' },
      { Org_Type_ID: 2, Type_Name: 'NGO' },
      { Org_Type_ID: 3, Type_Name: 'Training Center' },
      { Org_Type_ID: 4, Type_Name: 'Company' },
      { Org_Type_ID: 5, Type_Name: 'Government' },
      { Org_Type_ID: 6, Type_Name: 'Church' },
      { Org_Type_ID: 7, Type_Name: 'Hospital' }
    ]
  }
}

// Auto-generate domain from organization name
const normalizeDomain = (name) => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug ? `${slug}.tracktimi.com` : ''
}

const onDomainInput = () => {
  domainCustomized.value = true
}

watch(
  () => form.orgName,
  (name) => {
    if (!name || domainCustomized.value) return
    form.orgDomain = normalizeDomain(name)
  }
)

// Load regions and organization types on component mount
onMounted(() => {
  fetchRegions()
  fetchOrganizationTypes()
})

const handleLogoUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errorMessage.value = 'File too large (max 2MB)'
    return
  }

  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please select an image file'
    return
  }

  form.logo = file
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearLogo = () => {
  logoPreview.value = null
  form.logo = null
  const fileInput = document.getElementById('logo')
  if (fileInput) fileInput.value = ''
}

const generateRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2', '#A8E6CF', '#FFD3B6', '#FFAAA5', '#FF8B94']
  form.theme.primary = colors[Math.floor(Math.random() * colors.length)]
}


// ADD these GPS functions BEFORE handleRegister()
const refreshLocation = async () => {
  locationLoading.value = true
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })


    form.location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      address: 'GPS Verified'
    }
    accuracy.value = `${Math.round(position.coords.accuracy)}m`
    locationStatus.value = 'Live GPS'
  } catch (error) {
    form.location = { latitude: 6.315606, longitude: -10.807370, accuracy: 15, address: 'Monrovia Default' }
    accuracy.value = '15m'
    locationStatus.value = 'Default Location'
  } finally {
    locationLoading.value = false
  }
}



const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  if (!form.agreeToTerms) {
    errorMessage.value = 'Please agree to terms and conditions'
    return
  }

  errorMessage.value = ''
  isSubmitting.value = true

  try {
    // Generate default color if not customized (very light off-white to orange spectrum)
    const generateDefaultColor = () => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2']
      return colors[Math.floor(Math.random() * colors.length)]
    }

    // Prepare logo data
    let logoBase64 = null
    let logoType = 'image/png'

    if (form.logo) {
      // Convert logo to base64 for transmission
      logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64String = e.target.result.split(',')[1]
          resolve(base64String)
        }
        reader.readAsDataURL(form.logo)
      })
      logoType = form.logo.type
    }

    // Ensure theme color is set
    if (!form.theme.primary || form.theme.primary === '') {
      form.theme.primary = generateDefaultColor()
    }

    // Call auth store with logo and theme
    const result = await authStore.registerOrg({
      orgName: form.orgName,
      orgDomain: form.orgDomain.toLowerCase().trim(),
      orgSlug: form.orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      orgTypeId: form.orgTypeId,
      orgSize: form.orgSize,
      regionId: form.regionId,
      adminName: `${form.firstName} ${form.lastName}`,
      adminEmail: form.email,
      adminPassword: form.password,
      theme: form.theme,
      logo: logoBase64,
      logoType: logoType,
      location: form.location
    })

    if (result.success) {
      router.push('/login')
    } else {
      errorMessage.value = result.error || 'Registration failed'
    }
  } catch (error) {
    errorMessage.value = 'Network error. Please try again.'
    console.error('Registration error:', error)
  } finally {
    isSubmitting.value = false
  }
}

</script>
