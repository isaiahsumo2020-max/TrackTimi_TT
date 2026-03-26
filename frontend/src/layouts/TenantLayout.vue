<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Top Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 px-4 lg:px-6 py-4 lg:py-6 lg:ml-64">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <!-- Left: Brand + Hamburger -->
        <div class="flex items-center space-x-4">
          <!-- Mobile Hamburger -->
          <button
            @click="toggleSidebar"
            class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <span class="text-2xl">☰</span>
          </button>
          
          <!-- Org Logo -->
          <div class="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-xl font-bold text-white">{{ orgInitial }}</span>
          </div>
          
          <!-- Org Info (Hidden on mobile) -->
          <div class="hidden lg:block">
            <h1 class="text-2xl font-bold text-black truncate">{{ orgName }}</h1>
            <span class="text-sm bg-black/10 text-black px-3 py-1 rounded-full font-semibold">
              {{ userRole }}
            </span>
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center space-x-3">
          <router-link
            :to="`/${orgSlug}/checkin`"
            class="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            📍 Check In
          </router-link>
          <button
            @click="logout"
            class="px-6 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Mobile Sidebar Overlay -->
      <div
        v-if="sidebarOpen"
        @click="toggleSidebar"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        aria-hidden="true"
      ></div>

      <!-- Sidebar -->
      <aside
        :class="[
          'bg-gray-700 text-slate-00 border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out z-50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed inset-y-0 left-0 w-64 lg:translate-x-0'
        ]"
      >
        <div class="h-full flex flex-col">
          <!-- Brand Header -->
          <div class="p-5 border-b border-gray-200">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div class="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white font-black">
                  <span>{{ orgInitial }}</span>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wider font-bold text-gray-100">Business Admin</div>
                  <div class="text-xl font-black text-orange-500">Track<Span class="text-white">Timi</Span></div>
                </div>
              </div>
              <button
                @click="toggleSidebar"
                class="lg:hidden p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
            <div class="text-xs text-gray-500">{{ userRole }}</div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-auto py-4 px-2 space-y-5">
            <div>
              <h3 class="px-4 text-xs font-semibold uppercase tracking-wider text-gray-100">Overview</h3>
              <div class="mt-2 space-y-1">
                <router-link
                  :to="`/${orgSlug}/dashboard`"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  :class="route.path.includes('dashboard') ? 'bg-orange-500 text-white shadow-md border-l-4 border-orange-600' : 'text-gray-100 hover:bg-orange-50 hover:text-orange-600'"
                  @click="sidebarOpen = false"
                >
                  <span class="text-lg">📊</span>
                  <span>Dashboard</span>
                </router-link>
              </div>
            </div>

            <div>
              <h3 class="px-4 text-xs font-semibold uppercase tracking-wider text-gray-100">Workforce</h3>
              <div class="mt-2 space-y-1">
                <router-link
                  :to="`/${orgSlug}/users`"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  :class="route.path.includes('users') ? 'bg-orange-500 text-white shadow-md border-l-4 border-orange-600' : 'text-gray-100 hover:bg-orange-50 hover:text-orange-600'"
                  @click="sidebarOpen = false"
                >
                  <span class="text-lg">👥</span>
                  <span>Users</span>
                </router-link>

                <router-link
                  :to="`/${orgSlug}/departments`"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  :class="route.path.includes('departments') ? 'bg-orange-500 text-white shadow-md border-l-4 border-orange-600' : 'text-gray-100 hover:bg-orange-50 hover:text-orange-600'"
                  @click="sidebarOpen = false"
                >
                  <span class="text-lg">📁</span>
                  <span>Departments</span>
                </router-link>

                <router-link
                  :to="`/${orgSlug}/checkin`"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  :class="route.path.includes('checkin') ? 'bg-orange-500 text-white shadow-md border-l-4 border-orange-600' : 'text-gray-100 hover:bg-orange-50 hover:text-orange-600'"
                  @click="sidebarOpen = false"
                >
                  <span class="text-lg">📍</span>
                  <span>Check In</span>
                </router-link>
              </div>
            </div>

            <div>
              <h3 class="px-4 text-xs font-semibold uppercase tracking-wider text-gray-100">Settings</h3>
              <div class="mt-2 space-y-1">
                <router-link
                  :to="`/${orgSlug}/settings`"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                  :class="route.path.includes('settings') ? 'bg-orange-500 text-white shadow-md border-l-4 border-orange-600' : 'text-gray-100 hover:bg-orange-50 hover:text-orange-600'"
                  @click="sidebarOpen = false"
                >
                  <span class="text-lg">⚙️</span>
                  <span>Settings</span>
                </router-link>
              </div>
            </div>
          </nav>

          <!-- Fixed Bottom: Logout -->
          <div class="border-t border-gray-200 p-4">
            <button
              @click="logout"
              class="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition"
            >
              ⏏ Logout
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-64 p-6 lg:p-8 overflow-y-auto">
        <router-view />
      </main>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Sidebar state (desktop visible by default, mobile can toggle)
const sidebarOpen = ref(true)

// Toggle sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  if (sidebarOpen.value) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
}

// Organization data
const orgSlug = computed(() => route.params.orgSlug || authStore.user?.orgSlug || 'acmecorp')
const orgName = computed(() => authStore.user?.orgName || `${orgSlug.value.charAt(0).toUpperCase() + orgSlug.value.slice(1)} Corp`)
const orgInitial = computed(() => orgName.value.slice(0, 2).toUpperCase())
const userRole = computed(() => authStore.user?.role || 'Admin')
const userShortName = computed(() => {
  const name = (authStore.user?.name || authStore.user?.firstName || authStore.user?.email || 'Admin').trim()
  if (!name) return 'Admin'
  const parts = name.split(' ').filter(Boolean)
  const trimmed = parts[0] || name
  return trimmed.length > 10 ? `${trimmed.slice(0, 10)}...` : trimmed
})

// ✅ FIXED: Single role-based navItems computed
const navItems = computed(() => {
  const role = authStore.user?.role?.toLowerCase() || ''
  const basePath = `/${orgSlug.value}`
  
  // Admin/Manager → Full nav (handles 'orgadmin', 'admin', 'manager')
  if (role === 'orgadmin' || role === 'admin' || role === 'manager') {
    return [
      { name: 'dashboard', label: 'Dashboard', path: `${basePath}/dashboard`, icon: '📊', active: route.path.includes('dashboard') },
      { name: 'users', label: 'Users', path: `${basePath}/users`, icon: '👥', active: route.path.includes('users') },
      { name: 'departments', label: 'Departments', path: `${basePath}/departments`, icon: '📁', active: route.path.includes('departments') },
      { name: 'checkin', label: 'Check In', path: `${basePath}/checkin`, icon: '📍', active: route.path.includes('checkin') },
      { name: 'settings', label: 'Settings', path: `${basePath}/settings`, icon: '⚙️', active: route.path.includes('settings') }
    ]
  }
  
  // ✅ EMPLOYEE/USER (Staff) → Personal dashboard + schedule/checkins
  return [
    { name: 'user-dashboard', label: 'My Dashboard', path: `${basePath}/user-dashboard`, icon: '📊', active: route.path.includes('user-dashboard') },
    { name: 'schedule', label: 'My Schedule', path: `${basePath}/schedule`, icon: '📅', active: route.path.includes('schedule') },
    { name: 'checkins', label: 'My Check-ins', path: `${basePath}/checkins`, icon: '📍', active: route.path.includes('checkins') }
  ]
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Close sidebar on route change
watch(() => route.path, () => {
  sidebarOpen.value = false
  document.body.classList.remove('overflow-hidden')
})

// Close sidebar on escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && sidebarOpen.value) {
      toggleSidebar()
    }
  }
  window.addEventListener('keydown', handleEscape)
  return () => window.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
/* Smooth transitions */
aside {
  will-change: transform;
}

/* Prevent body scroll when sidebar open */
body.overflow-hidden {
  overflow: hidden;
}
</style>
