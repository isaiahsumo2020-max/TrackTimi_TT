    <!-- ⭐ PERFECT MOBILE NAVBAR -->
<nav class="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-lg border-b border-gray-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo (always visible) -->
      <router-link to="/" class="text-3xl font-bold">Track<span class="text-orange-500">Timi</span>
      </router-link>
      
      <!-- Desktop Nav (hidden on mobile) -->
      <div class="hidden lg:flex items-center space-x-12">
        <router-link to="/" class="nav-link py-2">Home</router-link>
        <router-link to="/features" class="nav-link py-2">Features</router-link>
        <router-link to="/pricing" class="nav-link py-2">Pricing</router-link>
        <router-link to="/team" class="nav-link py-2">Team</router-link>
        <router-link to="/contact" class="nav-link py-2">Contact</router-link>
      </div>
      
      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center space-x-3">
        <!-- Mobile CTA buttons (compact) -->
        <router-link to="/login" class="btn-mobile px-4 py-2 text-sm font-bold hidden sm:block">
          Login
        </router-link>
        <router-link to="/register-org" class="btn-orange px-4 py-2 text-sm font-bold text-black hover:text-white hidden sm:block">
          Start Trial
        </router-link>
        
        <!-- Hamburger -->
        <button @click="mobileMenuOpen = true" class="lg:hidden p-2 rounded-xl hover:bg-orange-50">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
  
  <!-- ⭐ MOBILE MENU (DROPDOWN) -->
  <div v-if="mobileMenuOpen" class="lg:hidden bg-white border-t border-gray-100 shadow-xl">
    <div class="px-4 pt-4 pb-6 space-y-3">
      <router-link to="/" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Home</router-link>
      <router-link to="/features" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Features</router-link>
      <router-link to="/pricing" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Pricing</router-link>
      <router-link to="/team" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Team</router-link>
      <router-link to="/contact" @click="mobileMenuOpen = false" class="block py-3 px-4 rounded-xl font-semibold hover:bg-orange-50">Contact</router-link>
      <div class="pt-4 border-t border-gray-200">
        <router-link to="/login" @click="mobileMenuOpen = false" class="block w-full text-center py-3 px-4 bg-gray-900 text-white rounded-xl font-bold mb-3 hover:bg-black">
          Login
        </router-link>
        <router-link to="/register-org" @click="mobileMenuOpen = false" class="block w-full text-center py-3 px-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600">
          Start Free Trial
        </router-link>
      </div>
    </div>
  </div>
</nav>








<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <!-- NAVBAR -->
    <header class="w-full fixed top-0 left-0 z-30 bg-gradient-to-b from-black/90 to-black/40 backdrop-blur border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
            <span class="text-sm font-extrabold">TT</span>
          </div>
          <span class="font-bold tracking-tight text-sm sm:text-base">TrackTimi</span>
        </div>

        <!-- Links -->
        <nav class="hidden md:flex items-center space-x-6 text-xs sm:text-sm text-gray-300">
          <a href="#features" class="hover:text-orange-400 transition">Features</a>
          <a href="#how-it-works" class="hover:text-orange-400 transition">How it works</a>
          <a href="#pricing" class="hover:text-orange-400 transition">Pricing</a>
          <a href="#support" class="hover:text-orange-400 transition">Support</a>
        </nav>

        <!-- Auth buttons -->
        <div class="flex items-center space-x-2">
          <router-link
            to="/login"
            class="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-100 hover:text-white hover:bg-white/5 transition"
          >
            Sign in
          </router-link>
          <router-link
            to="/register-org"
            class="inline-flex px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-xs sm:text-sm font-bold shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 transition"
          >
            Start Free Trial
          </router-link>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1 mt-16">
      <!-- HERO (dark, full width) -->
      <section class="relative bg-gradient-to-b from-black via-[#140909] to-[#1a0903] text-white">
        <!-- subtle pattern -->
        <div class="pointer-events-none absolute inset-0 opacity-50">
          <div class="w-full h-full bg-[radial-gradient(circle_at_top_left,#f97316_0,transparent_55%),radial-gradient(circle_at_top_right,#7f1d1d_0,transparent_55%)]"></div>
        </div>

        <div class="relative max-w-5xl mx-auto px-4 lg:px-8 py-20 lg:py-28 text-center space-y-8">
          <p class="uppercase tracking-[0.2em] text-[10px] sm:text-xs text-orange-400 font-semibold">
            Workforce Attendance • Analytics • Automation
          </p>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
            <span class="block">Streamline Your Workforce</span>
            <span class="block">
              <span class="text-orange-400">Attendance</span> Management
            </span>
          </h1>

          <p class="max-w-2xl mx-auto text-sm sm:text-base text-gray-300">
            Track, manage, and analyze employee attendance with real‑time dashboards, geofenced check‑ins,
            and multi‑tenant controls designed for modern organizations.
          </p>

          <!-- Hero CTA -->
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
            <router-link
              to="/register-org"
              class="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-sm sm:text-base font-bold shadow-xl hover:shadow-orange-500/60 hover:-translate-y-0.5 transition"
            >
              Start Free Trial
            </router-link>
            <a
              href="#features"
              class="px-6 sm:px-8 py-3 rounded-2xl border border-white/15 bg-white/5 text-sm sm:text-base font-semibold text-gray-100 hover:bg-white/10 transition"
            >
              Learn More
            </a>
          </div>

          <!-- Hero stats -->
          <div class="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto text-[10px] sm:text-xs text-gray-300">
            <div class="flex flex-col space-y-1">
              <span class="text-sm sm:text-base font-bold text-white">5,000+</span>
              <span>Employees tracked</span>
            </div>
            <div class="flex flex-col space-y-1">
              <span class="text-sm sm:text-base font-bold text-white">99.9%</span>
              <span>Check‑in uptime</span>
            </div>
            <div class="flex flex-col space-y-1">
              <span class="text-sm sm:text-base font-bold text-white">24/7</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES STRIP (solid orange) -->
      <section id="features" class="relative bg-[#f97316] text-white py-16 sm:py-20">
        <!-- soft glow circle -->
        <div class="pointer-events-none absolute -left-32 top-10 w-64 h-64 rounded-full bg-orange-300/40 blur-3xl opacity-70"></div>
        <div class="pointer-events-none absolute -right-40 bottom-10 w-72 h-72 rounded-full bg-orange-900/40 blur-3xl opacity-60"></div>

        <div class="relative max-w-6xl mx-auto px-4 lg:px-8 text-center space-y-10">
          <div>
            <p class="uppercase tracking-[0.25em] text-[10px] sm:text-xs font-semibold text-orange-100/90 mb-2">
              FEATURES
            </p>
            <h2 class="text-xl sm:text-2xl font-extrabold mb-2">Everything you need to manage attendance</h2>
            <p class="max-w-2xl mx-auto text-xs sm:text-sm text-orange-50/90">
              Powerful tools designed for every role in your organization.
            </p>
          </div>

          <!-- Six feature cards (2 rows of 3) -->
          <div class="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div
              v-for="card in featureCards"
              :key="card.title"
              class="bg-black/85 border border-white/10 rounded-2xl p-4 sm:p-5 text-left shadow-xl hover:-translate-y-1 hover:shadow-2xl transition"
            >
              <div class="flex items-center mb-3 space-x-3">
                <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-lg">
                  <component :is="card.icon" class="w-5 h-5 text-white" />
                </div>
                <h3 class="text-sm sm:text-base font-bold">{{ card.title }}</h3>
              </div>
              <p class="text-[11px] sm:text-xs text-orange-50/90 leading-relaxed">
                {{ card.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS (white band) -->
      <section id="how-it-works" class="bg-white text-gray-900 py-16 sm:py-20">
        <div class="max-w-5xl mx-auto px-4 lg:px-8 text-center space-y-10">
          <div>
            <p class="uppercase tracking-[0.25em] text-[10px] sm:text-xs font-semibold text-orange-500 mb-2">
              HOW IT WORKS
            </p>
            <h2 class="text-xl sm:text-2xl font-extrabold mb-2">Get started in minutes</h2>
            <p class="max-w-2xl mx-auto text-xs sm:text-sm text-gray-500">
              A simple, intuitive process to set up your attendance management system.
            </p>
          </div>

          <!-- 3 steps horizontal -->
          <div class="grid gap-6 md:grid-cols-3">
            <div v-for="step in steps" :key="step.title" class="flex flex-col items-center text-center space-y-3">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shadow-lg">
                {{ step.number }}
              </div>
              <h3 class="text-sm sm:text-base font-bold">{{ step.title }}</h3>
              <p class="text-[11px] sm:text-xs text-gray-500 max-w-xs">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA ORANGE BAND -->
      <section id="pricing" class="bg-[#f97316] text-white py-16 sm:py-20">
        <div class="max-w-4xl mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold">
            Ready to transform your attendance management?
          </h2>
          <p class="text-xs sm:text-sm max-w-2xl mx-auto text-orange-50/90">
            Join organizations that trust TrackTimi to automate their workforce tracking.
            Launch your first site in under 15 minutes with no credit card required.
          </p>
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
            <router-link
              to="/register-org"
              class="px-6 sm:px-8 py-3 rounded-2xl bg-black text-sm sm:text-base font-bold shadow-xl hover:shadow-black/50 hover:-translate-y-0.5 transition border border-black/40"
            >
              Get Started Today
            </router-link>
            <a
              href="#support"
              class="px-6 sm:px-8 py-3 rounded-2xl bg-transparent border-2 border-white/70 text-sm sm:text-base font-semibold hover:bg-white/10 transition"
            >
              View Features
            </a>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER (dark, like screenshot bottom) -->
    <footer id="support" class="bg-[#05070c] text-gray-300 py-10 border-t border-white/10">
      <div class="max-w-6xl mx-auto px-4 lg:px-8">
        <div class="flex flex-col md:flex-row md:justify-between gap-8 text-[11px] sm:text-xs">
          <!-- Brand -->
          <div class="space-y-3 max-w-xs">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <span class="text-sm font-extrabold">TT</span>
              </div>
              <span class="font-bold tracking-tight">TrackTimi</span>
            </div>
            <p class="text-gray-400">
              Modern attendance management for distributed, on‑site, and hybrid teams.
            </p>
          </div>

          <!-- Columns -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div v-for="column in footerColumns" :key="column.title" class="space-y-2">
              <h4 class="font-semibold text-gray-100 mb-1 text-xs">{{ column.title }}</h4>
              <ul class="space-y-1">
                <li v-for="item in column.items" :key="item">
                  <a href="#" class="hover:text-orange-400 transition">{{ item }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500">
          <span>© {{ new Date().getFullYear() }} TrackTimi. All rights reserved.</span>
          <span class="mt-2 sm:mt-0">Made for organizations that want every second accounted for.</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { Clock, BarChart3, TrendingUp, Shield, Globe, Settings } from 'lucide-vue-next'

const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || 'Team')
const orgName = computed(() => authStore.user?.orgName || 'TrackTimi')

const today = new Date()

const formatDate = (d) =>
  d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

const featureCards = [
  {
    icon: Clock,
    title: 'Smart Check‑ins',
    description:
      'GPS‑aware, one‑tap check‑ins from any device with full audit trails for each employee and location.'
  },
  {
    icon: BarChart3,
    title: 'Role‑Based Dashboards',
    description:
      'Give managers, HR, and executives the exact insights they need without exposing sensitive data.'
  },
  {
    icon: TrendingUp,
    title: 'Powerful Analytics',
    description:
      'Spot absentee trends, overtime spikes, and late check‑ins before they become compliance issues.'
  },
  {
    icon: Shield,
    title: 'Enterprise‑grade Security',
    description:
      'Single sign‑on ready with device‑level security, encrypted tokens, and fine‑grained access control.'
  },
  {
    icon: Globe,
    title: 'Flexible Multi‑Tenant',
    description:
      'Separate data per organization with centralized control for partners, franchises, or campuses.'
  },
  {
    icon: Settings,
    title: 'Automation‑Ready',
    description:
      'Connect attendance data to payroll, HRIS, and alerts with webhooks and API integration.'
  }
]

const steps = [
  {
    number: 1,
    title: 'Register Your Organization',
    description:
      'Create your TrackTimi org in a few clicks, configure locations, and define your attendance rules.'
  },
  {
    number: 2,
    title: 'Add Your Team',
    description:
      'Invite employees by email or bulk import, assign departments, and set roles in minutes.'
  },
  {
    number: 3,
    title: 'Track Attendance',
    description:
      'Go live with real‑time dashboards, automated reports, and accurate check‑ins from day one.'
  }
]

const footerColumns = [
  {
    title: 'Product',
    items: ['Overview', 'Attendance', 'Analytics', 'Mobile App']
  },
  {
    title: 'Solutions',
    items: ['SMEs', 'Schools', 'Field Teams', 'Multi‑site Orgs']
  },
  {
    title: 'Company',
    items: ['About', 'Blog', 'Careers', 'Contact']
  },
  {
    title: 'Legal',
    items: ['Privacy Policy', 'Terms', 'Security', 'Status']
  }
]

const quickCheckIn = () => {
  // you can route to check-in page later
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const addUser = () => {
  // you can push to /:orgSlug/users if needed
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

</script>

<style scoped>
/* optional: smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}
</style>
