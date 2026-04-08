<template>
  <div class="p-6 lg:p-12 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
    
    <!-- Premium Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <p class="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-1">Configuration</p>
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">Workspace Settings</h1>
        <p class="text-sm text-slate-400 font-medium mt-1">Configure your organization's identity and security rules.</p>
      </div>
      <button @click="saveAllSettings" :disabled="saving" 
        class="bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-lg font-black text-xs uppercase shadow-xl shadow-primary-100 transition-all active:scale-95 flex items-center">
        <SaveIcon v-if="!saving" class="w-4 h-4 mr-2" />
        {{ saving ? 'Syncing...' : 'Save Changes' }}
      </button>
    </div>

    <!-- Main Grid -->
    <div class="grid lg:grid-cols-3 gap-8">
      
      <!-- Column 1: Organization & Contact -->
      <div class="lg:col-span-2 space-y-8">
        <div class="bg-white p-10 rounded-2xl border border-primary-200 shadow-sm space-y-8">
          <div class="flex items-center space-x-3">
            <BuildingIcon class="w-5 h-5 text-primary-500" />
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">Business Identity</h2>
          </div>

          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Organization Name</label>
              <input v-model="settings.orgName" class="w-full p-4 bg-white border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Official Email</label>
              <input v-model="settings.email" type="email" class="w-full p-4 bg-white border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Support Phone</label>
              <input v-model="settings.phone" class="w-full p-4 bg-white border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-2">Headquarters Address</label>
              <input v-model="settings.address" class="w-full p-4 bg-white border border-primary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <!-- Security & Rules -->
        <div class="bg-white p-10 rounded-2xl border border-primary-200 shadow-sm space-y-8">
          <div class="flex items-center space-x-3">
            <ShieldCheckIcon class="w-5 h-5 text-green-500" />
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">Governance & Security</h2>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8">
            <div class="space-y-4">
              <label class="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors border border-primary-200">
                <input type="checkbox" v-model="settings.requireGPS" class="w-4 h-4 rounded text-primary-600" />
                <span class="text-xs font-bold text-slate-700">Enforce GPS Geofencing</span>
              </label>
              <label class="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg cursor-pointer hover:bg-primary-100 transition-colors border border-primary-200">
                <input type="checkbox" v-model="settings.deviceLockdown" class="w-4 h-4 rounded text-primary-600" />
                <span class="text-xs font-bold text-slate-700">Device Identity Lockdown</span>
              </label>
            </div>
            <div class="bg-primary-100 p-6 rounded-xl border border-primary-200">
              <p class="text-[9px] font-black text-primary-600 uppercase mb-2">Active Workspace Seats</p>
              <h3 class="text-xl font-black text-slate-900">{{ settings.numEmployees }} Employees</h3>
              <p class="text-xs text-slate-500 mt-1">Managed via Enterprise SaaS</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2: Branding & Appearance -->
      <div class="space-y-8">
        <div class="bg-white p-10 rounded-2xl border border-primary-200 shadow-sm space-y-8">
          <div class="flex items-center space-x-3">
            <PaletteIcon class="w-5 h-5 text-primary-500" />
            <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest">Branding</h2>
          </div>

          <div class="space-y-6 text-center">
            <div class="relative w-32 h-32 mx-auto">
              <!-- Show Logo -->
              <div v-if="settings.logoPath" class="w-full h-full rounded-2xl overflow-hidden border-4 border-primary-100 shadow-inner">
                <img :src="`data:${settings.logoMimeType || 'image/png'};base64,${settings.logoPath}`" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-full bg-primary-100 rounded-2xl flex items-center justify-center text-primary-400 border border-primary-200">
                <ImageIcon class="w-8 h-8" />
              </div>
              <!-- Upload Trigger -->
              <label class="absolute -bottom-2 -right-2 p-3 bg-primary-600 rounded-xl text-white cursor-pointer shadow-lg hover:bg-primary-700 hover:scale-110 transition-all">
                <CameraIcon class="w-4 h-4" />
                <input type="file" @change="handleLogoUpload" hidden accept="image/*" />
              </label>
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase">Brand Theme Color</label>
              <div class="flex items-center space-x-3 justify-center">
                <input type="color" v-model="settings.themeColor" class="w-12 h-12 rounded-xl border border-primary-200 p-0 cursor-pointer" />
                <span class="text-sm font-mono font-bold text-slate-900 uppercase">{{ settings.themeColor }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- System Stats Mini Card -->
        <div class="bg-slate-900 p-8 rounded-2xl text-white shadow-2xl space-y-4 overflow-hidden relative border border-slate-800">
           <div class="relative z-10">
             <h3 class="text-xs font-black uppercase opacity-40 mb-4">Workspace Pulse</h3>
             <div class="flex justify-between">
                <div>
                  <p class="text-2xl font-black">{{ settings.numEmployees }}</p>
                  <p class="text-[9px] font-bold uppercase opacity-60">Provisioned</p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-black text-green-400">Live</p>
                  <p class="text-[9px] font-bold uppercase opacity-60">Status</p>
                </div>
             </div>
           </div>
           <ZapIcon class="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
        </div>
      </div>
    </div>

    <!-- Floating Success Message -->
    <Transition name="slide-up">
      <div v-if="successMessage" class="fixed bottom-10 right-10 px-8 py-4 bg-green-500 text-white rounded-lg font-black text-xs shadow-2xl z-50 uppercase tracking-widest flex items-center">
        <CheckIcon class="w-4 h-4 mr-2" />
        {{ successMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '@/utils/api'
import { 
  SaveIcon, BuildingIcon, PaletteIcon, 
  ShieldCheckIcon, CameraIcon, ImageIcon, 
  ZapIcon, CheckIcon 
} from 'lucide-vue-next'

const saving = ref(false)
const successMessage = ref('')

const settings = reactive({
  orgName: '',
  email: '',
  phone: '',
  address: '',
  themeColor: '#4f46e5',
  logoPath: null,
  logoMimeType: 'image/png',
  requireGPS: true,
  deviceLockdown: true,
  numEmployees: 0
})

const loadSettings = async () => {
  try {
    const res = await api.get('/org/settings')
    Object.assign(settings, {
      orgName: res.data.Org_Name,
      email: res.data.Email,
      phone: res.data.Phone_Num,
      address: res.data.Address,
      themeColor: res.data.Theme_Color || '#4f46e5',
      logoPath: res.data.Logo_Path,
      logoMimeType: res.data.Logo_MIME_Type,
      numEmployees: res.data.Num_of_Employee
    })
  } catch (e) { console.error("Failed to load settings from DB") }
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    // Stores only the base64 string
    settings.logoPath = e.target.result.split(',')[1]
    settings.logoMimeType = file.type
  }
  reader.readAsDataURL(file)
}

const saveAllSettings = async () => {
  saving.value = true
  try {
    // 1. Save permanently to Backend (SQLite)
    await api.put('/org/settings', settings)
    
    // 2. Update LocalStorage so the UI reflects changes immediately without re-login
    const userString = localStorage.getItem('user')
    if (userString) {
      const userObj = JSON.parse(userString)
      userObj.orgName = settings.orgName
      userObj.orgLogo = settings.logoPath
      localStorage.setItem('user', JSON.stringify(userObj))
    }

    successMessage.value = "Identity Synchronized Permanently"
    setTimeout(() => successMessage.value = '', 4000)
    
  } catch (e) { 
    alert("Database update failed. Check backend logs.") 
  } finally { 
    saving.value = false 
  }
}

onMounted(loadSettings)
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.4s ease; }
.slide-up-enter-from { transform: translateY(20px); opacity: 0; }
.slide-up-leave-to { transform: translateY(-20px); opacity: 0; }
</style>
