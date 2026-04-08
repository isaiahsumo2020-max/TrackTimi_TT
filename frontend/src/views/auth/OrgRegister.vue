<template>
  <div class="min-h-screen bg-[#FDFDFD] flex items-center justify-center px-6 py-20 relative overflow-hidden font-sans">
    
    <!-- Background Decorative Blobs -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/50 rounded-full blur-[100px]"></div>
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-slate-100 rounded-full blur-[100px]"></div>

    <div class="w-full max-w-3xl relative z-10 animate-in fade-in zoom-in duration-700">
      <!-- Header -->
      <div class="text-center mb-12 space-y-3">
        <router-link to="/" class="inline-flex items-center space-x-3 group mb-4">
          <div class="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-200 group-hover:rotate-6 transition-transform">>
            <ZapIcon class="w-7 h-7 text-white fill-white" />
          </div>
          <span class="text-2xl font-black tracking-tighter text-slate-900">TrackTimi<span class="text-primary-600">.</span></span>
        </router-link>
        <h2 class="text-4xl font-black tracking-tight text-slate-900">Establish Workspace</h2>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Initialize your organization node</p>
      </div>

      <!-- Registration Card -->
      <div class="bg-white rounded-2xl border border-primary-200 p-10 md:p-16 shadow-2xl shadow-primary-100/50">
        <form @submit.prevent="handleRegister" class="space-y-12">
          
          <!-- Section 1: Identity Matrix -->
          <div class="space-y-8">
            <div class="flex items-center space-x-3 border-l-4 border-primary-600 pl-4">
              <BuildingIcon class="w-5 h-5 text-primary-600" />
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Identity Matrix</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Organization Name</label>
                <input v-model="form.orgName" type="text" required placeholder="e.g. Acme Corp"
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Network Domain</label>
                <input v-model="form.orgDomain" type="text" required placeholder="acme.tracktimi.com" @input="onDomainInput"
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold text-primary-600 font-mono" />
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Organization Type</label>
                <select v-model="form.orgTypeId" required
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold text-slate-700">
                  <option value="">Select Sector</option>
                  <option v-for="type in organizationTypes" :key="type.Org_Type_ID" :value="type.Org_Type_ID">{{ type.Type_Name }}</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Workspace Capacity</label>
                <select v-model="form.orgSize" required
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold text-slate-700">
                  <option value="">Select Range</option>
                  <option value="startup">Startup (1-25)</option>
                  <option value="small">Small (26-100)</option>
                  <option value="medium">Medium (101-500)</option>
                  <option value="large">Large (501+)</option>
                </select>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest text-right">Regional Node</label>
              <select v-model="form.regionId" required
                class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 transition-all text-sm font-bold text-slate-700">
                <option value="">Select County/Region</option>
                <option v-for="region in regions" :key="region.Region_ID" :value="region.Region_ID">{{ region.Region_Name }}</option>
              </select>
            </div>
          </div>

          <!-- Section 2: Master Credentials -->
          <div class="space-y-8 pt-10 border-t border-primary-200">
            <div class="flex items-center space-x-3 border-l-4 border-primary-600 pl-4">
              <ShieldCheckIcon class="w-5 h-5 text-primary-600" />
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-widest">Master Credentials</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">First Name</label>
                <input v-model="form.firstName" type="text" required placeholder="John"
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 text-sm font-bold" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Surname</label>
                <input v-model="form.lastName" type="text" required placeholder="Doe"
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 text-sm font-bold" />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Primary SuperAdmin Email</label>
              <input v-model="form.email" type="email" required placeholder="admin@company.com"
                class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 text-sm font-bold" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Passphrase</label>
                <input v-model="form.password" type="password" required minlength="8" placeholder="••••••••"
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 text-sm font-bold" />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Confirm Passphrase</label>
                <input v-model="form.confirmPassword" type="password" required placeholder="••••••••"
                  class="w-full px-6 py-4 rounded-lg bg-white border border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-500 text-sm font-bold" />
              </div>
            </div>
          </div>

          <!-- Consent & Submit -->
          <div class="space-y-8">
            <label class="flex items-start space-x-4 p-6 bg-primary-50 rounded-xl border border-primary-200 cursor-pointer hover:bg-primary-100 transition-colors group">
              <input v-model="form.agreeToTerms" type="checkbox" required
                class="mt-1 w-5 h-5 rounded border-primary-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer" />
              <span class="text-[11px] font-bold text-slate-600 leading-relaxed uppercase tracking-wider group-hover:text-slate-700">
                I authorize the creation of this node and agree to the 
                <a href="#" class="text-primary-600 underline">Operational Protocols</a> and 
                <a href="#" class="text-primary-600 underline">Privacy Matrix</a>.
              </span>
            </label>

            <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg text-center animate-pulse flex items-center justify-center gap-2">
              <AlertTriangleIcon class="w-4 h-4" /> {{ errorMessage }}
            </div>

            <button type="submit" :disabled="isSubmitting || !form.agreeToTerms || !isFormValid"
              class="w-full py-6 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary-100 transition-all active:scale-[0.98] disabled:opacity-40 flex items-center justify-center">
              <Loader2Icon v-if="isSubmitting" class="w-5 h-5 animate-spin mr-3" />
              <span>{{ isSubmitting ? 'Initializing Node...' : 'Establish Workspace' }}</span>
            </button>
          </div>
        </form>
      </div>

      <p class="mt-12 text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        Existing Authority?
        <router-link to="/login" class="text-primary-600 hover:text-primary-800 ml-1">Access Terminal</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { 
  ZapIcon, BuildingIcon,
  ShieldCheckIcon, Loader2Icon, AlertTriangleIcon 
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  orgName: '',
  orgDomain: '',
  orgTypeId: '',
  orgSize: '',
  regionId: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const regions = ref([])
const organizationTypes = ref([])

const isFormValid = computed(() => {
  return form.orgName.trim().length > 2 &&
    form.orgDomain.trim().length > 3 &&
    form.orgTypeId &&
    form.firstName.trim().length > 1 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.confirmPassword
})

const onDomainInput = () => { }

watch(() => form.orgName, (name) => {
  if (!name) return
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
  form.orgDomain = slug ? `${slug}.tracktimi.com` : ''
})

onMounted(async () => {
  // Fetch logic from your API
  try {
    const r1 = await fetch('/api/lookup/regions')
    regions.value = await r1.json()
    const r2 = await fetch('/api/lookup/org-types')
    organizationTypes.value = await r2.json()
  } catch (e) {
     // Fallbacks if backend is not ready
     regions.value = [{ Region_ID: 1, Region_Name: 'Montserrado' }]
     organizationTypes.value = [{ Org_Type_ID: 4, Type_Name: 'Company' }]
  }
})

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Credential mismatch'
    return
  }
  isSubmitting.value = true
  try {
    const result = await authStore.registerOrg({
      orgName: form.orgName,
      orgDomain: form.orgDomain,
      orgSlug: form.orgDomain.split('.')[0],
      orgTypeId: form.orgTypeId,
      regionId: form.regionId,
      adminName: `${form.firstName} ${form.lastName}`,
      adminEmail: form.email,
      adminPassword: form.password
    })

    if (result.success) {
      // Redirect to email verification page instead of login
      router.push('/verify-email')
    }
    else errorMessage.value = result.error
  } catch (error) {
    errorMessage.value = 'Node Connection Refused'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>
