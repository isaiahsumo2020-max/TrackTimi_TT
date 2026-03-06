<template>
  <div class="min-h-screen bg-white">
    <!-- Top Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Org Branding -->
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-xl font-bold text-white">{{ orgInitial }}</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-black">{{ orgName }}</h1>
              <span class="text-sm bg-black/10 text-black px-3 py-1 rounded-full font-semibold">
                {{ userRole }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <router-link
              :to="`/${orgSlug}/checkin`"
              class="btn-orange text-sm"
            >
              📍 Check In
            </router-link>
            <button
              @click="logout"
              class="btn-black text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 hidden lg:block">
        <nav class="py-8 px-6 space-y-2">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center space-x-3 px-4 py-4 rounded-xl text-sm font-semibold transition-all group border"
            :class="item.active 
              ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
              : 'text-gray-700 hover:bg-orange-50 border-gray-200 hover:border-orange-300'"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Page Content -->
      <main class="flex-1 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const orgSlug = computed(() => authStore.user?.orgSlug || route.params.orgSlug)
const orgName = computed(() => authStore.user?.orgName || 'Organization')
const orgInitial = computed(() => orgName.value.slice(0, 2).toUpperCase())
const userRole = computed(() => authStore.user?.role || 'User')

const navItems = computed(() => [
  { label: 'Dashboard', path: `/${orgSlug.value}/dashboard`, icon: '📊', active: route.path.includes('dashboard') },
  { label: 'Users', path: `/${orgSlug.value}/users`, icon: '👥', active: route.path.includes('users') },
  { label: 'Departments', path: `/${orgSlug.value}/departments`, icon: '📁', active: route.path.includes('departments') },
  { label: 'Check In', path: `/${orgSlug.value}/checkin`, icon: '📍', active: route.path.includes('checkin') }
])

const logout = () => {
  authStore.logout()
}
</script>
