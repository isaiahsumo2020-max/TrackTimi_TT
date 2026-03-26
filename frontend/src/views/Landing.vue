<template>
  <div class="min-h-screen bg-white text-gray-900 flex flex-col">
    <!-- NAVBAR -->
    <header class="w-full fixed top-0 left-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
            <span class="text-sm font-extrabold">TT</span>
          </div>
          <span class="font-bold tracking-tight text-sm sm:text-base">TrackTimi</span>
        </div>

        <!-- Links -->
        <nav class="hidden md:flex items-center space-x-6 text-sm sm:text-base text-gray-700">
          <a href="#features" class="hover:text-orange-400 transition">Features</a>
          <a href="#how-it-works" class="hover:text-orange-400 transition">How it works</a>
          <a href="#pricing" class="hover:text-orange-400 transition">Pricing</a>
          <a href="#support" class="hover:text-orange-400 transition">Support</a>
        </nav>

        <!-- Auth buttons -->
        <div class="flex items-center space-x-2">
          <router-link
            to="/login"
            class="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm sm:text-base font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            Sign in
          </router-link>
          <router-link
            to="/register-org"
            class="inline-flex px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-sm sm:text-base font-bold shadow-lg hover:shadow-orange-500/40 hover:-translate-y-0.5 transition"
          >
            Start Free Trial
          </router-link>
        </div>
      </div>
    </header>
    <!-- MAIN -->
    <main class="flex-1 mt-1">
      <!-- HERO (white, full width) -->
      <section class="relative bg-white text-gray-900">
        <div class="relative max-w-5xl mx-auto px-4 lg:px-8 py-20 lg:py-28 text-center space-y-8">
          <p class="uppercase tracking-[0.2em] text-sm sm:text-base text-orange-400 font-semibold">
            Workforce Attendance • Analytics • Automation
          </p>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-gray-900">
            <span class="block">Streamline Your Workforce</span>
            <span class="block">
              <span class="text-orange-400">Attendance</span> Management
            </span>
          </h1>

          <p class="max-w-2xl mx-auto text-base sm:text-lg text-gray-600">
            Track, manage, and analyze employee attendance with real‑time dashboards, geofenced check‑ins,
            and multi‑tenant controls designed for modern organizations.
          </p>

          <!-- Hero CTA -->
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
            <router-link to="/register-org"
              class="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-sm sm:text-base font-bold shadow-xl hover:shadow-orange-500/60 hover:-translate-y-0.5 transition">
              Start Free Trial
            </router-link>
            <a href="#features"
              class="px-6 sm:px-8 py-3 rounded-2xl border border-gray-300 bg-gray-100 text-sm sm:text-base font-semibold text-gray-900 hover:bg-gray-200 transition">
              Learn More
            </a>
          </div>

          <!-- Hero stats -->
          <div class="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto text-sm sm:text-base text-gray-600">
            <div class="flex flex-col space-y-1">
              <span class="text-base sm:text-lg font-bold text-gray-900">5,000+</span>
              <span>Employees tracked</span>
            </div>
            <div class="flex flex-col space-y-1">
              <span class="text-base sm:text-lg font-bold text-gray-900">99.9%</span>
              <span>Check‑in uptime</span>
            </div>
            <div class="flex flex-col space-y-1">
              <span class="text-base sm:text-lg font-bold text-gray-900">24/7</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </section>

      <!-- FEATURES STRIP (white) -->
      <section id="features" class="relative bg-white text-gray-900 py-16 sm:py-20">
        <div class="relative max-w-6xl mx-auto px-4 lg:px-8 text-center space-y-10">
          <div>
            <p class="uppercase tracking-[0.25em] text-sm sm:text-base font-semibold text-orange-500 mb-2">
              FEATURES
            </p>
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Everything you need to manage attendance</h2>
            <p class="max-w-2xl mx-auto text-sm sm:text-base text-gray-600">
              Powerful tools designed for every role in your organization.
            </p>
          </div>

          <!-- Six feature cards (2 rows of 3) -->
          <div class="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div v-for="card in featureCards" :key="card.title"
              class="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 text-left shadow-xl hover:-translate-y-1 hover:shadow-2xl transition">
              <div class="flex items-center mb-3 space-x-3">
                <div class="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-lg text-orange-600">
                  {{ card.icon }}
                </div>
                <h3 class="text-base sm:text-lg font-bold">{{ card.title }}</h3>
              </div>
              <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
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
            <p class="uppercase tracking-[0.25em] text-sm sm:text-base font-semibold text-orange-500 mb-2">
              HOW IT WORKS
            </p>
            <h2 class="text-2xl sm:text-3xl font-extrabold mb-2">Get started in minutes</h2>
            <p class="max-w-2xl mx-auto text-sm sm:text-base text-gray-500">
              A simple, intuitive process to set up your attendance management system.
            </p>
          </div>

          <!-- 3 steps horizontal -->
          <div class="grid gap-6 md:grid-cols-3">
            <div v-for="step in steps" :key="step.title" class="flex flex-col items-center text-center space-y-3">
              <div
                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold shadow-lg">
                {{ step.number }}
              </div>
              <h3 class="text-base sm:text-lg font-bold">{{ step.title }}</h3>
              <p class="text-sm sm:text-base text-gray-500 max-w-xs">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA WHITE BAND -->
      <section id="pricing" class="bg-white text-gray-900 py-16 sm:py-20">
        <div class="max-w-4xl mx-auto px-4 lg:px-8 text-center space-y-6">
          <h2 class="text-2xl sm:text-3xl font-extrabold">
            Ready to transform your attendance management?
          </h2>
          <p class="text-sm sm:text-base max-w-2xl mx-auto text-gray-600">
            Join organizations that trust TrackTimi to automate their workforce tracking.
            Launch your first site in under 15 minutes with no credit card required.
          </p>
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
            <router-link to="/register-org"
              class="px-6 sm:px-8 py-3 rounded-2xl bg-orange-500 text-sm sm:text-base font-bold shadow-xl hover:shadow-orange-500/50 hover:-translate-y-0.5 transition border border-orange-600 text-white">
              Get Started Today
            </router-link>
            <a href="#support"
              class="px-6 sm:px-8 py-3 rounded-2xl bg-transparent border-2 border-gray-300 text-sm sm:text-base font-semibold text-gray-900 hover:bg-gray-100 transition">
              View Features
            </a>
          </div>
        </div>
      </section>
    </main>

    <!-- FOOTER (gray) -->
    <footer id="support" class="bg-gray-700 text-orange-500 py-10 border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-4 lg:px-8">
        <div class="flex flex-col md:flex-row md:justify-between gap-8 text-sm sm:text-base">
          <!-- Brand -->
          <div class="space-y-3 max-w-xs">
            <div class="flex items-center space-x-2">
              <div
                class="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                <span class="text-sm font-extrabold">TT</span>
              </div>
              <span class="font-bold tracking-tight">TrackTimi</span>
            </div>
            <p class="text-gray-600">
              Modern attendance management for distributed, on‑site, and hybrid teams.
            </p>
          </div>

          <!-- Columns -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div v-for="column in footerColumns" :key="column.title" class="space-y-2">
              <h4 class="font-semibold text-gray-900 mb-1 text-sm">{{ column.title }}</h4>
              <ul class="space-y-1">
                <li v-for="item in column.items" :key="item">
                  <a href="#" class="hover:text-orange-400 transition">{{ item }}</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          class="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
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
    icon: '⏱',
    title: 'Smart Check‑ins',
    description:
      'GPS‑aware, one‑tap check‑ins from any device with full audit trails for each employee and location.'
  },
  {
    icon: '📊',
    title: 'Role‑Based Dashboards',
    description:
      'Give managers, HR, and executives the exact insights they need without exposing sensitive data.'
  },
  {
    icon: '📈',
    title: 'Powerful Analytics',
    description:
      'Spot absentee trends, overtime spikes, and late check‑ins before they become compliance issues.'
  },
  {
    icon: '🛡',
    title: 'Enterprise‑grade Security',
    description:
      'Single sign‑on ready with device‑level security, encrypted tokens, and fine‑grained access control.'
  },
  {
    icon: '🌐',
    title: 'Flexible Multi‑Tenant',
    description:
      'Separate data per organization with centralized control for partners, franchises, or campuses.'
  },
  {
    icon: '⚙️',
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
