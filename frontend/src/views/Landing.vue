<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-700">
    
    <!-- 1. NAVIGATION (Glassmorphism) -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center space-x-3 group cursor-pointer">
          <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-md shadow-primary-200 group-hover:rotate-6 transition-transform">
            <ZapIcon class="w-6 h-6 text-white fill-white" />
          </div>
          <span class="font-black text-2xl tracking-tighter text-slate-900">TrackTimi<span class="text-primary-600">.</span></span>
        </div>

        <div class="hidden lg:flex items-center space-x-10 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <a href="#features" class="hover:text-primary-600 transition-colors">Solutions</a>
          <a href="#geofence" class="hover:text-primary-600 transition-colors">Geofencing</a>
          <a href="#pricing" class="hover:text-primary-600 transition-colors">Pricing</a>
          <router-link to="/login" class="text-slate-900 hover:text-primary-600 transition-colors">Sign In</router-link>
        </div>

        <router-link to="/register-org" class="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-200 transition-all active:scale-95">
          Start Free Trial
        </router-link>
      </div>
    </nav>

    <!-- 2. HERO SECTION -->
    <header class="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        <div class="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div class="inline-flex items-center space-x-2 px-4 py-2 bg-primary-50 rounded-full border border-primary-100">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            <span class="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Live Workforce Intelligence</span>
          </div>

          <h1 class="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
            Every second <br />
            <span class="text-primary-600 italic">accounted for.</span>
          </h1>

          <p class="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
            The multi-tenant attendance SaaS for modern organizations. Enforce GPS boundaries, automate payroll logs, and monitor your workforce in high-definition.
          </p>

          <div class="flex flex-col sm:flex-row gap-4">
            <router-link to="/register-org" class="px-10 py-5 bg-primary-600 text-white rounded-lg font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all flex items-center justify-center">
              Deploy TrackTimi Free
              <ArrowRightIcon class="w-4 h-4 ml-2" />
            </router-link>
            <button class="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-lg font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        <!-- HERO ACTION: Live Preview & Simulated Pulse -->
        <div class="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div class="relative z-10 bg-slate-900 rounded-2xl p-4 shadow-3xl border-[12px] border-slate-800 aspect-video flex items-center justify-center overflow-hidden">
             <!-- Simulated Dashboard Image or Component -->
             <div class="w-full h-full bg-slate-800 rounded-xl p-6 space-y-4">
                <div class="h-4 w-1/3 bg-slate-700 rounded-full"></div>
                <div class="grid grid-cols-3 gap-4">
                  <div class="h-20 bg-primary-600/20 rounded-lg border border-primary-500/30"></div>
                  <div class="h-20 bg-slate-700 rounded-lg"></div>
                  <div class="h-20 bg-slate-700 rounded-lg"></div>
                </div>
                <div class="h-32 bg-slate-700 rounded-lg"></div>
             </div>
          </div>

          <!-- FLOATING LIVE PULSE (The "Cool" Feature) -->
          <Transition name="notification">
            <div v-if="currentPulse" class="absolute -top-4 -right-4 z-20 bg-white p-4 rounded-lg shadow-2xl border border-slate-100 flex items-center space-x-4 min-w-[240px]">
              <div v-if="currentPulse.avatar" class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img :src="`data:${currentPulse.avatarMimeType};base64,${currentPulse.avatar}`" :alt="currentPulse.name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-black text-xs">
                {{ currentPulse.name[0] }}
              </div>
              <div>
                <p class="text-[10px] font-black text-slate-900 leading-none">{{ currentPulse.name }}</p>
                <p class="text-[9px] font-bold text-green-500 uppercase mt-1">Clocked In · {{ currentPulse.location }}</p>
              </div>
            </div>
          </Transition>

          <!-- Background Blobs -->
          <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary-400/20 rounded-full blur-[100px]"></div>
          <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-400/20 rounded-full blur-[100px]"></div>
        </div>
      </div>
    </header>

    <!-- 3. TRUST COUNTER -->
    <section class="bg-white border-y border-slate-50 py-12">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div v-for="stat in heroStats" :key="stat.label">
            <p class="text-3xl font-black text-slate-900 tracking-tighter">{{ stat.value }}</p>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. GEOFENCING PREVIEW -->
    <section id="geofence" class="py-24 lg:py-32 bg-slate-50">
      <div class="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        <div class="order-2 lg:order-1">
            <div class="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 relative">
                <!-- Visual Map Representation -->
                <div class="bg-slate-50 rounded-xl h-[400px] overflow-hidden relative flex items-center justify-center">
                    <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <!-- The Geofence Circle -->
                    <div class="w-64 h-64 rounded-full border-4 border-primary-500 bg-primary-500/10 animate-pulse flex items-center justify-center">
                        <div class="w-2 h-2 bg-primary-600 rounded-full shadow-[0_0_20px_rgba(14,165,233,1)]"></div>
                    </div>
                    <div class="absolute bottom-10 left-10 right-10 bg-white p-4 rounded-lg shadow-xl flex items-center justify-between border border-slate-100">
                        <div class="flex items-center space-x-3">
                          <MapPinIcon class="w-5 h-5 text-primary-600" />
                          <span class="text-xs font-black uppercase tracking-tight">Main HQ Zone</span>
                        </div>
                        <span class="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase">Active</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="space-y-8 order-1 lg:order-2">
          <h2 class="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Built-in <br /><span class="text-primary-600">Location Intelligence.</span>
          </h2>
          <p class="text-slate-500 font-medium leading-relaxed">
            Eliminate "Buddy Punching" forever. Our GPS verification engine ensures that employees can only check in when they are within the authorized work zone defined by you.
          </p>
          <ul class="space-y-4">
            <li v-for="item in geoFeatures" :key="item" class="flex items-center space-x-3 text-sm font-bold text-slate-700 uppercase tracking-tight">
              <CheckCircleIcon class="w-5 h-5 text-primary-500" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 5. FEATURES GRID -->
    <section id="features" class="py-24 lg:py-32 bg-white">
      <div class="max-w-7xl mx-auto px-6 text-center mb-20 space-y-4">
        <p class="text-xs font-black text-primary-600 uppercase tracking-[0.4em]">Enterprise Core</p>
        <h2 class="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Everything in one pulse.</h2>
      </div>

      <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="feature in featureCards" :key="feature.title" class="group p-10 rounded-2xl bg-slate-50 hover:bg-slate-900 transition-all duration-500 border border-slate-100">
          <div class="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary-600 transition-colors">
            <component :is="feature.icon" class="w-6 h-6 text-primary-600 group-hover:text-white" />
          </div>
          <h3 class="text-xl font-black text-slate-900 group-hover:text-white mb-4">{{ feature.title }}</h3>
          <p class="text-slate-500 group-hover:text-slate-400 font-medium text-sm leading-relaxed">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- 6. FINAL CTA -->
    <section class="py-20 px-6">
        <div class="max-w-5xl mx-auto bg-slate-900 rounded-3xl p-12 lg:p-24 text-center space-y-10 relative overflow-hidden">
            <div class="relative z-10">
                <h2 class="text-4xl lg:text-6xl font-black text-white tracking-tight">Ready to take control?</h2>
                <p class="text-slate-400 text-lg max-w-xl mx-auto">Join 500+ organizations automating their workforce management with TrackTimi.</p>
                <div class="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                    <router-link to="/register-org" class="px-10 py-5 bg-primary-600 text-white rounded-lg font-black text-sm uppercase tracking-widest shadow-lg hover:bg-primary-700 transition-all">Start 14-Day Free Trial</router-link>
                    <router-link to="/login" class="px-10 py-5 bg-white/10 text-white rounded-lg font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all">Sign In</router-link>
                </div>
            </div>
            <!-- Glows -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 blur-[100px]"></div>
            <div class="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/10 blur-[100px]"></div>
        </div>
    </section>

    <!-- 7. FOOTER -->
    <footer class="py-12 border-t border-slate-100">
      
      <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <ZapIcon class="w-4 h-4 text-white fill-white" />
          </div>
          <span class="font-black text-xl tracking-tighter">TrackTimi.</span>
        </div>
        <div class="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" class="hover:text-primary-600">Privacy</a>
            <a href="#" class="hover:text-primary-600">Security</a>
            <a href="#" class="hover:text-primary-600">Status</a>
        </div>
        <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">© 2026 TrackTimi Systems Liberia</p>
      </div>
    </footer>
  </div>
  <Footer />
</template>

<script setup>

import Footer from '@/components/Footer.vue'
import { ref, onMounted } from 'vue'
import { 
  ZapIcon, ArrowRightIcon, MapPinIcon, CheckCircleIcon, 
  UsersIcon, BarChart3Icon, ShieldIcon, LayersIcon, LayoutIcon, GlobeIcon
} from 'lucide-vue-next'

// Simulated Real-time Data for the Pulse Feature
const pulses = [
  { name: 'Abraham Fallah Jr.', location: 'Main HQ' },
  { name: 'Sarah Konneh', location: 'Branch Office' },
  { name: 'John Massaquoi', location: 'Security Post' },
  { name: 'Musu Sirleaf', location: 'Warehouse A' },
]
const currentPulse = ref(null)

const heroStats = [
  { label: 'Minutes Tracked', value: '12M+' },
  { label: 'Daily Pulses', value: '85k' },
  { label: 'Active Tenants', value: '450+' },
  { label: 'Verification %', value: '99.9' },
]

const geoFeatures = [
  'Custom Radial Fencing',
  'Multi-site Zone Support',
  'Satellite Coordinate Locking',
  'Zero-Latency Verification'
]

const featureCards = [
  {
    icon: LayoutIcon,
    title: 'Multi-Tenant SaaS',
    description: 'Completely isolated data environments for every organization under your control.'
  },
  {
    icon: ShieldIcon,
    title: 'GPS Hard-Lock',
    description: 'Prevent off-site clock-ins with rigorous coordinate validation math.'
  },
  {
    icon: BarChart3Icon,
    title: 'Actionable Metrics',
    description: 'View health scores and attendance trends with beautiful real-time charts.'
  },
  {
    icon: UsersIcon,
    title: 'Workforce Directory',
    description: 'Manage staff, departments, and roles with a high-definition management interface.'
  },
  {
    icon: LayersIcon,
    title: 'Audit Logging',
    description: 'Every system change and attendance pulse is tracked for total compliance.'
  },
  {
    icon: GlobeIcon,
    title: 'Cloud Ready',
    description: 'Access from anywhere in the world with automatic timezone synchronization.'
  }
]

onMounted(() => {
  // Rotate simulated notifications every 4 seconds
  let i = 0
  setInterval(() => {
    currentPulse.value = null // Fade out
    setTimeout(() => {
      currentPulse.value = pulses[i]
      i = (i + 1) % pulses.length
    }, 500)
  }, 5000)
})
</script>

<style scoped>
/* Custom Shadow for Hero */
.shadow-3xl {
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3);
}

/* Notification Animation */
.notification-enter-active, .notification-leave-active {
  transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.notification-enter-from { opacity: 0; transform: translateY(20px) scale(0.9); }
.notification-leave-to { opacity: 0; transform: translateY(-20px) scale(0.9); }

/* Smooth Section Movement */
html { scroll-behavior: smooth; }

/* Pulse Animation Logic */
.list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(30px); }
</style>