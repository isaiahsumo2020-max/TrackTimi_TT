<template>
  
  <!-- ADD to top of dashboard -->
<div v-if="subscriptionStatus.needsPayment" class="bg-red-50 border-2 border-red-300 rounded-3xl p-8 mb-8">
  <div class="flex items-center space-x-4">
    <span class="text-3xl">⚠️</span>
    <div>
      <h3 class="text-2xl font-bold text-red-800 mb-2">{{ subscriptionStatus.message }}</h3>
      <p class="text-lg text-red-700">Upgrade to continue adding users.</p>
      <router-link :to="`/${$route.params.orgSlug}/settings`" 
        class="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold">
        Upgrade Plan
      </router-link>
    </div>
  </div>
</div>

  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Total Users</div>
          <div class="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-lg">👥</span>
          </div>
        </div>
        <div class="text-4xl font-bold text-black mb-2">24</div>
        <div class="text-sm text-orange-600 font-semibold">+2 this week</div>
      </div>
<!-- In your dashboard sidebar -->
<router-link to="/:orgSlug/settings" class="sidebar-item">
  ⚙️ Settings
</router-link>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Departments</div>
          <div class="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-lg">📁</span>
          </div>
        </div>
        <div class="text-4xl font-bold text-black mb-2">3</div>
        <div class="text-sm text-gray-700 font-semibold">+1 this week</div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Today's Check-ins</div>
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center border-2 border-orange-200">
            <span class="text-orange-600 font-bold text-lg">📍</span>
          </div>
        </div>
        <div class="text-4xl font-bold text-black mb-2">18</div>
        <div class="text-sm text-gray-700 font-semibold">12 active</div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <div class="text-sm font-bold text-gray-600 uppercase tracking-wide">Avg Hours</div>
          <div class="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center border border-black/20">
            <span class="text-black font-bold text-lg">⏱️</span>
          </div>
        </div>
        <div class="text-4xl font-bold text-black mb-2">7.2h</div>
        <div class="text-sm text-gray-700 font-semibold">Target: 8h</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="card">
      <h2 class="text-2xl font-bold text-black mb-8">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <router-link :to="`/${orgSlug}/users`" class="group p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all block text-center">
          <div class="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 border-2 border-orange-200 group-hover:border-orange-300">
            <span class="text-2xl">👥</span>
          </div>
          <h3 class="text-xl font-bold text-black mb-3">Manage Users</h3>
          <p class="text-gray-600 mb-4">Add, edit, or deactivate employees</p>
          <span class="btn-orange-light text-sm">Manage →</span>
        </router-link>

        <router-link :to="`/${orgSlug}/departments`" class="group p-8 rounded-2xl border-2 border-gray-200 hover:border-black hover:shadow-xl transition-all block text-center">
          <div class="w-20 h-20 bg-black/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-black/10 border-2 border-black/20">
            <span class="text-2xl">📁</span>
          </div>
          <h3 class="text-xl font-bold text-black mb-3">Departments</h3>
          <p class="text-gray-600 mb-4">Organize teams and assign roles</p>
          <span class="btn-black-light text-sm">Manage →</span>
        </router-link>

        <router-link :to="`/${orgSlug}/checkin`" class="group p-8 rounded-2xl border-2 border-orange-200 bg-orange-50 hover:border-orange-400 hover:shadow-xl transition-all block text-center">
          <div class="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span class="text-2xl text-white">📍</span>
          </div>
          <h3 class="text-xl font-bold text-black mb-3">Check In Now</h3>
          <p class="text-gray-600 mb-4">Record attendance with GPS</p>
          <span class="btn-orange text-sm">Check In →</span>
        </router-link>
      </div>
    </div>

    <!-- Recent Activity (SIMPLIFIED) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card">
        <h2 class="text-2xl font-bold text-black mb-6">Recent Check-ins</h2>
        <div class="space-y-4">
          <div v-for="checkin in recentCheckins" :key="checkin.id" class="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {{ checkin.initials }}
              </div>
              <div>
                <div class="font-bold text-black">{{ checkin.name }}</div>
                <div class="text-sm text-gray-600">{{ checkin.department }}</div>
              </div>
            </div>
            <div class="text-sm font-semibold text-black text-right">
              {{ checkin.time }}
              <div class="badge-present mt-1 inline-block">{{ checkin.status }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="text-2xl font-bold text-black mb-6">Today's Summary</h2>
        <div class="space-y-4 text-center">
          <div class="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
            <div class="text-3xl font-bold text-orange-600">94%</div>
            <div class="text-sm text-gray-600 uppercase tracking-wide font-bold">Attendance Rate</div>
          </div>
          <div class="grid grid-cols-2 gap-4 pt-4">
            <div>
              <div class="text-lg font-bold text-black">18/20</div>
              <div class="text-sm text-gray-600">Present</div>
            </div>
            <div>
              <div class="text-lg font-bold text-black">2</div>
              <div class="text-sm text-gray-600">Absent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const authStore = useAuthStore()

const orgSlug = computed(() => authStore.user?.orgSlug || route.params.orgSlug)

const recentCheckins = [
  { id: 1, initials: 'JD', name: 'John Doe', department: 'Engineering', time: '10:32 AM', status: 'Present' },
  { id: 2, initials: 'JS', name: 'Jane Smith', department: 'HR', time: '9:15 AM', status: 'Present' },
  { id: 3, initials: 'MJ', name: 'Mike Johnson', department: 'Engineering', time: '8:45 AM', status: 'Late' }
]
</script>
